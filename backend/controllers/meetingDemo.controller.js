const AdvocateTimeSlotModel = require("../models/AdvocateTimeSlot.model");
const MeetingDemo = require("../models/meetingDemo.model");
const User = require("../models/user.model");
const createGoogleMeet = require("../utils/googleMeet");
const sendEmail = require("../utils/SendEmail");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const formatDate = (date) =>
    dayjs(date).tz("Asia/Kolkata").format("dddd, DD MMMM YYYY");

const formatTime = (time) =>
    dayjs(`1970-01-01 ${time}`).format("hh:mm A");


function buildDateObject(date, time) {
    const datePart = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
    return new Date(`${datePart}T${time}:00+05:30`);
}

async function createMeetingDemo(req, res) {
    try {
        const { meetingTitle, userName, userLast, userEmail, userNumber, timeSlotId } = req.body;

        // Basic validation
        if (!meetingTitle || !userName || !userEmail || !userNumber || !timeSlotId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const timeSlot = await AdvocateTimeSlotModel.findById(timeSlotId);
        if (!timeSlot) {
            return res.status(404).json({ success: false, message: "Time slot not found" });
        }

        if (new Date(timeSlot.startTime) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Start time must be in the future",
            });
        }

        const meetLink = await createGoogleMeet({
            title: meetingTitle,
            date: timeSlot.date,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
        });

        const startDateTime = buildDateObject(timeSlot.date, timeSlot.startTime);
        const endDateTime = buildDateObject(timeSlot.date, timeSlot.endTime);

        if (endDateTime <= startDateTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time",
            });
        }

        const adminDetail = await User.findOne({ role: "admin" });
        if (!adminDetail) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const adminEmail = adminDetail.email;

        const newMeetingDemo = new MeetingDemo({
            meetingTitle,
            userName,
            userLast,
            userEmail,
            userNumber,
            meetLink,
            timeSlotId,
            startTime: startDateTime,
            endTime: endDateTime,
            status: "pending"
        });

        await newMeetingDemo.save();

        if (adminEmail) {
            await sendEmail({
                email: adminEmail,
                subject: "Demo Meeting Scheduled",
                message: `
      <p>A new demo meeting has been scheduled.</p>

      <p><strong>Title:</strong> ${meetingTitle}</p>
      <p><strong>User:</strong> ${userName} ${userLast} (${userEmail})(${userNumber})</p>

      <p>
        <strong>Date:</strong> ${formatDate(timeSlot.date)}<br/>
        <strong>Time:</strong> ${formatTime(timeSlot.startTime)} – ${formatTime(timeSlot.endTime)} (IST)
      </p>

      <p>
        <strong>Google Meet Link:</strong><br/>
        <a href="${meetLink}" target="_blank">${meetLink}</a>
      </p>
    `,
            });
        }


        if (userEmail) {
            await sendEmail({
                email: userEmail,
                subject: "Your Demo Meeting is Confirmed",
                message: `
      <p>Hello ${userName},</p>

      <p>Your demo meeting has been successfully scheduled.</p>

      <p>
        <strong>Date:</strong> ${formatDate(timeSlot.date)}<br/>
        <strong>Time:</strong> ${formatTime(timeSlot.startTime)} – ${formatTime(timeSlot.endTime)} (IST)
      </p>

      <p>
        <strong>Google Meet Link:</strong><br/>
        <a href="${meetLink}" target="_blank">${meetLink}</a>
      </p>

      <p>
        Our <strong>Omm Documentation</strong> experts will join you on Google Meet
        and guide you step-by-step throughout the demo session.
      </p>

      <p>Regards,<br/>Omm Documentation Team</p>
    `,
            });
        }


        return res.status(201).json({
            success: true,
            message: "Meeting demo created successfully",
            data: newMeetingDemo
        });

    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
};

async function getAllMeetingDemos(req, res) {
    try {
        const meetings = await MeetingDemo.find().populate('advocateId', 'name email').populate('timeSlotId');
        if (!meetings || meetings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No meeting demos found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Meeting demos fetched successfully",
            data: meetings
        });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function deleteDemoMeeting(req, res) {
    try {
        const { id } = req.params;
        const deletedMeeting = await MeetingDemo.findByIdAndDelete(id);
        if (!deletedMeeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting demo not founded"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Meeting demo deleted successfully"
        })
    } catch (error) {
        console.log("Internal sercer error", error)
        return res.status(500).json({
            success: false,
            message: "Internal servere error",
            error: error.message
        })
    }
}

module.exports = {
    createMeetingDemo,
    getAllMeetingDemos,
    deleteDemoMeeting
};
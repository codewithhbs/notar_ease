const mongoose = require("mongoose");

const meetingDemoSchema = new mongoose.Schema({
    meetingTitle: {
        type: String
    },
    userName: {
        type: String
    },
    userLast: {
        type: String
    },
    userEmail: {
        type: String
    },
    userNumber: {
        type: Number
    },
    meetLink: {
        type: String
    },
    timeSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdvocateTimeSlot",
    },
    advocateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ["pending", "scheduled", "live", "ended"],
        default: "scheduled",
    },
});

const MeetingDemo = mongoose.model("MeetingDemo", meetingDemoSchema);

module.exports = MeetingDemo;
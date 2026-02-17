const User = require("../models/user.model");
const { uploadPDF, deletePdfFromCloudinary } = require("../utils/Cloudnary");
const {
    signAccessToken,
    signRefreshToken,
    invalidateRefreshToken,
    isRefreshTokenValid,
} = require("../utils/jwtUtil");
const jwt = require("jsonwebtoken");

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const AdvocateTimeSlot = require("../models/AdvocateTimeSlot.model");

async function register(req, res) {
    try {
        const { name, familyName, email, password, phone, userName, address, country, advocateRegistrationNo, advocateJurisdiction, advocateExpireDate } = req.body;
        const emptyField = [];
        if (!name) emptyField.push("name");
        if (!familyName) emptyField.push("familyName");
        if (!email) emptyField.push("email");
        if (!password) emptyField.push("password");
        if (!phone) emptyField.push("phone");
        if (!userName) emptyField.push("userName");
        if (!address) emptyField.push("address");
        if (!country) emptyField.push("country");
        if (!advocateRegistrationNo) emptyField.push("advocateRegistrationNo");
        if (!advocateJurisdiction) emptyField.push("advocateJurisdiction");
        if (!advocateExpireDate) emptyField.push("advocateExpireDate");
        if (emptyField.length > 0) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                emptyField
            });
        }
        const existing = await User.findOne({
            $or: [
                { email: email },
                { userName: userName }
            ]
        })

        if (existing) {
            if (existing.role === "notary") {
                if (existing.email === email) {
                    return res.status(409).json({
                        success: false,
                        message: "Email already exists as a notary",
                    })
                } else if (existing.userName === userName) {
                    return res.status(409).json({
                        success: false,
                        message: "User name already exists as a notary",
                    })
                }
            } else {
                if (existing.email === email) {
                    return res.status(409).json({
                        success: false,
                        message: "Email already exists as a user",
                    })
                } else if (existing.userName === userName) {
                    return res.status(409).json({
                        success: false,
                        message: "User name already exists as a user",
                    })
                }
            }
        }

        const user = new User({
            name,
            familyName,
            email,
            password,
            phone,
            userName,
            address,
            country,
            advocateRegistrationNo,
            advocateJurisdiction,
            advocateExpireDate,
            role: "notary"
        });

        if (req.file) {
            const imageUrl = await uploadPDF(req.file.buffer);
            const { pdf, public_id } = imageUrl;
            user.userIdImage = {
                pdf,
                public_id
            }
        }

        await user.save();

        // const accessToken = signAccessToken(safeUser);
        // const { token: refreshToken, jti } = await signRefreshToken(user._id);
        res.status(201).json({
            success: true,
            user,
            message: "User created successfully",
            // accessToken,
            // refreshToken
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function addTimeSlot(req, res) {
    try {
        const advocateId = req.user?.sub;
        const { date, startTime, endTime } = req.body;

        const exists = await AdvocateTimeSlot.findOne({
            advocateId,
            date,
            startTime,
            endTime,
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "This time slot already exists",
            });
        }


        const user = await User.findById(advocateId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role !== "notary" && user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. You do not have permission." });
        }

        const timeSlot = await AdvocateTimeSlot.create({ date, startTime, endTime, advocateId: advocateId });
        res.status(201).json({
            success: true,
            message: "Time slot created successfully",
            timeSlot
        })


    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getAdvocateTimeSlot(req, res) {
    try {
        const advocateId = req.user?.sub;
        const timeSlot = await AdvocateTimeSlot.find({ advocateId: advocateId });
        // console.log("advocateId", advocateId, timeSlot)
        if (!timeSlot) {
            return res.status(200).json({ success: true, message: "Time slot not found" });
        }
        res.status(201).json({
            success: true,
            message: "Time slot created successfully",
            timeSlot
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getAdminTimeSlot(req, res) {
    try {
        const timeSlot = await AdvocateTimeSlot.find().populate("advocateId", "name familyName email role");
        if (!timeSlot) {
            return res.status(200).json({ success: true, message: "Time slot not found" });
        }

        const filterAdminSlots = timeSlot.filter(slot => slot.advocateId && slot.advocateId.role === "admin");
        res.status(200).json({
            success: true,
            timeSlots: filterAdminSlots
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

async function deleteAdvocateTimeSlot(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.sub;
        const role = req.user.role;

        const slot = await AdvocateTimeSlot.findById(id);
        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Time slot not found",
            });
        }

        // 🔒 Notary sirf apna slot delete kare
        if (role === "notary" && slot.advocateId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can delete only your own time slots",
            });
        }

        await AdvocateTimeSlot.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Time slot deleted successfully",
        });
    } catch (error) {
        console.log("Delete slot error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

async function getAdvocateDetails(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user || user.role !== "notary") {
            return res.status(404).json({ success: false, message: "Advocate not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getAllTimeSlots(req, res) {
    try {
        // ✅ Today's date at start of day (00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ✅ Current date & time
        const now = new Date();

        // ✅ Step 1: Find all admin advocates
        const adminAdvocates = await User.find(
            { role: "admin" },
            { _id: 1 }
        );

        const adminIds = adminAdvocates.map(a => a._id);

        // ✅ Step 2: Fetch time slots EXCLUDING admin advocates
        const timeSlotsRaw = await AdvocateTimeSlot.find({
            date: { $gte: today },
            advocateId: { $nin: adminIds },
           isBooked: false, // 🔥 condition 1 (false wale remove)
        })
            .populate("advocateId", "name familyName email role")
            .sort({ date: 1, startTime: 1 });

        // ✅ Filter today's past time slots
        const filteredByTime = timeSlotsRaw.filter(slot => {
            const slotDate = new Date(slot.date);

            // 👉 If slot is today → check time
            if (slotDate.toDateString() === now.toDateString()) {
                const [hours, minutes] = slot.startTime.split(":");

                const slotDateTime = new Date(slotDate);
                slotDateTime.setHours(hours, minutes, 0, 0);

                if (now >= slotDateTime) {
                    return false;
                }
            }

            return true;
        });

        // ✅ Remove duplicate slots
        const seen = new Set();
        const timeSlots = filteredByTime.filter(slot => {
            const key = `${slot.date.toISOString().split("T")[0]}-${slot.startTime}-${slot.endTime}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        if (timeSlots.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No upcoming time slots found",
            });
        }

        return res.status(200).json({
            success: true,
            timeSlots,
        });

    } catch (error) {
        console.error("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function checkTimeSlotAvailability(req, res) {
    try {
        const { date, startTime, endTime } = req.body;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Date, startTime aur endTime sab required hain",
            });
        }

        const inputDate = new Date(date);
        if (isNaN(inputDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format",
            });
        }

        // ✅ DAY RANGE FIX
        const startOfDay = new Date(inputDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(inputDate);
        endOfDay.setHours(23, 59, 59, 999);

        const matchingSlots = await AdvocateTimeSlot.find({
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            startTime,
            endTime,
        })
            .populate("advocateId", "name familyName email")
            .sort({ createdAt: -1 });

        if (matchingSlots.length > 0) {
            return res.status(200).json({
                success: true,
                available: false,
                count: matchingSlots.length,
                timeSlots: matchingSlots,
            });
        }

        return res.status(200).json({
            success: true,
            available: true,
            count: 0,
            timeSlots: [],
        });

    } catch (error) {
        console.error("Error checking time slot:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = {
    register,
    addTimeSlot,
    getAdvocateTimeSlot,
    deleteAdvocateTimeSlot,
    getAdvocateDetails,
    getAllTimeSlots,
    checkTimeSlotAvailability,
    getAdminTimeSlot
};
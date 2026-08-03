const User = require("../models/user.model");
const Meeting = require("../models/meeting.model")
const SignedDocument = require("../models/signedDocument.model")
const { signAccessToken, signRefreshToken } = require("../utils/jwtUtil");
const { downloadSignedDocument } = require("../utils/DocumentSigner");

async function adminLogin(req, res) {
    try {
        const { email, password } = req.body;
        console.log("body", email)

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email and password are required",
            });
        }
        console.log(
            "i am befor check"
        )

        // password field by default select: false hai, isliye +password
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        console.log(
            "i am after check"
        )

        if (user.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        console.log(
            "i am befor password"
        )

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Wrong password",
            });
        }

        console.log(
            "i am after password"
        )

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userName: user.userName,
        };

        const accessToken = signAccessToken(safeUser);
        const { token: refreshToken, jti } = await signRefreshToken(user._id);

        // res.cookie("accessToken", accessToken, {
        //     httpOnly: true,
        //     secure: true,          // 🔥 REQUIRED for HTTPS
        //     sameSite: "none",      // 🔥 REQUIRED for cross-domain
        //     maxAge: 15 * 60 * 1000, // 15 minutes
        // });

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     secure: true,          // 🔥 REQUIRED
        //     sameSite: "none",      // 🔥 REQUIRED
        //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        // });

        res.status(201).json({
            success: true,
            user: safeUser,
            accessToken,
            refreshToken,
            sessionId: jti,
        })
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
}

async function getUsers(req, res) {
    try {
        const users = await User.find().select("-password");
        if (!users) {
            return res.status(404).json({ success: false, message: "Users not found" });
        }
        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (err) {
        console.log("Admin /users error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function verifyUserId(req, res) {
    try {
        const { id } = req.params;
        const { userIdImageVerify } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.userIdImageVerify = userIdImageVerify;
        await user.save();

        res.status(200).json({ success: true, message: "User verification updated successfully" });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function blockId(req, res) {
    try {
        const { id } = req.params;
        const { block } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.block = block;
        await user.save();

        res.status(200).json({ success: true, message: "User blocked successfully" });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getAllMeetings(req, res) {
    try {
        const { status, isPaid } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (isPaid !== undefined) filter.isPaid = isPaid === "true";

        const meetings = await Meeting.find(filter)
            .populate("timeSlotId userId advocateId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            meetings
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

async function deleteMeeting(req, res) {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findByIdAndDelete(id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }
        res.status(200).json({ success: true, message: "Meeting deleted successfully" });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getMeetingDetails(req, res) {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findById(id).populate("timeSlotId userId advocateId");
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }
        res.status(200).json({ success: true, meeting });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getSignedDocument(req, res) {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }
        const workflowId = meeting.signedDocumentWorkflowId;
        // console.log("workflowId",meeting)
        const signedDocument = await SignedDocument.findOne({ WorkflowId: workflowId });
        if (!signedDocument) {
            return res.status(404).json({ success: false, message: "Signed document not found" });
        }

        const signedWorkFlowId = signedDocument.WorkflowId;
        const data = await downloadSignedDocument(Number(signedWorkFlowId));

        const files = data?.Response?.FileList;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No signed documents found",
            });
        }

        // 🔥 BASE64 → NORMALIZED TABLE
        const documentsTable = files.map((file) => {
            const buffer = Buffer.from(file.Base64FileData, "base64");

            return {
                documentName: file.DocumentName,
                documentId: file.DocumentId,
                isAttachment: file.IsAttachment,
                mimeType: "application/pdf",
                size: buffer.length,          // bytes
                pdfBase64: buffer.toString("base64"), // normalized
            };
        });

        return res.status(200).json({
            success: true,
            workflowId: data.Response.WorkflowId,
            documents: documentsTable,
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

async function updatePaymentDetails(req, res) {
    try {
        const { id } = req.params;
        const {
            paymentStatus,   // "pending" | "success" | "failed" | "refunded"
            transactionId,
            paidAt,
            amount,
            meetingStatus,   // Meeting.status enum value, optional
        } = req.body;

        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        if (!meeting.payment) meeting.payment = {};

        if (paymentStatus) {
            meeting.payment.status = paymentStatus;
            meeting.isPaid = paymentStatus === "success";
        }

        if (transactionId !== undefined) meeting.payment.transactionId = transactionId;

        if (paidAt) {
            meeting.payment.paidAt = new Date(paidAt);
        } else if (paymentStatus === "success" && !meeting.payment.paidAt) {
            meeting.payment.paidAt = new Date();
        }

        if (amount !== undefined) meeting.amount = amount;

        if (meetingStatus) {
            meeting.status = meetingStatus;
        } else if (paymentStatus === "success") {
            meeting.status = "paid";
        } else if (paymentStatus === "failed") {
            meeting.status = "payment_failed";
        }

        await meeting.save();

        return res.status(200).json({
            success: true,
            message: "Payment details updated successfully",
            meeting,
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

module.exports = {
    adminLogin,
    getUsers,
    verifyUserId,
    blockId,
    getAllMeetings,
    deleteMeeting,
    getMeetingDetails,
    getSignedDocument,
    updatePaymentDetails
}
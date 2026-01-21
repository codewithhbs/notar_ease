const ContactEnquiry = require("../models/contactEnquiry.model");

async function createContactEnquiry(req, res) {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const contactEnquiry = new ContactEnquiry({
            name,
            email,
            phone,
            message,
        });

        await contactEnquiry.save();

        return res.status(200).json({
            success: true,
            message: "Contact enquiry created successfully",
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

async function getAllContactEnquiries(req, res) {
    try {
        const contactEnquiries = await ContactEnquiry.find();
        if (!contactEnquiries || contactEnquiries.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No contact enquiries found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Contact enquiries fetched successfully",
            data: contactEnquiries,
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

async function deleteContactEnquiry(req, res) {
    try {
        const { id } = req.params;
        const deletedEnquiry = await ContactEnquiry.findByIdAndDelete(id);
        if (!deletedEnquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact enquiry not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Contact enquiry deleted successfully",
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
    createContactEnquiry,
    getAllContactEnquiries,
    deleteContactEnquiry
};
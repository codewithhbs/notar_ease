const express = require("express");
const router = express.Router();

const ContactEnquiry = require("../controllers/contactEnquiry.controller");

router.post("/create-contact-enquiry", ContactEnquiry.createContactEnquiry);
router.get("/get-all-contact-enquiries", ContactEnquiry.getAllContactEnquiries);
router.delete("/delete-contact-enquiry/:id", ContactEnquiry.deleteContactEnquiry);

module.exports = router;
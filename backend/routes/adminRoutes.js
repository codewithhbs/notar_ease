const express = require("express");
const router = express.Router();

const { authenticateAccessToken, authorizeRoles } = require("../utils/jwtUtil");
const User = require("../models/user.model");
const adminController = require("../controllers/admin.controller");
const advocateController = require("../controllers/advocateAuth.controller");
const multer = require('multer');

const storage = multer.memoryStorage();

const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf']
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Maximum 5 files at once (optional)
  },
  fileFilter: (req, file, cb) => {
    const allAllowedTypes = [
      ...ALLOWED_FILE_TYPES.images,
      ...ALLOWED_FILE_TYPES.documents
    ];

    if (allAllowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed!'),
        false
      );
    }
  }
});

router.post("/admin-login", adminController.adminLogin)

// user and advocate routes 

router.get("/users", authenticateAccessToken, authorizeRoles("admin"), adminController.getUsers);
router.put("/userIdVerify/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.verifyUserId)
router.put("/userBlock/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.blockId)
router.post("/register-advocate", authenticateAccessToken, authorizeRoles("admin"), upload.single('userIdImage'), advocateController.register)
router.get("/advocate-details/:id", authenticateAccessToken, authorizeRoles("admin"), advocateController.getAdvocateDetails)

// meeting routes 

router.get("/get-all-meetings", authenticateAccessToken, authorizeRoles("admin"), adminController.getAllMeetings)
router.delete("/delete-meeting/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.deleteMeeting)
router.get("/get-meeting/:id", adminController.getMeetingDetails)
router.get("/get-signed-document/:id", adminController.getSignedDocument)
router.put("/update-payment-details/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.updatePaymentDetails)

module.exports = router;

const express = require("express");
const router = express.Router();

const { authenticateAccessToken, authorizeRoles } = require("../utils/jwtUtil");
const rateLimiter = require("../middleware/rateLimiter");
const multer = require('multer');
const AdvocateTimeSlot = require("../controllers/advocateAuth.controller");

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

router.post('/add-time-slot',authenticateAccessToken,authorizeRoles("notary", "admin"), AdvocateTimeSlot.addTimeSlot);
router.get('/get-time-slot',authenticateAccessToken,authorizeRoles('notary', 'admin'), AdvocateTimeSlot.getAdvocateTimeSlot);``
router.get('/get-admin-time-slot',authenticateAccessToken, AdvocateTimeSlot.getAdminTimeSlot);
router.get('/get-all-time-slots',authenticateAccessToken,authorizeRoles('user', 'notary'), AdvocateTimeSlot.getAllTimeSlots);
router.post('/check-slot', authenticateAccessToken,authorizeRoles('user', 'notary'), AdvocateTimeSlot.checkTimeSlotAvailability);
router.delete('/delete-time-slot/:id',authenticateAccessToken,authorizeRoles('notary', 'admin'), AdvocateTimeSlot.deleteAdvocateTimeSlot);
module.exports = router;
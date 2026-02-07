const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meeting.controller");
const multer = require('multer');
const { authenticateAccessToken } = require("../utils/jwtUtil");

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

router.post(
  "/create",
  upload.fields([
    { name: "documentUrl", maxCount: 1 },          // Main PDF
    { name: "signatories[0][idProof]", maxCount: 1 },
    { name: "signatories[1][idProof]", maxCount: 1 },
    { name: "signatories[2][idProof]", maxCount: 1 },
    { name: "signatories[3][idProof]", maxCount: 1 },
    { name: "signatories[4][idProof]", maxCount: 1 },
    { name: "signatories[5][idProof]", maxCount: 1 },
    { name: "signatories[6][idProof]", maxCount: 1 },
    { name: "signatories[7][idProof]", maxCount: 1 },
    { name: "signatories[8][idProof]", maxCount: 1 }
  ]),
  meetingController.createMeeting
);

router.post("/create-payment/:meetingId", authenticateAccessToken, meetingController.createPayment);
router.post("/check-status", meetingController.checkStatus);
router.put("/update-time-slot/:id", authenticateAccessToken, meetingController.updateTimeSlot);
router.get("/join-meeting/:id", meetingController.joinMeeting);
router.get("/get-all-meetings", authenticateAccessToken, meetingController.getMeetingByUserAndAdvocate);
router.get("/get-meeting/:id", meetingController.getMeetingDetails);
router.put("/upload-doc-of-signer/:id", authenticateAccessToken, upload.single("doc"), meetingController.uploadDocOfSigner);
router.put("/upload-face-image-of-signer/:id", authenticateAccessToken, upload.single("faceImage"), meetingController.uploadFaceImage);
router.post("/send-document-for-sign/:id", authenticateAccessToken, meetingController.sendDocumentForSign);
router.post("/adv-sign-detail/:id", meetingController.advSignDetail);
router.post("/sign-document-for-notary/:id", meetingController.doStampDuty);

module.exports = router;
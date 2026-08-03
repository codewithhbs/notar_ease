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
    files: 15 // Maximum 5 files at once (optional)
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

const MAX_SIGNATORIES = 9;

const dynamicFields = [
  { name: "documentUrl", maxCount: 1 }
];

for (let i = 0; i < MAX_SIGNATORIES; i++) {
  dynamicFields.push({
    name: `signatories[${i}][idProof]`,
    maxCount: 1,
  });
}

router.post(
  "/create",
  authenticateAccessToken,
  upload.fields(dynamicFields),
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
router.post("/final-report", meetingController.finalReport);
router.get("/download-final-report/:id", meetingController.downloadFinalReport);

module.exports = router;                
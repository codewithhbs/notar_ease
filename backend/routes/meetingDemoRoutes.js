const express = require("express");
const router = express.Router();
const { authenticateAccessToken, authorizeRoles } = require("../utils/jwtUtil");
const DemoMeeting = require("../controllers/meetingDemo.controller");

router.post('/create-demo-meeting', authenticateAccessToken, DemoMeeting.createMeetingDemo);
router.get('/get-all-demo-meetings', authenticateAccessToken, authorizeRoles('admin'), DemoMeeting.getAllMeetingDemos);
router.delete('/delete-demo-meeting/:id', authenticateAccessToken, authorizeRoles('admin'), DemoMeeting.deleteDemoMeeting);

module.exports = router;
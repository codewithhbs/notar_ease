const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bullBoardAdapter = require("./bullBoard/bullBoard");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const advocateRoutes = require("./routes/advocateRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const meetingDemoRoutes = require("./routes/meetingDemoRoutes");
const contactEnquiryRoutes = require("./routes/contactEnquiryRoute");
require("./cron/meetingReminder.cron");
require("./cron/meetingStatus.cron");

console.log("🚀 Bull workers running...");

const app = express();
const PORT = process.env.PORT || 4000;

// DB connect
connectDB();

// 🔥 CORS (header-based auth)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3007",
      "https://ommdocumentation.com",
      "https://www.ommdocumentation.com",
      "https://admin.ommdocumentation.com",
      "https://www.admin.ommdocumentation.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Bull Board UI
app.use("/admin/queues", bullBoardAdapter.getRouter());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Docker + Node.js + Redis + Header Auth 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advocate", advocateRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/meetingDemo", meetingDemoRoutes);
app.use("/api/contact-enquiry", contactEnquiryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

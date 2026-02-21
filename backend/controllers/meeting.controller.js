const AdvocateTimeSlotModel = require("../models/AdvocateTimeSlot.model");
const Meeting = require("../models/meeting.model");
const signedDocumentModel = require("../models/signedDocument.model");
const meetingEndQueue = require("../queues/meetingEnd.queue");
const meetingReminderQueue = require("../queues/meetingReminder.queue");
const { uploadPDF, uploadImage, deleteImageFromCloudinary, uploadFileToCloudinary } = require("../utils/Cloudnary");
const { initiateDocumentSigning } = require("../utils/DocumentSigner");
const getPdfPageCount = require("../utils/getPdfPageCount");
const createGoogleMeet = require("../utils/googleMeet");
const logMeetingAudit = require("../utils/logMeetingAudit");
const { initiateRazorpay } = require("../utils/Pay");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { PDFDocument } = require("pdf-lib");

function getStampPosition(page, position, stampWidth, stampHeight) {
  const { width, height } = page.getSize();
  const margin = 60;

  switch (position) {
    case "bottom-right":
      return { x: width - stampWidth - margin, y: margin };
    case "bottom-left":
      return { x: margin, y: margin };
    case "top-right":
      return { x: width - stampWidth - margin, y: height - stampHeight - margin };
    case "top-left":
      return { x: margin, y: height - stampHeight - margin };
    default:
      return { x: margin, y: margin };
  }
}


function buildDateObject(date, time) {
  const datePart = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
  return new Date(`${datePart}T${time}:00+05:30`);
}

function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const body = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

const toBoolean = (value) => value === true || value === "true";

function parsePageNo(pageNo) {
  if (!pageNo) return [];

  // If already array
  if (Array.isArray(pageNo)) {
    return pageNo.map(Number).filter((n) => n > 0);
  }

  // If stringified JSON
  if (typeof pageNo === "string") {
    try {
      const parsed = JSON.parse(pageNo);
      if (Array.isArray(parsed)) {
        return parsed.map(Number).filter((n) => n > 0);
      }
    } catch (e) {
      return [];
    }
  }

  return [];
}

async function createMeeting(req, res) {
  try {
    const {
      userId,
      meetingTitle,
      meetingDescription,
      signatories,
      signingMode,
      pdfReadCheckbox,
      dateOfAppointmentCheckbox,
      readyForSigningCheckbox,
      electronicSignatureCheckbox,
      agreedToTermsCheckbox,
    } = req.body;

    /* =========================
       BOOLEAN NORMALIZATION
    ========================= */
    const pdfRead = toBoolean(pdfReadCheckbox);
    const dateOfAppointment = toBoolean(dateOfAppointmentCheckbox);
    const readyForSigning = toBoolean(readyForSigningCheckbox);
    const electronicSignature = toBoolean(electronicSignatureCheckbox);
    const agreedToTerms = toBoolean(agreedToTermsCheckbox);

    /* =========================
       VALIDATIONS
    ========================= */
    if (!userId || !meetingTitle || !signatories) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (!agreedToTerms) {
      return res.status(400).json({
        success: false,
        message: "You must agree to the terms and conditions",
      });
    }

    if (
      !pdfRead ||
      !dateOfAppointment ||
      !readyForSigning ||
      !electronicSignature
    ) {
      return res.status(400).json({
        success: false,
        message: "All checkboxes must be checked",
      });
    }

    if (!["adhaarESign", "dsc", "NEKYC"].includes(signingMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid signing mode",
      });
    }

    /* =========================
       PDF VALIDATION
    ========================= */
    const pdfFile = req.files?.documentUrl?.[0];

    if (!pdfFile || pdfFile.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Valid PDF document is required",
      });
    }

    const { pdf, public_id } = await uploadPDF(pdfFile.buffer);

    if (!pdf || !public_id) {
      return res.status(500).json({
        success: false,
        message: "PDF upload failed",
      });
    }

    const totalPdfPages = await getPdfPageCount(pdfFile.buffer);

    if (!totalPdfPages || totalPdfPages <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to read PDF pages",
      });
    }


    /* =========================
       NORMALIZE SIGNATORIES
    ========================= */
    const normalizedSignatories = Array.isArray(signatories)
      ? signatories
      : [signatories];

    const allowedPositions = [
      "top-left",
      "top-center",
      "top-right",
      "middle-left",
      "middle-center",
      "middle-right",
      "bottom-left",
      "bottom-right",
      "bottom-center"
    ];

    let validationError = null;

    const formattedSignatories = await Promise.all(
      normalizedSignatories.map(async (s, index) => {

        let idProofData = null;

        // 👇 ID Proof upload
        const idProofFile =
          req.files?.[`signatories[${index}][idProof]`] ||
          req.files?.[`signatories.${index}.idProof`];

        if (idProofFile) {

          // Upload as IMAGE (kyunki ID proof photo hi hota hai)
          const upload = await uploadFileToCloudinary(
            idProofFile[0].buffer,
            "image"
          );

          // ⚠️ FIELD STRUCTURE SAME rakha hai (as you asked)
          idProofData = {
            image: upload.url,
            public_id: upload.public_id,
          };
        }


        const parsedPageNo = parsePageNo(s.PageNo);

        // ❌ Empty
        if (!parsedPageNo.length) {
          throw new Error(`Page number is required for signatory ${index + 1}`);
        }

        // ❌ Duplicate pages
        const uniquePages = [...new Set(parsedPageNo)];
        if (uniquePages.length !== parsedPageNo.length) {
          throw new Error(`Duplicate page numbers are not allowed for signatory ${index + 1}`);
        }

        // console.log("parsedPageNo",parsedPageNo)

        // ❌ Page exceeds PDF length
        if (parsedPageNo.some((p) => p > totalPdfPages)) {
          throw new Error(`Page number exceeds PDF length for signatory ${index + 1}`);
        }

        return {
          name: s.name,
          email: s.email,
          CountryCode: s.CountryCode,
          MobileNo: s.MobileNo,
          DOB: s.DOB,
          Gender: s.Gender,
          role: 'signer', // Default role as signer, can be updated later if needed

          // ✅ FINAL ARRAY OF NUMBERS
          PageNo: parsedPageNo,
          signingMode: s.signingMode,

          signPosition: allowedPositions.includes(s.signPosition)
            ? s.signPosition
            : "bottom-left",

          idProof: idProofData,
          // signingMode: signingMode
        };
      })
    );

    const signatoryCount = formattedSignatories.length;

    /* =========================
   PRICING LOGIC (DEBUG MODE)
========================= */

    let amount = 0;

    // 👇 Meeting currency
    let currency = signingMode === "NEKYC" ? "USD" : "INR";

    console.log("========== PRICING DEBUG START ==========");
    console.log("Meeting Signing Mode:", signingMode);
    console.log("Meeting Currency:", currency);
    console.log("Total PDF Pages:", totalPdfPages);

    const USD_TO_INR = 90;

    formattedSignatories.forEach((signatory, index) => {
      console.log(`\n---- Signatory ${index + 1} ----`);
      console.log("Name:", signatory.name);
      console.log("Signing Mode:", signatory.signingMode);

      let basePrice = 0;
      let signerCurrency = "INR";

      /* =========================
         BASE PRICE
      ========================= */

      if (signatory.signingMode === "adhaarESign") {
        basePrice = 1000;
        signerCurrency = "INR";
      }

      if (signatory.signingMode === "dsc") {
        basePrice = 3000;
        signerCurrency = "INR";
      }

      if (signatory.signingMode === "NEKYC") {
        basePrice = 35;
        signerCurrency = "USD";
      }

      console.log("Base Price:", basePrice, signerCurrency);

      /* =========================
         PAGE CHARGES
      ========================= */

      if (totalPdfPages > 1) {
        let pageCharge = 0;

        if (signerCurrency === "USD") {
          pageCharge = (totalPdfPages - 1) * 1;
        } else {
          pageCharge = (totalPdfPages - 1) * 100;
        }

        basePrice += pageCharge;

        console.log(
          "Page Charges Added:",
          pageCharge,
          signerCurrency
        );
      }

      console.log("Price After Page Charges:", basePrice, signerCurrency);

      /* =========================
         CURRENCY CONVERSION
      ========================= */

      if (currency === "INR" && signerCurrency === "USD") {
        console.log(
          `Converting USD → INR @${USD_TO_INR}`
        );
        basePrice = basePrice * USD_TO_INR;
      }

      if (currency === "USD" && signerCurrency === "INR") {
        console.log(
          `Converting INR → USD @${USD_TO_INR}`
        );
        basePrice = basePrice / USD_TO_INR;
      }

      console.log("Final Signatory Price:", basePrice, currency);

      amount += basePrice;
    });

    /* =========================
       FINAL AMOUNT
    ========================= */

    amount = Number(amount.toFixed(2));

    console.log("\n========== FINAL BILL ==========");
    console.log("Total Amount:", amount, currency);
    console.log("================================");

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "There is no pricing available for the selected options",
      });
    }

    /* =========================
       CREATE MEETING
    ========================= */
    const meeting = await Meeting.create({
      userId,
      meetingTitle,
      meetingDescription,
      signatories: formattedSignatories,
      signingMode,
      signatoryCount,
      amount,
      currency,
      status: "scheduled",
      isPaid: false,
      pdfReadCheckbox: pdfRead,
      dateOfAppointmentCheckbox: dateOfAppointment,
      readyForSigningCheckbox: readyForSigning,
      electronicSignatureCheckbox: electronicSignature,
      agreedToTermsCheckbox: agreedToTerms,
      documentUrl: {
        pdf,
        public_id,
      },
    });

    return res.status(201).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Create meeting error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

async function createPayment(req, res) {
  console.log("🔔 createPayment API HIT");

  try {
    const { meetingId } = req.params;
    const userID = req.user?.sub;

    console.log("📥 Params & User:", { meetingId, userID });

    if (!meetingId || !userID) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    const meeting = await Meeting.findOne({
      _id: meetingId,
      userId: userID,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // 🚫 Already paid protection
    if (meeting.isPaid) {
      return res.status(400).json({
        success: true,
        message: "Meeting already paid",
      });
    }

    console.log("✅ Meeting ready for payment:", {
      id: meeting._id,
      amount: meeting.amount,
    });

    // Mark as payment pending (optional but recommended)
    meeting.status = "payment_pending";
    await meeting.save();

    return await initiateRazorpay(req, res, meeting);

  } catch (error) {
    console.error("🔥 ERROR in createPayment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function checkStatus(req, res) {
  console.log("🔔 checkStatus API HIT");

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment details",
      });
    }

    // 1️⃣ Verify signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    console.log("🔐 Signature valid:", isValid);

    // 2️⃣ Find meeting by Razorpay order id
    const meeting = await Meeting.findOne({
      "payment.razorpayOrderId": razorpay_order_id,
    }).populate("userId");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // ❌ Payment failed
    if (!isValid) {
      meeting.payment.status = "failed";
      meeting.payment.transactionId = razorpay_payment_id;
      meeting.isPaid = false;
      meeting.status = "payment_failed";

      await meeting.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        redirectUrl: `http://localhost:3000/payment-failed?order_id=${razorpay_order_id}`,
      });
    }

    // ✅ Payment success
    meeting.payment.transactionId = razorpay_payment_id;
    meeting.payment.status = "success";
    meeting.payment.paidAt = new Date();

    meeting.isPaid = true;
    meeting.status = "paid";

    await meeting.save();

    console.log("✅ Meeting payment marked as PAID");

    const successRedirect = `http://localhost:3000/Receipt/order-confirmed?id=${meeting._id}&success=true`;

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      redirectUrl: successRedirect,
    });

  } catch (error) {
    console.error("🔥 ERROR in checkStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function updateTimeSlot(req, res) {
  try {
    const userID = req.user?.sub;
    const { id } = req.params;
    const { timeSlotId } = req.body;

    // console.log("body",userID,id,timeSlotId)

    const meeting = await Meeting.findOne({ _id: id, userId: userID });
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (meeting.isPaid === false) {
      return res.status(400).json({ success: false, message: "Meeting is not paid" });
    }
    // console.log("timeSlotId", timeSlotId)
    const timeSlot = await AdvocateTimeSlotModel.findById(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({ success: false, message: "Time slot not found" });
    }

    if (new Date(timeSlot.startTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Start time must be in the future",
      });
    }

    const meetLink = await createGoogleMeet({
      title: meeting.meetingTitle,
      date: timeSlot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    });


    await logMeetingAudit({
      meetingId: meeting._id,
      action: "MEETING_CREATED",
      performedBy: meeting.userId,
    });

    const startDateTime = buildDateObject(timeSlot.date, timeSlot.startTime);
    const endDateTime = buildDateObject(timeSlot.date, timeSlot.endTime);

    // ⛔ Extra safety
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    timeSlot.isBooked = true;

    meeting.meetLink = meetLink;
    meeting.startTime = startDateTime;
    meeting.endTime = endDateTime;
    meeting.timeSlotId = timeSlot._id;
    meeting.advocateId = timeSlot.advocateId;
    meeting.status = "live";

    console.log("🕒 Final meeting times:", {
      start: meeting.startTime,
      end: meeting.endTime,
    });

    await timeSlot.save();
    await meeting.save();

    /* ===============================
       🔔 ADD BULL JOBS HERE
    ================================ */

    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);

    // 24 hour reminder
    const delay24h = startTime - now - 24 * 60 * 60 * 1000;
    if (delay24h > 0) {
      await meetingReminderQueue.add(
        {
          meetingId: meeting._id,
          type: "24_HOURS",
        },
        {
          delay: delay24h,
          jobId: `reminder:${meeting._id}:24h`,
        }
      );
    }

    // 15 minute reminder
    const delay15m = startTime - now - 15 * 60 * 1000;
    if (delay15m > 0) {
      await meetingReminderQueue.add(
        {
          meetingId: meeting._id,
          type: "15_MINUTES",
        },
        {
          delay: delay15m,
          jobId: `reminder:${meeting._id}:15m`,
        }
      );
    }

    // meeting end job
    const endDelay = endTime - now;
    if (endDelay > 0) {
      await meetingEndQueue.add(
        {
          meetingId: meeting._id,
        },
        {
          delay: endDelay,
          jobId: `end:${meeting._id}`,
        }
      );
    }

    res.status(200).json({ success: true, message: "Meeting updated" });
  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function joinMeeting(req, res) {
  const meeting = await Meeting.findById(req.params.id);

  const now = new Date();
  const startTime = new Date(meeting.startTime).getTime();
  const endTime = new Date(meeting.endTime).getTime();

  // 30 minutes in milliseconds
  const EARLY_JOIN_MS = 30 * 60 * 1000;

  const allowed =
    now >= (startTime - EARLY_JOIN_MS) &&
    now <= endTime;

  await logMeetingAudit({
    meetingId: meeting._id,
    action: "JOIN_ATTEMPT",
    performedBy: req.user?.id,
    meta: { allowed },
  });

  if (now < startTime - EARLY_JOIN_MS) {
    return res.status(403).json({ message: "Meeting has not started yet" });
  }

  if (now > endTime) {
    return res.status(403).json({ message: "Meeting is expired" });
  }

  if (meeting.isPaid === false) {
    return res.status(400).json({ success: false, message: "Meeting is not paid" });
  }

  res.json({ meetLink: meeting.meetLink });
}

async function getMeetingByUserAndAdvocate(req, res) {
  try {
    const userId = req.user?.sub;
    const role = req.user?.role; // "user" or "advocate"
    // console.log("userId, role", userId, role)

    // =========================
    // QUERY PARAMS
    // =========================
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // =========================
    // FILTER BASED ON ROLE
    // =========================
    let filter = {};

    if (role === "notary") {
      filter = { advocateId: userId };
    }
    else if (role === "user") {
      filter = { userId: userId };
    } else if (role === "admin") {
      filter = {
        $or: [{ userId }, { advocateId: userId }]
      };
    }


    // =========================
    // TOTAL COUNT
    // =========================
    const total = await Meeting.countDocuments(filter);

    // =========================
    // FETCH MEETINGS
    // =========================
    const meetings = await Meeting.find(filter)
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit);

    if (!meetings || meetings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No meetings found",
      });
    }

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      meetings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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

async function getMeetingDetails(req, res) {
  try {
    const userID = req.user?.sub;
    const { id } = req.params;
    // console.log("id",id)

    const meeting = await Meeting.findOne({ _id: id }).populate("timeSlotId userId advocateId");
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    console.error("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function advSignDetail(req, res) {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      CountryCode,
      MobileNo,
      DOB,
      Gender,
      PageNo,
      signPosition,
      signingMode
    } = req.body;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // 🔒 Optional: Meeting already signed check
    if (meeting.isSigned) {
      return res.status(400).json({
        success: false,
        message: "Meeting already sent for signing",
      });
    }

    // 🔍 Optional: Duplicate signer email check
    const exists = meeting.signatories.find(
      (s) => s.email === email
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Signer already exists",
      });
    }

    const cleanPageNo = [
      ...new Set(
        (Array.isArray(PageNo) ? PageNo : [PageNo])
          .map(Number)
          .filter(n => !isNaN(n))
      )
    ];

    // ✅ Create signer object
    const signer = {
      name,
      email,
      CountryCode,
      MobileNo,
      DOB,
      Gender,
      PageNo: cleanPageNo,
      signPosition,
      signingMode,
      role: "notary",
    };

    // ➕ Push signer
    meeting.signatories.push(signer);

    // 🔢 Update count
    meeting.signatoryCount = meeting.signatories.length;

    meeting.notaryDetails = {
      name,
      email,
      MobileNo,
      PageNo,
      signPosition,
      signingMode
    };

    await meeting.save();

    return res.status(200).json({
      success: true,
      message: "Signer details added successfully",
      signer,
      signatories: meeting.signatories,
    });

  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function sendDocumentForSign(req, res) {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id)
      .populate("timeSlotId userId advocateId");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (!meeting.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Meeting is not paid",
      });
    }

    if (!meeting.signatories?.length) {
      return res.status(400).json({
        success: false,
        message: "No signatories found",
      });
    }

    // 🔹 Call signing API
    const response = await initiateDocumentSigning(meeting);

    if (!response?.IsSuccess || !response?.Response) {
      return res.status(500).json({
        success: false,
        message: "Failed to initiate document signing",
      });
    }

    console.log("response", response.Response)

    const {
      WorkflowId,
      DocumentNumberList,
      DocumentIdList,
      URL
    } = response.Response;

    const exists = await signedDocumentModel.findOne({ WorkflowId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Document already sent for signing",
      });
    }


    // 🔹 Save in SignedDocument table
    const signedDocument = await signedDocumentModel.create({
      meetingId: meeting._id,
      WorkflowId,
      DocumentNumberList,
      DocumentIdList,
      url: URL
    });

    // 🔹 Update meeting
    meeting.isSigned = true;
    meeting.signedDocumentWorkflowId = signedDocument.WorkflowId;
    meeting.signedDocumentUrl = signedDocument.url;
    meeting.status = 'ended';
    await meeting.save();

    return res.status(200).json({
      success: true,
      message: "Document sent for signing",
      signedDocument
    });

  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function uploadFaceImage(req, res) {
  try {
    const { id } = req.params;
    const { signerIndex } = req.body;

    if (signerIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "signerIndex is required",
      });
    }

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (!meeting.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Meeting is not paid",
      });
    }

    if (!meeting.signatories[signerIndex]) {
      return res.status(400).json({
        success: false,
        message: "Invalid signer index",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const signer = meeting.signatories[signerIndex];

    // 🔥 STEP 1: Agar pehle image hai → delete karo
    if (signer.faceImage?.public_id) {
      console.log("Deleting old image:", signer.faceImage.public_id);
      await deleteImageFromCloudinary(signer.faceImage.public_id);
    }

    // 🔥 STEP 2: Upload new image
    const uploaded = await uploadImage(req.file.buffer);
    const { image, public_id } = uploaded;

    // 🔥 STEP 3: Save new image
    signer.faceImage = {
      image,
      public_id,
    };

    await meeting.save();

    return res.status(200).json({
      success: true,
      message: "Signer document uploaded successfully",
      signer,
    });

  } catch (error) {
    console.log("Internal server error", error)
    return res.status(500).josn({
      success: false,
      message: "Internal server error",
      error: error.message
    })
  }
}

async function uploadDocOfSigner(req, res) {
  try {
    const { id } = req.params;
    const { signerIndex } = req.body;

    if (signerIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "signerIndex is required",
      });
    }

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (!meeting.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Meeting is not paid",
      });
    }

    if (!meeting.signatories[signerIndex]) {
      return res.status(400).json({
        success: false,
        message: "Invalid signer index",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const signer = meeting.signatories[signerIndex];

    // 🔥 STEP 1: Agar pehle image hai → delete karo
    if (signer.doc?.public_id) {
      console.log("Deleting old image:", signer.doc.public_id);
      await deleteImageFromCloudinary(signer.doc.public_id);
    }

    // 🔥 STEP 2: Upload new image
    const uploaded = await uploadImage(req.file.buffer);
    const { image, public_id } = uploaded;

    // 🔥 STEP 3: Save new image
    signer.doc = {
      image,
      public_id,
    };

    await meeting.save();

    return res.status(200).json({
      success: true,
      message: "Signer document uploaded successfully",
      signer,
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

async function doStampDuty(req, res) {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    const pdfUrl = meeting?.documentUrl?.pdf;
    // const pdfUrl = 'https://res.cloudinary.com/duxsqzrot/image/upload/v1769852947/dummy_cb9sqa.pdf';
    if (!pdfUrl) {
      return res.status(400).json({
        success: false,
        message: "Document not signed yet"
      });
    }

    const { PageNo, signPosition } = meeting.notaryDetails;

    // 1️⃣ Download signed PDF
    const pdfResponse = await axios.get(pdfUrl, {
      responseType: "arraybuffer"
    });

    // console.log("PDF Content-Type:", pdfResponse.headers["content-type"]);


    const pdfDoc = await PDFDocument.load(pdfResponse.data);

    // 2️⃣ Load stamp image
    const stampPath = path.join(process.cwd(), "public/stamp.png");
    const stampBytes = fs.readFileSync(stampPath);
    // const stampImage = await pdfDoc.embedJpg(stampBytes);
    const stampImage = await pdfDoc.embedPng(stampBytes);

    const stampWidth = 110;
    const stampHeight = 110;

    // 3️⃣ Apply stamp on given pages
    for (let pageIndex of PageNo) {
      const page = pdfDoc.getPage(pageIndex - 1);

      const { x, y } = getStampPosition(
        page,
        signPosition,
        stampWidth,
        stampHeight
      );

      page.drawImage(stampImage, {
        x,
        y,
        width: stampWidth,
        height: stampHeight
      });
    }

    // 4️⃣ Save PDF to buffer
    const stampedPdfBuffer = Buffer.from(await pdfDoc.save());

    // 5️⃣ Upload to Cloudinary
    const uploaded = await uploadPDF(stampedPdfBuffer);

    meeting.documentUrl = {
      pdf: uploaded.pdf,
      public_id: uploaded.public_id
    }

    // 6️⃣ Save in meeting
    meeting.stampedDocumentUrl = {
      pdf: uploaded.pdf,
      public_id: uploaded.public_id
    };

    await meeting.save();

    return res.status(200).json({
      success: true,
      message: "Stamp added & uploaded successfully",
      stampedDocumentUrl: meeting.stampedDocumentUrl
    });

  } catch (error) {
    console.error("Stamp Duty Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

module.exports = {
  createMeeting,
  createPayment,
  checkStatus,
  updateTimeSlot,
  joinMeeting,
  getMeetingByUserAndAdvocate,
  getMeetingDetails,
  uploadDocOfSigner,
  advSignDetail,
  sendDocumentForSign,
  uploadFaceImage,
  doStampDuty
};

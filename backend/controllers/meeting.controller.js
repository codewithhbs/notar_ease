const AdvocateTimeSlotModel = require("../models/AdvocateTimeSlot.model");
const Meeting = require("../models/meeting.model");
const signedDocumentModel = require("../models/signedDocument.model");
const meetingEndQueue = require("../queues/meetingEnd.queue");
const meetingReminderQueue = require("../queues/meetingReminder.queue");
const { uploadPDF, uploadImage, deleteImageFromCloudinary, uploadFileToCloudinary } = require("../utils/Cloudnary");
const { initiateDocumentSigning, downloadSignedDocument } = require("../utils/DocumentSigner");
const getPdfPageCount = require("../utils/getPdfPageCount");
const createGoogleMeet = require("../utils/googleMeet");
const logMeetingAudit = require("../utils/logMeetingAudit");
const { initiateRazorpay } = require("../utils/Pay");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const sendEmail = require("../utils/SendEmail");

function getStampPosition(page, position, stampWidth, stampHeight) {
  const { width, height } = page.getSize();
  const margin = 0;
  // const bottom = 13;

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
    console.log("========================================");
    console.log("🚀 STAMP DUTY PROCESS START");
    console.log("Request Params:", req.params);
    console.log("========================================");

    const { id } = req.params;

    // ==============================
    // 1️⃣ Fetch Meeting
    // ==============================
    console.log("🔍 Fetching meeting by ID:", id);

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      console.log("❌ Meeting not found");
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    console.log("✅ Meeting found:", meeting._id);

    const pdfUrl = meeting?.stampedDocumentUrl?.pdf;

    if (!pdfUrl) {
      console.log("❌ stampedDocumentUrl missing");
      return res.status(400).json({
        success: false,
        message: "Document not signed yet",
      });
    }

    console.log("📄 PDF URL:", pdfUrl);

    const { PageNo, signPosition } =
      meeting.notaryDetails || {};

    console.log("📝 Stamp Pages:", PageNo);
    console.log("📍 Stamp Position:", signPosition);

    // ==============================
    // 2️⃣ Download PDF
    // ==============================
    console.log("⬇️ Downloading signed PDF...");

    const pdfResponse = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });

    console.log(
      "✅ PDF Downloaded. Size:",
      pdfResponse.data.length
    );

    const pdfDoc = await PDFDocument.load(
      pdfResponse.data
    );

    console.log("📘 PDF Loaded Successfully");

    // ==============================
    // 3️⃣ Load Stamp Image
    // ==============================
    const stampPath = path.join(
      process.cwd(),
      "public/stamp.png"
    );

    console.log("🖼 Loading stamp image from:", stampPath);

    const stampBytes = fs.readFileSync(stampPath);

    const stampImage = await pdfDoc.embedPng(stampBytes);

    console.log("✅ Stamp image embedded");

    const stampWidth = 110;
    const stampHeight = 110;

    // ==============================
    // 4️⃣ Apply Notary Text on Every Page (Top Right)
    // ==============================
    console.log("🖊 Adding notary text to all pages...");

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const totalPages = pdfDoc.getPageCount();

    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Line 1: "notarised with Ommdocumentation"
      page.drawText("Notarised with Ommdocumentation", {
        x: width - 230,
        y: height - 18,
        size: 9,
        font: font,
        color: rgb(0.58, 0.0, 0.83),
        opacity: 0.75,
      });

      // Line 2: "ommdocumentation.com"
      page.drawText("ommdocumentation.com", {
        x: width - 163,
        y: height - 30,
        size: 8,
        font: regularFont,
        color: rgb(0.58, 0.0, 0.83),
        opacity: 0.75,
      });

      console.log(`✅ Notary text added on page ${i + 1}`);
    }

    console.log("✅ Notary text applied to all pages");

    // ==============================
    // 5️⃣ Apply Stamp
    // ==============================
    console.log("🖊 Applying stamp to pages...");

    for (let pageIndex of PageNo || []) {
      console.log("➡ Stamping page:", pageIndex);

      const page = pdfDoc.getPage(pageIndex - 1);

      const { x, y } = getStampPosition(
        page,
        signPosition,
        stampWidth,
        stampHeight
      );

      console.log("📌 Stamp Coordinates:", { x, y });

      page.drawImage(stampImage, {
        x,
        y,
        width: stampWidth,
        height: stampHeight,
      });
    }

    console.log("✅ Stamping completed");

    // ==============================
    // 6️⃣ Save + Upload
    // ==============================
    console.log("💾 Saving stamped PDF...");

    const stampedPdfBuffer = Buffer.from(
      await pdfDoc.save()
    );

    console.log(
      "📦 Stamped PDF size:",
      stampedPdfBuffer.length
    );

    console.log("☁️ Uploading stamped PDF...");

    const uploaded = await uploadPDF(stampedPdfBuffer);

    console.log("✅ Uploaded:", uploaded.pdf);

    meeting.stampedDocumentUrl = {
      pdf: uploaded.pdf,
      public_id: uploaded.public_id,
    };

    await meeting.save();
    console.log("💾 Meeting updated with stamped URL");

    // ==============================
    // 7️⃣ Prepare Mail Data
    // ==============================
    console.log("📨 Preparing email recipients...");

    const signatories = meeting.signatories || [];

    console.log(
      "👥 Total Signatories:",
      signatories.length
    );

    // const recipients = signatories.slice(0, -1);
    const recipients = signatories;

    console.log(
      "📧 Mail will be sent to:",
      recipients.map((r) => r.email)
    );

    const stampedPdfLink = meeting.stampedDocumentUrl.pdf;
    const certificatePdfLink = meeting.documentCertificate?.pdf;
    const faceImage = signatories[0]?.faceImage?.image;
    const docImage = signatories[0]?.doc?.image;

    console.log("📎 Attachments:");
    console.log("Stamped PDF:", stampedPdfLink);
    console.log("Certificate:", certificatePdfLink);
    console.log("Face Image:", faceImage);
    console.log("Doc Image:", docImage);

    // ==============================
    // 8️⃣ Download Attachments
    // ==============================
    const downloadFile = async (url, label) => {
      if (!url) {
        console.log(`⚠️ ${label} missing`);
        return null;
      }

      console.log(`⬇️ Downloading ${label}...`);

      const res = await axios.get(url, {
        responseType: "arraybuffer",
      });

      console.log(
        `✅ ${label} downloaded. Size:`,
        res.data.length
      );

      return Buffer.from(res.data);
    };

    const [
      stampedBuffer,
      certificateBuffer,
      faceBuffer,
      docBuffer,
    ] = await Promise.all([
      downloadFile(stampedPdfLink, "Stamped PDF"),
      downloadFile(certificatePdfLink, "Certificate PDF"),
      downloadFile(faceImage, "Face Image"),
      downloadFile(docImage, "Doc Image"),
    ]);

    // ==============================
    // 9️⃣ Send Emails
    // ==============================
    console.log("📤 Sending emails...");

    for (const signer of recipients) {
      console.log("➡ Sending mail to:", signer.email);

      const mailStatus = await sendEmail({
        email: signer.email,
        subject:
          "Document Signed Successfully - Omm Documentation",

        message: `
          <h2>Document Signed Successfully</h2>
          <p>Hello ${signer.name},</p>
          <p>Your document has been successfully signed through <b>Omm Documentation</b>.</p>
          <p>Please find attached stamped document and certificate.</p>
          <br/>
          <p>Regards,<br/>Omm Documentation Team</p>
        `,

        attachments: [
          {
            filename: "StampedDocument.pdf",
            content: stampedBuffer,
          },
          {
            filename: "Certificate.pdf",
            content: certificateBuffer,
          },
          {
            filename: "FaceImage.png",
            content: faceBuffer,
          },
          {
            filename: "DocumentImage.png",
            content: docBuffer,
          },
        ].filter((a) => a.content),
      });

      console.log(
        mailStatus
          ? "✅ Mail sent"
          : "❌ Mail failed"
      );
    }

    console.log("========================================");
    console.log("🎉 STAMP DUTY PROCESS COMPLETED");
    console.log("========================================");

    return res.status(200).json({
      success: true,
      message: "Stamp added & mail sent successfully",
      stampedDocumentUrl: meeting.stampedDocumentUrl,
    });
  } catch (error) {
    console.error("❌ STAMP DUTY ERROR:", error);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function finalReport(req, res) {
  try {
    console.log("========== FINAL REPORT START ==========");
    console.log("Request Body:", req.body);

    const { WorkflowID } = req.body;

    // ==============================
    // 1️⃣ Validate WorkflowID
    // ==============================
    if (!WorkflowID) {
      return res.status(400).json({
        success: false,
        message: "WorkflowID is required",
      });
    }

    console.log("✅ WorkflowID:", WorkflowID);

    // ==============================
    // 2️⃣ Download Signed Doc + Certificate
    // ==============================
    console.log("⬇️ Calling downloadSignedDocument...");
    const signedDoc = await downloadSignedDocument(WorkflowID);

    if (!signedDoc) {
      return res.status(404).json({
        success: false,
        message: "Signed document response empty",
      });
    }

    // ==============================
    // 3️⃣ Extract Signed Files
    // ==============================
    const files =
      signedDoc?.signedDocument?.Response?.FileList || [];

    console.log("📂 Signed Files Count:", Array.isArray(files) ? files.length : 0);

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No signed documents found",
      });
    }

    // ==============================
    // 4️⃣ Extract Certificate Safely
    // ==============================
    let certificateFile = null;

    const certificateResponse = signedDoc?.certificate?.Response;

    if (!certificateResponse) {
      return res.status(404).json({
        success: false,
        message: "Certificate response missing",
      });
    }

    // Case 1: If Response is array
    if (Array.isArray(certificateResponse)) {
      certificateFile = certificateResponse[0];
      console.log("📂 Certificate Files Count:", certificateResponse.length);
    }
    // Case 2: If Response is single object
    else if (typeof certificateResponse === "object") {
      certificateFile = certificateResponse;
      console.log("📂 Certificate Files Count: 1");
    }
    // Case 3: If Response is base64 string (wrong structure)
    else if (typeof certificateResponse === "string") {
      certificateFile = { Base64FileData: certificateResponse };
      console.log("📂 Certificate Base64 Length:", certificateResponse.length);
    }

    if (!certificateFile?.Base64FileData) {
      return res.status(404).json({
        success: false,
        message: "Certificate file not found",
      });
    }

    // ==============================
    // 5️⃣ Start Parallel Uploads
    // ==============================

    const certificateUploadPromise = uploadPDF(
      Buffer.from(certificateFile.Base64FileData, "base64")
    );

    const uploadedFilesPromise = Promise.all(
      files.map(async (file, index) => {
        try {
          console.log(
            `🚀 Uploading file ${index + 1}:`,
            file.DocumentName
          );

          if (!file?.Base64FileData) {
            console.log("❌ Base64 missing for:", file.DocumentName);
            return null;
          }

          const buffer = Buffer.from(file.Base64FileData, "base64");

          console.log("📦 Buffer size:", buffer.length);

          const uploadResult = await uploadPDF(buffer);

          console.log("☁️ Upload success:", uploadResult?.pdf);

          return {
            DocumentName: file.DocumentName,
            url: uploadResult?.pdf,
            public_id: uploadResult?.public_id,
          };
        } catch (err) {
          console.error("❌ Upload error:", err.message);
          return null;
        }
      })
    );

    // ==============================
    // 6️⃣ Wait for Uploads
    // ==============================
    const [uploadedCertificate, uploadedFilesRaw] =
      await Promise.all([
        certificateUploadPromise,
        uploadedFilesPromise,
      ]);

    const uploadedFiles = uploadedFilesRaw.filter(Boolean);

    console.log("✅ All files uploaded:", uploadedFiles.length);

    // ==============================
    // 7️⃣ Find Meeting
    // ==============================
    const meeting = await Meeting.findOne({
      $or: [
        { signedDocumentWorkflowId: WorkflowID },
        { signedDocumentWorkflowId: Number(WorkflowID) },
      ],
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message:
          "Meeting not found for the given WorkflowID",
      });
    }

    console.log("✅ Meeting found:", meeting._id);

    // ==============================
    // 8️⃣ Save URLs
    // ==============================
    meeting.stampedDocumentUrl = uploadedFiles[0]
      ? {
        pdf: uploadedFiles[0].url,
        public_id: uploadedFiles[0].public_id,
      }
      : null;

    meeting.documentCertificate = uploadedCertificate
      ? {
        pdf: uploadedCertificate.pdf,
        public_id: uploadedCertificate.public_id,
      }
      : null;

    meeting.allSignDoneByClient = true;
    await meeting.save();

    console.log("💾 Meeting updated successfully");
    console.log("========== FINAL REPORT SUCCESS ==========");

    // ==============================
    // 9️⃣ Final Response
    // ==============================
    return res.status(200).json({
      success: true,
      message: "Final Report generated successfully",
      data: {
        signedDocuments: uploadedFiles,
        certificate: uploadedCertificate,
      },
    });
  } catch (error) {
    console.error("❌ FINAL REPORT ERROR:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function downloadFinalReport(req, res) {
  try {
    console.log("========== FINAL REPORT START ==========");
    console.log("Request Body:", req.body);

    // const { WorkflowID } = req.body;
    const { id } = req.params;

    const meetingById = await Meeting.findById(id);

    if (!meetingById) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const isAlreadyDownloaded = meetingById.allSignDoneByClient;

    if (isAlreadyDownloaded) {
      return res.status(200).json({
        success: true,
        message: "Final Report already downloaded",
      });
    }

    const WorkflowID = meetingById.signedDocumentWorkflowId;

    // ==============================
    // 1️⃣ Validate WorkflowID
    // ==============================
    if (!WorkflowID) {
      return res.status(400).json({
        success: false,
        message: "WorkflowID is required",
      });
    }

    console.log("✅ WorkflowID:", WorkflowID);

    // ==============================
    // 2️⃣ Download Signed Doc + Certificate
    // ==============================
    console.log("⬇️ Calling downloadSignedDocument...");
    const signedDoc = await downloadSignedDocument(WorkflowID);

    if (!signedDoc) {
      return res.status(404).json({
        success: false,
        message: "Signed document response empty",
      });
    }

    // ==============================
    // 3️⃣ Extract Signed Files
    // ==============================
    const files =
      signedDoc?.signedDocument?.Response?.FileList || [];

    console.log("📂 Signed Files Count:", Array.isArray(files) ? files.length : 0);

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No signed documents found",
      });
    }

    // ==============================
    // 4️⃣ Extract Certificate Safely
    // ==============================
    let certificateFile = null;

    const certificateResponse = signedDoc?.certificate?.Response;

    if (!certificateResponse) {
      return res.status(404).json({
        success: false,
        message: "Certificate response missing",
      });
    }

    // Case 1: If Response is array
    if (Array.isArray(certificateResponse)) {
      certificateFile = certificateResponse[0];
      console.log("📂 Certificate Files Count:", certificateResponse.length);
    }
    // Case 2: If Response is single object
    else if (typeof certificateResponse === "object") {
      certificateFile = certificateResponse;
      console.log("📂 Certificate Files Count: 1");
    }
    // Case 3: If Response is base64 string (wrong structure)
    else if (typeof certificateResponse === "string") {
      certificateFile = { Base64FileData: certificateResponse };
      console.log("📂 Certificate Base64 Length:", certificateResponse.length);
    }

    if (!certificateFile?.Base64FileData) {
      return res.status(404).json({
        success: false,
        message: "Certificate file not found",
      });
    }

    // ==============================
    // 5️⃣ Start Parallel Uploads
    // ==============================

    const certificateUploadPromise = uploadPDF(
      Buffer.from(certificateFile.Base64FileData, "base64")
    );

    const uploadedFilesPromise = Promise.all(
      files.map(async (file, index) => {
        try {
          console.log(
            `🚀 Uploading file ${index + 1}:`,
            file.DocumentName
          );

          if (!file?.Base64FileData) {
            console.log("❌ Base64 missing for:", file.DocumentName);
            return null;
          }

          const buffer = Buffer.from(file.Base64FileData, "base64");

          console.log("📦 Buffer size:", buffer.length);

          const uploadResult = await uploadPDF(buffer);

          console.log("☁️ Upload success:", uploadResult?.pdf);

          return {
            DocumentName: file.DocumentName,
            url: uploadResult?.pdf,
            public_id: uploadResult?.public_id,
          };
        } catch (err) {
          console.error("❌ Upload error:", err.message);
          return null;
        }
      })
    );

    // ==============================
    // 6️⃣ Wait for Uploads
    // ==============================
    const [uploadedCertificate, uploadedFilesRaw] =
      await Promise.all([
        certificateUploadPromise,
        uploadedFilesPromise,
      ]);

    const uploadedFiles = uploadedFilesRaw.filter(Boolean);

    console.log("✅ All files uploaded:", uploadedFiles.length);

    // ==============================
    // 7️⃣ Find Meeting
    // ==============================
    const meeting = await Meeting.findOne({
      $or: [
        { signedDocumentWorkflowId: WorkflowID },
        { signedDocumentWorkflowId: Number(WorkflowID) },
      ],
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message:
          "Meeting not found for the given WorkflowID",
      });
    }

    console.log("✅ Meeting found:", meeting._id);

    // ==============================
    // 8️⃣ Save URLs
    // ==============================
    meeting.stampedDocumentUrl = uploadedFiles[0]
      ? {
        pdf: uploadedFiles[0].url,
        public_id: uploadedFiles[0].public_id,
      }
      : null;

    meeting.documentCertificate = uploadedCertificate
      ? {
        pdf: uploadedCertificate.pdf,
        public_id: uploadedCertificate.public_id,
      }
      : null;

    // meeting.allSignDoneByClient = true;
    await meeting.save();

    console.log("💾 Meeting updated successfully");
    console.log("========== FINAL REPORT SUCCESS ==========");

    // ==============================
    // 9️⃣ Final Response
    // ==============================
    return res.status(200).json({
      success: true,
      message: "Final Report generated successfully",
      data: {
        signedDocuments: uploadedFiles,
        certificate: uploadedCertificate,
      },
    });
  } catch (error) {
    console.error("❌ FINAL REPORT ERROR:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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
  doStampDuty,
  finalReport,
  downloadFinalReport
};

const mongoose = require("mongoose");

const signerSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  CountryCode: { type: String },
  MobileNo: { type: String },
  DOB: { type: Date },
  Gender: { type: String },
  PageNo: [
    {
      type: Number,
    },
  ],
  signPosition: {
    type: String,
    enum: ["bottom-left", "top-left", "top-right", "bottom-right", "bottom-center", "top-center", "middle-center", "middle-left", "middle-right"],
    default: "bottom-left",
  },
  idProof: {
    image: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  faceImage: {
    image: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  doc: {
    image: {
      type: String,
    },
    public_id: {
      type: String,
    },
  }
});

const meetingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  advocateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  meetingTitle: {
    type: String
  },
  meetingDescription: {
    type: String,
  },
  signatories: [signerSchema],
  signingMode: {
    type: String,
    enum: ["adhaarESign", "dsc", "NEKYC"],
    default: "adhaarESign",
  },
  documentUrl: {
    pdf: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  pdfReadCheckbox: {
    type: Boolean,
    default: false,
  },
  dateOfAppointmentCheckbox: {
    type: Boolean,
    default: false,
  },
  readyForSigningCheckbox: {
    type: Boolean,
    default: false,
  },
  electronicSignatureCheckbox: {
    type: Boolean,
    default: false,
  },
  agreedToTermsCheckbox: {
    type: Boolean,
    default: false,
  },
  meetLink: {
    type: String
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdvocateTimeSlot",
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["scheduled", "payment_pending", "live", "ended", "payment_failed", "paid"],
    default: "scheduled",
  },
  signatoryCount: Number,
  amount: Number,
  currency: {
    type: String,
    enum: ["INR", "USD"],
  },
  method: {
    type: String,
    enum: ["RAZORPAY", "PAYPAL", "STRIPE"],
  },
  payment: {
    method: String,
    paymentInital: Date,
    razorpayOrderId: String,
    transactionId: String,
    status: String, // pending | success | failed
    paidAt: Date
  },
  isSigned: {
    type: Boolean,
    default: false,
  },
  signedDocumentWorkflowId: {
    type: Number,
  },
  signedDocumentUrl: {
    type: String,
  },
  isMeetingEnded: {
    type: Boolean,
    default: false
  },
  notaryDetails: {
    name: {
      type: String,
    },
    email: {
      type: String
    },
    MobileNo: {
      type: String
    },
    PageNo: [
      {
        type: Number,
      },
    ],
    signPosition: {
      type: String,
      enum: ["bottom-left", "top-left", "top-right", "bottom-right", "bottom-center", "top-center", "middle-center", "middle-left", "middle-right"],
    },
  },
  stampedDocumentUrl: {
    pdf: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  
}, { timestamps: true });

module.exports = mongoose.model("Meeting", meetingSchema);

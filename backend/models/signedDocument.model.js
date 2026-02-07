const mongoose = require("mongoose");

const signedDocumentSchema = new mongoose.Schema({
    meetingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting",
        // required: true,
    },
    WorkflowId: {
        type: Number,
        // required: true,
    },
    DocumentNumberList: {
        type: Array,
        // required: true,
    },
    DocumentIdList: [
        {
            type: Number,
            // required: true,
        }
    ],
    url: {
        type: String,
        // required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("SignedDocument", signedDocumentSchema);

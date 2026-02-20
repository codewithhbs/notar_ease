const APP_NAME = process.env.SIGNER_APP_NAME;
const SECRET_KEY = process.env.SIGNER_SECRET_KEY;
const AUTH_URL = process.env.SIGNER_AUTH_URL;
const SIGN_URL = process.env.SIGNER_SIGN_URL;
const DOWNLOAD_URL = process.env.SIGNER_DOWNLOAD_URL;

const axios = require("axios");
const getPdfPageSizes = require("./getPdfPageSizes");

let AUTH_TOKEN = null;
let TOKEN_EXPIRY = null;


async function generateAuthToken() {
    const res = await axios.post(AUTH_URL, {
        AppName: APP_NAME,
        SecretKey: SECRET_KEY,
    });

    if (!res.data?.Response?.AuthToken) {
        throw new Error("Failed to generate Auth Token");
    }

    AUTH_TOKEN = res.data.Response.AuthToken;
    TOKEN_EXPIRY = Date.now() + 55 * 60 * 1000; // ~55 min

    return AUTH_TOKEN;
}

async function getAuthToken() {
    if (!AUTH_TOKEN || Date.now() > TOKEN_EXPIRY) {
        return await generateAuthToken();
    }
    return AUTH_TOKEN;
}

async function pdfUrlToBase64(pdfUrl) {
    const res = await axios.get(pdfUrl, {
        responseType: "arraybuffer",
    });

    return Buffer.from(res.data).toString("base64");
}

function getPositionCoordinates(position) {
    const map = {
        "top-left": { Left: 7, Top: 760, Width: 390, Height: 65 },
        "top-center": { Left: 245, Top: 760, Width: 390, Height: 65 },
        "top-right": { Left: 390, Top: 760, Width: 390, Height: 65 },

        "middle-left": { Left: 20, Top: 452, Width: 140, Height: 377 },
        "middle-center": { Left: 246, Top: 451, Width: 366, Height: 376 },
        "middle-right": { Left: 468, Top: 451, Width: 588, Height: 376 },

        "bottom-left": { Left: 59, Top: 149, Width: 179, Height: 57 },
        "bottom-center": { Left: 210, Top: 144, Width: 346, Height: 52 },
        "bottom-right": { Left: 396, Top: 162, Width: 541, Height: 69 },
    };

    return map[position] || map["bottom-right"];
}

// ---------------- POSITION ENGINE ---------------- //

function scalePosition(pos, page) {
    const baseWidth = 800;   // coordinate tool reference
    const baseHeight = 1000;

    const scaleX = page.width / baseWidth;
    const scaleY = page.height / baseHeight;

    return {
        Left: Math.round(pos.Left * scaleX),
        Top: Math.round(pos.Top * scaleY),
        Width: Math.round(pos.Width * scaleX),
        Height: Math.round(pos.Height * scaleY),
    };
}


// 🔹 Dynamic Bottom-Left Grid
function getDynamicBottomLeftPosition(index, total) {
    const baseLeft = 60;
    const baseTop = 150;

    const maxPerRow = 4;      // 4 signatures per row
    const width = 130;
    const height = 60;

    const gapX = 10;
    const gapY = 70;

    const row = Math.floor(index / maxPerRow);
    const col = index % maxPerRow;

    return {
        Left: baseLeft + col * (width + gapX),
        Top: baseTop + row * gapY,
        Width: width,
        Height: height,
    };
}


// 🔹 Notary Fixed Bottom-Right
function getNotaryPosition() {
    return {
        Left: 500,   // adjust via coordinate tool
        Top: 150,
        Width: 180,
        Height: 60,
    };
}


async function buildSigningPayload(meeting) {

    const advocateEmail = meeting.advocateId.email;

    const signatoryEmails = [];
    const signatureSettings = [];
    const controlDetails = [];

    // 1️⃣ Download PDF
    const pdfRes = await axios.get(meeting.documentUrl.pdf, {
        responseType: "arraybuffer",
    });

    // 2️⃣ Page sizes
    const pageSizes = await getPdfPageSizes(pdfRes.data);

    // 3️⃣ Separate signers
    const notarySigner = meeting.signatories.find(
        s => s.role === "notary"
    );

    const normalSigners = meeting.signatories.filter(
        s => s.role !== "notary"
    );

    let allSignersOrdered = [...normalSigners];
    if (notarySigner) allSignersOrdered.push(notarySigner);


    // ---------------- LOOP ---------------- //

    allSignersOrdered.forEach((signer, index) => {

        signatoryEmails.push(signer.email);

        // 🔹 Signature Mode
        let signMode = "1";

        if (signer.signingMode === "adhaarESign") signMode = "12";
        else if (signer.signingMode === "dsc") signMode = "1";
        else if (signer.signingMode === "NEKYC") signMode = "3";

        signatureSettings.push({
            ModeOfSignature: signMode,
            Name: signer.name,
            ...(signer.DOB && { DOB: signer.DOB }),
            ...(signer.Gender && { Gender: signer.Gender }),
            MobileNo: signer.MobileNo,
            CountryCode: signer.CountryCode,
            Automatedsigningenabled: false,
        });


        // 🔥 MULTI-PAGE
        signer.PageNo.forEach((pageNo) => {

            const pageIndex = pageNo - 1;
            const page = pageSizes[pageIndex];
            if (!page) return;

            let rawPos;

            // ---------------- POSITION DECIDER ---------------- //

            if (signer.role === "notary") {

                rawPos = getNotaryPosition();

            } else {

                rawPos = getDynamicBottomLeftPosition(
                    index,
                    normalSigners.length
                );

            }

            // 🔹 Scale to page size
            const pos = scalePosition(rawPos, page);

            controlDetails.push({
                PageNo: String(pageNo),
                ControlID: 4,
                AssignedTo: index + 1,
                Left: pos.Left,
                Top: pos.Top,
                Width: pos.Width,
                Height: pos.Height,
            });

        });

    });


    // ---------------- BASE64 ---------------- //

    const base64PDF = Buffer.from(pdfRes.data).toString("base64");


    return {
        EmailId: advocateEmail,
        WorkflowType: "1",
        EnvelopeExpiry: 1,
        SignatoryEmailIds: signatoryEmails,
        SignatureSettings: signatureSettings,
        lstDocumentDetails: [
            {
                DocumentName: "document.pdf",
                FileData: base64PDF,
                ControlDetails: controlDetails,
            },
        ],
    };
}

async function initiateDocumentSigning(meeting) {
    const payload = await buildSigningPayload(meeting);
    console.log("Signing Payload =>", payload);

    let token = await getAuthToken();

    try {
        const res = await axios.post(SIGN_URL, payload, {
            headers: {
                Authorization: `basic ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("res.data", res.data)

        return res.data;
    } catch (err) {
        if (
            err.response?.data?.Message?.includes("Token Expired")
        ) {
            token = await generateAuthToken();

            const retry = await axios.post(SIGN_URL, payload, {
                headers: {
                    Authorization: `basic ${token}`,
                    "Content-Type": "application/json",
                },
            });

            return retry.data;
        }

        throw err;
    }
}

async function downloadSignedDocument(workflowId) {
    console.log("DOWNLOAD_URL =>", DOWNLOAD_URL);
    console.log("workflowId =>", workflowId);
    if (!workflowId) {
        throw new Error("WorkflowId is required");
    }

    let token = await getAuthToken();

    const payload = {
        WorkflowId: workflowId,
    };

    try {
        const res = await axios.post(DOWNLOAD_URL, payload, {
            headers: {
                Authorization: `basic ${token}`,
                "Content-Type": "application/json",
            },
        });

        return res.data;
    } catch (err) {
        // 🔁 TOKEN EXPIRED → regenerate & retry
        if (
            err.response?.data?.Message &&
            err.response.data.Message.includes("Token Expired")
        ) {
            token = await generateAuthToken();

            const retry = await axios.post(DOWNLOAD_URL, payload, {
                headers: {
                    Authorization: `basic ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (retry.data.IsSuccess === false) {
                throw new Error(retry.data.Message || "Failed to download signed document");
            }

            return retry.data;
        }

        throw err;
    }
}

module.exports = {
    initiateDocumentSigning,
    downloadSignedDocument
};

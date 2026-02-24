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

        "bottom-left": { Left: 18, Top: 198, Width: 91, Height: 135 },
        "bottom-center": { Left: 210, Top: 144, Width: 346, Height: 52 },
        "bottom-right": { Left: 380, Top: 112, Width: 500, Height: 26 },
    };

    return map[position] || map["bottom-right"];
}

// 🔥 MANUAL ADJUSTMENT MAP
function getManualAdjustments(position, count) {

    const manualAdjustMap = {

        "bottom-left": [
            { leftShift: 24, width: 109, height: 108, topShift: 186 },
            { leftShift: 127, width: 212, height: 111, topShift: 189 },
            { leftShift: 223, width: 308, height: 113, topShift: 191 },
            { leftShift: 15, width: 119, height: 25, topShift: 103 },
            { leftShift: 129, width: 233, height: 25, topShift: 103 },
            { leftShift: 239, width: 343, height: 25, topShift: 103 },
        ],

        "bottom-center": [
            { leftShift: 0, width: 346, height: 52, topShift: 0 },
            { leftShift: 360, width: 200, height: 52, topShift: 0 },
        ],

        "bottom-right": [
            { leftShift: 0, width: 541, height: 69, topShift: 0 },
            { leftShift: 560, width: 200, height: 69, topShift: 0 },
        ],

        "top-left": [
            { leftShift: 0, width: 390, height: 65, topShift: 0 },
            { leftShift: 400, width: 200, height: 65, topShift: 0 },
        ],
    };

    const layouts = manualAdjustMap[position];

    if (!layouts) return null;

    return layouts[count] || layouts[0];
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

    // 2️⃣ Get page sizes
    const pageSizes = await getPdfPageSizes(pdfRes.data);
    let signMode;

    // 🔥 TRACK SAME PAGE + SAME POSITION
    const positionTracker = {};

    meeting.signatories.forEach((signer, index) => {

        signatoryEmails.push(signer.email);

        let signMode = "";

        if (signer.signingMode === "adhaarESign") {
            signMode = "12";
        } else if (signer.signingMode === "dsc") {
            signMode = "1";
        } else if (signer.signingMode === "NEKYC") {
            signMode = "3";
        }

        signatureSettings.push({
            ModeOfSignature: signMode,
            Name: signer.name,
            ...(signer.DOB && { DOB: signer.DOB }),
            ...(signer.Gender && { Gender: signer.Gender }),
            MobileNo: signer.MobileNo,
            CountryCode: signer.CountryCode,
            Automatedsigningenabled: false,
        });

        // 🔥 MULTIPLE PAGES SUPPORT
        signer.PageNo.forEach((pageNo) => {

            const pageIndex = pageNo - 1;
            const page = pageSizes[pageIndex];
            if (!page) return;

            const basePos = getPositionCoordinates(signer.signPosition);

            const trackerKey = `${pageNo}-${signer.signPosition}`;

            if (!positionTracker[trackerKey]) {
                positionTracker[trackerKey] = 0;
            }

            const count = positionTracker[trackerKey];

            // 🔥 GET MANUAL ADJUSTMENT
            const manual = getManualAdjustments(
                signer.signPosition,
                count
            );

            // DEFAULT VALUES
            let adjustedLeft = basePos.Left;
            let adjustedTop = basePos.Top;
            let adjustedWidth = basePos.Width;
            let adjustedHeight = basePos.Height;

            if (manual) {
                adjustedLeft = basePos.Left + manual.leftShift;
                adjustedTop = basePos.Top + manual.topShift;
                adjustedWidth = manual.width;
                adjustedHeight = manual.height;
            }

            positionTracker[trackerKey]++;

            controlDetails.push({
                PageNo: String(pageNo),
                ControlID: 4,
                AssignedTo: index + 1,
                Left: Math.round(adjustedLeft),
                Top: Math.round(adjustedTop),
                Width: Math.round(adjustedWidth),
                Height: Math.round(adjustedHeight),
            });

        });
    });

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

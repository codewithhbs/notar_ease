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

function getPositionCoordinates(position, pageWidth, pageHeight) {
    const marginX = pageWidth * 0.05;   // 5% margin
    const marginY = pageHeight * 0.05;

    switch (position) {
        // 🔼 TOP
        case "top-left":
            return { Left: marginX, Top: marginY };

        case "top-center":
            return {
                Left: pageWidth / 2 - 100,
                Top: marginY,
            };

        case "top-right":
            return {
                Left: pageWidth - marginX - 200,
                Top: marginY,
            };

        // ⏺️ MIDDLE
        case "middle-left":
            return {
                Left: marginX,
                Top: pageHeight / 2 - 25,
            };

        case "middle-center":
            return {
                Left: pageWidth / 2 - 100,
                Top: pageHeight / 2 - 25,
            };

        case "middle-right":
            return {
                Left: pageWidth - marginX - 200,
                Top: pageHeight / 2 - 25,
            };

        // 🔽 BOTTOM
        case "bottom-left":
            return {
                Left: marginX,
                Top: pageHeight - marginY - 50,
            };

        case "bottom-center":
            return {
                Left: pageWidth / 2 - 100,
                Top: pageHeight - marginY - 50,
            };

        case "bottom-right":
            return {
                Left: pageWidth - marginX - 200,
                Top: pageHeight - marginY - 50,
            };

        default:
            return {
                Left: pageWidth - marginX - 200,
                Top: pageHeight - marginY - 50,
            };
    }
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

    if(meeting.signingMode === 'adhaarESign'){
        signMode = "12";
    } else if(meeting.signingMode === 'dsc'){
        signMode = "1";
    } else if(meeting.signingMode === 'NEKYC'){
        signMode = "3";
    }

    meeting.signatories.forEach((signer, index) => {
        signatoryEmails.push(signer.email);

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

            const pos = getPositionCoordinates(
                signer.signPosition,
                page.width,
                page.height
            );

            controlDetails.push({
                PageNo: String(pageNo),
                ControlID: 4,
                AssignedTo: index + 1,
                Left: Math.round(pos.Left),
                Top: Math.round(pos.Top),
                Width: 200,
                Height: 50,
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

    let token = await getAuthToken();

    try {
        const res = await axios.post(SIGN_URL, payload, {
            headers: {
                Authorization: `basic ${token}`,
                "Content-Type": "application/json",
            },
        });

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

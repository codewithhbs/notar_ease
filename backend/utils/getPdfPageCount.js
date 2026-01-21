const pdfParseLib = require("pdf-parse");

// 👇 handle both CJS & ESM builds safely
const pdfParse = typeof pdfParseLib === "function"
  ? pdfParseLib
  : pdfParseLib.default;

async function getPdfPageCount(buffer) {
  if (!buffer) {
    throw new Error("PDF buffer is required");
  }

  if (typeof pdfParse !== "function") {
    throw new Error("pdf-parse is not loaded correctly");
  }

  const data = await pdfParse(buffer);
  return data.numpages;
}

module.exports = getPdfPageCount;

const { PDFDocument } = require("pdf-lib");

async function getPdfPageSizes(pdfBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  return pages.map((page) => {
    const { width, height } = page.getSize();
    return { width, height };
  });
}

module.exports = getPdfPageSizes;

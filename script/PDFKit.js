const PDFDocument = require('pdfkit');
const fs = require("fs");

function generateCertificate(userData) {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
  });

  // Pipe the PDF into a file
  doc.pipe(fs.createWriteStream(`Certifikat_${userData.id}.pdf`));

  // Add background image
  doc.image("./assets/kryo-back.jpg", 0, 0, { width: 842 });

  // Set font and size
  doc
    .font("path/to/font.ttf")
    .fontSize(30)
    .text("Certifikát", 0, 100, { align: "center" });

  doc.fontSize(20).text(`Tímto potvrzujeme, že ${userData.name}`, 0, 200, {
    align: "center",
  });

  doc
    .fontSize(16)
    .text(`zakoupil/a poukaz na ${userData.voucherType}`, 0, 250, {
      align: "center",
    });

  doc
    .fontSize(14)
    .text(`Datum vydání: ${new Date().toLocaleDateString()}`, 0, 350, {
      align: "center",
    });

  // Add QR code or barcode if needed
  // doc.image('path/to/qrcode.png', 700, 350, {width: 100});

  // Finalize the PDF and end the stream
  doc.end();
}

// Usage
document.getElementById("payment-button").addEventListener(
  "click",
  generateCertificate({
    id: "12345",
    name: "Jan Novák",
    voucherType: "Celotělovou kryoterapii",
  })
);

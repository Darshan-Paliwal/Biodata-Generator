import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, age, education, occupation, address, phone, email, imageBase64 } = req.body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([24000, 18000]); // A4 portrait (width x height in points)
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Title
    page.drawText("Biodata", {
      x: width / 2 - 40,
      y: height - 60,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    // Left side text
    let textY = height - 100;
    const lineHeight = 20;
    const details = [
      `Name: ${name}`,
      `Age: ${age}`,
      `Education: ${education}`,
      `Occupation: ${occupation}`,
      `Address: ${address}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
    ];

    details.forEach((line) => {
      page.drawText(line, {
        x: 50,
        y: textY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      textY -= lineHeight;
    });

    // Right side image box (half of the page width)
    if (imageBase64) {
      const base64Data = imageBase64.split(",")[1];
      let image;
      if (imageBase64.startsWith("data:image/png")) {
        image = await pdfDoc.embedPng(base64Data);
      } else {
        image = await pdfDoc.embedJpg(base64Data);
      }

      const imgDims = image.scale(1);

      const boxX = width * 0.55;
      const boxY = 100;
      const boxWidth = width * 0.35;
      const boxHeight = height - 200;

      // Scale proportionally
      let scale = Math.min(boxWidth / imgDims.width, boxHeight / imgDims.height);
      const imgWidth = imgDims.width * scale;
      const imgHeight = imgDims.height * scale;

      // Center inside box
      const imgX = boxX + (boxWidth - imgWidth) / 2;
      const imgY = boxY + (boxHeight - imgHeight) / 2;

      page.drawImage(image, {
        x: imgX,
        y: imgY,
        width: imgWidth,
        height: imgHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=biodata.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
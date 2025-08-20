import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    // A4 page
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Title
    page.drawText("Biodata", {
      x: 230,
      y: height - 60,
      size: 22,
      font,
      color: rgb(0, 0, 0),
    });

    // --- Image reserved box (same as sample image you shared) ---
    const boxX = 400;
    const boxY = height - 350;
    const boxWidth = 150;
    const boxHeight = 200;

    // Handle photo
    if (data.photo) {
      try {
        const imgBytes = Uint8Array.from(atob(data.photo), (c) =>
          c.charCodeAt(0)
        );

        let img;
        if (data.photo.startsWith("/9j/")) {
          img = await pdfDoc.embedJpg(imgBytes);
        } else {
          img = await pdfDoc.embedPng(imgBytes);
        }

        // natural dimensions
        const { width: imgW, height: imgH } = img.size();

        // scale proportionally to fit inside the box
        const scale = Math.min(boxWidth / imgW, boxHeight / imgH, 1);

        const finalWidth = imgW * scale;
        const finalHeight = imgH * scale;

        // center inside reserved box
        const offsetX = boxX + (boxWidth - finalWidth) / 2;
        const offsetY = boxY + (boxHeight - finalHeight) / 2;

        page.drawImage(img, {
          x: offsetX,
          y: offsetY,
          width: finalWidth,
          height: finalHeight,
        });
      } catch (err) {
        console.error("Image embedding failed:", err.message);
      }
    }

    // Left-side details
    let y = height - 110;
    const gap = 22;

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "photo" && value) {
        page.drawText(`${key}: ${value}`, {
          x: 50,
          y,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
        y -= gap;
      }
    });

    // Save & send
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=biodata.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
}
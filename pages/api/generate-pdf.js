import { jsPDF } from "jspdf";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { formData, image } = req.body;

      // Create high-resolution PDF with bigger page size
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [2400, 1800], // custom dimensions
      });

      // Title
      doc.setFontSize(48);
      doc.text("Biodata", 100, 100);

      // Add biodata text (left side)
      doc.setFontSize(28);
      let y = 200;
      for (const [key, value] of Object.entries(formData)) {
        doc.text(`${key}: ${value}`, 100, y);
        y += 50;
      }

      // If image exists
      if (image) {
        const img = new Image();
        img.src = image;

        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
        });

        // Reserved area for image (right side)
        const boxX = 1600;
        const boxY = 200;
        const boxWidth = 600;
        const boxHeight = 1000;

        const imgWidth = img.width;
        const imgHeight = img.height;

        // Scale image proportionally to fit inside reserved box
        const scale = Math.min(boxWidth / imgWidth, boxHeight / imgHeight);

        const finalWidth = imgWidth * scale;
        const finalHeight = imgHeight * scale;

        // Center image inside reserved box
        const offsetX = boxX + (boxWidth - finalWidth) / 2;
        const offsetY = boxY + (boxHeight - finalHeight) / 2;

        doc.addImage(img, "JPEG", offsetX, offsetY, finalWidth, finalHeight);
      }

      const pdfData = doc.output("arraybuffer");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=biodata.pdf");
      res.send(Buffer.from(pdfData));
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
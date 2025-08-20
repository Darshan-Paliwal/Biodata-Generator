import { jsPDF } from "jspdf";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { formData, image } = req.body;

      // High-resolution PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [2400, 1800],
      });

      // Title
      doc.setFontSize(80);
      doc.text("Biodata", 100, 150);

      // Add form data
      doc.setFontSize(48);
      let y = 300;
      for (const [key, value] of Object.entries(formData)) {
        doc.text(`${key}: ${value}`, 100, y);
        y += 70;
      }

      // Add Image (if provided)
      if (image) {
        try {
          // Force image type detection
          let imgType = "JPEG";
          if (image.startsWith("data:image/png")) imgType = "PNG";

          // Reserved box for image
          const boxX = 1600;
          const boxY = 300;
          const boxWidth = 700;
          const boxHeight = 1000;

          // jsPDF auto-scales base64 images if we give width/height
          doc.addImage(image, imgType, boxX, boxY, boxWidth, boxHeight);
        } catch (err) {
          console.error("Error adding image:", err);
        }
      }

      // Send PDF
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
import { jsPDF } from "jspdf";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { formData, image } = req.body;

      // Large high-res PDF (landscape)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [2400, 1800],
      });

      // Title centered at top
      doc.setFontSize(100);
      doc.text("Biodata", 1200, 150, { align: "center" });

      // Left column for text
      doc.setFontSize(60);
      let y = 350;
      for (const [key, value] of Object.entries(formData)) {
        doc.text(`${key}: ${value}`, 200, y);
        y += 90; // line spacing
      }

      // Right column for image
      if (image) {
        try {
          let imgType = "JPEG";
          if (image.startsWith("data:image/png")) imgType = "PNG";

          // Reserve big area for image
          const imgX = 1400;
          const imgY = 300;
          const imgW = 800; // scale nicely
          const imgH = 1000;

          doc.addImage(image, imgType, imgX, imgY, imgW, imgH);
        } catch (err) {
          console.error("Error adding image:", err);
        }
      }

      // Send PDF back
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
import { jsPDF } from "jspdf";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { formData, image } = req.body;

      // Use A4 in landscape → safe & looks consistent
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Title
      doc.setFontSize(28);
      doc.text("Biodata", pageWidth / 2, 60, { align: "center" });

      // Left column text
      doc.setFontSize(16);
      let y = 120;
      for (const [key, value] of Object.entries(formData)) {
        doc.text(`${key}: ${value}`, 80, y);
        y += 28;
      }

      // Right column image
      if (image) {
        try {
          let imgType = "JPEG";
          if (image.startsWith("data:image/png")) imgType = "PNG";

          // Image box on the right half
          const imgW = 250;
          const imgH = 300;
          const imgX = pageWidth - imgW - 80;
          const imgY = 120;

          doc.addImage(image, imgType, imgX, imgY, imgW, imgH);
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
import { jsPDF } from "jspdf";

export default async function handler(req, res) {
  try {
    // Create PDF with custom large dimensions (2400x1800 points)
    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: [2400, 1800]
    });

    // Example text
    doc.setFontSize(60);
    doc.text("Darshan Paliwal - CV", 100, 150);

    // Example image placement (replace with req.body.image if dynamic)
    // Make sure you pass Base64 image when calling this API
    if (req.body?.image) {
      const img = req.body.image; // Base64 string like: "data:image/png;base64,...."
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Put image inside, scaled properly
      doc.addImage(img, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
    }

    // Generate PDF as ArrayBuffer
    const pdfBuffer = doc.output("arraybuffer");

    // ✅ Important headers for browser to download PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=biodata.pdf");
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
import { jsPDF } from "jspdf";

export default async function handler(req, res) {
  try {
    // Create PDF (large size)
    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: [2400, 1800],
    });

    // Add test text
    doc.setFontSize(60);
    doc.text("Darshan Paliwal - CV", 100, 150);

    // If image provided in POST body, add it
    if (req.method === "POST" && req.body?.image) {
      const img = req.body.image; // Base64 string (data:image/png;base64,...)

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Scale to fit page while keeping ratio
      const imgProps = doc.getImageProperties(img);
      const imgRatio = imgProps.width / imgProps.height;
      const pageRatio = pageWidth / pageHeight;

      let renderWidth, renderHeight, x, y;

      if (imgRatio > pageRatio) {
        // Image is wider → fit width
        renderWidth = pageWidth;
        renderHeight = pageWidth / imgRatio;
        x = 0;
        y = (pageHeight - renderHeight) / 2;
      } else {
        // Image is taller → fit height
        renderHeight = pageHeight;
        renderWidth = pageHeight * imgRatio;
        x = (pageWidth - renderWidth) / 2;
        y = 0;
      }

      doc.addImage(img, "PNG", x, y, renderWidth, renderHeight, undefined, "FAST");
    }

    // Output PDF as Node Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Set proper headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=biodata.pdf");

    return res.end(pdfBuffer); // ✅ send as PDF, not JSON
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
}
import { jsPDF } from "jspdf";

export default function DownloadPDF({ image }) {
  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: [2400, 1800], // High resolution
    });

    // Add title
    doc.setFontSize(60);
    doc.text("Darshan Paliwal - Biodata", 100, 150);

    if (image) {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const imgProps = doc.getImageProperties(image);
      const imgRatio = imgProps.width / imgProps.height;
      const pageRatio = pageWidth / pageHeight;

      let renderWidth, renderHeight, x, y;

      if (imgRatio > pageRatio) {
        renderWidth = pageWidth;
        renderHeight = pageWidth / imgRatio;
        x = 0;
        y = (pageHeight - renderHeight) / 2;
      } else {
        renderHeight = pageHeight;
        renderWidth = pageHeight * imgRatio;
        x = (pageWidth - renderWidth) / 2;
        y = 0;
      }

      doc.addImage(image, "PNG", x, y, renderWidth, renderHeight, undefined, "FAST");
    }

    // Download directly in browser
    doc.save("biodata.pdf");
  };

  return (
    <button
      onClick={handleDownload}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
    >
      Download PDF
    </button>
  );
}
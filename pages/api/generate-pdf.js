import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const {
    name, birthName, dob, birthTime, birthPlace, district,
    gotra, height, bloodGroup, qualification, occupation,
    fatherName, motherName, sisterName, residence,
    permanentAddress, mobileMother, mobileMama,
    photo, photoType
  } = req.body;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([800, 600]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Title
  page.drawText(`BIO DATA : ${name}`, {
    x: 250,
    y: 550,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });

  // Left column details
  const details = [
    ["Name", name],
    ["Birth Name", birthName],
    ["DOB", dob],
    ["Birth time", birthTime],
    ["Birth Place", birthPlace],
    ["District", district],
    ["Gotra", gotra],
    ["Height", height],
    ["Blood Group", bloodGroup],
    ["Qualification", qualification],
    ["Occupation", occupation],
    ["Father Name", fatherName],
    ["Mother Name", motherName],
    ["Sister Name", sisterName],
    ["Residence", residence],
    ["Permanent Address", permanentAddress],
    ["Mobile Number (Mother)", mobileMother],
    ["Mobile Number (Mama)", mobileMama],
  ];

  let y = 500;
  details.forEach(([label, value]) => {
    page.drawText(`• ${label} : ${value || "-"}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 25;
  });

  // Add Photo (handles JPG, PNG, WebP etc.)
  if (photo && photoType) {
    try {
      const imageBytes = Buffer.from(photo, "base64");
      let img;
      if (photoType.includes("png")) {
        img = await pdfDoc.embedPng(imageBytes);
      } else if (photoType.includes("jpeg") || photoType.includes("jpg")) {
        img = await pdfDoc.embedJpg(imageBytes);
      } else if (photoType.includes("webp")) {
        // pdf-lib doesn’t support webp directly → quick fallback: convert on client
        // (For now, we’ll just ignore unsupported types)
        console.warn("WebP not supported by pdf-lib directly");
      }

      if (img) {
        const { width, height } = img.scale(0.25);
        page.drawImage(img, {
          x: 550,
          y: 250,
          width,
          height,
        });
      }
    } catch (e) {
      console.error("Error embedding photo:", e);
    }
  }

  const pdfBytes = await pdfDoc.save();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=biodata.pdf");
  res.send(Buffer.from(pdfBytes));
}
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { name, age, education, occupation, address } = req.body;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("Biodata", { x: 250, y: 350, size: 20, font, color: rgb(0, 0, 0.8) });
  page.drawText(`Name: ${name}`, { x: 50, y: 300, size: 14, font });
  page.drawText(`Age: ${age}`, { x: 50, y: 270, size: 14, font });
  page.drawText(`Education: ${education}`, { x: 50, y: 240, size: 14, font });
  page.drawText(`Occupation: ${occupation}`, { x: 50, y: 210, size: 14, font });
  page.drawText(`Address: ${address}`, { x: 50, y: 180, size: 14, font });

  const pdfBytes = await pdfDoc.save();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=biodata.pdf");
  res.send(Buffer.from(pdfBytes));
}
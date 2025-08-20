import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req) {
  try {
    const data = await req.json();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Title
    page.drawText("Biodata", {
      x: 230,
      y: height - 50,
      size: 22,
      font,
      color: rgb(0, 0, 0),
    });

    // Draw photo box (fixed boundary)
    const boxX = 400;
    const boxY = height - 350;
    const boxWidth = 150;
    const boxHeight = 200;

    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Insert photo if provided
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

        const imgDims = img.scale(1);
        const scale = Math.min(
          boxWidth / imgDims.width,
          boxHeight / imgDims.height
        );

        const finalWidth = imgDims.width * scale;
        const finalHeight = imgDims.height * scale;

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

    // Draw text fields
    let y = height - 100;
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

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=biodata.pdf",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { PDFDocument } from "pdf-lib";
import { SignaturePosition } from "../types";

export async function signPDF(
  pdfFile: File,
  signatureImage: string,
  signaturePositions: SignaturePosition[],
  pdfPages: number,
  pageImageRefs: { [key: number]: HTMLImageElement }
): Promise<Blob> {
  // Load the original PDF
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Load the signature image
  let signatureBytes: ArrayBuffer;
  if (signatureImage.startsWith("data:")) {
    const response = await fetch(signatureImage);
    signatureBytes = await response.arrayBuffer();
  } else {
    signatureBytes = await fetch(signatureImage).then((res) =>
      res.arrayBuffer()
    );
  }
  const signatureImagePdf = await pdfDoc.embedPng(signatureBytes);

  // Create signed images for each page
  const signedImages: { [pageNum: number]: string } = {};

  // Process each page that has signatures
  for (const position of signaturePositions) {
    const pageNum = position.pageNumber;
    if (signedImages[pageNum]) continue;

    const pageImage = pageImageRefs[pageNum];
    if (!pageImage) continue;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await new Promise((resolve) => {
      if (pageImage.complete) {
        resolve(null);
      } else {
        pageImage.onload = () => resolve(null);
      }
    });

    canvas.width = pageImage.width;
    canvas.height = pageImage.height;

    ctx.drawImage(pageImage, 0, 0);

    const pageSignatures = signaturePositions.filter(
      (pos) => pos.pageNumber === pageNum
    );

    for (const sigPos of pageSignatures) {
      const sigImg = new Image();
      await new Promise((resolve) => {
        sigImg.onload = () => resolve(null);
        sigImg.src = signatureImage;
      });

      const sigWidth = canvas.width * sigPos.width;
      const sigHeight = canvas.height * sigPos.height;
      const sigX = canvas.width * sigPos.x;
      const sigY = canvas.height * sigPos.y;

      ctx.drawImage(sigImg, sigX, sigY, sigWidth, sigHeight);
    }

    signedImages[pageNum] = canvas.toDataURL("image/png", 1.0);
  }

  // Embed the signed images back into the PDF
  for (let pageNum = 1; pageNum <= pdfPages; pageNum++) {
    const page = pdfDoc.getPage(pageNum - 1);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    if (signedImages[pageNum]) {
      const signedImageData = signedImages[pageNum];
      const response = await fetch(signedImageData);
      const imageBytes = await response.arrayBuffer();
      const signedImagePdf = await pdfDoc.embedPng(imageBytes);

      page.drawImage(signedImagePdf, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    } else {
      const pageSignatures = signaturePositions.filter(
        (pos) => pos.pageNumber === pageNum
      );

      for (const position of pageSignatures) {
        const signatureWidth = pageWidth * position.width;
        const signatureHeight = pageHeight * position.height;
        const x = pageWidth * position.x;
        const y = pageHeight * (1 - position.y) - signatureHeight;

        page.drawImage(signatureImagePdf, {
          x,
          y,
          width: signatureWidth,
          height: signatureHeight,
        });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
}


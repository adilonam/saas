"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "components/Header";
import Footer from "components/Footer";
import TopBar from "components/sign-pdf/TopBar";
import PDFViewer from "components/sign-pdf/PDFViewer";
import SignatureOptionsPanel from "components/sign-pdf/SignatureOptionsPanel";
import SignatureCanvasModal from "components/sign-pdf/SignatureCanvasModal";
import InitialsCanvasModal from "components/sign-pdf/InitialsCanvasModal";
import { usePDFConversion } from "components/sign-pdf/hooks/usePDFConversion";
import { signPDF } from "components/sign-pdf/utils/pdfSigning";
import { SignaturePosition } from "components/sign-pdf/types";

export default function SignPDFPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [signatureType, setSignatureType] = useState<"simple" | "digital">(
    "simple"
  );
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signaturePositions, setSignaturePositions] = useState<
    SignaturePosition[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [showInitialsCanvas, setShowInitialsCanvas] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    pdfFile,
    pdfPageImages,
    isLoading: isConverting,
    pdfPages,
    pageImageRefs,
    handleFileChange,
  } = usePDFConversion();

  const [isDraggingNewSignature, setIsDraggingNewSignature] = useState(false);

  // Cleanup image URLs
  useEffect(() => {
    return () => {
      pdfPageImages.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      if (signatureImage && signatureImage.startsWith("blob:")) {
        URL.revokeObjectURL(signatureImage);
      }
    };
  }, [pdfPageImages, signatureImage]);

  const handleSignatureSave = (imageData: string) => {
    setSignatureImage(imageData);
  };

  const handleRemoveSignature = (index: number) => {
    setSignaturePositions(signaturePositions.filter((_, i) => i !== index));
  };

  const downloadSignedPDF = async () => {
    if (status === "unauthenticated" || !session) {
      router.push("/signin");
      return;
    }

    if (!pdfFile || !signatureImage || signaturePositions.length === 0) {
      alert("Please upload a PDF, create a signature, and place it on the PDF");
      return;
    }

    try {
      setIsLoading(true);
      const blob = await signPDF(
        pdfFile,
        signatureImage,
        signaturePositions,
        pdfPages,
        pageImageRefs.current
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFile.name.replace(".pdf", "_signed.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error signing PDF:", error);
      alert("Error signing PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="grow flex flex-col overflow-hidden">
        <TopBar
          pdfFile={pdfFile}
          currentPage={currentPage}
          pdfPages={pdfPages}
          onPageChange={setCurrentPage}
        />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <PDFViewer
            pdfFile={pdfFile}
            pdfPageImages={pdfPageImages}
            currentPage={currentPage}
            pdfPages={pdfPages}
            isLoading={isConverting}
            signatureImage={signatureImage}
            signaturePositions={signaturePositions}
            onFileChange={handleFileChange}
            onPageChange={setCurrentPage}
            onPositionUpdate={setSignaturePositions}
            onRemoveSignature={handleRemoveSignature}
          />

          <SignatureOptionsPanel
            signatureType={signatureType}
            onSignatureTypeChange={setSignatureType}
            signatureImage={signatureImage}
            isDragging={isDraggingNewSignature}
            onEditSignature={() => setShowSignatureCanvas(true)}
            onDragStart={(e) => {
              if (!signatureImage) return;
              setIsDraggingNewSignature(true);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", "");
            }}
            onDragEnd={() => setIsDraggingNewSignature(false)}
            onTouchStart={(e) => {
              if (!signatureImage) return;
              setIsDraggingNewSignature(true);
              e.preventDefault();
            }}
            onTouchMove={(e) => {
              if (isDraggingNewSignature) {
                e.preventDefault();
              }
            }}
            onSign={downloadSignedPDF}
            canSign={
              !!pdfFile &&
              !!signatureImage &&
              signaturePositions.length > 0 &&
              !isLoading
            }
          />
        </div>
      </main>

      <SignatureCanvasModal
        isOpen={showSignatureCanvas}
        onClose={() => setShowSignatureCanvas(false)}
        onSave={handleSignatureSave}
      />

      <InitialsCanvasModal
        isOpen={showInitialsCanvas}
        onClose={() => setShowInitialsCanvas(false)}
        onSave={(imageData) => {
          // Handle initials save if needed
          console.log("Initials saved:", imageData);
        }}
      />

      <Footer />
    </div>
  );
}

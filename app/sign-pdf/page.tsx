"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "components/Header";
import Footer from "components/Footer";
import {
  HiArrowLeft,
  HiDownload,
  HiTrash,
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiPencil,
} from "react-icons/hi";
import { AiOutlineUndo } from "react-icons/ai";
import { PDFDocument } from "pdf-lib";
import {
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { FaStamp } from "react-icons/fa";
import { HiOutlinePencil as HiPencilOutline } from "react-icons/hi2";

interface SignaturePosition {
  x: number;
  y: number;
  pageNumber: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export default function SignPDFPage() {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPageImages, setPdfPageImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState<"simple" | "digital">(
    "simple"
  );
  const [signatureText, setSignatureText] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [initials, setInitials] = useState("");
  const [initialsImage, setInitialsImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [companyStamp, setCompanyStamp] = useState<string | null>(null);
  const [signaturePositions, setSignaturePositions] = useState<
    SignaturePosition[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSignatureIndex, setDraggedSignatureIndex] = useState<
    number | null
  >(null);
  const [isDraggingNewSignature, setIsDraggingNewSignature] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfPages, setPdfPages] = useState(1);
  const [penSize, setPenSize] = useState(3);
  const [canUndo, setCanUndo] = useState(false);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [showInitialsCanvas, setShowInitialsCanvas] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialsCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const initialsHistoryRef = useRef<ImageData[]>([]);
  const signaturePreviewRef = useRef<HTMLDivElement>(null);
  const pageImageRefs = useRef<{ [key: number]: HTMLImageElement }>({});

  useEffect(() => {
    return () => {
      // Cleanup image URLs
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

  // Convert PDF to images using API
  const convertPdfToImages = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/fast-api/v1/pdf-to-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || errorData.error || "Failed to convert PDF"
        );
      }

      const data = await response.json();

      if (data.pages && Array.isArray(data.pages)) {
        setPdfPages(data.total_pages);

        // Extract images from pages array
        const images = data.pages
          .sort((a: any, b: any) => a.page_number - b.page_number)
          .map((page: any) => page.image);

        setPdfPageImages(images);

        // Store image references for later use
        images.forEach((imageDataUrl: string, index: number) => {
          const img = new Image();
          img.src = imageDataUrl;
          pageImageRefs.current[index + 1] = img;
        });

        setCurrentPage(1);
        setSignaturePositions([]);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error loading PDF. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      await convertPdfToImages(file);
    } else {
      alert("Please select a valid PDF file");
    }
  };

  // Save canvas state for undo
  const saveState = (isInitials = false) => {
    const canvas = isInitials ? initialsCanvasRef.current : canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const history = isInitials ? initialsHistoryRef : historyRef;
    history.current.push(imageData);
    if (history.current.length > 10) {
      history.current.shift();
    }
    if (!isInitials) setCanUndo(true);
  };

  // Get point from mouse or touch event
  const getPoint = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
    isInitials = false
  ): Point | null => {
    const canvas = isInitials ? initialsCanvasRef.current : canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number, pressure: number;

    if ("touches" in e) {
      // Touch event
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Try to get pressure from touch event (if supported)
      pressure = (e.touches[0] as any).force || 0.5;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
      pressure = 0.5; // Default pressure for mouse
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure: Math.max(0.1, Math.min(1, pressure)),
      timestamp: Date.now(),
    };
  };

  // Calculate line width based on speed and pressure
  const calculateLineWidth = (
    point: Point,
    lastPoint: Point | null
  ): number => {
    if (!lastPoint) return penSize;

    const distance = Math.sqrt(
      Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
    );
    const timeDelta = point.timestamp - lastPoint.timestamp;
    const speed = timeDelta > 0 ? distance / timeDelta : 0;

    // Faster drawing = thinner line, slower = thicker
    // Also factor in pressure
    const speedFactor = Math.max(0.3, Math.min(1.5, 1 - speed * 0.5));
    const pressureFactor = point.pressure;

    return penSize * speedFactor * pressureFactor;
  };

  // Draw smooth curve using quadratic bezier
  const drawSmoothCurve = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const currentPoint = points[i];
      const previousPoint = points[i - 1];
      const nextPoint = points[i + 1];

      if (nextPoint) {
        // Use quadratic curve for smooth transitions
        const midX = (currentPoint.x + nextPoint.x) / 2;
        const midY = (currentPoint.y + nextPoint.y) / 2;
        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
      } else {
        // Last point, draw to it
        ctx.lineTo(currentPoint.x, currentPoint.y);
      }
    }

    ctx.stroke();
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
    isInitials = false
  ) => {
    e.preventDefault();

    const point = getPoint(e, isInitials);
    if (!point) return;

    saveState(isInitials);
    setIsDrawing(true);
    pointsRef.current = [point];
    lastPointRef.current = point;

    const canvas = isInitials ? initialsCanvasRef.current : canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
    isInitials = false
  ) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getPoint(e, isInitials);
    if (!point) return;

    const canvas = isInitials ? initialsCanvasRef.current : canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    pointsRef.current.push(point);

    // Draw smooth curves every few points for better performance
    if (pointsRef.current.length >= 3) {
      const lineWidth = calculateLineWidth(point, lastPointRef.current);

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";

      // Draw the smooth curve
      drawSmoothCurve(ctx, pointsRef.current.slice(-3));

      // Keep only last few points for smooth continuation
      if (pointsRef.current.length > 5) {
        pointsRef.current = pointsRef.current.slice(-3);
      }
    }

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      pointsRef.current = [];
      lastPointRef.current = null;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
    }
  };

  const undo = (isInitials = false) => {
    const history = isInitials ? initialsHistoryRef : historyRef;
    if (history.current.length === 0) return;

    const canvas = isInitials ? initialsCanvasRef.current : canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    history.current.pop();
    const previousState = history.current[history.current.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (!isInitials) setCanUndo(history.current.length > 0);
  };

  const clearSignature = (isInitials = false) => {
    const canvas = isInitials ? initialsCanvasRef.current : canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveState(isInitials);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isInitials) {
      setInitialsImage(null);
      initialsHistoryRef.current = [];
    } else {
      setSignatureImage(null);
      setSignatureText("");
      historyRef.current = [];
      setCanUndo(false);
    }
  };

  const generateTextSignature = () => {
    if (!signatureText.trim()) return;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = "48px 'Brush Script MT', cursive";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL();
    setSignatureImage(dataUrl);
  };

  const saveSignatureAsImage = (isInitials = false) => {
    const canvas = isInitials ? initialsCanvasRef.current : canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png", 1.0);

    if (isInitials) {
      setInitialsImage(dataUrl);
      initialsHistoryRef.current = [];
    } else {
      setSignatureImage(dataUrl);
      historyRef.current = [];
      setCanUndo(false);
    }
    if (isInitials) {
      setShowInitialsCanvas(false);
    } else {
      setShowSignatureCanvas(false);
    }
  };

  // Drag and drop handlers for signature
  const handleDragStart = (e: React.DragEvent) => {
    if (!signatureImage) return;
    setIsDraggingNewSignature(true);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleSignatureDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedSignatureIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `signature-${index}`);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDraggingNewSignature(false);
    setDraggedSignatureIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!signatureImage || !pdfContainerRef.current) return;

    const container = pdfContainerRef.current;
    const imgElement = container.querySelector("img") as HTMLImageElement;
    if (!imgElement) return;

    const containerRect = container.getBoundingClientRect();
    const imgRect = imgElement.getBoundingClientRect();

    const dropX = e.clientX - imgRect.left;
    const dropY = e.clientY - imgRect.top;

    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    const sigWidth = 0.15;
    const sigHeight = 0.1;

    const normalizedX = Math.max(
      0,
      Math.min(1 - sigWidth, dropX / imgWidth - sigWidth / 2)
    );
    const normalizedY = Math.max(
      0,
      Math.min(1 - sigHeight, dropY / imgHeight - sigHeight / 2)
    );

    if (draggedSignatureIndex !== null) {
      const updatedPositions = [...signaturePositions];
      updatedPositions[draggedSignatureIndex] = {
        ...updatedPositions[draggedSignatureIndex],
        x: normalizedX,
        y: normalizedY,
        pageNumber: currentPage,
      };
      setSignaturePositions(updatedPositions);
    } else {
      const newPosition: SignaturePosition = {
        x: normalizedX,
        y: normalizedY,
        pageNumber: currentPage,
        width: sigWidth,
        height: sigHeight,
      };
      setSignaturePositions([...signaturePositions, newPosition]);
    }

    setIsDragging(false);
    setIsDraggingNewSignature(false);
    setDraggedSignatureIndex(null);
  };

  const removeSignature = (index: number) => {
    setSignaturePositions(signaturePositions.filter((_, i) => i !== index));
  };

  const downloadSignedPDF = async () => {
    if (!pdfFile || !signatureImage || signaturePositions.length === 0) {
      alert("Please upload a PDF, create a signature, and place it on the PDF");
      return;
    }

    try {
      setIsLoading(true);

      // Load the original PDF
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Load the signature image
      let signatureBytes: ArrayBuffer;
      if (signatureImage.startsWith("data:")) {
        // Handle data URL
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
        if (signedImages[pageNum]) continue; // Already processed

        // Get the original page image
        const pageImage = pageImageRefs.current[pageNum];
        if (!pageImage) continue;

        // Create a canvas to draw the page image with signatures
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // Wait for image to load
        await new Promise((resolve) => {
          if (pageImage.complete) {
            resolve(null);
          } else {
            pageImage.onload = () => resolve(null);
          }
        });

        canvas.width = pageImage.width;
        canvas.height = pageImage.height;

        // Draw the page image
        ctx.drawImage(pageImage, 0, 0);

        // Draw all signatures for this page
        const pageSignatures = signaturePositions.filter(
          (pos) => pos.pageNumber === pageNum
        );

        for (const sigPos of pageSignatures) {
          // Load signature image
          const sigImg = new Image();
          await new Promise((resolve) => {
            sigImg.onload = () => resolve(null);
            sigImg.src = signatureImage;
          });

          // Calculate signature size and position on canvas
          const sigWidth = canvas.width * sigPos.width;
          const sigHeight = canvas.height * sigPos.height;
          const sigX = canvas.width * sigPos.x;
          const sigY = canvas.height * sigPos.y;

          // Draw signature
          ctx.drawImage(sigImg, sigX, sigY, sigWidth, sigHeight);
        }

        // Convert canvas to image data URL
        signedImages[pageNum] = canvas.toDataURL("image/png", 1.0);
      }

      // Now embed the signed images back into the PDF
      for (let pageNum = 1; pageNum <= pdfPages; pageNum++) {
        const page = pdfDoc.getPage(pageNum - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();

        if (signedImages[pageNum]) {
          // Use the signed image
          const signedImageData = signedImages[pageNum];
          const response = await fetch(signedImageData);
          const imageBytes = await response.arrayBuffer();
          const signedImagePdf = await pdfDoc.embedPng(imageBytes);

          // Remove existing content and draw the signed image
          page.drawImage(signedImagePdf, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        } else {
          // Keep original page, but add any signatures that might be on it
          const pageSignatures = signaturePositions.filter(
            (pos) => pos.pageNumber === pageNum
          );

          for (const position of pageSignatures) {
            const signatureWidth = pageWidth * position.width;
            const signatureHeight = pageHeight * position.height;
            const x = pageWidth * position.x;
            const y = pageHeight * (1 - position.y) - signatureHeight; // PDF coordinates are bottom-up

            page.drawImage(signatureImagePdf, {
              x,
              y,
              width: signatureWidth,
              height: signatureHeight,
            });
          }
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      // Download
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
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <HiArrowLeft
                size={20}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
            {pdfFile && (
              <select
                defaultValue={pdfFile.name}
                disabled
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-default"
              >
                <option>{pdfFile.name}</option>
              </select>
            )}
          </div>
          {pdfPages > 1 && pdfFile && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <HiChevronLeft
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3">
                {currentPage} / {pdfPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(pdfPages, currentPage + 1))
                }
                disabled={currentPage === pdfPages}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <HiChevronRight
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - PDF Viewer */}
          <div className="flex-1 flex overflow-hidden bg-gray-100 dark:bg-gray-900">
            {/* Thumbnails Sidebar */}
            {pdfPageImages.length > 0 && (
              <div className="w-24 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
                <div className="p-2 space-y-2">
                  {pdfPageImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-full aspect-[3/4] relative rounded border-2 overflow-hidden transition ${
                        currentPage === index + 1
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main PDF View */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!pdfFile ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Drag and drop a PDF file here, or click to select
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                      Select PDF File
                    </button>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Converting PDF to images...
                  </p>
                </div>
              ) : (
                <div
                  ref={pdfContainerRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-4"
                >
                  <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-lg relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pdfPageImages[currentPage - 1]}
                      alt={`PDF Page ${currentPage}`}
                      className="w-full h-auto"
                    />
                    {signaturePositions
                      .map((position, originalIndex) => ({
                        position,
                        originalIndex,
                      }))
                      .filter(
                        ({ position }) => position.pageNumber === currentPage
                      )
                      .map(({ position, originalIndex }) => (
                        <div
                          key={originalIndex}
                          draggable
                          onDragStart={(e) =>
                            handleSignatureDragStart(e, originalIndex)
                          }
                          onDragEnd={handleDragEnd}
                          className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 rounded cursor-move hover:bg-red-500 hover:bg-opacity-30 transition"
                          style={{
                            left: `${position.x * 100}%`,
                            top: `${position.y * 100}%`,
                            width: `${position.width * 100}%`,
                            height: `${position.height * 100}%`,
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSignature(originalIndex);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                          >
                            <HiX size={14} />
                          </button>
                          {signatureImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={signatureImage}
                              alt="Signature"
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Signature Options */}
          <div className="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Signature Options
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Signature Type Selection */}
              <div>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setSignatureType("simple")}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                      signatureType === "simple"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <HiPencil
                      size={24}
                      className={
                        signatureType === "simple"
                          ? "text-red-500"
                          : "text-gray-400"
                      }
                    />
                    <span
                      className={`text-sm font-medium ${
                        signatureType === "simple"
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      Simple Signature
                    </span>
                  </button>
                  <button
                    onClick={() => {}}
                    disabled
                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed relative"
                  >
                    <div className="absolute top-2 right-2">
                      <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded">
                        Premium
                      </span>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Digital Signature
                    </span>
                  </button>
                </div>
              </div>

              {/* Required Fields */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Required Fields
                </h3>
                <div className="space-y-3">
                  {/* Signature Field */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HiPencilOutline
                          className="text-gray-500 dark:text-gray-400"
                          size={18}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Signature
                        </span>
                      </div>
                      {signatureImage && (
                        <button
                          onClick={() => setShowSignatureCanvas(true)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <HiPencil
                            size={16}
                            className="text-gray-500 dark:text-gray-400"
                          />
                        </button>
                      )}
                    </div>
                    {signatureImage ? (
                      <div
                        ref={signaturePreviewRef}
                        draggable
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2 min-h-[60px] flex items-center justify-center cursor-move hover:border-red-500 transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={signatureImage}
                          alt="Signature"
                          className="max-h-12 max-w-full pointer-events-none"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSignatureCanvas(true)}
                        className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 transition"
                      >
                        Click to add signature
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Optional Fields
                </h3>
                <div className="space-y-3">
                  {/* Initials */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          AC
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Initials
                        </span>
                      </div>
                      {initialsImage && (
                        <button
                          onClick={() => setShowInitialsCanvas(true)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <HiPencil
                            size={16}
                            className="text-gray-500 dark:text-gray-400"
                          />
                        </button>
                      )}
                    </div>
                    {initialsImage ? (
                      <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2 min-h-[40px] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={initialsImage}
                          alt="Initials"
                          className="max-h-8 max-w-full"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowInitialsCanvas(true)}
                        className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400 transition"
                      >
                        Click to add initials
                      </button>
                    )}
                  </div>

                  {/* Name */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <HiOutlineUser
                        className="text-gray-500 dark:text-gray-400"
                        size={18}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </span>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Date */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <HiOutlineCalendar
                        className="text-gray-500 dark:text-gray-400"
                        size={18}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date
                      </span>
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Text */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <HiOutlineDocumentText
                        className="text-gray-500 dark:text-gray-400"
                        size={18}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Text
                      </span>
                    </div>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Company Stamp */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FaStamp
                        className="text-gray-500 dark:text-gray-400"
                        size={18}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Stamp
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setCompanyStamp(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Button */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={downloadSignedPDF}
                disabled={
                  !pdfFile ||
                  !signatureImage ||
                  signaturePositions.length === 0 ||
                  isLoading
                }
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <span>Sign</span>
                <HiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Signature Canvas Modal */}
      {showSignatureCanvas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Draw Signature
              </h3>
              <button
                onClick={() => setShowSignatureCanvas(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <HiX size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pen Size:
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={penSize}
                  onChange={(e) => setPenSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {penSize}px
                </span>
              </div>
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={300}
                  onMouseDown={(e) => startDrawing(e, false)}
                  onMouseMove={(e) => draw(e, false)}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => startDrawing(e, false)}
                  onTouchMove={(e) => draw(e, false)}
                  onTouchEnd={stopDrawing}
                  className="border border-gray-300 dark:border-gray-600 rounded cursor-crosshair w-full touch-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => saveSignatureAsImage(false)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => undo(false)}
                  disabled={!canUndo}
                  className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <AiOutlineUndo size={18} />
                </button>
                <button
                  onClick={() => clearSignature(false)}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  <HiTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initials Canvas Modal */}
      {showInitialsCanvas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Draw Initials
              </h3>
              <button
                onClick={() => setShowInitialsCanvas(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <HiX size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pen Size:
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={penSize}
                  onChange={(e) => setPenSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {penSize}px
                </span>
              </div>
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900">
                <canvas
                  ref={initialsCanvasRef}
                  width={400}
                  height={150}
                  onMouseDown={(e) => startDrawing(e, true)}
                  onMouseMove={(e) => draw(e, true)}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => startDrawing(e, true)}
                  onTouchMove={(e) => draw(e, true)}
                  onTouchEnd={stopDrawing}
                  className="border border-gray-300 dark:border-gray-600 rounded cursor-crosshair w-full touch-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => saveSignatureAsImage(true)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => undo(true)}
                  disabled={initialsHistoryRef.current.length === 0}
                  className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <AiOutlineUndo size={18} />
                </button>
                <button
                  onClick={() => clearSignature(true)}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  <HiTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

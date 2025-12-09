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
} from "react-icons/hi";
import { AiOutlineUndo } from "react-icons/ai";
import { PDFDocument } from "pdf-lib";

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "text">("draw");
  const [signatureText, setSignatureText] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signaturePositions, setSignaturePositions] = useState<
    SignaturePosition[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfPages, setPdfPages] = useState(1);
  const [penSize, setPenSize] = useState(3);
  const [canUndo, setCanUndo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const signaturePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      if (signatureImage) {
        URL.revokeObjectURL(signatureImage);
      }
    };
  }, [pdfUrl, signatureImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Get PDF page count
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPdfPages(pdfDoc.getPageCount());
        setCurrentPage(1);
        setSignaturePositions([]);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    } else {
      alert("Please select a valid PDF file");
    }
  };

  // Save canvas state for undo
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(imageData);
    if (historyRef.current.length > 10) {
      historyRef.current.shift(); // Keep only last 10 states
    }
    setCanUndo(true);
  };

  // Get point from mouse or touch event
  const getPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): Point | null => {
    const canvas = canvasRef.current;
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
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (signatureMode !== "draw") return;
    e.preventDefault();

    const point = getPoint(e);
    if (!point) return;

    saveState();
    setIsDrawing(true);
    pointsRef.current = [point];
    lastPointRef.current = point;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || signatureMode !== "draw") return;
    e.preventDefault();

    const point = getPoint(e);
    if (!point) return;

    const canvas = canvasRef.current;
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

  const undo = () => {
    if (historyRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    historyRef.current.pop();
    const previousState = historyRef.current[historyRef.current.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setCanUndo(historyRef.current.length > 0);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
    setSignatureText("");
    historyRef.current = [];
    setCanUndo(false);
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

  const saveSignatureAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Save at high quality
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    setSignatureImage(dataUrl);
    historyRef.current = []; // Clear history after saving
    setCanUndo(false);
  };

  // Drag and drop handlers for signature
  const handleDragStart = (e: React.DragEvent) => {
    if (!signatureImage) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!signatureImage || !pdfContainerRef.current) return;

    const containerRect = pdfContainerRef.current.getBoundingClientRect();
    const dropX = e.clientX - containerRect.left;
    const dropY = e.clientY - containerRect.top;

    // Calculate position relative to PDF container
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Signature dimensions (as percentage)
    const sigWidth = 0.15; // 15% of page width
    const sigHeight = 0.1; // 10% of page height

    // Center the signature on the drop point
    const normalizedX =
      Math.max(
        sigWidth / 2,
        Math.min(1 - sigWidth / 2, dropX / containerWidth)
      ) -
      sigWidth / 2;
    const normalizedY =
      Math.max(
        sigHeight / 2,
        Math.min(1 - sigHeight / 2, dropY / containerHeight)
      ) -
      sigHeight / 2;

    const newPosition: SignaturePosition = {
      x: Math.max(0, normalizedX),
      y: Math.max(0, normalizedY),
      pageNumber: currentPage,
      width: sigWidth,
      height: sigHeight,
    };

    setSignaturePositions([...signaturePositions, newPosition]);
    setIsDragging(false);
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
      // Load the PDF
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

      // Add signature to each position
      for (const position of signaturePositions) {
        const page = pdfDoc.getPage(position.pageNumber - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();

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

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
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
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <HiArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Sign PDF Document
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PDF Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Upload PDF
              </h2>
              {pdfPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {pdfPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(pdfPages, currentPage + 1))
                    }
                    disabled={currentPage === pdfPages}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {!pdfFile ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop a PDF file here, or click to select
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
                  >
                    Select PDF File
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-800 dark:text-white mb-2">
                    {pdfFile.name}
                  </p>
                  <button
                    onClick={() => {
                      setPdfFile(null);
                      setPdfUrl(null);
                      setSignaturePositions([]);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {pdfUrl && (
              <div
                ref={pdfContainerRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900"
              >
                <iframe
                  src={pdfUrl}
                  className="w-full h-[600px] pointer-events-none"
                  title="PDF Preview"
                />
                {/* Signature overlays */}
                {signaturePositions
                  .map((position, originalIndex) => ({
                    position,
                    originalIndex,
                  }))
                  .filter(({ position }) => position.pageNumber === currentPage)
                  .map(({ position, originalIndex }) => (
                    <div
                      key={originalIndex}
                      className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 rounded"
                      style={{
                        left: `${position.x * 100}%`,
                        top: `${position.y * 100}%`,
                        width: `${position.width * 100}%`,
                        height: `${position.height * 100}%`,
                      }}
                    >
                      <button
                        onClick={() => removeSignature(originalIndex)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <HiX size={14} />
                      </button>
                      {signatureImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={signatureImage}
                          alt="Signature"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  ))}
                {signatureImage && !isDragging && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-2 rounded-md text-sm">
                    Drag signature below onto PDF to place it
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Create Signature
            </h2>

            {/* Mode Toggle */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => {
                  setSignatureMode("draw");
                  clearSignature();
                }}
                className={`px-4 py-2 rounded-md font-semibold transition ${
                  signatureMode === "draw"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Draw Signature
              </button>
              <button
                onClick={() => {
                  setSignatureMode("text");
                  clearSignature();
                }}
                className={`px-4 py-2 rounded-md font-semibold transition ${
                  signatureMode === "text"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Text Signature
              </button>
            </div>

            {/* Drawing Canvas */}
            {signatureMode === "draw" && (
              <div className="space-y-4">
                {/* Pen Size Control */}
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

                <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="border border-gray-300 dark:border-gray-600 rounded cursor-crosshair w-full touch-none"
                    style={{ imageRendering: "crisp-edges" }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveSignatureAsImage}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                  >
                    Save Signature
                  </button>
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    <AiOutlineUndo size={18} />
                  </button>
                  <button
                    onClick={clearSignature}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition"
                  >
                    <HiTrash size={18} />
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Text Signature */}
            {signatureMode === "text" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="Enter your name or signature text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={generateTextSignature}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                  Generate Signature
                </button>
                {signatureImage && (
                  <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={signatureImage}
                      alt="Text Signature"
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <button
                  onClick={clearSignature}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition"
                >
                  <HiTrash size={18} />
                  Clear
                </button>
              </div>
            )}

            {/* Draggable Signature Preview */}
            {signatureImage && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag this signature onto the PDF:
                </p>
                <div
                  ref={signaturePreviewRef}
                  draggable
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  className="cursor-move border-2 border-dashed border-blue-500 p-4 bg-white rounded-lg hover:border-blue-600 transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={signatureImage}
                    alt="Signature"
                    className="max-w-full h-auto pointer-events-none"
                    style={{ maxHeight: "100px" }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Click and drag the signature above onto the PDF preview to
                  place it
                </p>
              </div>
            )}

            {/* Signature Positions List */}
            {signaturePositions.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                  Signatures placed ({signaturePositions.length}):
                </p>
                <div className="space-y-2">
                  {signaturePositions.map((pos, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        Page {pos.pageNumber}
                      </span>
                      <button
                        onClick={() => removeSignature(index)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={downloadSignedPDF}
              disabled={
                !pdfFile || !signatureImage || signaturePositions.length === 0
              }
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              <HiDownload size={20} />
              Download Signed PDF
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

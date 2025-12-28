"use client";

import { useRef } from "react";
import { HiX } from "react-icons/hi";
import { SignaturePosition } from "./types";
import { useDragAndDrop } from "./hooks/useDragAndDrop";

interface PDFViewerProps {
  pdfFile: File | null;
  pdfPageImages: string[];
  currentPage: number;
  pdfPages: number;
  isLoading: boolean;
  signatureImage: string | null;
  signaturePositions: SignaturePosition[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageChange: (page: number) => void;
  onPositionUpdate: (positions: SignaturePosition[]) => void;
  onRemoveSignature: (index: number) => void;
}

export default function PDFViewer({
  pdfFile,
  pdfPageImages,
  currentPage,
  pdfPages,
  isLoading,
  signatureImage,
  signaturePositions,
  onFileChange,
  onPageChange,
  onPositionUpdate,
  onRemoveSignature,
}: PDFViewerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    pdfContainerRef,
    isDragging,
    draggedSignatureIndex,
    isDraggingNewSignature,
    isTouchDragging,
    isTouchDraggingRef,
    handleDragStart,
    handleSignatureDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleSignatureTouchStart,
    handleSignatureTouchMove,
    handleSignatureTouchEnd,
  } = useDragAndDrop(signatureImage, currentPage, onPositionUpdate, signaturePositions);

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Thumbnails Sidebar */}
      {pdfPageImages.length > 0 && (
        <div className="hidden lg:block w-24 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="p-2 space-y-2">
            {pdfPageImages.map((image, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index + 1)}
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
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="hidden"
              />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">
                Drag and drop a PDF file here, or click to select
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base"
              >
                Select PDF File
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Converting PDF to images...
            </p>
          </div>
        ) : (
          <div
            ref={pdfContainerRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTouchMove={(e) => {
              if (isTouchDraggingRef.current) {
                e.preventDefault();
              }
            }}
            className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-2 sm:p-4"
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
                    onTouchStart={(e) =>
                      handleSignatureTouchStart(e, originalIndex)
                    }
                    onTouchMove={handleSignatureTouchMove}
                    onTouchEnd={handleSignatureTouchEnd}
                    className={`absolute border-2 border-red-500 bg-red-500 bg-opacity-20 rounded cursor-move hover:bg-red-500 hover:bg-opacity-30 transition touch-none ${
                      (draggedSignatureIndex === originalIndex &&
                        (isDragging || isTouchDragging)) ||
                      (isTouchDragging &&
                        draggedSignatureIndex === originalIndex)
                        ? "opacity-30 scale-95"
                        : ""
                    }`}
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
                        onRemoveSignature(originalIndex);
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
  );
}


"use client";

import { useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SignaturePosition } from "./types";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useResize } from "./hooks/useResize";

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

  const {
    isResizing,
    resizingIndex,
    resizeHandle,
    handleResizeStart,
  } = useResize(pdfContainerRef, currentPage, onPositionUpdate, signaturePositions);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Thumbnails Sidebar */}
      {pdfPageImages.length > 0 && (
        <div className="hidden lg:block w-24 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="p-2 space-y-2">
            {pdfPageImages.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onPageChange(index + 1)}
                className={`w-full aspect-[3/4] relative rounded-xl border-2 overflow-hidden transition ${
                  currentPage === index + 1
                    ? "border-dashboard-primary"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
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
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 px-4">
                Drag and drop a PDF file here, or click to select
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-dashboard-primary hover:bg-dashboard-primary/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base"
              >
                Select PDF File
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
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
            className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-800 p-2 sm:p-4"
          >
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-lg relative rounded-2xl overflow-hidden">
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
                    draggable={!isResizing}
                    onDragStart={(e) => {
                      if (!isResizing) {
                        handleSignatureDragStart(e, originalIndex);
                      }
                    }}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => {
                      if (!isResizing) {
                        handleSignatureTouchStart(e, originalIndex);
                      }
                    }}
                    onTouchMove={handleSignatureTouchMove}
                    onTouchEnd={handleSignatureTouchEnd}
                    className={`absolute border-2 border-dashboard-primary bg-dashboard-primary/20 rounded-xl transition touch-none group ${
                      (draggedSignatureIndex === originalIndex &&
                        (isDragging || isTouchDragging)) ||
                      (isTouchDragging &&
                        draggedSignatureIndex === originalIndex) ||
                      (isResizing && resizingIndex === originalIndex)
                        ? "opacity-30 scale-95"
                        : "hover:bg-dashboard-primary/30"
                    }`}
                    style={{
                      left: `${position.x * 100}%`,
                      top: `${position.y * 100}%`,
                      width: `${position.width * 100}%`,
                      height: `${position.height * 100}%`,
                      cursor: isResizing && resizingIndex === originalIndex
                        ? (resizeHandle === "se" ? "se-resize" : 
                           resizeHandle === "sw" ? "sw-resize" : 
                           resizeHandle === "nw" ? "nw-resize" : "move")
                        : "move",
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSignature(originalIndex);
                      }}
                      className="absolute -top-2 -right-2 bg-dashboard-primary text-white rounded-full p-1 hover:bg-dashboard-primary/90 z-10"
                    >
                      <XMarkIcon className="size-3.5" />
                    </button>
                    {/* Invisible resize handles - all corners except top-right */}
                    {/* Bottom-right */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, originalIndex, "se")}
                      onTouchStart={(e) => handleResizeStart(e, originalIndex, "se")}
                      onMouseEnter={(e) => {
                        if (!isResizing && resizingIndex !== originalIndex) {
                          const parent = e.currentTarget.parentElement as HTMLElement;
                          if (parent) parent.style.cursor = "se-resize";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isResizing && resizingIndex !== originalIndex) {
                          const parent = e.currentTarget.parentElement as HTMLElement;
                          if (parent) parent.style.cursor = "move";
                        }
                      }}
                      className="absolute bottom-0 right-0 w-6 h-6 z-20"
                      style={{ touchAction: "none", cursor: "se-resize" }}
                    />
                    {/* Bottom-left */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, originalIndex, "sw")}
                      onTouchStart={(e) => handleResizeStart(e, originalIndex, "sw")}
                      onMouseEnter={(e) => {
                        if (!isResizing && resizingIndex !== originalIndex) {
                          const parent = e.currentTarget.parentElement as HTMLElement;
                          if (parent) parent.style.cursor = "sw-resize";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isResizing && resizingIndex !== originalIndex) {
                          const parent = e.currentTarget.parentElement as HTMLElement;
                          if (parent) parent.style.cursor = "move";
                        }
                      }}
                      className="absolute bottom-0 left-0 w-6 h-6 z-20"
                      style={{ touchAction: "none", cursor: "sw-resize" }}
                    />
                    {/* Top-left */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, originalIndex, "nw")}
                      onTouchStart={(e) => handleResizeStart(e, originalIndex, "nw")}
                      onMouseEnter={(e) => {
                        if (!isResizing && resizingIndex !== originalIndex) {
                          const parent = e.currentTarget.parentElement as HTMLElement;
                          if (parent) parent.style.cursor = "nw-resize";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isResizing && resizingIndex !== originalIndex) {
                          const parent = e.currentTarget.parentElement as HTMLElement;
                          if (parent) parent.style.cursor = "move";
                        }
                      }}
                      className="absolute top-0 left-0 w-6 h-6 z-20"
                      style={{ touchAction: "none", cursor: "nw-resize" }}
                    />
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


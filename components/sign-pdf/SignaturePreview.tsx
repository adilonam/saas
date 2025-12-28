"use client";

import { useRef } from "react";
import { HiPencil, HiOutlinePencil as HiPencilOutline } from "react-icons/hi";

interface SignaturePreviewProps {
  signatureImage: string | null;
  isDragging: boolean;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
}

export default function SignaturePreview({
  signatureImage,
  isDragging,
  onEdit,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
}: SignaturePreviewProps) {
  const signaturePreviewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 sm:p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HiPencilOutline
            className="text-gray-500 dark:text-gray-400"
            size={16}
            style={{ width: "16px", height: "16px" }}
          />
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Signature
          </span>
        </div>
        {signatureImage && (
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <HiPencil
              size={14}
              className="text-gray-500 dark:text-gray-400"
            />
          </button>
        )}
      </div>
      {signatureImage ? (
        <div
          ref={signaturePreviewRef}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          className={`bg-white dark:bg-gray-200 rounded border border-gray-200 dark:border-gray-700 p-2 min-h-[50px] sm:min-h-[60px] flex items-center justify-center cursor-move hover:border-red-500 transition touch-none ${
            isDragging ? "opacity-50 border-red-500" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signatureImage}
            alt="Signature"
            className="max-h-10 sm:max-h-12 max-w-full pointer-events-none"
          />
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition"
        >
          Cliquez pour ajouter une signature
        </button>
      )}
    </div>
  );
}


"use client";

import { useRef } from "react";
import { PencilSquareIcon, PencilIcon } from "@heroicons/react/24/outline";

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
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-2 sm:p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PencilIcon className="size-4 text-slate-500 dark:text-slate-400" />
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Signature
          </span>
        </div>
        {signatureImage && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <PencilSquareIcon className="size-4 text-slate-500 dark:text-slate-400" />
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
          className={`bg-white dark:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 p-2 min-h-[50px] sm:min-h-[60px] flex items-center justify-center cursor-move hover:border-dashboard-primary transition touch-none ${
            isDragging ? "opacity-50 border-dashboard-primary" : ""
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
          type="button"
          onClick={onEdit}
          className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 transition"
        >
          Click to add a signature
        </button>
      )}
    </div>
  );
}


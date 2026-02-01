"use client";

import { PencilSquareIcon, ChevronRightIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import SignaturePreview from "./SignaturePreview";

interface SignatureOptionsPanelProps {
  signatureType: "simple" | "digital";
  onSignatureTypeChange: (type: "simple" | "digital") => void;
  signatureImage: string | null;
  isDragging: boolean;
  onEditSignature: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onSign: () => void;
  canSign: boolean;
}

export default function SignatureOptionsPanel({
  signatureType,
  onSignatureTypeChange,
  signatureImage,
  isDragging,
  onEditSignature,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onSign,
  canSign,
}: SignatureOptionsPanelProps) {
  return (
    <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col overflow-hidden max-h-[50vh] lg:max-h-none">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
          Signature options
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Signature Type Selection */}
        <div>
          <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
            <button
              type="button"
              onClick={() => onSignatureTypeChange("simple")}
              className={`flex-1 flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition ${
                signatureType === "simple"
                  ? "border-dashboard-primary bg-dashboard-primary/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <PencilSquareIcon
                className={`size-5 sm:size-6 ${
                  signatureType === "simple"
                    ? "text-dashboard-primary"
                    : "text-slate-400"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium ${
                  signatureType === "simple"
                    ? "text-dashboard-primary"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Simple signature
              </span>
            </button>
            <button
              type="button"
              onClick={() => {}}
              disabled
              className="flex-1 flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed relative"
            >
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                <span className="text-[10px] sm:text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                  Premium
                </span>
              </div>
              <ShieldCheckIcon className="size-5 sm:size-6 text-slate-400" />
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Digital signature
              </span>
            </button>
          </div>
        </div>

        {/* Required Fields */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
            Required fields
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <SignaturePreview
              signatureImage={signatureImage}
              isDragging={isDragging}
              onEdit={onEditSignature}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
            />
          </div>
        </div>
      </div>

      {/* Sign Button */}
      <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onSign}
          disabled={!canSign}
          className="w-full bg-dashboard-primary hover:bg-dashboard-primary/90 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 transition text-sm sm:text-base"
        >
          <span>Sign</span>
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}

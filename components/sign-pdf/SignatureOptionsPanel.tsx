"use client";

import { HiPencil, HiChevronRight } from "react-icons/hi";
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
    <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col overflow-hidden max-h-[50vh] lg:max-h-none">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Signature options
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Signature Type Selection */}
        <div>
          <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
            <button
              onClick={() => onSignatureTypeChange("simple")}
              className={`flex-1 flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-lg border-2 transition ${
                signatureType === "simple"
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <HiPencil
                size={20}
                className={`sm:w-6 sm:h-6 ${
                  signatureType === "simple"
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium ${
                  signatureType === "simple"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Simple signature
              </span>
            </button>
            <button
              onClick={() => {}}
              disabled
              className="flex-1 flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed relative"
            >
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                <span className="text-[10px] sm:text-xs bg-yellow-500 text-white px-1 sm:px-1.5 py-0.5 rounded">
                  Premium
                </span>
              </div>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
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
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Digital signature
              </span>
            </button>
          </div>
        </div>

        {/* Required Fields */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
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
      <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onSign}
          disabled={!canSign}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base"
        >
          <span>Sign</span>
          <HiChevronRight size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}


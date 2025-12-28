"use client";

import { HiX, HiTrash } from "react-icons/hi";
import { AiOutlineUndo } from "react-icons/ai";
import { useCanvasDrawing } from "./hooks/useCanvasDrawing";

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageData: string) => void;
}

export default function SignatureCanvasModal({
  isOpen,
  onClose,
  onSave,
}: SignatureCanvasModalProps) {
  const {
    canvasRef,
    canUndo,
    penSize,
    setPenSize,
    startDrawing,
    draw,
    stopDrawing,
    undo,
    clear,
    saveAsImage,
  } = useCanvasDrawing(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const imageData = saveAsImage();
    if (imageData) {
      onSave(imageData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Draw Signature
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <HiX size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
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
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-8 sm:w-10 text-right">
              {penSize}px
            </span>
          </div>
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 sm:p-4 bg-white dark:bg-gray-100">
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
              className="border border-gray-300 dark:border-gray-600 rounded cursor-crosshair w-full touch-none bg-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition text-sm sm:text-base"
            >
              Save
            </button>
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <AiOutlineUndo
                size={16}
                className="sm:w-[18px] sm:h-[18px]"
              />
            </button>
            <button
              onClick={clear}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              <HiTrash size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useRouter } from "next/navigation";
import { HiArrowLeft, HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface TopBarProps {
  pdfFile: File | null;
  currentPage: number;
  pdfPages: number;
  onPageChange: (page: number) => void;
}

export default function TopBar({
  pdfFile,
  currentPage,
  pdfPages,
  onPageChange,
}: TopBarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
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
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-default truncate"
          >
            <option>{pdfFile.name}</option>
          </select>
        )}
      </div>
      {pdfPages > 1 && pdfFile && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <HiChevronLeft
              size={20}
              className="text-gray-600 dark:text-gray-400"
            />
          </button>
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 px-2 sm:px-3">
            {currentPage} / {pdfPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(pdfPages, currentPage + 1))}
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
  );
}


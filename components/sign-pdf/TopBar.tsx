"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
        >
          <ArrowLeftIcon className="size-5 text-slate-600 dark:text-slate-400" />
        </button>
        {pdfFile && (
          <select
            defaultValue={pdfFile.name}
            disabled
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-dashboard-primary/20 cursor-default truncate"
          >
            <option>{pdfFile.name}</option>
          </select>
        )}
      </div>
      {pdfPages > 1 && pdfFile && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeftIcon className="size-5 text-slate-600 dark:text-slate-400" />
          </button>
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 px-2 sm:px-3">
            {currentPage} / {pdfPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pdfPages, currentPage + 1))}
            disabled={currentPage === pdfPages}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRightIcon className="size-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
}

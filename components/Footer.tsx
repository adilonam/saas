"use client";

import Link from "next/link";
import { LEGAL_BUSINESS_NAME, SITE_BRAND } from "@/lib/business";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-2 text-sm text-center sm:text-left">
          <p className="font-medium text-slate-900 dark:text-white">
            &copy; {currentYear} {SITE_BRAND}. All rights reserved.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Operated by{" "}
            <Link
              href="/legal"
              className="font-semibold text-slate-900 dark:text-white hover:underline"
            >
              {LEGAL_BUSINESS_NAME}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

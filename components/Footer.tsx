"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-2 text-sm">
          <p className="font-medium text-slate-900 dark:text-white">
            &copy; {currentYear} Manage PDF. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Powered by APEXRISGELYTICS CONSULTING LLC
          </p>
        </div>
      </div>
    </footer>
  );
}

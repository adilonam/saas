"use client";

import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import {
  CONTACT_EMAIL,
  LEGAL_BUSINESS_NAME,
  SITE_BRAND,
} from "@/lib/business";

export default function LegalPage() {
  return (
    <DashboardLayout>
      <div className="mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Legal &amp; business information
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-lg">
          Operator and contact details for {SITE_BRAND} ({SITE_BRAND.toLowerCase()}.io).
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5 sm:p-8 shadow-xl">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-10 sm:size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
              <BuildingOffice2Icon className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Legal business name
              </p>
              <p className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white">
                {LEGAL_BUSINESS_NAME}
              </p>
            </div>
          </div>
          <p className="mt-4 sm:mt-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The website{" "}
            <a
              href="https://www.eprod.io"
              className="font-medium text-dashboard-primary hover:underline"
            >
              www.eprod.io
            </a>{" "}
            and the {SITE_BRAND} online productivity tools are operated by{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">
              {LEGAL_BUSINESS_NAME}
            </strong>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5 sm:p-8">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            Contact
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-sm sm:text-lg font-semibold text-dashboard-primary hover:underline break-all"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            For support or business inquiries, see also{" "}
            <Link href="/contact" className="text-dashboard-primary hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5 sm:p-8">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
            Policies
          </p>
          <ul className="space-y-2 text-sm sm:text-base">
            <li>
              <Link
                href="/privacy"
                className="font-semibold text-dashboard-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-and-conditions"
                className="font-semibold text-dashboard-primary hover:underline"
              >
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

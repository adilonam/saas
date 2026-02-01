"use client";

import DashboardLayout from "components/DashboardLayout";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const CONTACT_EMAIL = "adil.abbadi.1996@gmail.com";

export default function ContactPage() {
  return (
    <DashboardLayout>
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Contact us
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Get in touch for support or questions.
        </p>
      </div>

      <div className="max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <EnvelopeIcon className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              Email
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-lg font-semibold text-dashboard-primary hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Send us an email and we will get back to you as soon as possible.
        </p>
      </div>
    </DashboardLayout>
  );
}

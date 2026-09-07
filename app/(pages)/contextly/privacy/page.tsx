"use client";

import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const LAST_UPDATED = "September 7, 2026";
const CONTEXTLY_GREEN = "#20724C";

const CONTACT_EMAIL = "support@eprod.io";
const COMPANY_NAME = "APEXRIDGELYTICS CONSULTING LLC";

export default function ContextlyPrivacyPage() {
  return (
    <DashboardLayout>
      <div className="mb-8 sm:mb-12">
        <p
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: CONTEXTLY_GREEN }}
        >
          Contextly
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Privacy Policy
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-lg">
          How Contextly handles your data — and what we do not collect.
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500 sm:text-sm">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900/50 sm:p-8">
          <div className="mb-6 flex items-start gap-3 sm:gap-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12"
              style={{
                backgroundColor: `${CONTEXTLY_GREEN}18`,
                color: CONTEXTLY_GREEN,
              }}
            >
              <ShieldCheckIcon className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Brand identity for Contextly uses green ({CONTEXTLY_GREEN}) and
                white. This page explains what data we handle for the Contextly
                Chrome extension. Related product page:{" "}
                <Link
                  href="/contextly"
                  className="font-medium hover:underline"
                  style={{ color: CONTEXTLY_GREEN }}
                >
                  Contextly
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="prose-legal space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                Introduction
              </h2>
              <p>
                Contextly is a Chrome extension that helps users improve writing
                on the web. When you select text, a small overlay lets you choose
                a prompt, preview an AI-generated rewrite, and apply or copy the
                result. The extension popup is for account sign-up/sign-in and
                managing personal prompts (create, edit, favorites). This privacy
                policy explains what data we handle, how we use it, and what we
                do not collect.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                What we collect
              </h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    Account:
                  </strong>{" "}
                  email and password at sign-up. Passwords are hashed on the
                  server. After login, JWT access and refresh tokens are stored
                  in{" "}
                  <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">
                    chrome.storage.local
                  </code>
                  , and are cleared on sign-out.
                </li>
                <li>
                  When you run a prompt, only the selected text is sent to the
                  Contextly backend for AI processing.
                </li>
                <li>
                  The backend stores your saved prompt templates.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                How we use data
              </h2>
              <p>
                We use data only to provide writing-assistant features:
                authentication, processing selected text, preview/apply/copy, and
                storing personal prompts. We do not use this data for
                advertising, credit scoring, or lending. We do not sell user
                data.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                Third-party AI processing
              </h2>
              <p>
                AI processing uses OpenAI. Selected text may be sent via the
                Contextly backend to OpenAI to generate the result. It is used
                only to produce the preview/response.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                Storage in the extension
              </h2>
              <p>
                JWT tokens are stored in{" "}
                <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">
                  chrome.storage.local
                </code>{" "}
                and are cleared on sign-out. Content scripts run on pages for the
                overlay and only act on user-selected text. API calls from the
                page go through the extension background script.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                What we don&apos;t collect
              </h2>
              <p>
                We do not collect browsing history, full page content, location,
                health or financial data, or click/scroll/keystroke analytics.
                Contextly does not browse, scrape, or modify pages beyond the
                selected text and overlay.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                Data sharing
              </h2>
              <p>
                We do not sell data. Aside from the AI provider used for
                generating results, we do not share data for advertising or
                unrelated commercial purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                Retention &amp; deletion
              </h2>
              <p>
                Account credentials are stored on the server (hashed passwords);
                email is kept for the account; saved prompts are retained while
                used; tokens are removed on sign-out. For deletion or privacy
                questions, contact us using the details below.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                Contact
              </h2>
              <p>
                For privacy questions or deletion requests, contact{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium hover:underline"
                  style={{ color: CONTEXTLY_GREEN }}
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                at{" "}
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {COMPANY_NAME}
                </span>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

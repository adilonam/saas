"use client";

import Image from "next/image";
import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CursorArrowRaysIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/contextly/lemgaoapgihhicjnkcpibpkpiaacklof";

const CONTEXTLY_GREEN = "#20724C";

function trackContextlyEvent(payload: {
  event: string;
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  [key: string]: unknown;
}) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(payload);
  }
}

const HOW_IT_WORKS = [
  {
    icon: CursorArrowRaysIcon,
    title: "Select text",
    description:
      "Highlight text anywhere on the web. A small overlay appears so you can choose what to do next.",
  },
  {
    icon: SparklesIcon,
    title: "Choose a prompt",
    description:
      "Pick a prompt — favorites first. Options cover spelling and grammar, tone rewrites, summaries, professional replies, and more.",
  },
  {
    icon: PencilSquareIcon,
    title: "Preview the result",
    description:
      "Only your selected text is sent to the Contextly backend for AI processing. Review the rewrite before anything changes.",
  },
  {
    icon: ClipboardDocumentIcon,
    title: "Apply or copy",
    description:
      "Apply the rewritten text to replace your selection, or copy it to your clipboard.",
  },
];

const BENEFITS = [
  "Improve writing on any webpage without leaving your flow",
  "Favorites-first prompt picker for the actions you use most",
  "Preview before apply — you stay in control of every change",
  "Personal prompts: create, edit, and mark favorites in the popup",
  "Does not browse, scrape, or change pages beyond your selection and overlay",
];

export default function ContextlyPage() {
  const handleChromeInstallClick = (buttonText: string) => {
    trackContextlyEvent({
      event: "contextly_chrome_install_click",
      eventCategory: "Contextly",
      eventAction: "Chrome Install Click",
      eventLabel: buttonText,
      button_text: buttonText,
      destination: CHROME_WEB_STORE_URL,
      page: "/contextly",
      product: "contextly",
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Hero */}
        <section className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: CONTEXTLY_GREEN }}
            >
              Chrome extension
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Contextly
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              Contextly is a Chrome extension that helps you improve writing
              anywhere on the web. Select text on a page and a small overlay
              appears: choose a prompt (favorites first), preview the result,
              then apply it or copy it. Prompts cover spelling and grammar, tone
              rewrites, summaries, professional replies, and more.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-xl text-white hover:opacity-90"
                style={{ backgroundColor: CONTEXTLY_GREEN }}
              >
                <a
                  href={CHROME_WEB_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    handleChromeInstallClick("Get Contextly for Chrome")
                  }
                >
                  Get Contextly for Chrome
                  <ArrowTopRightOnSquareIcon className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl border-slate-200 dark:border-slate-700"
              >
                <Link href="/contextly/privacy">
                  <ShieldCheckIcon className="size-4" />
                  Privacy policy
                </Link>
              </Button>
            </div>
          </div>

          <div className="shrink-0">
            <div
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/50"
              style={{ boxShadow: `0 12px 40px ${CONTEXTLY_GREEN}22` }}
            >
              <Image
                src="/products/contextly-icon-high.png"
                alt="Contextly"
                width={256}
                height={256}
                quality={100}
                className="h-auto w-56 sm:w-72"
                priority
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            How it works
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            When you run a prompt, only your selected text is sent to the
            Contextly backend for AI processing. You review the rewritten text
            before it replaces your selection or goes to your clipboard.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HOW_IT_WORKS.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: CONTEXTLY_GREEN }}
                  >
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popup & privacy highlights */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/50 sm:p-8">
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${CONTEXTLY_GREEN}18`,
                color: CONTEXTLY_GREEN,
              }}
            >
              <UserCircleIcon className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sign in &amp; manage prompts
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              The extension popup is for signing in and managing your personal
              prompts—create, edit, and mark favorites. Contextly does not
              browse, scrape, or change pages beyond your selected text and that
              overlay.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/50 sm:p-8">
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${CONTEXTLY_GREEN}18`,
                color: CONTEXTLY_GREEN,
              }}
            >
              <ShieldCheckIcon className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Built with privacy in mind
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              We only send selected text when you run a prompt, and you review
              the result before apply or copy. Read the full details on our{" "}
              <Link
                href="/contextly/privacy"
                className="font-medium hover:underline"
                style={{ color: CONTEXTLY_GREEN }}
              >
                privacy policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/50 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            What you get
          </h2>
          <ul className="mt-5 space-y-3">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircleIcon
                  className="mt-0.5 size-5 shrink-0"
                  style={{ color: CONTEXTLY_GREEN }}
                  aria-hidden
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA footer */}
        <section
          className="rounded-2xl p-6 text-white sm:p-8"
          style={{ backgroundColor: CONTEXTLY_GREEN }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Ready to write better on the web?
              </h2>
              <p className="mt-1 text-sm text-white/85 sm:text-base">
                Install Contextly for Chrome from the Chrome Web Store.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="shrink-0 gap-2 rounded-xl bg-white hover:bg-white/90"
              style={{ color: CONTEXTLY_GREEN }}
            >
              <a
                href={CHROME_WEB_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleChromeInstallClick("Get Contextly")}
              >
                Get Contextly
                <ArrowTopRightOnSquareIcon className="size-4" />
              </a>
            </Button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

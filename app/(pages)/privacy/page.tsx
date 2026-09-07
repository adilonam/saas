"use client";

import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
  CONTACT_EMAIL,
  LEGAL_BUSINESS_NAME,
  SITE_BRAND,
} from "@/lib/business";

const LAST_UPDATED = "September 6, 2026";

export default function PrivacyPolicyPage() {
  return (
    <DashboardLayout>
      <div className="mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-lg">
          How {SITE_BRAND} collects, uses, and protects your information.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-2">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5 sm:p-8 shadow-xl">
          <div className="flex items-start gap-3 sm:gap-4 mb-6">
            <div className="size-10 sm:size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
              <ShieldCheckIcon className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                This Privacy Policy describes how{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {LEGAL_BUSINESS_NAME}
                </strong>{" "}
                (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates{" "}
                {SITE_BRAND} at{" "}
                <a
                  href="https://www.eprod.io"
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  www.eprod.io
                </a>{" "}
                and related services (the &quot;Service&quot;). By using the
                Service, you agree to the practices described here.
              </p>
            </div>
          </div>

          <div className="prose-legal space-y-8 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                1. Information we collect
              </h2>
              <p className="mb-3">
                We may collect the following categories of information:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    Account information:
                  </strong>{" "}
                  name, email address, password (hashed), and profile details
                  you provide when you register or sign in.
                </li>
                <li>
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    Billing and subscription data:
                  </strong>{" "}
                  purchase status, plan type, and payment-related identifiers
                  processed by our payment providers. We do not store full
                  payment card numbers on our servers.
                </li>
                <li>
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    Content you submit:
                  </strong>{" "}
                  files, text, prompts, and other inputs you upload or enter
                  when using tools (for example PDF processing or AI-assisted
                  features), as needed to provide the Service.
                </li>
                <li>
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    Usage and device data:
                  </strong>{" "}
                  IP address, browser type, device information, pages visited,
                  referring URLs, timestamps, and approximate location derived
                  from IP.
                </li>
                <li>
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    Communications:
                  </strong>{" "}
                  messages you send us via email or contact forms.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                2. How we use information
              </h2>
              <p className="mb-3">We use personal information to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide, operate, maintain, and improve the Service</li>
                <li>Create and manage accounts, authentication, and subscriptions</li>
                <li>Process payments and fulfill purchases</li>
                <li>Respond to support requests and communicate about the Service</li>
                <li>Monitor usage, diagnose issues, and secure our systems</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>
                  Send transactional notices (and, where permitted, product
                  updates or marketing you can opt out of)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                3. Cookies and similar technologies
              </h2>
              <p>
                We use cookies and similar technologies for authentication,
                session management, preferences (such as theme), analytics, and
                security. You can control cookies through your browser settings.
                Disabling certain cookies may limit some features of the
                Service.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                4. AI and content processing
              </h2>
              <p>
                Some tools use artificial intelligence or third-party processing
                providers to generate or transform content based on your inputs.
                Content you submit may be transmitted to those providers solely
                to deliver the requested feature. Do not upload content you are
                not authorized to process or that you do not want processed by
                such systems. We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                5. Sharing of information
              </h2>
              <p className="mb-3">
                We may share information with:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Service providers who help us host, authenticate, process
                  payments, send email, analyze usage, or run AI features
                </li>
                <li>
                  Professional advisors (legal, accounting) when reasonably
                  necessary
                </li>
                <li>
                  Authorities when required by law or to protect rights, safety,
                  or security
                </li>
                <li>
                  A successor entity in connection with a merger, acquisition,
                  or asset sale, subject to appropriate safeguards
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                6. Data retention
              </h2>
              <p>
                We retain personal information for as long as needed to provide
                the Service, comply with legal obligations, resolve disputes,
                and enforce agreements. Account data is typically kept while
                your account is active and for a reasonable period afterward.
                Uploaded files may be processed transiently or retained
                temporarily depending on the tool; we aim to minimize retention
                where practical.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                7. Security
              </h2>
              <p>
                We implement administrative, technical, and organizational
                measures designed to protect personal information. No method of
                transmission or storage is completely secure; we cannot
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                8. Your rights and choices
              </h2>
              <p className="mb-3">
                Depending on your location, you may have rights to access,
                correct, delete, or export your personal information, object to
                or restrict certain processing, or withdraw consent where
                processing is based on consent. To exercise these rights,
                contact us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                . You may also update account details where available in the
                product, and unsubscribe from marketing emails via the link in
                those messages.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                9. International transfers
              </h2>
              <p>
                We may process and store information in the United States and
                other countries where we or our providers operate. Those
                countries may have different data-protection laws than your
                jurisdiction. Where required, we use appropriate safeguards for
                cross-border transfers.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                10. Children&apos;s privacy
              </h2>
              <p>
                The Service is not directed to children under 16 (or the
                minimum age required in your jurisdiction). We do not knowingly
                collect personal information from children. If you believe a
                child has provided us personal information, contact us and we
                will take appropriate steps to delete it.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                11. Changes to this policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                post the revised version on this page and update the &quot;Last
                updated&quot; date. Continued use of the Service after changes
                become effective constitutes acceptance of the updated policy
                where permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                12. Contact us
              </h2>
              <p>
                Questions about this Privacy Policy or our privacy practices
                can be sent to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                . More operator details are on our{" "}
                <Link
                  href="/legal"
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  Legal
                </Link>{" "}
                page. Related:{" "}
                <Link
                  href="/terms-and-conditions"
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  Terms and Conditions
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

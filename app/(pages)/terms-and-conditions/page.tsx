"use client";

import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import {
  CONTACT_EMAIL,
  LEGAL_BUSINESS_NAME,
  SITE_BRAND,
} from "@/lib/business";

const LAST_UPDATED = "September 6, 2026";

export default function TermsAndConditionsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Terms and Conditions
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-lg">
          Rules for using {SITE_BRAND} and related services.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-2">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5 sm:p-8 shadow-xl">
          <div className="flex items-start gap-3 sm:gap-4 mb-6">
            <div className="size-10 sm:size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
              <DocumentTextIcon className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                These Terms and Conditions (&quot;Terms&quot;) govern your
                access to and use of {SITE_BRAND} at{" "}
                <a
                  href="https://www.eprod.io"
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  www.eprod.io
                </a>
                , operated by{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {LEGAL_BUSINESS_NAME}
                </strong>{" "}
                (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By
                accessing or using the Service, you agree to these Terms. If
                you do not agree, do not use the Service.
              </p>
            </div>
          </div>

          <div className="space-y-8 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                1. Eligibility and accounts
              </h2>
              <p className="mb-3">
                You must be legally able to enter a binding contract in your
                jurisdiction to use the Service. You are responsible for
                maintaining the confidentiality of your account credentials and
                for all activity under your account. Provide accurate
                registration information and notify us promptly of unauthorized
                use.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                2. Description of the Service
              </h2>
              <p>
                {SITE_BRAND} provides online productivity tools, including but
                not limited to document and PDF utilities, calculators,
                generators, and AI-assisted features. Features may change,
                improve, or be discontinued over time. Some capabilities require
                a paid subscription or other purchase.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                3. Subscriptions, billing, and refunds
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Paid plans are billed according to the pricing and terms shown
                  at purchase (for example via our payment partners).
                </li>
                <li>
                  Fees are generally non-refundable except where required by law
                  or expressly stated at checkout.
                </li>
                <li>
                  We may change prices with notice for renewal periods where
                  applicable. Continued use after a price change constitutes
                  acceptance of the new price for subsequent billing periods.
                </li>
                <li>
                  You are responsible for applicable taxes. Failure to pay may
                  result in suspension or termination of access to paid
                  features.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                4. Acceptable use
              </h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Use the Service for unlawful, harmful, fraudulent, or abusive
                  purposes
                </li>
                <li>
                  Upload malware, or attempt to probe, scan, or breach our
                  systems or other users&apos; accounts
                </li>
                <li>
                  Interfere with or disrupt the Service, or circumvent usage
                  limits, authentication, or access controls
                </li>
                <li>
                  Reverse engineer, scrape at scale, or resell the Service
                  without our prior written consent
                </li>
                <li>
                  Upload content you do not have rights to process, or that
                  infringes intellectual property, privacy, or other rights
                </li>
                <li>
                  Use AI features to generate illegal content or to mislead
                  others in a harmful way
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                5. Your content
              </h2>
              <p>
                You retain ownership of content you submit. You grant us a
                limited, worldwide, non-exclusive license to host, process,
                transmit, and display that content solely as needed to operate
                and improve the Service (including through subprocessors such as
                hosting and AI providers). You represent that you have all
                rights necessary to submit the content and grant this license.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                6. Intellectual property
              </h2>
              <p>
                The Service, including software, branding, logos, UI, and
                documentation, is owned by {LEGAL_BUSINESS_NAME} or its
                licensors and is protected by intellectual property laws. These
                Terms do not grant you any right to use our trademarks except as
                needed to identify the Service in a factual way. Feedback you
                provide may be used by us without obligation to you.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                7. AI-generated output
              </h2>
              <p>
                AI features may produce inaccurate, incomplete, or unexpected
                results. You are solely responsible for reviewing outputs before
                relying on them for business, legal, financial, medical, or
                other decisions. Outputs are provided &quot;as is&quot; and do
                not constitute professional advice.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                8. Third-party services
              </h2>
              <p>
                The Service may integrate with or link to third-party products
                (payment processors, authentication, analytics, AI APIs). Your
                use of those services may be subject to their own terms and
                privacy policies. We are not responsible for third-party
                services we do not control.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                9. Disclaimer of warranties
              </h2>
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
                IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF
                DEALING OR USAGE OF TRADE. WE DO NOT WARRANT THAT THE SERVICE
                WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                10. Limitation of liability
              </h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, {LEGAL_BUSINESS_NAME}{" "}
                AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
                GOODWILL, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATED TO
                YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM
                ARISING OUT OF OR RELATING TO THE SERVICE SHALL NOT EXCEED THE
                GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE
                TWELVE (12) MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S.
                DOLLARS (US $100). SOME JURISDICTIONS DO NOT ALLOW CERTAIN
                LIMITATIONS; IN THOSE CASES OUR LIABILITY IS LIMITED TO THE
                FULLEST EXTENT PERMITTED BY LAW.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                11. Indemnification
              </h2>
              <p>
                You agree to indemnify and hold harmless {LEGAL_BUSINESS_NAME}{" "}
                and its affiliates from and against claims, damages, losses, and
                expenses (including reasonable attorneys&apos; fees) arising
                from your use of the Service, your content, or your violation of
                these Terms or applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                12. Suspension and termination
              </h2>
              <p>
                We may suspend or terminate access to the Service if you breach
                these Terms, if required by law, or if we discontinue the
                Service. You may stop using the Service at any time. Provisions
                that by their nature should survive (including intellectual
                property, disclaimers, limitations of liability, and
                indemnification) will survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                13. Governing law
              </h2>
              <p>
                These Terms are governed by the laws of the State of Wyoming,
                United States, without regard to conflict-of-law principles,
                except where mandatory consumer protection laws in your
                jurisdiction require otherwise. Courts located in Wyoming shall
                have exclusive jurisdiction over disputes arising from these
                Terms, subject to applicable consumer rights.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                14. Changes to these Terms
              </h2>
              <p>
                We may update these Terms from time to time. We will post the
                revised Terms on this page and update the &quot;Last
                updated&quot; date. Material changes may be communicated by
                email or in-product notice when appropriate. Continued use after
                the effective date constitutes acceptance of the updated Terms
                where permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                15. Contact
              </h2>
              <p>
                For questions about these Terms, contact{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                . See also{" "}
                <Link
                  href="/legal"
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  Legal
                </Link>
                ,{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  Privacy Policy
                </Link>
                , and{" "}
                <Link
                  href="/contact"
                  className="font-medium text-dashboard-primary hover:underline"
                >
                  Contact us
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

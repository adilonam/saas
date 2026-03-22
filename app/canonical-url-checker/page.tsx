"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LinkSlashIcon } from "@heroicons/react/24/outline";
import { extractCanonicalFromHtml, normalizeUrlForComparison } from "@/lib/seo-tools";
import { useToolAccess } from "@/lib/use-tool-access";

export default function CanonicalUrlCheckerPage() {
  const { ensureAccess } = useToolAccess();
  const [pageUrl, setPageUrl] = useState("");
  const [canonicalInput, setCanonicalInput] = useState("");
  const [htmlSnippet, setHtmlSnippet] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [summary, setSummary] = useState<{
    match: boolean;
    pageNorm: string | null;
    canonNorm: string | null;
    fromHtml: string | null;
  } | null>(null);

  const handleCheck = () => {
    if (!ensureAccess()) return;
    const fromHtml = htmlSnippet.trim() ? extractCanonicalFromHtml(htmlSnippet) : null;
    const effectiveCanonical = (canonicalInput.trim() || fromHtml || "").trim();
    const pageNorm = normalizeUrlForComparison(pageUrl);
    const canonNorm = normalizeUrlForComparison(effectiveCanonical);

    if (!pageNorm || !canonNorm) {
      setSummary({
        match: false,
        pageNorm,
        canonNorm,
        fromHtml,
      });
      setUnlocked(true);
      return;
    }

    setSummary({
      match: pageNorm === canonNorm,
      pageNorm,
      canonNorm,
      fromHtml,
    });
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <LinkSlashIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Canonical URL Checker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Compare a page URL to a canonical URL (or extract canonical from HTML)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="canon-page">Page URL</Label>
            <Input
              id="canon-page"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="https://example.com/blog/post"
              className="rounded-xl h-11 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="canon-href">Canonical URL (optional if you paste HTML below)</Label>
            <Input
              id="canon-href"
              value={canonicalInput}
              onChange={(e) => setCanonicalInput(e.target.value)}
              placeholder="https://example.com/blog/post/"
              className="rounded-xl h-11 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="canon-html">HTML snippet (optional)</Label>
            <textarea
              id="canon-html"
              value={htmlSnippet}
              onChange={(e) => setHtmlSnippet(e.target.value)}
              placeholder='<link rel="canonical" href="https://example.com/blog/post" />'
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-xs"
              spellCheck={false}
            />
            <p className="text-xs text-slate-500">
              If canonical field is empty, the first rel=&quot;canonical&quot; link in the snippet is used.
            </p>
          </div>

          <Button onClick={handleCheck} className="gap-2">
            <LinkSlashIcon className="size-4" />
            Compare URLs
          </Button>

          {unlocked && summary && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4 text-sm">
              {summary.fromHtml && (
                <p className="text-slate-600 dark:text-slate-400">
                  Canonical from HTML:{" "}
                  <span className="font-mono text-xs break-all">{summary.fromHtml}</span>
                </p>
              )}
              {!summary.pageNorm || !summary.canonNorm ? (
                <p className="text-amber-600 dark:text-amber-400">
                  Enter a valid page URL and a canonical URL (directly or via HTML).
                </p>
              ) : (
                <>
                  <p
                    className={`font-semibold ${
                      summary.match
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {summary.match
                      ? "Normalized URLs match (same protocol, host, path, query)."
                      : "Normalized URLs differ — review duplicates and redirects."}
                  </p>
                  <div className="space-y-1 font-mono text-xs break-all text-slate-700 dark:text-slate-300">
                    <p>
                      <span className="text-slate-500">Page: </span>
                      {summary.pageNorm}
                    </p>
                    <p>
                      <span className="text-slate-500">Canonical: </span>
                      {summary.canonNorm}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Trailing slashes on the path are removed for comparison; query strings are kept.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

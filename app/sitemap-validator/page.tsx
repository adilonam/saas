"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

type CheckResult = {
  ok: boolean;
  messages: string[];
  urlCount: number;
};

function validateSitemapXml(xml: string): CheckResult {
  const messages: string[] = [];
  const trimmed = xml.trim();
  if (!trimmed) {
    return { ok: false, messages: ["Paste XML content first."], urlCount: 0 };
  }

  let doc: Document;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(trimmed, "text/xml");
  } catch {
    return { ok: false, messages: ["Could not parse as XML."], urlCount: 0 };
  }

  const parseErr = doc.querySelector("parsererror");
  if (parseErr) {
    return {
      ok: false,
      messages: ["XML is not well-formed (parser error)."],
      urlCount: 0,
    };
  }

  const root = doc.documentElement;
  const localName = root.localName || root.nodeName.replace(/^.*:/, "");
  if (localName.toLowerCase() !== "urlset") {
    messages.push(`Expected root element urlset; found <${localName}>.`);
  }

  const urls = doc.getElementsByTagName("url");
  const urlCount = urls.length;
  if (urlCount === 0) {
    messages.push("No url entries found.");
  } else {
    messages.push(`Found ${urlCount} url element(s).`);
  }

  let locMissing = 0;
  let locEmpty = 0;
  for (let i = 0; i < urls.length; i++) {
    const urlEl = urls.item(i);
    if (!urlEl) continue;
    const locs = urlEl.getElementsByTagName("loc");
    if (locs.length === 0) {
      locMissing += 1;
    } else {
      const text = (locs.item(0)?.textContent || "").trim();
      if (!text) locEmpty += 1;
      else {
        try {
          new URL(text);
        } catch {
          messages.push(`Invalid loc URL: ${text.slice(0, 80)}${text.length > 80 ? "…" : ""}`);
        }
      }
    }
  }
  if (locMissing) {
    messages.push(`${locMissing} url block(s) missing loc.`);
  }
  if (locEmpty) {
    messages.push(`${locEmpty} loc element(s) are empty.`);
  }

  const ok =
    localName.toLowerCase() === "urlset" &&
    urlCount > 0 &&
    locMissing === 0 &&
    locEmpty === 0 &&
    !messages.some((m) => m.startsWith("Invalid loc URL"));

  return { ok, messages, urlCount };
}

export default function SitemapValidatorPage() {
  const { ensureAccess } = useToolAccess();
  const [xml, setXml] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleValidate = () => {
    if (!ensureAccess()) return;
    setResult(validateSitemapXml(xml));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <MapIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sitemap Validator (basic)</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Check well-formed XML, urlset structure, and loc URLs in a sitemap
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sitemap-xml">Sitemap XML</Label>
            <textarea
              id="sitemap-xml"
              value={xml}
              onChange={(e) => setXml(e.target.value)}
              placeholder='<?xml version="1.0"?>...'
              className="w-full min-h-[220px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-xs"
              spellCheck={false}
            />
          </div>

          <Button onClick={handleValidate} className="gap-2">
            <MapIcon className="size-4" />
            Validate sitemap
          </Button>

          {result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p
                className={`text-sm font-semibold ${
                  result.ok
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {result.ok ? "Basic checks passed" : "Issues found"}
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {result.messages.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">
                This does not fetch live URLs or verify indexing. It only inspects the XML you paste.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

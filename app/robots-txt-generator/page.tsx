"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function RobotsTxtGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [userAgent, setUserAgent] = useState("*");
  const [allowAll, setAllowAll] = useState(true);
  const [disallowPaths, setDisallowPaths] = useState("/admin/\n/private/");
  const [sitemapUrl, setSitemapUrl] = useState("https://example.com/sitemap.xml");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!ensureAccess()) return;
    const lines: string[] = [];
    lines.push(`User-agent: ${userAgent.trim() || "*"}`);
    if (allowAll) {
      lines.push("Allow: /");
    }
    const paths = disallowPaths
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    for (const p of paths) {
      lines.push(`Disallow: ${p.startsWith("/") ? p : `/${p}`}`);
    }
    const delay = crawlDelay.trim();
    if (delay && /^\d+$/.test(delay)) {
      lines.push(`Crawl-delay: ${delay}`);
    }
    const sm = sitemapUrl.trim();
    if (sm) {
      try {
        new URL(sm.includes("://") ? sm : `https://${sm}`);
        lines.push("");
        lines.push(`Sitemap: ${sm.includes("://") ? sm : `https://${sm}`}`);
      } catch {
        lines.push("");
        lines.push(`# Sitemap: invalid URL omitted (${sm})`);
      }
    }
    setOutput(lines.join("\n"));
  };

  const copyOut = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Cog6ToothIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Robots.txt Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Build a basic robots.txt for crawlers (allow, disallow, sitemap)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="robots-ua">User-agent</Label>
            <Input
              id="robots-ua"
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              placeholder="*"
              className="rounded-xl h-11 font-mono"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={allowAll}
              onChange={(e) => setAllowAll(e.target.checked)}
              className="rounded border-slate-300"
            />
            Allow entire site (Allow: /)
          </label>
          <div className="space-y-2">
            <Label htmlFor="robots-dis">Disallow paths (one per line)</Label>
            <textarea
              id="robots-dis"
              value={disallowPaths}
              onChange={(e) => setDisallowPaths(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              placeholder="/admin/"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="robots-sm">Sitemap URL (optional)</Label>
            <Input
              id="robots-sm"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className="rounded-xl h-11 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="robots-delay">Crawl-delay seconds (optional, non-standard)</Label>
            <Input
              id="robots-delay"
              value={crawlDelay}
              onChange={(e) => setCrawlDelay(e.target.value)}
              placeholder="e.g. 10"
              className="rounded-xl h-11 w-32 font-mono"
            />
          </div>

          <Button onClick={handleGenerate} className="gap-2">
            <Cog6ToothIcon className="size-4" />
            Generate robots.txt
          </Button>

          {output && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Output</Label>
                <Button type="button" variant="outline" size="sm" onClick={copyOut}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

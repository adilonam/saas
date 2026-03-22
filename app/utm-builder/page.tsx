"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function appendParams(base: string, params: Record<string, string>): string | null {
  const trimmed = base.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    for (const [k, v] of Object.entries(params)) {
      const val = v.trim();
      if (val) u.searchParams.set(k, val);
    }
    return u.toString();
  } catch {
    return null;
  }
}

export default function UtmBuilderPage() {
  const { ensureAccess } = useToolAccess();
  const [baseUrl, setBaseUrl] = useState("https://example.com/landing");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [built, setBuilt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    if (!utmSource.trim() || !utmMedium.trim() || !utmCampaign.trim()) {
      setError("utm_source, utm_medium, and utm_campaign are required.");
      setBuilt(null);
      return;
    }
    const url = appendParams(baseUrl, {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent,
    });
    if (!url) {
      setError("Invalid base URL.");
      setBuilt(null);
      return;
    }
    setError(null);
    setBuilt(url);
    setUnlocked(true);
  };

  const copyUrl = async () => {
    if (!built) return;
    await navigator.clipboard.writeText(built);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <ArrowTrendingUpIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">UTM Campaign URL Builder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Add UTM parameters for analytics (source, medium, campaign, and more)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="utm-base">Landing page URL</Label>
            <Input
              id="utm-base"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="rounded-xl h-11 font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="utm_source">utm_source *</Label>
              <Input
                id="utm_source"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="newsletter"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utm_medium">utm_medium *</Label>
              <Input
                id="utm_medium"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="email"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="utm_campaign">utm_campaign *</Label>
              <Input
                id="utm_campaign"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="spring_sale"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utm_term">utm_term (optional)</Label>
              <Input
                id="utm_term"
                value={utmTerm}
                onChange={(e) => setUtmTerm(e.target.value)}
                placeholder="paid keywords"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utm_content">utm_content (optional)</Label>
              <Input
                id="utm_content"
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                placeholder="banner_a"
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <ArrowTrendingUpIcon className="size-4" />
            Build URL
          </Button>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          {unlocked && built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <Label>Final URL</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input readOnly value={built} className="rounded-xl h-11 font-mono text-xs flex-1" />
                <Button type="button" variant="outline" onClick={copyUrl}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

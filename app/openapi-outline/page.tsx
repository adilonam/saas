"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DocumentDuplicateIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { buildOpenApiOutline, parseOpenApiDocument } from "@/lib/dev-tools/openapi-outline";

const ta =
  "w-full min-h-[220px] rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function OpenapiOutlinePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [raw, setRaw] = useState("");
  const [outline, setOutline] = useState("");
  const [narration, setNarration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const buildOutline = () => {
    if (!guardToolAccess(status, session, pathname, "/openapi-outline", router)) return;
    setError(null);
    setNarration("");
    try {
      const spec = parseOpenApiDocument(raw);
      setOutline(buildOpenApiOutline(spec));
    } catch (e) {
      setOutline("");
      setError(e instanceof Error ? e.message : "Could not parse document.");
    }
  };

  const narrate = async () => {
    if (!outline.trim()) {
      setAiError("Build an outline first.");
      return;
    }
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/openapi-outline")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setNarration("");
    try {
      const res = await fetch("/api/openapi-outline-narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") {
          router.push("/pricing");
          return;
        }
        setAiError(data.error || "Narration failed.");
        return;
      }
      setNarration(typeof data.text === "string" ? data.text : "");
    } catch {
      setAiError("Request failed.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <DocumentDuplicateIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OpenAPI outline</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Paste JSON or YAML, get a readable outline; optional AI narration (subscription).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="spec">OpenAPI document</Label>
            <textarea
              id="spec"
              className={ta}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder='openapi: 3.0.0 ...  or  { "openapi": "3.0.0", ... }'
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={buildOutline} disabled={!raw.trim()} className="gap-2">
              <DocumentDuplicateIcon className="size-4" />
              Build outline
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={narrate}
              disabled={!outline.trim() || aiLoading}
              className="gap-2"
            >
              {aiLoading ?
                <Loader2 className="size-4 animate-spin" />
              : null}
              Optional AI narration
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {aiError && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {outline && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Outline (markdown)</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(360px,45vh)] font-mono whitespace-pre-wrap">
                {outline}
              </pre>
              <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(outline)}>
                Copy outline
              </Button>
            </div>
          )}

          {narration && (
            <div className="space-y-2">
              <Label>AI narration</Label>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-background p-4 text-sm whitespace-pre-wrap">
                {narration}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

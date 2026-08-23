"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LanguageIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

const PAGE = "/locale-bcp47-helper";

const EXAMPLES = ["en-US", "en-GB", "pt-BR", "zh-Hans-CN", "fr-CA", "und"];

export default function LocaleBcp47HelperPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [tag, setTag] = useState("en-US");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canonical, setCanonical] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    setError(null);
    const t = tag.trim();
    if (!t) {
      setError("Enter a BCP-47 language tag.");
      setUnlocked(false);
      return;
    }
    try {
      const loc = new Intl.Locale(t);
      const [canon] = Intl.getCanonicalLocales(loc.toString());
      setCanonical(canon);
      const lines: string[] = [];
      lines.push(`Base name: ${loc.baseName}`);
      if (loc.language) lines.push(`Language: ${loc.language}`);
      if (loc.script) lines.push(`Script: ${loc.script}`);
      if (loc.region) lines.push(`Region: ${loc.region}`);
      if (loc.calendar) lines.push(`Calendar: ${loc.calendar}`);
      if (loc.numberingSystem) lines.push(`Numbering system: ${loc.numberingSystem}`);

      try {
        const langNames = new Intl.DisplayNames([canon], { type: "language" });
        const dn = langNames.of(loc.language);
        if (dn) lines.push(`Language display: ${dn}`);
      } catch {
        /* ignore */
      }
      if (loc.region) {
        try {
          const regNames = new Intl.DisplayNames([canon], { type: "region" });
          const rn = regNames.of(loc.region);
          if (rn) lines.push(`Region display: ${rn}`);
        } catch {
          /* ignore */
        }
      }
      setDetails(lines);
      setUnlocked(true);
    } catch {
      setError("Invalid or unsupported BCP-47 tag for this browser.");
      setUnlocked(false);
      setCanonical(null);
      setDetails([]);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <LanguageIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Locale ↔ BCP-47 helper</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Validate tags, canonicalize with Intl, and read language/region fields.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tag">BCP-47 tag</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setUnlocked(false);
              }}
              className="rounded-xl font-mono text-sm"
              placeholder="en-US"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setTag(ex);
                  setUnlocked(false);
                }}
              >
                {ex}
              </Button>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={!tag.trim()} className="gap-2">
            <LanguageIcon className="h-4 w-4" />
            Resolve
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && canonical && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm">
                <span className="text-slate-500 dark:text-slate-400">Canonical: </span>
                <code className="font-mono text-slate-900 dark:text-white">{canonical}</code>
              </p>
              <ul className="text-sm text-slate-700 dark:text-slate-200 space-y-1 list-disc pl-5">
                {details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

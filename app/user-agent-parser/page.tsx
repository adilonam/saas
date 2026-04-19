"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { parseUserAgent } from "@/lib/parse-user-agent";

const PAGE = "/user-agent-parser";

export default function UserAgentParserPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [ua, setUa] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const parsed = ua.trim() ? parseUserAgent(ua) : null;

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    if (!ua.trim()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <DevicePhoneMobileIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User-agent parser</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Best-effort browser, OS, and device hints from a classic User-Agent string.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ua">User-Agent</Label>
            <textarea
              id="ua"
              value={ua}
              onChange={(e) => {
                setUa(e.target.value);
                setUnlocked(false);
              }}
              className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Paste a User-Agent header value…"
            />
          </div>

          <Button onClick={handleSubmit} disabled={!ua.trim()} className="gap-2">
            <DevicePhoneMobileIcon className="h-4 w-4" />
            Parse
          </Button>

          {unlocked && parsed && (
            <dl className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-1 sm:gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Browser</dt>
                <dd className="text-slate-900 dark:text-white">{parsed.browser}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Engine</dt>
                <dd>{parsed.engine}</dd>
                <dt className="text-slate-500 dark:text-slate-400">OS</dt>
                <dd>{parsed.os}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Device</dt>
                <dd>{parsed.device}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Mobile</dt>
                <dd>{parsed.mobile ? "Likely yes" : "Likely no"}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

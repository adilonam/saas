"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CircleStackIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { formatExplainPlan } from "@/lib/dev-tools/sql-explain-format";

const ta =
  "w-full min-h-[220px] rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function SqlExplainFormatterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [raw, setRaw] = useState("");
  const [out, setOut] = useState("");

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/sql-explain-formatter", router)) return;
    setOut(formatExplainPlan(raw));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <CircleStackIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SQL EXPLAIN formatter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Read-only tidy-up for pasted plans — no queries are executed.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="plan">EXPLAIN output</Label>
            <textarea id="plan" className={ta} value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>

          <Button type="button" onClick={submit} disabled={!raw.trim()} className="gap-2">
            <CircleStackIcon className="size-4" />
            Format
          </Button>

          {out && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Formatted</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(400px,50vh)] font-mono whitespace-pre-wrap">
                {out}
              </pre>
              <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(out)}>
                Copy
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { diffEnvMaps, formatEnvDiff } from "@/lib/dev-tools/env-diff";

const ta =
  "w-full min-h-[160px] rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function EnvVarDiffPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [a, setA] = useState("API_URL=https://api.example.com\nDB_PASSWORD=secret123");
  const [b, setB] = useState("API_URL=https://api.example.com\nDB_PASSWORD=othersecret");
  const [out, setOut] = useState("");

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/env-var-diff", router)) return;
    const rows = diffEnvMaps(a, b);
    setOut(formatEnvDiff(rows));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <ArrowsRightLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Environment variable diff</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Compare two `.env`-style files; values matching sensitive keys are redacted.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="env-a">File A</Label>
              <textarea id="env-a" className={ta} value={a} onChange={(e) => setA(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-b">File B</Label>
              <textarea id="env-b" className={ta} value={b} onChange={(e) => setB(e.target.value)} />
            </div>
          </div>

          <Button type="button" onClick={submit} className="gap-2">
            <ArrowsRightLeftIcon className="size-4" />
            Diff
          </Button>

          {out && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Diff (redacted)</Label>
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

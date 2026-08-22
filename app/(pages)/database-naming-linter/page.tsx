"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { lintDbName } from "@/lib/dev-tools/db-naming";

export default function DatabaseNamingLinterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [kind, setKind] = useState<"table" | "column">("table");
  const [raw, setRaw] = useState("user_profile\nOrderItem\ncustomer_id");
  const [lines, setLines] = useState<{ name: string; level: string; message: string }[]>([]);

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/database-naming-linter", router)) return;
    const names = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setLines(names.map((n) => {
      const r = lintDbName(n, kind);
      return { name: r.name, level: r.level, message: r.message };
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <FunnelIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Database naming linter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              snake_case checks and light pluralization hints for identifiers.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Lint as</legend>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === "table"}
                  onChange={() => setKind("table")}
                />
                Table
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === "column"}
                  onChange={() => setKind("column")}
                />
                Column
              </label>
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="names">Names (one per line)</Label>
            <textarea
              id="names"
              className="w-full min-h-[180px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </div>

          <Button type="button" onClick={submit} disabled={!raw.trim()} className="gap-2">
            <FunnelIcon className="size-4" />
            Lint
          </Button>

          {lines.length > 0 && (
            <ul className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              {lines.map((row, i) => (
                <li
                  key={`${i}-${row.name}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-background p-4 text-sm"
                >
                  <p className="font-mono font-medium">{row.name}</p>
                  <p
                    className={
                      row.level === "bad" ?
                        "text-rose-600 dark:text-rose-400 mt-1"
                      : row.level === "warn" ?
                        "text-amber-600 dark:text-amber-400 mt-1"
                      : "text-emerald-600 dark:text-emerald-400 mt-1"
                    }
                  >
                    <span className="uppercase text-xs font-semibold mr-2">{row.level}</span>
                    {row.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

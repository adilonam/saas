"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { format } from "sql-formatter";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CircleStackIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

const DIALECTS = [
  { value: "sql", label: "ANSI SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mariadb", label: "MariaDB" },
  { value: "tsql", label: "T-SQL" },
  { value: "plsql", label: "PL/SQL" },
] as const;

export default function SqlFormatterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [dialect, setDialect] = useState<(typeof DIALECTS)[number]["value"]>("sql");
  const [output, setOutput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormat = () => {
    if (!guardToolAccess(status, session, pathname, "/sql-formatter", router)) {
      return;
    }
    setError(null);
    try {
      const formatted = format(text.trim(), { language: dialect });
      setOutput(formatted);
      setUnlocked(true);
    } catch {
      setError("Could not format this SQL. Check syntax for the selected dialect.");
      setOutput("");
      setUnlocked(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <CircleStackIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SQL Formatter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Pretty-print SQL with dialect-aware rules.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sql-dialect">Dialect</Label>
            <select
              id="sql-dialect"
              value={dialect}
              onChange={(e) =>
                setDialect(e.target.value as (typeof DIALECTS)[number]["value"])
              }
              className="w-full max-w-xs rounded-xl border border-input bg-background px-3 py-2 text-sm h-11"
            >
              {DIALECTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sql-in">SQL</Label>
            <textarea
              id="sql-in"
              className="w-full min-h-[180px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setUnlocked(false);
              }}
              placeholder="SELECT id, name FROM users WHERE active = 1 ORDER BY name;"
            />
          </div>

          <Button onClick={handleFormat} disabled={!text.trim()} className="gap-2">
            <CircleStackIcon className="h-4 w-4" />
            Format
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && output !== "" && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Label>Formatted</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(400px,50vh)] font-mono whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SignalIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import {
  HTTP_STATUS_CODES,
  findHttpStatus,
} from "@/lib/http-status-codes";

export default function HttpStatusCodeExplainerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [codeInput, setCodeInput] = useState("");
  const [filter, setFilter] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [lookup, setLookup] = useState<ReturnType<typeof findHttpStatus>>(undefined);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return HTTP_STATUS_CODES;
    return HTTP_STATUS_CODES.filter(
      (e) =>
        String(e.code).includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
    );
  }, [filter]);

  const handleExplain = () => {
    if (!guardToolAccess(status, session, pathname, "/http-status-code-explainer", router)) {
      return;
    }
    setUnlocked(true);
    const n = parseInt(codeInput.trim(), 10);
    if (Number.isFinite(n) && codeInput.trim() !== "") {
      setLookup(findHttpStatus(n));
    } else {
      setLookup(undefined);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <SignalIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HTTP Status Code Explainer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Look up common HTTP status codes and filter the full reference list.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Status code (optional)</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setUnlocked(false);
              }}
              placeholder="e.g. 404"
              className="rounded-xl max-w-xs font-mono"
            />
          </div>

          <Button onClick={handleExplain} className="gap-2">
            <SignalIcon className="h-4 w-4" />
            Open reference
          </Button>

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-6">
              {lookup ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950/40 p-4">
                  <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                    {lookup.code}{" "}
                    <span className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                      {lookup.name}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {lookup.description}
                  </p>
                </div>
              ) : codeInput.trim() !== "" ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  No entry for that code in this list. Try the table below or another code.
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="filter">Filter table</Label>
                <Input
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search by code, name, or description..."
                  className="rounded-xl"
                />
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[min(360px,50vh)] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium w-20">Code</th>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium hidden sm:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr
                        key={row.code}
                        className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      >
                        <td className="px-3 py-2 font-mono font-medium">{row.code}</td>
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                          {row.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

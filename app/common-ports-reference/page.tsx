"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServerStackIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { COMMON_PORTS } from "@/lib/common-ports-data";

const PAGE = "/common-ports-reference";

export default function CommonPortsReferencePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMON_PORTS;
    return COMMON_PORTS.filter(
      (r) =>
        String(r.port).includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.note.toLowerCase().includes(q) ||
        r.proto.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <ServerStackIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Common ports reference</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Cheat sheet for well-known TCP/UDP ports with short explanations.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="q">Filter (optional)</Label>
            <Input
              id="q"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setUnlocked(false);
              }}
              placeholder="443, postgres, dns…"
              className="rounded-xl"
            />
          </div>

          <Button onClick={handleSubmit} className="gap-2">
            <ServerStackIcon className="h-4 w-4" />
            Show table
          </Button>

          {unlocked && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-4 font-medium">Port</th>
                    <th className="py-2 pr-4 font-medium">Proto</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={`${r.port}-${r.name}`} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 pr-4 font-mono">{r.port}</td>
                      <td className="py-2 pr-4">{r.proto}</td>
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-300">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-sm text-slate-500 py-4">No rows match that filter.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

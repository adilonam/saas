"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CpuChipIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

export default function UuidGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [uuids, setUuids] = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!guardToolAccess(status, session, pathname, "/uuid-generator", router)) {
      return;
    }
    const id = crypto.randomUUID();
    setUuids((prev) => [id, ...prev].slice(0, 20));
    setUnlocked(true);
  };

  const copyOne = (u: string) => {
    void navigator.clipboard.writeText(u).then(() => {
      setCopied(u);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <CpuChipIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">UUID Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Generate RFC 4122 version 4 UUIDs in the browser.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label>Output</Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Each click adds a new UUID (up to 20 kept in this session).
            </p>
          </div>

          <Button onClick={handleGenerate} className="gap-2">
            <CpuChipIcon className="h-4 w-4" />
            Generate UUID
          </Button>

          {unlocked && uuids.length > 0 && (
            <ul className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              {uuids.map((u) => (
                <li
                  key={u}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 text-slate-100 px-3 py-2 font-mono text-sm"
                >
                  <span className="flex-1 min-w-0 break-all">{u}</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => copyOne(u)}
                  >
                    {copied === u ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPinIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { analyzeCidr } from "@/lib/cidr";

const PAGE = "/cidr-calculator";

export default function CidrCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [input, setInput] = useState("192.168.1.0/24");
  const [unlocked, setUnlocked] = useState(false);

  const parsed = analyzeCidr(input);
  const error = parsed.ok === false ? parsed.error : null;
  const info = parsed.ok === true ? parsed.info : null;

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    if (!parsed.ok) {
      setUnlocked(false);
      return;
    }
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <MapPinIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CIDR calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              IPv4 network, mask, broadcast, and usable host range from CIDR notation.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cidr">IPv4 CIDR</Label>
            <Input
              id="cidr"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setUnlocked(false);
              }}
              className="rounded-xl font-mono text-sm"
              placeholder="10.0.0.0/16"
            />
          </div>

          <Button onClick={handleSubmit} disabled={!input.trim()} className="gap-2">
            <MapPinIcon className="h-4 w-4" />
            Calculate
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && info && (
            <dl className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <dt className="text-slate-500 dark:text-slate-400">Canonical CIDR</dt>
                <dd className="font-mono text-slate-900 dark:text-white">{info.cidr}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Network</dt>
                <dd className="font-mono">{info.network}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Netmask</dt>
                <dd className="font-mono">{info.netmask}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Wildcard</dt>
                <dd className="font-mono">{info.wildcard}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Broadcast</dt>
                <dd className="font-mono">{info.broadcast}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Total addresses</dt>
                <dd className="font-mono">{info.totalAddresses.toString()}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Usable hosts</dt>
                <dd className="font-mono">{info.usableHosts.toString()}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs mb-1">Usable range</dt>
                <dd className="font-mono text-slate-900 dark:text-white break-all">{info.usableRange}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

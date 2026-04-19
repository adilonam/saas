"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalculatorIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { intToIpv4 } from "@/lib/cidr";

const PAGE = "/ip-integer-converter";

function ipv4ToInt(s: string): number | null {
  const parts = s.trim().split(".").map((x) => Number(x));
  if (parts.length !== 4) return null;
  if (parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
  return (((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0) as number;
}

export default function IpIntegerConverterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [value, setValue] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dotted, setDotted] = useState<string | null>(null);
  const [integer, setInteger] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    const v = value.trim();
    setError(null);
    if (!v) {
      setError("Enter an IPv4 address or a 32-bit unsigned integer.");
      setUnlocked(false);
      return;
    }
    if (/^\d+$/.test(v)) {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0 || n > 4294967295) {
        setError("Integer must be between 0 and 4294967295.");
        setUnlocked(false);
        return;
      }
      const u = n >>> 0;
      setDotted(intToIpv4(u));
      setInteger(u.toString());
      setUnlocked(true);
      return;
    }
    const ip = ipv4ToInt(v);
    if (ip === null) {
      setError("Could not parse IPv4. Use four octets (0–255) or a decimal integer.");
      setUnlocked(false);
      return;
    }
    setDotted(intToIpv4(ip));
    setInteger((ip >>> 0).toString());
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IP ↔ integer converter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Convert dotted IPv4 to a 32-bit decimal and back (unsigned).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ip-or-int">IPv4 or integer</Label>
            <Input
              id="ip-or-int"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setUnlocked(false);
              }}
              className="rounded-xl font-mono text-sm"
              placeholder="192.168.0.1 or 3232235521"
            />
          </div>

          <Button onClick={handleSubmit} disabled={!value.trim()} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Convert
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && dotted && integer && (
            <dl className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 font-mono text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs font-sans mb-0.5">Dotted decimal</dt>
                <dd className="text-slate-900 dark:text-white">{dotted}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs font-sans mb-0.5">32-bit unsigned</dt>
                <dd className="text-slate-900 dark:text-white">{integer}</dd>
              </div>
            </dl>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            IPv6 is not supported here; use a dedicated IPv6 tool for 128-bit addresses.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

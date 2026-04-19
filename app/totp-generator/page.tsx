"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import {
  base32ToBytes,
  secondsIntoPeriod,
  totpCodeAt,
} from "@/lib/totp";
import { KeyIcon } from "@heroicons/react/24/outline";

export default function TotpGeneratorPage() {
  const { assertAccess } = useSubscribedToolAccess("/totp-generator");
  const [secret, setSecret] = useState("JBSWY3DPEHPK3PXP");
  const [period, setPeriod] = useState(30);
  const [digits, setDigits] = useState(6);
  const [now, setNow] = useState(() => Date.now());
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const run = async () => {
      const bytes = base32ToBytes(secret);
      if (!bytes || bytes.length === 0) {
        setErr("Invalid Base32 secret.");
        setCode("");
        return;
      }
      setErr(null);
      try {
        const c = await totpCodeAt(bytes, now, period, digits);
        setCode(c);
      } catch {
        setErr("Could not derive TOTP.");
        setCode("");
      }
    };
    void run();
  }, [secret, period, digits, now, unlocked]);

  const handleGenerate = () => {
    if (!assertAccess()) return;
    setUnlocked(true);
  };

  const into = secondsIntoPeriod(now, period);
  const remaining = period - into;

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <KeyIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TOTP generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              RFC 6238 TOTP (SHA-1) from a Base32 secret using your browser clock.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sec">Secret (Base32)</Label>
            <input
              id="sec"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono uppercase"
              value={secret}
              onChange={(e) => setSecret(e.target.value.replace(/\s/g, ""))}
              spellCheck={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Period (seconds)</Label>
              <input
                id="period"
                type="number"
                min={5}
                max={300}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value) || 30)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="digits">Digits</Label>
              <select
                id="digits"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm h-10"
                value={digits}
                onChange={(e) => setDigits(Number(e.target.value))}
              >
                {[6, 7, 8].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!secret.trim()}
            className="gap-2"
          >
            <KeyIcon className="size-4" />
            Show codes
          </Button>

          {err && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{err}</p>
          )}

          {unlocked && code && !err && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 text-center space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current code
              </p>
              <p className="text-4xl font-mono font-bold tracking-[0.2em] text-slate-900 dark:text-white">
                {code}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Next rotation in {remaining}s (period {period}s)
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

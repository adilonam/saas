"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { generatePassword } from "@/lib/text-productivity";

export default function PasswordGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/password-generator")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setGenError(null);
    try {
      setPassword(
        generatePassword({
          length,
          uppercase,
          lowercase,
          numbers,
          symbols,
        }),
      );
      setUnlocked(true);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Could not generate password");
    }
  };

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setGenError("Could not copy to clipboard");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
            <KeyIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Password Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Random, configurable character sets
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pg-length">Length ({length})</Label>
            <input
              id="pg-length"
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full max-w-md accent-dashboard-primary"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            {(
              [
                ["uppercase", uppercase, setUppercase, "A–Z"],
                ["lowercase", lowercase, setLowercase, "a–z"],
                ["numbers", numbers, setNumbers, "0–9"],
                ["symbols", symbols, setSymbols, "!@#…"],
              ] as const
            ).map(([id, checked, set, hint]) => (
              <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => set(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="capitalize">{id}</span>
                <span className="text-slate-400">({hint})</span>
              </label>
            ))}
          </div>
          {genError && <p className="text-sm text-red-600 dark:text-red-400">{genError}</p>}
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <KeyIcon className="h-4 w-4" />
            Generate password
          </Button>

          {unlocked && password && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <Label htmlFor="pg-out">Your password</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="pg-out"
                  readOnly
                  value={password}
                  className="rounded-xl h-11 font-mono text-sm flex-1"
                />
                <Button type="button" variant="outline" onClick={handleCopy} className="gap-2 shrink-0">
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

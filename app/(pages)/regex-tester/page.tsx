"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function RegexTesterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [pattern, setPattern] = useState("\\d+");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("Hello 123 world 456");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const result = useMemo(() => {
    if (!pattern.trim()) return { valid: true, matches: [], error: null };
    try {
      const re = new RegExp(pattern, flags);
      const matches: { match: string; index: number }[] = [];
      let m: RegExpExecArray | null;
      const re2 = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
      while ((m = re2.exec(testString)) !== null) {
        matches.push({ match: m[0], index: m.index });
      }
      return { valid: true, matches, error: null };
    } catch (e) {
      return { valid: false, matches: [], error: e instanceof Error ? e.message : "Invalid regex" };
    }
  }, [pattern, flags, testString]);

  const handleTest = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/regex-tester")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setResultUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <MagnifyingGlassIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Regex Tester Online</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Test regular expressions against sample text
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pattern">Regex pattern</Label>
            <Input
              id="pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \d+ or [a-z]+"
              className="rounded-xl h-11 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flags">Flags (e.g. g, i, m)</Label>
            <Input
              id="flags"
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="g"
              className="rounded-xl h-11 font-mono w-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-string">Test string</Label>
            <textarea
              id="test-string"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              placeholder="Enter text to test..."
              spellCheck={false}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleTest} className="gap-2">
              <MagnifyingGlassIcon className="h-4 w-4" />
              Test regex
            </Button>
          </div>

          {resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              {!result.valid && (
                <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
              )}
              {result.valid && (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {result.matches.length} match(es)
                  </p>
                  <ul className="space-y-1">
                    {result.matches.map((m, i) => (
                      <li key={i} className="font-mono text-sm text-slate-700 dark:text-slate-300">
                        &quot;{m.match}&quot; at index {m.index}
                      </li>
                    ))}
                  </ul>
                  {result.matches.length === 0 && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No matches found.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

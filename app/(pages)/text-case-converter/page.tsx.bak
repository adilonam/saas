"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { convertTextCase, type CaseMode } from "@/lib/text-productivity";

const MODES: { value: CaseMode; label: string }[] = [
  { value: "upper", label: "UPPERCASE" },
  { value: "lower", label: "lowercase" },
  { value: "title", label: "Title Case" },
  { value: "sentence", label: "Sentence case" },
];

export default function TextCaseConverterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseMode>("title");
  const [unlocked, setUnlocked] = useState(false);
  const [output, setOutput] = useState("");

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/text-case-converter")}`,
      );
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setOutput(convertTextCase(text, mode));
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <ArrowsRightLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Text Case Converter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Upper, lower, title, or sentence case
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tcc-mode">Target case</Label>
            <select
              id="tcc-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as CaseMode)}
              className="w-full max-w-xs h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tcc-input">Input</Label>
            <textarea
              id="tcc-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              placeholder="Paste text to convert…"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <ArrowsRightLeftIcon className="h-4 w-4" />
            Convert case
          </Button>

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Label htmlFor="tcc-output">Result</Label>
              <textarea
                id="tcc-output"
                readOnly
                value={output}
                className="w-full min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 p-4 text-sm font-mono"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

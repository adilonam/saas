"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import {
  base32ToText,
  hexToText,
  textToBase32,
  textToHex,
} from "@/lib/secret-encoding";
import { CpuChipIcon } from "@heroicons/react/24/outline";

type Mode = "text2hex" | "hex2text" | "text2b32" | "b32totext";

export default function SecretEncoderPage() {
  const { assertAccess } = useSubscribedToolAccess("/secret-encoder");
  const [mode, setMode] = useState<Mode>("text2hex");
  const [input, setInput] = useState("hello");
  const [output, setOutput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const handleRun = () => {
    if (!assertAccess()) return;
    setErr(null);
    setOutput("");
    try {
      if (mode === "text2hex") setOutput(textToHex(input));
      else if (mode === "hex2text") {
        const t = hexToText(input);
        if (t === null) setErr("Invalid hex or invalid UTF-8.");
        else setOutput(t);
      } else if (mode === "text2b32") setOutput(textToBase32(input));
      else {
        const t = base32ToText(input);
        if (t === null) setErr("Invalid Base32 or invalid UTF-8.");
        else setOutput(t);
      }
    } catch {
      setErr("Could not convert.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <CpuChipIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Secret encoder (hex / Base32)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Encode or decode UTF-8 text as hex or Base32 (handy for TOTP
              secrets and byte dumps).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label>Mode</Label>
            <select
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm h-10"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
            >
              <option value="text2hex">Text → hex (UTF-8 bytes)</option>
              <option value="hex2text">Hex → text (UTF-8)</option>
              <option value="text2b32">Text → Base32 (UTF-8 bytes)</option>
              <option value="b32totext">Base32 → text (UTF-8)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="in">Input</Label>
            <textarea
              id="in"
              className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <Button type="button" onClick={handleRun} className="gap-2">
            <CpuChipIcon className="size-4" />
            Convert
          </Button>

          {err && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{err}</p>
          )}

          {output && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Label>Output</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-sm font-mono whitespace-pre-wrap break-all">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

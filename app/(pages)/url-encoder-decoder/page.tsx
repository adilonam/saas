"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  LinkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

type Mode = "encode" | "decode";

export default function UrlEncoderDecoderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = () => {
    if (!guardToolAccess(status, session, pathname, "/url-encoder-decoder", router)) {
      return;
    }
    setError(null);
    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input.trim()));
      }
      setUnlocked(true);
    } catch {
      setError("Invalid percent-encoding for decode, or encoding failed.");
      setOutput("");
      setUnlocked(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <LinkIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">URL Encoder / Decoder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Uses encodeURIComponent / decodeURIComponent (UTF-8).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              Mode
            </legend>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="url-mode"
                  checked={mode === "encode"}
                  onChange={() => {
                    setMode("encode");
                    setUnlocked(false);
                  }}
                />
                Encode
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="url-mode"
                  checked={mode === "decode"}
                  onChange={() => {
                    setMode("decode");
                    setUnlocked(false);
                  }}
                />
                Decode
              </label>
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="url-in">{mode === "encode" ? "Raw text" : "Encoded string"}</Label>
            <textarea
              id="url-in"
              className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setUnlocked(false);
              }}
              placeholder={
                mode === "encode"
                  ? "hello world & more"
                  : "hello%20world%20%26%20more"
              }
            />
          </div>

          <Button onClick={handleRun} disabled={!input} className="gap-2">
            <LinkIcon className="h-4 w-4" />
            {mode === "encode" ? "Encode" : "Decode"}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && output !== "" && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Label>Result</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-48 font-mono whitespace-pre-wrap break-all">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

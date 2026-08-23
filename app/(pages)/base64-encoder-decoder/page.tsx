"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

type Mode = "encode" | "decode";

function encodeBase64Utf8(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64Utf8(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

export default function Base64EncoderDecoderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = () => {
    if (!guardToolAccess(status, session, pathname, "/base64-encoder-decoder", router)) {
      return;
    }
    setError(null);
    try {
      if (mode === "encode") {
        setOutput(encodeBase64Utf8(input));
      } else {
        setOutput(decodeBase64Utf8(input.trim()));
      }
      setUnlocked(true);
    } catch {
      setError(
        mode === "decode"
          ? "Invalid Base64 or binary data cannot be decoded as UTF-8."
          : "Could not encode input.",
      );
      setOutput("");
      setUnlocked(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <ArrowsRightLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Base64 Encoder / Decoder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Encode or decode text with UTF-8-safe Base64.
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
                  name="b64-mode"
                  checked={mode === "encode"}
                  onChange={() => {
                    setMode("encode");
                    setUnlocked(false);
                  }}
                />
                Encode to Base64
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="b64-mode"
                  checked={mode === "decode"}
                  onChange={() => {
                    setMode("decode");
                    setUnlocked(false);
                  }}
                />
                Decode from Base64
              </label>
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="b64-in">{mode === "encode" ? "Plain text" : "Base64"}</Label>
            <textarea
              id="b64-in"
              className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setUnlocked(false);
              }}
              placeholder={mode === "encode" ? "Hello, world!" : "SGVsbG8sIHdvcmxkIQ=="}
            />
          </div>

          <Button onClick={handleRun} disabled={!input} className="gap-2">
            <ArrowsRightLeftIcon className="h-4 w-4" />
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
              <Label>{mode === "encode" ? "Base64" : "Plain text"}</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-64 font-mono whitespace-pre-wrap break-all">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

function bufferToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default function HmacPlaygroundPage() {
  const { assertAccess } = useSubscribedToolAccess("/hmac-playground");
  const [secret, setSecret] = useState("my-shared-secret");
  const [body, setBody] = useState('{"id":"evt_1"}');
  const [hex, setHex] = useState("");
  const [b64, setB64] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const handleCompute = async () => {
    if (!assertAccess()) return;
    setErr(null);
    setHex("");
    setB64("");
    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
      setHex(bufferToHex(sig));
      setB64(bufferToBase64(sig));
    } catch {
      setErr("Could not compute HMAC (check browser crypto support).");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <ShieldCheckIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HMAC SHA-256</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Sign a UTF-8 message with a UTF-8 secret (Web Crypto). Compare with
              Stripe-style v1 signatures or custom webhooks.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="secret">Secret (UTF-8)</Label>
            <input
              id="secret"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message / body (UTF-8)</Label>
            <textarea
              id="body"
              className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <Button type="button" onClick={() => void handleCompute()} className="gap-2">
            <ShieldCheckIcon className="size-4" />
            Compute HMAC
          </Button>

          {err && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{err}</p>
          )}

          {(hex || b64) && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <Label className="mb-2 block">Hex (lowercase)</Label>
                <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs font-mono break-all">
                  {hex}
                </pre>
              </div>
              <div>
                <Label className="mb-2 block">Base64</Label>
                <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs font-mono break-all">
                  {b64}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

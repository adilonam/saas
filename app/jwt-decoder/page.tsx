"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  KeyIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=====".slice(0, 4 - pad);
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

function tryParseJson(str: string): object | null {
  try {
    return JSON.parse(str) as object;
  } catch {
    return null;
  }
}

type Decoded = {
  header: object | null;
  payload: object | null;
  signature: string;
  error?: string;
};

function decodeJwt(token: string): Decoded {
  const trimmed = token.trim();
  if (!trimmed) {
    return { header: null, payload: null, signature: "", error: "Enter a JWT." };
  }
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      header: null,
      payload: null,
      signature: "",
      error: "Invalid JWT format (expected 3 parts separated by dots).",
    };
  }
  const headerStr = base64UrlDecode(parts[0]);
  const payloadStr = base64UrlDecode(parts[1]);
  const header = tryParseJson(headerStr);
  const payload = tryParseJson(payloadStr);
  if (!header || !payload) {
    return {
      header: header ?? tryParseJson(parts[0]) ?? null,
      payload: payload ?? tryParseJson(parts[1]) ?? null,
      signature: parts[2],
      error: "Could not decode header or payload as JSON.",
    };
  }
  return {
    header,
    payload,
    signature: parts[2],
  };
}

export default function JWTDecoderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [token, setToken] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);
  const [copied, setCopied] = useState<"header" | "payload" | null>(null);

  const decoded = decodeJwt(token);
  const hasResult = decoded.header !== null || decoded.payload !== null;

  const handleDecode = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/jwt-decoder")}`
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
    if (!token.trim()) return;
    setResultUnlocked(true);
  };

  const copyJson = (label: "header" | "payload") => {
    const obj = label === "header" ? decoded.header : decoded.payload;
    if (!obj) return;
    const text = JSON.stringify(obj, null, 2);
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <KeyIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JWT Token Decoder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Paste a JWT to decode header and payload (signature is not verified).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jwt">JWT token</Label>
            <textarea
              id="jwt"
              className="w-full min-h-[140px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setResultUnlocked(false);
              }}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              onClick={handleDecode}
              disabled={!token.trim()}
              className="gap-2"
            >
              <KeyIcon className="h-4 w-4" />
              Decode
            </Button>
          </div>

          {decoded.error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{decoded.error}</span>
            </div>
          )}

          {hasResult && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-6">
              {decoded.header && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Header
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyJson("header")}
                      className="gap-1.5"
                    >
                      {copied === "header" ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      )}
                      {copied === "header" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-48 font-mono">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>
              )}
              {decoded.payload && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Payload
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyJson("payload")}
                      className="gap-1.5"
                    >
                      {copied === "payload" ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      )}
                      {copied === "payload" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-64 font-mono">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Signature is not verified. Do not paste tokens that contain
                secrets.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

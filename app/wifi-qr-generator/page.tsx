"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCodeIcon } from "@heroicons/react/24/outline";

type Security = "WPA" | "WPA2" | "WEP" | "nopass";

function buildWifiString(
  ssid: string,
  password: string,
  security: Security,
  hidden: boolean,
): string {
  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
  const s = esc(ssid);
  const p = security === "nopass" ? "" : esc(password);
  const t = security === "nopass" ? "nopass" : security;
  const h = hidden ? "true" : "false";
  return `WIFI:T:${t};S:${s};P:${p};H:${h};;`;
}

export default function WifiQrGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<Security>("WPA2");
  const [hidden, setHidden] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/wifi-qr-generator")}`,
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

    if (!ssid.trim()) {
      setError("Please enter the network name (SSID).");
      setQrDataUrl(null);
      return;
    }
    if (security !== "nopass" && !password) {
      setError("Please enter the Wi‑Fi password, or choose an open network.");
      setQrDataUrl(null);
      return;
    }

    setError(null);
    const payload = buildWifiString(ssid.trim(), password, security, hidden);
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(url);
    } catch {
      setError("Could not generate QR code. Please try again.");
      setQrDataUrl(null);
    }
  }, [session, status, router, pathname, ssid, password, security, hidden]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Wi‑Fi QR Generator</h1>
          <p className="mt-1 text-muted-foreground">
            Create a QR code guests can scan to join your wireless network (standard WIFI: format).
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="ssid">Network name (SSID)</Label>
            <Input
              id="ssid"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="MyNetwork"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sec">Security</Label>
            <select
              id="sec"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={security}
              onChange={(e) => setSecurity(e.target.value as Security)}
            >
              <option value="WPA2">WPA / WPA2</option>
              <option value="WPA">WPA (legacy label)</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No password (open)</option>
            </select>
          </div>
          {security !== "nopass" && (
            <div className="space-y-2">
              <Label htmlFor="pw">Password</Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wi‑Fi password"
                autoComplete="new-password"
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="rounded border-input"
            />
            Hidden network
          </label>

          <Button type="button" onClick={handleSubmit} className="gap-2">
            <QrCodeIcon className="h-4 w-4" />
            Generate QR code
          </Button>
        </div>

        {qrDataUrl && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-input bg-muted/30 p-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode */}
            <img src={qrDataUrl} alt="Wi‑Fi QR code" width={280} height={280} className="mx-auto" />
            <p className="text-center text-xs text-muted-foreground max-w-xs">
              Scan with a phone camera. Only share with people you trust; the QR encodes your credentials.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

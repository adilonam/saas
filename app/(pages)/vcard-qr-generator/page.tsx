"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCodeIcon } from "@heroicons/react/24/outline";

function buildVCard(input: {
  fullName: string;
  org: string;
  title: string;
  phone: string;
  email: string;
  url: string;
}): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  if (input.fullName.trim()) {
    lines.push(`FN:${input.fullName.trim()}`);
    lines.push(`N:${input.fullName.trim()};;;;`);
  }
  if (input.org.trim()) lines.push(`ORG:${input.org.trim()}`);
  if (input.title.trim()) lines.push(`TITLE:${input.title.trim()}`);
  if (input.phone.trim()) lines.push(`TEL;TYPE=CELL:${input.phone.trim()}`);
  if (input.email.trim()) lines.push(`EMAIL;TYPE=INTERNET:${input.email.trim()}`);
  if (input.url.trim()) lines.push(`URL:${input.url.trim()}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export default function VcardQrGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [fullName, setFullName] = useState("");
  const [org, setOrg] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/vcard-qr-generator")}`,
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

    if (!fullName.trim() && !email.trim() && !phone.trim()) {
      setError("Enter at least a name, phone, or email.");
      setQrDataUrl(null);
      return;
    }

    setError(null);
    const vcard = buildVCard({ fullName, org, title, phone, email, url });
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(vcard, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
    } catch {
      setError("Could not generate QR code. Try shortening the content.");
      setQrDataUrl(null);
    }
  }, [
    session,
    status,
    router,
    pathname,
    fullName,
    org,
    title,
    phone,
    email,
    url,
  ]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">vCard QR Generator</h1>
          <p className="mt-1 text-muted-foreground">
            Encode contact details as a vCard so scanners can save your card to the address book.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="fn">Full name</Label>
            <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org">Organization</Label>
            <Input id="org" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Acme Inc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product lead" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tel">Phone</Label>
            <Input id="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 0100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Website</Label>
            <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
          </div>

          <Button type="button" onClick={handleSubmit} className="gap-2">
            <QrCodeIcon className="h-4 w-4" />
            Generate QR code
          </Button>
        </div>

        {qrDataUrl && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-input bg-muted/30 p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="vCard QR code" width={280} height={280} className="mx-auto" />
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

"use client";

import { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";

const FORMATS = [
  { value: "CODE128", label: "CODE128 (alphanumeric)" },
  { value: "CODE39", label: "CODE39" },
  { value: "EAN13", label: "EAN-13 (12 or 13 digits)" },
  { value: "EAN8", label: "EAN-8 (7 or 8 digits)" },
  { value: "UPC", label: "UPC (11 or 12 digits)" },
  { value: "ITF", label: "ITF (Interleaved 2 of 5)" },
] as const;

type Format = (typeof FORMATS)[number]["value"];

function validateValue(format: Format, value: string): string | null {
  const digits = value.replace(/\s/g, "");
  switch (format) {
    case "EAN13":
      if (!/^\d{12,13}$/.test(digits)) return "EAN-13 needs 12 or 13 digits.";
      return null;
    case "EAN8":
      if (!/^\d{7,8}$/.test(digits)) return "EAN-8 needs 7 or 8 digits.";
      return null;
    case "UPC":
      if (!/^\d{11,12}$/.test(digits)) return "UPC needs 11 or 12 digits.";
      return null;
    default:
      if (!value.trim()) return "Enter a value to encode.";
      return null;
  }
}

export default function BarcodeGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState("");
  const [format, setFormat] = useState<Format>("CODE128");
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/barcode-generator")}`,
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

    const v = format === "CODE128" || format === "CODE39" ? value.trim() : value.replace(/\s/g, "");
    const validationError = validateValue(format, v);
    if (validationError) {
      setError(validationError);
      setGenerated(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setError(null);
    try {
      const JsBarcode = (await import("jsbarcode")).default;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      JsBarcode(canvas, v, {
        format,
        width: 2,
        height: 80,
        displayValue: true,
        margin: 10,
      });
      setGenerated(true);
    } catch (e) {
      console.error(e);
      setError("Could not generate barcode. Check the value and format.");
      setGenerated(false);
    }
  }, [session, status, router, pathname, value, format]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Barcode Generator</h1>
          <p className="mt-1 text-muted-foreground">
            Create a barcode image (CODE128, EAN, UPC, and more) for labels or testing.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="fmt">Format</Label>
            <select
              id="fmt"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={format}
              onChange={(e) => setFormat(e.target.value as Format)}
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="val">Value</Label>
            <Input
              id="val"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={format.startsWith("EAN") || format === "UPC" ? "5901234123457" : "HELLO-123"}
            />
          </div>

          <Button type="button" onClick={handleSubmit} className="gap-2">
            <Bars3BottomLeftIcon className="h-4 w-4" />
            Generate barcode
          </Button>
        </div>

        <div className="rounded-xl border border-input bg-muted/30 p-6 flex flex-col items-center min-h-[140px] justify-center">
          <canvas ref={canvasRef} className="max-w-full h-auto bg-white rounded-md" />
          {generated && (
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Right-click the image to save, or use your browser&apos;s screenshot tool.
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  SwatchIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

type Source = "hex" | "rgb" | "hsl";

function parseHex(s: string): { r: number; g: number; b: number } | null {
  let h = s.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        Math.max(0, Math.min(255, Math.round(x)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export default function ColorConverterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [source, setSource] = useState<Source>("hex");
  const [hex, setHex] = useState("#3b82f6");
  const [r, setR] = useState("59");
  const [g, setG] = useState("130");
  const [b, setB] = useState("246");
  const [h, setH] = useState("217");
  const [s, setS] = useState("91");
  const [l, setL] = useState("60");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHex, setPreviewHex] = useState("#3b82f6");

  const handleConvert = () => {
    if (!guardToolAccess(status, session, pathname, "/color-converter", router)) {
      return;
    }
    setError(null);
    let rgb: { r: number; g: number; b: number } | null = null;

    if (source === "hex") {
      rgb = parseHex(hex);
      if (!rgb) {
        setError("Invalid hex. Use #RGB, #RRGGBB, or RRGGBB.");
        setUnlocked(false);
        return;
      }
    } else if (source === "rgb") {
      const rn = Number(r);
      const gn = Number(g);
      const bn = Number(b);
      if (
        ![rn, gn, bn].every(
          (n) => Number.isFinite(n) && n >= 0 && n <= 255,
        )
      ) {
        setError("RGB values must be numbers from 0 to 255.");
        setUnlocked(false);
        return;
      }
      rgb = { r: rn, g: gn, b: bn };
    } else {
      const hn = Number(h);
      const sn = Number(s);
      const ln = Number(l);
      if (
        !Number.isFinite(hn) ||
        hn < 0 ||
        hn > 360 ||
        !Number.isFinite(sn) ||
        sn < 0 ||
        sn > 100 ||
        !Number.isFinite(ln) ||
        ln < 0 ||
        ln > 100
      ) {
        setError("H must be 0–360; S and L must be 0–100.");
        setUnlocked(false);
        return;
      }
      rgb = hslToRgb(hn, sn, ln);
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hx = toHex(rgb.r, rgb.g, rgb.b);
    setHex(hx);
    setR(String(rgb.r));
    setG(String(rgb.g));
    setB(String(rgb.b));
    setH(String(hsl.h));
    setS(String(hsl.s));
    setL(String(hsl.l));
    setPreviewHex(hx);
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600">
            <SwatchIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Color Converter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Convert between HEX, RGB, and HSL using the selected source.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              Convert from
            </legend>
            <div className="flex flex-wrap gap-4 text-sm">
              {(
                [
                  ["hex", "Hex"],
                  ["rgb", "RGB"],
                  ["hsl", "HSL"],
                ] as const
              ).map(([v, label]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="color-src"
                    checked={source === v}
                    onChange={() => {
                      setSource(v);
                      setUnlocked(false);
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {source === "hex" && (
            <div className="space-y-2">
              <Label htmlFor="hex">Hex</Label>
              <Input
                id="hex"
                value={hex}
                onChange={(e) => {
                  setHex(e.target.value);
                  setUnlocked(false);
                }}
                className="rounded-xl font-mono max-w-xs"
                placeholder="#3366ff"
              />
            </div>
          )}

          {source === "rgb" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cr">R</Label>
                <Input
                  id="cr"
                  type="number"
                  min={0}
                  max={255}
                  value={r}
                  onChange={(e) => {
                    setR(e.target.value);
                    setUnlocked(false);
                  }}
                  className="rounded-xl font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cg">G</Label>
                <Input
                  id="cg"
                  type="number"
                  min={0}
                  max={255}
                  value={g}
                  onChange={(e) => {
                    setG(e.target.value);
                    setUnlocked(false);
                  }}
                  className="rounded-xl font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cb">B</Label>
                <Input
                  id="cb"
                  type="number"
                  min={0}
                  max={255}
                  value={b}
                  onChange={(e) => {
                    setB(e.target.value);
                    setUnlocked(false);
                  }}
                  className="rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {source === "hsl" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ch">H</Label>
                <Input
                  id="ch"
                  type="number"
                  min={0}
                  max={360}
                  value={h}
                  onChange={(e) => {
                    setH(e.target.value);
                    setUnlocked(false);
                  }}
                  className="rounded-xl font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cs">S %</Label>
                <Input
                  id="cs"
                  type="number"
                  min={0}
                  max={100}
                  value={s}
                  onChange={(e) => {
                    setS(e.target.value);
                    setUnlocked(false);
                  }}
                  className="rounded-xl font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cl">L %</Label>
                <Input
                  id="cl"
                  type="number"
                  min={0}
                  max={100}
                  value={l}
                  onChange={(e) => {
                    setL(e.target.value);
                    setUnlocked(false);
                  }}
                  className="rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          <Button onClick={handleConvert} className="gap-2">
            <SwatchIcon className="h-4 w-4" />
            Convert
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div
                className="h-24 w-full rounded-2xl border border-slate-200 dark:border-slate-600 shadow-inner"
                style={{ backgroundColor: previewHex }}
                aria-hidden
              />
              <dl className="space-y-2 font-mono text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">HEX</dt>
                  <dd className="text-slate-900 dark:text-white">{hex}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">RGB</dt>
                  <dd className="text-slate-900 dark:text-white">
                    rgb({r}, {g}, {b})
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">HSL</dt>
                  <dd className="text-slate-900 dark:text-white">
                    hsl({h}, {s}%, {l}%)
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

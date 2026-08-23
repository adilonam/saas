"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  PaintBrushIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

function normalizeHex(s: string): string | null {
  let h = s.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return `#${h.toLowerCase()}`;
}

export default function CssGradientGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [angle, setAngle] = useState("135");
  const [c1, setC1] = useState("#6366f1");
  const [c2, setC2] = useState("#ec4899");
  const [stop1, setStop1] = useState("0");
  const [stop2, setStop2] = useState("100");
  const [css, setCss] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const randomHex = () => {
    const n = Math.floor(Math.random() * 0xffffff);
    return `#${n.toString(16).padStart(6, "0")}`;
  };

  const handleRandomize = () => {
    const a = Math.floor(Math.random() * 361);
    const p1 = Math.floor(Math.random() * 51);
    const p2 = 50 + Math.floor(Math.random() * 51);
    setAngle(String(a));
    setC1(randomHex());
    setC2(randomHex());
    setStop1(String(p1));
    setStop2(String(p2));
    setUnlocked(false);
    setError(null);
  };

  const handleGenerate = () => {
    if (!guardToolAccess(status, session, pathname, "/css-gradient-generator", router)) {
      return;
    }
    setError(null);
    const a = Number(angle);
    const p1 = Number(stop1);
    const p2 = Number(stop2);
    const h1 = normalizeHex(c1);
    const h2 = normalizeHex(c2);
    if (!Number.isFinite(a)) {
      setError("Angle must be a number (degrees).");
      setUnlocked(false);
      return;
    }
    if (!Number.isFinite(p1) || !Number.isFinite(p2)) {
      setError("Stops must be numbers (percent).");
      setUnlocked(false);
      return;
    }
    if (!h1 || !h2) {
      setError("Colors must be valid hex (#RGB or #RRGGBB).");
      setUnlocked(false);
      return;
    }
    const value = `linear-gradient(${a}deg, ${h1} ${p1}%, ${h2} ${p2}%)`;
    setCss(value);
    setUnlocked(true);
    setCopied(false);
  };

  const copyCss = () => {
    if (!css) return;
    void navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
            <PaintBrushIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CSS Gradient Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Build a two-stop linear gradient and copy the CSS value.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grad-angle">Angle (deg)</Label>
              <Input
                id="grad-angle"
                value={angle}
                onChange={(e) => {
                  setAngle(e.target.value);
                  setUnlocked(false);
                }}
                className="rounded-xl font-mono"
              />
            </div>
            <div className="space-y-2 sm:col-span-2 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="c1">Color 1</Label>
                <Input
                  id="c1"
                  value={c1}
                  onChange={(e) => {
                    setC1(e.target.value);
                    setUnlocked(false);
                  }}
                  className="rounded-xl font-mono mt-1"
                />
              </div>
              <div>
                <Label htmlFor="c2">Color 2</Label>
                <Input
                  id="c2"
                  value={c2}
                  onChange={(e) => {
                    setC2(e.target.value);
                    setUnlocked(false);
                  }}
                  className="rounded-xl font-mono mt-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s1">Stop 1 (%)</Label>
              <Input
                id="s1"
                type="number"
                value={stop1}
                onChange={(e) => {
                  setStop1(e.target.value);
                  setUnlocked(false);
                }}
                className="rounded-xl font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s2">Stop 2 (%)</Label>
              <Input
                id="s2"
                type="number"
                value={stop2}
                onChange={(e) => {
                  setStop2(e.target.value);
                  setUnlocked(false);
                }}
                className="rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerate} className="gap-2">
              <PaintBrushIcon className="h-4 w-4" />
              Generate CSS
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRandomize}
              className="gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Randomize
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && css && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div
                className="h-40 w-full rounded-2xl border border-slate-200 dark:border-slate-600 shadow-inner"
                style={{ background: css }}
                aria-hidden
              />
              <div className="flex items-start justify-between gap-2">
                <pre className="flex-1 rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto font-mono whitespace-pre-wrap break-all">
                  {css}
                </pre>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyCss}
                  className="shrink-0 gap-1.5"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use as{" "}
                <code className="font-mono bg-slate-200/50 dark:bg-slate-800 px-1 rounded">
                  background: {css};
                </code>
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

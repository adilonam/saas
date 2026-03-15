"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import { ChartPieIcon } from "@heroicons/react/24/outline";

const DEFAULT_COLORS = [
  "#15803d",
  "#ca8a04",
  "#0369a1",
  "#a21caf",
  "#c2410c",
  "#4f46e5",
  "#0d9488",
  "#dc2626",
];

export type WheelChoice = {
  id: string;
  label: string;
  weight: number;
  color: string;
};

const DEFAULT_CHOICES: WheelChoice[] = [
  { id: "1", label: "yes", weight: 1, color: DEFAULT_COLORS[0] },
  { id: "2", label: "no", weight: 1, color: DEFAULT_COLORS[1] },
];

function weightedRandomIndex(choices: WheelChoice[]): number {
  const total = choices.reduce((s, c) => s + c.weight, 0);
  if (total <= 0) return 0;
  let r = Math.random() * total;
  for (let i = 0; i < choices.length; i++) {
    r -= choices[i].weight;
    if (r <= 0) return i;
  }
  return choices.length - 1;
}

function nextColor(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export default function PickerWheelPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [choices, setChoices] = useState<WheelChoice[]>(DEFAULT_CHOICES);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  const totalWeight = useMemo(
    () => choices.reduce((s, c) => s + Math.max(0, c.weight), 0),
    [choices]
  );

  const segments = useMemo(() => {
    if (totalWeight <= 0) return [];
    let start = 0;
    return choices.map((c) => {
      const w = Math.max(0, c.weight);
      const angle = (w / totalWeight) * 360;
      const seg = { ...c, startAngle: start, endAngle: start + angle };
      start += angle;
      return seg;
    });
  }, [choices, totalWeight]);

  const spin = useCallback(() => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/picker-wheel")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    if (choices.length === 0 || spinning) return;
    const idx = weightedRandomIndex(choices);
    const seg = segments[idx];
    if (!seg) return;
    setSpinning(true);
    setResult(null);
    const segmentMidAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
    const turns = 5 + Math.random() * 3;
    const targetRotation = 360 * turns + (360 - segmentMidAngle);
    setWheelRotation((prev) => prev + targetRotation);
    const duration = 4000;
    setTimeout(() => {
      setResult(choices[idx].label);
      setSpinning(false);
    }, duration);
  }, [session, status, router, pathname, choices, segments, spinning]);

  const addChoice = useCallback(() => {
    const nextId = String(Date.now());
    const color = nextColor(choices.length);
    setChoices((prev) => [...prev, { id: nextId, label: "", weight: 1, color }]);
  }, [choices.length]);

  const updateChoice = useCallback(
    (id: string, updates: Partial<Pick<WheelChoice, "label" | "weight">>) => {
      setChoices((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const removeChoice = useCallback((id: string) => {
    setChoices((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const duplicateChoice = useCallback((choice: WheelChoice) => {
    setChoices((prev) => [
      ...prev,
      { ...choice, id: String(Date.now()), color: nextColor(prev.length) },
    ]);
  }, []);

  const canSpin = choices.length > 0 && choices.some((c) => c.weight > 0) && !spinning;

  return (
    <DashboardLayout fullWidth>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <ChartPieIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Picker Wheel</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Add choices with weights and spin the wheel
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Wheel */}
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: 320, height: 320 }}>
              <div
                className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: spinning ? "transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
                  background:
                    totalWeight > 0
                      ? `conic-gradient(${segments
                          .map(
                            (seg) =>
                              `${seg.color} ${seg.startAngle}deg ${seg.endAngle}deg`
                          )
                          .join(", ")})`
                      : undefined,
                  backgroundColor: totalWeight <= 0 ? "var(--slate-200)" : undefined,
                }}
              >
                {totalWeight <= 0 && (
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full" />
                )}
                {/* Segment labels — rotate with wheel, placed in middle of each slice */}
                {totalWeight > 0 && segments.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    {segments.map((seg) => {
                      const midAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
                      const radius = 95;
                      return (
                        <div
                          key={seg.id}
                          className="absolute left-1/2 top-1/2 w-[28%] flex items-center justify-center text-center"
                          style={{
                            transform: `translate(-50%, -50%) rotate(${midAngle}deg) translateY(-${radius}px)`,
                            transformOrigin: "center center",
                          }}
                        >
                          <span
                            className="block text-sm font-semibold text-white truncate max-w-full px-0.5"
                            style={{
                              transform: `rotate(${-midAngle}deg)`,
                              transformOrigin: "center center",
                              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                            }}
                            title={seg.label || "(no label)"}
                          >
                            {seg.label || "?"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 rounded-full bg-slate-800 dark:bg-slate-900 border-4 border-white dark:border-slate-700 shadow-inner flex items-center justify-center pointer-events-auto">
                    <Button
                      size="lg"
                      onClick={spin}
                      disabled={!canSpin}
                      className="rounded-full w-16 h-16 p-0 font-bold text-white bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                    >
                      SPIN
                    </Button>
                  </div>
                </div>
              </div>
              {/* Pointer */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0"
                style={{
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: "20px solid #e11d48",
                }}
              />
            </div>
            {result != null && (
              <p className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                Result: {result}
              </p>
            )}
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="mt-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <SpeakerXMarkIcon className="size-5" />
              ) : (
                <SpeakerWaveIcon className="size-5" />
              )}
            </button>
          </div>

          {/* Main inputs */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Main inputs</h2>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Choices
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChoice}
                className="rounded-xl"
              >
                <PlusIcon className="size-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {choices.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <div
                    className="size-6 rounded shrink-0 border border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: c.color }}
                    title="Segment color"
                  />
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    className="w-16 h-9 rounded-lg text-center shrink-0"
                    value={c.weight}
                    onChange={(e) =>
                      updateChoice(c.id, {
                        weight: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    title="Weight"
                  />
                  <Input
                    placeholder="Label"
                    className="flex-1 min-w-0 rounded-lg h-9"
                    value={c.label}
                    onChange={(e) => updateChoice(c.id, { label: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => duplicateChoice(c)}
                    title="Duplicate"
                  >
                    <DocumentDuplicateIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => removeChoice(c.id)}
                    title="Remove"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              Default weight is 1. Higher weight = larger slice and higher chance to be picked.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

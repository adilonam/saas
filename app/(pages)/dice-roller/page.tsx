"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CubeIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const COMMON_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;

export default function DiceRollerPage() {
  const { ensureAccess } = useToolAccess();
  const [count, setCount] = useState(2);
  const [sides, setSides] = useState(6);
  const [rolls, setRolls] = useState<number[] | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const roll = useCallback(() => {
    if (!ensureAccess()) return;
    const n = Math.min(20, Math.max(1, Math.floor(count) || 1));
    const s = Math.min(100, Math.max(2, Math.floor(sides) || 6));
    setIsRolling(true);
    setRolls(null);
    window.setTimeout(() => {
      const next: number[] = [];
      for (let i = 0; i < n; i++) {
        next.push(1 + Math.floor(Math.random() * s));
      }
      setRolls(next);
      setIsRolling(false);
    }, 400);
  }, [ensureAccess, count, sides]);

  const sum = rolls?.reduce((a, b) => a + b, 0);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            <CubeIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dice Roller
            </h1>
            <p className="text-sm text-muted-foreground">
              Roll multiple dice with custom sides (D&amp;D-friendly).
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dice-count">Number of dice</Label>
              <Input
                id="dice-count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) =>
                  setCount(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dice-sides">Sides per die</Label>
              <Input
                id="dice-sides"
                type="number"
                min={2}
                max={100}
                value={sides}
                onChange={(e) =>
                  setSides(Math.min(100, Math.max(2, parseInt(e.target.value, 10) || 6)))
                }
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Quick sides
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SIDES.map((v) => (
                <Button
                  key={v}
                  type="button"
                  variant={sides === v ? "default" : "outline"}
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setSides(v)}
                >
                  d{v}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full rounded-xl gap-2"
            onClick={roll}
            disabled={isRolling}
          >
            <CubeIcon className={`size-5 ${isRolling ? "animate-bounce" : ""}`} />
            {isRolling ? "Rolling…" : "Roll dice"}
          </Button>

          {rolls && rolls.length > 0 && (
            <div
              className="rounded-xl border border-border bg-muted/40 p-4 text-center"
              aria-live="polite"
            >
              <p className="text-sm text-muted-foreground">Results</p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-foreground">
                {rolls.join(" + ")}
                {rolls.length > 1 && sum !== undefined && (
                  <span className="ml-2 text-lg font-semibold text-muted-foreground">
                    = {sum}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

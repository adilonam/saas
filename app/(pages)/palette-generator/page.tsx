"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { SparklesIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { contrastForeground, type AppColorPalette } from "@/lib/palette-generator";

export default function PaletteGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [description, setDescription] = useState("");
  const [palettes, setPalettes] = useState<AppColorPalette[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/palette-generator")}`,
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

    const trimmed = description.trim();
    if (!trimmed) {
      setError("Describe your app so we can suggest palettes.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPalettes(null);

    try {
      const res = await fetch("/api/palette-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });

      const data = (await res.json()) as {
        error?: string;
        code?: string;
        palettes?: AppColorPalette[];
      };

      if (!res.ok) {
        if (
          data.code === "subscription_required" ||
          data.error === "Active subscription required"
        ) {
          router.push("/pricing");
          return;
        }
        setError(data.error || "Something went wrong.");
        return;
      }

      if (!data.palettes?.length) {
        setError("No palettes returned. Try again.");
        return;
      }

      setPalettes(data.palettes);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      window.setTimeout(() => setCopiedHex(null), 1600);
    } catch {
      setCopiedHex(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            App palette generator
          </h1>
          <p className="mt-1 text-muted-foreground max-w-2xl">
            Describe your app; get three distinct color directions with hex codes,
            labeled roles, and a quick preview strip for each.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="palette-description"
            className="text-sm font-medium text-foreground"
          >
            App description
          </label>
          <textarea
            id="palette-description"
            className="w-full min-h-[140px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="e.g. A calm budgeting app for young professionals, trustworthy and minimal, with occasional positive highlights for savings goals."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generate three palettes
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {palettes && (
          <div className="grid gap-8 md:grid-cols-3">
            {palettes.map((palette) => (
              <PaletteCard
                key={palette.name}
                palette={palette}
                copiedHex={copiedHex}
                onCopyHex={copyHex}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function PaletteCard({
  palette,
  copiedHex,
  onCopyHex,
}: {
  palette: AppColorPalette;
  copiedHex: string | null;
  onCopyHex: (hex: string) => void;
}) {
  const primary = palette.colors.find((c) => c.role === "primary")?.hex;
  const bg = palette.colors.find((c) => c.role === "background")?.hex;
  const surface = palette.colors.find((c) => c.role === "surface")?.hex;
  const text = palette.colors.find((c) => c.role === "text")?.hex;
  const accent = palette.colors.find((c) => c.role === "accent")?.hex;

  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border space-y-1">
        <h2 className="font-semibold text-lg text-card-foreground">{palette.name}</h2>
        {palette.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed">{palette.summary}</p>
        )}
      </div>

      {primary && bg && surface && text && (
        <div
          className="px-4 pt-4"
          aria-hidden
        >
          <div
            className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden text-xs"
            style={{ backgroundColor: bg }}
          >
            <div
              className="flex items-center justify-between px-3 py-2 gap-2"
              style={{ backgroundColor: primary, color: contrastForeground(primary) }}
            >
              <span className="font-semibold truncate">Preview</span>
              {accent && (
                <span
                  className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: accent,
                    color: contrastForeground(accent),
                  }}
                >
                  Action
                </span>
              )}
            </div>
            <div className="p-3 space-y-2" style={{ backgroundColor: surface }}>
              <div
                className="h-2 rounded-full w-3/4 opacity-40"
                style={{ backgroundColor: text }}
              />
              <div
                className="h-2 rounded-full w-1/2 opacity-25"
                style={{ backgroundColor: text }}
              />
            </div>
            <p
              className="px-3 py-2 text-[11px] opacity-80"
              style={{ color: text }}
            >
              Sample body text on surface
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-0.5 p-2" aria-label="Palette strip">
        {palette.colors.map((c) => (
          <button
            key={`${c.role}-${c.hex}`}
            type="button"
            title={`Copy ${c.hex}`}
            onClick={() => onCopyHex(c.hex)}
            className="flex-1 min-w-10 h-14 first:rounded-l-lg last:rounded-r-lg sm:first:rounded-l-xl sm:last:rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      <ul className="px-4 pb-4 space-y-2 flex-1">
        {palette.colors.map((c) => (
          <li
            key={`${c.role}-${c.hex}-row`}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="min-w-0">
              <span className="font-medium text-foreground capitalize">{c.role}</span>
              {c.label && (
                <span className="text-muted-foreground"> — {c.label}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onCopyHex(c.hex)}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2 py-1 text-xs font-mono hover:bg-muted transition-colors"
            >
              {copiedHex === c.hex ? (
                "Copied"
              ) : (
                <>
                  {c.hex}
                  <ClipboardDocumentIcon className="size-3.5 opacity-60" />
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}

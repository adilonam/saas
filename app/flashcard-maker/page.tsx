"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RectangleStackIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

type Card = { front: string; back: string };

function parseManual(text: string): Card[] {
  const out: Card[] = [];
  for (const line of text.split(/\n/)) {
    const t = line.trim();
    if (!t) continue;
    const pipe = t.indexOf("|");
    if (pipe >= 0) {
      out.push({
        front: t.slice(0, pipe).trim(),
        back: t.slice(pipe + 1).trim(),
      });
    } else {
      out.push({ front: t, back: "" });
    }
  }
  return out;
}

export default function FlashcardMakerPage() {
  const { assertAccess } = useSubscribedToolAccess("/flashcard-maker");
  const [bullets, setBullets] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const build = () => {
    if (!assertAccess()) return;
    setCards(parseManual(bullets));
    setError(null);
  };

  const expandAi = async () => {
    if (!assertAccess()) return;
    const b = bullets.trim();
    if (!b) {
      setError("Paste a bullet list first.");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-flashcard-expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets: b }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") return;
        setError(data.error || "Failed");
        return;
      }
      const text = (data.text as string) || "";
      setBullets(text);
      setCards(parseManual(text));
    } catch {
      setError("Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Flashcard maker</h1>
          <p className="mt-1 text-muted-foreground">
            One bullet per line. Use <code className="text-xs">Front | Back</code> or plain bullets, then optional AI expansion.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bullets">Bullet list</Label>
          <textarea
            id="bullets"
            className="w-full min-h-[180px] rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
            value={bullets}
            onChange={(e) => setBullets(e.target.value)}
            placeholder={"REST\nIdempotency | Safe retries; same result if you repeat the request\nCAP theorem"}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={build} className="gap-2">
            <RectangleStackIcon className="h-4 w-4" />
            Build cards
          </Button>
          <Button type="button" variant="secondary" onClick={expandAi} disabled={aiLoading} className="gap-2">
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Expanding…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Expand with AI
              </>
            )}
          </Button>
        </div>

        {cards.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">{cards.length} cards</p>
            <ul className="space-y-2 max-h-[360px] overflow-y-auto">
              {cards.map((c, i) => (
                <li key={i} className="rounded-lg border border-input p-3 text-sm">
                  <p className="font-medium text-foreground">{c.front || "(empty front)"}</p>
                  <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{c.back || "—"}</p>
                </li>
              ))}
            </ul>
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

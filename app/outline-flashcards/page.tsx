"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowsRightLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

function outlineToCardsLocal(text: string): string {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const out: string[] = [];
  for (const line of lines) {
    const stripped = line.replace(/^[-*]\s+/, "");
    const pipe = stripped.indexOf(" | ");
    if (pipe >= 0) {
      out.push(
        `Front: ${stripped.slice(0, pipe).trim()} | Back: ${stripped.slice(pipe + 3).trim()}`,
      );
    } else {
      out.push(`Front: ${stripped} | Back: `);
    }
  }
  return out.join("\n");
}

function cardsToOutlineLocal(text: string): string {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const out: string[] = ["Study outline", ""];
  for (const line of lines) {
    const m = line.match(/^Front:\s*(.+?)\s*\|\s*Back:\s*(.*)$/i);
    if (m) {
      out.push(`- ${m[1].trim()}${m[2] ? ` — ${m[2].trim()}` : ""}`);
    } else {
      out.push(`- ${line}`);
    }
  }
  return out.join("\n");
}

export default function OutlineFlashcardsPage() {
  const { assertAccess } = useSubscribedToolAccess("/outline-flashcards");
  const [mode, setMode] = useState<"outline" | "cards">("outline");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runLocal = () => {
    if (!assertAccess()) return;
    setError(null);
    if (mode === "outline") {
      setOutput(outlineToCardsLocal(input));
    } else {
      setOutput(cardsToOutlineLocal(input));
    }
  };

  const runAi = async () => {
    if (!assertAccess()) return;
    const t = input.trim();
    if (!t) {
      setError("Paste text first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-outline-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: mode === "outline" ? "to-cards" : "to-outline",
          text: t,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") return;
        setError(data.error || "Failed");
        return;
      }
      setOutput(data.text ?? "");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Outline ↔ flashcards</h1>
          <p className="mt-1 text-muted-foreground">
            Local quick conversion, or AI for richer structure. Flashcard lines use{" "}
            <code className="text-xs">Front: … | Back: …</code>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === "outline" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("outline")}
          >
            Outline → cards
          </Button>
          <Button
            type="button"
            variant={mode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("cards")}
          >
            Cards → outline
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="io">{mode === "outline" ? "Outline" : "Flashcards"}</Label>
          <textarea
            id="io"
            className="w-full min-h-[200px] rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "outline"
                ? "- Topic one\n- Topic two | optional inline answer"
                : "Front: Question | Back: Answer"
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={runLocal} className="gap-2">
            <ArrowsRightLeftIcon className="h-4 w-4" />
            Convert (local)
          </Button>
          <Button type="button" variant="secondary" onClick={runAi} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Convert with AI
              </>
            )}
          </Button>
        </div>

        {output && (
          <div className="space-y-2">
            <Label>Result</Label>
            <textarea
              readOnly
              className="w-full min-h-[220px] rounded-lg border border-input bg-muted/30 p-3 text-sm font-mono"
              value={output}
            />
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

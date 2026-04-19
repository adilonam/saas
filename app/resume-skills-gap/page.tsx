"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AcademicCapIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

const STOP = new Set([
  "the", "and", "for", "with", "you", "our", "are", "this", "that", "from", "your", "will",
  "have", "has", "was", "were", "been", "being", "their", "they", "them", "into", "about",
  "other", "such", "than", "then", "also", "not", "all", "any", "can", "may", "must", "out",
  "who", "its", "per", "via", "etc", "one", "two", "years", "year", "work", "team", "role",
]);

export default function ResumeSkillsGapPage() {
  const { assertAccess } = useSubscribedToolAccess("/resume-skills-gap");
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [heuristic, setHeuristic] = useState<string[]>([]);
  const [aiText, setAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resumeSet = useMemo(() => new Set(tokenize(resume)), [resume]);

  const runHeuristic = () => {
    if (!assertAccess()) return;
    const jdWords = tokenize(jd);
    const freq = new Map<string, number>();
    for (const w of jdWords) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
    const scored: { w: string; score: number }[] = [];
    for (const [w, c] of freq) {
      if (!resumeSet.has(w)) scored.push({ w, score: c });
    }
    scored.sort((x, y) => y.score - x.score);
    const top = scored.slice(0, 40).map((x) => x.w);
    setHeuristic(top);
    if (top.length === 0) {
      setError("No obvious token gaps (try longer JD text or use AI).");
    } else {
      setError(null);
    }
  };

  const runAi = async () => {
    if (!assertAccess()) return;
    const r = resume.trim();
    const j = jd.trim();
    if (!r || !j) {
      setError("Paste both resume skills/experience and the job description.");
      return;
    }
    setLoadingAi(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-resume-skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: r, jobDescription: j }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") return;
        setError(data.error || "Request failed");
        return;
      }
      setAiText(data.text ?? "");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Resume skills gap suggester</h1>
          <p className="mt-1 text-muted-foreground">
            Quick keyword overlap plus optional AI narrative comparing your resume to the JD.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (skills & experience)</Label>
            <textarea
              id="resume"
              className="w-full min-h-[200px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jd">Job description</Label>
            <textarea
              id="jd"
              className="w-full min-h-[200px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={runHeuristic} className="gap-2">
            <AcademicCapIcon className="h-4 w-4" />
            Suggest gaps (keywords)
          </Button>
          <Button type="button" variant="secondary" onClick={runAi} disabled={loadingAi} className="gap-2">
            {loadingAi ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                AI gap analysis
              </>
            )}
          </Button>
        </div>

        {heuristic.length > 0 && (
          <div className="rounded-lg border border-input bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">JD terms not found literally in your resume (heuristic)</p>
            <p className="text-xs text-muted-foreground">
              Useful for scanning; not a substitute for reading the JD. Multi-word skills may be split.
            </p>
            <p className="text-sm">{heuristic.join(", ")}</p>
          </div>
        )}

        {aiText && (
          <div className="rounded-lg border border-input bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">AI analysis</p>
            <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
              {aiText}
            </div>
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

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function SqlQueryGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [schema, setSchema] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/sql-query-generator")}`,
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
    if (!question.trim()) {
      setError("Please describe the query you need.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/sql-query-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: schema.trim(),
          question: question.trim(),
        }),
      });
      const data = await res.json();
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
      setResult(data.text ?? "");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">SQL Query Generator</h1>
          <p className="mt-1 text-muted-foreground">
            Describe the result you want in English; add optional table definitions for more accurate SQL.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schema">Schema (optional)</Label>
            <textarea
              id="schema"
              className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={`CREATE TABLE orders (id INT, user_id INT, total DECIMAL, created_at TIMESTAMP);`}
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">What should the query do?</Label>
            <textarea
              id="question"
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Monthly revenue totals for the last 12 months, grouped by month"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generate SQL
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Result</label>
            <div className="w-full min-h-[120px] rounded-lg border border-input bg-muted/50 p-4 text-sm text-foreground whitespace-pre-wrap font-mono">
              {result}
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

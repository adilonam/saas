"use client";

import { useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

type AiTextToolPageProps = {
  title: string;
  description: string;
  apiPath: string;
  inputLabel: string;
  placeholder: string;
  submitLabel: string;
  textareaMinHeightClass?: string;
  /** Optional controls shown between the label and the textarea (e.g. tone select). */
  children?: ReactNode;
  buildBody: (text: string) => Record<string, string>;
};

export default function AiTextToolPage({
  title,
  description,
  apiPath,
  inputLabel,
  placeholder,
  submitLabel,
  textareaMinHeightClass = "min-h-[140px]",
  children,
  buildBody,
}: AiTextToolPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/")}`,
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

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(trimmed)),
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
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="ai-tool-input" className="text-sm font-medium text-foreground">
            {inputLabel}
          </label>
          {children}
          <textarea
            id="ai-tool-input"
            className={`w-full ${textareaMinHeightClass} rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Working…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Result</label>
            <div className="w-full min-h-[120px] rounded-lg border border-input bg-muted/50 p-4 text-sm text-foreground whitespace-pre-wrap">
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

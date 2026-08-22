"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

function toMarkdown(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line, index) => {
      if (line.length < 80 && /^[A-Z0-9\s:,-]+$/.test(line)) return `## ${line}`;
      if (/^\d+[\.\)]\s+/.test(line)) return line.replace(/^\d+[\.\)]\s+/, (m) => `${m[0]} `);
      if (line.startsWith("- ") || line.startsWith("* ")) return line;
      if (index > 0 && lines[index - 1].length < 100 && line.length < 100) return line;
      return `${line}\n`;
    })
    .join("\n")
    .trim();
}

export default function PdfToMarkdownPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    if (!guardToolAccess(status, session, pathname, "/pdf-to-markdown", router)) return;
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/pdf-to-text", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to extract text.");
        return;
      }
      const markdown = toMarkdown(String(data.text || ""));
      setResult(markdown);
    } catch (e) {
      console.error(e);
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">PDF to Markdown</h1>
          <p className="text-muted-foreground mt-1">
            Extract text with OCR and convert it into a markdown-friendly format.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()}>
            <ArrowUpTrayIcon className="h-4 w-4" />
            Select PDF
          </Button>
          {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
          <Button onClick={handleConvert} disabled={!file || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Convert to markdown
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium">Markdown output</h2>
            <textarea
              className="w-full min-h-[360px] rounded-lg border border-input bg-muted/40 p-3 text-sm"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

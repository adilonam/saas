"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

type Style = "apa" | "mla";

function formatApa(f: Fields): string {
  const authors = f.authors.trim();
  const year = f.year.trim() || "n.d.";
  const title = f.title.trim();
  const journal = f.journal.trim();
  const vol = f.volume.trim();
  const issue = f.issue.trim();
  const pages = f.pages.trim();
  const doi = f.doi.trim();
  const url = f.url.trim();

  let ref = "";
  if (authors) ref += `${authors} (${year}). `;
  else ref += `(${year}). `;
  if (title) ref += `${title}. `;
  if (journal) {
    ref += `${journal}`;
    if (vol) ref += `, ${vol}`;
    if (issue) ref += `(${issue})`;
    if (pages) ref += `, ${pages}`;
    ref += ". ";
  }
  if (doi) ref += `https://doi.org/${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")}`;
  else if (url) ref += url;
  return ref.trim();
}

function formatMla(f: Fields): string {
  const authors = f.authors.trim();
  const title = f.title.trim();
  const journal = f.journal.trim();
  const vol = f.volume.trim();
  const issue = f.issue.trim();
  const year = f.year.trim();
  const pages = f.pages.trim();
  const doi = f.doi.trim();
  const url = f.url.trim();

  let ref = "";
  if (authors) ref += `${authors}. `;
  if (title) ref += `"${title}." `;
  if (journal) {
    ref += `${journal}`;
    if (vol) ref += `, vol. ${vol}`;
    if (issue) ref += `, no. ${issue}`;
    if (year) ref += `, ${year}`;
    if (pages) ref += `, pp. ${pages}`;
    ref += ". ";
  }
  if (doi) ref += `doi:${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")}.`;
  else if (url) ref += url;
  return ref.trim();
}

type Fields = {
  authors: string;
  year: string;
  title: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  url: string;
  doi: string;
};

const empty: Fields = {
  authors: "",
  year: "",
  title: "",
  journal: "",
  volume: "",
  issue: "",
  pages: "",
  url: "",
  doi: "",
};

export default function CitationFormatterPage() {
  const { assertAccess } = useSubscribedToolAccess("/citation-formatter");
  const [style, setStyle] = useState<Style>("apa");
  const [f, setF] = useState<Fields>(empty);
  const [out, setOut] = useState("");

  const update = (k: keyof Fields, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    if (!assertAccess()) return;
    setOut(style === "apa" ? formatApa(f) : formatMla(f));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Citation formatter</h1>
          <p className="mt-1 text-muted-foreground">
            Fill fields you have; empty parts are skipped. For a quick reference string (not a full citation manager).
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="button" size="sm" variant={style === "apa" ? "default" : "outline"} onClick={() => setStyle("apa")}>
            APA-style
          </Button>
          <Button type="button" size="sm" variant={style === "mla" ? "default" : "outline"} onClick={() => setStyle("mla")}>
            MLA-style
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Authors</Label>
            <Input value={f.authors} onChange={(e) => update("authors", e.target.value)} placeholder="Doe, J., & Smith, A." />
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Input value={f.year} onChange={(e) => update("year", e.target.value)} placeholder="2024" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Title</Label>
            <Input value={f.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Journal / container</Label>
            <Input value={f.journal} onChange={(e) => update("journal", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Volume</Label>
            <Input value={f.volume} onChange={(e) => update("volume", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Issue</Label>
            <Input value={f.issue} onChange={(e) => update("issue", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Pages</Label>
            <Input value={f.pages} onChange={(e) => update("pages", e.target.value)} placeholder="12-34" />
          </div>
          <div className="space-y-2">
            <Label>DOI</Label>
            <Input value={f.doi} onChange={(e) => update("doi", e.target.value)} placeholder="10.1000/xyz" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>URL (if no DOI)</Label>
            <Input value={f.url} onChange={(e) => update("url", e.target.value)} />
          </div>
        </div>

        <Button type="button" onClick={handleSubmit} className="gap-2">
          <BookOpenIcon className="h-4 w-4" />
          Format citation
        </Button>

        {out && (
          <div className="rounded-lg border border-input bg-muted/40 p-4 text-sm whitespace-pre-wrap">
            {out}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

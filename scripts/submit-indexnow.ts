#!/usr/bin/env node

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function getEnvFromDotEnv(key: string): string | undefined {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return undefined;

  const content = readFileSync(envPath, "utf8");
  const line = content
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${key}=`));

  if (!line) return undefined;
  const [, ...rest] = line.split("=");
  const rawValue = rest.join("=").trim();
  if (!rawValue) return undefined;

  return rawValue.replace(/^['"]|['"]$/g, "").trim();
}

const INDEXNOW_ENDPOINT =
  process.env.INDEXNOW_ENDPOINT ?? "https://api.indexnow.org/indexnow";
const SITE_URL = (process.env.SITE_URL ?? "https://www.eprod.io").replace(/\/+$/, "");
const SITEMAP_URL = process.env.SITEMAP_URL ?? `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? getEnvFromDotEnv("INDEXNOW_KEY");
const BATCH_SIZE = Number(process.env.INDEXNOW_BATCH_SIZE ?? "10000");
const SUBMITTED_CSV_PATH = path.resolve(
  process.env.INDEXNOW_SUBMITTED_CSV ??
    path.join(process.cwd(), "scripts", "indexnow-submitted.csv"),
);
const SUBMISSION_SOURCE = process.env.INDEXNOW_SOURCE ?? "none";

if (!INDEXNOW_KEY) {
  console.error("Missing INDEXNOW_KEY environment variable.");
  process.exit(1);
}

if (!Number.isFinite(BATCH_SIZE) || BATCH_SIZE <= 0) {
  console.error("INDEXNOW_BATCH_SIZE must be a positive number.");
  process.exit(1);
}

const keyLocation =
  process.env.INDEXNOW_KEY_LOCATION ?? `${SITE_URL}/${INDEXNOW_KEY}.txt`;

function extractUrlsFromSitemapXml(xml: string): string[] {
  const locRegex = /<loc>(.*?)<\/loc>/g;
  const urls: string[] = [];
  let match = locRegex.exec(xml);

  while (match) {
    const url = match[1]?.trim();
    if (url) urls.push(url);
    match = locRegex.exec(xml);
  }

  return [...new Set(urls)];
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      fields.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  fields.push(current);
  return fields;
}

function readSubmittedUrls(csvPath: string): Set<string> {
  if (!existsSync(csvPath)) return new Set();

  const content = readFileSync(csvPath, "utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return new Set();

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const urlIdx = header.indexOf("url");
  const startIdx = urlIdx >= 0 ? 1 : 0;
  const effectiveUrlIdx = urlIdx >= 0 ? urlIdx : 0;

  const submitted = new Set<string>();
  for (let i = startIdx; i < lines.length; i += 1) {
    const fields = parseCsvLine(lines[i]);
    const url = fields[effectiveUrlIdx]?.trim();
    if (url) submitted.add(url);
  }

  return submitted;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatSubmissionTimestamp(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHH = pad2(Math.floor(absOffset / 60));
  const offsetMM = pad2(absOffset % 60);

  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const year = date.getFullYear();
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());

  return `${month}/${day}/${year}T${hours}:${minutes}:${seconds}${sign}${offsetHH}:${offsetMM}`;
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function appendSubmittedUrls(csvPath: string, urls: string[], source: string): void {
  if (urls.length === 0) return;

  const dir = path.dirname(csvPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const fileExists = existsSync(csvPath);
  const needsHeader = !fileExists || readFileSync(csvPath, "utf8").trim().length === 0;

  if (needsHeader) {
    writeFileSync(csvPath, `"URL","Source","Submitted"\n`);
  }

  const timestamp = formatSubmissionTimestamp(new Date());
  const rows = urls
    .map((url) => `${csvEscape(url)},${csvEscape(source)},${csvEscape(timestamp)}`)
    .join("\n");
  appendFileSync(csvPath, `${rows}\n`);
}

async function main() {
  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const sitemapResponse = await fetch(SITEMAP_URL);

  if (!sitemapResponse.ok) {
    throw new Error(
      `Failed to fetch sitemap (${sitemapResponse.status} ${sitemapResponse.statusText}).`
    );
  }

  const sitemapXml = await sitemapResponse.text();
  const urls = extractUrlsFromSitemapXml(sitemapXml);

  if (urls.length === 0) {
    throw new Error("No URLs found in sitemap.");
  }

  const alreadySubmitted = readSubmittedUrls(SUBMITTED_CSV_PATH);
  if (alreadySubmitted.size > 0) {
    console.log(
      `Loaded ${alreadySubmitted.size} previously submitted URL(s) from ${SUBMITTED_CSV_PATH}.`
    );
  } else {
    console.log(`No previous submissions found at ${SUBMITTED_CSV_PATH}.`);
  }

  const newUrls = urls.filter((url) => !alreadySubmitted.has(url));
  const skipped = urls.length - newUrls.length;

  if (skipped > 0) {
    console.log(`Skipping ${skipped} URL(s) already submitted.`);
  }

  if (newUrls.length === 0) {
    console.log("No new URLs to submit. Nothing to do.");
    return;
  }

  const batches = chunkArray(newUrls, BATCH_SIZE);
  console.log(`Submitting ${newUrls.length} new URL(s) in ${batches.length} batch(es).`);

  const successfullySubmitted: string[] = [];

  for (const [index, urlList] of batches.entries()) {
    const payload = {
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList,
    };

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      if (successfullySubmitted.length > 0) {
        appendSubmittedUrls(SUBMITTED_CSV_PATH, successfullySubmitted, SUBMISSION_SOURCE);
        console.log(
          `Recorded ${successfullySubmitted.length} URL(s) submitted before failure to ${SUBMITTED_CSV_PATH}.`
        );
      }
      throw new Error(
        `IndexNow batch ${index + 1}/${batches.length} failed (${response.status} ${response.statusText}): ${responseBody}`
      );
    }

    successfullySubmitted.push(...urlList);
    console.log(
      `Batch ${index + 1}/${batches.length} submitted (${urlList.length} URLs).`
    );
  }

  appendSubmittedUrls(SUBMITTED_CSV_PATH, successfullySubmitted, SUBMISSION_SOURCE);
  console.log(
    `Recorded ${successfullySubmitted.length} URL(s) to ${SUBMITTED_CSV_PATH}.`
  );

  console.log("IndexNow submission completed successfully.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

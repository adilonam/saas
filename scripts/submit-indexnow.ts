#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
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

  const batches = chunkArray(urls, BATCH_SIZE);
  console.log(`Submitting ${urls.length} URLs in ${batches.length} batch(es).`);

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
      throw new Error(
        `IndexNow batch ${index + 1}/${batches.length} failed (${response.status} ${response.statusText}): ${responseBody}`
      );
    }

    console.log(
      `Batch ${index + 1}/${batches.length} submitted (${urlList.length} URLs).`
    );
  }

  console.log("IndexNow submission completed successfully.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

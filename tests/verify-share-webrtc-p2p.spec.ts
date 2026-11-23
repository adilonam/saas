/**
 * Production verification for Share on https://www.eprod.io/share
 * Text both ways, ~20MB file (proves rate-limit lift), Room full for 3rd peer.
 * Retries for up to ~15 minutes if the backend still rate-limits large transfers.
 */
import { test, expect, chromium, type Page, type Browser } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SHARE_URL = "https://www.eprod.io/share";
const WS_HOST = "saas-backend-326a81a69453.herokuapp.com";
const LARGE_BYTES = 20 * 1024 * 1024; // ~20 MB
const RETRY_MS = 15 * 60 * 1000;
const RETRY_GAP_MS = 45_000;

type ShareDebug = {
  connected: boolean;
  status: string;
  wsState?: number;
  hasSharedKey?: boolean;
};

async function waitConnected(page: Page, timeout = 60000) {
  await expect(page.getByTestId("share-status")).toHaveText(
    "Connected (P2P)",
    { timeout },
  );
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const d = (
            window as unknown as { __shareDebug?: () => ShareDebug }
          ).__shareDebug?.();
          return d
            ? {
                connected: d.connected,
                hasSharedKey: d.hasSharedKey,
                wsState: d.wsState,
              }
            : null;
        }),
      { timeout: 15000 },
    )
    .toMatchObject({
      connected: true,
      hasSharedKey: true,
      wsState: 1,
    });
}

async function createRoom(page: Page): Promise<string> {
  await page.goto(SHARE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.locator("button").filter({ hasText: "Get a code to share" }).click();
  await expect(page.getByTestId("share-status")).toContainText(
    /Waiting for peer|Connecting/i,
    { timeout: 30000 },
  );
  const codeEl = page.locator("p.text-3xl.font-bold.tracking-widest");
  await expect(codeEl).toBeVisible({ timeout: 15000 });
  const roomCode = ((await codeEl.textContent()) || "").trim();
  expect(roomCode).toMatch(/^\d{6}$/);
  return roomCode;
}

function isRateLimitError(text: string): boolean {
  return /rate.?limit|too many|message size|frame too large|256\s*KB/i.test(
    text,
  );
}

async function runShareSession(
  browser: Browser,
  largeFilePath: string,
  fileName: string,
  expectedSize: number,
): Promise<{ ok: boolean; rateLimited: boolean; detail: string }> {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();
  pageA.on("console", (m) => console.log("[A]", m.type(), m.text()));
  pageB.on("console", (m) => console.log("[B]", m.type(), m.text()));

  const wsUrls: string[] = [];
  for (const p of [pageA, pageB]) {
    p.on("websocket", (ws) => {
      console.log("WS", ws.url());
      wsUrls.push(ws.url());
    });
  }

  try {
    const roomCode = await createRoom(pageA);
    console.log("room", roomCode);

    await pageB.goto(`${SHARE_URL}?room=${roomCode}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await Promise.all([waitConnected(pageA), waitConnected(pageB)]);
    console.log("both Connected (P2P)");

    expect(
      wsUrls.some((u) => u.includes(WS_HOST) && u.includes("/ws/share/ws/")),
    ).toBeTruthy();
    expect(wsUrls.some((u) => u.includes("/ws/share/signal/"))).toBeFalsy();

    for (const page of [pageA, pageB]) {
      const body = await page.locator("body").innerText();
      expect(body.toLowerCase()).not.toContain("relay");
    }

    const textAB = `hello-from-A-${Date.now()}`;
    await pageA.locator("textarea").fill(textAB);
    await pageA.getByRole("button", { name: /Send Text/i }).click();
    await expect(pageA.getByText(textAB, { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(pageB.getByText(textAB, { exact: true })).toBeVisible({
      timeout: 20000,
    });
    console.log("A->B text ok");

    const textBA = `hello-from-B-${Date.now()}`;
    await pageB.locator("textarea").fill(textBA);
    await pageB.getByRole("button", { name: /Send Text/i }).click();
    await expect(pageB.getByText(textBA, { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(pageA.getByText(textBA, { exact: true })).toBeVisible({
      timeout: 20000,
    });
    console.log("B->A text ok");

    // ~20MB file
    await pageA.locator('input[type="file"]').setInputFiles(largeFilePath);

    const deadline = Date.now() + 180_000;
    let received = false;
    while (Date.now() < deadline) {
      const errA = await pageA
        .getByTestId("share-error")
        .textContent()
        .catch(() => null);
      const errB = await pageB
        .getByTestId("share-error")
        .textContent()
        .catch(() => null);
      const errText = `${errA || ""} ${errB || ""}`.trim();
      if (errText && isRateLimitError(errText)) {
        return { ok: false, rateLimited: true, detail: errText };
      }

      const fileEl = pageB.getByTestId("received-file");
      if (await fileEl.isVisible().catch(() => false)) {
        const size = Number(await fileEl.getAttribute("data-filesize"));
        const name = await fileEl.getAttribute("data-filename");
        expect(size).toBe(expectedSize);
        expect(name).toBe(fileName);
        received = true;
        break;
      }
      await pageB.waitForTimeout(500);
    }

    if (!received) {
      const errA = await pageA
        .locator("[data-testid=share-error]")
        .textContent()
        .catch(() => "");
      const errB = await pageB
        .locator("[data-testid=share-error]")
        .textContent()
        .catch(() => "");
      const detail = `${errA || ""} ${errB || ""}`.trim() || "file not received in time";
      if (isRateLimitError(detail)) {
        return { ok: false, rateLimited: true, detail };
      }
      return { ok: false, rateLimited: false, detail };
    }
    console.log("file A->B ok", expectedSize);

    // Third peer → room full
    const ctxC = await browser.newContext();
    const pageC = await ctxC.newPage();
    await pageC.goto(`${SHARE_URL}?room=${roomCode}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await expect(pageC.getByTestId("share-status")).toHaveText(/Room full/i, {
      timeout: 25000,
    });
    await expect(
      pageC.getByText("Room is full. Maximum 2 peers allowed per room."),
    ).toBeVisible({ timeout: 5000 });
    console.log("room-full ok");
    await ctxC.close();

    return { ok: true, rateLimited: false, detail: "passed" };
  } finally {
    await ctxA.close().catch(() => {});
    await ctxB.close().catch(() => {});
  }
}

test("Share: text, ~20MB file, room-full (wait for backend limits if needed)", async () => {
  test.setTimeout(RETRY_MS + 5 * 60_000);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "share-large-"));
  const fileName = "share-20mb.bin";
  const filePath = path.join(tmpDir, fileName);
  // Sparse-ish write: fill with a repeating pattern without holding two copies
  const fd = fs.openSync(filePath, "w");
  const chunk = Buffer.alloc(1024 * 1024, 0x5a);
  for (let i = 0; i < LARGE_BYTES / chunk.length; i++) {
    fs.writeSync(fd, chunk);
  }
  fs.closeSync(fd);
  expect(fs.statSync(filePath).size).toBe(LARGE_BYTES);

  const browser = await chromium.launch({ headless: true });
  const started = Date.now();
  let attempt = 0;
  let lastDetail = "";

  try {
    while (Date.now() - started < RETRY_MS) {
      attempt += 1;
      console.log(`attempt ${attempt}`);
      const result = await runShareSession(
        browser,
        filePath,
        fileName,
        LARGE_BYTES,
      );
      if (result.ok) {
        console.log("all checks passed");
        return;
      }
      lastDetail = result.detail;
      if (!result.rateLimited) {
        throw new Error(`Share verification failed: ${result.detail}`);
      }
      console.log(
        `Backend still limiting large transfers (${result.detail}); waiting ${RETRY_GAP_MS / 1000}s…`,
      );
      await new Promise((r) => setTimeout(r, RETRY_GAP_MS));
    }
    throw new Error(
      `Backend rate/size limits still blocking ~20MB after ~15m: ${lastDetail}`,
    );
  } finally {
    await browser.close().catch(() => {});
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

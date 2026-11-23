/**
 * Production verification: Share P2P + automatic relay fallback on
 * https://www.eprod.io/share
 */
import { test, expect, chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SHARE_URL = "https://www.eprod.io/share";
const SIGNAL_HOST = "saas-backend-326a81a69453.herokuapp.com";

type ShareDebug = {
  connected: boolean;
  status: string;
  mode?: string | null;
  dcState?: string;
  pcState?: string;
};

async function waitStatus(page: Page, re: RegExp, timeout = 60000) {
  await expect(page.getByTestId("share-status")).toHaveText(re, { timeout });
}

async function waitConnectedP2P(page: Page, timeout = 60000) {
  await waitStatus(page, /Connected \(P2P\)/i, timeout);
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const d = (
            window as unknown as { __shareDebug?: () => ShareDebug }
          ).__shareDebug?.();
          return d
            ? { connected: d.connected, dcState: d.dcState, mode: d.mode }
            : null;
        }),
      { timeout: 15000 },
    )
    .toMatchObject({ connected: true, dcState: "open", mode: "p2p" });
}

async function waitConnectedRelay(page: Page, timeout = 90000) {
  await waitStatus(page, /Connected \(relay\)/i, timeout);
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const d = (
            window as unknown as { __shareDebug?: () => ShareDebug }
          ).__shareDebug?.();
          return d ? { connected: d.connected, mode: d.mode, status: d.status } : null;
        }),
      { timeout: 15000 },
    )
    .toMatchObject({ connected: true, mode: "relay" });
}

async function exchangeTextAndFile(pageA: Page, pageB: Page, tag: string) {
  const textAB = `hello-from-A-${tag}-${Date.now()}`;
  await pageA.locator("textarea").fill(textAB);
  await pageA.getByRole("button", { name: /Send Text/i }).click();
  await expect(pageA.getByText(textAB, { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(pageB.getByText(textAB, { exact: true })).toBeVisible({
    timeout: 20000,
  });
  console.log(`[${tag}] A->B text ok`);

  const textBA = `hello-from-B-${tag}-${Date.now()}`;
  await pageB.locator("textarea").fill(textBA);
  await pageB.getByRole("button", { name: /Send Text/i }).click();
  await expect(pageB.getByText(textBA, { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(pageA.getByText(textBA, { exact: true })).toBeVisible({
    timeout: 20000,
  });
  console.log(`[${tag}] B->A text ok`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `share-${tag}-`));
  const fileName = `${tag}-test.bin`;
  const filePath = path.join(tmpDir, fileName);
  const fileBytes = Buffer.alloc(48 * 1024, 0x5a);
  fs.writeFileSync(filePath, fileBytes);

  await pageA.locator('input[type="file"]').setInputFiles(filePath);
  await expect(pageB.getByTestId("received-file")).toBeVisible({
    timeout: 60000,
  });
  const receivedSize = await pageB
    .getByTestId("received-file")
    .getAttribute("data-filesize");
  expect(Number(receivedSize)).toBe(fileBytes.length);
  const receivedName = await pageB
    .getByTestId("received-file")
    .getAttribute("data-filename");
  expect(receivedName).toBe(fileName);
  console.log(`[${tag}] file A->B ok`, receivedSize);
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

test.describe("Share transport modes", () => {
  test("P2P: Connected (P2P), text both ways + file", async () => {
    test.setTimeout(180000);
    const browser = await chromium.launch({ headless: true });
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
      await pageA.goto(SHARE_URL, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await pageA
        .locator("button")
        .filter({ hasText: "Get a code to share" })
        .click();
      await expect(pageA.getByTestId("share-status")).toContainText(
        /Waiting for peer|Connecting/i,
        { timeout: 30000 },
      );
      const codeEl = pageA.locator("p.text-3xl.font-bold.tracking-widest");
      await expect(codeEl).toBeVisible({ timeout: 15000 });
      const roomCode = ((await codeEl.textContent()) || "").trim();
      expect(roomCode).toMatch(/^\d{6}$/);
      console.log("room", roomCode);

      await pageB.goto(`${SHARE_URL}?room=${roomCode}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await Promise.all([waitConnectedP2P(pageA), waitConnectedP2P(pageB)]);
      console.log("both Connected (P2P)");
      expect(
        wsUrls.some(
          (u) => u.includes(SIGNAL_HOST) && u.includes("/ws/share/signal/"),
        ),
      ).toBeTruthy();

      await exchangeTextAndFile(pageA, pageB, "p2p");
    } finally {
      await ctxA.close().catch(() => {});
      await ctxB.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  });

  test("Relay fallback: forceRelayFallback=1 → Connected (relay), text + file", async () => {
    test.setTimeout(180000);
    const browser = await chromium.launch({ headless: true });
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
      await pageA.goto(`${SHARE_URL}?forceRelayFallback=1`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await pageA
        .locator("button")
        .filter({ hasText: "Get a code to share" })
        .click();
      await expect(pageA.getByTestId("share-status")).toContainText(
        /Waiting for peer|Connecting/i,
        { timeout: 30000 },
      );
      const codeEl = pageA.locator("p.text-3xl.font-bold.tracking-widest");
      await expect(codeEl).toBeVisible({ timeout: 15000 });
      const roomCode = ((await codeEl.textContent()) || "").trim();
      expect(roomCode).toMatch(/^\d{6}$/);
      console.log("relay-room", roomCode);

      await pageB.goto(
        `${SHARE_URL}?room=${roomCode}&forceRelayFallback=1`,
        { waitUntil: "domcontentloaded", timeout: 60000 },
      );

      await Promise.all([
        waitConnectedRelay(pageA),
        waitConnectedRelay(pageB),
      ]);
      console.log("both Connected (relay)");

      // Must have hit the legacy relay socket
      expect(
        wsUrls.some(
          (u) => u.includes(SIGNAL_HOST) && u.includes("/ws/share/ws/"),
        ),
      ).toBeTruthy();

      // No hard error shown — only Connected (relay)
      await expect(pageA.locator(".bg-red-50")).toHaveCount(0);
      await expect(pageB.locator(".bg-red-50")).toHaveCount(0);

      await exchangeTextAndFile(pageA, pageB, "relay");
    } finally {
      await ctxA.close().catch(() => {});
      await ctxB.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  });
});

/**
 * Production verification for Share (encrypted WS) on https://www.eprod.io/share
 * Two contexts: Connected (P2P), A↔B text, ~48KB file; third peer → Room full.
 */
import { test, expect, chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SHARE_URL = "https://www.eprod.io/share";
const WS_HOST = "saas-backend-326a81a69453.herokuapp.com";

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
      wsState: 1, // WebSocket.OPEN
    });
}

test("Share: Connected (P2P), text both ways, file, room-full", async () => {
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

    await Promise.all([waitConnected(pageA), waitConnected(pageB)]);
    console.log("both Connected (P2P)");

    expect(
      wsUrls.some((u) => u.includes(WS_HOST) && u.includes("/ws/share/ws/")),
    ).toBeTruthy();
    // Must not open the signaling socket
    expect(wsUrls.some((u) => u.includes("/ws/share/signal/"))).toBeFalsy();

    // UI must not say "relay"
    for (const page of [pageA, pageB]) {
      const body = await page.locator("body").innerText();
      expect(body.toLowerCase()).not.toContain("relay");
    }

    // A → B text
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

    // B → A text
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

    // File ~48KB
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "share-ws-"));
    const fileName = "share-test.bin";
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
    console.log("file A->B ok", receivedSize);
    fs.rmSync(tmpDir, { recursive: true, force: true });

    // Third peer → room full
    const ctxC = await browser.newContext();
    const pageC = await ctxC.newPage();
    pageC.on("console", (m) => console.log("[C]", m.type(), m.text()));
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
  } finally {
    await ctxA.close().catch(() => {});
    await ctxB.close().catch(() => {});
    await browser.close().catch(() => {});
  }
});

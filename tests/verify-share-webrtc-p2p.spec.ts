/**
 * Production verification: Share WebRTC P2P on https://www.eprod.io/share
 * Two contexts in one room: Connected (P2P), A↔B text, file size match,
 * WS frames signaling-only. Third context gets room-full.
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
  dcState?: string;
  pcState?: string;
};

async function waitConnectedP2P(page: Page, timeout = 60000) {
  await expect(page.getByTestId("share-status")).toHaveText("Connected (P2P)", {
    timeout,
  });
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
                dcState: d.dcState,
                pcState: d.pcState,
                status: d.status,
              }
            : null;
        }),
      { timeout: 15000 },
    )
    .toMatchObject({
      connected: true,
      dcState: "open",
    });
  // pcState should be connected (or connecting briefly); DataChannel open is the hard gate
  const dbg = await page.evaluate(() =>
    (
      window as unknown as { __shareDebug?: () => ShareDebug }
    ).__shareDebug?.(),
  );
  expect(["connected", "connecting"]).toContain(dbg?.pcState);
}

function attachWsCapture(page: Page) {
  const frames: { dir: "in" | "out"; data: string }[] = [];
  page.on("websocket", (ws) => {
    if (!ws.url().includes("/ws/share/")) return;
    ws.on("framesent", (frame) => {
      const data =
        typeof frame.payload === "string"
          ? frame.payload
          : Buffer.from(frame.payload).toString("utf8");
      frames.push({ dir: "out", data });
    });
    ws.on("framereceived", (frame) => {
      const data =
        typeof frame.payload === "string"
          ? frame.payload
          : Buffer.from(frame.payload).toString("utf8");
      frames.push({ dir: "in", data });
    });
  });
  return frames;
}

function assertSignalingOnly(frames: { dir: "in" | "out"; data: string }[]) {
  const allowedOut = new Set(["offer", "answer", "ice-candidate"]);
  const allowedIn = new Set([
    "joined",
    "peer-joined",
    "peer-left",
    "error",
    "ping",
    "offer",
    "answer",
    "ice-candidate",
  ]);

  for (const f of frames) {
    let parsed: { type?: string; data?: unknown; fileName?: string };
    try {
      parsed = JSON.parse(f.data);
    } catch {
      throw new Error(`Non-JSON WS frame (${f.dir}): ${f.data.slice(0, 120)}`);
    }
    const t = parsed.type;
    if (!t) throw new Error(`WS frame missing type: ${f.data.slice(0, 120)}`);

    // Application payloads must never appear on the signaling socket
    if (
      t === "text" ||
      t === "file" ||
      t === "file-meta" ||
      t === "file-complete" ||
      t === "file-chunk" ||
      "fileName" in parsed ||
      (typeof parsed.data === "string" && parsed.data.length > 0 && t !== "error")
    ) {
      // error.message is fine; text.data is not
      if (t === "text" || t === "file" || t === "file-meta" || t === "file-complete") {
        throw new Error(`Application payload on signaling WS: ${f.data.slice(0, 200)}`);
      }
    }

    if (f.dir === "out" && !allowedOut.has(t)) {
      throw new Error(`Unexpected outbound signaling type "${t}": ${f.data.slice(0, 200)}`);
    }
    if (f.dir === "in" && !allowedIn.has(t)) {
      throw new Error(`Unexpected inbound signaling type "${t}": ${f.data.slice(0, 200)}`);
    }
  }
}

test("Share WebRTC P2P: text, file, signaling-only, room-full", async () => {
  test.setTimeout(180000);

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-web-security",
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
    ],
  });
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();
  pageA.on("console", (m) => console.log("[A]", m.type(), m.text()));
  pageB.on("console", (m) => console.log("[B]", m.type(), m.text()));
  pageA.on("pageerror", (e) => console.log("[A pageerror]", e.message));
  pageB.on("pageerror", (e) => console.log("[B pageerror]", e.message));

  const wsUrls: string[] = [];
  for (const p of [pageA, pageB]) {
    p.on("websocket", (ws) => {
      console.log("WS open", ws.url());
      wsUrls.push(ws.url());
    });
  }

  const framesA = attachWsCapture(pageA);
  const framesB = attachWsCapture(pageB);

  try {
    // --- Peer A creates room ---
    await pageA.goto(SHARE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await pageA.locator("button").filter({ hasText: "Get a code to share" }).click();
    await expect(pageA.getByTestId("share-status")).toContainText(
      /Waiting for peer|Connecting/i,
      { timeout: 30000 },
    );
    const codeEl = pageA.locator("p.text-3xl.font-bold.tracking-widest");
    await expect(codeEl).toBeVisible({ timeout: 15000 });
    const roomCode = ((await codeEl.textContent()) || "").trim();
    expect(roomCode).toMatch(/^\d{6}$/);
    console.log("room", roomCode);

    // --- Peer B joins via deep link ---
    await pageB.goto(`${SHARE_URL}?room=${roomCode}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await Promise.all([waitConnectedP2P(pageA), waitConnectedP2P(pageB)]);
    console.log("both Connected (P2P)");

    expect(framesA.length + framesB.length).toBeGreaterThan(0);
    expect(wsUrls.some((u) => u.includes(SIGNAL_HOST) && u.includes("/ws/share/signal/"))).toBeTruthy();

    // --- A → B text ---
    const textAB = `hello-from-A-${Date.now()}`;
    await pageA.locator("textarea").fill(textAB);
    await pageA.getByRole("button", { name: /Send Text/i }).click();
    await expect(pageA.getByText(textAB, { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(pageB.getByText(textAB, { exact: true })).toBeVisible({ timeout: 20000 });
    console.log("A->B text ok");

    // --- B → A text ---
    const textBA = `hello-from-B-${Date.now()}`;
    await pageB.locator("textarea").fill(textBA);
    await pageB.getByRole("button", { name: /Send Text/i }).click();
    await expect(pageB.getByText(textBA, { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(pageA.getByText(textBA, { exact: true })).toBeVisible({ timeout: 20000 });
    console.log("B->A text ok");

    // --- File A → B ---
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "share-p2p-"));
    const fileName = "p2p-test.bin";
    const filePath = path.join(tmpDir, fileName);
    const fileBytes = Buffer.alloc(48 * 1024, 0x5a); // 48 KiB
    fs.writeFileSync(filePath, fileBytes);

    await pageA.locator('input[type="file"]').setInputFiles(filePath);
    await expect(pageB.getByTestId("received-file")).toBeVisible({ timeout: 45000 });
    const receivedSize = await pageB
      .getByTestId("received-file")
      .getAttribute("data-filesize");
    expect(Number(receivedSize)).toBe(fileBytes.length);
    const receivedName = await pageB
      .getByTestId("received-file")
      .getAttribute("data-filename");
    expect(receivedName).toBe(fileName);
    console.log("file A->B ok", receivedSize);

    // --- WS signaling only (no app payloads) ---
    assertSignalingOnly(framesA);
    assertSignalingOnly(framesB);

    const allOut = [...framesA, ...framesB].filter((f) => f.dir === "out");
    const outTypes = new Set(
      allOut.map((f) => {
        try {
          return JSON.parse(f.data).type as string;
        } catch {
          return "";
        }
      }),
    );
    expect(
      outTypes.has("offer") ||
        outTypes.has("answer") ||
        outTypes.has("ice-candidate"),
    ).toBeTruthy();
    console.log("signaling-only ok", [...outTypes]);

    // --- Third peer → room full ---
    const ctxC = await browser.newContext();
    const pageC = await ctxC.newPage();
    pageC.on("console", (m) => console.log("[C]", m.type(), m.text()));
    const framesC = attachWsCapture(pageC);
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

    assertSignalingOnly(framesC);
    const errFrame = framesC.find((f) => {
      try {
        const j = JSON.parse(f.data);
        return j.type === "error" && /full/i.test(j.message || "");
      } catch {
        return false;
      }
    });
    expect(errFrame).toBeTruthy();

    await ctxC.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } finally {
    await ctxA.close().catch(() => {});
    await ctxB.close().catch(() => {});
    await browser.close().catch(() => {});
  }
});

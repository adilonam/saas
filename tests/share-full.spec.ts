import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import crypto from 'crypto';

const BASE_URL = 'https://www.eprod.io';

// Helper to compute SHA-256 hash
function sha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

test.describe('Share P2P Transfer', () => {
  test('Send and Receive: text and file both directions with hash check', async ({ browser }) => {
    // Create two contexts (sender and receiver)
    const senderContext = await browser.newContext();
    const receiverContext = await browser.newContext();

    const senderPage = await senderContext.newPage();
    const receiverPage = await receiverContext.newPage();

    try {
      // === SENDER: Click Send button to auto-generate room ===
      await senderPage.goto(`${BASE_URL}/share`);
      await senderPage.waitForLoadState('networkidle');
      
      // Click Send button
      await senderPage.click('button:has-text("Send")');
      
      // Wait for room code to appear
      await senderPage.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
      const roomCodeElement = senderPage.locator('text=/\\d{6}/').first();
      const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
      console.log('Sender generated room code:', roomCode);
      
      expect(roomCode).toMatch(/^\d{6}$/);

      // Sender queues a text message before peer joins
      await senderPage.fill('textarea', 'Hello from sender!');
      await senderPage.click('button:has-text("Send Text")');

      // === RECEIVER: Enter code and join ===
      await receiverPage.goto(`${BASE_URL}/share`);
      await receiverPage.waitForLoadState('networkidle');
      
      // Click Receive button
      await receiverPage.click('button:has-text("Receive")');
      
      // Enter room code
      await receiverPage.fill('input[type="text"]', roomCode);
      await receiverPage.click('button:has-text("Join Room")');

      // Wait for connection (up to 15s for WebRTC or relay fallback)
      await expect(senderPage.locator('text=/connected/i')).toBeVisible({ timeout: 15000 });
      await expect(receiverPage.locator('text=/connected/i')).toBeVisible({ timeout: 15000 });

      // Wait for queued text to arrive at receiver
      await receiverPage.waitForSelector('text=Hello from sender!', { timeout: 10000 });
      
      // Receiver sends text back
      await receiverPage.fill('textarea', 'Hello from receiver!');
      await receiverPage.click('button:has-text("Send Text")');
      
      // Sender receives text
      await senderPage.waitForSelector('text=Hello from receiver!', { timeout: 10000 });

      // === FILE TRANSFER: Sender → Receiver ===
      const testFileContent = Buffer.from('This is a test file from sender.\n'.repeat(100));
      const testFileHash = sha256(testFileContent);
      
      const senderTempFile = `/tmp/test-file-sender-${Date.now()}.txt`;
      await senderContext.addInitScript(() => {
        // Expose file for upload
      });
      
      // Write temp file for sender upload
      await senderPage.evaluate(async ([content, filename]) => {
        const blob = new Blob([new Uint8Array(content)], { type: 'text/plain' });
        const file = new File([blob], filename, { type: 'text/plain' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, [Array.from(testFileContent), 'test-sender.txt']);

      // Wait for file to be sent (progress completes)
      await expect(senderPage.locator('text=/sent/i')).toBeVisible({ timeout: 30000 });

      // Receiver should see received file
      await expect(receiverPage.locator('text=test-sender.txt')).toBeVisible({ timeout: 30000 });
      
      // Download and verify hash
      const downloadPromise = receiverPage.waitForEvent('download');
      await receiverPage.click('button:has-text("Download"):near(text=test-sender.txt)');
      const download = await downloadPromise;
      const downloadPath = `/tmp/downloaded-${Date.now()}.txt`;
      await download.saveAs(downloadPath);
      
      const fs = require('fs');
      const downloadedContent = fs.readFileSync(downloadPath);
      const downloadedHash = sha256(downloadedContent);
      
      expect(downloadedHash).toBe(testFileHash);
      console.log('File hash verified: sender → receiver');

      // === FILE TRANSFER: Receiver → Sender ===
      const testFileContent2 = Buffer.from('This is a test file from receiver.\n'.repeat(100));
      const testFileHash2 = sha256(testFileContent2);
      
      await receiverPage.evaluate(async ([content, filename]) => {
        const blob = new Blob([new Uint8Array(content)], { type: 'text/plain' });
        const file = new File([blob], filename, { type: 'text/plain' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, [Array.from(testFileContent2), 'test-receiver.txt']);

      // Wait for file to be sent
      await expect(receiverPage.locator('text=/sent/i')).toBeVisible({ timeout: 30000 });

      // Sender should see received file
      await expect(senderPage.locator('text=test-receiver.txt')).toBeVisible({ timeout: 30000 });
      
      // Download and verify hash
      const downloadPromise2 = senderPage.waitForEvent('download');
      await senderPage.click('button:has-text("Download"):near(text=test-receiver.txt)');
      const download2 = await downloadPromise2;
      const downloadPath2 = `/tmp/downloaded-2-${Date.now()}.txt`;
      await download2.saveAs(downloadPath2);
      
      const downloadedContent2 = fs.readFileSync(downloadPath2);
      const downloadedHash2 = sha256(downloadedContent2);
      
      expect(downloadedHash2).toBe(testFileHash2);
      console.log('File hash verified: receiver → sender');

      // Take screenshots
      await senderPage.screenshot({ path: '/workspace/tests/screenshots/share-sender-final.png', fullPage: true });
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/share-receiver-final.png', fullPage: true });

      console.log('✅ All tests passed!');

    } finally {
      await senderPage.close();
      await receiverPage.close();
      await senderContext.close();
      await receiverContext.close();
    }
  });

  test('QR URL auto-join as receiver', async ({ page }) => {
    // Generate room code first (simulate sender)
    await page.goto(`${BASE_URL}/share`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Send")');
    await page.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
    const roomCodeElement = page.locator('text=/\\d{6}/').first();
    const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';

    // Open new page with QR URL
    const qrPage = await page.context().newPage();
    await qrPage.goto(`${BASE_URL}/share?room=${roomCode}`);
    await qrPage.waitForLoadState('networkidle');

    // Should auto-join and connect
    await expect(qrPage.locator('text=/connected/i')).toBeVisible({ timeout: 15000 });
    
    await qrPage.screenshot({ path: '/workspace/tests/screenshots/share-qr-autojoin.png', fullPage: true });
    
    console.log('✅ QR auto-join test passed!');
  });
});

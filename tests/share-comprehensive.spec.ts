import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import fs from 'fs';

const BASE_URL = 'https://www.eprod.io';

function sha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function createTestFile(sizeKB: number, name: string): Buffer {
  const content = Buffer.alloc(sizeKB * 1024);
  for (let i = 0; i < content.length; i++) {
    content[i] = i % 256;
  }
  return content;
}

test.describe('Share P2P - Comprehensive Tests', () => {
  
  test('Full flow: text both ways + 1MB file both ways with hash verification', async ({ browser }) => {
    const senderContext = await browser.newContext();
    const receiverContext = await browser.newContext();
    
    const senderPage = await senderContext.newPage();
    const receiverPage = await receiverContext.newPage();

    try {
      console.log('\n=== TEST: Full bidirectional transfer ===\n');
      
      // === SETUP: Sender creates room ===
      console.log('Sender: Opening /share');
      await senderPage.goto(`${BASE_URL}/share`);
      await senderPage.waitForLoadState('networkidle');
      
      console.log('Sender: Clicking Send');
      await senderPage.click('button:has-text("Send")');
      await senderPage.waitForTimeout(2000);
      
      const roomCodeElement = await senderPage.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
      const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
      console.log(`✓ Room created: ${roomCode}`);
      expect(roomCode).toMatch(/^\d{6}$/);

      // === SETUP: Receiver joins ===
      console.log('Receiver: Opening /share');
      await receiverPage.goto(`${BASE_URL}/share`);
      await receiverPage.waitForLoadState('networkidle');
      
      console.log('Receiver: Entering code and joining');
      await receiverPage.click('button:has-text("Receive")');
      await receiverPage.fill('input[type="text"]', roomCode);
      await receiverPage.click('button:has-text("Join")');

      console.log('Waiting for connection (45s timeout)...');
      await expect(senderPage.locator('text=/Connected/i')).toBeVisible({ timeout: 45000 });
      await expect(receiverPage.locator('text=/Connected/i')).toBeVisible({ timeout: 45000 });
      console.log('✓ Both sides connected\n');

      await senderPage.screenshot({ path: '/workspace/tests/screenshots/full-01-sender-connected.png' });
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/full-02-receiver-connected.png' });

      // === TEST 1: Text sender → receiver ===
      console.log('TEST 1: Sending text from sender to receiver');
      const textStoR = 'Hello from sender! 🚀';
      await senderPage.fill('textarea', textStoR);
      await senderPage.click('button:has-text("Send Text")');
      
      await receiverPage.waitForSelector(`text=${textStoR}`, { timeout: 15000 });
      console.log('✓ Text received at receiver\n');
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/full-03-receiver-got-text.png' });

      // === TEST 2: Text receiver → sender ===
      console.log('TEST 2: Sending text from receiver to sender');
      const textRtoS = 'Reply from receiver! 👍';
      await receiverPage.fill('textarea', textRtoS);
      await receiverPage.click('button:has-text("Send Text")');
      
      await senderPage.waitForSelector(`text=${textRtoS}`, { timeout: 15000 });
      console.log('✓ Text received at sender\n');
      await senderPage.screenshot({ path: '/workspace/tests/screenshots/full-04-sender-got-text.png' });

      // === TEST 3: File sender → receiver (~1MB) ===
      console.log('TEST 3: Sending ~1MB file from sender to receiver');
      const file1 = createTestFile(1024, 'test-sender-1mb.bin'); // 1MB
      const file1Hash = sha256(file1);
      console.log(`File1 hash: ${file1Hash}`);
      
      const file1Path = `/tmp/test-sender-1mb-${Date.now()}.bin`;
      fs.writeFileSync(file1Path, file1);
      
      await senderPage.evaluate(async ([fileContent, fileName]) => {
        const blob = new Blob([new Uint8Array(fileContent)], { type: 'application/octet-stream' });
        const file = new File([blob], fileName, { type: 'application/octet-stream' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, [Array.from(file1), 'test-sender-1mb.bin']);

      // Wait for file to complete
      await receiverPage.waitForSelector('text=/test-sender-1mb.bin/', { timeout: 120000 });
      console.log('✓ File meta received');
      
      // Wait for download button
      await receiverPage.waitForSelector('button:has-text("Download")', { timeout: 60000 });
      console.log('✓ File transfer complete');
      
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/full-05-receiver-got-file.png' });

      // Download and verify
      const downloadPromise1 = receiverPage.waitForEvent('download', { timeout: 10000 });
      await receiverPage.locator('button:has-text("Download")').first().click();
      const download1 = await downloadPromise1;
      const download1Path = `/tmp/downloaded-1-${Date.now()}.bin`;
      await download1.saveAs(download1Path);
      
      const downloaded1 = fs.readFileSync(download1Path);
      const downloaded1Hash = sha256(downloaded1);
      console.log(`Downloaded hash: ${downloaded1Hash}`);
      expect(downloaded1Hash).toBe(file1Hash);
      console.log('✓ SHA-256 hash verified: Sender → Receiver\n');

      // === TEST 4: File receiver → sender (~1MB) ===
      console.log('TEST 4: Sending ~1MB file from receiver to sender');
      const file2 = createTestFile(1024, 'test-receiver-1mb.bin'); // 1MB
      const file2Hash = sha256(file2);
      console.log(`File2 hash: ${file2Hash}`);
      
      const file2Path = `/tmp/test-receiver-1mb-${Date.now()}.bin`;
      fs.writeFileSync(file2Path, file2);
      
      await receiverPage.evaluate(async ([fileContent, fileName]) => {
        const blob = new Blob([new Uint8Array(fileContent)], { type: 'application/octet-stream' });
        const file = new File([blob], fileName, { type: 'application/octet-stream' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, [Array.from(file2), 'test-receiver-1mb.bin']);

      // Wait for file to complete
      await senderPage.waitForSelector('text=/test-receiver-1mb.bin/', { timeout: 120000 });
      console.log('✓ File meta received');
      
      await senderPage.waitForSelector('button:has-text("Download")', { timeout: 60000 });
      console.log('✓ File transfer complete');
      
      await senderPage.screenshot({ path: '/workspace/tests/screenshots/full-06-sender-got-file.png' });

      // Download and verify
      const downloadPromise2 = senderPage.waitForEvent('download', { timeout: 10000 });
      await senderPage.locator('button:has-text("Download")').first().click();
      const download2 = await downloadPromise2;
      const download2Path = `/tmp/downloaded-2-${Date.now()}.bin`;
      await download2.saveAs(download2Path);
      
      const downloaded2 = fs.readFileSync(download2Path);
      const downloaded2Hash = sha256(downloaded2);
      console.log(`Downloaded hash: ${downloaded2Hash}`);
      expect(downloaded2Hash).toBe(file2Hash);
      console.log('✓ SHA-256 hash verified: Receiver → Sender\n');

      console.log('=== ✅ ALL TESTS PASSED ===\n');

    } finally {
      await senderPage.close().catch(() => {});
      await receiverPage.close().catch(() => {});
      await senderContext.close().catch(() => {});
      await receiverContext.close().catch(() => {});
    }
  });

  test('QR URL auto-join', async ({ page }) => {
    console.log('\n=== TEST: QR auto-join ===\n');
    
    console.log('Creating room as sender');
    await page.goto(`${BASE_URL}/share`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Send")');
    
    const roomCodeElement = await page.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
    const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
    console.log(`Room: ${roomCode}`);

    console.log('Opening QR URL in new tab');
    const qrPage = await page.context().newPage();
    await qrPage.goto(`${BASE_URL}/share?room=${roomCode}`);
    await qrPage.waitForLoadState('networkidle');
    await qrPage.screenshot({ path: '/workspace/tests/screenshots/qr-test-landing.png' });

    console.log('Waiting for auto-join connection');
    await expect(qrPage.locator('text=/Connected/i')).toBeVisible({ timeout: 45000 });
    console.log('✓ QR auto-join connected');
    
    await qrPage.screenshot({ path: '/workspace/tests/screenshots/qr-test-connected.png', fullPage: true });
    console.log('=== ✅ QR TEST PASSED ===\n');
  });

  test('Relay mode with WebRTC forced off', async ({ browser }) => {
    console.log('\n=== TEST: Relay mode (WebRTC off) ===\n');
    
    const senderContext = await browser.newContext();
    const receiverContext = await browser.newContext();
    
    const senderPage = await senderContext.newPage();
    const receiverPage = await receiverContext.newPage();

    try {
      // Force relay mode with ?relay=1
      console.log('Sender: Opening /share?relay=1');
      await senderPage.goto(`${BASE_URL}/share?relay=1`);
      await senderPage.waitForLoadState('networkidle');
      
      await senderPage.click('button:has-text("Send")');
      const roomCodeElement = await senderPage.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
      const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
      console.log(`Room: ${roomCode}`);

      console.log('Receiver: Opening /share?relay=1');
      await receiverPage.goto(`${BASE_URL}/share?relay=1`);
      await receiverPage.waitForLoadState('networkidle');
      
      await receiverPage.click('button:has-text("Receive")');
      await receiverPage.fill('input[type="text"]', roomCode);
      await receiverPage.click('button:has-text("Join")');

      console.log('Waiting for relay connection');
      await expect(senderPage.locator('text=/Connected.*relay/i')).toBeVisible({ timeout: 45000 });
      await expect(receiverPage.locator('text=/Connected.*relay/i')).toBeVisible({ timeout: 45000 });
      console.log('✓ Relay mode connected');

      await senderPage.screenshot({ path: '/workspace/tests/screenshots/relay-01-connected.png' });
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/relay-02-connected.png' });

      // Test text transfer in relay mode
      console.log('Testing text transfer in relay mode');
      await senderPage.fill('textarea', 'Relay test message');
      await senderPage.click('button:has-text("Send Text")');
      
      await receiverPage.waitForSelector('text=Relay test message', { timeout: 15000 });
      console.log('✓ Text delivered via relay');
      
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/relay-03-text-received.png', fullPage: true });
      
      console.log('=== ✅ RELAY TEST PASSED ===\n');

    } finally {
      await senderPage.close().catch(() => {});
      await receiverPage.close().catch(() => {});
      await senderContext.close().catch(() => {});
      await receiverContext.close().catch(() => {});
    }
  });
});

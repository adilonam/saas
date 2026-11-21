import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.eprod.io';

test.describe('Share P2P - Simplified Tests', () => {
  test('Send creates room, Receive joins, text exchange works', async ({ browser }) => {
    const senderContext = await browser.newContext();
    const receiverContext = await browser.newContext();
    
    const senderPage = await senderContext.newPage();
    const receiverPage = await receiverContext.newPage();

    try {
      console.log('=== SENDER: Opening /share ===');
      await senderPage.goto(`${BASE_URL}/share`);
      await senderPage.waitForLoadState('networkidle');
      await senderPage.screenshot({ path: '/workspace/tests/screenshots/01-sender-landing.png' });

      console.log('=== SENDER: Clicking Send button ===');
      await senderPage.click('button:has-text("Send")');
      await senderPage.waitForTimeout(2000);
      await senderPage.screenshot({ path: '/workspace/tests/screenshots/02-sender-waiting.png' });
      
      // Get room code
      const roomCodeElement = await senderPage.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
      const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
      console.log('✅ Room code generated:', roomCode);
      expect(roomCode).toMatch(/^\d{6}$/);

      // Sender types text before receiver joins
      console.log('=== SENDER: Queuing text message ===');
      await senderPage.fill('textarea', 'Hello from sender!');
      await senderPage.click('button:has-text("Send Text")');
      await senderPage.waitForTimeout(1000);

      console.log('=== RECEIVER: Opening /share ===');
      await receiverPage.goto(`${BASE_URL}/share`);
      await receiverPage.waitForLoadState('networkidle');
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/03-receiver-landing.png' });

      console.log('=== RECEIVER: Clicking Receive and entering code ===');
      await receiverPage.click('button:has-text("Receive")');
      await receiverPage.waitForTimeout(1000);
      await receiverPage.fill('input[type="text"]', roomCode);
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/04-receiver-entering-code.png' });
      await receiverPage.click('button:has-text("Join")');

      console.log('=== Waiting for connection (30s timeout) ===');
      // Wait for connection with longer timeout
      await expect(senderPage.locator('text=/connected/i')).toBeVisible({ timeout: 30000 });
      await expect(receiverPage.locator('text=/connected/i')).toBeVisible({ timeout: 30000 });
      console.log('✅ Both sides connected!');

      await senderPage.screenshot({ path: '/workspace/tests/screenshots/05-sender-connected.png' });
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/06-receiver-connected.png' });

      console.log('=== RECEIVER: Waiting for queued message ===');
      await receiverPage.waitForSelector('text=Hello from sender!', { timeout: 15000 });
      console.log('✅ Receiver got queued message');
      
      console.log('=== RECEIVER: Sending reply ===');
      await receiverPage.fill('textarea', 'Hello from receiver!');
      await receiverPage.click('button:has-text("Send Text")');
      
      console.log('=== SENDER: Waiting for reply ===');
      await senderPage.waitForSelector('text=Hello from receiver!', { timeout: 15000 });
      console.log('✅ Sender got reply');

      await senderPage.screenshot({ path: '/workspace/tests/screenshots/07-sender-final.png', fullPage: true });
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/08-receiver-final.png', fullPage: true });

      console.log('✅ TEST PASSED: Text exchange works!');

    } catch (error) {
      console.error('❌ Test failed:', error);
      await senderPage.screenshot({ path: '/workspace/tests/screenshots/error-sender.png', fullPage: true }).catch(() => {});
      await receiverPage.screenshot({ path: '/workspace/tests/screenshots/error-receiver.png', fullPage: true }).catch(() => {});
      throw error;
    } finally {
      await senderPage.close().catch(() => {});
      await receiverPage.close().catch(() => {});
      await senderContext.close().catch(() => {});
      await receiverContext.close().catch(() => {});
    }
  });

  test('QR URL auto-joins as receiver', async ({ page }) => {
    console.log('=== Creating room as sender ===');
    await page.goto(`${BASE_URL}/share`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Send")');
    
    const roomCodeElement = await page.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
    const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
    console.log('✅ Room code:', roomCode);

    console.log('=== Opening QR URL in new page ===');
    const qrPage = await page.context().newPage();
    await qrPage.goto(`${BASE_URL}/share?room=${roomCode}`);
    await qrPage.waitForLoadState('networkidle');
    await qrPage.screenshot({ path: '/workspace/tests/screenshots/qr-landing.png' });

    console.log('=== Waiting for auto-join connection ===');
    await expect(qrPage.locator('text=/connected/i')).toBeVisible({ timeout: 30000 });
    console.log('✅ QR auto-join connected!');
    
    await qrPage.screenshot({ path: '/workspace/tests/screenshots/qr-connected.png', fullPage: true });
  });
});

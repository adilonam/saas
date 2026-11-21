# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/share-simple.spec.ts >> Share P2P - Simplified Tests >> Send creates room, Receive joins, text exchange works
- Location: tests/share-simple.spec.ts:6:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('text=Hello from sender!') to be visible

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'https://www.eprod.io';
  4   | 
  5   | test.describe('Share P2P - Simplified Tests', () => {
  6   |   test('Send creates room, Receive joins, text exchange works', async ({ browser }) => {
  7   |     const senderContext = await browser.newContext();
  8   |     const receiverContext = await browser.newContext();
  9   |     
  10  |     const senderPage = await senderContext.newPage();
  11  |     const receiverPage = await receiverContext.newPage();
  12  | 
  13  |     try {
  14  |       console.log('=== SENDER: Opening /share ===');
  15  |       await senderPage.goto(`${BASE_URL}/share`);
  16  |       await senderPage.waitForLoadState('networkidle');
  17  |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/01-sender-landing.png' });
  18  | 
  19  |       console.log('=== SENDER: Clicking Send button ===');
  20  |       await senderPage.click('button:has-text("Send")');
  21  |       await senderPage.waitForTimeout(2000);
  22  |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/02-sender-waiting.png' });
  23  |       
  24  |       // Get room code
  25  |       const roomCodeElement = await senderPage.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
  26  |       const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
  27  |       console.log('✅ Room code generated:', roomCode);
  28  |       expect(roomCode).toMatch(/^\d{6}$/);
  29  | 
  30  |       // Sender types text before receiver joins
  31  |       console.log('=== SENDER: Queuing text message ===');
  32  |       await senderPage.fill('textarea', 'Hello from sender!');
  33  |       await senderPage.click('button:has-text("Send Text")');
  34  |       await senderPage.waitForTimeout(1000);
  35  | 
  36  |       console.log('=== RECEIVER: Opening /share ===');
  37  |       await receiverPage.goto(`${BASE_URL}/share`);
  38  |       await receiverPage.waitForLoadState('networkidle');
  39  |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/03-receiver-landing.png' });
  40  | 
  41  |       console.log('=== RECEIVER: Clicking Receive and entering code ===');
  42  |       await receiverPage.click('button:has-text("Receive")');
  43  |       await receiverPage.waitForTimeout(1000);
  44  |       await receiverPage.fill('input[type="text"]', roomCode);
  45  |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/04-receiver-entering-code.png' });
  46  |       await receiverPage.click('button:has-text("Join")');
  47  | 
  48  |       console.log('=== Waiting for connection (30s timeout) ===');
  49  |       // Wait for connection with longer timeout
  50  |       await expect(senderPage.locator('text=/connected/i')).toBeVisible({ timeout: 30000 });
  51  |       await expect(receiverPage.locator('text=/connected/i')).toBeVisible({ timeout: 30000 });
  52  |       console.log('✅ Both sides connected!');
  53  | 
  54  |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/05-sender-connected.png' });
  55  |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/06-receiver-connected.png' });
  56  | 
  57  |       console.log('=== RECEIVER: Waiting for queued message ===');
> 58  |       await receiverPage.waitForSelector('text=Hello from sender!', { timeout: 15000 });
      |                          ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
  59  |       console.log('✅ Receiver got queued message');
  60  |       
  61  |       console.log('=== RECEIVER: Sending reply ===');
  62  |       await receiverPage.fill('textarea', 'Hello from receiver!');
  63  |       await receiverPage.click('button:has-text("Send Text")');
  64  |       
  65  |       console.log('=== SENDER: Waiting for reply ===');
  66  |       await senderPage.waitForSelector('text=Hello from receiver!', { timeout: 15000 });
  67  |       console.log('✅ Sender got reply');
  68  | 
  69  |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/07-sender-final.png', fullPage: true });
  70  |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/08-receiver-final.png', fullPage: true });
  71  | 
  72  |       console.log('✅ TEST PASSED: Text exchange works!');
  73  | 
  74  |     } catch (error) {
  75  |       console.error('❌ Test failed:', error);
  76  |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/error-sender.png', fullPage: true }).catch(() => {});
  77  |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/error-receiver.png', fullPage: true }).catch(() => {});
  78  |       throw error;
  79  |     } finally {
  80  |       await senderPage.close().catch(() => {});
  81  |       await receiverPage.close().catch(() => {});
  82  |       await senderContext.close().catch(() => {});
  83  |       await receiverContext.close().catch(() => {});
  84  |     }
  85  |   });
  86  | 
  87  |   test('QR URL auto-joins as receiver', async ({ page }) => {
  88  |     console.log('=== Creating room as sender ===');
  89  |     await page.goto(`${BASE_URL}/share`);
  90  |     await page.waitForLoadState('networkidle');
  91  |     await page.click('button:has-text("Send")');
  92  |     
  93  |     const roomCodeElement = await page.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
  94  |     const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
  95  |     console.log('✅ Room code:', roomCode);
  96  | 
  97  |     console.log('=== Opening QR URL in new page ===');
  98  |     const qrPage = await page.context().newPage();
  99  |     await qrPage.goto(`${BASE_URL}/share?room=${roomCode}`);
  100 |     await qrPage.waitForLoadState('networkidle');
  101 |     await qrPage.screenshot({ path: '/workspace/tests/screenshots/qr-landing.png' });
  102 | 
  103 |     console.log('=== Waiting for auto-join connection ===');
  104 |     await expect(qrPage.locator('text=/connected/i')).toBeVisible({ timeout: 30000 });
  105 |     console.log('✅ QR auto-join connected!');
  106 |     
  107 |     await qrPage.screenshot({ path: '/workspace/tests/screenshots/qr-connected.png', fullPage: true });
  108 |   });
  109 | });
  110 | 
```
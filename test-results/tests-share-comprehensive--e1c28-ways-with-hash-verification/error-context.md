# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/share-comprehensive.spec.ts >> Share P2P - Comprehensive Tests >> Full flow: text both ways + 1MB file both ways with hash verification
- Location: tests/share-comprehensive.spec.ts:21:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 60000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Download")') to be visible

```

# Test source

```ts
  9   | }
  10  | 
  11  | function createTestFile(sizeKB: number, name: string): Buffer {
  12  |   const content = Buffer.alloc(sizeKB * 1024);
  13  |   for (let i = 0; i < content.length; i++) {
  14  |     content[i] = i % 256;
  15  |   }
  16  |   return content;
  17  | }
  18  | 
  19  | test.describe('Share P2P - Comprehensive Tests', () => {
  20  |   
  21  |   test('Full flow: text both ways + 1MB file both ways with hash verification', async ({ browser }) => {
  22  |     const senderContext = await browser.newContext();
  23  |     const receiverContext = await browser.newContext();
  24  |     
  25  |     const senderPage = await senderContext.newPage();
  26  |     const receiverPage = await receiverContext.newPage();
  27  | 
  28  |     try {
  29  |       console.log('\n=== TEST: Full bidirectional transfer ===\n');
  30  |       
  31  |       // === SETUP: Sender creates room ===
  32  |       console.log('Sender: Opening /share');
  33  |       await senderPage.goto(`${BASE_URL}/share`);
  34  |       await senderPage.waitForLoadState('networkidle');
  35  |       
  36  |       console.log('Sender: Clicking Send');
  37  |       await senderPage.click('button:has-text("Send")');
  38  |       await senderPage.waitForTimeout(2000);
  39  |       
  40  |       const roomCodeElement = await senderPage.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
  41  |       const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
  42  |       console.log(`✓ Room created: ${roomCode}`);
  43  |       expect(roomCode).toMatch(/^\d{6}$/);
  44  | 
  45  |       // === SETUP: Receiver joins ===
  46  |       console.log('Receiver: Opening /share');
  47  |       await receiverPage.goto(`${BASE_URL}/share`);
  48  |       await receiverPage.waitForLoadState('networkidle');
  49  |       
  50  |       console.log('Receiver: Entering code and joining');
  51  |       await receiverPage.click('button:has-text("Receive")');
  52  |       await receiverPage.fill('input[type="text"]', roomCode);
  53  |       await receiverPage.click('button:has-text("Join")');
  54  | 
  55  |       console.log('Waiting for connection (45s timeout)...');
  56  |       await expect(senderPage.locator('text=/Connected/i')).toBeVisible({ timeout: 45000 });
  57  |       await expect(receiverPage.locator('text=/Connected/i')).toBeVisible({ timeout: 45000 });
  58  |       console.log('✓ Both sides connected\n');
  59  | 
  60  |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/full-01-sender-connected.png' });
  61  |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/full-02-receiver-connected.png' });
  62  | 
  63  |       // === TEST 1: Text sender → receiver ===
  64  |       console.log('TEST 1: Sending text from sender to receiver');
  65  |       const textStoR = 'Hello from sender! 🚀';
  66  |       await senderPage.fill('textarea', textStoR);
  67  |       await senderPage.click('button:has-text("Send Text")');
  68  |       
  69  |       await receiverPage.waitForSelector(`text=${textStoR}`, { timeout: 15000 });
  70  |       console.log('✓ Text received at receiver\n');
  71  |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/full-03-receiver-got-text.png' });
  72  | 
  73  |       // === TEST 2: Text receiver → sender ===
  74  |       console.log('TEST 2: Sending text from receiver to sender');
  75  |       const textRtoS = 'Reply from receiver! 👍';
  76  |       await receiverPage.fill('textarea', textRtoS);
  77  |       await receiverPage.click('button:has-text("Send Text")');
  78  |       
  79  |       await senderPage.waitForSelector(`text=${textRtoS}`, { timeout: 15000 });
  80  |       console.log('✓ Text received at sender\n');
  81  |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/full-04-sender-got-text.png' });
  82  | 
  83  |       // === TEST 3: File sender → receiver (~1MB) ===
  84  |       console.log('TEST 3: Sending ~1MB file from sender to receiver');
  85  |       const file1 = createTestFile(1024, 'test-sender-1mb.bin'); // 1MB
  86  |       const file1Hash = sha256(file1);
  87  |       console.log(`File1 hash: ${file1Hash}`);
  88  |       
  89  |       const file1Path = `/tmp/test-sender-1mb-${Date.now()}.bin`;
  90  |       fs.writeFileSync(file1Path, file1);
  91  |       
  92  |       await senderPage.evaluate(async ([fileContent, fileName]) => {
  93  |         const blob = new Blob([new Uint8Array(fileContent)], { type: 'application/octet-stream' });
  94  |         const file = new File([blob], fileName, { type: 'application/octet-stream' });
  95  |         const dataTransfer = new DataTransfer();
  96  |         dataTransfer.items.add(file);
  97  |         const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  98  |         if (input) {
  99  |           input.files = dataTransfer.files;
  100 |           input.dispatchEvent(new Event('change', { bubbles: true }));
  101 |         }
  102 |       }, [Array.from(file1), 'test-sender-1mb.bin']);
  103 | 
  104 |       // Wait for file to complete
  105 |       await receiverPage.waitForSelector('text=/test-sender-1mb.bin/', { timeout: 120000 });
  106 |       console.log('✓ File meta received');
  107 |       
  108 |       // Wait for download button
> 109 |       await receiverPage.waitForSelector('button:has-text("Download")', { timeout: 60000 });
      |                          ^ TimeoutError: page.waitForSelector: Timeout 60000ms exceeded.
  110 |       console.log('✓ File transfer complete');
  111 |       
  112 |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/full-05-receiver-got-file.png' });
  113 | 
  114 |       // Download and verify
  115 |       const downloadPromise1 = receiverPage.waitForEvent('download', { timeout: 10000 });
  116 |       await receiverPage.locator('button:has-text("Download")').first().click();
  117 |       const download1 = await downloadPromise1;
  118 |       const download1Path = `/tmp/downloaded-1-${Date.now()}.bin`;
  119 |       await download1.saveAs(download1Path);
  120 |       
  121 |       const downloaded1 = fs.readFileSync(download1Path);
  122 |       const downloaded1Hash = sha256(downloaded1);
  123 |       console.log(`Downloaded hash: ${downloaded1Hash}`);
  124 |       expect(downloaded1Hash).toBe(file1Hash);
  125 |       console.log('✓ SHA-256 hash verified: Sender → Receiver\n');
  126 | 
  127 |       // === TEST 4: File receiver → sender (~1MB) ===
  128 |       console.log('TEST 4: Sending ~1MB file from receiver to sender');
  129 |       const file2 = createTestFile(1024, 'test-receiver-1mb.bin'); // 1MB
  130 |       const file2Hash = sha256(file2);
  131 |       console.log(`File2 hash: ${file2Hash}`);
  132 |       
  133 |       const file2Path = `/tmp/test-receiver-1mb-${Date.now()}.bin`;
  134 |       fs.writeFileSync(file2Path, file2);
  135 |       
  136 |       await receiverPage.evaluate(async ([fileContent, fileName]) => {
  137 |         const blob = new Blob([new Uint8Array(fileContent)], { type: 'application/octet-stream' });
  138 |         const file = new File([blob], fileName, { type: 'application/octet-stream' });
  139 |         const dataTransfer = new DataTransfer();
  140 |         dataTransfer.items.add(file);
  141 |         const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  142 |         if (input) {
  143 |           input.files = dataTransfer.files;
  144 |           input.dispatchEvent(new Event('change', { bubbles: true }));
  145 |         }
  146 |       }, [Array.from(file2), 'test-receiver-1mb.bin']);
  147 | 
  148 |       // Wait for file to complete
  149 |       await senderPage.waitForSelector('text=/test-receiver-1mb.bin/', { timeout: 120000 });
  150 |       console.log('✓ File meta received');
  151 |       
  152 |       await senderPage.waitForSelector('button:has-text("Download")', { timeout: 60000 });
  153 |       console.log('✓ File transfer complete');
  154 |       
  155 |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/full-06-sender-got-file.png' });
  156 | 
  157 |       // Download and verify
  158 |       const downloadPromise2 = senderPage.waitForEvent('download', { timeout: 10000 });
  159 |       await senderPage.locator('button:has-text("Download")').first().click();
  160 |       const download2 = await downloadPromise2;
  161 |       const download2Path = `/tmp/downloaded-2-${Date.now()}.bin`;
  162 |       await download2.saveAs(download2Path);
  163 |       
  164 |       const downloaded2 = fs.readFileSync(download2Path);
  165 |       const downloaded2Hash = sha256(downloaded2);
  166 |       console.log(`Downloaded hash: ${downloaded2Hash}`);
  167 |       expect(downloaded2Hash).toBe(file2Hash);
  168 |       console.log('✓ SHA-256 hash verified: Receiver → Sender\n');
  169 | 
  170 |       console.log('=== ✅ ALL TESTS PASSED ===\n');
  171 | 
  172 |     } finally {
  173 |       await senderPage.close().catch(() => {});
  174 |       await receiverPage.close().catch(() => {});
  175 |       await senderContext.close().catch(() => {});
  176 |       await receiverContext.close().catch(() => {});
  177 |     }
  178 |   });
  179 | 
  180 |   test('QR URL auto-join', async ({ page }) => {
  181 |     console.log('\n=== TEST: QR auto-join ===\n');
  182 |     
  183 |     console.log('Creating room as sender');
  184 |     await page.goto(`${BASE_URL}/share`);
  185 |     await page.waitForLoadState('networkidle');
  186 |     await page.click('button:has-text("Send")');
  187 |     
  188 |     const roomCodeElement = await page.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
  189 |     const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
  190 |     console.log(`Room: ${roomCode}`);
  191 | 
  192 |     console.log('Opening QR URL in new tab');
  193 |     const qrPage = await page.context().newPage();
  194 |     await qrPage.goto(`${BASE_URL}/share?room=${roomCode}`);
  195 |     await qrPage.waitForLoadState('networkidle');
  196 |     await qrPage.screenshot({ path: '/workspace/tests/screenshots/qr-test-landing.png' });
  197 | 
  198 |     console.log('Waiting for auto-join connection');
  199 |     await expect(qrPage.locator('text=/Connected/i')).toBeVisible({ timeout: 45000 });
  200 |     console.log('✓ QR auto-join connected');
  201 |     
  202 |     await qrPage.screenshot({ path: '/workspace/tests/screenshots/qr-test-connected.png', fullPage: true });
  203 |     console.log('=== ✅ QR TEST PASSED ===\n');
  204 |   });
  205 | 
  206 |   test('Relay mode with WebRTC forced off', async ({ browser }) => {
  207 |     console.log('\n=== TEST: Relay mode (WebRTC off) ===\n');
  208 |     
  209 |     const senderContext = await browser.newContext();
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/share-comprehensive.spec.ts >> Share P2P - Comprehensive Tests >> Relay mode with WebRTC forced off
- Location: tests/share-comprehensive.spec.ts:206:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/Connected.*relay/i')
Expected: visible
Timeout: 45000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text=/Connected.*relay/i') with timeout 45000ms
  - waiting for locator('text=/Connected.*relay/i')

```

```yaml
- alert
- banner:
  - link "eProd eProd":
    - /url: /
    - img "eProd"
    - heading "eProd" [level=1]
  - navigation:
    - link "Home":
      - /url: /
    - link "Tools":
      - /url: /#categories
    - link "Blog":
      - /url: /blog
  - button "Search tools and blog... ⌘K"
  - button "Toggle Dark Mode"
- main:
  - paragraph: Room Code
  - paragraph: "590777"
  - text: Peer joined, connecting...
  - paragraph: "Scan to join:"
  - img "QR Code"
  - heading "Send" [level=3]
  - textbox "Type a message..."
  - button "Send Text" [disabled]
  - paragraph: Click or drag file here
  - paragraph: Encrypted end-to-end
  - heading "Received" [level=3]
  - paragraph: © 2026 eProd. All rights reserved.
  - navigation "Legal":
    - link "Privacy Policy":
      - /url: /privacy
    - link "Terms and Conditions":
      - /url: /terms-and-conditions
    - link "APEXRIDGELYTICS CONSULTING LLC":
      - /url: /legal
```

# Test source

```ts
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
  210 |     const receiverContext = await browser.newContext();
  211 |     
  212 |     const senderPage = await senderContext.newPage();
  213 |     const receiverPage = await receiverContext.newPage();
  214 | 
  215 |     try {
  216 |       // Force relay mode with ?relay=1
  217 |       console.log('Sender: Opening /share?relay=1');
  218 |       await senderPage.goto(`${BASE_URL}/share?relay=1`);
  219 |       await senderPage.waitForLoadState('networkidle');
  220 |       
  221 |       await senderPage.click('button:has-text("Send")');
  222 |       const roomCodeElement = await senderPage.waitForSelector('text=/\\d{6}/', { timeout: 10000 });
  223 |       const roomCode = (await roomCodeElement.textContent())?.trim() ?? '';
  224 |       console.log(`Room: ${roomCode}`);
  225 | 
  226 |       console.log('Receiver: Opening /share?relay=1');
  227 |       await receiverPage.goto(`${BASE_URL}/share?relay=1`);
  228 |       await receiverPage.waitForLoadState('networkidle');
  229 |       
  230 |       await receiverPage.click('button:has-text("Receive")');
  231 |       await receiverPage.fill('input[type="text"]', roomCode);
  232 |       await receiverPage.click('button:has-text("Join")');
  233 | 
  234 |       console.log('Waiting for relay connection');
> 235 |       await expect(senderPage.locator('text=/Connected.*relay/i')).toBeVisible({ timeout: 45000 });
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  236 |       await expect(receiverPage.locator('text=/Connected.*relay/i')).toBeVisible({ timeout: 45000 });
  237 |       console.log('✓ Relay mode connected');
  238 | 
  239 |       await senderPage.screenshot({ path: '/workspace/tests/screenshots/relay-01-connected.png' });
  240 |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/relay-02-connected.png' });
  241 | 
  242 |       // Test text transfer in relay mode
  243 |       console.log('Testing text transfer in relay mode');
  244 |       await senderPage.fill('textarea', 'Relay test message');
  245 |       await senderPage.click('button:has-text("Send Text")');
  246 |       
  247 |       await receiverPage.waitForSelector('text=Relay test message', { timeout: 15000 });
  248 |       console.log('✓ Text delivered via relay');
  249 |       
  250 |       await receiverPage.screenshot({ path: '/workspace/tests/screenshots/relay-03-text-received.png', fullPage: true });
  251 |       
  252 |       console.log('=== ✅ RELAY TEST PASSED ===\n');
  253 | 
  254 |     } finally {
  255 |       await senderPage.close().catch(() => {});
  256 |       await receiverPage.close().catch(() => {});
  257 |       await senderContext.close().catch(() => {});
  258 |       await receiverContext.close().catch(() => {});
  259 |     }
  260 |   });
  261 | });
  262 | 
```
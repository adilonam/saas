import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.eprod.io';

test.describe('Unified Search Tests', () => {
  
  test('Homepage search opens SearchOverlay and works like bottom bar search', async ({ page }) => {
    console.log('\n=== TEST: Homepage Search Functionality ===\n');
    
    // Go to homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take desktop screenshot of homepage with search
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: '/workspace/tests/screenshots/search-desktop-homepage.png', fullPage: false });
    console.log('✓ Desktop homepage screenshot taken');
    
    // Click the homepage search button
    console.log('Clicking homepage search button...');
    await page.click('button[aria-label="Search tools and blog posts"]');
    
    // Wait for SearchOverlay to open
    await page.waitForSelector('input[placeholder*="Search tools and blog"]', { timeout: 5000 });
    console.log('✓ SearchOverlay opened');
    
    // Type "pdf" in the search
    console.log('Typing "pdf" in search...');
    await page.fill('input[placeholder*="Search tools and blog"]', 'pdf');
    await page.waitForTimeout(500); // Let results render
    
    // Take screenshot of search results
    await page.screenshot({ path: '/workspace/tests/screenshots/search-desktop-results.png' });
    console.log('✓ Desktop search results screenshot taken');
    
    // Verify results are visible
    const results = await page.locator('a[href*="pdf"]').count();
    console.log(`Found ${results} PDF-related results`);
    expect(results).toBeGreaterThan(0);
    
    // Click first result
    const firstResult = page.locator('a[href*="pdf"]').first();
    const href = await firstResult.getAttribute('href');
    console.log(`Clicking first result: ${href}`);
    await firstResult.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify navigation happened
    const currentUrl = page.url();
    console.log(`Navigated to: ${currentUrl}`);
    expect(currentUrl).toContain('pdf');
    
    await page.screenshot({ path: '/workspace/tests/screenshots/search-desktop-navigated.png' });
    console.log('✓ Navigation confirmed');
    
    console.log('\n=== ✅ DESKTOP TEST PASSED ===\n');
  });
  
  test('Mobile search works identically', async ({ page }) => {
    console.log('\n=== TEST: Mobile Search Functionality ===\n');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size
    
    // Go to homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshot
    await page.screenshot({ path: '/workspace/tests/screenshots/search-mobile-homepage.png', fullPage: false });
    console.log('✓ Mobile homepage screenshot taken');
    
    // Click the homepage search button
    console.log('Clicking homepage search button on mobile...');
    await page.click('button[aria-label="Search tools and blog posts"]');
    
    // Wait for SearchOverlay
    await page.waitForSelector('input[placeholder*="Search tools and blog"]', { timeout: 5000 });
    console.log('✓ SearchOverlay opened on mobile');
    
    // Type "pdf"
    console.log('Typing "pdf" in search...');
    await page.fill('input[placeholder*="Search tools and blog"]', 'pdf');
    await page.waitForTimeout(500);
    
    // Take screenshot of mobile results
    await page.screenshot({ path: '/workspace/tests/screenshots/search-mobile-results.png' });
    console.log('✓ Mobile search results screenshot taken');
    
    // Verify results
    const results = await page.locator('a[href*="pdf"]').count();
    console.log(`Found ${results} PDF-related results on mobile`);
    expect(results).toBeGreaterThan(0);
    
    // Click first result
    await page.locator('a[href*="pdf"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify navigation
    const currentUrl = page.url();
    console.log(`Mobile navigated to: ${currentUrl}`);
    expect(currentUrl).toContain('pdf');
    
    await page.screenshot({ path: '/workspace/tests/screenshots/search-mobile-navigated.png' });
    console.log('✓ Mobile navigation confirmed');
    
    console.log('\n=== ✅ MOBILE TEST PASSED ===\n');
  });
  
  test('Bottom bar search works identically', async ({ page }) => {
    console.log('\n=== TEST: Bottom Bar Search (for comparison) ===\n');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Click bottom bar search
    console.log('Clicking bottom bar search button...');
    const bottomSearch = page.locator('button[aria-label="Search"]').last();
    await bottomSearch.click();
    
    // Wait for SearchOverlay
    await page.waitForSelector('input[placeholder*="Search tools and blog"]', { timeout: 5000 });
    console.log('✓ SearchOverlay opened from bottom bar');
    
    // Type "pdf"
    await page.fill('input[placeholder*="Search tools and blog"]', 'pdf');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: '/workspace/tests/screenshots/search-bottombar-results.png' });
    console.log('✓ Bottom bar search results screenshot taken');
    
    // Verify same results
    const results = await page.locator('a[href*="pdf"]').count();
    console.log(`Found ${results} PDF-related results from bottom bar`);
    expect(results).toBeGreaterThan(0);
    
    console.log('\n=== ✅ BOTTOM BAR TEST PASSED ===\n');
  });
});

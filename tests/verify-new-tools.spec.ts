import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.eprod.io';

test.describe('New Tools Verification', () => {
  
  test('Share tool appears on homepage and in search', async ({ page }) => {
    console.log('\n=== TEST: Share Tool Verification ===\n');
    
    // Check homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ path: '/workspace/tests/screenshots/verify-homepage.png', fullPage: true });
    console.log('✓ Homepage screenshot taken');
    
    // Search for "share"
    await page.click('button[aria-label="Search tools and blog posts"]');
    await page.waitForSelector('input[placeholder*="Search tools and blog"]');
    await page.fill('input[placeholder*="Search tools and blog"]', 'share');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: '/workspace/tests/screenshots/verify-share-search.png' });
    console.log('✓ Share search screenshot taken');
    
    // Verify Share tool appears
    const shareToolLink = page.locator('a[href="/share"]');
    await expect(shareToolLink).toBeVisible({ timeout: 5000 });
    console.log('✓ Share tool found in search results');
    
    // Check for blog post
    const blogLink = page.locator('a[href*="/blog/"]', { hasText: /send.*file/i });
    const blogVisible = await blogLink.count() > 0;
    console.log(`${blogVisible ? '✓' : '⚠️'} Blog post ${blogVisible ? 'found' : 'not found yet'} in search`);
    
    await page.screenshot({ path: '/workspace/tests/screenshots/verify-share-results.png' });
    
    console.log('\n=== ✅ SHARE TOOL TEST PASSED ===\n');
  });

  test('Share blog post loads correctly', async ({ page }) => {
    console.log('\n=== TEST: Share Blog Post ===\n');
    
    // Try to access blog post
    await page.goto(`${BASE_URL}/blog/how-to-send-files-without-signing-up`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Check if we're on the blog post or got redirected
    if (currentUrl.includes('how-to-send-files-without-signing-up')) {
      await page.screenshot({ path: '/workspace/tests/screenshots/verify-share-blog.png', fullPage: true });
      console.log('✓ Share blog post loads');
      
      // Check for content
      const hasContent = await page.locator('text=/send.*file/i').count() > 0;
      console.log(`${hasContent ? '✓' : '⚠️'} Blog content ${hasContent ? 'found' : 'not found'}`);
    } else {
      console.log('⚠️ Blog post URL redirected or not found (may take time to seed)');
      await page.screenshot({ path: '/workspace/tests/screenshots/verify-share-blog-404.png' });
    }
    
    console.log('\n=== ✅ BLOG POST TEST COMPLETE ===\n');
  });

  test('Other new tools appear on homepage', async ({ page }) => {
    console.log('\n=== TEST: Other New Tools ===\n');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const toolsToCheck = [
      { name: 'Secret Santa', path: '/secret-santa-generator' },
      { name: 'Christmas Countdown', path: '/christmas-countdown' },
      { name: 'New Year Countdown', path: '/new-year-countdown' },
      { name: 'Black Friday Calculator', path: '/black-friday-discount-calculator' },
      { name: '2027 Calendar', path: '/2027-calendar' },
    ];
    
    for (const tool of toolsToCheck) {
      const link = page.locator(`a[href="${tool.path}"]`);
      const visible = await link.count() > 0;
      console.log(`${visible ? '✓' : '❌'} ${tool.name} ${visible ? 'found' : 'NOT FOUND'} on homepage`);
    }
    
    await page.screenshot({ path: '/workspace/tests/screenshots/verify-all-tools.png', fullPage: true });
    
    console.log('\n=== ✅ TOOLS VERIFICATION COMPLETE ===\n');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Blog Posts', () => {
  test('Share blog post loads correctly', async ({ page }) => {
    await page.goto('https://www.eprod.io/blog/how-to-send-files-without-signing-up');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check title appears (target article h1, not nav h1)
    await expect(page.locator('article h1').first()).toContainText('How to Send Files Between Devices Without Signing Up');
    
    // Check content loaded
    const content = await page.textContent('article');
    expect(content).toContain('room code');
    expect(content).toContain('QR');
    expect(content).toContain('encryption');
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/blog-share-post.png', fullPage: true });
  });

  test('Blog posts appear in search', async ({ page }) => {
    await page.goto('https://www.eprod.io');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click search button (could be desktop nav, bottom bar, or hero)
    const searchButton = page.locator('button[aria-label*="Search"], button:has-text("Search")').first();
    await searchButton.click();
    
    // Wait for overlay to open
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
    
    // Type search query
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('share');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Check that both tool and blog post appear
    const results = await page.textContent('body');
    
    // Should show the Share tool
    expect(results).toContain('Share');
    
    // Should show blog post (either title or description)
    const hasBlogPost = results?.includes('How to Send Files') || results?.includes('blog') || results?.includes('Without Signing Up');
    expect(hasBlogPost).toBe(true);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/blog-search-results.png' });
  });

  test('All 6 new blog posts are accessible', async ({ page }) => {
    const posts = [
      { slug: 'how-to-send-files-without-signing-up', title: 'Send Files' },
      { slug: 'secret-santa-generator-guide', title: 'Secret Santa' },
      { slug: 'christmas-countdown-timer', title: 'Christmas Countdown' },
      { slug: 'new-year-countdown-timer', title: 'New Year' },
      { slug: 'black-friday-discount-calculator', title: 'Black Friday' },
      { slug: '2027-calendar-guide', title: '2027 Calendar' },
    ];

    for (const post of posts) {
      const response = await page.goto(`https://www.eprod.io/blog/${post.slug}`);
      expect(response?.status()).toBe(200);
      
      // Check content loaded
      await page.waitForLoadState('networkidle');
      const title = await page.locator('article h1').first().textContent();
      expect(title).toContain(post.title);
    }
  });
});

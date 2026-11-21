const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const artifactsDir = '/opt/cursor/artifacts';
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  
  // Mobile homepage (390px)
  console.log('Taking mobile homepage screenshot...');
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  await mobilePage.goto('https://www.eprod.io', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ 
    path: path.join(artifactsDir, 'homepage-mobile.png'),
    fullPage: true 
  });
  await mobilePage.close();

  // Desktop homepage
  console.log('Taking desktop homepage screenshot...');
  const desktopPage = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  await desktopPage.goto('https://www.eprod.io', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({ 
    path: path.join(artifactsDir, 'homepage-desktop.png'),
    fullPage: true 
  });
  await desktopPage.close();

  // Mobile blog post
  console.log('Taking mobile blog post screenshot...');
  const mobileBlogPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  await mobileBlogPage.goto('https://www.eprod.io/blog/youtube-title-length-guide', { waitUntil: 'networkidle', timeout: 30000 });
  await mobileBlogPage.waitForTimeout(2000);
  await mobileBlogPage.screenshot({ 
    path: path.join(artifactsDir, 'blog-post-mobile.png'),
    fullPage: true 
  });
  await mobileBlogPage.close();

  // Desktop blog post
  console.log('Taking desktop blog post screenshot...');
  const desktopBlogPage = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  await desktopBlogPage.goto('https://www.eprod.io/blog/youtube-title-length-guide', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopBlogPage.waitForTimeout(2000);
  await desktopBlogPage.screenshot({ 
    path: path.join(artifactsDir, 'blog-post-desktop.png'),
    fullPage: true 
  });
  await desktopBlogPage.close();

  await browser.close();
  console.log('All screenshots complete!');
})();

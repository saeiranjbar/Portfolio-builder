const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait for app to load
  await page.waitForTimeout(2000);
  
  // Take a screenshot
  await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
  console.log('Screenshot saved');
  
  await browser.close();
})().catch(e => {
  console.error(e);
  process.exit(1);
});

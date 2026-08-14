const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('Logging in...');
  await page.goto(process.env.PORTAL_URL);
  
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.locator('input[type="email"]').fill(process.env.TC_USER_EMAIL);
  await page.locator('input[type="password"]').fill(process.env.TC_USER_PASSWORD);
  await page.getByRole('button', { name: 'Continue' }).click();
  
  console.log('Waiting for network idle...');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  
  console.log('Extracting widget titles...');
  const titles = await page.locator('.grp-widget-title').evaluateAll(els => els.map(e => e.outerHTML));
  console.log(titles);
  
  await browser.close();
})();

import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: './src/setup/.auth/adminStorageState.json'
  });
  const page = await context.newPage();
  
  await page.goto(`${process.env.PORTAL_URL}/portal/v2/default/home`);
  
  // click source link
  const sourceNavLink = page.getByRole('link', { name: /^source$/i });
  await sourceNavLink.click();
  
  await page.waitForTimeout(8000); // Wait enough time for all widgets to render
  
  const html = await page.content();
  fs.writeFileSync('scratch/dom.html', html);
  console.log("DOM saved to scratch/dom.html");

  await browser.close();
})();

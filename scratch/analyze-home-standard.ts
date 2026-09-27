import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import { PortalLoginPage } from '../src/pages/portal/PortalLoginPage';
dotenv.config();

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new PortalLoginPage(page);
  await loginPage.login(process.env.STANDARD_USER_EMAIL as string, process.env.STANDARD_USER_PASSWORD as string);

  await page.waitForTimeout(8000);

  const containers = await page.locator('.grp-widget-title, .widget-title, h1, h2, h3').all();
  console.log('--- WIDGET TITLES FOUND FOR STANDARD USER ---');
  for (const heading of containers) {
    const title = await heading.innerText();
    if (!title) continue;
    console.log(title.trim());
  }

  await browser.close();
})();

import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const requests: any[] = [];
  page.on('request', request => {
    if (request.url().includes('/ws/update')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData()
      });
    }
  });

  console.log('Logging in...');
  await page.goto(process.env.DASHBOARD_URL!);
  await page.fill('input[name="email"]', process.env.ADMIN_EMAIL!);
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  console.log('Navigating to settings...');
  await page.goto(`${process.env.DASHBOARD_URL}/admin/settings`);
  
  console.log('Filling out auth denial...');
  // It's Angular, let's just use some basic selectors
  // Wait, I can just use the AdminApiService I already have and test endpoints!
  
  await browser.close();
  console.log(JSON.stringify(requests, null, 2));
}
run();

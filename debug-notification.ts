import { chromium } from 'playwright';
import fs from 'fs';
import { AdminApiService } from './src/api/AdminApiService';

(async () => {
  console.log('Authenticating via API...');
  const adminApi = new AdminApiService();
  await adminApi.login();
  const envEmail = process.env.HOME_PAGE_USER_EMAIL || 'hyden@yopmail.com';
  const envPassword = process.env.HOME_PAGE_USER_PASSWORD || '12345';
  
  await adminApi.changeUserPassword(envEmail, envPassword).catch(async () => {
    await adminApi.addSingleUser("Hyden", envEmail);
    await adminApi.changeUserPassword(envEmail, envPassword);
  });
  await adminApi.updateSecuritySettings({
    twoFactorAuth: false
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto(process.env.BASE_URL as string || 'https://sydneyuniversity.knimbus.com');
  await page.click('text="Sign In"');
  await page.fill('input[type="email"]', envEmail);
  await page.fill('input[type="password"]', envPassword);
  await page.click('button:has-text("Continue")');
  
  await page.waitForSelector('text="Sydney University"');
  await page.waitForTimeout(2000);
  
  const icon = page.locator('span').filter({ has: page.locator('svg').filter({ has: page.locator('path[d*="M4.545"]') }) }).first();
  await icon.click({ force: true });
  await page.waitForTimeout(2000); // wait for popup
  
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('popup_dom.html', html);
  console.log('Saved DOM to popup_dom.html');
  
  await browser.close();
})();

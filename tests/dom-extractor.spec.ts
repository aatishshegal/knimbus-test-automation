import { test } from '../src/fixtures';
import * as fs from 'fs';
import * as path from 'path';

test('Extract DOM of Home Page', async ({ portalLoginPage, homePageUser, page }) => {
  test.setTimeout(120000); // Allow ample time
  
  // Login
  await portalLoginPage.login(homePageUser.email, homePageUser.password);
  
  // Wait for network to be idle to ensure widgets are loaded
  await page.waitForLoadState('networkidle');
  // Wait explicitly for at least one known element or just delay to ensure rendering
  await page.waitForTimeout(5000);
  
  // Grab the full HTML
  const html = await page.content();
  
  // Save it to test-results folder
  const resultsDir = path.resolve(process.cwd(), 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(resultsDir, 'home-page-dom.html'), html);
  console.log('DOM saved to test-results/home-page-dom.html');
});

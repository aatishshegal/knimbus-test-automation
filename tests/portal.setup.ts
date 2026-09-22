import { test as setup, expect } from '../src/fixtures';

// Force an empty storage state so setup always gets a fresh browser
setup.use({ storageState: { cookies: [], origins: [] } });

setup('Portal UI Setup - Cache Portal Session', async ({ page, portalLoginPage, homePage, termsAndConditionsModal }) => {
  console.log('[Portal Setup] Caching Portal Session...');
  await page.context().clearCookies();
  
  const email = process.env.HOME_PAGE_USER_EMAIL as string;
  const password = process.env.HOME_PAGE_USER_PASSWORD as string;
  if (!email || !password) throw new Error("Portal credentials not defined in .env");

  await page.goto(process.env.PORTAL_URL as string);
  await portalLoginPage.login(email, password);
  
  // Wait for the home page to load first
  await expect(homePage.homePageIdentifier).toBeVisible({ timeout: 15000 });
  
  // NOW check for the T&C popup (give it a moment to appear via React state if necessary)
  await page.waitForTimeout(2000);
  await termsAndConditionsModal.handleTermsAndConditionsIfVisible();
  
  await page.context().storageState({ path: '.auth/user.json' });
  console.log('[Portal Setup] Portal session cached successfully!');
});

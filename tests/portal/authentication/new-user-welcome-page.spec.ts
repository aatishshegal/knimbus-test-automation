import { test, expect } from '../../../src/fixtures';

test.describe('Portal Authentication - Welcome Page Routing', () => {
  
  test('Welcome Page Routing - Freshly registered user without pending mandatory fields lands directly on Welcome page', async ({ portalLoginPage, welcomePage, welcomePageUser }) => {
    // 1. Submit the credentials created dynamically in the setup fixture
    await portalLoginPage.login(
      welcomePageUser.email, 
      welcomePageUser.password
    );

    // 2. Assert that we landed on the Welcome Page
    await expect(welcomePage.welcomePageIdentifier).toBeVisible();
  });

});

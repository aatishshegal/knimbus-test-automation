import { test, expect } from '../../../src/fixtures';

test.describe('Portal Authentication - New User Flows', () => {
  
  test('Verify a freshly registered user with no missing mandatory fields lands directly on the Welcome Page', async ({ portalLoginPage, welcomePage, welcomePageUser }) => {
    // 1. Submit the credentials created dynamically in the setup fixture
    await portalLoginPage.login(
      welcomePageUser.email, 
      welcomePageUser.password
    );

    // 2. Assert that we landed on the Welcome Page
    await expect(welcomePage.welcomePageIdentifier).toBeVisible();
  });

});

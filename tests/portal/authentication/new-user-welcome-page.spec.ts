import { test, expect } from '../../../src/fixtures';

test.describe('Portal Authentication - New User Flows', () => {
  
  test('A freshly registered user with NO missing mandatory fields should land directly on the Welcome Page', async ({ portalLoginPage, welcomePage, welcomePageUser }) => {
    // 1. Submit the credentials created dynamically in the setup fixture
    await portalLoginPage.login(
      welcomePageUser.email, 
      welcomePageUser.password
    );

    // 2. Assert that we landed on the Welcome Page
    await expect(welcomePage.welcomePageIdentifier).toBeVisible();
  });

});

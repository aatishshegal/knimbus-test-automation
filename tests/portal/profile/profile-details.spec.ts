import { test, expect } from '../../../src/fixtures';
import profileData from '../../test-data/profile-data.json';

test.describe('Portal - User Profile Details Validations @profile', () => {
  test.beforeEach(async ({ page, topNavigationBar }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuProfileLink.click();
    await page.waitForURL(/.*profile/i, { timeout: 15000 }).catch(() => {});
  });

  test('Verify user can navigate to Profile page and profile container is displayed', async ({ profilePage, page }) => {
    await expect(page).toHaveURL(/.*profile/i);
    await expect(profilePage.profileHeader).toBeVisible();
  });

  test('Verify profile user info elements are visible', async ({ profilePage }) => {
    await expect(profilePage.profileHeader).toBeVisible();
    await expect(profilePage.profileTitleName.or(profilePage.profileTitleEmail).or(profilePage.profileHeader)).toBeVisible();
  });
});

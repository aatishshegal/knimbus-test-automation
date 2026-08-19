import { test, expect } from '../../../src/fixtures';
import profileData from '../../test-data/profile-data.json';

test.describe('Portal - User Profile Update Validations @profile', () => {
  test.beforeEach(async ({ page, topNavigationBar }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuProfileLink.click();
    await page.waitForURL(/.*profile/i, { timeout: 15000 }).catch(() => { });
  });

  test('Verify editing profile details with test data from JSON', async ({ profilePage }) => {
    const updateData = profileData.profilePageData.updateFields;
    await profilePage.updateProfileDetails(updateData);
    await profilePage.saveProfile();

    // Verify Profile page container remains active and visible after update
    await expect(profilePage.profileHeader).toBeVisible();
  });
});

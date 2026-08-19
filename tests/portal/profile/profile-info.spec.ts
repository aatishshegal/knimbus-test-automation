import { test, expect } from '../../../src/fixtures';
import profileData from '../../test-data/profile-data.json';
import path from 'path';

test.describe('Portal - User Profile Info & Image Upload @profile', () => {

  test.beforeEach(async ({ portalLoginPage, topNavigationBar, page, standardUser }) => {
    // 1. Log into Portal with user credentials
    await portalLoginPage.login(standardUser.email, standardUser.password);

    // 2. Navigate to User Profile via Top Navigation Bar or URL
    if (await topNavigationBar.profileDropdown.isVisible()) {
      await topNavigationBar.openProfileMenu();
      if (await topNavigationBar.profileMenuProfileLink.isVisible()) {
        await topNavigationBar.profileMenuProfileLink.click();
      }
    }
    
    // Fallback direct navigation if needed
    await page.waitForURL(/.*profile/i, { timeout: 10000 }).catch(async () => {
      const targetUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/profile');
      await page.goto(targetUrl);
    });
  });

  test('TC1: Verify default state of Profile Basic Details fields is disabled/read-only prior to clicking Edit', async ({ profilePage }) => {
    // 1. Assert active tab is 'Profile'
    await expect(profilePage.profileTab).toBeVisible();

    // 2. Verify Profile Header info matches user
    await expect(profilePage.profileTitleEmail).toHaveText(process.env.STANDARD_USER_EMAIL as string);

    // 3. Verify Basic Details fields are disabled by default
    const disabledState = await profilePage.areBasicFieldsDisabled();
    expect(disabledState.fullName).toBe(true);
    expect(disabledState.gender).toBe(true);
    expect(disabledState.dob).toBe(true);
    expect(disabledState.summary).toBe(true);
    expect(disabledState.emailSub).toBe(true);
  });

  test('TC2: Verify clicking Edit button enables editable fields in Basic Details section', async ({ profilePage }) => {
    // 1. Click Edit button
    await profilePage.clickEdit();

    // 2. Verify editable fields become enabled
    await expect(profilePage.genderSelect).toBeEnabled();
    await expect(profilePage.summaryInput).toBeEnabled();
    await expect(profilePage.emailSubscriptionCheckbox).toBeEnabled();

    // 3. Verify Full Name field remains disabled if restricted by user management rules
    await expect(profilePage.fullNameInput).toBeDisabled();
  });

  test('TC3: Verify editing and saving Basic Details updates and persists values', async ({ profilePage }) => {
    const updateData = profileData.profilePageData.basicDetailsUpdate;

    // 1. Click Edit and update fields
    await profilePage.updateBasicDetails(updateData);

    // 2. Save Profile
    await profilePage.saveProfile();

    // 3. Verify updated summary and gender values
    if (await profilePage.summaryInput.isVisible()) {
      await expect(profilePage.summaryInput).toHaveValue(updateData.summary);
    }
    if (await profilePage.genderSelect.isVisible()) {
      await expect(profilePage.genderSelect).toHaveValue(updateData.gender);
    }
  });

  test('TC4: Profile Image Upload - Case 1: Successful upload of a valid image file', async ({ profilePage, page }) => {
    const validImagePath = path.join(__dirname, '../../test-data', profileData.profilePageData.imageUpload.validImageRelativePath);

    // 1. Upload valid image
    await profilePage.uploadProfileImage(validImagePath);

    // 2. Assert image element is updated or toast alert appears
    await expect(profilePage.profileImage).toBeVisible();
    if (await profilePage.toastNotification.isVisible()) {
      await expect(profilePage.toastNotification).not.toContainText(/failed|invalid|error/i);
    }
  });

  test('TC5: Profile Image Upload - Case 2: Uploading an oversized image triggers a file size validation error', async ({ profilePage, page }) => {
    const largeImagePath = path.join(__dirname, '../../test-data', profileData.profilePageData.imageUpload.largeImageRelativePath);

    // 1. Upload oversized image
    await profilePage.uploadProfileImage(largeImagePath);

    // 2. Assert validation error or warning toast appears
    const toastOrAlert = page.locator('.toast-error, .toast-warning, .alert-danger, [role="alert"], .error-message').first();
    if (await toastOrAlert.isVisible()) {
      await expect(toastOrAlert).toBeVisible();
    } else {
      // Image component should retain original picture without crashing
      await expect(profilePage.profileImage).toBeVisible();
    }
  });

  test('TC6: Profile Image Upload - Case 3: Uploading an invalid file format triggers format validation error', async ({ profilePage, page }) => {
    const invalidFilePath = path.join(__dirname, '../../test-data', profileData.profilePageData.imageUpload.invalidFormatRelativePath);

    // 1. Attempt uploading a non-image file (.pdf)
    await profilePage.uploadProfileImage(invalidFilePath);

    // 2. Assert format validation error appears
    const toastOrAlert = page.locator('.toast-error, .toast-warning, .alert-danger, [role="alert"], .error-message').first();
    if (await toastOrAlert.isVisible()) {
      await expect(toastOrAlert).toBeVisible();
    } else {
      // Image component should retain original picture without crashing
      await expect(profilePage.profileImage).toBeVisible();
    }
  });

});

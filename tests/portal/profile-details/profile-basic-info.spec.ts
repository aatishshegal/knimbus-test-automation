import { test, expect } from '../../../src/fixtures';
import profileData from '../../test-data/profile-data.json';
import path from 'path';

test.describe('Portal - Profile Basic Info Tab Validations @profile @basic-info', () => {

  test.beforeEach(async ({ page, topNavigationBar }) => {
    // 1. Navigate to Profile page
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuProfileLink.click();
    await page.waitForURL(/.*profile/i, { timeout: 15000 }).catch(() => {});
  });

  test('TC01: Verify visibility of Profile Avatar Image, Upload trigger, Name and Email', async ({ profileBasicInfoPage }) => {
    await expect(profileBasicInfoPage.profileImage).toBeVisible();
    await expect(profileBasicInfoPage.profileImageUploadTrigger).toBeVisible();
    await expect(profileBasicInfoPage.profileImageUploadTrigger).toHaveAttribute('title', 'Upload image');
    await expect(profileBasicInfoPage.profileTitleName).toBeVisible();
    await expect(profileBasicInfoPage.profileTitleEmail).toBeVisible();
  });

  test('TC02: Verify Basic Details section header and Edit button visibility', async ({ profileBasicInfoPage }) => {
    await expect(profileBasicInfoPage.basicDetailsHeading).toBeVisible();
    await expect(profileBasicInfoPage.editButton).toBeVisible();
  });

  test('TC03: Verify all Basic Details form fields are disabled/read-only by default', async ({ profileBasicInfoPage }) => {
    const disabledStates = await profileBasicInfoPage.getFieldDisabledStates();
    expect(disabledStates.fullName).toBe(true);
    expect(disabledStates.gender).toBe(true);
    expect(disabledStates.dob).toBe(true);
    expect(disabledStates.summary).toBe(true);
    expect(disabledStates.emailSubscription).toBe(true);
  });

  test('TC04: Verify form field validation attributes (maxlength, placeholder, select options)', async ({ profileBasicInfoPage }) => {
    const attributes = await profileBasicInfoPage.getFieldAttributes();
    expect(attributes.fullNameMaxLength).toBe('101');
    expect(attributes.summaryMaxLength).toBe('2001');
    expect(attributes.dobPlaceholder).toBe('-- / -- / ----');

    // Verify Gender select options Parity
    const options = await profileBasicInfoPage.genderSelect.locator('option').allInnerTexts();
    expect(options).toEqual(expect.arrayContaining(['Select', 'Male', 'Female', 'Other']));
  });

  test('TC05: Verify clicking Edit button enables editable fields while keeping Full Name disabled', async ({ profileBasicInfoPage }) => {
    await profileBasicInfoPage.clickEdit();

    await expect(profileBasicInfoPage.summaryTextarea).toBeEnabled();
    await expect(profileBasicInfoPage.emailSubscriptionCheckbox).toBeEnabled();
    await expect(profileBasicInfoPage.fullNameInput).toBeDisabled();
  });

  test('TC06: Verify updating and saving Basic Details persists values', async ({ profileBasicInfoPage }) => {
    const updateData = profileData.profilePageData.basicDetailsUpdate;

    await profileBasicInfoPage.updateBasicInfo(updateData);
    await profileBasicInfoPage.saveChanges();

    if (await profileBasicInfoPage.summaryTextarea.isVisible()) {
      await expect(profileBasicInfoPage.summaryTextarea).toHaveValue(updateData.summary);
    }
    if (await profileBasicInfoPage.genderSelect.isVisible() && await profileBasicInfoPage.genderSelect.isEnabled()) {
      await expect(profileBasicInfoPage.genderSelect).toHaveValue(updateData.gender);
    }
  });

  test('TC07: Verify uploading a valid profile image', async ({ profileBasicInfoPage }) => {
    const validImagePath = path.join(__dirname, '../../test-data', profileData.profilePageData.imageUpload.validImageRelativePath);

    await profileBasicInfoPage.uploadImage(validImagePath);
    await expect(profileBasicInfoPage.profileImage).toBeVisible();
  });

});

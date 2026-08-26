import { test, expect } from '../../../src/fixtures';
import passwordData from '../../test-data/password-data.json';

const testData = passwordData.passwordData;

test.describe('Portal - Change Password Form Validations @profile @password', () => {
  test.beforeEach(async ({ page, topNavigationBar, profilePage, passwordPage }) => {
    const profileUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/profile');
    await page.goto(profileUrl);
    await page.waitForLoadState('domcontentloaded');
    await profilePage.clickTab(testData.tabName as any);
    await expect(passwordPage.tabHeader).toBeVisible();
  });

  test('TC01: Verify navigation to Password tab and visibility of Change Password form header and controls', async ({ passwordPage }) => {
    await expect(passwordPage.tabHeader).toBeVisible();
    await expect(passwordPage.oldPasswordInput).toBeVisible();
    await expect(passwordPage.newPasswordInput).toBeVisible();
    await expect(passwordPage.confirmPasswordInput).toBeVisible();
    await expect(passwordPage.updatePasswordButton).toBeVisible();
    await expect(passwordPage.oldPasswordEyeIcon).toBeVisible();
    await expect(passwordPage.newPasswordEyeIcon).toBeVisible();
    await expect(passwordPage.confirmPasswordEyeIcon).toBeVisible();
  });

  test('TC02: Verify validation error messages when submitting an empty Change Password form', async ({ passwordPage, page }) => {
    await passwordPage.clearPasswordForm();
    await passwordPage.clickUpdatePassword();

    await expect(page.getByText(testData.messages.oldPasswordRequired, { exact: false }).first().or(passwordPage.oldPasswordError)).toBeVisible();
    await expect(page.getByText(testData.messages.newPasswordRequired, { exact: false }).first().or(passwordPage.newPasswordError)).toBeVisible();
    await expect(page.getByText(testData.messages.confirmPasswordRequired, { exact: false }).first().or(passwordPage.confirmPasswordError)).toBeVisible();
  });

  test('TC03: Verify validation error "Current password is required (5-30 characters)" when Current Password field is empty', async ({ passwordPage, page }) => {
    await passwordPage.clearPasswordForm();
    await passwordPage.fillPasswordForm({
      newPassword: testData.testInputs.validNewPassword,
      confirmPassword: testData.testInputs.validNewPassword,
    });
    await passwordPage.clickUpdatePassword();

    await expect(page.getByText(testData.messages.oldPasswordRequired, { exact: false }).first().or(passwordPage.getErrorMessage(testData.messages.oldPasswordRequired))).toBeVisible();
  });

  test('TC04: Verify validation error "New password is required (5-30 characters)" when New Password field is empty', async ({ passwordPage, page }) => {
    await passwordPage.clearPasswordForm();
    await passwordPage.fillPasswordForm({
      oldPassword: testData.testInputs.validCurrentPassword,
      confirmPassword: testData.testInputs.validNewPassword,
    });
    await passwordPage.clickUpdatePassword();

    await expect(page.getByText(testData.messages.newPasswordRequired, { exact: false }).first().or(passwordPage.getErrorMessage(testData.messages.newPasswordRequired))).toBeVisible();
  });

  test('TC05: Verify validation error "Confirm password is required (5-30 characters)" when Confirm Password field is empty', async ({ passwordPage, page }) => {
    await passwordPage.clearPasswordForm();
    await passwordPage.fillPasswordForm({
      oldPassword: testData.testInputs.validCurrentPassword,
      newPassword: testData.testInputs.validNewPassword,
    });
    await passwordPage.clickUpdatePassword();

    await expect(page.getByText(testData.messages.confirmPasswordRequired, { exact: false }).first().or(passwordPage.getErrorMessage(testData.messages.confirmPasswordRequired))).toBeVisible();
  });

  test('TC06: Verify validation error "Atleast 5 characters required" when password is less than 5 characters', async ({ passwordPage, page }) => {
    await passwordPage.clearPasswordForm();
    await passwordPage.fillPasswordForm({
      oldPassword: testData.testInputs.shortPassword,
      newPassword: testData.testInputs.shortPassword,
      confirmPassword: testData.testInputs.shortPassword,
    });
    await passwordPage.clickUpdatePassword();

    await expect(page.getByText(testData.messages.minCharError, { exact: false }).first().or(passwordPage.getErrorMessage(testData.messages.minCharError))).toBeVisible();
  });

  test('TC07: Verify validation error "Maximum 30 characters allowed" when password exceeds 30 characters limit', async ({ passwordPage, page }) => {
    await passwordPage.clearPasswordForm();
    await passwordPage.fillPasswordForm({
      oldPassword: testData.testInputs.longPassword,
      newPassword: testData.testInputs.longPassword,
      confirmPassword: testData.testInputs.longPassword,
    });
    await passwordPage.clickUpdatePassword();

    await expect(page.getByText(testData.messages.maxCharError, { exact: false }).first().or(passwordPage.getErrorMessage(testData.messages.maxCharError))).toBeVisible();
  });

  test('TC08: Verify validation error "Space not allowed" when password contains blank spaces', async ({ passwordPage, page }) => {
    await passwordPage.clearPasswordForm();
    await passwordPage.fillPasswordForm({
      oldPassword: testData.testInputs.passwordWithSpace,
      newPassword: testData.testInputs.passwordWithSpace,
      confirmPassword: testData.testInputs.passwordWithSpace,
    });
    await passwordPage.clickUpdatePassword();

    await expect(page.getByText(testData.messages.spaceNotAllowedError, { exact: false }).first().or(passwordPage.getErrorMessage(testData.messages.spaceNotAllowedError))).toBeVisible();
  });

  test('TC09: Verify validation error "New password and confirm password should be same" when passwords do not match', async ({ passwordPage, page }) => {
    await passwordPage.clearPasswordForm();
    await passwordPage.fillPasswordForm({
      oldPassword: testData.testInputs.validCurrentPassword,
      newPassword: testData.testInputs.validNewPassword,
      confirmPassword: testData.testInputs.mismatchedConfirmPassword,
    });
    await passwordPage.clickUpdatePassword();

    await expect(page.getByText(testData.messages.passwordMismatchError, { exact: false }).first().or(passwordPage.getErrorMessage(testData.messages.passwordMismatchError))).toBeVisible();
  });

  test('TC10: Verify password visibility toggle when clicking eye icon', async ({ passwordPage }) => {
    await passwordPage.fillPasswordForm({
      oldPassword: testData.testInputs.validCurrentPassword,
    });

    await expect(passwordPage.oldPasswordInput).toHaveAttribute('type', testData.fieldAttributes.oldPassword.type);
    await passwordPage.oldPasswordEyeIcon.click();
    await expect(passwordPage.oldPasswordInput).toHaveAttribute('type', 'text');
  });

  test('TC11: Verify input maxlength attributes for password fields', async ({ passwordPage }) => {
    await expect(passwordPage.oldPasswordInput).toHaveAttribute('maxlength', testData.fieldAttributes.oldPassword.maxlength);
    await expect(passwordPage.newPasswordInput).toHaveAttribute('maxlength', testData.fieldAttributes.newPassword.maxlength);
    await expect(passwordPage.confirmPasswordInput).toHaveAttribute('maxlength', testData.fieldAttributes.confirmPassword.maxlength);
  });
});

import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';
import portalData from '../../test-data/portal-data.json';

const otpData = portalData.otpData;

test.describe('Portal Authentication - OTP Verification Flow', () => {
  let adminApi: AdminApiService;

  test.beforeAll(async () => {
    adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({ twoFactorAuth: true });
    await adminApi.close();
  });

  test.afterAll(async () => {
    const cleanupApi = new AdminApiService();
    await cleanupApi.login();
    await cleanupApi.updateSecuritySettings({ twoFactorAuth: false });
    await cleanupApi.close();
  });

  test('OTP Verification - User with two-factor authentication enabled is redirected to OTP entry screen upon login', 
    async ({ portalLoginPage, otpPage, otpUser }) => {
    await portalLoginPage.login(
      otpUser.email, 
      otpUser.password
    );

    await expect(otpPage.otpPageIdentifier).toBeVisible();
  });

  test('OTP Verification - Verify OTP button remains disabled when input field is empty', async ({ portalLoginPage, otpPage }) => {
    const email = process.env.OTP_USER_EMAIL as string;
    const password = process.env.OTP_USER_PASSWORD as string;

    await portalLoginPage.login(email, password);
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    await expect(otpPage.verifyOtpButton).toBeDisabled();
  });

  test('OTP Verification - Displays validation error and disables submit when OTP format is fewer than 6 digits', async ({ portalLoginPage, otpPage }) => {
    const email = process.env.OTP_USER_EMAIL as string;
    const password = process.env.OTP_USER_PASSWORD as string;

    await portalLoginPage.login(email, password);
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    await otpPage.fillOtp(otpData.invalidOtpFormat);
    await expect(otpPage.invalidOtpFormatError).toBeVisible();
    await expect(otpPage.verifyOtpButton).toBeDisabled();
  });

  test('OTP Verification - Locks account after exhausting maximum permitted invalid OTP attempts', async ({ portalLoginPage, otpPage }) => {
    const email = process.env.OTP_USER_EMAIL as string;
    const password = process.env.OTP_USER_PASSWORD as string;

    await portalLoginPage.login(email, password);
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    await otpPage.submitOtp(otpData.invalidOtpFull);
    await otpPage.handleExhaustOtpLockout(otpData.invalidOtpFull);
    await expect(otpPage.otpExhaustedError).toBeVisible();
  });

  test('OTP Verification - Disables Resend OTP button upon reaching maximum resend limit', async ({ portalLoginPage, otpPage }) => {
    test.setTimeout(320000); 

    const email = process.env.OTP_USER_EMAIL as string;
    const password = process.env.OTP_USER_PASSWORD as string;

    await portalLoginPage.login(email, password);
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    await otpPage.exhaustResendOtpLimit(otpData.maxResends);
    await expect(otpPage.resendOtpLimitText).toBeVisible({ timeout: 70000 });
  });

});

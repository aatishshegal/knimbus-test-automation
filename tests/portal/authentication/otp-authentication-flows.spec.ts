import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';

const INVALID_OTP_FORMAT = '1';
const INVALID_OTP_FULL = '111111';

test.describe('Portal Authentication - OTP Positive Flow', () => {
  test('A user with OTP enabled should be routed to the OTP Verification Page', 
    async ({ portalLoginPage, otpPage, otpUser }) => {
    
    // 1. Arrange & Act
    await portalLoginPage.login(
      otpUser.email, 
      otpUser.password
    );

    // 2. Assert
    await expect(otpPage.otpPageIdentifier).toBeVisible();
  });
});

test.describe('Portal Authentication - OTP Negative Scenarios', () => {

  test.afterEach(async ({ page }) => {
    // Add a short delay to see the final screen locally
    await page.waitForTimeout(2000);
  });

  test('Empty OTP field should keep verify button disabled', async ({ portalLoginPage, otpPage }) => {
    // 1. Arrange - Setup Admin preconditions via API
    const adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({ twoFactorAuth: true });
    await adminApi.close();

    const email = process.env.OTP_USER_EMAIL as string;
    const password = process.env.OTP_USER_PASSWORD as string;

    await portalLoginPage.login(email, password);
    
    // We should be on the OTP page
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    // 2. Assert
    // The button is natively disabled when the field is empty
    await expect(otpPage.verifyOtpButton).toBeDisabled();
  });

  test('Invalid OTP format should show error', async ({ portalLoginPage, otpPage }) => {
    // 1. Arrange - Setup Admin preconditions via API
    const adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({ twoFactorAuth: true });
    await adminApi.close();

    const email = process.env.OTP_USER_EMAIL as string;
    const password = process.env.OTP_USER_PASSWORD as string;

    await portalLoginPage.login(email, password);
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    // Fill only 1 digit using our new POM abstraction
    await otpPage.fillOtp(INVALID_OTP_FORMAT);
    
    // 2. Assert
    await expect(otpPage.invalidOtpFormatError).toBeVisible();
    await expect(otpPage.verifyOtpButton).toBeDisabled();
  });

  test('Invalid 6-digit OTP should show remaining attempts error or lock the account', async ({ portalLoginPage, otpPage }) => {
    // 1. Arrange - Setup Admin preconditions via API
    const adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({ twoFactorAuth: true });
    await adminApi.close();

    const email = process.env.OTP_USER_EMAIL as string;
    const password = process.env.OTP_USER_PASSWORD as string;

    await portalLoginPage.login(email, password);
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    // 2. Act
    await otpPage.submitOtp(INVALID_OTP_FULL);

    // 3. Assert
    // Depending on previous tests, it might show the attempts remaining OR lock the account
    await expect(
        otpPage.invalidOtpError.or(otpPage.otpExhaustedError)
    ).toBeVisible();

    // If it's just the invalid OTP error, we can intelligently loop to force the lock
    const attemptsLeft = await otpPage.getOtpRemainingAttempts();
    
    if (attemptsLeft > 0) {
        console.log(`Attempts remaining detected: ${attemptsLeft}. Locking account...`);

        // Loop until it locks using abstract POM methods
        await otpPage.exhaustInvalidOtpAttempts(attemptsLeft, INVALID_OTP_FULL);
        await expect(otpPage.otpExhaustedError).toBeVisible();
    }
  });

  test('Resend OTP limit should disable the resend button', async ({ portalLoginPage, otpPage, page }) => {
    // This test takes a long time because it has to wait ~60s between each resend click (3 minutes total) 
    // PLUS one final 60s wait at the end. We explicitly give it over 5 minutes.
    test.setTimeout(320000); 

    // 1. Arrange - Setup Admin preconditions via API
    const adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({ twoFactorAuth: true });
    await adminApi.close();

    const email = process.env.OTP_USER_EMAIL as string;
    const password = process.env.OTP_USER_PASSWORD as string;

    await portalLoginPage.login(email, password);
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    // 2. Act & Assert - Use POM method to loop and hit the limit
    const maxResends = 3;
    await otpPage.exhaustResendOtpLimit(maxResends);

    // 3. Assert Limit Exhaustion
    // After 3 resends, the timer counts down one final time. Once it hits 00:00, 
    // it is permanently replaced by the text "Resend OTP (3/3)"
    await expect(otpPage.resendOtpLimitText).toBeVisible({ timeout: 70000 });
  });

});

import { test, expect } from '../../../src/fixtures';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';
import testData from '../../test-data/forgotPasswordData.json';

const TEST_EMAIL = 'aus01@yopmail.com';

test.describe('Forgot Password Flow', () => {

    test('TC_ForgotPassword_001 - Verify Forgot Password page, logo, heading, and navigation', async ({ forgotPasswordPage, portalLoginPage }) => {
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);
        await expect(forgotPasswordPage.logo).toBeVisible();
        await expect(forgotPasswordPage.heading).toContainText('Forgot password?');

        // Verify Navigation back to sign in
        await forgotPasswordPage.backToSignInLink.click();
        await expect(portalLoginPage.emailInput).toBeVisible();
    });

    test('TC_ForgotPassword_002 - Verify registered email password reset, success message, reset email/link, and leading/trailing spaces', async ({ forgotPasswordPage, page }) => {
        test.setTimeout(120000); // Extended timeout for email delivery
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);

        // Use leading/trailing spaces
        const emailWithSpaces = `  ${TEST_EMAIL}  `;
        await forgotPasswordPage.requestPasswordReset(emailWithSpaces);

        await expect(forgotPasswordPage.successMessage).toContainText('Your password has been reset. Kindly check your email for further action.');

        // Yopmail verification
        const yopmailPage = new YopmailPage(page);
        const resetUrl = await yopmailPage.getResetLink(TEST_EMAIL);
        expect(resetUrl).toContain('verifyToken?token=');
    });

    test('TC_ForgotPassword_003 - Verify unregistered email shows appropriate error and password reset fails', async ({ forgotPasswordPage }) => {
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);
        await forgotPasswordPage.requestPasswordReset(testData.unregisteredEmail);

        await expect(forgotPasswordPage.validationMessage).toBeVisible();
    });

    test('TC_ForgotPassword_004 - Verify uppercase email is accepted and reset succeeds', async ({ forgotPasswordPage }) => {
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);

        const uppercaseEmail = TEST_EMAIL.toUpperCase();
        await forgotPasswordPage.requestPasswordReset(uppercaseEmail);

        await expect(forgotPasswordPage.successMessage).toContainText('Your password has been reset. Kindly check your email for further action.');
    });

    // Unrolled valid email boundary loop
    for (const { email, error } of testData.invalidEmails) {
        test(`TC_ForgotPassword_005 - Verify invalid email format shows validation error: ${email}`, async ({ forgotPasswordPage }) => {
            await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);

            await forgotPasswordPage.fillText(forgotPasswordPage.emailInput, email, 'Email Field');
            await forgotPasswordPage.emailInput.blur(); // Trigger validation
            await expect(forgotPasswordPage.page.getByText(error)).toBeVisible();
            await expect(forgotPasswordPage.resetButton).toBeDisabled();
        });
    }

    // Unrolled valid password boundary tests (Currently 1 valid requested by user)
    for (const { password, description } of testData.validBoundaryPasswords) {
        test(`TC_ForgotPassword_006 - Verify valid password boundaries and reset succeeds: ${description}`, async ({ forgotPasswordPage, resetPasswordPage, portalLoginPage, page }) => {
            test.setTimeout(180000); // 3 minutes to handle email delays
            await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);
            await forgotPasswordPage.requestPasswordReset(TEST_EMAIL);
            await expect(forgotPasswordPage.successMessage).toContainText('Your password has been reset. Kindly check your email for further action.');

            const yopmailPage = new YopmailPage(page);
            const resetUrl = await yopmailPage.getResetLink(TEST_EMAIL);

            await page.goto(resetUrl);
            await expect(resetPasswordPage.heading).toBeVisible();
            
            // Submits the new valid password
            await resetPasswordPage.setNewPassword(password, password, true);
            
            // Assert success and routing back to login
            await expect(resetPasswordPage.passwordLengthError).toBeHidden();
            await expect(portalLoginPage.emailInput).toBeVisible();
        });
    }

    // Unrolled invalid password boundary loop
    for (const { password, expectedError } of testData.boundaryPasswords) {
        test(`TC_ForgotPassword_007 - Verify invalid password boundaries are rejected: ${password}`, async ({ page, forgotPasswordPage, resetPasswordPage }) => {
            test.setTimeout(180000);
            await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);
            await forgotPasswordPage.requestPasswordReset(TEST_EMAIL);

            const yopmailPage = new YopmailPage(page);
            const resetUrl = await yopmailPage.getResetLink(TEST_EMAIL);

            await page.goto(resetUrl);
            // Call setNewPassword with submit=false so it doesn't wait for navigation or timeout on disabled button
            await resetPasswordPage.setNewPassword(password, password, false);

            // Assert the error text is visible.
            await expect(resetPasswordPage.page.getByText(expectedError).first()).toBeVisible();
            await expect(resetPasswordPage.continueButton).toBeDisabled();
        });
    }

    test('TC_ForgotPassword_008 - Verify boundary validation, error message, and disabled Reset button', async ({ forgotPasswordPage }) => {
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);

        // Empty email
        await forgotPasswordPage.emailInput.focus();
        await forgotPasswordPage.emailInput.blur();

        await expect(forgotPasswordPage.page.getByText('Email is required')).toBeVisible();
        await expect(forgotPasswordPage.resetButton).toBeDisabled();
    });
});
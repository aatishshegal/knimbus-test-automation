import { test, expect } from '../../../src/fixtures';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';
import portalData from '../../test-data/portal-data.json';

const testData = portalData.forgotPasswordData;
const TEST_EMAIL = testData.registeredEmail || (process.env.STANDARD_USER_EMAIL as string);

test.describe('Forgot Password Flow', () => {

    test('Forgot Password - Displays logo, heading, and navigates back to Sign In page', async ({ forgotPasswordPage, portalLoginPage }) => {
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);
        await expect(forgotPasswordPage.logo).toBeVisible();
        await expect(forgotPasswordPage.heading).toContainText('Forgot password?');

        // Verify Navigation back to sign in
        await forgotPasswordPage.backToSignInLink.click();
        await expect(portalLoginPage.emailInput).toBeVisible();
    });

    test('Forgot Password - Sends reset email and displays confirmation for registered email with leading and trailing spaces', async ({ forgotPasswordPage, page }) => {
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

    test('Forgot Password - Displays error message when submitting an unregistered email', async ({ forgotPasswordPage }) => {
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);
        await forgotPasswordPage.requestPasswordReset(testData.unregisteredEmail);

        await expect(forgotPasswordPage.validationMessage).toBeVisible();
    });

    test('Forgot Password - Accepts uppercase email address and displays reset confirmation', async ({ forgotPasswordPage }) => {
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);

        const uppercaseEmail = TEST_EMAIL.toUpperCase();
        await forgotPasswordPage.requestPasswordReset(uppercaseEmail);

        await expect(forgotPasswordPage.successMessage).toContainText('Your password has been reset. Kindly check your email for further action.');
    });

    test.describe('Forgot Password - Invalid Email Validation', () => {
        for (const { email, error } of testData.invalidEmails) {
            test(`Forgot Password - Shows validation error and disables reset for invalid email format: ${email}`, async ({ forgotPasswordPage }) => {
                await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);

                await forgotPasswordPage.fillText(forgotPasswordPage.emailInput, email, 'Email Field');
                await forgotPasswordPage.emailInput.blur(); // Trigger validation
                await expect(forgotPasswordPage.page.getByText(error)).toBeVisible();
                await expect(forgotPasswordPage.resetButton).toBeDisabled();
            });
        }
    });

    test.describe('Forgot Password - Valid Password Reset', () => {
        for (const { password, description } of testData.validBoundaryPasswords) {
            test(`Forgot Password - Successfully resets password with valid boundary password: ${description}`, async ({ forgotPasswordPage, resetPasswordPage, portalLoginPage, page }) => {
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
    });

    test.describe('Forgot Password - Invalid Password Boundary Rejection', () => {
        for (const { password, expectedError } of testData.boundaryPasswords) {
            test(`Forgot Password - Rejects invalid boundary password and keeps continue button disabled: ${password}`, async ({ page, forgotPasswordPage, resetPasswordPage }) => {
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
    });

    test('Forgot Password - Displays required field error and disables reset button when email is cleared', async ({ forgotPasswordPage }) => {
        await forgotPasswordPage.navigateToForgotPassword(process.env.PORTAL_URL as string);

        // Empty email
        await forgotPasswordPage.emailInput.focus();
        await forgotPasswordPage.emailInput.blur();

        await expect(forgotPasswordPage.page.getByText('Email is required')).toBeVisible();
        await expect(forgotPasswordPage.resetButton).toBeDisabled();
    });
});
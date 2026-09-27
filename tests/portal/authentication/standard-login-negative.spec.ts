import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';
import { AuthHelpers } from '../../../src/utils/AuthHelpers';

const invalidCredentials = portalData.invalidCredentials;

test.describe('Portal Authentication - Standard Login Field and Credential Validations', () => {

  test('Standard Login - Submit button remains disabled when email or password fields are empty', async ({ portalLoginPage }) => {
    const email = process.env.NEGATIVE_USER_EMAIL as string;
    const password = process.env.NEGATIVE_USER_PASSWORD as string;

    await portalLoginPage.navigateTo(process.env.PORTAL_URL as string);
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');

    expect(await portalLoginPage.isSubmitButtonDisabled()).toBe(true);

    await portalLoginPage.fillText(portalLoginPage.emailInput, email, 'Email Field');
    expect(await portalLoginPage.isSubmitButtonDisabled()).toBe(true);

    await portalLoginPage.emailInput.clear();
    await portalLoginPage.fillText(portalLoginPage.passwordInput, password, 'Password Field');
    expect(await portalLoginPage.isSubmitButtonDisabled()).toBe(true);
  });

  test('Standard Login - Displays validation error and disables submit button for invalid email format', async ({ portalLoginPage }) => {
    const password = process.env.NEGATIVE_USER_PASSWORD as string;

    await portalLoginPage.navigateTo(process.env.PORTAL_URL as string);
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');

    await portalLoginPage.fillText(portalLoginPage.emailInput, invalidCredentials.invalidEmailFormat, 'Email Field');
    await portalLoginPage.fillText(portalLoginPage.passwordInput, password, 'Password Field');

    expect(await portalLoginPage.isSubmitButtonDisabled()).toBe(true);
    await expect(portalLoginPage.invalidEmailFormatError).toBeVisible();
  });

  test("Standard Login - Displays user does not exist error when logging in with unregistered email", async ({ portalLoginPage }) => {
    const unregisteredEmail = `${invalidCredentials.unregisteredEmailPrefix}_${Date.now()}@yopmail.com`;
    const password = process.env.NEGATIVE_USER_PASSWORD as string;

    await portalLoginPage.login(unregisteredEmail, password);

    await expect(portalLoginPage.unregisteredUserError).toBeVisible({ timeout: 15000 });
  });

  test('Standard Login - Displays remaining attempts warning or lockout notification for invalid password', async ({ portalLoginPage }) => {
    const email = process.env.LOCKED_USER_EMAIL as string;
    const password = process.env.LOCKED_USER_PASSWORD as string;

    await portalLoginPage.login(email, `${password}${invalidCredentials.invalidPasswordSuffix}`);
    await portalLoginPage.verifyInvalidPasswordFeedback();
  });

  test('Standard Login - Locks account after exceeding maximum permitted failed login attempts', async ({ portalLoginPage }) => {
    test.slow();
    const email = process.env.LOCKED_USER_EMAIL as string;
    const password = process.env.LOCKED_USER_PASSWORD as string;

    await portalLoginPage.navigateTo(process.env.PORTAL_URL as string);
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');
    await portalLoginPage.fillText(portalLoginPage.emailInput, email, 'Email Field');

    const isLocked = await AuthHelpers.lockUserAccount(portalLoginPage, email, password);
    expect(isLocked).toBe(true);
  });

});

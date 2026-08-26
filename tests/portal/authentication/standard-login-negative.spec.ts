import { test, expect } from '../../../src/fixtures';
import invalidCredentials from '../../test-data/invalidCredentials.json';
import { AuthHelpers } from '../../../src/utils/AuthHelpers';

test.describe('Portal Authentication - Standard Login Negative Scenarios', () => {

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(2000);
  });

  test('Verify the submit button stays disabled when login fields are empty', async ({ portalLoginPage }) => {
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

  test('Verify an invalid email format disables the submit button and shows an error', async ({ portalLoginPage }) => {
    const password = process.env.NEGATIVE_USER_PASSWORD as string;

    await portalLoginPage.navigateTo(process.env.PORTAL_URL as string);
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');

    await portalLoginPage.fillText(portalLoginPage.emailInput, invalidCredentials.invalidEmailFormat, 'Email Field');
    await portalLoginPage.fillText(portalLoginPage.passwordInput, password, 'Password Field');

    expect(await portalLoginPage.isSubmitButtonDisabled()).toBe(true);
    await expect(portalLoginPage.invalidEmailFormatError).toBeVisible();
  });

  test("Verify an unregistered email shows a 'user does not exist' error", async ({ portalLoginPage }) => {
    const unregisteredEmail = `${invalidCredentials.unregisteredEmailPrefix}_${Date.now()}@yopmail.com`;
    const password = process.env.NEGATIVE_USER_PASSWORD as string;

    await portalLoginPage.login(unregisteredEmail, password);

    await expect(portalLoginPage.unregisteredUserError).toBeVisible({ timeout: 15000 });
  });

  test('Verify an invalid password shows a remaining-attempts error or locks the account', async ({ portalLoginPage }) => {
    const email = process.env.LOCKED_USER_EMAIL as string;
    const password = process.env.LOCKED_USER_PASSWORD as string;

    await portalLoginPage.login(email, `${password}${invalidCredentials.invalidPasswordSuffix}`);

    await portalLoginPage.page.waitForTimeout(2000);
    const isWarningVisible = await portalLoginPage.invalidPasswordError.isVisible();
    const isGenericErrorVisible = await portalLoginPage.page.getByText('Invalid login credential').isVisible();
    const isLockedVisible = await portalLoginPage.accountLockedError.isVisible();

    expect(isWarningVisible || isLockedVisible || isGenericErrorVisible).toBeTruthy();
  });

  test('Verify multiple incorrect password attempts lock the account', async ({ portalLoginPage }) => {
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

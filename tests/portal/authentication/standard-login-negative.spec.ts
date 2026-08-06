import { test, expect } from '../../../src/fixtures';
import invalidCredentials from '../../test-data/invalidCredentials.json';
import { AuthHelpers } from '../../../src/utils/AuthHelpers';

test.describe('Portal Authentication - Standard Login Negative Scenarios', () => {

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(2000);
  });

  test('Empty fields should keep the submit button disabled', async ({ portalLoginPage }) => {
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

  test('Invalid email format should disable the submit button and show an error', async ({ portalLoginPage }) => {
    const password = process.env.NEGATIVE_USER_PASSWORD as string;

    await portalLoginPage.navigateTo(process.env.PORTAL_URL as string);
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');

    await portalLoginPage.fillText(portalLoginPage.emailInput, invalidCredentials.invalidEmailFormat, 'Email Field');
    await portalLoginPage.fillText(portalLoginPage.passwordInput, password, 'Password Field');

    expect(await portalLoginPage.isSubmitButtonDisabled()).toBe(true);
    await expect(portalLoginPage.invalidEmailFormatError).toBeVisible();
  });

  test('Unregistered email should show user does not exist error', async ({ portalLoginPage }) => {
    const unregisteredEmail = `${invalidCredentials.unregisteredEmailPrefix}_${Date.now()}@yopmail.com`;
    const password = process.env.NEGATIVE_USER_PASSWORD as string;

    await portalLoginPage.login(unregisteredEmail, password);

    await expect(portalLoginPage.unregisteredUserError).toBeVisible({ timeout: 15000 });
  });

  test('Invalid password should show remaining attempts error or lock the account', async ({ portalLoginPage }) => {
    const email = process.env.LOCKED_USER_EMAIL as string;
    const password = process.env.LOCKED_USER_PASSWORD as string;

    await portalLoginPage.login(email, `${password}${invalidCredentials.invalidPasswordSuffix}`);

    await portalLoginPage.page.waitForTimeout(2000);
    const isWarningVisible = await portalLoginPage.invalidPasswordError.isVisible();
    const isGenericErrorVisible = await portalLoginPage.page.getByText('Invalid login credential').isVisible();
    const isLockedVisible = await portalLoginPage.accountLockedError.isVisible();

    expect(isWarningVisible || isLockedVisible || isGenericErrorVisible).toBeTruthy();
  });

  test('Multiple incorrect passwords should lock the account', async ({ portalLoginPage }) => {
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

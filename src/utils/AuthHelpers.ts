import { PortalLoginPage } from '../pages/portal/PortalLoginPage';
import { Page } from '@playwright/test';

export class AuthHelpers {
  static async lockUserAccount(portalLoginPage: PortalLoginPage, email: string, basePassword: string, maxTries: number = 6) {
    for (let i = 1; i <= maxTries; i++) {
      await portalLoginPage.passwordInput.clear();
      await portalLoginPage.fillText(portalLoginPage.passwordInput, `${basePassword}_wrong${i}`, 'Password Field');
      await portalLoginPage.clickElement(portalLoginPage.submitButton, 'Continue Button');

      await portalLoginPage.page.waitForTimeout(2000);

      if (await portalLoginPage.accountLockedError.isVisible()) {
        return true;
      }
    }
    return await portalLoginPage.accountLockedError.isVisible();
  }
}

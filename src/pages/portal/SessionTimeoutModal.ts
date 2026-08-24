import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { PortalLoginPage } from './PortalLoginPage';

export class SessionTimeoutModal extends BasePage {
  readonly modalContainer: Locator;
  readonly sessionTimeoutTitle: Locator;
  readonly sessionTimeoutMessage: Locator;
  readonly loginAgainButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modalContainer = page.locator('.swal2-container');
    this.sessionTimeoutTitle = page.getByRole('heading', { name: 'Session timed out!' });
    this.sessionTimeoutMessage = page.getByText('You have been logged out due to inactivity.');
    this.loginAgainButton = page.getByRole('button', { name: 'Login again' });
  }

  /**
   * Checks if session is expired ("Session timed out!" popup modal is visible on screen).
   */
  async isSessionExpired(): Promise<boolean> {
    return await this.loginAgainButton.isVisible().catch(() => false);
  }

  /**
   * Checks if session expired modal is visible, and if so, clicks the "Login again" button.
   */
  async handleSessionTimeoutIfVisible(): Promise<boolean> {
    try {
      if (await this.isSessionExpired()) {
        console.log('[LOG] Session expired! "Session timed out!" popup modal detected on screen.');
        await this.clickElement(this.loginAgainButton, 'Login again Button');
        console.log('[LOG] Clicked "Login again" button successfully.');
        await this.page.waitForLoadState('networkidle').catch(() => {});
        return true;
      }
    } catch (error) {
      console.log('[LOG] Session Timeout check passed without action:', (error as Error).message);
    }
    return false;
  }

  /**
   * Checks for session expiration, clicks "Login again", and performs login if required.
   */
  async reloginIfSessionExpired(email?: string, password?: string): Promise<boolean> {
    const expired = await this.handleSessionTimeoutIfVisible();
    if (expired && email && password) {
      console.log(`[LOG] Re-logging in user: ${email}`);
      const loginPage = new PortalLoginPage(this.page);
      await loginPage.login(email, password);
    }
    return expired;
  }
}

import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TermsAndConditionsModal extends BasePage {
  readonly termsCheckbox: Locator;
  readonly termsAcceptButton: Locator;

  constructor(page: Page) {
    super(page);
    this.termsCheckbox = page.locator('#termsAccepted, .term-and-condition-check-box').first();
    this.termsAcceptButton = page.getByRole('button', { name: /Accept|I Agree|Continue|Next/i }).last();
  }

  async acceptTermsIfPresent(timeout: number = 1000) {
    const isPresent = await this.termsCheckbox.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    if (isPresent) {
      console.log('[LOG] Terms & Conditions checkbox is present on the screen.');
      await this.termsCheckbox.scrollIntoViewIfNeeded().catch(() => {});
      
      const label = this.page.locator('label[for="termsAccepted"], .term-and-condition-check-box-label').first();
      if (await label.count() > 0 && await label.isVisible().catch(() => false)) {
        await label.click({ force: true });
      } else {
        await this.termsCheckbox.check({ force: true }).catch(async () => {
          await this.termsCheckbox.click({ force: true });
        });
      }
      console.log('[LOG] User successfully checked the Terms & Conditions box.');
      
      if (await this.termsAcceptButton.isVisible().catch(() => false)) {
        await this.termsAcceptButton.click({ force: true });
        console.log('[LOG] User clicked the Accept button for Terms & Conditions.');
        await this.termsCheckbox.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(300);
      }
    }
  }

  async handleTermsAndConditionsIfVisible(timeout: number = 1000) {
    // If landed on the Welcome onboarding page, proceed immediately
    const welcomeContinue = this.page.getByRole('button', { name: 'Continue' });
    if (this.page.url().includes('/welcome') || await welcomeContinue.isVisible().catch(() => false)) {
      console.log('[LOG] Welcome onboarding continue button is visible. Clicking it.');
      await welcomeContinue.click({ force: true }).catch(() => {});
      await welcomeContinue.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      await this.page.waitForURL(url => !url.href.includes('/welcome'), { timeout: 5000 }).catch(() => {});
    }

    // Accept T&C if it pops up
    await this.acceptTermsIfPresent(timeout);
  }
}


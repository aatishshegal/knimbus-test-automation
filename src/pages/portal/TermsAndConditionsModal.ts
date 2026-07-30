import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TermsAndConditionsModal extends BasePage {
  readonly termsCheckbox: Locator;
  readonly termsAcceptButton: Locator;

  constructor(page: Page) {
    super(page);
    this.termsCheckbox = page.locator('input[type="checkbox"]').first();
    this.termsAcceptButton = page.getByRole('button', { name: /Accept|I Agree|Continue|Next/i }).last();
  }

  async handleTermsAndConditionsIfVisible() {
    if (await this.termsCheckbox.isVisible()) {
        console.log('[LOG] Terms & Conditions pop-up IS visible on the screen.');
        await this.termsCheckbox.check();
        console.log('[LOG] User successfully checked the Terms & Conditions box.');
        
        if (await this.termsAcceptButton.isVisible()) {
            await this.termsAcceptButton.click();
            console.log('[LOG] User clicked the Accept button for Terms & Conditions.');
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
        }
    } else {
        console.log('[LOG] Terms & Conditions pop-up is NOT visible. Skipping checkbox logic.');
    }
  }
}

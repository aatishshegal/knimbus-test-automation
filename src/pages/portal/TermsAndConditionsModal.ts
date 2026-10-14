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

  async handleTermsAndConditionsIfVisible(timeoutMs = 3000) {
    console.log(`[TermsAndConditionsModal] Checking if Terms & Conditions modal is present for this library (timeout: ${timeoutMs}ms)...`);
    
    // Check if the modal or checkbox is visible within the given timeout
    const isPresent = await this.termsCheckbox.waitFor({ state: 'visible', timeout: timeoutMs })
      .then(() => true)
      .catch(() => false);

    if (isPresent) {
      console.log('[TermsAndConditionsModal] [SITUATION: PRESENT] Terms & Conditions modal IS visible on screen for this library. Handling acceptance...');
      try {
        await this.termsCheckbox.check({ force: true });
        console.log('[TermsAndConditionsModal] User successfully checked the Terms & Conditions box.');
        
        if (await this.termsAcceptButton.isVisible().catch(() => false)) {
          await this.termsAcceptButton.click();
          console.log('[TermsAndConditionsModal] User clicked the Accept button for Terms & Conditions.');
          await this.page.waitForLoadState('networkidle').catch(() => {});
          await this.page.waitForTimeout(1000);
        }
      } catch (err: any) {
        console.log(`[TermsAndConditionsModal] Error during Terms & Conditions acceptance: ${err.message}`);
      }
    } else {
      console.log('[TermsAndConditionsModal] [SITUATION: NOT PRESENT] Terms & Conditions modal is NOT present in this library. Skipping.');
    }
  }
}

import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class ContactPage extends BasePage {
  readonly tabHeader: Locator;
  readonly contactForm: Locator;

  // Form Field Locators
  readonly contactNosInput: Locator;
  readonly officePhoneInput: Locator;
  readonly residentialPhoneInput: Locator;
  readonly nationalitySelect: Locator;
  readonly officeAddressInput: Locator;
  readonly residentialAddressInput: Locator;

  // Action Buttons
  readonly editButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.tabHeader = page.locator('h1, h2, h3, .heading, h5').filter({ hasText: /contact/i }).first();
    this.contactForm = page.locator('form').filter({ hasText: /contact details/i }).first();

    // Inputs
    this.contactNosInput = page.locator('#contactNos, input[name="contactNos"]');
    this.officePhoneInput = page.locator('#officePhone, input[name="officePhone"]');
    this.residentialPhoneInput = page.locator('#residentialPhone, input[name="residentialPhone"]');
    this.nationalitySelect = page.locator('#nationality, select[name="nationality"]');
    this.officeAddressInput = page.locator('#officeAddress, textarea[name="officeAddress"]');
    this.residentialAddressInput = page.locator('#residentialAddress, textarea[name="residentialAddress"]');

    // Buttons
    this.editButton = page.locator('.profile-form-content-heading-wrapper').locator('a, button, img, svg, [class*="edit"]').first()
      .or(page.locator('a, button, span').filter({ hasText: /^edit$/i }).first());
    this.saveButton = page.locator('button, input[type="submit"]').filter({ hasText: /save/i }).first();
    this.cancelButton = page.locator('button, a').filter({ hasText: /cancel/i }).first();
  }

  /**
   * Clicks Edit button if save button is hidden (form in view mode).
   */
  async clickEdit() {
    const isSaveVis = await this.saveButton.isVisible().catch(() => false);
    if (!isSaveVis) {
      const editBtn = this.page.locator('.profile-form-content-heading-wrapper').getByText('Edit', { exact: false }).first()
        .or(this.page.getByText('Edit', { exact: true })).first();

      await editBtn.waitFor({ state: 'visible', timeout: 10000 });
      await editBtn.click();

      // Ensure transition to Edit mode completes reliably
      try {
        await this.saveButton.waitFor({ state: 'visible', timeout: 3000 });
      } catch {
        // Retry click once if Save button didn't appear immediately (prevents UI rendering flakiness)
        await editBtn.click().catch(() => {});
        await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      }
    }
  }

  /**
   * Fills contact details form.
   */
  async fillContactDetails(data: {
    mobile?: string;
    officePhone?: string;
    residentialPhone?: string;
    nationality?: string;
    officeAddress?: string;
    residentialAddress?: string;
  }) {
    await this.clickEdit();

    if (data.mobile !== undefined) {
      await this.fillText(this.contactNosInput, data.mobile, 'Mobile Field');
    }
    if (data.officePhone !== undefined) {
      await this.fillText(this.officePhoneInput, data.officePhone, 'Office Phone Field');
    }
    if (data.residentialPhone !== undefined) {
      await this.fillText(this.residentialPhoneInput, data.residentialPhone, 'Residential Phone Field');
    }
    if (data.nationality !== undefined) {
      await this.nationalitySelect.selectOption(data.nationality).catch(() => {});
    }
    if (data.officeAddress !== undefined) {
      await this.fillText(this.officeAddressInput, data.officeAddress, 'Office Address Textarea');
    }
    if (data.residentialAddress !== undefined) {
      await this.fillText(this.residentialAddressInput, data.residentialAddress, 'Residential Address Textarea');
    }
  }

  /**
   * Clicks Save button inside Contact form.
   */
  async saveContactDetails() {
    await this.clickElement(this.saveButton, 'Save Contact Button');
  }

  /**
   * Clicks Cancel button inside Contact form.
   */
  async cancelContactDetails() {
    await this.clickElement(this.cancelButton, 'Cancel Contact Button');
  }

  /**
   * Clears all fields in Contact form.
   */
  async clearContactDetails() {
    await this.clickEdit();
    await this.contactNosInput.fill('');
    await this.officePhoneInput.fill('');
    await this.residentialPhoneInput.fill('');
    await this.officeAddressInput.fill('');
    await this.residentialAddressInput.fill('');
    await this.nationalitySelect.selectOption('').catch(() => {});
  }

  /**
   * Returns locator for validation error messages.
   */
  getErrorMessage(expectedText?: string): Locator {
    if (expectedText) {
      return this.page.locator('.invalid-feedback, .error-message, .alert-danger, .error, [role="alert"]').filter({ hasText: expectedText }).first();
    }
    return this.page.locator('.invalid-feedback, .error-message, .alert-danger, .error, [role="alert"]').first();
  }
}

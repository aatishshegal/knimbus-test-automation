import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ContactPage extends BasePage {
  readonly pageHeader: Locator;

  // Form Field Locators
  readonly mobileInput: Locator;
  readonly officePhoneInput: Locator;
  readonly residentialPhoneInput: Locator;
  readonly nationalityDropdown: Locator;
  readonly officeAddressInput: Locator;
  readonly residentialAddressInput: Locator;

  // Action Buttons
  readonly editBtn: Locator;
  readonly saveBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(page: Page) {
    super(page);

    // Core Elements scoped to Contact panel to avoid strict mode violations
    const panel = page.locator('.tab-pane.active').first();
    this.pageHeader = panel.getByRole('heading', { name: /Contact/i });
    this.editBtn = panel.locator('.edit-btn');
    this.saveBtn = panel.getByRole('button', { name: 'Save' });
    this.cancelBtn = panel.getByRole('button', { name: 'Cancel' });

    // Inputs mapped using exact DOM attributes seen in pm_commit
    this.mobileInput = panel.locator('input[name="contactNos"]');
    this.officePhoneInput = panel.locator('input[name="officePhone"]');
    this.residentialPhoneInput = panel.locator('input[name="residentialPhone"]');
    this.nationalityDropdown = panel.locator('select[name="nationality"]');
    this.officeAddressInput = panel.locator('textarea[name="officeAddress"]');
    this.residentialAddressInput = panel.locator('textarea[name="residentialAddress"]');
  }

  async clickEdit() {
    await this.editBtn.click();
  }

  async verifyFieldsDisabled() {
    await expect(this.mobileInput).toBeDisabled();
    await expect(this.officePhoneInput).toBeDisabled();
    await expect(this.residentialPhoneInput).toBeDisabled();
    await expect(this.nationalityDropdown).toBeDisabled();
    await expect(this.officeAddressInput).toBeDisabled();
    await expect(this.residentialAddressInput).toBeDisabled();
  }

  async verifyFormVisibility() {
    await expect(this.mobileInput).toBeVisible();
    await expect(this.officePhoneInput).toBeVisible();
    await expect(this.residentialPhoneInput).toBeVisible();
    await expect(this.nationalityDropdown).toBeVisible();
    await expect(this.officeAddressInput).toBeVisible();
    await expect(this.residentialAddressInput).toBeVisible();
    await expect(this.saveBtn).toBeVisible();
    await expect(this.cancelBtn).toBeVisible();
  }

  async clickSave() {
    await this.saveBtn.click();
  }

  async clickCancel() {
    await this.cancelBtn.click();
  }

  async ensureInEditMode() {
    if (await this.editBtn.isVisible()) {
      await this.clickEdit();
    }
  }

  async setFieldValue(field: string, value: string, bypassLength: boolean = false) {
    await this.ensureInEditMode();
    const locator = this.getLocator(field);
    if (field === 'nationality') {
      await locator.selectOption(value);
    } else {
      if (bypassLength) {
        await locator.evaluate((el: HTMLElement) => el.removeAttribute('maxlength'));
      }
      await locator.fill(value);
      await locator.blur();
    }
  }

  async clearFieldAndBlur(field: string) {
    await this.ensureInEditMode();
    const locator = this.getLocator(field);
    if (field === 'nationality') {
      await locator.selectOption('');
    } else {
      await locator.fill(' ');
      await locator.focus();
      await this.page.keyboard.press('Backspace');
      await locator.blur();
    }
  }

  async validateFieldError(expectedError: string) {
    await expect(this.page.getByText(expectedError, { exact: false }).first()).toBeVisible({ timeout: 5000 });
  }

  getLocator(fieldName: string): Locator {
    const fieldMap: Record<string, Locator> = {
      'mobile': this.mobileInput,
      'officePhone': this.officePhoneInput,
      'residentialPhone': this.residentialPhoneInput,
      'nationality': this.nationalityDropdown,
      'officeAddress': this.officeAddressInput,
      'residentialAddress': this.residentialAddressInput
    };
    return fieldMap[fieldName] as Locator;
  }
}

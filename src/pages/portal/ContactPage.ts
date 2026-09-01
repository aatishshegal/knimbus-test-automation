import { Locator, Page } from '@playwright/test';
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
    this.pageHeader = panel.getByRole('heading', { name: 'Contact Details' }).or(page.getByRole('heading', { name: 'Contact' }));
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

  async clickSave() {
    await this.saveBtn.click();
  }

  async clickCancel() {
    await this.cancelBtn.click();
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

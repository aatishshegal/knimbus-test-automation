import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class ProfileBasicInfoPage extends BasePage {
  // Container & Header Locators
  readonly profileTabPane: Locator;
  readonly profileImage: Locator;
  readonly profileImageUploadTrigger: Locator;
  readonly fileInput: Locator;
  readonly profileTitleName: Locator;
  readonly profileTitleEmail: Locator;

  // Basic Details Section Locators
  readonly basicDetailsHeading: Locator;
  readonly editButton: Locator;
  readonly fullNameInput: Locator;
  readonly fullNameLabel: Locator;
  readonly genderSelect: Locator;
  readonly genderLabel: Locator;
  readonly dobInput: Locator;
  readonly dobLabel: Locator;
  readonly summaryTextarea: Locator;
  readonly summaryLabel: Locator;
  readonly emailSubscriptionCheckbox: Locator;
  readonly emailSubscriptionLabel: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    // Tab Pane Container
    this.profileTabPane = page.locator('.tab-pane.active, [role="tabpanel"]').first();

    // Profile Image & Title Info
    this.profileImage = page.locator('.profile-img');
    this.profileImageUploadTrigger = page.locator('.profile-img-cicon-wrapper');
    this.fileInput = page.locator('input[type="file"]');
    this.profileTitleName = page.locator('.profile-title-name');
    this.profileTitleEmail = page.locator('.profile-title-email');

    // Basic Details Form Locators
    this.basicDetailsHeading = page.locator('.profile-form-content-heading').filter({ hasText: /basic details/i });
    this.editButton = page.locator('.edit-btn').or(page.getByRole('button', { name: /edit/i })).first();
    this.fullNameInput = page.locator('#userName');
    this.fullNameLabel = page.locator('label[for="userName"], div:has(#userName) label').first();
    this.genderSelect = page.locator('#gender');
    this.genderLabel = page.locator('label[for="gender"], div:has(#gender) label').first();
    this.dobInput = page.locator('.custom-date-picker input');
    this.dobLabel = page.locator('.custom-date-picker-label');
    this.summaryTextarea = page.locator('#about');
    this.summaryLabel = page.locator('label[for="about"]');
    this.emailSubscriptionCheckbox = page.locator('#Email\\ subscription, input[name="isSubscribed"]').first();
    this.emailSubscriptionLabel = page.locator('label[for="Email subscription"]');

    // Actions
    this.saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update"), .btn-save').first();
    this.cancelButton = page.locator('button:has-text("Cancel")').first();
    this.successToast = page.locator('.toast-success, .alert-success, [role="alert"]').first();
  }

  /**
   * Clicks the Edit button if it is visible.
   */
  async clickEdit() {
    const editBtn = this.page.locator('.profile-form-content-heading-wrapper .edit-btn, .edit-btn').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await this.summaryTextarea.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Returns disabled state of all form fields.
   */
  async getFieldDisabledStates() {
    return {
      fullName: await this.fullNameInput.isDisabled(),
      gender: await this.genderSelect.isDisabled(),
      dob: await this.dobInput.isDisabled(),
      summary: await this.summaryTextarea.isDisabled(),
      emailSubscription: await this.emailSubscriptionCheckbox.isDisabled(),
    };
  }

  /**
   * Returns attributes (maxlength, placeholder, name, id) for field validation tests.
   */
  async getFieldAttributes() {
    return {
      fullNameMaxLength: await this.fullNameInput.getAttribute('maxlength'),
      summaryMaxLength: await this.summaryTextarea.getAttribute('maxlength'),
      dobPlaceholder: await this.dobInput.getAttribute('placeholder'),
    };
  }

  /**
   * Updates basic details fields.
   */
  async updateBasicInfo(data: { gender?: string; summary?: string; emailSubscribed?: boolean; dob?: string }) {
    await this.clickEdit();

    if (data.gender && await this.genderSelect.isEnabled()) {
      await this.genderSelect.selectOption(data.gender);
    }

    if (data.summary !== undefined && await this.summaryTextarea.isEnabled()) {
      await this.fillText(this.summaryTextarea, data.summary, 'Summary Textarea');
    }

    if (data.emailSubscribed !== undefined && await this.emailSubscriptionCheckbox.isEnabled()) {
      const isChecked = await this.emailSubscriptionCheckbox.isChecked();
      if (isChecked !== data.emailSubscribed) {
        await this.emailSubscriptionCheckbox.click();
      }
    }

    if (data.dob && await this.dobInput.isEnabled()) {
      await this.fillText(this.dobInput, data.dob, 'Date of Birth Input');
    }
  }

  /**
   * Submits profile updates.
   */
  async saveChanges() {
    if (await this.saveButton.isVisible() && await this.saveButton.isEnabled()) {
      await this.clickElement(this.saveButton, 'Save Button');
    }
  }

  /**
   * Uploads profile image file.
   */
  async uploadImage(filePath: string) {
    await this.profileImageUploadTrigger.scrollIntoViewIfNeeded();
    const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null);
    await this.profileImageUploadTrigger.click({ force: true });
    const fileChooser = await fileChooserPromise;

    if (fileChooser) {
      await fileChooser.setFiles(filePath);
    } else if (await this.fileInput.count() > 0) {
      await this.fileInput.first().setInputFiles(filePath);
    }
  }
}

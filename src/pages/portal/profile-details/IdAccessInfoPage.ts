import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class IdAccessInfoPage extends BasePage {
  readonly tabHeader: Locator;
  readonly idDocumentHeading: Locator;
  readonly helpText1: Locator;
  readonly helpText2: Locator;

  // Frontside Section Locators
  readonly frontsideHeading: Locator;
  readonly frontsideInput: Locator;
  readonly frontsideImagePreview: Locator;

  // Backside Section Locators
  readonly backsideHeading: Locator;
  readonly backsideInput: Locator;

  // Help Text Locators
  readonly imgHelpTexts: Locator;

  // Save Button & Notifications
  readonly saveButton: Locator;
  readonly toastNotification: Locator;
  readonly errorMessage: Locator;
  readonly pleaseChooseFileError: Locator;
  readonly fileSizeErrorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.tabHeader = page.locator('h1, h2, h3, .heading, [role="tab"]').filter({ hasText: /id & access info/i }).first();
    this.idDocumentHeading = page.locator('.profile-form-content-heading').filter({ hasText: /id document/i });
    this.helpText1 = page.locator('.id-doc-helptext-1').filter({ hasText: /Upload an ID/i }).first();
    this.helpText2 = page.locator('.id-doc-helptext-2').filter({ hasText: /Note:/i }).first();

    // Frontside
    this.frontsideHeading = page.locator('.id-doc-heading').filter({ hasText: /frontside/i });
    this.frontsideInput = page.locator('#idDocumentFront, input[name="idDocumentFront"]');
    this.frontsideImagePreview = page.locator('img.id-doc-img[alt="Front doc"]');

    // Backside
    this.backsideHeading = page.locator('.id-doc-heading').filter({ hasText: /backside/i });
    this.backsideInput = page.locator('#idDocumentBack, input[name="idDocumentBack"]');

    // Guidance text
    this.imgHelpTexts = page.locator('.id-doc-img-helptext');

    // Save Action & Toast Feedback
    this.saveButton = page.locator('.profile-form-btn-wrapper button, button:has-text("Save")').first();
    this.toastNotification = page.locator('.toast, .alert, .toast-message, [role="alert"]').first();
    this.errorMessage = page.locator('.invalid-feedback, .error-message, .alert-danger').first();
    this.pleaseChooseFileError = page.getByText(/Please choose a file/i)
      .or(page.locator('.invalid-feedback, .error-message, .file-required'));
    this.fileSizeErrorMessage = page.getByText(/exceed|maximum|1\s*MB|too large|file size/i)
      .or(page.locator('.toast, .alert, .invalid-feedback, .error-message, [role="alert"]'))
      .filter({ hasText: /size|exceed|1\s*MB|large|maximum/i });
  }

  /**
   * Uploads a Frontside ID image document given a file path.
   */
  async uploadFrontsideDocument(filePath: string) {
    console.log(`Uploading Frontside ID document: ${filePath}`);
    await this.frontsideInput.setInputFiles(filePath);
  }

  /**
   * Uploads a Backside ID image document given a file path.
   */
  async uploadBacksideDocument(filePath: string) {
    console.log(`Uploading Backside ID document: ${filePath}`);
    await this.backsideInput.setInputFiles(filePath);
  }

  /**
   * Clicks the Save button to submit ID document changes.
   */
  async clickSave() {
    console.log('Clicking Save button for ID Document');
    await this.clickElement(this.saveButton, 'Save Button');
  }

  /**
   * Clears selected file from Frontside file input.
   */
  async clearFrontsideDocument() {
    await this.frontsideInput.setInputFiles([]);
  }

  /**
   * Clears selected file from Backside file input.
   */
  async clearBacksideDocument() {
    await this.backsideInput.setInputFiles([]);
  }
}

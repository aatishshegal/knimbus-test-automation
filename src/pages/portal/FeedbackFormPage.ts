import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class FeedbackFormPage extends BasePage {
  readonly feedbackNavLink: Locator;
  readonly breadcrumbHomeLink: Locator;
  readonly breadcrumbCurrentPage: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly feedbackTextarea: Locator;
  readonly characterCounterLabel: Locator;
  readonly fileUploadInput: Locator;
  readonly fileAttachmentHeading: Locator;
  readonly fileAttachmentFormatHint: Locator;
  readonly recaptchaIframe: Locator;
  readonly recaptchaAnchor: Locator;
  readonly sendFeedbackButton: Locator;
  readonly clearButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation & Breadcrumbs
    this.feedbackNavLink = page.getByRole('link', { name: /^Feedback Form$/i })
      .or(page.locator('nav, .navbar, header').locator('a').filter({ hasText: /^Feedback Form$/i }))
      .first();

    this.breadcrumbHomeLink = page.locator('.breadcrumb-container, .breadcrumb')
      .getByRole('link')
      .first();

    this.breadcrumbCurrentPage = page.locator('.breadcrumb-container, .breadcrumb')
      .locator('li')
      .filter({ hasText: /^Feedback Form$/i })
      .first();

    // Form Header & Description
    this.pageTitle = page.locator('.staticFormPage-title');
    this.pageDescription = page.locator('.staticFormPage-section-wrapper p').first();

    // Form Controls
    this.feedbackTextarea = page.locator('#feedback');
    this.characterCounterLabel = page.locator('label[for="feedback"]');

    // Attachment Section
    this.fileUploadInput = page.locator('#file');
    this.fileAttachmentHeading = page.locator('.dashed-box-border').getByText('You may attach a screenshot or an image');
    this.fileAttachmentFormatHint = page.locator('.dashed-box-border').getByText('(In format: .jpeg, .png, .jpg)');

    // reCAPTCHA
    this.recaptchaIframe = page.frameLocator('iframe[title="reCAPTCHA"]').locator('#recaptcha-anchor');
    this.recaptchaAnchor = page.frameLocator('iframe[title="reCAPTCHA"]').locator('#recaptcha-anchor');

    // Form Action Buttons
    this.sendFeedbackButton = page.getByRole('button', { name: 'Send feedback' });
    this.clearButton = page.getByRole('button', { name: 'Clear' });

    // Success Toast Notification
    this.successToast = page.locator('.swal2-title');
  }

  /**
   * Navigate directly to Feedback Form URL
   */
  async goto(): Promise<void> {
    const portalUrl = process.env.PORTAL_URL;
    if (!portalUrl) throw new Error('PORTAL_URL is not defined in .env');

    await this.navigateTo(`${portalUrl}/portal/v2/custom/feedbackform`);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Navigate to Feedback Form by clicking top header menu link
   */
  async navigateViaHeaderLink(): Promise<void> {
    await this.clickElement(this.feedbackNavLink, 'Feedback Form Header Navigation Link');
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Return back to Home page using the breadcrumb Home link
   */
  async navigateHomeViaBreadcrumb(): Promise<void> {
    await this.clickElement(this.breadcrumbHomeLink, 'Breadcrumb Home Link');
    await this.page.waitForURL(url => url.href.includes('/home'), { timeout: 15000 });
  }

  /**
   * Fill feedback textarea
   */
  async enterFeedback(text: string): Promise<void> {
    await this.fillText(this.feedbackTextarea, text, 'Feedback Textarea');
  }

  /**
   * Retrieve current value of feedback textarea
   */
  async getFeedbackText(): Promise<string> {
    return await this.feedbackTextarea.inputValue();
  }

  /**
   * Retrieve label text containing remaining character count
   */
  async getRemainingCharactersText(): Promise<string> {
    return (await this.characterCounterLabel.innerText()).trim();
  }

  /**
   * Upload an attachment file
   */
  async uploadAttachment(resolvedFilePath: string): Promise<void> {
    await this.fileUploadInput.setInputFiles(resolvedFilePath);
  }

  /**
   * Retrieve the current uploaded file value from file input
   */
  async getUploadedFileName(): Promise<string> {
    return await this.fileUploadInput.inputValue();
  }

  /**
   * Click Clear button
   */
  async clickClearButton(): Promise<void> {
    await this.clickElement(this.clearButton, 'Clear Button');
  }

  /**
   * Check if Send Feedback button is disabled
   */
  async isSendFeedbackButtonDisabled(): Promise<boolean> {
    return await this.sendFeedbackButton.isDisabled();
  }

  /**
   * Verify all core feedback form elements are rendered on the page
   */
  async verifyFormElements(expectedTitle: string, expectedDesc: string): Promise<void> {
    await expect(this.pageTitle).toHaveText(expectedTitle);
    await expect(this.pageDescription).toHaveText(expectedDesc);
    await expect(this.feedbackTextarea).toBeVisible();
    await expect(this.characterCounterLabel).toBeVisible();
    await expect(this.fileAttachmentHeading).toBeVisible();
    await expect(this.fileAttachmentFormatHint).toBeVisible();
    await expect(this.fileUploadInput).toBeVisible();
    await expect(this.clearButton).toBeVisible();
    await expect(this.sendFeedbackButton).toBeVisible();
  }

  /**
   * Reload current page and wait for title
   */
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Retrieve required asterisk text indicator inside label
   */
  async getRequiredIndicatorText(): Promise<string> {
    return (await this.characterCounterLabel.locator('.required').innerText()).trim();
  }

  /**
   * Retrieve textarea maxlength attribute
   */
  async getTextareaMaxLength(): Promise<string | null> {
    return await this.feedbackTextarea.getAttribute('maxlength');
  }

  /**
   * Handle reCAPTCHA verification on Feedback Form
   */
  async handleCaptcha(token?: string): Promise<void> {
    await this.handleGoogleRecaptcha(token);
  }

  /**
   * Click the Send feedback button
   */
  async clickSendFeedbackButton(): Promise<void> {
    await this.clickElement(this.sendFeedbackButton, 'Send Feedback Button');
  }

  /**
   * Complete feedback submission by handling captcha and clicking send button
   */
  async submitFeedback(token?: string): Promise<void> {
    await this.handleCaptcha(token);
    await this.clickSendFeedbackButton();
  }

  /**
   * Wait for success toast to be visible and return its message text
   */
  async getSuccessMessage(): Promise<string> {
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
    return (await this.successToast.innerText()).trim();
  }
}


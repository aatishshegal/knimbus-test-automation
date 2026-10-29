import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface BookRequestData {
  bookTitle?: string;
  isbn?: string;
  author?: string;
  volume?: string;
  pages?: string;
  doi?: string;
}

export class BookRequestFormPage extends BasePage {
  readonly navLink: Locator;
  readonly breadcrumbHomeLink: Locator;
  readonly breadcrumbCurrentPage: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Form Inputs
  readonly bookTitleInput: Locator;
  readonly isbnInput: Locator;
  readonly authorInput: Locator;
  readonly volumeInput: Locator;
  readonly pagesInput: Locator;
  readonly doiInput: Locator;

  // Input Wrappers (for testing required class / containers)
  readonly bookTitleWrapper: Locator;
  readonly authorWrapper: Locator;

  // Action Buttons
  readonly sendRequestButton: Locator;
  readonly clearButton: Locator;

  // reCAPTCHA
  readonly recaptchaIframe: Locator;
  readonly recaptchaAnchor: Locator;

  // Success Toast Notification
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation & Breadcrumbs
    this.navLink = page.getByRole('link', { name: /^Book Request Form$/i })
      .or(page.locator('nav, .navbar, header, .head-menu').locator('a').filter({ hasText: /^Book Request Form$/i }))
      .first();

    this.breadcrumbHomeLink = page.locator('.breadcrumb-container, .breadcrumb')
      .getByRole('link')
      .first();

    this.breadcrumbCurrentPage = page.locator('.breadcrumb-container, .breadcrumb')
      .locator('li')
      .filter({ hasText: /^Book Request Form$/i })
      .first();

    // Headers
    this.pageTitle = page.locator('.staticFormPage-title');
    this.pageDescription = page.locator('.staticFormPage-section-wrapper p').first();

    // Form Inputs
    this.bookTitleInput = page.locator('#journalTitle');
    this.isbnInput = page.locator('#year');
    this.authorInput = page.locator('#author');
    this.volumeInput = page.locator('#volume');
    this.pagesInput = page.locator('#pages');
    this.doiInput = page.locator('#doi');

    // Input Wrappers
    this.bookTitleWrapper = this.bookTitleInput.locator('xpath=..');
    this.authorWrapper = this.authorInput.locator('xpath=..');

    // Action Buttons
    this.sendRequestButton = page.getByRole('button', { name: 'Send request' });
    this.clearButton = page.getByRole('button', { name: 'Clear' });

    // reCAPTCHA
    this.recaptchaIframe = page.frameLocator('iframe[title="reCAPTCHA"]').locator('#recaptcha-anchor');
    this.recaptchaAnchor = page.frameLocator('iframe[title="reCAPTCHA"]').locator('#recaptcha-anchor');

    // Success Toast Notification
    this.successToast = page.locator('.swal2-title');
  }

  /**
   * Navigate directly to Book Request URL
   */
  async goto(): Promise<void> {
    const portalUrl = process.env.PORTAL_URL;
    if (!portalUrl) throw new Error('PORTAL_URL is not defined in .env');

    if (this.page.url().includes('/custom/bookrequestform') && await this.pageTitle.isVisible()) {
      if (await this.clearButton.isVisible()) {
        await this.clickClearButton();
      }
      return;
    }

    await this.navigateTo(`${portalUrl}/portal/v2/custom/bookrequestform`);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Navigate via top header menu link
   */
  async navigateViaHeaderLink(): Promise<void> {
    await this.clickElement(this.navLink, 'Book Request Form Header Navigation Link');
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Navigate back to Home via breadcrumb Home link
   */
  async navigateHomeViaBreadcrumb(): Promise<void> {
    await this.clickElement(this.breadcrumbHomeLink, 'Breadcrumb Home Link');
    await this.page.waitForURL(url => url.href.includes('/home'), { timeout: 15000 });
  }

  /**
   * Fill available fields in Book Request Form
   */
  async fillBookRequest(data: BookRequestData): Promise<void> {
    if (data.bookTitle !== undefined) {
      await this.fillText(this.bookTitleInput, data.bookTitle, 'Book Title Field');
    }
    if (data.isbn !== undefined) {
      await this.fillText(this.isbnInput, data.isbn, 'ISBN Field');
    }
    if (data.author !== undefined) {
      await this.fillText(this.authorInput, data.author, 'Author Field');
    }
    if (data.volume !== undefined) {
      await this.fillText(this.volumeInput, data.volume, 'Edition Field');
    }
    if (data.pages !== undefined) {
      await this.fillText(this.pagesInput, data.pages, 'Chapter / Pages Field');
    }
    if (data.doi !== undefined) {
      await this.fillText(this.doiInput, data.doi, 'DOI Field');
    }
  }

  /**
   * Get all current form values
   */
  async getFormValues(): Promise<BookRequestData> {
    return {
      bookTitle: await this.bookTitleInput.inputValue(),
      isbn: await this.isbnInput.inputValue(),
      author: await this.authorInput.inputValue(),
      volume: await this.volumeInput.inputValue(),
      pages: await this.pagesInput.inputValue(),
      doi: await this.doiInput.inputValue()
    };
  }

  /**
   * Click Clear button
   */
  async clickClearButton(): Promise<void> {
    await this.clickElement(this.clearButton, 'Clear Button');
  }

  /**
   * Check if Send Request button is disabled
   */
  async isSendRequestButtonDisabled(): Promise<boolean> {
    return await this.sendRequestButton.isDisabled();
  }

  /**
   * Reload current page and wait for title
   */
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify all core elements are present on the page
   */
  async verifyFormElements(expectedTitle: string, expectedDesc: string): Promise<void> {
    await expect(this.pageTitle).toHaveText(expectedTitle);
    await expect(this.pageDescription).toHaveText(expectedDesc);
    await expect(this.bookTitleInput).toBeVisible();
    await expect(this.isbnInput).toBeVisible();
    await expect(this.authorInput).toBeVisible();
    await expect(this.volumeInput).toBeVisible();
    await expect(this.pagesInput).toBeVisible();
    await expect(this.doiInput).toBeVisible();
    await expect(this.sendRequestButton).toBeVisible();
    await expect(this.clearButton).toBeVisible();
  }

  /**
   * Handle reCAPTCHA verification on Book Request Form
   */
  async handleCaptcha(token?: string): Promise<void> {
    await this.handleGoogleRecaptcha(token);
  }

  /**
   * Click the Send request button
   */
  async clickSendRequestButton(): Promise<void> {
    await this.clickElement(this.sendRequestButton, 'Send Request Button');
  }

  /**
   * Complete book request submission by handling captcha and clicking send button
   */
  async submitBookRequest(token?: string): Promise<void> {
    await this.handleCaptcha(token);
    await this.clickSendRequestButton();
  }

  /**
   * Wait for success toast to be visible and return its message text
   */
  async getSuccessMessage(): Promise<string> {
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
    return (await this.successToast.innerText()).trim();
  }
}

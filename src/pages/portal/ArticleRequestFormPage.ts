import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface ArticleRequestData {
  journalTitle?: string;
  year?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  author?: string;
  articleTitle?: string;
}

export class ArticleRequestFormPage extends BasePage {
  readonly navLink: Locator;
  readonly breadcrumbHomeLink: Locator;
  readonly breadcrumbCurrentPage: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Form Inputs
  readonly journalTitleInput: Locator;
  readonly yearInput: Locator;
  readonly volumeInput: Locator;
  readonly issueInput: Locator;
  readonly pagesInput: Locator;
  readonly doiInput: Locator;
  readonly authorInput: Locator;
  readonly articleTitleInput: Locator;

  // Input Container Wrappers (for testing required class)
  readonly journalTitleWrapper: Locator;
  readonly authorWrapper: Locator;
  readonly articleTitleWrapper: Locator;

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
    this.navLink = page.getByRole('link', { name: /^Article Request Form$/i })
      .or(page.locator('nav, .navbar, header, .head-menu').locator('a').filter({ hasText: /^Article Request Form$/i }))
      .first();

    this.breadcrumbHomeLink = page.locator('.breadcrumb-container, .breadcrumb')
      .getByRole('link')
      .first();

    this.breadcrumbCurrentPage = page.locator('.breadcrumb-container, .breadcrumb')
      .locator('li')
      .filter({ hasText: /^Article Request Form$/i })
      .first();

    // Headers
    this.pageTitle = page.locator('.staticFormPage-title');
    this.pageDescription = page.locator('.staticFormPage-section-wrapper p').first();

    // Form Inputs
    this.journalTitleInput = page.locator('#journalTitle');
    this.yearInput = page.locator('#year');
    this.volumeInput = page.locator('#volume');
    this.issueInput = page.locator('#issue');
    this.pagesInput = page.locator('#pages');
    this.doiInput = page.locator('#doi');
    this.authorInput = page.locator('#author');
    this.articleTitleInput = page.locator('#articleTitle');

    // Input Wrappers
    this.journalTitleWrapper = this.journalTitleInput.locator('xpath=..');
    this.authorWrapper = this.authorInput.locator('xpath=..');
    this.articleTitleWrapper = this.articleTitleInput.locator('xpath=..');

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
   * Navigate directly to Article Request URL
   */
  async goto(): Promise<void> {
    const portalUrl = process.env.PORTAL_URL;
    if (!portalUrl) throw new Error('PORTAL_URL is not defined in .env');

    if (this.page.url().includes('/custom/articlerequest') && await this.pageTitle.isVisible()) {
      if (await this.clearButton.isVisible()) {
        await this.clickClearButton();
      }
      return;
    }

    await this.navigateTo(`${portalUrl}/portal/v2/custom/articlerequest`);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Navigate via top header menu link
   */
  async navigateViaHeaderLink(): Promise<void> {
    await this.clickElement(this.navLink, 'Article Request Form Header Navigation Link');
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
   * Fill available fields in Article Request Form
   */
  async fillArticleRequest(data: ArticleRequestData): Promise<void> {
    if (data.journalTitle !== undefined) {
      await this.fillText(this.journalTitleInput, data.journalTitle, 'Publication Field');
    }
    if (data.year !== undefined) {
      await this.fillText(this.yearInput, data.year, 'Publication Year Field');
    }
    if (data.volume !== undefined) {
      await this.fillText(this.volumeInput, data.volume, 'Volume Field');
    }
    if (data.issue !== undefined) {
      await this.fillText(this.issueInput, data.issue, 'Issue Field');
    }
    if (data.pages !== undefined) {
      await this.fillText(this.pagesInput, data.pages, 'Pages Field');
    }
    if (data.doi !== undefined) {
      await this.fillText(this.doiInput, data.doi, 'DOI Field');
    }
    if (data.author !== undefined) {
      await this.fillText(this.authorInput, data.author, 'Author Field');
    }
    if (data.articleTitle !== undefined) {
      await this.fillText(this.articleTitleInput, data.articleTitle, 'Article Title Field');
    }
  }

  /**
   * Get all current form values
   */
  async getFormValues(): Promise<ArticleRequestData> {
    return {
      journalTitle: await this.journalTitleInput.inputValue(),
      year: await this.yearInput.inputValue(),
      volume: await this.volumeInput.inputValue(),
      issue: await this.issueInput.inputValue(),
      pages: await this.pagesInput.inputValue(),
      doi: await this.doiInput.inputValue(),
      author: await this.authorInput.inputValue(),
      articleTitle: await this.articleTitleInput.inputValue()
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
    await expect(this.journalTitleInput).toBeVisible();
    await expect(this.yearInput).toBeVisible();
    await expect(this.volumeInput).toBeVisible();
    await expect(this.issueInput).toBeVisible();
    await expect(this.pagesInput).toBeVisible();
    await expect(this.doiInput).toBeVisible();
    await expect(this.authorInput).toBeVisible();
    await expect(this.articleTitleInput).toBeVisible();
    await expect(this.sendRequestButton).toBeVisible();
    await expect(this.clearButton).toBeVisible();
  }

  /**
   * Handle reCAPTCHA verification on Article Request Form
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
   * Complete article request submission by handling captcha and clicking send button
   */
  async submitArticleRequest(token?: string): Promise<void> {
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


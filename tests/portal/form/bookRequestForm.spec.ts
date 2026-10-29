import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { BookRequestFormPage } from '../../../src/pages/portal/BookRequestFormPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';
import bookData from '../../test-data/bookRequestFormData.json';

test.describe.serial('Portal Book Request Form - Functional & UI Validation', () => {
  let sharedPage: Page;
  let bookRequestFormPage: BookRequestFormPage;

  test.beforeAll(async ({ browser }) => {
    // Setup Admin API state ONCE to ensure clean precondition
    const adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({
      twoFactorAuth: false,
      automatedVerification: true,
      mandatoryFields: { isMandatory: false, fields: [] }
    });
    await adminApi.close();

    // Launch browser context and login ONCE
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    sharedPage = await context.newPage();

    const portalLoginPage = new PortalLoginPage(sharedPage);
    bookRequestFormPage = new BookRequestFormPage(sharedPage);

    await portalLoginPage.login(
      process.env.TC_USER_EMAIL as string,
      process.env.TC_USER_PASSWORD as string
    );
    await sharedPage.waitForURL(url => !url.href.includes('/login'), { timeout: 20000 }).catch(() => {});
    await sharedPage.waitForLoadState('domcontentloaded');
    await bookRequestFormPage.goto();
  });

  test.beforeEach(async () => {
    await bookRequestFormPage.goto();
  });

  // ============================================================
  // 1. UI INTEGRITY & LABELS
  // ============================================================

  test('TC_BookRequest_001 - Should render all Book Request Form UI elements and headers correctly @smoke @regression', async () => {
    await bookRequestFormPage.verifyFormElements(bookData.pageTitle, bookData.pageDescription);

    const isSendDisabled = await bookRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);

    await expect(bookRequestFormPage.clearButton).toBeEnabled();
    await expect(bookRequestFormPage.breadcrumbCurrentPage).toHaveText(bookData.breadcrumbTitle);
  });

  // ============================================================
  // 2. FILLING MANDATORY & OPTIONAL FIELDS
  // ============================================================

  test('TC_BookRequest_002 - Should populate all book request form fields with valid citation data @smoke @regression', async () => {
    await bookRequestFormPage.fillBookRequest(bookData.validBook);

    const values = await bookRequestFormPage.getFormValues();
    expect(values.bookTitle).toBe(bookData.validBook.bookTitle);
    expect(values.isbn).toBe(bookData.validBook.isbn);
    expect(values.author).toBe(bookData.validBook.author);
    expect(values.volume).toBe(bookData.validBook.volume);
    expect(values.pages).toBe(bookData.validBook.pages);
    expect(values.doi).toBe(bookData.validBook.doi);
  });

  // ============================================================
  // 3. CLEAR BUTTON FUNCTIONALITY
  // ============================================================

  test('TC_BookRequest_003 - Should reset all form inputs and disable submit when clicking Clear button @smoke @regression', async () => {
    await bookRequestFormPage.fillBookRequest(bookData.validBook);

    // Click Clear
    await bookRequestFormPage.clickClearButton();

    // Verify all input fields are reset to empty
    const clearedValues = await bookRequestFormPage.getFormValues();
    expect(clearedValues.bookTitle).toBe('');
    expect(clearedValues.isbn).toBe('');
    expect(clearedValues.author).toBe('');
    expect(clearedValues.volume).toBe('');
    expect(clearedValues.pages).toBe('');
    expect(clearedValues.doi).toBe('');

    // Ensure Send request button remains disabled
    const isSendDisabled = await bookRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  // ============================================================
  // 4. OVERWRITING & DIRECT EDITING
  // ============================================================

  test('TC_BookRequest_004 - Should allow modifying form values directly without clearing @regression', async () => {
    await bookRequestFormPage.fillBookRequest(bookData.validBook);

    // Overwrite with special character values directly
    await bookRequestFormPage.fillBookRequest(bookData.specialCharBook);

    const updatedValues = await bookRequestFormPage.getFormValues();
    expect(updatedValues.bookTitle).toBe(bookData.specialCharBook.bookTitle);
    expect(updatedValues.isbn).toBe(bookData.specialCharBook.isbn);
    expect(updatedValues.author).toBe(bookData.specialCharBook.author);
    expect(updatedValues.volume).toBe(bookData.specialCharBook.volume);
    expect(updatedValues.pages).toBe(bookData.specialCharBook.pages);
    expect(updatedValues.doi).toBe(bookData.specialCharBook.doi);
  });

  // ============================================================
  // 5. SPECIAL CHARACTERS & SYMBOLS VALIDATION
  // ============================================================

  test('TC_BookRequest_005 - Should safely accept special characters, symbols, and punctuation across all inputs @regression', async () => {
    await bookRequestFormPage.fillBookRequest(bookData.specialCharBook);

    const values = await bookRequestFormPage.getFormValues();
    expect(values.bookTitle).toContain('&');
    expect(values.bookTitle).toContain('(');
    expect(values.bookTitle).toContain('[');
    expect(values.isbn).toContain('-');
    expect(values.author).toContain('&');
    expect(values.author).toContain('.');
    expect(values.volume).toContain('.');
    expect(values.pages).toContain('.');
    expect(values.doi).toContain('/');
  });

  // ============================================================
  // 6. INITIAL EMPTY SUBMISSION PREVENTION
  // ============================================================

  test('TC_BookRequest_006 - Should prevent submission when all inputs are completely empty @smoke @regression', async () => {
    const isSendDisabled = await bookRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
    await expect(bookRequestFormPage.sendRequestButton).toBeDisabled();
  });

  // ============================================================
  // 7. HEADER NAVIGATION & BREADCRUMB ROUTING
  // ============================================================

  test('TC_BookRequest_007 - Should navigate to Book Request Form via header menu and return Home via breadcrumbs @regression', async () => {
    // Navigate home via breadcrumb first
    await bookRequestFormPage.navigateHomeViaBreadcrumb();
    expect(sharedPage.url()).toContain('/portal/v2/default/home');

    // Click Book Request Form link in header menu
    await bookRequestFormPage.navigateViaHeaderLink();
    expect(sharedPage.url()).toContain('/portal/v2/custom/bookrequestform');
    await expect(bookRequestFormPage.pageTitle).toBeVisible();

    // Return home via breadcrumb
    await bookRequestFormPage.navigateHomeViaBreadcrumb();
    expect(sharedPage.url()).toContain('/portal/v2/default/home');
  });

  // ============================================================
  // 8. RELOAD STATE RESILIENCE
  // ============================================================

  test('TC_BookRequest_008 - Should reset all form inputs when page is reloaded @regression', async () => {
    await bookRequestFormPage.fillBookRequest(bookData.validBook);

    // Reload page
    await bookRequestFormPage.reload();

    const values = await bookRequestFormPage.getFormValues();
    expect(values.bookTitle).toBe('');
    expect(values.isbn).toBe('');
    expect(values.author).toBe('');
    expect(values.volume).toBe('');
    expect(values.pages).toBe('');
    expect(values.doi).toBe('');

    const isSendDisabled = await bookRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  // ============================================================
  // 9. BOOK TITLE FIELD VALIDATIONS
  // ============================================================

  test('TC_BookRequest_009 - Book Title Field: Positive validation with standard and technical book titles @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ bookTitle: bookData.fieldValidation.bookTitle.valid });
    let values = await bookRequestFormPage.getFormValues();
    expect(values.bookTitle).toBe(bookData.fieldValidation.bookTitle.valid);

    await bookRequestFormPage.fillBookRequest({ bookTitle: bookData.fieldValidation.bookTitle.special });
    values = await bookRequestFormPage.getFormValues();
    expect(values.bookTitle).toBe(bookData.fieldValidation.bookTitle.special);
  });

  test('TC_BookRequest_010 - Book Title Field: Negative validation with whitespace only keeps send disabled @regression', async () => {
    await bookRequestFormPage.fillBookRequest({
      bookTitle: bookData.whitespaceOnly,
      author: bookData.fieldValidation.author.valid
    });

    const isSendDisabled = await bookRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  test('TC_BookRequest_011 - Book Title Field: Boundary validation with over-limit characters is truncated at 101 @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ bookTitle: bookData.overLimitTitle });

    const values = await bookRequestFormPage.getFormValues();
    expect(values.bookTitle?.length).toBe(101);
    expect(values.bookTitle).toBe(bookData.expectedTruncatedTitle101);
  });

  // ============================================================
  // 10. AUTHOR FIELD VALIDATIONS
  // ============================================================

  test('TC_BookRequest_012 - Author Field: Positive validation with standard and punctuated author names @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ author: bookData.fieldValidation.author.valid });
    let values = await bookRequestFormPage.getFormValues();
    expect(values.author).toBe(bookData.fieldValidation.author.valid);

    await bookRequestFormPage.fillBookRequest({ author: bookData.fieldValidation.author.special });
    values = await bookRequestFormPage.getFormValues();
    expect(values.author).toBe(bookData.fieldValidation.author.special);
  });

  test('TC_BookRequest_013 - Author Field: Negative validation with whitespace only keeps send disabled @regression', async () => {
    await bookRequestFormPage.fillBookRequest({
      bookTitle: bookData.fieldValidation.bookTitle.valid,
      author: bookData.whitespaceOnly
    });

    const isSendDisabled = await bookRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  test('TC_BookRequest_014 - Author Field: Boundary validation with over-limit characters is truncated at 101 @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ author: bookData.overLimitTitle });

    const values = await bookRequestFormPage.getFormValues();
    expect(values.author?.length).toBe(101);
    expect(values.author).toBe(bookData.expectedTruncatedTitle101);
  });

  // ============================================================
  // 11. ISBN FIELD VALIDATIONS
  // ============================================================

  test('TC_BookRequest_015 - ISBN Field: Positive validation with 10-digit and 13-digit ISBN formats @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ isbn: bookData.fieldValidation.isbn.valid });
    let values = await bookRequestFormPage.getFormValues();
    expect(values.isbn).toBe(bookData.fieldValidation.isbn.valid);

    await bookRequestFormPage.fillBookRequest({ isbn: bookData.fieldValidation.isbn.tenDigit });
    values = await bookRequestFormPage.getFormValues();
    expect(values.isbn).toBe(bookData.fieldValidation.isbn.tenDigit);
  });

  test('TC_BookRequest_016 - ISBN Field: Boundary validation with over-limit characters is truncated at 100 @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ isbn: bookData.overLimitYear100 });

    const values = await bookRequestFormPage.getFormValues();
    expect(values.isbn?.length).toBe(100);
    expect(values.isbn).toBe(bookData.expectedTruncatedYear100);
  });

  // ============================================================
  // 12. EDITION (VOLUME) & CHAPTER/PAGES FIELD VALIDATIONS
  // ============================================================

  test('TC_BookRequest_017 - Edition Field: Positive validation for book edition @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ volume: bookData.fieldValidation.volume.valid });
    const values = await bookRequestFormPage.getFormValues();
    expect(values.volume).toBe(bookData.fieldValidation.volume.valid);
  });

  test('TC_BookRequest_018 - Chapter / Pages Field: Positive validation for requested chapters and page ranges @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ pages: bookData.fieldValidation.pages.valid });
    const values = await bookRequestFormPage.getFormValues();
    expect(values.pages).toBe(bookData.fieldValidation.pages.valid);
  });

  // ============================================================
  // 13. DOI FIELD VALIDATION
  // ============================================================

  test('TC_BookRequest_019 - DOI Field: Positive validation for standard DOI strings @regression', async () => {
    await bookRequestFormPage.fillBookRequest({ doi: bookData.fieldValidation.doi.valid });
    const values = await bookRequestFormPage.getFormValues();
    expect(values.doi).toBe(bookData.fieldValidation.doi.valid);
  });

  // ============================================================
  // 14. MANDATORY VS OPTIONAL COMBINATIONS
  // ============================================================

  test('TC_BookRequest_020 - Minimal Mandatory Subset: Positive validation omitting all 4 optional fields @regression', async () => {
    await bookRequestFormPage.fillBookRequest(bookData.minimalMandatoryBook);

    const values = await bookRequestFormPage.getFormValues();
    expect(values.bookTitle).toBe(bookData.minimalMandatoryBook.bookTitle);
    expect(values.author).toBe(bookData.minimalMandatoryBook.author);

    // Optional fields remain empty
    expect(values.isbn).toBe('');
    expect(values.volume).toBe('');
    expect(values.pages).toBe('');
    expect(values.doi).toBe('');
  });

  test('TC_BookRequest_021 - Missing Mandatory Field: Negative validation when Author is omitted with optional fields filled @regression', async () => {
    await bookRequestFormPage.fillBookRequest({
      bookTitle: bookData.validBook.bookTitle,
      isbn: bookData.validBook.isbn,
      volume: bookData.validBook.volume,
      pages: bookData.validBook.pages,
      doi: bookData.validBook.doi
    });

    const isSendDisabled = await bookRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  test('TC_BookRequest_022 - Missing Mandatory Field: Negative validation when Book Title is omitted with optional fields filled @regression', async () => {
    await bookRequestFormPage.fillBookRequest({
      author: bookData.validBook.author,
      isbn: bookData.validBook.isbn,
      volume: bookData.validBook.volume,
      pages: bookData.validBook.pages,
      doi: bookData.validBook.doi
    });

    const isSendDisabled = await bookRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  // ============================================================
  // 15. RECAPTCHA RESOLUTION, SUBMISSION & YOPMAIL VERIFICATION
  // ============================================================

  test('TC_BookRequest_023 - Should handle reCAPTCHA verification, enable send button, submit book request, and verify confirmation email on Yopmail @smoke @regression', async () => {
    // Fill all valid book request fields
    await bookRequestFormPage.fillBookRequest(bookData.validBook);

    // Verify send button is initially disabled before reCAPTCHA
    expect(await bookRequestFormPage.isSendRequestButtonDisabled()).toBe(true);

    // Resolve reCAPTCHA
    await bookRequestFormPage.handleCaptcha();

    // Verify send button becomes enabled
    await expect(bookRequestFormPage.sendRequestButton).toBeEnabled();

    // Submit book request
    await bookRequestFormPage.clickSendRequestButton();

    // Verify success toast notification
    const successMsg = await bookRequestFormPage.getSuccessMessage();
    expect(successMsg).toBe(bookData.expectedSuccessMessage);

    // Verify confirmation email on Yopmail
    const userEmail = process.env.TC_USER_EMAIL || 'prant3@yopmail.com';
    const yopmailTab = await sharedPage.context().newPage();
    try {
      const yopmailPage = new YopmailPage(yopmailTab);
      const emailTitle = await yopmailPage.getLatestEmailTitle(userEmail, bookData.expectedEmailSubjectPattern);
      expect(emailTitle.toLowerCase()).toContain(bookData.expectedEmailSubjectPattern.toLowerCase());
    } finally {
      await yopmailTab.close();
    }
  });
});

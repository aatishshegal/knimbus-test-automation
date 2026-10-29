import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { ArticleRequestFormPage } from '../../../src/pages/portal/ArticleRequestFormPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';
import articleData from '../../test-data/articleRequestFormData.json';

test.describe.serial('Portal Article Request Form - Functional & UI Validation', () => {
  let sharedPage: Page;
  let articleRequestFormPage: ArticleRequestFormPage;

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
    articleRequestFormPage = new ArticleRequestFormPage(sharedPage);

    await portalLoginPage.login(
      process.env.TC_USER_EMAIL as string,
      process.env.TC_USER_PASSWORD as string
    );
    await sharedPage.waitForURL(url => !url.href.includes('/login'), { timeout: 20000 }).catch(() => { });
    await sharedPage.waitForLoadState('domcontentloaded');
    await articleRequestFormPage.goto();
  });

  test.beforeEach(async () => {
    await articleRequestFormPage.goto();
  });

  // ============================================================
  // 1. UI INTEGRITY & LABELS
  // ============================================================

  test('TC_ArticleRequest_001 - Should render all Article Request Form UI elements and headers correctly @smoke @regression', async () => {
    await articleRequestFormPage.verifyFormElements(articleData.pageTitle, articleData.pageDescription);

    const isSendDisabled = await articleRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);

    await expect(articleRequestFormPage.clearButton).toBeEnabled();
    await expect(articleRequestFormPage.breadcrumbCurrentPage).toHaveText(articleData.breadcrumbTitle);
  });

  // ============================================================
  // 2. FILLING MANDATORY & OPTIONAL FIELDS
  // ============================================================

  test('TC_ArticleRequest_002 - Should allow filling all mandatory and optional fields @regression', async () => {
    await articleRequestFormPage.fillArticleRequest(articleData.validArticle);

    const currentValues = await articleRequestFormPage.getFormValues();
    expect(currentValues.journalTitle).toBe(articleData.validArticle.journalTitle);
    expect(currentValues.year).toBe(articleData.validArticle.year);
    expect(currentValues.volume).toBe(articleData.validArticle.volume);
    expect(currentValues.issue).toBe(articleData.validArticle.issue);
    expect(currentValues.pages).toBe(articleData.validArticle.pages);
    expect(currentValues.doi).toBe(articleData.validArticle.doi);
    expect(currentValues.author).toBe(articleData.validArticle.author);
    expect(currentValues.articleTitle).toBe(articleData.validArticle.articleTitle);
  });

  // ============================================================
  // 3. CLEAR BUTTON FUNCTIONALITY
  // ============================================================

  test('TC_ArticleRequest_003 - Should reset all form fields when clicking Clear button @regression', async () => {
    // Fill all form fields
    await articleRequestFormPage.fillArticleRequest(articleData.validArticle);

    // Click Clear
    await articleRequestFormPage.clickClearButton();

    // Verify all fields are empty
    const clearedValues = await articleRequestFormPage.getFormValues();
    expect(clearedValues.journalTitle).toBe('');
    expect(clearedValues.year).toBe('');
    expect(clearedValues.volume).toBe('');
    expect(clearedValues.issue).toBe('');
    expect(clearedValues.pages).toBe('');
    expect(clearedValues.doi).toBe('');
    expect(clearedValues.author).toBe('');
    expect(clearedValues.articleTitle).toBe('');

    const isSendDisabled = await articleRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  // ============================================================
  // 4. MANDATORY FIELD ENFORCEMENT & BUTTON STATE
  // ============================================================

  test('TC_ArticleRequest_004 - Should keep Send request button disabled when mandatory fields are missing @regression', async () => {
    // Initial empty state
    expect(await articleRequestFormPage.isSendRequestButtonDisabled()).toBe(true);

    // Only Publication filled (Author and Title missing)
    await articleRequestFormPage.fillArticleRequest({ journalTitle: articleData.validArticle.journalTitle });
    expect(await articleRequestFormPage.isSendRequestButtonDisabled()).toBe(true);

    // Publication and Author filled (Title missing)
    await articleRequestFormPage.fillArticleRequest({ author: articleData.validArticle.author });
    expect(await articleRequestFormPage.isSendRequestButtonDisabled()).toBe(true);

    // All mandatory fields filled without reCAPTCHA verification
    await articleRequestFormPage.fillArticleRequest({ articleTitle: articleData.validArticle.articleTitle });
    expect(await articleRequestFormPage.isSendRequestButtonDisabled()).toBe(true);
  });

  // ============================================================
  // 5. MAXLENGTH CONSTRAINT & BOUNDARY CHECKS
  // ============================================================

  test('TC_ArticleRequest_005 - Should enforce maxlength restrictions on inputs @regression', async () => {
    // Check maxlength attributes on inputs
    await expect(articleRequestFormPage.journalTitleInput).toHaveAttribute('maxlength', '101');
    await expect(articleRequestFormPage.yearInput).toHaveAttribute('maxlength', '100');
    await expect(articleRequestFormPage.volumeInput).toHaveAttribute('maxlength', '101');
    await expect(articleRequestFormPage.issueInput).toHaveAttribute('maxlength', '101');
    await expect(articleRequestFormPage.pagesInput).toHaveAttribute('maxlength', '101');
    await expect(articleRequestFormPage.doiInput).toHaveAttribute('maxlength', '101');
    await expect(articleRequestFormPage.authorInput).toHaveAttribute('maxlength', '101');
    await expect(articleRequestFormPage.articleTitleInput).toHaveAttribute('maxlength', '101');

    // Attempt to type over-limit string into articleTitle (maxlength 101)
    await articleRequestFormPage.fillArticleRequest({ articleTitle: articleData.overLimitTitle });
    const actualTitle = await articleRequestFormPage.articleTitleInput.inputValue();
    expect(actualTitle.length).toBe(101);
    expect(actualTitle).toBe(articleData.expectedTruncatedTitle101);
  });

  // ============================================================
  // 6. SPECIAL CHARACTERS & COMPLEX DATA
  // ============================================================

  test('TC_ArticleRequest_006 - Should accept special characters and numbers across article fields @regression', async () => {
    await articleRequestFormPage.fillArticleRequest(articleData.specialCharArticle);

    const formValues = await articleRequestFormPage.getFormValues();
    expect(formValues.journalTitle).toBe(articleData.specialCharArticle.journalTitle);
    expect(formValues.year).toBe(articleData.specialCharArticle.year);
    expect(formValues.volume).toBe(articleData.specialCharArticle.volume);
    expect(formValues.issue).toBe(articleData.specialCharArticle.issue);
    expect(formValues.pages).toBe(articleData.specialCharArticle.pages);
    expect(formValues.doi).toBe(articleData.specialCharArticle.doi);
    expect(formValues.author).toBe(articleData.specialCharArticle.author);
    expect(formValues.articleTitle).toBe(articleData.specialCharArticle.articleTitle);
  });

  // ============================================================
  // 7. HEADER NAVIGATION & BREADCRUMB ROUTING
  // ============================================================

  test('TC_ArticleRequest_007 - Should navigate to Article Request Form via header menu and return Home via breadcrumbs @regression', async () => {
    // Navigate to Home via breadcrumb
    await articleRequestFormPage.navigateHomeViaBreadcrumb();
    expect(sharedPage.url()).toContain('/portal/v2/default/home');

    // Click Article Request Form link in header menu
    await articleRequestFormPage.navigateViaHeaderLink();
    expect(sharedPage.url()).toContain('/portal/v2/custom/articlerequest');
    await expect(articleRequestFormPage.pageTitle).toBeVisible();

    // Return to Home via breadcrumb
    await articleRequestFormPage.navigateHomeViaBreadcrumb();
    expect(sharedPage.url()).toContain('/portal/v2/default/home');
  });

  // ============================================================
  // 8. PAGE RELOAD STATE RESILIENCE
  // ============================================================

  test('TC_ArticleRequest_008 - Should reset all form inputs when page is reloaded @regression', async () => {
    // Fill all form fields
    await articleRequestFormPage.fillArticleRequest(articleData.validArticle);

    // Reload page
    await articleRequestFormPage.reload();

    // Verify pristine state restored
    const reloadedValues = await articleRequestFormPage.getFormValues();
    expect(reloadedValues.journalTitle).toBe('');
    expect(reloadedValues.year).toBe('');
    expect(reloadedValues.volume).toBe('');
    expect(reloadedValues.issue).toBe('');
    expect(reloadedValues.pages).toBe('');
    expect(reloadedValues.doi).toBe('');
    expect(reloadedValues.author).toBe('');
    expect(reloadedValues.articleTitle).toBe('');

    const isSendDisabled = await articleRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  // ============================================================
  // 9. REQUIRED FIELD INDICATORS
  // ============================================================

  test('TC_ArticleRequest_009 - Should identify required field indicators on mandatory inputs @regression', async () => {
    // The mandatory inputs are Publication, Author, and Title
    await expect(articleRequestFormPage.journalTitleWrapper).toHaveClass(/required/);
    await expect(articleRequestFormPage.authorWrapper).toHaveClass(/required/);
    await expect(articleRequestFormPage.articleTitleWrapper).toHaveClass(/required/);

    // Optional fields should NOT have required class
    await expect(articleRequestFormPage.yearInput.locator('xpath=..')).not.toHaveClass(/required/);
    await expect(articleRequestFormPage.volumeInput.locator('xpath=..')).not.toHaveClass(/required/);
    await expect(articleRequestFormPage.issueInput.locator('xpath=..')).not.toHaveClass(/required/);
    await expect(articleRequestFormPage.pagesInput.locator('xpath=..')).not.toHaveClass(/required/);
    await expect(articleRequestFormPage.doiInput.locator('xpath=..')).not.toHaveClass(/required/);
  });

  // ============================================================
  // 10. FIELD VALIDATION: PUBLICATION (JOURNAL TITLE)
  // ============================================================

  test('TC_ArticleRequest_010 - Publication Field: Positive validation with standard and special characters @regression', async () => {
    // Standard publication title
    await articleRequestFormPage.fillArticleRequest({ journalTitle: articleData.fieldValidation.publication.valid });
    expect(await articleRequestFormPage.journalTitleInput.inputValue()).toBe(articleData.fieldValidation.publication.valid);

    // Publication title with special characters & punctuation
    await articleRequestFormPage.fillArticleRequest({ journalTitle: articleData.fieldValidation.publication.special });
    expect(await articleRequestFormPage.journalTitleInput.inputValue()).toBe(articleData.fieldValidation.publication.special);
  });

  test('TC_ArticleRequest_011 - Publication Field: Negative validation with whitespace only keeps send disabled @regression', async () => {
    // Fill Author and Title with valid values, but Publication with only whitespace
    await articleRequestFormPage.fillArticleRequest({
      journalTitle: articleData.whitespaceOnly,
      author: articleData.fieldValidation.author.valid,
      articleTitle: articleData.fieldValidation.articleTitle.valid
    });

    const isSendDisabled = await articleRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  test('TC_ArticleRequest_012 - Publication Field: Negative validation with over-limit characters is truncated at 101 @regression', async () => {
    await articleRequestFormPage.fillArticleRequest({ journalTitle: articleData.overLimitTitle });
    const actualValue = await articleRequestFormPage.journalTitleInput.inputValue();
    expect(actualValue.length).toBe(101);
    expect(actualValue).toBe(articleData.expectedTruncatedTitle101);
  });

  // ============================================================
  // 11. FIELD VALIDATION: AUTHOR
  // ============================================================

  test('TC_ArticleRequest_013 - Author Field: Positive validation with standard and punctuated names @regression', async () => {
    // Standard author name
    await articleRequestFormPage.fillArticleRequest({ author: articleData.fieldValidation.author.valid });
    expect(await articleRequestFormPage.authorInput.inputValue()).toBe(articleData.fieldValidation.author.valid);

    // Author name with hyphen, apostrophe, and initials
    await articleRequestFormPage.fillArticleRequest({ author: articleData.fieldValidation.author.special });
    expect(await articleRequestFormPage.authorInput.inputValue()).toBe(articleData.fieldValidation.author.special);
  });

  test('TC_ArticleRequest_014 - Author Field: Negative validation with whitespace only keeps send disabled @regression', async () => {
    // Fill Publication and Title with valid values, but Author with only whitespace
    await articleRequestFormPage.fillArticleRequest({
      journalTitle: articleData.fieldValidation.publication.valid,
      author: articleData.whitespaceOnly,
      articleTitle: articleData.fieldValidation.articleTitle.valid
    });

    const isSendDisabled = await articleRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  test('TC_ArticleRequest_015 - Author Field: Negative validation with over-limit characters is truncated at 101 @regression', async () => {
    await articleRequestFormPage.fillArticleRequest({ author: articleData.overLimitTitle });
    const actualValue = await articleRequestFormPage.authorInput.inputValue();
    expect(actualValue.length).toBe(101);
    expect(actualValue).toBe(articleData.expectedTruncatedTitle101);
  });

  // ============================================================
  // 12. FIELD VALIDATION: ARTICLE TITLE
  // ============================================================

  test('TC_ArticleRequest_016 - Article Title Field: Positive validation with standard and technical titles @regression', async () => {
    // Standard article title
    await articleRequestFormPage.fillArticleRequest({ articleTitle: articleData.fieldValidation.articleTitle.valid });
    expect(await articleRequestFormPage.articleTitleInput.inputValue()).toBe(articleData.fieldValidation.articleTitle.valid);

    // Title with punctuation, symbols, and year
    await articleRequestFormPage.fillArticleRequest({ articleTitle: articleData.fieldValidation.articleTitle.special });
    expect(await articleRequestFormPage.articleTitleInput.inputValue()).toBe(articleData.fieldValidation.articleTitle.special);
  });

  test('TC_ArticleRequest_017 - Article Title Field: Negative validation with whitespace only keeps send disabled @regression', async () => {
    // Fill Publication and Author with valid values, but Title with only whitespace
    await articleRequestFormPage.fillArticleRequest({
      journalTitle: articleData.fieldValidation.publication.valid,
      author: articleData.fieldValidation.author.valid,
      articleTitle: articleData.whitespaceOnly
    });

    const isSendDisabled = await articleRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  // ============================================================
  // 13. FIELD VALIDATION: PUBLICATION YEAR
  // ============================================================

  test('TC_ArticleRequest_018 - Publication Year Field: Positive validation with standard 4-digit year @regression', async () => {
    await articleRequestFormPage.fillArticleRequest({ year: articleData.fieldValidation.year.valid });
    expect(await articleRequestFormPage.yearInput.inputValue()).toBe(articleData.fieldValidation.year.valid);
  });

  test('TC_ArticleRequest_019 - Publication Year Field: Negative validation with over-limit characters is truncated at 100 @regression', async () => {
    await articleRequestFormPage.fillArticleRequest({ year: articleData.overLimitYear100 });
    const actualValue = await articleRequestFormPage.yearInput.inputValue();
    expect(actualValue.length).toBe(100);
    expect(actualValue).toBe(articleData.expectedTruncatedYear100);
  });

  // ============================================================
  // 14. FIELD VALIDATION: VOLUME, ISSUE, PAGES, DOI
  // ============================================================

  test('TC_ArticleRequest_020 - Volume and Issue Fields: Positive and boundary validation @regression', async () => {
    // Positive validation
    await articleRequestFormPage.fillArticleRequest({
      volume: articleData.fieldValidation.volume.valid,
      issue: articleData.fieldValidation.issue.valid
    });
    expect(await articleRequestFormPage.volumeInput.inputValue()).toBe(articleData.fieldValidation.volume.valid);
    expect(await articleRequestFormPage.issueInput.inputValue()).toBe(articleData.fieldValidation.issue.valid);

    // Negative boundary validation (maxlength 101)
    await articleRequestFormPage.fillArticleRequest({
      volume: articleData.overLimitTitle,
      issue: articleData.overLimitTitle
    });
    expect((await articleRequestFormPage.volumeInput.inputValue()).length).toBe(101);
    expect((await articleRequestFormPage.issueInput.inputValue()).length).toBe(101);
  });

  test('TC_ArticleRequest_021 - Pages and DOI Fields: Positive and boundary validation @regression', async () => {
    // Positive validation
    await articleRequestFormPage.fillArticleRequest({
      pages: articleData.fieldValidation.pages.valid,
      doi: articleData.fieldValidation.doi.valid
    });
    expect(await articleRequestFormPage.pagesInput.inputValue()).toBe(articleData.fieldValidation.pages.valid);
    expect(await articleRequestFormPage.doiInput.inputValue()).toBe(articleData.fieldValidation.doi.valid);

    // Negative boundary validation (maxlength 101)
    await articleRequestFormPage.fillArticleRequest({
      pages: articleData.overLimitTitle,
      doi: articleData.overLimitTitle
    });
    expect((await articleRequestFormPage.pagesInput.inputValue()).length).toBe(101);
    expect((await articleRequestFormPage.doiInput.inputValue()).length).toBe(101);
  });

  // ============================================================
  // 15. COMBINATORIAL SUBMISSION PREREQUISITES
  // ============================================================

  test('TC_ArticleRequest_022 - Minimal Mandatory Subset: Positive validation omitting all 5 optional fields @regression', async () => {
    // Fill ONLY Publication, Author, Title (Year, Volume, Issue, Pages, DOI are empty)
    await articleRequestFormPage.fillArticleRequest(articleData.minimalMandatoryArticle);

    const values = await articleRequestFormPage.getFormValues();
    expect(values.journalTitle).toBe(articleData.minimalMandatoryArticle.journalTitle);
    expect(values.author).toBe(articleData.minimalMandatoryArticle.author);
    expect(values.articleTitle).toBe(articleData.minimalMandatoryArticle.articleTitle);

    // Optional fields remain empty
    expect(values.year).toBe('');
    expect(values.volume).toBe('');
    expect(values.issue).toBe('');
    expect(values.pages).toBe('');
    expect(values.doi).toBe('');
  });

  test('TC_ArticleRequest_023 - Missing Mandatory Field: Negative validation when Author is omitted with optional fields filled @regression', async () => {
    // Fill all fields EXCEPT Author
    await articleRequestFormPage.fillArticleRequest({
      journalTitle: articleData.validArticle.journalTitle,
      year: articleData.validArticle.year,
      volume: articleData.validArticle.volume,
      issue: articleData.validArticle.issue,
      pages: articleData.validArticle.pages,
      doi: articleData.validArticle.doi,
      articleTitle: articleData.validArticle.articleTitle
    });

    const isSendDisabled = await articleRequestFormPage.isSendRequestButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  // ============================================================
  // 16. RECAPTCHA HANDLING & REQUEST SUBMISSION
  // ============================================================

  test('TC_ArticleRequest_024 - Should handle reCAPTCHA verification, enable send button, and successfully submit article request @smoke @regression', async () => {
    // Fill all valid article fields
    await articleRequestFormPage.fillArticleRequest(articleData.validArticle);

    // Verify send button is initially disabled before reCAPTCHA
    expect(await articleRequestFormPage.isSendRequestButtonDisabled()).toBe(true);

    // Resolve reCAPTCHA
    await articleRequestFormPage.handleCaptcha();

    // Verify send button becomes enabled
    await expect(articleRequestFormPage.sendRequestButton).toBeEnabled();

    // Submit article request
    await articleRequestFormPage.clickSendRequestButton();

    // Verify success toast notification
    const successMsg = await articleRequestFormPage.getSuccessMessage();
    expect(successMsg).toBe(articleData.expectedSuccessMessage);

    // Verify email is received on Yopmail and verify email title
    const userEmail = process.env.TC_USER_EMAIL || 'prant3@yopmail.com';
    const yopmailTab = await sharedPage.context().newPage();
    try {
      const yopmailPage = new YopmailPage(yopmailTab);
      const emailTitle = await yopmailPage.getLatestEmailTitle(userEmail, articleData.expectedEmailSubjectPattern);
      expect(emailTitle.toLowerCase()).toContain(articleData.expectedEmailSubjectPattern.toLowerCase());
    } finally {
      await yopmailTab.close();
    }
  });
});


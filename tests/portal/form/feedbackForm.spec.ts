import * as path from 'path';
import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { FeedbackFormPage } from '../../../src/pages/portal/FeedbackFormPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';
import feedbackData from '../../test-data/feedbackFormData.json';

test.describe.serial('Portal Feedback Form - Functional & UI Validation', () => {
  let sharedPage: Page;
  let feedbackFormPage: FeedbackFormPage;

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
    feedbackFormPage = new FeedbackFormPage(sharedPage);

    await portalLoginPage.login(
      process.env.TC_USER_EMAIL as string,
      process.env.TC_USER_PASSWORD as string
    );
    await sharedPage.waitForURL(url => !url.href.includes('/login'), { timeout: 20000 }).catch(() => {});
    await sharedPage.waitForLoadState('domcontentloaded');
    await feedbackFormPage.goto();
  });

  test.beforeEach(async () => {
    await feedbackFormPage.goto();
  });

  // ============================================================
  // 1. UI INTEGRITY & LABELS
  // ============================================================

  test('TC_FeedbackForm_001 - Should render all Feedback Form UI elements and headers correctly @smoke @regression', async () => {
    await feedbackFormPage.verifyFormElements(feedbackData.pageTitle, feedbackData.pageDescription);

    const defaultCounterText = await feedbackFormPage.getRemainingCharactersText();
    expect(defaultCounterText).toBe(feedbackData.defaultRemainingCharacters);

    await expect(feedbackFormPage.fileAttachmentHeading).toHaveText(feedbackData.attachmentInstruction);
    await expect(feedbackFormPage.fileAttachmentFormatHint).toHaveText(feedbackData.attachmentFormats);

    const isSendDisabled = await feedbackFormPage.isSendFeedbackButtonDisabled();
    expect(isSendDisabled).toBe(true);

    await expect(feedbackFormPage.clearButton).toBeEnabled();
    await expect(feedbackFormPage.breadcrumbCurrentPage).toHaveText(feedbackData.feedbackNavTitle);
  });

  // ============================================================
  // 2. CHARACTER COUNTER VALIDATION & INPUT LIMITS
  // ============================================================

  test('TC_FeedbackForm_002 - Should update remaining character count dynamically as user types @regression', async () => {
    // Test dynamic countdown on typing
    await feedbackFormPage.enterFeedback(feedbackData.shortFeedbackMessage);
    const updatedCounterText = await feedbackFormPage.getRemainingCharactersText();
    expect(updatedCounterText).toBe(feedbackData.expectedShortRemainingText);

    // Test exact 250 character boundary limit
    await feedbackFormPage.enterFeedback(feedbackData.exactLimitFeedbackMessage);
    const zeroCounterText = await feedbackFormPage.getRemainingCharactersText();
    expect(zeroCounterText).toBe(feedbackData.expectedZeroRemainingText);

    // Test maxlength truncation on exceeding 250 characters
    await feedbackFormPage.enterFeedback(feedbackData.overLimitFeedbackMessage);
    const actualEnteredValue = await feedbackFormPage.getFeedbackText();
    expect(actualEnteredValue.length).toBe(250);
    expect(actualEnteredValue).toBe(feedbackData.exactLimitFeedbackMessage);
  });

  // ============================================================
  // 3. FILE ATTACHMENT
  // ============================================================

  test('TC_FeedbackForm_003 - Should allow attaching supported image file @regression', async () => {
    const resolvedAttachmentPath = path.resolve(feedbackData.validAttachmentPath);
    await feedbackFormPage.uploadAttachment(resolvedAttachmentPath);

    const uploadedFileName = await feedbackFormPage.getUploadedFileName();
    expect(uploadedFileName).toContain(feedbackData.validAttachmentFileName);
  });

  // ============================================================
  // 4. CLEAR BUTTON FUNCTIONALITY
  // ============================================================

  test('TC_FeedbackForm_004 - Should reset feedback text, character counter, and attached file when clicking Clear @regression', async () => {
    const resolvedAttachmentPath = path.resolve(feedbackData.validAttachmentPath);

    // Fill form fields
    await feedbackFormPage.enterFeedback(feedbackData.shortFeedbackMessage);
    await feedbackFormPage.uploadAttachment(resolvedAttachmentPath);

    // Click Clear
    await feedbackFormPage.clickClearButton();

    // Verify all fields are restored to initial state
    const feedbackTextAfterClear = await feedbackFormPage.getFeedbackText();
    expect(feedbackTextAfterClear).toBe('');

    const counterAfterClear = await feedbackFormPage.getRemainingCharactersText();
    expect(counterAfterClear).toBe(feedbackData.defaultRemainingCharacters);

    const uploadedFileAfterClear = await feedbackFormPage.getUploadedFileName();
    expect(uploadedFileAfterClear).toBe('');

    const isSendDisabledAfterClear = await feedbackFormPage.isSendFeedbackButtonDisabled();
    expect(isSendDisabledAfterClear).toBe(true);
  });

  // ============================================================
  // 5. SUBMIT BUTTON STATE VALIDATION
  // ============================================================

  test('TC_FeedbackForm_005 - Should keep Send feedback button disabled without reCAPTCHA verification @regression', async () => {
    // Initial empty state
    expect(await feedbackFormPage.isSendFeedbackButtonDisabled()).toBe(true);

    // Enter feedback message without completing reCAPTCHA
    await feedbackFormPage.enterFeedback(feedbackData.shortFeedbackMessage);
    expect(await feedbackFormPage.isSendFeedbackButtonDisabled()).toBe(true);
  });

  // ============================================================
  // 6. HEADER NAVIGATION & BREADCRUMB ROUTING
  // ============================================================

  test('TC_FeedbackForm_006 - Should navigate to Feedback Form via header menu and return Home via breadcrumbs @regression', async () => {
    // Navigate back to home first
    await feedbackFormPage.navigateHomeViaBreadcrumb();
    expect(sharedPage.url()).toContain('/portal/v2/default/home');

    // Click Feedback Form in navigation menu
    await feedbackFormPage.navigateViaHeaderLink();
    expect(sharedPage.url()).toContain('/portal/v2/custom/feedbackform');
    await expect(feedbackFormPage.pageTitle).toBeVisible();

    // Return to home via breadcrumb
    await feedbackFormPage.navigateHomeViaBreadcrumb();
    expect(sharedPage.url()).toContain('/portal/v2/default/home');
  });

  // ============================================================
  // 7. INPUT VALIDATIONS (WHITESPACE, SPECIAL CHARACTERS, XSS)
  // ============================================================

  test('TC_FeedbackForm_007 - Should keep Send feedback button disabled when feedback contains only whitespace @regression', async () => {
    await feedbackFormPage.enterFeedback(feedbackData.whitespaceFeedbackMessage);
    const isSendDisabled = await feedbackFormPage.isSendFeedbackButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  test('TC_FeedbackForm_008 - Should accurately count remaining characters for special characters, symbols, and emojis @regression', async () => {
    await feedbackFormPage.enterFeedback(feedbackData.specialCharsAndEmojiMessage);
    const counterText = await feedbackFormPage.getRemainingCharactersText();
    expect(counterText).toBe(feedbackData.expectedSpecialCharsRemainingText);

    const enteredText = await feedbackFormPage.getFeedbackText();
    expect(enteredText).toBe(feedbackData.specialCharsAndEmojiMessage);
  });

  test('TC_FeedbackForm_009 - Should support multi-line feedback with line breaks and count characters properly @regression', async () => {
    await feedbackFormPage.enterFeedback(feedbackData.multilineFeedbackMessage);
    const counterText = await feedbackFormPage.getRemainingCharactersText();
    expect(counterText).toBe(feedbackData.expectedMultilineRemainingText);

    const enteredText = await feedbackFormPage.getFeedbackText();
    expect(enteredText).toBe(feedbackData.multilineFeedbackMessage);
  });

  test('TC_FeedbackForm_010 - Should safely handle HTML and potential script tags as literal text without rendering artifacts @regression', async () => {
    await feedbackFormPage.enterFeedback(feedbackData.xssPayloadMessage);
    const counterText = await feedbackFormPage.getRemainingCharactersText();
    expect(counterText).toBe(feedbackData.expectedXssRemainingText);

    const enteredText = await feedbackFormPage.getFeedbackText();
    expect(enteredText).toBe(feedbackData.xssPayloadMessage);
  });

  // ============================================================
  // 8. ATTACHMENT MULTI-FORMAT & OVERWRITE
  // ============================================================

  test('TC_FeedbackForm_011 - Should support uploading .png format image attachments @regression', async () => {
    const resolvedPngPath = path.resolve(feedbackData.pngAttachmentPath);
    await feedbackFormPage.uploadAttachment(resolvedPngPath);

    const uploadedFileName = await feedbackFormPage.getUploadedFileName();
    expect(uploadedFileName).toContain(feedbackData.pngAttachmentFileName);
  });

  test('TC_FeedbackForm_012 - Should update attachment when selecting a new file directly without clicking Clear @regression', async () => {
    const resolvedJpgPath = path.resolve(feedbackData.validAttachmentPath);
    const resolvedPngPath = path.resolve(feedbackData.pngAttachmentPath);

    // Upload first file
    await feedbackFormPage.uploadAttachment(resolvedJpgPath);
    let currentFileName = await feedbackFormPage.getUploadedFileName();
    expect(currentFileName).toContain(feedbackData.validAttachmentFileName);

    // Overwrite with second file directly
    await feedbackFormPage.uploadAttachment(resolvedPngPath);
    currentFileName = await feedbackFormPage.getUploadedFileName();
    expect(currentFileName).toContain(feedbackData.pngAttachmentFileName);
  });

  // ============================================================
  // 9. STATE RESILIENCE & ACCESSIBILITY ATTRIBUTES
  // ============================================================

  test('TC_FeedbackForm_013 - Should reset form inputs when page is reloaded @regression', async () => {
    const resolvedAttachmentPath = path.resolve(feedbackData.validAttachmentPath);

    // Fill inputs
    await feedbackFormPage.enterFeedback(feedbackData.shortFeedbackMessage);
    await feedbackFormPage.uploadAttachment(resolvedAttachmentPath);

    // Reload page
    await feedbackFormPage.reload();

    // Verify pristine default state restored
    const feedbackTextAfterReload = await feedbackFormPage.getFeedbackText();
    expect(feedbackTextAfterReload).toBe('');

    const counterAfterReload = await feedbackFormPage.getRemainingCharactersText();
    expect(counterAfterReload).toBe(feedbackData.defaultRemainingCharacters);

    const fileAfterReload = await feedbackFormPage.getUploadedFileName();
    expect(fileAfterReload).toBe('');

    const isSendDisabled = await feedbackFormPage.isSendFeedbackButtonDisabled();
    expect(isSendDisabled).toBe(true);
  });

  test('TC_FeedbackForm_014 - Should verify required indicator and accessibility constraints @regression', async () => {
    const maxLength = await feedbackFormPage.getTextareaMaxLength();
    expect(maxLength).toBe('250');

    const requiredIndicator = await feedbackFormPage.getRequiredIndicatorText();
    expect(requiredIndicator).toBe(feedbackData.requiredIndicator);

    await expect(feedbackFormPage.clearButton).toHaveRole('button');
    await expect(feedbackFormPage.sendFeedbackButton).toHaveRole('button');
  });

  // ============================================================
  // 10. RECAPTCHA HANDLING & FORM SUBMISSION
  // ============================================================

  test('TC_FeedbackForm_015 - Should handle reCAPTCHA verification, enable submit button, and successfully submit feedback @smoke @regression', async () => {
    // Fill feedback text
    await feedbackFormPage.enterFeedback(feedbackData.submissionFeedbackMessage);

    // Verify button is initially disabled before reCAPTCHA
    expect(await feedbackFormPage.isSendFeedbackButtonDisabled()).toBe(true);

    // Resolve reCAPTCHA
    await feedbackFormPage.handleCaptcha();

    // Verify Send button becomes enabled
    await expect(feedbackFormPage.sendFeedbackButton).toBeEnabled();

    // Submit feedback
    await feedbackFormPage.clickSendFeedbackButton();

    // Verify success toast notification
    const successMsg = await feedbackFormPage.getSuccessMessage();
    expect(successMsg).toBe(feedbackData.expectedSuccessMessage);

    // Verify email is received on Yopmail and verify email title
    const userEmail = process.env.TC_USER_EMAIL || 'prant3@yopmail.com';
    const yopmailTab = await sharedPage.context().newPage();
    try {
      const yopmailPage = new YopmailPage(yopmailTab);
      const emailTitle = await yopmailPage.getLatestEmailTitle(userEmail, feedbackData.expectedEmailSubjectPattern);
      expect(emailTitle.toLowerCase()).toContain(feedbackData.expectedEmailSubjectPattern.toLowerCase());
    } finally {
      await yopmailTab.close();
    }
  });
});


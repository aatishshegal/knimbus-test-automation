import { test, expect } from '../../../src/fixtures';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import path from 'path';

test.describe('Portal Authentication - Registration Flows', () => {

  test('User registers without OTP, sees welcome page, and lands on home', async ({
    page,
    portalLoginPage,
    registrationPage,
    welcomePage,
    homePage,
    registrationTestContext
  }) => {
    // 1. Arrange - Setup Admin preconditions via fixture (handled automatically)
    // 2. Act - Navigate to portal
    const url = process.env.PORTAL_URL;
    if (!url) throw new Error('PORTAL_URL is not defined in .env');

    await portalLoginPage.navigateTo(url);

    // Click "Sign In"
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');

    // Click "Sign Up" inside the modal
    await portalLoginPage.clickElement(portalLoginPage.signUpLink, 'Sign Up Link');

    // Wait for the registration page to appear
    await expect(registrationPage.registrationPageIdentifier).toBeVisible();

    // Fill registration details using the fixture context
    await registrationPage.fillRegistration(
      registrationTestContext.fullName,
      registrationTestContext.email,
      registrationTestContext.password
    );

    // Accept T&C
    await registrationPage.acceptTermsAndConditions();

    if (process.argv.includes('--headed')) {
      await page.waitForTimeout(2000); // Visual pause
    }

    // Submit registration
    await registrationPage.submitRegistration();

    // 3. Assert & Act: Welcome Page
    console.log('[Test] Waiting for Welcome Page...');
    await expect(welcomePage.welcomePageIdentifier).toBeVisible({ timeout: 15000 });
    await welcomePage.proceedToHome();

    // 4. Assert: Home Page
    console.log('[Test] Waiting for Home Page...');
    await expect(homePage.homePageIdentifier).toBeVisible({ timeout: 15000 });
  });

  test('User registers, verifies via OTP, sees welcome page, and lands on home', async ({
    portalLoginPage,
    registrationPage,
    otpPage,
    welcomePage,
    homePage,
    registrationOtpWelcomeContext,
    page,
    context
  }) => {
    // 1. Arrange - Setup Admin preconditions via fixture (handled automatically)
    // 2. Act - Navigate to portal
    const url = process.env.PORTAL_URL;
    if (!url) throw new Error('PORTAL_URL is not defined in .env');

    // Portal Navigation
    await portalLoginPage.navigateTo(url);

    // Click "Sign In"
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');

    // Click "Sign Up" inside the modal
    await portalLoginPage.clickElement(portalLoginPage.signUpLink, 'Sign Up Link');

    // Wait for the registration page to appear
    await expect(registrationPage.registrationPageIdentifier).toBeVisible();

    // Fill registration details using the fixture context
    const { fullName, email, password } = registrationOtpWelcomeContext;
    await registrationPage.fillRegistration(fullName, email, password);

    // Accept T&C
    await registrationPage.acceptTermsAndConditions();

    // Submit registration
    await registrationPage.submitRegistration();

    // 3. User lands on OTP page
    await expect(otpPage.otpPageIdentifier).toBeVisible({ timeout: 15000 });

    // 4. Open Yopmail in a new tab within the same browser context (mimicking user behavior)
    const newTab = await context.newPage();
    const yopmailPage = new YopmailPage(newTab);
    const otpCode = await yopmailPage.getLatestOtp(email);
    await newTab.close(); // Close the Yopmail tab after getting OTP

    // 5. Fill OTP on the portal page
    await otpPage.submitOtp(otpCode);

    // 6. User lands on Welcome Page
    await expect(welcomePage.welcomePageIdentifier).toBeVisible({ timeout: 15000 });
    await welcomePage.proceedToHome();

    // 7. User lands on Home Page
    await expect(homePage.homePageIdentifier).toBeVisible({ timeout: 15000 });
  });

  test('User registers, lands on mandatory page, fills it, sees welcome page, and lands on home', async ({
    portalLoginPage,
    registrationPage,
    mandatoryDetailsPage,
    welcomePage,
    homePage,
    registrationWithMandatoryContext,
    page
  }) => {
    // 1. Arrange - Setup Admin preconditions via fixture (handled automatically)
    // 2. Act - Navigate to portal
    const url = process.env.PORTAL_URL;
    if (!url) throw new Error('PORTAL_URL is not defined in .env');

    await portalLoginPage.navigateTo(url);

    // Click "Sign In"
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');

    // Click "Sign Up" inside the modal
    await portalLoginPage.clickElement(portalLoginPage.signUpLink, 'Sign Up Link');

    // Wait for the registration page to appear
    await expect(registrationPage.registrationPageIdentifier).toBeVisible();

    // Fill registration details using the fixture context
    const { fullName, email, password } = registrationWithMandatoryContext;
    await registrationPage.fillRegistration(fullName, email, password);

    // Accept T&C
    await registrationPage.acceptTermsAndConditions();

    // Submit registration
    await registrationPage.submitRegistration();

    // 3. User lands on Mandatory Details Page
    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible({ timeout: 15000 });

    // 4. Fill out all the mandatory fields
    const dummyImagePath = path.join(__dirname, '../../test-data', 'dummy-id.jpg');
    const mandatoryData = require('../../test-data/mandatoryUserDetails.json');

    await mandatoryDetailsPage.fillMandatoryFields({
      gender: mandatoryData.gender,
      department: mandatoryData.department,
      degree: mandatoryData.degree,
      designation: mandatoryData.designation,
      batch: mandatoryData.batch,
      nationality: mandatoryData.nationality,
      idDocumentFrontPath: dummyImagePath,
      idDocumentBackPath: dummyImagePath
    });

    await mandatoryDetailsPage.submitForm();

    // 5. User lands on Welcome Page
    await expect(welcomePage.welcomePageIdentifier).toBeVisible({ timeout: 15000 });
    await welcomePage.proceedToHome();

    // 6. User lands on Home Page
    await expect(homePage.homePageIdentifier).toBeVisible({ timeout: 15000 });
  });

  test('User signs up with restricted domain and gets error', async ({
    page,
    portalLoginPage,
    registrationPage
  }) => {
    // API-based Admin Setup - Instant Execution
    const adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({
      selfRegistration: true,
      domainRestriction: ['yopmail.com']
    });
    await adminApi.close();

    // Navigate to portal
    await portalLoginPage.navigateTo(process.env.PORTAL_URL as string);
    await portalLoginPage.clickElement(portalLoginPage.signInPopupTrigger, 'Sign In Popup Trigger');
    await portalLoginPage.clickElement(portalLoginPage.signUpLink, 'Sign Up Link');

    // Registration with gmail
    await expect(registrationPage.registrationPageIdentifier).toBeVisible();

    const timestamp = Date.now();
    const invalidEmail = `testuser_${timestamp}@gmail.com`;

    await registrationPage.fillRegistration(`Test User ${timestamp}`, invalidEmail, 'Test@1234');
    await registrationPage.acceptTermsAndConditions();

    // Submit registration
    await registrationPage.submitRegistration();

    // Verify error
    const expectedError = "The email address that you have provided does not match with the allowed email provider(s) list for this library.";
    const errorLocator = page.getByText(expectedError);
    await expect(errorLocator).toBeVisible({ timeout: 10000 });
  });

  test('User signs up with restricted domain and gets Access Denied error', async ({
    page,
    portalLoginPage,
    registrationPage
  }) => {
    // API-based Admin Setup - Instant Execution
    const adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({
      selfRegistration: true,
      domainRestriction: [], // Clear email domain restrictions
      authDenyPatterns: {
        denialPatterns: ["gmail.com"], // Add gmail.com and remove others
        allowedPatterns: null
      }
    });
    await adminApi.close();

    // 2. then open library portal sydneyuniversity.knimbus.com
    await portalLoginPage.navigateTo(process.env.PORTAL_URL!);

    // 3. click on sign in
    await portalLoginPage.signInPopupTrigger.click();

    // 4. then you will find sign up button
    await portalLoginPage.signUpLink.click();

    // 5. do the user registration using "gmail.com" domain
    const timestamp = Date.now();
    const testEmail = `test_denied_${timestamp}@gmail.com`;

    // Fill registration form
    await registrationPage.fillRegistration('Test Denied', testEmail, process.env.DEFAULT_PASSWORD as string);

    // Handle T&C if present (optional depending on UI)
    try {
      await registrationPage.acceptTermsAndConditions();
    } catch (e) {
      // Ignore if T&C not present
    }

    // Click next or continue button
    await registrationPage.submitRegistration();

    // 6. here it will remain on this page with said error message
    await expect(page.getByText('Access Denied', { exact: true })).toBeVisible({ timeout: 10000 });

    // Verify we are still on the registration page
    await expect(registrationPage.registrationPageIdentifier).toBeVisible();
  });

});

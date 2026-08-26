import { test, expect } from '../../../src/fixtures';
import path from 'path';

test.describe('Portal Authentication - Successful Login Flows', () => {

  test('An existing standard user with no pending mandatory fields and OTP disabled should be routed directly to the Home Page',
    async ({ portalLoginPage, homePage, termsAndConditionUser }) => {

      // 1. Arrange & Act
      await portalLoginPage.login(
        termsAndConditionUser.email,
        termsAndConditionUser.password
      );

      // 2. Assert
      await expect(homePage.homePageIdentifier).toBeVisible();
    });

  test('Verify user navigates through the Login -> Mandatory Details -> Welcome -> Home flow (T&C optional)', async ({
    portalLoginPage,
    mandatoryDetailsPage,
    welcomePage,
    homePage,
    termsAndConditionsModal,
    fullMandatoryDetailsUser,
    page
  }) => {

    // 1. Arrange & Act: Login
    await portalLoginPage.login(
      fullMandatoryDetailsUser.email,
      fullMandatoryDetailsUser.password
    );

    // 2. Assert: Must land on Mandatory Details Page
    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible();

    // 3. Act: Fill out all the mandatory fields
    const dummyImagePath = path.join(__dirname, '../../test-data', 'dummy-id.jpg');

    await mandatoryDetailsPage.fillMandatoryFields({
      gender: 'Other',
      department: 'Engineering',
      degree: 'B.Tech',
      designation: 'QA Engineer',
      batch: '2026',
      nationality: 'India',
      idDocumentFrontPath: dummyImagePath,
      idDocumentBackPath: dummyImagePath
    });

    if (process.argv.includes('--headed')) {
      await page.waitForTimeout(2000);
    }

    await mandatoryDetailsPage.submitForm();

    // 4. Verify Welcome Page
    await page.waitForURL(/.*welcome/, { timeout: 15000 });
    await expect(welcomePage.welcomePageIdentifier).toBeVisible();

    // 5. Click through the Welcome Page
    await welcomePage.proceedToHome();

    // Wait for the Home page to load fully
    await page.waitForLoadState('networkidle');

    // 6. Accept T&C if it pops up on the Home page
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible();

    // 7. Verify we are firmly on the Home Page
    await expect(homePage.homePageIdentifier).toBeVisible({ timeout: 15000 });
  });

});

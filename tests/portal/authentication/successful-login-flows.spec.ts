import { test, expect } from '../../../src/fixtures';
import path from 'path';
import portalData from '../../test-data/portal-data.json';

const mandatoryData = portalData.mandatoryUserDetails;

test.describe('Portal Authentication - Successful Login Flows', () => {

  test('Login Flow - Standard authenticated user without pending mandatory details routes directly to Home page',
    async ({ portalLoginPage, homePage, termsAndConditionUser }) => {
      await portalLoginPage.login(
        termsAndConditionUser.email,
        termsAndConditionUser.password
      );

      await expect(homePage.homePageIdentifier).toBeVisible();
    });

  test('Login Flow - User completing mandatory details routes through welcome page to Home page', async ({
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

    // 3. Act: Fill out all the mandatory fields using central test data
    const dummyImagePath = path.join(__dirname, '../../test-data', 'dummy-id.jpg');

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

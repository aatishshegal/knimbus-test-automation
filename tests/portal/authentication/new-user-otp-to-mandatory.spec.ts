import { test, expect } from '../../../src/fixtures';
import path from 'path';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';
import portalData from '../../test-data/portal-data.json';

const mandatoryData = portalData.mandatoryUserDetails;

test.describe('Portal Authentication - OTP and Mandatory Profile Flow', () => {

  test('Multi-Step Authentication - User completing OTP verification and mandatory details navigates through welcome page', async ({
    portalLoginPage,
    otpPage,
    termsAndConditionsModal,
    mandatoryDetailsPage,
    welcomePage,
    otpAndMandatoryUser,
    page
  }) => {

    // 1. Arrange & Act: Login
    await portalLoginPage.login(
      otpAndMandatoryUser.email,
      otpAndMandatoryUser.password
    );

    // 2. Assert: Must land on OTP Page
    await expect(otpPage.otpPageIdentifier).toBeVisible();

    // 3. Act: Fetch OTP from Yopmail in a new tab
    const context = page.context();
    const newTab = await context.newPage();
    const yopmailPage = new YopmailPage(newTab);
    const otpCode = await yopmailPage.getLatestOtp(otpAndMandatoryUser.email);

    await newTab.close();

    // Submit the extracted OTP
    await otpPage.submitOtp(otpCode);
    await page.waitForLoadState('networkidle');

    // After OTP, T&C might appear before we reach the Mandatory form
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible();

    // 4. Verify routing to Mandatory Details Page after successful OTP
    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible({ timeout: 15000 });

    // 5. Act: Fill out all the mandatory fields using central test data
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

    // 6. Verify Welcome Page
    await page.waitForURL(/.*welcome/, { timeout: 15000 });
    await expect(welcomePage.welcomePageIdentifier).toBeVisible();
  });

});

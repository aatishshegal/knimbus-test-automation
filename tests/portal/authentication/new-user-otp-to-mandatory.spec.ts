import { test, expect } from '../../../src/fixtures';
import path from 'path';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';

test.describe('OTP and Mandatory Profile Flow', () => {

  test('User should navigate from Login -> OTP -> Mandatory Details -> Welcome', async ({
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
    await page.waitForTimeout(5000);

    // After OTP, T&C might appear before we reach the Mandatory form
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible();

    // 4. Verify routing to Mandatory Details Page after successful OTP
    // Wait for the mandatory details identifier to become visible
    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible({ timeout: 15000 });

    // 5. Act: Fill out all the mandatory fields
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
      await page.waitForTimeout(2000); // Small pause for visual confirmation
    }

    await mandatoryDetailsPage.submitForm();

    // 6. Verify Welcome Page
    await page.waitForURL(/.*welcome/, { timeout: 15000 });
    await expect(welcomePage.welcomePageIdentifier).toBeVisible();

  });

});

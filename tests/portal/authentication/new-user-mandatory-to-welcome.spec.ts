import { test, expect } from '../../../src/fixtures';
import path from 'path';
import portalData from '../../test-data/portal-data.json';

const mandatoryData = portalData.mandatoryUserDetails;

test.describe('Portal Authentication - Mandatory Details to Welcome Flow', () => {

  test('Mandatory Profile Routing - Freshly registered user completing all mandatory profile fields navigates to Welcome page', async ({
    portalLoginPage,
    mandatoryDetailsPage,
    welcomePage,
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
      gender: mandatoryData.gender,
      department: mandatoryData.department,
      degree: mandatoryData.degree,
      designation: mandatoryData.designation,
      batch: mandatoryData.batch,
      nationality: mandatoryData.nationality,
      idDocumentFrontPath: dummyImagePath,
      idDocumentBackPath: dummyImagePath
    });

    // 4. Act: Submit the form
    await mandatoryDetailsPage.submitForm();

    // 5. Assert: Should land on the Welcome page
    await page.waitForURL(/.*welcome/, { timeout: 15000 });
    await expect(welcomePage.welcomePageIdentifier).toBeVisible();
  });

});

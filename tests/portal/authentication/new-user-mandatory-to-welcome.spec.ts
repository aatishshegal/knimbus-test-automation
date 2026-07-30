import { test, expect } from '../../../src/fixtures';
import path from 'path';

test.describe('Mandatory Profile Fields Flow', () => {

  test('A freshly registered user should be forced to fill out all mandatory profile fields upon first login', async ({
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

    if (process.argv.includes('--headed')) {
      await page.waitForTimeout(3000);
    }

    // 4. Act: Submit the form
    await mandatoryDetailsPage.submitForm();

    // 5. Assert: Should land on the Welcome page
    await page.waitForURL(/.*welcome/, { timeout: 15000 });
    await expect(welcomePage.welcomePageIdentifier).toBeVisible();
  });

});

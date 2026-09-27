import { test, expect } from '../../../src/fixtures';

test.describe('Portal Authentication - Mandatory Details Routing', () => {

  test('Mandatory Profile Routing - Existing user with cleared profile is redirected to Mandatory Details form upon login', 
    async ({ portalLoginPage, mandatoryDetailsPage, mandatoryDetailsUser }) => {
    await portalLoginPage.login(
      mandatoryDetailsUser.email, 
      mandatoryDetailsUser.password
    );

    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible();
  });

  test('Mandatory Profile Routing - Newly registered user missing mandatory details is redirected to Mandatory Details form upon login', 
    async ({ portalLoginPage, mandatoryDetailsPage, dynamicMandatoryDetailsUser }) => {
    await portalLoginPage.login(
      dynamicMandatoryDetailsUser.email, 
      dynamicMandatoryDetailsUser.password
    );

    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible();
  });

});

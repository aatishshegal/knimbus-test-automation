import { test, expect } from '../../../src/fixtures';

test.describe('Portal Authentication - Mandatory Details Routing', () => {

  test('Verify an existing user whose profile data was cleared is routed to the Mandatory Details form', 
    async ({ portalLoginPage, mandatoryDetailsPage, mandatoryDetailsUser }) => {
    
    // 1. Arrange & Act
    await portalLoginPage.login(
      mandatoryDetailsUser.email, 
      mandatoryDetailsUser.password
    );

    // 2. Assert
    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible();
  });

  test('Verify a new user missing mandatory details is routed to the Mandatory Details form', 
    async ({ portalLoginPage, mandatoryDetailsPage, dynamicMandatoryDetailsUser }) => {
    
    // 1. Arrange & Act
    await portalLoginPage.login(
      dynamicMandatoryDetailsUser.email, 
      dynamicMandatoryDetailsUser.password
    );

    // 2. Assert
    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible();
  });

});

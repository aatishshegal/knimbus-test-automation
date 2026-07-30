import { test, expect } from '../../../src/fixtures';

test.describe('Portal Authentication - Mandatory Details Routing', () => {

  test('An existing user whose profile data was cleared should be routed to the mandatory details form', 
    async ({ portalLoginPage, mandatoryDetailsPage, mandatoryDetailsUser }) => {
    
    // 1. Arrange & Act
    await portalLoginPage.login(
      mandatoryDetailsUser.email, 
      mandatoryDetailsUser.password
    );

    // 2. Assert
    await expect(mandatoryDetailsPage.mandatoryDetailsIdentifier).toBeVisible();
  });

  test('A new user missing mandatory details should be routed to the mandatory details form', 
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

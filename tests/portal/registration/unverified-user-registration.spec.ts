import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';
import { YopmailPage } from '../../../src/pages/portal/YopmailPage';
import * as path from 'path';

test.describe('Unverified User Registration (Automated Verification Disabled)', () => {

    test.describe('Scenario 1: Registration when Mandatory Fields are Disabled', () => {
        test('User signs up and lands on automated user verification page', async ({
            page,
            portalLoginPage,
            registrationPage
        }) => {
            // 1. Arrange - Setup Admin preconditions via API
            const adminApi = new AdminApiService();
            await adminApi.login();
            await adminApi.updateSecuritySettings({
                selfRegistration: true,
                automatedVerification: false,
                twoFactorAuth: false,
                domainRestriction: [], 
                authDenyPatterns: { denialPatterns: [], allowedPatterns: null },
                mandatoryFields: { fields: [], isMandatory: false }
            });
            await adminApi.close();

            // 2. Act - Navigate to portal
            await portalLoginPage.navigateTo(process.env.PORTAL_URL!);
            await portalLoginPage.signInPopupTrigger.click();
            await portalLoginPage.signUpLink.click();

            const timestamp = Date.now();
            const testEmail = `test_verification_${timestamp}@yopmail.com`;

            await registrationPage.fillRegistration('Test Verification', testEmail, 'Password@123');
            await registrationPage.acceptTermsAndConditions();
            await registrationPage.submitRegistration();

            await expect(page.getByText('Account verification in progress', { exact: false })).toBeVisible({ timeout: 15000 });
        });
    });

    test.describe('Scenario 2: Registration when Mandatory Fields are Enabled', () => {
        test('User signs up, fills mandatory fields on registration page, and lands on automated verification page', async ({
            page,
            portalLoginPage,
            registrationPage,
            mandatoryDetailsPage
        }) => {
            // 1. Arrange - Setup Admin preconditions via API
            const adminApi = new AdminApiService();
            await adminApi.login();
            await adminApi.updateSecuritySettings({
                selfRegistration: true,
                automatedVerification: false,
                twoFactorAuth: false,
                domainRestriction: [], 
                authDenyPatterns: { denialPatterns: [], allowedPatterns: null },
                mandatoryFields: { 
                    fields: ['Gender', 'Department', 'Degree/Program', 'Designation', 'Batch', 'Nationality', 'ID Document'], 
                    isMandatory: true 
                }
            });
            await adminApi.close();

            // 2. Act - Navigate to portal
            await portalLoginPage.navigateTo(process.env.PORTAL_URL!);
            await portalLoginPage.signInPopupTrigger.click();
            await portalLoginPage.signUpLink.click();

            const timestamp = Date.now();
            const testEmail = `test_verif_mand_${timestamp}@yopmail.com`;

            await registrationPage.fillRegistration('Test Verif Mand', testEmail, 'Password@123');
            await registrationPage.acceptTermsAndConditions();

            // When automatedVerification is false, the mandatory fields are appended to the registration form itself!
            // We must fill them out BEFORE submitting.
            // We override the submit button locator so `fillMandatoryFields` checks the correct button.
            const originalSubmitButton = mandatoryDetailsPage['submitButton'];
            (mandatoryDetailsPage as any).submitButton = registrationPage.continueButton;

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

            await registrationPage.submitRegistration();

            await expect(page.getByText('Account verification in progress', { exact: false })).toBeVisible({ timeout: 15000 });
        });
    });
    
    test.describe('Scenario 3: Registration when OTP (Two-Factor Auth) is Enabled', () => {
        test('User signs up, enters OTP, and lands on automated verification page', async ({
            page,
            context,
            portalLoginPage,
            registrationPage,
            otpPage
        }) => {
            // 1. Arrange - Setup Admin preconditions via API
            const adminApi = new AdminApiService();
            await adminApi.login();
            await adminApi.updateSecuritySettings({
                selfRegistration: true,
                automatedVerification: false,
                twoFactorAuth: true,
                domainRestriction: [], 
                authDenyPatterns: { denialPatterns: [], allowedPatterns: null },
                mandatoryFields: { fields: [], isMandatory: false }
            });
            await adminApi.close();

            // 2. Act - Navigate to portal
            await portalLoginPage.navigateTo(process.env.PORTAL_URL!);
            await portalLoginPage.signInPopupTrigger.click();
            await portalLoginPage.signUpLink.click();

            const timestamp = Date.now();
            const testEmail = `test_verif_otp_${timestamp}@yopmail.com`;

            await registrationPage.fillRegistration('Test Verif OTP', testEmail, 'Password@123');
            await registrationPage.acceptTermsAndConditions();
            await registrationPage.submitRegistration();

            // 3. User lands on OTP page
            await expect(otpPage.otpPageIdentifier).toBeVisible({ timeout: 15000 });

            // 4. Open Yopmail in a new tab within the same browser context
            const newTab = await context.newPage();
            const yopmailPage = new YopmailPage(newTab);
            const otpCode = await yopmailPage.getLatestOtp(testEmail);
            await newTab.close(); 

            // 5. Fill OTP on the portal page
            await otpPage.submitOtp(otpCode);

            // 6. User lands on "Account verification in progress..."
            await expect(page.getByText('Account verification in progress', { exact: false })).toBeVisible({ timeout: 15000 });
        });
    });
});

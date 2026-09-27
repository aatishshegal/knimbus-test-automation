import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';
import validationData from '../../test-data/field-validation-data.json';

test.describe('Registration Form - Boundary Validations', () => {
    test.beforeAll(async () => {
        const adminApi = new AdminApiService();
        await adminApi.login();
        await adminApi.updateSecuritySettings({
            automatedVerification: false,
            mandatoryFields: { fields: [], isMandatory: true }
        });
        await adminApi.close();
    });

    test.afterAll(async () => {
        const adminApi = new AdminApiService();
        await adminApi.login();
        await adminApi.updateSecuritySettings({
            automatedVerification: true,
            mandatoryFields: { fields: [], isMandatory: false }
        });
        await adminApi.close();
    });

    test.beforeEach(async ({ portalLoginPage, registrationPage }) => {
        await portalLoginPage.navigateTo(process.env.PORTAL_URL!);
        await portalLoginPage.signInPopupTrigger.click();
        await portalLoginPage.signUpLink.click();
        await expect(registrationPage.registrationPageIdentifier).toBeVisible();
    });

    test('Registration - Full Name field input boundary validations', async ({ registrationPage }) => {
        await registrationPage.validateScenariosForFields(['FullName'], validationData.scenarios);
    });

    test('Registration - Email format and boundary validations', async ({ registrationPage }) => {
        await registrationPage.validateScenariosForFields(['Email'], validationData.scenarios);
    });

    test('Registration - Password security and character boundary validations', async ({ registrationPage }) => {
        await registrationPage.validateScenariosForFields(['Password'], validationData.scenarios);
    });

    test('Registration - Mobile and Contact number validations', async ({ registrationPage }) => {
        await registrationPage.validateScenariosForFields(['mobile', 'officePhone', 'residentialPhone'], validationData.scenarios);
    });

    test('Registration - Academic and Enrollment details validations', async ({ registrationPage }) => {
        await registrationPage.validateScenariosForFields(['college', 'department', 'qualification', 'admissionYear', 'idNumber', 'areaOfStudy'], validationData.scenarios);
    });

    test('Registration - Address, Nationality, and Membership details validations', async ({ registrationPage }) => {
        await registrationPage.validateScenariosForFields(['residentialAddress', 'officeAddress', 'nationality', 'membershipStatus', 'membershipType', 'summary', 'cadre', 'batch', 'rank', 'designation'], validationData.scenarios);
    });

    test('Registration - ID Document upload format and size validations', async ({ registrationPage }) => {
        await registrationPage.validateScenariosForFields(['idDocumentFront'], validationData.scenarios);
    });
});

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

    test.describe('Registration - Contact Fields Validation', () => {
        const contactFields = ['mobile', 'officePhone', 'residentialPhone'];
        for (const field of contactFields) {
            test(`Registration - Contact field input validations: ${field}`, async ({ registrationPage }) => {
                await registrationPage.validateScenariosForFields([field], validationData.scenarios);
            });
        }
    });

    test.describe('Registration - Academic & Enrollment Fields Validation', () => {
        const academicFields = ['college', 'department', 'qualification', 'admissionYear', 'idNumber', 'areaOfStudy'];
        for (const field of academicFields) {
            test(`Registration - Academic field input validations: ${field}`, async ({ registrationPage }) => {
                await registrationPage.validateScenariosForFields([field], validationData.scenarios);
            });
        }
    });

    test.describe('Registration - Address & Profile Fields Validation', () => {
        const profileFields = ['residentialAddress', 'officeAddress', 'nationality', 'membershipStatus', 'membershipType', 'summary', 'cadre', 'batch', 'rank', 'designation'];
        for (const field of profileFields) {
            test(`Registration - Profile field input validations: ${field}`, async ({ registrationPage }) => {
                await registrationPage.validateScenariosForFields([field], validationData.scenarios);
            });
        }
    });

    test('Registration - ID Document upload format and size validations', async ({ registrationPage }) => {
        await registrationPage.validateScenariosForFields(['idDocumentFront'], validationData.scenarios);
    });
});

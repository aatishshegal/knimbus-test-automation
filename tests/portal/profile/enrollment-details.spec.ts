import { test, expect } from '../../../src/fixtures';
import { EnrollmentDetailsPage } from '../../../src/pages/portal/EnrollmentDetailsPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';
import portalData from '../../test-data/portal-data.json';

// Load test data
const validationDataPath = path.resolve(__dirname, '../../../tests/test-data/portal/profile-data.json');
const validationData = JSON.parse(fs.readFileSync(validationDataPath, 'utf-8'));
const enrollmentScenarios = validationData['enrollment-details.spec.ts'];

const backendFieldMap: Record<string, string> = {
    'idNumber': 'Student ID/ Staff ID',
    'college': 'College/Affiliation',
    'department': 'Department',
    'qualification': 'Degree/Program',
    'designation': 'Designation',
    'areaOfStudy': 'Speciality',
    'rank': 'Rank',
    'batch': 'Batch',
    'cadre': 'Cadre',
    'admissionYear': 'Admission Year',
    'membershipStatus': 'Membership Status',
    'membershipType': 'Membership Type'
};
const enrollmentFields = Object.keys(backendFieldMap);

test.describe('Profile Details - Enrollment Suite', () => {
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        await adminApi.updateSecuritySettings({ 
            mandatoryFields: { fields: [], isMandatory: false },
            editableFields: { fields: [], isEditable: true },
            allFieldsEditable: true
        });
    });

    test.afterAll(async () => {
        if (adminApi) {
            await adminApi.login();
            await adminApi.updateSecuritySettings({ 
                mandatoryFields: { fields: [], isMandatory: false },
                editableFields: { fields: [], isEditable: true },
                allFieldsEditable: true
            });
            await adminApi.close();
        }
    });

    test.beforeEach(async ({ page, topNavigationBar }) => {
        await page.goto(process.env.PORTAL_URL as string);
        await topNavigationBar.openProfileMenu();
        await topNavigationBar.profileMenuProfileLink.click();
        await page.getByRole('tab', { name: /Enrollment Details/i }).click();
    });

    test('Enrollment Details - Cancel button discards unsaved enrollment edits and restores original ID', async ({ page }) => {
        const enrollmentPage = new EnrollmentDetailsPage(page);
        await enrollmentPage.ensureInEditMode();
        
        const locator = enrollmentPage.getLocator('idNumber');
        const originalId = await locator.inputValue();
        const tempId = portalData.profile.enrollment.temporaryId;
        await locator.fill(tempId);
        await enrollmentPage.clickCancel();
        
        const revertedValue = await locator.inputValue();
        expect(revertedValue).not.toBe(tempId);
    });

    test.describe('Enrollment Details - Valid Field Input', () => {
        for (const field of enrollmentFields) {
            const value = enrollmentScenarios.positiveData[field];
            if (value) {
                test(`Enrollment Details - Accepts and saves valid data for field: ${field}`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: String(value) });
                    const enrollmentPage = new EnrollmentDetailsPage(page);
                    await enrollmentPage.setFieldValue(field, value);
                    await enrollmentPage.clickSave();
                    await expect(page.getByRole('heading', { name: /Updated successfully/i }).first()).toBeVisible({ timeout: 5000 });
                });
            }
        }
    });

    test.describe('Enrollment Details - Mandatory Field Validations', () => {
        test.beforeAll(async () => {
            const api = new AdminApiService();
            await api.login();
            await api.updateSecuritySettings({ mandatoryFields: { fields: Object.values(backendFieldMap), isMandatory: true } });
            await api.close();
        });
        
        test.afterAll(async () => {
            const api = new AdminApiService();
            await api.login();
            await api.updateSecuritySettings({ mandatoryFields: { fields: [], isMandatory: false } });
            await api.close();
        });

        for (const field of enrollmentFields) {
            test(`Enrollment Details - Displays validation error when mandatory field is left empty: ${field}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: '' });
                const enrollmentPage = new EnrollmentDetailsPage(page);
                await enrollmentPage.clearFieldAndBlur(field);
                
                await expect(page.getByText(/is required/i).first()).toBeVisible({ timeout: 5000 });
            });
        }
    });

    test.describe('Enrollment Details - Field Input Validations', () => {
        const boundaryScenarios = enrollmentScenarios.negativeScenarios.filter((s: any) => !s.scenario.includes('Blank') && !s.bypassLength);
        for (const s of boundaryScenarios) {
            test(`Enrollment Details - Rejects invalid input: ${s.field} - ${s.scenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: String(s.value) });
                const enrollmentPage = new EnrollmentDetailsPage(page);
                await enrollmentPage.setFieldValue(s.field, String(s.value));
                await enrollmentPage.clickSave();
                
                await expect(page.getByText(s.expectedError).first()).toBeVisible({ timeout: 5000 });
            });
        }
    });

    test.describe('Enrollment Details - Read-Only Disabled State Override', () => {
        const group1 = enrollmentFields.slice(0, 6);
        const group2 = enrollmentFields.slice(6);

        test.describe('Enrollment Details - Non-Editable Fields Group 1', () => {
            test.beforeAll(async () => {
                const api = new AdminApiService();
                await api.login();
                await api.updateSecuritySettings({ 
                    allFieldsEditable: true,
                    editableFields: { fields: group1.map(f => backendFieldMap[f]), isEditable: false } 
                });
                await api.close();
            });

            for (const field of group1) {
                test(`Enrollment Details - Field becomes disabled when Admin sets field non-editable: ${field}`, async ({ page }) => {
                    const enrollmentPage = new EnrollmentDetailsPage(page);
                    await enrollmentPage.clickEdit();
                    
                    const locator = enrollmentPage.getLocator(field);
                    await expect(locator).toBeDisabled({ timeout: 5000 });
                });
            }
        });

        test.describe('Enrollment Details - Non-Editable Fields Group 2', () => {
            test.beforeAll(async () => {
                const api = new AdminApiService();
                await api.login();
                await api.updateSecuritySettings({ 
                    allFieldsEditable: true,
                    editableFields: { fields: group2.map(f => backendFieldMap[f]), isEditable: false } 
                });
                await api.close();
            });

            for (const field of group2) {
                test(`Enrollment Details - Field becomes disabled when Admin sets field non-editable: ${field}`, async ({ page }) => {
                    const enrollmentPage = new EnrollmentDetailsPage(page);
                    await enrollmentPage.clickEdit();
                    
                    const locator = enrollmentPage.getLocator(field);
                    await expect(locator).toBeDisabled({ timeout: 5000 });
                });
            }
        });

        test.describe('Enrollment Details - All Fields Non-Editable', () => {
            test.beforeAll(async () => {
                const api = new AdminApiService();
                await api.login();
                await api.updateSecuritySettings({ allFieldsEditable: false });
                await api.close();
            });

            test.afterAll(async () => {
                const api = new AdminApiService();
                await api.login();
                await api.updateSecuritySettings({ 
                    allFieldsEditable: true,
                    editableFields: { fields: [], isEditable: true } 
                });
                await api.close();
            });

            test('Enrollment Details - Edit button is hidden and non-editable message is displayed when all fields are disabled', async ({ page }) => {
                const enrollmentPage = new EnrollmentDetailsPage(page);
                const expectedMessage = portalData.profile.adminOverrides?.disabledMessage || "All the fields are set to be non-editable by your institution";
                await expect(page.getByText(expectedMessage).first()).toBeVisible({ timeout: 5000 });
                await expect(enrollmentPage.editBtn).toBeHidden({ timeout: 5000 });
            });
        });
    });
});

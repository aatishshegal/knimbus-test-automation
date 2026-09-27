import { test, expect } from '../../../src/fixtures';
import { ContactPage } from '../../../src/pages/portal/ContactPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';
import portalData from '../../test-data/portal-data.json';

// Load test data
const validationDataPath = path.resolve(__dirname, '../../../tests/test-data/portal/profile-data.json');
const validationData = JSON.parse(fs.readFileSync(validationDataPath, 'utf-8'));
const contactScenarios = validationData['contact.spec.ts'];

const backendFieldMap: Record<string, string> = {
    'mobile': 'Mobile',
    'officePhone': 'Office Phone',
    'residentialPhone': 'Residential Phone',
    'nationality': 'Nationality',
    'officeAddress': 'Office Address',
    'residentialAddress': 'Residential Address'
};
const contactFields = Object.keys(backendFieldMap);

test.describe('Profile Details - Contact Suite', () => {
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
        await page.getByRole('tab', { name: /Contact/i }).click();
    });

    test('Contact Details - Cancel button discards unsaved edits and restores original mobile number', async ({ page }) => {
        const contactPage = new ContactPage(page);
        await contactPage.ensureInEditMode();
        
        const locator = contactPage.getLocator('mobile');
        const originalMobile = await locator.inputValue();
        
        const tempPhone = portalData.profile.contact.temporaryPhone;
        await locator.fill(tempPhone);
        await expect(locator).toHaveValue(tempPhone);
        await contactPage.clickCancel();
        
        const revertedMobile = await locator.inputValue();
        expect(revertedMobile).toBe(originalMobile);
        expect(revertedMobile).not.toBe(tempPhone);
    });

    test.describe('Contact Details - Valid Input Submissions', () => {
        for (const field of contactFields) {
            const value = contactScenarios.positiveData[field];
            if (value) {
                test(`Contact Details - Accepts and saves valid data for field: ${field}`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: String(value) });
                    const contactPage = new ContactPage(page);
                    await contactPage.setFieldValue(field, value);
                    
                    await contactPage.clickSave();
                    await expect(page.getByRole('heading', { name: /updated successfully/i }).first()).toBeVisible({ timeout: 5000 });
                });
            }
        }
    });

    test.describe('Contact Details - Mandatory Field Validations', () => {
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

        for (const field of contactFields) {
            test(`Contact Details - Displays validation error when mandatory field is left empty: ${field}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: '' });
                const contactPage = new ContactPage(page);
                await contactPage.clearFieldAndBlur(field);
                
                await expect(page.getByText(/is required/i).first()).toBeVisible({ timeout: 5000 });
            });
        }
    });

    test.describe('Contact Details - Field Input Validations', () => {
        const nonBlankNegativeScenarios = contactScenarios.negativeScenarios.filter((s: any) => !s.scenario.includes('Blank') && !s.bypassLength);
        for (const s of nonBlankNegativeScenarios) {
            test(`Contact Details - Rejects invalid input: ${s.field} - ${s.scenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: String(s.value) });
                const contactPage = new ContactPage(page);
                await contactPage.setFieldValue(s.field, s.value);
                await contactPage.validateFieldError(s.expectedError);
            });
        }
    });
});

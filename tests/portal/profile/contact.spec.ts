import { test, expect } from '../../../src/fixtures';
import { ContactPage } from '../../../src/pages/portal/ContactPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';

// Load test data
const validationDataPath = path.resolve(__dirname, '../../../tests/test-data/postLoginProfileData.json');
const validationData = JSON.parse(fs.readFileSync(validationDataPath, 'utf-8'));
const contactScenarios = validationData.contactScenarios;

const backendFieldMap: Record<string, string> = {
    'mobile': 'Mobile',
    'officePhone': 'Office Phone',
    'residentialPhone': 'Residential Phone',
    'nationality': 'Nationality',
    'officeAddress': 'Office Address',
    'residentialAddress': 'Residential Address'
};
const contactFields = Object.keys(backendFieldMap);

test.describe('Contact Details Suite', () => {
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
        if (adminApi) await adminApi.close();
    });

    test.beforeEach(async ({ page, topNavigationBar }) => {
        await page.goto(process.env.PORTAL_URL as string);
        await topNavigationBar.openProfileMenu();
        await topNavigationBar.profileMenuProfileLink.click();
        await page.getByRole('tab', { name: /Contact/i }).click();
    });

    test('TC_Contact_Cancel_Discards_Changes', async ({ page }) => {
        const contactPage = new ContactPage(page);
        await contactPage.clickEdit();
        
        const locator = contactPage.getLocator('mobile');
        if (!locator) return;
        const originalMobile = await locator.inputValue();
        
        await locator.fill('9999999999');
        await contactPage.clickCancel();
        
        const revertedMobile = await locator.inputValue();
        expect(revertedMobile).toBe(originalMobile);
        expect(revertedMobile).not.toBe('9999999999');
    });

    test.describe('Positive Scenarios', () => {
        for (const field of contactFields) {
            const value = contactScenarios.positiveData[field];
            if (value) {
                test(`TC_Contact_${field}_Accepts valid data`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: String(value) });
                    const contactPage = new ContactPage(page);
                    if (await contactPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await contactPage.clickEdit();
                    
                    const locator = contactPage.getLocator(field);
                    if (field === 'nationality') {
                         await locator.selectOption(value).catch(()=>{});
                    } else {
                         await locator.fill(value);
                    }
                    
                    await contactPage.clickSave();
                    await expect(page.getByRole('heading', { name: /updated successfully/i }).first()).toBeVisible({ timeout: 5000 });
                });
            }
        }
    });

    test.describe('Blank Validations (Mandatory ON)', () => {
        test.beforeAll(async () => {
            await adminApi.updateSecuritySettings({ mandatoryFields: { fields: Object.values(backendFieldMap), isMandatory: true } });
        });
        
        test.afterAll(async () => {
            await adminApi.updateSecuritySettings({ mandatoryFields: { fields: [], isMandatory: false } });
        });

        for (const field of contactFields) {
            test(`TC_Contact_${field}_Shows validation error when blank`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: '' });
                const contactPage = new ContactPage(page);
                if (await contactPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await contactPage.clickEdit();
                
                const locator = contactPage.getLocator(field);
                if (!locator) return;
                
                if (contactScenarios.positiveData[field]) {
                    if (field === 'nationality') {
                         await locator.selectOption(contactScenarios.positiveData[field]).catch(()=>{});
                    } else {
                         await locator.fill(contactScenarios.positiveData[field]);
                    }
                }
                
                if (field === 'nationality') {
                     await locator.selectOption('').catch(()=>{});
                } else {
                     await locator.fill(' ');
                     await locator.focus();
                     await page.keyboard.press('Backspace');
                     await locator.blur();
                }
                
                await expect(page.getByText(/is required/i).first()).toBeVisible({ timeout: 2000 });
            });
        }
    });

    test.describe('Negative Scenarios', () => {
        const nonBlankNegativeScenarios = contactScenarios.negativeScenarios.filter((s: any) => !s.scenario.includes('Blank'));
        for (const s of nonBlankNegativeScenarios) {
            test(`TC_Contact_${s.field}_${s.scenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: String(s.value) });
                const contactPage = new ContactPage(page);
                if (await contactPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await contactPage.clickEdit();
                
                const locator = contactPage.getLocator(s.field);
                if (!locator) return;

                if (s.field === 'nationality') {
                     await locator.selectOption(s.value).catch(()=>{});
                } else {
                     if (s.bypassLength) {
                         await locator.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                     }
                     await locator.fill(String(s.value));
                     await locator.blur();
                }
                await contactPage.clickSave();
                await expect(page.getByText(s.expectedError).first()).toBeVisible({ timeout: 2000 });
            });
        }
    });

    test.describe('Admin Override (All fields non-editable)', () => {
        test.beforeAll(async () => {
            await adminApi.updateSecuritySettings({ allFieldsEditable: false });
        });
        test.afterAll(async () => {
            await adminApi.updateSecuritySettings({ allFieldsEditable: true });
        });

        test('TC_Contact_AllNonEditable_Edit button hidden and warning shown', async ({ page }) => {
            test.info().annotations.push({ type: 'testData', description: 'N/A' });
            const contactPage = new ContactPage(page);
            const expectedMessage = validationData.adminOverrides?.disabledMessage || "All the fields are set to be non-editable by your institution";
            await expect(page.getByText(expectedMessage).first()).toBeVisible({ timeout: 5000 });
            await expect(contactPage.editBtn).toBeHidden({ timeout: 5000 });
        });
    });

    test.describe('Admin Override (Individual fields non-editable)', () => {
        for (const field of contactFields) {
            test(`TC_Contact_${field}_Field becomes read-only`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: 'N/A' });
                const backendName = backendFieldMap[field];
                if (!backendName) return;
                
                await adminApi.updateSecuritySettings({ editableFields: { fields: [backendName], isEditable: false } });
                await page.reload();
                await page.getByRole('tab', { name: /Contact/i }).click();

                const contactPage = new ContactPage(page);
                await contactPage.clickEdit();
                const locator = contactPage.getLocator(field);
                if (locator) {
                    await expect(locator).toBeDisabled({ timeout: 5000 });
                }
                
                await adminApi.updateSecuritySettings({ editableFields: { fields: [], isEditable: true } });
            });
        }
    });
});

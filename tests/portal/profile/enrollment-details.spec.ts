import { test, expect } from '../../../src/fixtures';
import { EnrollmentDetailsPage } from '../../../src/pages/portal/EnrollmentDetailsPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';

// Load test data
const validationDataPath = path.resolve(__dirname, '../../../tests/test-data/postLoginProfileData.json');
const validationData = JSON.parse(fs.readFileSync(validationDataPath, 'utf-8'));
const enrollmentScenarios = validationData.enrollmentScenarios;
const adminOverrides = validationData.adminOverrides;

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

test.describe('Enrollment Details Suite', () => {
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
        await page.getByRole('tab', { name: /Enrollment Details/i }).click();
    });

    test.describe('Positive Scenarios', () => {
        for (const field of enrollmentFields) {
            const value = enrollmentScenarios.positiveData[field];
            if (value) {
                test(`TC_Enrollment_${field}_Accepts valid data`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: String(value) });
                    const enrollmentPage = new EnrollmentDetailsPage(page);
                    if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                    
                    const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                    await locator.fill(value);
                    await enrollmentPage.clickSave();
                    await expect(page.getByRole('heading', { name: /Updated successfully/i }).first()).toBeVisible({ timeout: 5000 });
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

        for (const field of enrollmentFields) {
            test(`TC_Enrollment_${field}_Shows validation error when blank`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: '' });
                const enrollmentPage = new EnrollmentDetailsPage(page);
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (!locator) return;
                
                if (enrollmentScenarios.positiveData[field]) {
                    await locator.fill(enrollmentScenarios.positiveData[field]);
                }
                
                await locator.fill(' ');
                await locator.focus();
                await page.keyboard.press('Backspace');
                await locator.blur();
                
                await expect(page.getByText(/is required/i).first()).toBeVisible({ timeout: 2000 });
            });
        }
    });

    test.describe('Negative Scenarios', () => {
        const nonBlankNegativeScenarios = enrollmentScenarios.negativeScenarios.filter((s: any) => !s.scenario.includes('Blank'));
        for (const s of nonBlankNegativeScenarios) {
            test(`TC_Enrollment_${s.field}_${s.scenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: String(s.value) });
                const enrollmentPage = new EnrollmentDetailsPage(page);
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                
                const locator = (enrollmentPage as any)[`${s.field}Input`] || (enrollmentPage as any)[`${s.field}Dropdown`];
                if (!locator) return;

                await locator.fill(s.value);
                await enrollmentPage.clickSave();
                
                if (s.field === 'admissionYear' && s.scenario.includes('restricts input')) {
                    const val = await locator.inputValue();
                    expect(val.length).toBeLessThanOrEqual(4);
                } else {
                    await expect(page.getByText(s.expectedError).first()).toBeVisible({ timeout: 3000 });
                }
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

        test('TC_Enrollment_AllNonEditable_Edit button hidden and warning shown', async ({ page }) => {
            test.info().annotations.push({ type: 'testData', description: 'N/A' });
            const enrollmentPage = new EnrollmentDetailsPage(page);
            const expectedMessage = adminOverrides?.disabledMessage || "All the fields are set to be non-editable by your institution";
            await expect(page.getByText(expectedMessage).first()).toBeVisible({ timeout: 5000 });
            await expect(enrollmentPage.editBtn).toBeHidden();
        });
    });

    test.describe('Admin Override (Individual fields non-editable)', () => {
        for (const field of enrollmentFields) {
            test(`TC_Enrollment_${field}_Field becomes read-only`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: 'N/A' });
                const backendName = backendFieldMap[field];
                if (!backendName) return;
                
                await adminApi.updateSecuritySettings({ editableFields: { fields: [backendName], isEditable: false } });
                await page.reload();
                await page.getByRole('tab', { name: /Enrollment Details/i }).click();

                const enrollmentPage = new EnrollmentDetailsPage(page);
                await enrollmentPage.clickEdit();
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (locator) {
                    await expect(locator).toBeDisabled({ timeout: 5000 });
                }
                
                await adminApi.updateSecuritySettings({ editableFields: { fields: [], isEditable: true } });
            });
        }
    });

    test.describe('Auto-suggestions', () => {
        for (const field of enrollmentFields) {
            if (field === 'idNumber') continue;
            
            test(`TC_Enrollment_${field}_AutoSuggest Typing`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: 'a' });
                const enrollmentPage = new EnrollmentDetailsPage(page);
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (!locator) return;
                
                const listId = await locator.getAttribute('list');
                if (listId) {
                    await locator.fill('');
                    await locator.pressSequentially('a', { delay: 100 });
                    const datalist = page.locator(`datalist#${listId}`);
                    await expect(datalist).toBeAttached();
                }
            });

            test(`TC_Enrollment_${field}_AutoSuggest DoubleClick`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: 'Double Click' });
                const enrollmentPage = new EnrollmentDetailsPage(page);
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (!locator) return;
                
                const listId = await locator.getAttribute('list');
                if (listId) {
                    await locator.scrollIntoViewIfNeeded(); 
                    await locator.click({ force: true }); 
                    await page.waitForTimeout(200); 
                    await locator.dblclick({ force: true });
                    const datalist = page.locator(`datalist#${listId}`);
                    await expect(datalist).toBeAttached();
                }
            });
        }
    });
});

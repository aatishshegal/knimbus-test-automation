import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';
import { ProfilePage } from '../../../src/pages/portal/ProfilePage';
import portalData from '../../test-data/portal-data.json';

// Load post-login profile data
const postLoginDataPath = path.resolve(__dirname, '../../../tests/test-data/portal/profile-data.json');
const postLoginData = JSON.parse(fs.readFileSync(postLoginDataPath, 'utf-8'));
const basicDetailsScenarios = postLoginData['profile-basic-details.spec.ts'] || postLoginData.basicDetailsScenarios || { positiveData: {}, negativeScenarios: [] };

const backendFieldMap: Record<string, string> = {
    'fullName': 'Name',
    'summary': 'Summary'
};
const basicDetailsFields = Object.keys(backendFieldMap);

test.describe('Profile Details - Basic Details Suite', () => {
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
    });

    test.afterAll(async () => {
        if (adminApi) await adminApi.close();
    });

    test.describe('Profile Basic Details - Editable State', () => {
        test.beforeAll(async () => {
            await adminApi.updateSecuritySettings({
                allFieldsEditable: true,
                mandatoryFields: { fields: ['Name'], isMandatory: true }
            });
        });

        test.afterAll(async () => {
            await adminApi.updateSecuritySettings({
                allFieldsEditable: true,
                mandatoryFields: { fields: [], isMandatory: false },
                editableFields: { fields: [], isEditable: true }
            });
        });

        test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
            await page.goto(process.env.PORTAL_URL as string);
            await topNavigationBar.openProfileMenu();
            await topNavigationBar.profileMenuProfileLink.click();
            await expect(profilePage.profileHeader).toBeVisible();
        });

        test.afterEach(async ({ profilePage }) => {
            await profilePage.cancelIfVisible();
        });

        test('Profile Basic Details - Cancel button discards unsaved name edits and restores original value', async ({ page }) => {
            const profilePage = new ProfilePage(page);
            await profilePage.clickEdit();
            
            const locator = profilePage.getLocator('fullName');
            const originalName = await locator.inputValue();
            const tempName = portalData.profile.basicDetails.temporaryName;
            await locator.fill(tempName);
            await expect(locator).toHaveValue(tempName);
            await profilePage.cancelBtn.click();
            
            const revertedName = await locator.inputValue();
            expect(revertedName).toBe(originalName);
            expect(revertedName).not.toBe('Temporary Cancel Name');
        });

        test.describe('Profile Basic Details - Valid Field Input', () => {
            for (const field of basicDetailsFields) {
                const value = basicDetailsScenarios.positiveData[field];
                if (value) {
                    test(`Profile Basic Details - Accepts and saves valid data for field: ${field}`, async ({ page }) => {
                        test.info().annotations.push({ type: 'testData', description: String(value) });
                        const profilePage = new ProfilePage(page);
                        await profilePage.clickEdit();
                        
                        const locator = profilePage.getLocator(field);
                        await locator.fill(value);
                        
                        await profilePage.clickSave();
                        await expect(page.getByRole('heading', { name: /Updated successfully/i }).first()).toBeVisible({ timeout: 5000 });
                    });
                }
            }
        });

        test.describe('Profile Basic Details - Field Boundary Rejections', () => {
            const boundaryScenarios = basicDetailsScenarios.negativeScenarios.filter((s: any) => 
                basicDetailsFields.includes(s.field) && !s.bypassLength &&
                (!s.scenario.toLowerCase().includes('blank') || s.field === 'fullName')
            );

            for (const s of boundaryScenarios) {
                test(`Profile Basic Details - Rejects invalid input: ${s.field} - ${s.scenario}`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: String(s.value) });
                    const profilePage = new ProfilePage(page);
                    await profilePage.clickEdit();
                    
                    const locator = profilePage.getLocator(s.field);
                    await locator.fill(s.value);
                    await profilePage.clickSave();
                    
                    await expect(page.locator(`text=${s.expectedError}`).first()).toBeVisible({ timeout: 5000 });
                });
            }
        });

        test.describe('Profile Basic Details - Date of Birth', () => {
            test('Profile Basic Details - Accepts valid date of birth via calendar picker', async ({ profilePage }) => {
                await profilePage.clickEdit();
                await profilePage.dobInput.click();
                await profilePage.calendarYearDropdown.selectOption({ label: '1995' });
                await profilePage.calendarMonthDropdown.selectOption({ label: 'May' });
                await profilePage.page.locator('.react-datepicker__day:not(.react-datepicker__day--outside-month)').filter({ hasText: /^10$/ }).click();
                await profilePage.clickSave();
                await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
            });

            test('Profile Basic Details - Rejects future date selection in calendar year dropdown', async ({ profilePage }) => {
                await profilePage.clickEdit();
                await profilePage.dobInput.click();
                
                const futureYear = (new Date().getFullYear() + 1).toString();
                const optionCount = await profilePage.calendarYearDropdown.locator(`option[value="${futureYear}"]`).count();
                expect(optionCount).toBe(0);
            });
        });

        test.describe('Profile Basic Details - Gender', () => {
            test('Profile Basic Details - Saves successfully when a valid gender option is selected', async ({ profilePage }) => {
                await profilePage.clickEdit();
                await profilePage.genderDropdown.selectOption('Female');
                await profilePage.clickSave();
                await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
            });
        });

        test.describe('Profile Basic Details - Image Upload', () => {
            test('Profile Basic Details - Uploads valid JPG profile image successfully', async ({ profilePage }) => {
                await profilePage.profileImgEditIcon.click();

                const fullFilePath = path.resolve(__dirname, '../../../tests/test-data/dummy-id.jpg');
                await profilePage.imageUploadInput.setInputFiles(fullFilePath);

                await profilePage.imageModalSaveBtn.click();
                await expect(profilePage.toastMessage).toHaveText(/update|success|saved/i, { timeout: 15000 });
            });

            test('Profile Basic Details - Displays error when uploading unsupported image file type', async ({ profilePage }) => {
                await profilePage.profileImgEditIcon.click();

                const fullFilePath = path.resolve(__dirname, '../../../tests/test-data/files/dummy.pdf');
                if (!fs.existsSync(fullFilePath)) fs.writeFileSync(fullFilePath, 'dummy pdf content');
                await profilePage.imageUploadInput.setInputFiles(fullFilePath);

                await profilePage.imageModalSaveBtn.click();
                await expect(profilePage.imageUploadErrorMsg).toBeVisible();
            });

            test('Profile Basic Details - Displays error when image upload exceeds 1MB limit', async ({ profilePage }) => {
                await profilePage.profileImgEditIcon.click();

                const fullFilePath = path.resolve(__dirname, '../../../tests/test-data/files/large-dummy.jpg');
                if (!fs.existsSync(fullFilePath)) {
                    fs.writeFileSync(fullFilePath, Buffer.alloc(1.1 * 1024 * 1024));
                }
                await profilePage.imageUploadInput.setInputFiles(fullFilePath);

                await profilePage.imageModalSaveBtn.click();
                await expect(profilePage.imageUploadErrorMsg).toBeVisible();
            });
        });
    });

    test.describe('Profile Basic Details - Mandatory Field Validations', () => {
        test.beforeAll(async () => {
            await adminApi.updateSecuritySettings({ 
                allFieldsEditable: true,
                mandatoryFields: { fields: Object.values(backendFieldMap), isMandatory: true } 
            });
        });
        
        test.afterAll(async () => {
            await adminApi.updateSecuritySettings({ mandatoryFields: { fields: ['Name'], isMandatory: true } });
        });

        test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
            await page.goto(process.env.PORTAL_URL as string);
            await topNavigationBar.openProfileMenu();
            await topNavigationBar.profileMenuProfileLink.click();
            await expect(profilePage.profileHeader).toBeVisible();
        });

        for (const field of basicDetailsFields) {
            const blankScenario = basicDetailsScenarios.negativeScenarios.find((s: any) => s.field === field && s.scenario.toLowerCase().includes('blank'));
            if (!blankScenario) continue;

            test(`Profile Basic Details - Displays validation error when mandatory field is left empty: ${field}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: '' });
                const profilePage = new ProfilePage(page);
                await profilePage.clickEdit();
                
                const locator = profilePage.getLocator(field);
                await locator.fill('');
                await profilePage.clickSave();
                
                await expect(page.locator(`text=${blankScenario.expectedError}`).first()).toBeVisible({ timeout: 5000 });
            });
        }
    });

    test.describe('Profile Basic Details - Read-Only Disabled State Override', () => {
        test.beforeAll(async () => {
            await adminApi.updateSecuritySettings({ editableFields: { fields: Object.values(backendFieldMap), isEditable: false } });
        });
        
        test.afterAll(async () => {
            await adminApi.updateSecuritySettings({ editableFields: { fields: [], isEditable: true } });
        });

        test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
            await page.goto(process.env.PORTAL_URL as string);
            await topNavigationBar.openProfileMenu();
            await topNavigationBar.profileMenuProfileLink.click();
            await expect(profilePage.profileHeader).toBeVisible();
        });

        for (const field of basicDetailsFields) {
            test(`Profile Basic Details - Field becomes disabled when Admin sets field non-editable: ${field}`, async ({ page }) => {
                const profilePage = new ProfilePage(page);
                await profilePage.clickEdit();
                
                const locator = profilePage.getLocator(field);
                await expect(locator).toBeDisabled({ timeout: 5000 });
            });
        }
    });
});

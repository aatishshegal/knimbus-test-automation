import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';
import { ProfilePage } from '../../../src/pages/portal/ProfilePage';

// Load post-login profile data
const postLoginDataPath = path.resolve(__dirname, '../../../tests/test-data/postLoginProfileData.json');
const postLoginData = JSON.parse(fs.readFileSync(postLoginDataPath, 'utf-8'));
const basicDetailsScenarios = postLoginData.basicDetailsScenarios || { positiveData: {}, negativeScenarios: [] };

const backendFieldMap: Record<string, string> = {
    'fullName': 'Name',
    'summary': 'Summary'
};
const basicDetailsFields = Object.keys(backendFieldMap);

test.describe('Profile Basic Details Suite', () => {
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
    });

    test.afterAll(async () => {
        if (adminApi) await adminApi.close();
    });

    test.describe('Positive Scenarios & Negative Validation (Editable ON)', () => {
        test.beforeAll(async () => {
            // Set all fields editable, but strictly keep Full Name (Name) mandatory as instructed
            await adminApi.updateSecuritySettings({
                allFieldsEditable: true,
                mandatoryFields: { fields: ['Name'], isMandatory: true }
            });
        });

        test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
            await page.goto(process.env.PORTAL_URL as string);
            await topNavigationBar.openProfileMenu();
            await topNavigationBar.profileMenuProfileLink.click();
            await expect(profilePage.profileHeader).toBeVisible();
        });

        test.afterEach(async ({ profilePage }) => {
            if (await profilePage.cancelBtn.isVisible().catch(() => false)) {
                await profilePage.cancelBtn.click();
            }
        });

        test('TC_BasicDetails_Cancel_Discards_Changes', async ({ page }) => {
            const profilePage = new ProfilePage(page);
            await profilePage.clickEdit();
            
            const locator = profilePage.getLocator('fullName');
            if (!locator) return;
            const originalName = await locator.inputValue();
            
            await locator.fill('Temporary Cancel Name');
            await profilePage.cancelBtn.click();
            
            const revertedName = await locator.inputValue();
            expect(revertedName).toBe(originalName);
            expect(revertedName).not.toBe('Temporary Cancel Name');
        });

        test.describe('Positive Data Iteration', () => {
            for (const field of basicDetailsFields) {
                const value = basicDetailsScenarios.positiveData[field];
                if (value) {
                    test(`TC_BasicDetails_${field}_Accepts valid data`, async ({ page }) => {
                        test.info().annotations.push({ type: 'testData', description: String(value) });
                        const profilePage = new ProfilePage(page);
                        await profilePage.page.waitForTimeout(1000);
await profilePage.clickEdit();
                        
                        const locator = profilePage.getLocator(field);
                        await locator.fill(value);
                        
                        await profilePage.clickSave();
                        await expect(page.getByRole('heading', { name: /Updated successfully/i }).first()).toBeVisible({ timeout: 5000 });
                    });
                }
            }
        });

        test.describe('Negative Scenarios Iteration', () => {
            for (const s of basicDetailsScenarios.negativeScenarios) {
                if (!basicDetailsFields.includes(s.field)) continue;
                
                // Skip blank validation here if it's not universally mandatory in this block
                if (s.scenario.toLowerCase().includes('blank') && s.field !== 'fullName') {
                    continue; 
                }

                test(`TC_BasicDetails_${s.field}_${s.scenario.replace(/[^a-zA-Z0-9]/g, '')}`, async ({ page }) => {
                    test.info().annotations.push({ type: 'testData', description: String(s.value) });
                    const profilePage = new ProfilePage(page);
                    await profilePage.page.waitForTimeout(1000);
await profilePage.clickEdit();
                    
                    const locator = profilePage.getLocator(s.field);
                    
                    if (s.bypassLength) {
                        await locator.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                    }
                    
                    await locator.fill(s.value);
                    await profilePage.clickSave();
                    
                    await expect(page.locator(`text=${s.expectedError}`).first()).toBeVisible({ timeout: 5000 });
                });
            }
        });

        test.describe('DOB', () => {
            test('TC_DOB_AcceptValidDate_EditableON - accepts valid past date via calendar', { tag: '@EditableON' }, async ({ profilePage }) => {
                await profilePage.page.waitForTimeout(1000);
await profilePage.clickEdit();
                await profilePage.dobInput.click();
                await profilePage.calendarYearDropdown.selectOption({ label: '1995' });
                await profilePage.calendarMonthDropdown.selectOption({ label: 'May' });
                await profilePage.page.locator('.react-datepicker__day:not(.react-datepicker__day--outside-month)').filter({ hasText: /^10$/ }).click();
                await profilePage.clickSave();
                await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
            });

            test('TC_DOB_RejectFutureDate_EditableON - rejects future dates in calendar selection', { tag: '@EditableON' }, async ({ profilePage }) => {
                await profilePage.page.waitForTimeout(1000);
await profilePage.clickEdit();
                await profilePage.dobInput.click();
                await profilePage.calendarYearDropdown.selectOption({ label: (new Date().getFullYear() + 1).toString() }).catch(() => { });
                const selectedYear = await profilePage.calendarYearDropdown.inputValue();
                expect(parseInt(selectedYear)).toBeLessThanOrEqual(new Date().getFullYear());
            });
        });

        test.describe('Gender', () => {
            test('TC_Gender_AcceptValidSelection_EditableON - saves successfully when a valid option is selected', { tag: '@EditableON' }, async ({ profilePage }) => {
                await profilePage.page.waitForTimeout(1000);
await profilePage.clickEdit();
                await profilePage.genderDropdown.selectOption('Female');
                await profilePage.clickSave();
                await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
            });
        });

        test.describe('Image Upload', () => {
            test('TC_Image_AcceptValidUpload - uploads standard JPG/PNG successfully', async ({ profilePage }) => {
                await profilePage.profileImgEditIcon.click();

                await test.step('Upload a valid JPG image', async () => {
                    const fullFilePath = path.resolve(__dirname, '../../../tests/test-data/files/dummy-id.jpg');
                    if (!fs.existsSync(fullFilePath)) fs.writeFileSync(fullFilePath, 'dummy content');
                    await profilePage.imageUploadInput.setInputFiles(fullFilePath);
                });

                await test.step('Save and assert success message', async () => {
                    await profilePage.imageModalSaveBtn.click();
                    await expect(profilePage.toastMessage).toHaveText(/update|success|saved/i, { timeout: 15000 });
                });
            });

            test('TC_Image_RejectInvalidExtension - shows error when uploading unsupported files', async ({ profilePage }) => {
                await profilePage.profileImgEditIcon.click();

                await test.step('Upload an unsupported file type', async () => {
                    const fullFilePath = path.resolve(__dirname, '../../../tests/test-data/files/dummy.pdf');
                    if (!fs.existsSync(fullFilePath)) fs.writeFileSync(fullFilePath, 'dummy pdf content');
                    await profilePage.imageUploadInput.setInputFiles(fullFilePath);
                });

                await test.step('Assert error message is shown', async () => {
                    await profilePage.imageModalSaveBtn.click();
                    await expect(profilePage.imageUploadErrorMsg).toBeVisible();
                });
            });

            test('TC_Image_RejectSizeExceeded - errors when file exceeds 1MB', async ({ profilePage }) => {
                await profilePage.profileImgEditIcon.click();

                await test.step('Upload a >1MB file', async () => {
                    const fullFilePath = path.resolve(__dirname, '../../../tests/test-data/files/large-dummy.jpg');
                    if (!fs.existsSync(fullFilePath)) {
                        fs.writeFileSync(fullFilePath, Buffer.alloc(1.1 * 1024 * 1024));
                    }
                    await profilePage.imageUploadInput.setInputFiles(fullFilePath);
                });

                await test.step('Assert error message is shown', async () => {
                    await profilePage.imageModalSaveBtn.click();
                    await expect(profilePage.imageUploadErrorMsg).toBeVisible();
                });
            });
        });
    });

    test.describe('Blank Validations (Mandatory ON)', () => {
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
            // Find the blank scenario for this field
            const blankScenario = basicDetailsScenarios.negativeScenarios.find((s: any) => s.field === field && s.scenario.toLowerCase().includes('blank'));
            if (!blankScenario) continue;

            test(`TC_BasicDetails_${field}_Shows validation error when blank`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: '' });
                const profilePage = new ProfilePage(page);
                await profilePage.page.waitForTimeout(1000);
                await profilePage.clickEdit();
                
                const locator = profilePage.getLocator(field);
                await locator.fill('');
                await profilePage.clickSave();
                
                await expect(page.locator(`text=${blankScenario.expectedError}`).first()).toBeVisible({ timeout: 5000 });
            });
        }
    });

    test.describe('Admin Override (Individual fields non-editable)', () => {
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
            test(`TC_BasicDetails_${field}_Field becomes read-only`, async ({ page }) => {
                const profilePage = new ProfilePage(page);
                await page.waitForTimeout(1000);
                await profilePage.clickEdit();
                
                const locator = profilePage.getLocator(field);
                await expect(locator).toBeDisabled({ timeout: 5000 });
            });
        }
    });
});

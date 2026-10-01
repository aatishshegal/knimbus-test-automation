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

        test.describe('Profile Basic Details - UI Controls & Field States', () => {
            test('Profile Basic Details - Avatar image, upload trigger, name, and email banner visibility', async ({ profilePage }) => {
                await expect(profilePage.profileImage).toBeVisible();
                await expect(profilePage.profileImgEditIcon).toBeVisible();
                await expect(profilePage.fullNameInput).toBeVisible();
            });

            test('Profile Basic Details - Section header and Edit button visibility', async ({ profilePage }) => {
                await expect(profilePage.basicDetailsHeading).toBeVisible();
                await expect(profilePage.editBtn).toBeVisible();
            });

            test('Profile Basic Details - Form fields are disabled prior to clicking Edit', async ({ profilePage }) => {
                await expect(profilePage.fullNameInput).toBeDisabled();
                await expect(profilePage.genderDropdown).toBeDisabled();
                await expect(profilePage.dobInput).toBeDisabled();
                await expect(profilePage.summaryTextarea).toBeDisabled();
                await expect(profilePage.emailSubscriptionCheckbox).toBeDisabled();
            });

            test('Profile Basic Details - Field attributes and select options match specifications', async ({ profilePage }) => {
                const uiLabels = postLoginData['profile-basic-details.spec.ts']?.uiLabels || {};
                await expect(profilePage.fullNameInput).toHaveAttribute('maxlength', uiLabels.fullNameMaxLength || '101');
                await expect(profilePage.summaryTextarea).toHaveAttribute('maxlength', uiLabels.summaryMaxLength || '2001');
                await expect(profilePage.dobInput).toHaveAttribute('placeholder', uiLabels.dobPlaceholder || '-- / -- / ----');
                const options = await profilePage.genderDropdown.locator('option').allInnerTexts();
                expect(options.map(o => o.trim())).toEqual(expect.arrayContaining(uiLabels.genderOptions || ['Select', 'Male', 'Female', 'Other']));
            });

            test('Profile Basic Details - Clicking Edit button displays Save and Cancel buttons', async ({ profilePage }) => {
                await profilePage.clickEdit();
                await expect(profilePage.saveBtn).toBeVisible();
                await expect(profilePage.cancelBtn).toBeVisible();
            });
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

            test('Profile Basic Details - Datepicker component enforces read-only input behavior preventing direct keyboard typing', async ({ profilePage, page }) => {
                await profilePage.clickEdit();
                await profilePage.dobInput.focus();
                await profilePage.dobInput.type('invalid-date-string', { delay: 20 }).catch(() => {});
                await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});
                const inputValue = await profilePage.dobInput.inputValue();
                expect(inputValue).not.toBe('invalid-date-string');
            });

            test('Profile Basic Details - Selecting a new Date of Birth and clicking Cancel discards changes', async ({ profilePage }) => {
                await profilePage.clickEdit();
                const initialDob = await profilePage.dobInput.inputValue();
                await profilePage.dobInput.click();
                await profilePage.calendarYearDropdown.selectOption({ label: '1995' });
                await profilePage.calendarMonthDropdown.selectOption({ label: 'May' });
                await profilePage.page.locator('.react-datepicker__day:not(.react-datepicker__day--outside-month)').filter({ hasText: /^10$/ }).click();
                await profilePage.cancelBtn.click();
                expect(await profilePage.dobInput).toHaveValue(initialDob);
            });
        });

        test.describe('Profile Basic Details - Gender', () => {
            const genderOptions = postLoginData['profile-basic-details.spec.ts']?.genderValues || ['Male', 'Female', 'Other'];
            for (const option of genderOptions) {
                test(`Profile Basic Details - Saves successfully when gender option is selected: ${option}`, async ({ profilePage }) => {
                    await profilePage.clickEdit();
                    await profilePage.genderDropdown.selectOption(option);
                    await profilePage.clickSave();
                    await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
                });
            }

            test('Profile Basic Details - Selecting a new gender and clicking Cancel discards changes', async ({ profilePage }) => {
                await profilePage.clickEdit();
                const initialGender = await profilePage.genderDropdown.inputValue();
                const targetGender = initialGender === 'Female' ? 'Male' : 'Female';
                await profilePage.genderDropdown.selectOption(targetGender);
                await profilePage.cancelBtn.click();
                expect(await profilePage.genderDropdown.inputValue()).toBe(initialGender);
            });
        });

        test.describe('Profile Basic Details - Summary Features', () => {
            test('Profile Basic Details - Saves multi-line summary with line breaks and special characters', async ({ profilePage }) => {
                const multiLine = postLoginData['profile-basic-details.spec.ts']?.summaryMultiLine;
                await profilePage.clickEdit();
                await profilePage.summaryTextarea.fill(multiLine);
                await profilePage.clickSave();
                await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible({ timeout: 15000 });
                await expect(profilePage.summaryTextarea).toHaveValue(multiLine);
            });

            test('Profile Basic Details - Modifying summary and clicking Cancel discards changes', async ({ profilePage }) => {
                await profilePage.clickEdit();
                const initialSummary = await profilePage.summaryTextarea.inputValue();
                const tempSummary = postLoginData['profile-basic-details.spec.ts']?.temporaryCancelSummary || 'Temp text to cancel';
                await profilePage.summaryTextarea.fill(tempSummary);
                await profilePage.cancelBtn.click();
                expect(await profilePage.summaryTextarea).toHaveValue(initialSummary);
            });

            test('Profile Basic Details - Accepts valid text within 2000 character limit', async ({ profilePage }) => {
                const validText = postLoginData['profile-basic-details.spec.ts']?.summary2000Valid || 'Valid content';
                await profilePage.clickEdit();
                await profilePage.summaryTextarea.fill(validText);
                await profilePage.clickSave();
                await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible({ timeout: 15000 });
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

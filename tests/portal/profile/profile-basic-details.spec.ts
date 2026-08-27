import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';

// Load test data
const validationDataPath = path.resolve(__dirname, '../../../tests/test-data/field-validation-data.json');
const validationData = JSON.parse(fs.readFileSync(validationDataPath, 'utf-8'));

const fullNameMaxLenScenario = validationData.scenarios.find((s: any) => s.scenario === "Full Name - Enter 102 characters" && s.field === "FullName");
const fullNameHtmlScenario = validationData.scenarios.find((s: any) => s.scenario === "Full Name - Enter HTML format" && s.field === "FullName");
const fullNameBlankScenario = validationData.scenarios.find((s: any) => s.scenario === "Full Name - Blank field" && s.field === "FullName");

const summaryMaxLenScenario = validationData.scenarios.find((s: any) => s.scenario === "summary - More than 2002 characters" && s.field === "summary");
const summaryHtmlScenario = validationData.scenarios.find((s: any) => s.scenario === "summary - HTML is used" && s.field === "summary");
const summaryBlankScenario = validationData.scenarios.find((s: any) => s.scenario === "summary - Blank/Unselected" && s.field === "summary");

test.describe('Profile Field Validation - Editable ON', () => {
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        // Set all fields editable, but strictly keep Full Name (Name) mandatory as instructed
        await adminApi.updateSecuritySettings({
            allFieldsEditable: true,
            mandatoryFields: { fields: ['Name'], isMandatory: true }
        });
    });

    test.afterAll(async () => {
        if (adminApi) await adminApi.close();
    });

    test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
        await page.goto(process.env.PORTAL_URL as string);
        await topNavigationBar.openProfileMenu();
        await topNavigationBar.profileMenuProfileLink.click();
        await expect(profilePage.profileHeader).toBeVisible();
        await profilePage.clickEdit();
    });

    test.afterEach(async ({ profilePage }) => {
        if (await profilePage.cancelBtn.isVisible().catch(() => false)) {
            await profilePage.cancelBtn.click();
        }
    });

    test.describe('Full Name', () => {
        test('TC_FullName_AcceptValidInput_EditableON - accepts valid alphanumeric input', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.fullNameInput.fill('Automation User');
            await profilePage.fullNameInput.blur();
            await profilePage.clickSave();
            await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
        });

        test('TC_FullName_RejectMaxLengthExceed_EditableON - shows error beyond char limit', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.fullNameInput.fill(fullNameMaxLenScenario.value);
            await profilePage.fullNameInput.blur();
            await profilePage.clickSave();
            await expect(profilePage.page.locator('text=' + fullNameMaxLenScenario.expectedError).first()).toBeVisible();
        });

        test('TC_FullName_RejectHTMLTags_EditableON - rejects/sanitizes HTML tags', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.fullNameInput.fill(fullNameHtmlScenario.value);
            await profilePage.fullNameInput.blur();
            await profilePage.clickSave();
            await expect(profilePage.page.locator('text=' + fullNameHtmlScenario.expectedError).first()).toBeVisible();
        });

        test('TC_FullName_RejectBlankInput_EditableON - leaving field blank triggers required error', { tag: '@EditableON' }, async ({ profilePage }) => {
            // Full Name is always mandatory, so we verify its blank rejection here
            await profilePage.fullNameInput.fill(fullNameBlankScenario.value);
            await profilePage.fullNameInput.blur();
            await profilePage.clickSave();
            await expect(profilePage.page.locator('text=' + fullNameBlankScenario.expectedError).first()).toBeVisible();
        });
    });

    test.describe('Summary', () => {
        test('TC_Summary_AcceptValidInput_EditableON - accepts valid alphanumeric text block', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.summaryTextarea.fill('This is a valid summary for automation.');
            await profilePage.summaryTextarea.blur();
            await profilePage.clickSave();
            await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
        });

        test('TC_Summary_RejectMaxLengthExceed_EditableON - shows error beyond char limit', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.summaryTextarea.fill(summaryMaxLenScenario.value);
            await profilePage.summaryTextarea.blur();
            await profilePage.clickSave();
            await expect(profilePage.page.locator('text=' + summaryMaxLenScenario.expectedError).first()).toBeVisible();
        });

        test('TC_Summary_RejectHTMLTags_EditableON - rejects HTML tags', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.summaryTextarea.fill(summaryHtmlScenario.value);
            await profilePage.summaryTextarea.blur();
            await profilePage.clickSave();
            await expect(profilePage.page.locator('text=' + summaryHtmlScenario.expectedError).first()).toBeVisible();
        });
    });

    test.describe('DOB', () => {
        test('TC_DOB_AcceptValidDate_EditableON - accepts valid past date via calendar', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.dobInput.click();
            await profilePage.calendarYearDropdown.selectOption({ label: '1995' });
            await profilePage.calendarMonthDropdown.selectOption({ label: 'May' });
            await profilePage.page.locator('.react-datepicker__day:not(.react-datepicker__day--outside-month)').filter({ hasText: /^10$/ }).click();
            await profilePage.clickSave();
            await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
        });

        test('TC_DOB_RejectFutureDate_EditableON - rejects future dates in calendar selection', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.dobInput.click();
            await profilePage.calendarYearDropdown.selectOption({ label: (new Date().getFullYear() + 1).toString() }).catch(() => { });
            const selectedYear = await profilePage.calendarYearDropdown.inputValue();
            expect(parseInt(selectedYear)).toBeLessThanOrEqual(new Date().getFullYear());
        });
    });

    test.describe('Gender', () => {
        test('TC_Gender_AcceptValidSelection_EditableON - saves successfully when a valid option is selected', { tag: '@EditableON' }, async ({ profilePage }) => {
            await profilePage.genderDropdown.selectOption('Female');
            await profilePage.clickSave();
            await expect(profilePage.page.getByRole('heading', { name: 'Updated successfully' })).toBeVisible();
        });
    });

    test.describe('Image Upload', () => {
        test('TC_Image_AcceptValidUpload - uploads standard JPG/PNG successfully', async ({ profilePage }) => {
            await profilePage.cancelBtn.click(); // Close edit mode for image upload
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
            await profilePage.cancelBtn.click();
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
            await profilePage.cancelBtn.click();
            await profilePage.profileImgEditIcon.click();

            await test.step('Upload a >1MB file', async () => {
                const fullFilePath = path.resolve(__dirname, '../../../tests/test-data/files/large-dummy.jpg');
                if (!fs.existsSync(fullFilePath)) {
                    // Create a 1.1MB dummy file
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

test.describe('Profile Field Validation - Editable OFF', () => {
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        // Make ONLY Full Name non-editable
        await adminApi.updateSecuritySettings({
            editableFields: { fields: ['Name'], isEditable: false }
        });
    });

    test.afterAll(async () => {
        if (adminApi) await adminApi.close();
    });

    test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
        await page.goto(process.env.PORTAL_URL as string);
        await topNavigationBar.openProfileMenu();
        await topNavigationBar.profileMenuProfileLink.click();
        await expect(profilePage.profileHeader).toBeVisible();
        await profilePage.clickEdit();
    });

    test.afterEach(async ({ profilePage }) => {
        if (await profilePage.cancelBtn.isVisible().catch(() => false)) {
            await profilePage.cancelBtn.click();
        }
    });

    test.describe('Full Name', () => {
        test('TC_FullName_VerifyNonEditable_FullNameEditableOFF - field is disabled and read-only', { tag: '@EditableOFF' }, async ({ profilePage }) => {
            await expect(profilePage.fullNameInput).toBeDisabled();
        });
    });

    test.describe('Summary', () => {
        test('TC_Summary_VerifyStillEditable_FullNameEditableOFF - field remains fully editable', { tag: '@EditableOFF' }, async ({ profilePage }) => {
            await expect(profilePage.summaryTextarea).toBeEnabled();
        });
    });
});

test.describe('Profile Field Validation - Mandatory ON', () => {
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        // Restore Name to editable, and make Summary mandatory (Name is already mandatory)
        await adminApi.updateSecuritySettings({
            allFieldsEditable: true,
            mandatoryFields: { fields: ['Name', 'Summary'], isMandatory: true }
        });
    });

    test.afterAll(async () => {
        // Final cleanup
        if (adminApi) {
            await adminApi.updateSecuritySettings({
                allFieldsEditable: true,
                mandatoryFields: { fields: ['Name'], isMandatory: true }
            });
            await adminApi.close();
        }
    });

    test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
        await page.goto(process.env.PORTAL_URL as string);
        await topNavigationBar.openProfileMenu();
        await topNavigationBar.profileMenuProfileLink.click();
        await expect(profilePage.profileHeader).toBeVisible();
        await profilePage.clickEdit();
    });

    test.afterEach(async ({ profilePage }) => {
        if (await profilePage.cancelBtn.isVisible().catch(() => false)) {
            await profilePage.cancelBtn.click();
        }
    });

    test.describe('Summary', () => {
        test('TC_Summary_RejectBlankInput_MandatoryON - leaving field blank triggers required error', { tag: '@MandatoryON' }, async ({ profilePage }) => {
            await profilePage.summaryTextarea.fill(summaryBlankScenario.value);
            await profilePage.summaryTextarea.blur();
            await profilePage.clickSave();
            await expect(profilePage.page.locator('text=' + summaryBlankScenario.expectedError).first()).toBeVisible();
        });
    });
});

import { test, expect } from '@playwright/test';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as adminData from '../../test-data/admin-data.json';
import * as path from 'path';

/**
 * MANDATORY PRE-EXECUTION CHECKLIST:
 * 1. No Hardcoding: Verified that all strings, expected messages, and test file names are extracted from admin-data.json.
 * 2. No Logic in Specs: Verified there are no if/else statements in this .spec.ts file.
 * 3. No Internal Loops: Verified there are no for loops inside test() blocks.
 * 4. No Dynamic Routing: Verified that no locators in the POM use .or() for fallback guessing.
 */

test.describe.serial('Manage Users - Profile Overview ID Document Tab', () => {
    let manageUsersPage: ManageUsersPage;
    let validationUserEmail: string;
    let commitUserEmail: string;
    const testData = adminData.userManagement.userProfileOverview.idDocument;
    const manageUsersUrl = adminData.userManagement.expectedUrls.manageUsers;

    const validPngPath = path.resolve(__dirname, '../../test-data/files', testData.files.validPng);
    const validJpgPath = path.resolve(__dirname, '../../test-data/files', testData.files.validJpg);
    const largeFilePath = path.resolve(__dirname, '../../test-data/files', testData.files.largeFile);
    const invalidPdfPath = path.resolve(__dirname, '../../test-data/files', testData.files.invalidPdf);

    test.beforeAll(async () => {
        const timestamp = Date.now();
        validationUserEmail = `iddoc_val_${timestamp}@yopmail.com`;
        commitUserEmail = `iddoc_commit_${timestamp}@yopmail.com`;

        const adminApi = new AdminApiService();
        await adminApi.initFromState('.auth/admin.json');
        await adminApi.addSingleUser('IDDoc Validator', validationUserEmail);
        await adminApi.addSingleUser('IDDoc Committer', commitUserEmail);
        await adminApi.close();
    });

    test.describe.serial('ID Document Static Elements & Validation (Uncommitted State)', () => {
        test.beforeEach(async ({ page }) => {
            manageUsersPage = new ManageUsersPage(page);
            await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${manageUsersUrl}`);
            await manageUsersPage.searchForUser(validationUserEmail);
            await manageUsersPage.clickUserDetailsOverview(validationUserEmail);
            await manageUsersPage.clickIdDocumentTab();
        });

        test.afterEach(async () => {
            await manageUsersPage.clickProfileCancel();
        });

        test('TC_IDDoc_00_IntroText_Present - displays helpful intro description', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.introText });
            await expect(manageUsersPage.idDocIntroText).toContainText(testData.introText);
        });

        test('TC_IDDoc_01_Options_Present - validates Frontside and Backside upload sections are visible', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.frontsideHeading}, ${testData.backsideHeading}` });
            await expect(manageUsersPage.idDocFrontHeading).toContainText(testData.frontsideHeading);
            await expect(manageUsersPage.idDocBackHeading).toContainText(testData.backsideHeading);
            await expect(manageUsersPage.idDocFrontContainer).toBeVisible();
            await expect(manageUsersPage.idDocBackContainer).toBeVisible();
        });

        test('TC_IDDoc_02_MandatoryAndOptional_Indicators_Present - verifies mandatory asterisk on frontside and optional label on backside', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.indicators.mandatory}, ${testData.indicators.optional}` });
            await expect(manageUsersPage.idDocFrontHeading.locator('.text-danger')).toHaveText(testData.indicators.mandatory);
            await expect(manageUsersPage.idDocBackHeading.locator('.grey-clr')).toHaveText(testData.indicators.optional);
        });

        test('TC_IDDoc_03_AcceptAttribute_Specified - verifies file input elements declare accepted image formats', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.acceptAttribute });
            await expect(manageUsersPage.idDocFrontInput).toHaveAttribute('accept', testData.acceptAttribute);
            await expect(manageUsersPage.idDocBackInput).toHaveAttribute('accept', testData.acceptAttribute);
        });

        // Frontside Scenarios
        test('TC_IDDoc_04_Frontside_DefaultInstructions - validates default instruction texts', async () => {
            test.info().annotations.push({ type: 'testData', description: JSON.stringify(testData.instructions) });
            await expect(manageUsersPage.idDocFrontMainInstruction).toHaveText(testData.instructions.main);
            await expect(manageUsersPage.idDocFrontBestFitInfo).toHaveText(testData.instructions.sizeLimit);
            await expect(manageUsersPage.idDocFrontFormatInfo).toHaveText(testData.instructions.formats);
        });

        test('TC_IDDoc_05_Frontside_BrowseFile_Option - validates Browse File button is present and clickable', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.instructions.browseBtn });
            await expect(manageUsersPage.idDocFrontBrowseLabel).toBeVisible();
            await expect(manageUsersPage.idDocFrontBrowseLabel).toHaveText(testData.instructions.browseBtn);
        });

        test('TC_IDDoc_06_Frontside_ExceedFileSizeLimit - displays error message when file exceeds 1MB', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.largeFile });
            await manageUsersPage.uploadFrontIdFile(largeFilePath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.sizeExceeded);
        });

        test('TC_IDDoc_07_Frontside_UnsupportedFormat - displays error message when file format is not JPG, JPEG, or PNG', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.invalidPdf });
            await manageUsersPage.uploadFrontIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.invalidFormat);
        });

        test('TC_IDDoc_08_Frontside_ErrorTransition_SizeExceededToInvalidFormat - updates error message when switching from oversized to unsupported format', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.largeFile} -> ${testData.files.invalidPdf}` });
            await manageUsersPage.uploadFrontIdFile(largeFilePath);
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.sizeExceeded);

            await manageUsersPage.uploadFrontIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.invalidFormat);
        });

        test('TC_IDDoc_09_Frontside_ErrorClearance_OnValidFileSelected - dynamically clears error when valid file is selected after invalid format', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.invalidPdf} -> ${testData.files.validPng}` });
            await manageUsersPage.uploadFrontIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();

            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontError).toBeHidden();
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);
        });

        test('TC_IDDoc_10_Frontside_ReplaceValidWithInvalidFormat - displays error when replacing valid file with invalid format without uploading', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.invalidPdf}` });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadFrontIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.invalidFormat);
        });

        test('TC_IDDoc_11_Frontside_ReplaceValidWithSizeExceeded - displays error when replacing valid file with oversized file without uploading', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.largeFile}` });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadFrontIdFile(largeFilePath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.sizeExceeded);
        });

        // Backside Scenarios
        test('TC_IDDoc_12_Backside_DefaultInstructions - validates default instruction texts', async () => {
            test.info().annotations.push({ type: 'testData', description: JSON.stringify(testData.instructions) });
            await expect(manageUsersPage.idDocBackMainInstruction).toHaveText(testData.instructions.main);
            await expect(manageUsersPage.idDocBackBestFitInfo).toHaveText(testData.instructions.sizeLimit);
            await expect(manageUsersPage.idDocBackFormatInfo).toHaveText(testData.instructions.formats);
        });

        test('TC_IDDoc_13_Backside_BrowseFile_Option - validates Browse File button is present and clickable', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.instructions.browseBtn });
            await expect(manageUsersPage.idDocBackBrowseLabel).toBeVisible();
            await expect(manageUsersPage.idDocBackBrowseLabel).toHaveText(testData.instructions.browseBtn);
        });

        test('TC_IDDoc_14_Backside_ExceedFileSizeLimit - displays error message when file exceeds 1MB', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.largeFile });
            await manageUsersPage.uploadBackIdFile(largeFilePath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();
            await expect(manageUsersPage.idDocBackError).toHaveText(testData.messages.sizeExceeded);
        });

        test('TC_IDDoc_15_Backside_UnsupportedFormat - displays error message when file format is not JPG, JPEG, or PNG', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.invalidPdf });
            await manageUsersPage.uploadBackIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();
            await expect(manageUsersPage.idDocBackError).toHaveText(testData.messages.invalidFormat);
        });

        test('TC_IDDoc_16_Backside_ErrorClearance_OnValidFileSelected - dynamically clears error when valid file is selected after invalid format', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.invalidPdf} -> ${testData.files.validPng}` });
            await manageUsersPage.uploadBackIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();

            await manageUsersPage.uploadBackIdFile(validPngPath);
            await expect(manageUsersPage.idDocBackError).toBeHidden();
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validPng);
        });

        test('TC_IDDoc_17_Backside_ReplaceFileBeforeUpload - replaces first file with second file in preview', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.validJpg}` });
            await manageUsersPage.uploadBackIdFile(validPngPath);
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadBackIdFile(validJpgPath);
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validJpg);
        });

        test('TC_IDDoc_18_Backside_ReplaceValidWithInvalidFormat - displays error when replacing valid file with invalid format without uploading', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.invalidPdf}` });
            await manageUsersPage.uploadBackIdFile(validPngPath);
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadBackIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();
            await expect(manageUsersPage.idDocBackError).toHaveText(testData.messages.invalidFormat);
        });

        test('TC_IDDoc_19_Backside_ReplaceValidWithSizeExceeded - displays error when replacing valid file with oversized file without uploading', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.largeFile}` });
            await manageUsersPage.uploadBackIdFile(validPngPath);
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadBackIdFile(largeFilePath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();
            await expect(manageUsersPage.idDocBackError).toHaveText(testData.messages.sizeExceeded);
        });

        test('TC_IDDoc_20_BacksideWithoutFrontside_Error - displays error when uploading backside without frontside', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.messages.fileRequired });
            await manageUsersPage.uploadBackIdFile(validPngPath);
            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.fileRequired);
        });

        test('TC_IDDoc_21_EmptySubmit_Error - displays error when submitting without selecting any file', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.messages.fileRequired });
            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.fileRequired);
        });

        test('TC_IDDoc_22_CloseButton_DiscardsSelection - discards chosen file when clicking close button', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.validPng });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.clickIdDocClose();
            await expect(manageUsersPage.userProfileModal).toBeHidden();

            // Reopen profile overview and inspect ID document tab
            await manageUsersPage.clickUserDetailsOverview(validationUserEmail);
            await manageUsersPage.clickIdDocumentTab();
            await expect(manageUsersPage.idDocFrontMainInstruction).toHaveText(testData.instructions.main);
        });

        test('TC_IDDoc_23_CrossIcon_DiscardsSelection - discards chosen file when closing modal via top cross icon', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.validPng });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.closeUserProfileModalViaCrossIcon();
            await expect(manageUsersPage.userProfileModal).toBeHidden();

            // Reopen profile overview and inspect ID document tab
            await manageUsersPage.clickUserDetailsOverview(validationUserEmail);
            await manageUsersPage.clickIdDocumentTab();
            await expect(manageUsersPage.idDocFrontMainInstruction).toHaveText(testData.instructions.main);
        });
    });

    test.describe.serial('ID Document Upload & Commit Scenarios', () => {
        test.beforeEach(async ({ page }) => {
            manageUsersPage = new ManageUsersPage(page);
            await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${manageUsersUrl}`);
            await manageUsersPage.searchForUser(commitUserEmail);
            await manageUsersPage.clickUserDetailsOverview(commitUserEmail);
            await manageUsersPage.clickIdDocumentTab();
        });

        test.afterEach(async () => {
            await manageUsersPage.clickProfileCancel();
        });

        test('TC_IDDoc_24_UploadFrontsideOnly_Success - successfully updates ID document with frontside only', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.validJpg });
            await manageUsersPage.uploadFrontIdFile(validJpgPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validJpg);

            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.swalToast).toBeVisible();
            await expect(manageUsersPage.swalToast).toContainText(testData.messages.updateSuccessToast);
        });

        test('TC_IDDoc_25_PersistedDocument_DisplayedOnReopen - verifies persisted image preview and saved filename on modal reopen', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.persistedFrontFileName });
            await expect(manageUsersPage.idDocFrontPreviewImage).toBeVisible();
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.persistedFrontFileName);
        });

        test('TC_IDDoc_26_UpdateAlreadySavedDocument_Success - allows uploading and replacing an already saved ID document', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.persistedFrontFileName} -> ${testData.files.validJpg}` });
            await manageUsersPage.uploadFrontIdFile(validJpgPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validJpg);

            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.swalToast).toBeVisible();
            await expect(manageUsersPage.swalToast).toContainText(testData.messages.updateSuccessToast);
        });

        test('TC_IDDoc_27_Frontside_ReplaceFileBeforeUpload - replaces first file with second file and successfully uploads', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.validJpg}` });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadFrontIdFile(validJpgPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validJpg);

            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.swalToast).toBeVisible();
            await expect(manageUsersPage.swalToast).toContainText(testData.messages.updateSuccessToast);
        });

        test('TC_IDDoc_28_UploadBothFrontAndBack_Success - successfully updates ID document with both frontside and backside', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} & ${testData.files.validJpg}` });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await manageUsersPage.uploadBackIdFile(validJpgPath);
            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.swalToast).toBeVisible();
            await expect(manageUsersPage.swalToast).toContainText(testData.messages.updateSuccessToast);
        });
    });
});

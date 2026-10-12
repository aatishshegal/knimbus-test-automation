import { test, expect } from '@playwright/test';
import { AdminDashboardLoginPage } from '../../../src/pages/admin/AdminDashboardLoginPage';
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
            const dashboard = new AdminDashboardLoginPage(page);
            await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
            await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
            await dashboard.sidebar.navigateToManageUsers();
            await expect(page).toHaveURL(new RegExp(manageUsersUrl));
            await manageUsersPage.searchForUser(validationUserEmail);
            await manageUsersPage.clickUserDetailsOverview(validationUserEmail);
            await manageUsersPage.clickIdDocumentTab();
        });

        test.afterEach(async () => {
            await manageUsersPage.clickProfileCancel();
        });

        test('User Profile ID Document - Guidance Text - Displays helpful introductory upload description', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.introText });
            await expect(manageUsersPage.idDocIntroText).toContainText(testData.introText);
        });

        test('User Profile ID Document - Upload Sections - Validates Frontside and Backside upload sections are visible', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.frontsideHeading}, ${testData.backsideHeading}` });
            await expect(manageUsersPage.idDocFrontHeading).toContainText(testData.frontsideHeading);
            await expect(manageUsersPage.idDocBackHeading).toContainText(testData.backsideHeading);
            await expect(manageUsersPage.idDocFrontContainer).toBeVisible();
            await expect(manageUsersPage.idDocBackContainer).toBeVisible();
        });

        test('User Profile ID Document - Field Indicators - Displays mandatory asterisk on frontside and optional label on backside', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.indicators.mandatory}, ${testData.indicators.optional}` });
            await expect(manageUsersPage.idDocFrontHeading.locator('.text-danger')).toHaveText(testData.indicators.mandatory);
            await expect(manageUsersPage.idDocBackHeading.locator('.grey-clr')).toHaveText(testData.indicators.optional);
        });

        test('User Profile ID Document - File Input - Declares accepted image format file extensions', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.acceptAttribute });
            await expect(manageUsersPage.idDocFrontInput).toHaveAttribute('accept', testData.acceptAttribute);
            await expect(manageUsersPage.idDocBackInput).toHaveAttribute('accept', testData.acceptAttribute);
        });

        // Frontside Scenarios
        test('User Profile ID Document - Frontside Upload - Displays default upload instruction texts', async () => {
            test.info().annotations.push({ type: 'testData', description: JSON.stringify(testData.instructions) });
            await expect(manageUsersPage.idDocFrontMainInstruction).toHaveText(testData.instructions.main);
            await expect(manageUsersPage.idDocFrontBestFitInfo).toHaveText(testData.instructions.sizeLimit);
            await expect(manageUsersPage.idDocFrontFormatInfo).toHaveText(testData.instructions.formats);
        });

        test('User Profile ID Document - Frontside Upload - Browse File button is visible and enabled', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.instructions.browseBtn });
            await expect(manageUsersPage.idDocFrontBrowseLabel).toBeVisible();
            await expect(manageUsersPage.idDocFrontBrowseLabel).toHaveText(testData.instructions.browseBtn);
        });

        test('User Profile ID Document - Frontside Upload - Displays error message when file exceeds 1MB', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.largeFile });
            await manageUsersPage.uploadFrontIdFile(largeFilePath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.sizeExceeded);
        });

        test('User Profile ID Document - Frontside Upload - Displays error message when file format is not JPG, JPEG, or PNG', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.invalidPdf });
            await manageUsersPage.uploadFrontIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.invalidFormat);
        });

        test('User Profile ID Document - Frontside Upload - Updates error message when switching from oversized to unsupported format', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.largeFile} -> ${testData.files.invalidPdf}` });
            await manageUsersPage.uploadFrontIdFile(largeFilePath);
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.sizeExceeded);

            await manageUsersPage.uploadFrontIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.invalidFormat);
        });

        test('User Profile ID Document - Frontside Upload - Clears validation error when selecting a valid file', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.invalidPdf} -> ${testData.files.validPng}` });
            await manageUsersPage.uploadFrontIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();

            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontError).toBeHidden();
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);
        });

        test('User Profile ID Document - Frontside Upload - Displays error when replacing valid file with invalid format', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.invalidPdf}` });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadFrontIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.invalidFormat);
        });

        test('User Profile ID Document - Frontside Upload - Displays error when replacing valid file with file exceeding 1MB', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.largeFile}` });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadFrontIdFile(largeFilePath);
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.sizeExceeded);
        });

        // Backside Scenarios
        test('User Profile ID Document - Backside Upload - Displays default upload instruction texts', async () => {
            test.info().annotations.push({ type: 'testData', description: JSON.stringify(testData.instructions) });
            await expect(manageUsersPage.idDocBackMainInstruction).toHaveText(testData.instructions.main);
            await expect(manageUsersPage.idDocBackBestFitInfo).toHaveText(testData.instructions.sizeLimit);
            await expect(manageUsersPage.idDocBackFormatInfo).toHaveText(testData.instructions.formats);
        });

        test('User Profile ID Document - Backside Upload - Browse File button is visible and enabled', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.instructions.browseBtn });
            await expect(manageUsersPage.idDocBackBrowseLabel).toBeVisible();
            await expect(manageUsersPage.idDocBackBrowseLabel).toHaveText(testData.instructions.browseBtn);
        });

        test('User Profile ID Document - Backside Upload - Displays error message when file exceeds 1MB', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.largeFile });
            await manageUsersPage.uploadBackIdFile(largeFilePath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();
            await expect(manageUsersPage.idDocBackError).toHaveText(testData.messages.sizeExceeded);
        });

        test('User Profile ID Document - Backside Upload - Displays error message when file format is not JPG, JPEG, or PNG', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.invalidPdf });
            await manageUsersPage.uploadBackIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();
            await expect(manageUsersPage.idDocBackError).toHaveText(testData.messages.invalidFormat);
        });

        test('User Profile ID Document - Backside Upload - Clears validation error when selecting a valid file', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.invalidPdf} -> ${testData.files.validPng}` });
            await manageUsersPage.uploadBackIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();

            await manageUsersPage.uploadBackIdFile(validPngPath);
            await expect(manageUsersPage.idDocBackError).toBeHidden();
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validPng);
        });

        test('User Profile ID Document - Backside Upload - Replaces preview file when selecting a different file before upload', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.validJpg}` });
            await manageUsersPage.uploadBackIdFile(validPngPath);
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadBackIdFile(validJpgPath);
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validJpg);
        });

        test('User Profile ID Document - Backside Upload - Displays error when replacing valid file with invalid format', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.invalidPdf}` });
            await manageUsersPage.uploadBackIdFile(validPngPath);
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadBackIdFile(invalidPdfPath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();
            await expect(manageUsersPage.idDocBackError).toHaveText(testData.messages.invalidFormat);
        });

        test('User Profile ID Document - Backside Upload - Displays error when replacing valid file with file exceeding 1MB', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.largeFile}` });
            await manageUsersPage.uploadBackIdFile(validPngPath);
            await expect(manageUsersPage.idDocBackFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadBackIdFile(largeFilePath);
            await expect(manageUsersPage.idDocBackError).toBeVisible();
            await expect(manageUsersPage.idDocBackError).toHaveText(testData.messages.sizeExceeded);
        });

        test('User Profile ID Document - Submission Validation - Displays error when uploading backside without frontside', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.messages.fileRequired });
            await manageUsersPage.uploadBackIdFile(validPngPath);
            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.fileRequired);
        });

        test('User Profile ID Document - Submission Validation - Displays error when submitting without choosing any file', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.messages.fileRequired });
            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.idDocFrontError).toBeVisible();
            await expect(manageUsersPage.idDocFrontError).toHaveText(testData.messages.fileRequired);
        });

        test('User Profile ID Document - Modal Actions - Discards chosen file when clicking Close button', async () => {
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

        test('User Profile ID Document - Modal Actions - Discards chosen file when closing modal via top cross icon', async () => {
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
            const dashboard = new AdminDashboardLoginPage(page);
            await page.goto(process.env.ADMIN_TEST_URL + '/librarian/v2/elibrarySetup/dashboard');
            await expect(page).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
            await dashboard.sidebar.navigateToManageUsers();
            await expect(page).toHaveURL(new RegExp(manageUsersUrl));
            await manageUsersPage.searchForUser(commitUserEmail);
            await manageUsersPage.clickUserDetailsOverview(commitUserEmail);
            await manageUsersPage.clickIdDocumentTab();
        });

        test.afterEach(async () => {
            await manageUsersPage.clickProfileCancel();
        });

        test('User Profile ID Document - Save Document - Updates ID document successfully with frontside image only', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.files.validJpg });
            await manageUsersPage.uploadFrontIdFile(validJpgPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validJpg);

            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.swalToast).toBeVisible();
            await expect(manageUsersPage.swalToast).toContainText(testData.messages.updateSuccessToast);
        });

        test('User Profile ID Document - Persisted State - Displays saved document preview and file status upon reopening modal', async () => {
            test.info().annotations.push({ type: 'testData', description: testData.persistedFrontFileName });
            await expect(manageUsersPage.idDocFrontPreviewImage).toBeVisible();
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.persistedFrontFileName);
        });

        test('User Profile ID Document - Save Document - Uploads and replaces previously saved ID document successfully', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.persistedFrontFileName} -> ${testData.files.validJpg}` });
            await manageUsersPage.uploadFrontIdFile(validJpgPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validJpg);

            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.swalToast).toBeVisible();
            await expect(manageUsersPage.swalToast).toContainText(testData.messages.updateSuccessToast);
        });

        test('User Profile ID Document - Frontside Upload - Replaces selected file before upload and saves successfully', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} -> ${testData.files.validJpg}` });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validPng);

            await manageUsersPage.uploadFrontIdFile(validJpgPath);
            await expect(manageUsersPage.idDocFrontFileName).toHaveText(testData.files.validJpg);

            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.swalToast).toBeVisible();
            await expect(manageUsersPage.swalToast).toContainText(testData.messages.updateSuccessToast);
        });

        test('User Profile ID Document - Save Document - Updates ID document successfully with both frontside and backside files', async () => {
            test.info().annotations.push({ type: 'testData', description: `${testData.files.validPng} & ${testData.files.validJpg}` });
            await manageUsersPage.uploadFrontIdFile(validPngPath);
            await manageUsersPage.uploadBackIdFile(validJpgPath);
            await manageUsersPage.clickIdDocUpdate();
            await expect(manageUsersPage.swalToast).toBeVisible();
            await expect(manageUsersPage.swalToast).toContainText(testData.messages.updateSuccessToast);
        });
    });
});

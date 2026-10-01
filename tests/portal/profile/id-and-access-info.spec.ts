import { test, expect } from '../../../src/fixtures';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import { IdAndAccessInfoPage } from '../../../src/pages/portal/IdAndAccessInfoPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { TermsAndConditionsModal } from '../../../src/pages/portal/TermsAndConditionsModal';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';

// Load post-login profile data
const postLoginDataPath = path.resolve(__dirname, '../../../tests/test-data/portal/profile-data.json');
const postLoginData = JSON.parse(fs.readFileSync(postLoginDataPath, 'utf-8'));
const idDocumentScenarios = postLoginData['id-and-access-info.spec.ts']?.data || postLoginData['id-and-access-info.spec.ts'] || [];

test.describe('Profile Details - ID & Access Info Suite', () => {
    let topNav: TopNavigationBar;
    let idAccessPage: IdAndAccessInfoPage;
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

    test.describe('ID & Access - Document Upload Validations', () => {
        test.beforeEach(async ({ page }) => {
            topNav = new TopNavigationBar(page);
            idAccessPage = new IdAndAccessInfoPage(page);

            await page.goto(process.env.PORTAL_URL as string);
            await topNav.openProfileMenu();
            await topNav.profileMenuProfileLink.click();
            
            await page.getByRole('tab', { name: /Id & Access Info/i }).click();
            await expect(idAccessPage.pageHeading).toBeVisible();
        });

        test('ID and Access - Section heading, help texts, and file input controls are visible', async () => {
            const uiLabels = postLoginData['id-and-access-info.spec.ts']?.uiLabels || {};
            await expect(idAccessPage.pageHeading).toHaveText(uiLabels.heading || 'Id Document');
            await expect(idAccessPage.helpText1).toContainText(uiLabels.helpText1 || 'Upload an ID');
            await expect(idAccessPage.helpText2).toContainText(uiLabels.helpText2 || 'Note:');
            await expect(idAccessPage.frontsideHeading).toBeVisible();
            await expect(idAccessPage.backsideHeading).toBeVisible();
            await expect(idAccessPage.frontsideUploadInput).toHaveAttribute('accept', expect.stringContaining('.jpg'));
            await expect(idAccessPage.backsideUploadInput).toHaveAttribute('accept', expect.stringContaining('.jpg'));
            await expect(idAccessPage.saveBtn).toBeVisible();
        });

        test('ID and Access - Prompts error when saving without choosing any ID files', async () => {
            const uiLabels = postLoginData['id-and-access-info.spec.ts']?.uiLabels || {};
            await idAccessPage.clearFrontsideDocument();
            await idAccessPage.clearBacksideDocument();
            await idAccessPage.saveBtn.click();
            await expect(idAccessPage.pleaseChooseFileError).toContainText(uiLabels.pleaseChooseFile || 'Please choose a file');
        });

        test('ID and Access - Clears selected files from frontside and backside inputs', async () => {
            const dataDir = path.resolve(__dirname, '../../../tests/test-data');
            const validDocPath = path.resolve(dataDir, 'dummy-id.jpg');
            await idAccessPage.frontsideUploadInput.setInputFiles(validDocPath);
            await idAccessPage.backsideUploadInput.setInputFiles(validDocPath);
            await idAccessPage.clearFrontsideDocument();
            await idAccessPage.clearBacksideDocument();
            expect(await idAccessPage.frontsideUploadInput.inputValue()).toBe('');
            expect(await idAccessPage.backsideUploadInput.inputValue()).toBe('');
        });
        for (const s of idDocumentScenarios) {
            const testTitle = s.ScenarioType === 'Positive'
                ? `ID and Access - Uploads valid document: ${s.Scenario}`
                : `ID and Access - Rejects invalid document upload: ${s.Scenario}`;

            test(testTitle, async ({ page }) => {
                const dataDir = path.resolve(__dirname, '../../../tests/test-data');
                const filesDir = path.resolve(__dirname, '../../../tests/test-data/files');
                
                let finalPath1: string | undefined;
                let finalPath2: string | undefined;

                if (s.FileName1) {
                    const filePath1 = path.resolve(filesDir, s.FileName1);
                    finalPath1 = fs.existsSync(filePath1) ? filePath1 : path.resolve(dataDir, s.FileName1);
                }

                if (s.FileName2) {
                    const filePath2 = path.resolve(filesDir, s.FileName2);
                    finalPath2 = fs.existsSync(filePath2) ? filePath2 : path.resolve(dataDir, s.FileName2);
                }

                await idAccessPage.uploadIdDocuments(finalPath1, finalPath2);

                if (s.ScenarioType === 'Positive') {
                    if (s.FileName1) {
                        await expect(idAccessPage.frontsideContainer.locator('img').first()).toBeVisible({ timeout: 5000 });
                    }
                    if (s.FileName2) {
                        await expect(idAccessPage.backsideContainer.locator('img').first()).toBeVisible({ timeout: 5000 });
                    }
                } else {
                    const msgLocator = page.getByText(s.ExpectedMessage, { exact: false });
                    await expect(msgLocator.first()).toBeVisible({ timeout: 5000 });
                }
            });
        }
    });
});

test.describe('Profile Details - Off-Campus Access Workflow', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    let adminApi: AdminApiService;
    const testUserPassword = process.env.DEFAULT_PASSWORD as string;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        await adminApi.updateSecuritySettings({
            mandatoryFields: { fields: [], isMandatory: false }
        });
    });

    test.afterAll(async () => {
        if (adminApi) await adminApi.close();
    });

    test('Off-Campus Access - Request lifecycle verifies pending state, decline by admin, and re-submission', async ({ page, termsAndConditionsModal, topNavigationBar, portalLoginPage }) => {
        const uniqueId = Date.now().toString().slice(-6);
        const testUserEmail = `oca_user_${uniqueId}@yopmail.com`;
        await adminApi.addSingleUser(`OCA User ${uniqueId}`, testUserEmail);
        await adminApi.changeUserPassword(testUserEmail, testUserPassword);

        const idAccessPage = new IdAndAccessInfoPage(page);

        // Phase 1: Login as New User and Verify Default Pending State
        await portalLoginPage.login(testUserEmail, testUserPassword);
        await termsAndConditionsModal.handleTermsAndConditionsIfVisible();
        if (page.url().includes('mandatory') || await page.getByText(/Fill the mandatory detail/i).isVisible().catch(() => false)) {
            await page.goto(process.env.PORTAL_URL as string);
        }
        await expect(topNavigationBar.profileDropdown).toBeVisible({ timeout: 15000 });

        await topNavigationBar.navigateToProfile();
        await page.getByRole('tab', { name: /Id & Access Info/i }).click();
        await idAccessPage.verifyAccessState('pending');

        // Phase 2: Admin Declines Request via API & User Verifies Not Activated State
        await adminApi.declineOcaRequest(testUserEmail);
        await page.reload();
        await page.getByRole('tab', { name: /Id & Access Info/i }).click();
        await idAccessPage.verifyAccessState('notActivated');

        // Phase 3: User Raises a New Request & Verifies State Returns to Pending
        await idAccessPage.raiseRequestBtn.scrollIntoViewIfNeeded();
        await expect(idAccessPage.raiseRequestBtn).toBeEnabled({ timeout: 10000 });
        await idAccessPage.raiseOcaRequest();
        await idAccessPage.verifyAccessState('pending');
    });
});

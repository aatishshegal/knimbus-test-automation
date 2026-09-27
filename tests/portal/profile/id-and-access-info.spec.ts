import { test, expect } from '../../../src/fixtures';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import { IdAndAccessInfoPage } from '../../../src/pages/portal/IdAndAccessInfoPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { WelcomePage } from '../../../src/pages/portal/WelcomePage';
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
    let testUserEmail: string;
    const testUserPassword = process.env.DEFAULT_PASSWORD as string;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        
        const uniqueId = Date.now().toString().slice(-6);
        testUserEmail = `oca_user_${uniqueId}@yopmail.com`;
        
        await adminApi.addSingleUser(`OCA User ${uniqueId}`, testUserEmail);
        await adminApi.changeUserPassword(testUserEmail, testUserPassword);
    });

    test.afterAll(async () => {
        if (adminApi) await adminApi.close();
    });

    test('Off-Campus Access - Request lifecycle verifies pending state, decline by admin, and re-submission', async ({ page, termsAndConditionsModal }) => {
        const loginPage = new PortalLoginPage(page);
        const navBar = new TopNavigationBar(page);
        const idAccessPage = new IdAndAccessInfoPage(page);

        // Step 1: Login as New User and Verify Default Pending State
        await test.step('Login and verify default "Pending" state for new user', async () => {
            const welcomePage = new WelcomePage(page);
            await loginPage.login(testUserEmail, testUserPassword);
            await welcomePage.proceedToHome();
            await page.waitForTimeout(1000);
            await termsAndConditionsModal.handleTermsAndConditionsIfVisible();

            await page.waitForLoadState('domcontentloaded');
            await page.locator('.overlay, .overlay_inner').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            await navBar.openProfileMenu();
            await navBar.profileMenuProfileLink.click();
            await page.getByRole('tab', { name: /Id & Access Info/i }).click();

            await idAccessPage.verifyAccessState('pending');
        });

        // Step 2: Admin Declines Request via API & User Verifies "Not Activated" State
        await test.step('Admin declines request and user verifies "Not Activated" state', async () => {
            await adminApi.declineOcaRequest(testUserEmail);
            
            await page.reload();
            await page.getByRole('tab', { name: 'Id & Access Info' }).click();

            await idAccessPage.verifyAccessState('notActivated');
        });

        // Step 3: User Raises a New Request & Verifies State Returns to Pending
        await test.step('User raises a new request and verifies pending state', async () => {
            await idAccessPage.raiseRequestBtn.scrollIntoViewIfNeeded();
            await expect(idAccessPage.raiseRequestBtn).toBeEnabled({ timeout: 10000 });
            await idAccessPage.raiseOcaRequest();
            
            await idAccessPage.verifyAccessState('pending');
        });
    });
});

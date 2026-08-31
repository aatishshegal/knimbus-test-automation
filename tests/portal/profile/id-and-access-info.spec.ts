import { test, expect } from '../../../src/fixtures';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import { IdAndAccessInfoPage } from '../../../src/pages/portal/IdAndAccessInfoPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';

// Load post-login profile data
const postLoginDataPath = path.resolve(__dirname, '../../../tests/test-data/postLoginProfileData.json');
const postLoginData = JSON.parse(fs.readFileSync(postLoginDataPath, 'utf-8'));
const idDocumentScenarios = postLoginData.idDocumentScenarios?.data || postLoginData.idDocumentScenarios || [];

test.describe('Id & Access Info Suite', () => {
    let topNav: TopNavigationBar;
    let idAccessPage: IdAndAccessInfoPage;
    let adminApi: AdminApiService;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        // Standard Preconditions: Reset any blocking security settings
        await adminApi.updateSecuritySettings({ 
            mandatoryFields: { fields: [], isMandatory: false },
            editableFields: { fields: [], isEditable: true },
            allFieldsEditable: true
        });
    });

    test.afterAll(async () => {
        if (adminApi) await adminApi.close();
    });

    test.beforeEach(async ({ page }) => {
        topNav = new TopNavigationBar(page);
        idAccessPage = new IdAndAccessInfoPage(page);

        await page.goto(process.env.PORTAL_URL as string);
        await topNav.openProfileMenu();
        await topNav.profileMenuProfileLink.click();
        
        // Navigate to Id & Access Info Tab
        await page.getByRole('tab', { name: /Id & Access Info/i }).click();
        await expect(idAccessPage.pageHeading).toBeVisible();
    });

    test.describe('Id Document Upload Validation', () => {
        for (const s of idDocumentScenarios) {
            test(`TC_IdDoc_${s.ScenarioType}_${s.Scenario.replace(/[^a-zA-Z0-9]/g, '')}`, async ({ page }) => {
                const dataDir = path.resolve(__dirname, '../../../tests/test-data');
                const filesDir = path.resolve(__dirname, '../../../tests/test-data/files');
                
                if (s.FileName1) {
                    const filePath1 = path.resolve(filesDir, s.FileName1);
                    const finalPath1 = fs.existsSync(filePath1) ? filePath1 : path.resolve(dataDir, s.FileName1);
                    await idAccessPage.frontsideUploadInput.setInputFiles(finalPath1);
                }

                if (s.FileName2) {
                    const filePath2 = path.resolve(filesDir, s.FileName2);
                    const finalPath2 = fs.existsSync(filePath2) ? filePath2 : path.resolve(dataDir, s.FileName2);
                    await idAccessPage.backsideUploadInput.setInputFiles(finalPath2);
                }

                await idAccessPage.saveBtn.click();

                if (s.ScenarioType === 'Positive') {
                    await page.waitForTimeout(1000);
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

test.describe('Profile - Id & Access Info - Access Section Scenarios', () => {
    // We must bypass the global cached session since we need a fresh user for each run
    test.use({ storageState: { cookies: [], origins: [] } });

    let adminApi: AdminApiService;
    let testUserEmail: string;
    const testUserPassword = process.env.DEFAULT_PASSWORD as string;

    test.beforeAll(async () => {
        adminApi = new AdminApiService();
        await adminApi.login();
        
        // Generate a random email to ensure fresh state
        const uniqueId = Date.now().toString().slice(-6);
        testUserEmail = `oca_user_${uniqueId}@yopmail.com`;
        
        console.log(`[Test Setup] Creating fresh user: ${testUserEmail}`);
        await adminApi.addSingleUser(`OCA User ${uniqueId}`, testUserEmail);
        await adminApi.changeUserPassword(testUserEmail, testUserPassword);
    });

    test.afterAll(async () => {
        await adminApi.close();
    });

    test('Verify OCA Request flows (Default Pending -> Admin Decline -> User Raise New Request)', async ({ page, termsAndConditionsModal }) => {
        const { PortalLoginPage } = require('../../../src/pages/portal/PortalLoginPage');
        const loginPage = new PortalLoginPage(page);
        const navBar = new TopNavigationBar(page);
        const idAccessPage = new IdAndAccessInfoPage(page);

        // --- Step 1: Login as New User and Verify Default Pending State ---
        await test.step('Login and verify default "Pending" state for new user', async () => {
            // Use the canonical login method from the page object
            await loginPage.login(testUserEmail, testUserPassword);

            // Wait for home page to stabilize
            await page.waitForTimeout(3000);

            // Handle Welcome modal if it appears for new users
            const welcomeContinueBtn = page.getByRole('button', { name: 'Continue', exact: true });
            if (await welcomeContinueBtn.isVisible().catch(() => false)) {
                await welcomeContinueBtn.click().catch(() => {});
                await page.waitForTimeout(1000);
            }
            
            // Use the robust fixture method to handle the T&C modal
            await termsAndConditionsModal.handleTermsAndConditionsIfVisible();

            // Navigate to Profile -> Id & Access Info
            await expect(navBar.profileDropdown).toBeVisible({ timeout: 15000 });
            await navBar.profileDropdown.click();
            await navBar.profileMenuProfileLink.click();
            await page.getByRole('tab', { name: 'Id & Access Info' }).click();

            // Verify the access state is pending
            await idAccessPage.verifyAccessState('pending');
        });

        // --- Step 2: Admin Declines Request via API & User Verifies "Not Activated" State ---
        await test.step('Admin declines request and user verifies "Not Activated" state', async () => {
            // Decline via API as instructed
            await adminApi.declineOcaRequest(testUserEmail);
            
            // Refresh the user's page to reflect backend changes
            await page.reload();
            await page.waitForTimeout(2000);
            
            // The user might be kicked back to the first tab on reload, so navigate again if needed
            if (!(await idAccessPage.accessHeading.isVisible())) {
                await page.getByRole('tab', { name: 'Id & Access Info' }).click();
            }

            // Verify the access state is now not activated
            await idAccessPage.verifyAccessState('notActivated');
        });

        // --- Step 3: User Raises a New Request & Verifies State Returns to Pending ---
        await test.step('User raises a new request and verifies pending state', async () => {
            // Scroll the button into view as the user noted
            await idAccessPage.raiseRequestBtn.scrollIntoViewIfNeeded();
            
            // Wait a moment for any lazy-loading or event listeners after scrolling
            await page.waitForTimeout(2000);

            // Now the button should be enabled, click it
            await expect(idAccessPage.raiseRequestBtn).toBeEnabled({ timeout: 10000 });
            await idAccessPage.raiseOcaRequest();
            
            // Wait for toast and click OK if it is a modal instead of a toast
            const okBtn = page.getByRole('button', { name: 'OK', exact: true });
            if (await okBtn.isVisible({ timeout: 5000 })) {
                await okBtn.click();
            }

            // Verify the state immediately updates to pending and button disables
            await idAccessPage.verifyAccessState('pending');
        });
    });
});

import { test, expect } from '../../../src/fixtures';
import { WorkAndEducationPage } from '../../../src/pages/portal/WorkAndEducationPage';
import * as postLoginProfileData from '../../test-data/postLoginProfileData.json';

const granularValidationScenarios = postLoginProfileData.workEducationScenarios.workExperienceData.granularValidationScenarios || postLoginProfileData.workEducationScenarios.workExperienceData.negativeScenarios;
const workExpPositiveData = postLoginProfileData.workEducationScenarios.workExperienceData.positiveData;
test.describe('Profile Work & Education Suite', () => {

    test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
        // Navigate to the portal home (already authenticated via storageState)
        await page.goto(process.env.PORTAL_URL as string);
        
        // Use standard fixtures to navigate to profile
        await topNavigationBar.openProfileMenu();
        await topNavigationBar.profileMenuProfileLink.click();
        await expect(profilePage.profileHeader).toBeVisible({ timeout: 15000 });
        
        // Go to work and education tab
        await page.locator('a[data-rr-ui-event-key="Work & Education"]').click();
    });

    test.describe('Work Experience - Field Validation', () => {
        
        test.beforeEach(async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const workExpHeading = page.getByRole('heading', { name: 'Work Experience' });
            await expect(workExpHeading).toBeVisible({ timeout: 10000 });
            
            // Check if form is open (jobTitle is visible)
            if (!(await workAndEducationPage.jobTitle.isVisible())) {
                const addMoreBtn = page.getByText('Add more', { exact: true });
                if (await addMoreBtn.first().isVisible()) {
                    await addMoreBtn.first().click();
                } else {
                    // Scope to the Work Experience section
                    const workExpContainer = page.locator('div').filter({ has: workExpHeading }).last();
                    await workExpContainer.locator('button, a').filter({ has: page.locator('svg') }).first().click();
                }
            }
            
            // Ensure the form actually opened
            await expect(workAndEducationPage.jobTitle).toBeVisible({ timeout: 5000 });
        });

        granularValidationScenarios.forEach((scenarioData) => {
            test(`TC_WorkExp_${scenarioData.scenario.replace(/[^a-zA-Z0-9]/g, '_')}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: JSON.stringify(scenarioData) });
                
                const workAndEducationPage = new WorkAndEducationPage(page);
                
                // Execute the interaction based on the scenario
                if (scenarioData.fieldsToFill) {
                    for (const f of scenarioData.fieldsToFill) {
                        const loc = workAndEducationPage.getLocator(f.field);
                        await loc.fill(f.value);
                    }
                } else if (scenarioData.customLogic === "isCurrentCompany") {
                    await workAndEducationPage.jobTitle.fill(workExpPositiveData.jobTitle);
                    await workAndEducationPage.companyName.fill(workExpPositiveData.companyName);
                    await workAndEducationPage.workExpFromYr.fill(workExpPositiveData.workExpFromYr);
                    // Check the checkbox
                    await workAndEducationPage.isCurrentCompany.click();
                } else {
                    const fieldLocator = workAndEducationPage.getLocator(scenarioData.field as string);
                    if (scenarioData.value === "") {
                        // Blank scenario: click the field
                        await fieldLocator.click();
                    } else {
                        // Fill value
                        await fieldLocator.fill(scenarioData.value as string);
                    }
                }
                
                // Assertions
                if (scenarioData.customLogic === "isCurrentCompany") {
                    const currentYear = new Date().getFullYear().toString();
                    await expect(workAndEducationPage.workExpToYr).toHaveValue(currentYear, { timeout: 5000 });
                } else {
                    // Trigger validation by clicking Save
                    await page.getByRole('button', { name: 'Save' }).first().click();
                    
                    // Assert the expected inline error message is visible
                    await expect(page.locator(`text=${scenarioData.expectedMessage}`).first()).toBeVisible({ timeout: 5000 });
                }
            });
        });
    });
    test.describe('Work Experience - Functional Flows', () => {
        // Run sequentially as they depend on each other's state
        test.describe.configure({ mode: 'serial' });
        
        let targetJobTitle = `${workExpPositiveData.jobTitle} ${Date.now()}`;
        let targetCompany = `${workExpPositiveData.companyName} ${Date.now()}`;
        
        test.beforeEach(async ({ page }) => {
            const workExpHeading = page.getByRole('heading', { name: 'Work Experience' });
            await expect(workExpHeading).toBeVisible({ timeout: 10000 });
        });

        test('TC_WorkExp_FillValidData_VerifyAddMorePresent', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const workExpHeading = page.getByRole('heading', { name: 'Work Experience' });
            
            // 1. Open form (if not already open)
            if (!(await workAndEducationPage.jobTitle.isVisible())) {
                const addMoreBtn = page.getByText('Add more', { exact: true });
                await page.waitForTimeout(2000); 
                if (await addMoreBtn.first().isVisible()) {
                    await addMoreBtn.first().click();
                } else {
                    const workExpContainer = page.locator('div').filter({ has: workExpHeading }).last();
                    await workExpContainer.locator('button, a').filter({ has: page.locator('svg') }).first().click();
                }
            }
            
            // 2. Fill valid data and save
            await workAndEducationPage.jobTitle.fill(targetJobTitle);
            await workAndEducationPage.companyName.fill(targetCompany);
            await workAndEducationPage.workExpFromYr.fill(workExpPositiveData.workExpFromYr);
            await workAndEducationPage.workExpToYr.fill(workExpPositiveData.workExpToYr);
            
            await page.getByRole('button', { name: 'Save' }).first().click();
            await page.waitForTimeout(4000); // Crucial: Wait for API to save before next test reloads the page
            
            // 3. Validate Add more button is present
            const addMoreBtn2 = page.getByText('Add more', { exact: true });
            await expect(addMoreBtn2.first()).toBeVisible({ timeout: 5000 });
        });

        test('TC_WorkExp_VerifySavedDataAndEditIcon', async ({ page }) => {
            const savedCard = page.locator('div')
                .filter({ has: page.getByText(targetJobTitle, { exact: true }) })
                .filter({ has: page.locator('svg') })
                .last();
                
            await expect(savedCard).toBeVisible({ timeout: 5000 });
            await expect(page.getByText(targetCompany, { exact: true }).first()).toBeVisible();
            const editIcon = savedCard.locator('svg').first();
            await expect(editIcon).toBeVisible();
        });

        test('TC_WorkExp_VerifySaveCancelDeleteButtons', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const savedCard = page.locator('div')
                .filter({ has: page.getByText(targetJobTitle, { exact: true }) })
                .filter({ has: page.locator('svg') })
                .last();
            const editIcon = savedCard.locator('svg').first();
            
            await editIcon.click();
            await expect(workAndEducationPage.jobTitle).toBeVisible({ timeout: 5000 });
            
            const saveBtn = page.getByRole('button', { name: 'Save' }).first();
            const cancelBtn = page.getByRole('button', { name: /Cancel/i }).first();
            const deleteBtn = page.locator('button.delete-btn, button:has(.fa-trash), button:has-text("Delete"), svg.fa-trash').first();
            
            await expect(saveBtn).toBeVisible();
            await expect(cancelBtn).toBeVisible();
            await expect(deleteBtn).toBeVisible();
        });

        test('TC_WorkExp_CancelButtonClosesForm', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            
            // The form might be open from the previous test if the page didn't reload, 
            // but since beforeEach reloads the page, we must re-open it
            const savedCard = page.locator('div')
                .filter({ has: page.getByText(targetJobTitle, { exact: true }) })
                .filter({ has: page.locator('svg') })
                .last();
            const editIcon = savedCard.locator('svg').first();
            await editIcon.click();
            await expect(workAndEducationPage.jobTitle).toBeVisible({ timeout: 5000 });
            
            const cancelBtn = page.getByRole('button', { name: /Cancel/i }).first();
            await cancelBtn.click();
            
            await expect(workAndEducationPage.jobTitle).toBeHidden({ timeout: 5000 });
            await expect(savedCard).toBeVisible();
        });

        test('TC_WorkExp_DeleteRemovesData', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            
            const savedCard = page.locator('div')
                .filter({ has: page.getByText(targetJobTitle, { exact: true }) })
                .filter({ has: page.locator('svg') })
                .last();
            const editIcon = savedCard.locator('svg').first();
            await editIcon.click();
            await expect(workAndEducationPage.jobTitle).toBeVisible({ timeout: 5000 });
            
            const deleteBtn = page.locator('button.delete-btn, button:has(.fa-trash), button:has-text("Delete"), svg.fa-trash').first();
            await deleteBtn.click();
            
            await page.waitForTimeout(1000);
            const confirmBtn = page.getByRole('button', { name: /Yes|Confirm|Ok|Delete/i }).first();
            if (await confirmBtn.isVisible().catch(() => false)) {
                await confirmBtn.click();
            }
            await page.waitForTimeout(4000); // Crucial: Wait for API to delete
            
            await expect(page.getByText(targetJobTitle, { exact: true })).toBeHidden({ timeout: 5000 });
        });

        test('TC_WorkExp_ValidateAddMoreOpensBlankForm', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            
            const addMoreBtn = page.getByText('Add more', { exact: true });
            await addMoreBtn.first().click();
            
            await expect(workAndEducationPage.jobTitle).toBeVisible({ timeout: 5000 });
            await expect(workAndEducationPage.jobTitle).toHaveValue('');
            await expect(workAndEducationPage.companyName).toHaveValue('');
        });
    });
});

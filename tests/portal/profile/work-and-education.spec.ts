import { test, expect } from '../../../src/fixtures';
import { WorkAndEducationPage } from '../../../src/pages/portal/WorkAndEducationPage';
import * as postLoginProfileData from '../../test-data/portal/profile-data.json';

const granularValidationScenarios = postLoginProfileData['work-and-education.spec.ts'].workExperienceData.granularValidationScenarios || postLoginProfileData['work-and-education.spec.ts'].workExperienceData.negativeScenarios;
const workExpPositiveData = postLoginProfileData['work-and-education.spec.ts'].workExperienceData.positiveData;
const educationValidationScenarios = postLoginProfileData['work-and-education.spec.ts'].educationData.negativeScenarios;
const eduPositiveData = postLoginProfileData['work-and-education.spec.ts'].educationData.positiveData;
const fieldOfStudiesValidationScenarios = postLoginProfileData['work-and-education.spec.ts'].fieldOfStudiesData.negativeScenarios;
const fieldOfStudiesPositiveData = postLoginProfileData['work-and-education.spec.ts'].fieldOfStudiesData.positiveData;
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
            await expect(workAndEducationPage.jobTitle).toBeVisible({ timeout: 15000 });
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
                    await expect(workAndEducationPage.workExpToYr).toHaveValue(currentYear, { timeout: 15000 });
                } else {
                    // Trigger validation by clicking Save
                    await page.getByRole('button', { name: 'Save' }).first().click();
                    
                    // Assert the expected inline error message is visible
                    await expect(page.locator(`text=${scenarioData.expectedMessage}`).first()).toBeVisible({ timeout: 15000 });
                }
            });
        });
    });

    test.describe('Field of Studies - Field Validation', () => {

        test.beforeEach(async ({ page, topNavigationBar, profilePage }) => {
            if (page.url() === 'about:blank') {
                console.log("Forcing navigation (page was about:blank)");
                await page.goto(process.env.PORTAL_URL as string);
                await topNavigationBar.openProfileMenu();
                await topNavigationBar.profileMenuProfileLink.click();
                await page.waitForTimeout(2000);
            }
            const workAndEducationPage = new WorkAndEducationPage(page);
            const fosHeading = page.getByRole('heading', { name: 'Field of Studies', exact: false });
            await expect(fosHeading).toBeVisible({ timeout: 10000 });

            // Check if form is open (studySub is visible)
            if (!(await workAndEducationPage.studySub.isVisible())) {
                const fosContainer = page.locator('div').filter({ has: fosHeading }).last();
                const addMoreBtn = fosContainer.locator('..').getByText('Add more', { exact: true });
                if (await addMoreBtn.first().isVisible()) {
                    await addMoreBtn.first().click();
                } else {
                    // Try to click edit if add more is not there
                    await fosContainer.locator('..').locator('button, a').filter({ has: page.locator('svg') }).first().click();
                }
            }

            // Ensure the form actually opened
            await expect(workAndEducationPage.studySub).toBeVisible({ timeout: 15000 });
        });

        fieldOfStudiesValidationScenarios.forEach((scenarioData) => {
            test(`TC_FoS_${scenarioData.scenario.replace(/[^a-zA-Z0-9]/g, '_')}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: JSON.stringify(scenarioData) });

                const workAndEducationPage = new WorkAndEducationPage(page);

                // Execute the interaction based on the scenario
                if (scenarioData.fieldsToBlank) {
                    // First fill valid data
                    await workAndEducationPage.studySub.fill(fieldOfStudiesPositiveData.studySub);
                    
                    // Then clear the specific fields
                    for (const f of scenarioData.fieldsToBlank) {
                        const loc = workAndEducationPage.getLocator(f);
                        await loc.fill("");
                    }
                } else if (scenarioData.invalidData) {
                    // First fill valid data
                    await workAndEducationPage.studySub.fill(fieldOfStudiesPositiveData.studySub);
                    
                    // Then fill the specific invalid data
                    for (const [key, value] of Object.entries(scenarioData.invalidData)) {
                        const loc = workAndEducationPage.getLocator(key);
                        await loc.fill(value as string);
                    }
                }

                // Trigger validation by clicking Save
                const saveBtn = await workAndEducationPage.getSaveButton('Field of Studies');
                await saveBtn.click();

                // Assert the expected inline error message is visible
                await expect(page.locator(`text=${scenarioData.expectedMessage}`).first()).toBeVisible({ timeout: 15000 });
            });
        });
    });

    test.describe('Field of Studies - Functional Flows', () => {
        test.describe.configure({ mode: 'serial' });

        let targetFoS = `${fieldOfStudiesPositiveData.studySub} ${Date.now()}`;

        test.beforeEach(async ({ page }) => {
            const fosHeading = page.getByRole('heading', { name: 'Field of Studies', exact: false });
            await expect(fosHeading).toBeVisible({ timeout: 10000 });
        });

        test('TC_FoS_FillValidData_VerifySaved', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const fosHeading = page.getByRole('heading', { name: 'Field of Studies', exact: false });

            // 1. Open form (if not already open)
            if (!(await workAndEducationPage.studySub.isVisible())) {
                const fosContainer = page.locator('div').filter({ has: fosHeading }).last();
                const addMoreBtn = fosContainer.locator('..').getByText('Add more', { exact: true });
                await page.waitForTimeout(2000);
                if (await addMoreBtn.first().isVisible()) {
                    await addMoreBtn.first().click();
                } else {
                    await fosContainer.locator('..').locator('button, a').filter({ has: page.locator('svg') }).first().click();
                }
            }

            // 2. Fill valid data and save
            await workAndEducationPage.studySub.fill(targetFoS);

            // Intercept API response
            page.on('response', async (response) => {
                if (response.url().includes('update') || response.url().includes('save') || response.request().method() === 'POST' || response.request().method() === 'PUT') {
                    try {
                        const body = await response.json();
                        console.log(`API Response [${response.status()}] from ${response.url()}:`, JSON.stringify(body).substring(0, 500));
                    } catch (e) {
                        // ignore if not json
                    }
                }
            });

            const saveBtn = await workAndEducationPage.getSaveButton('Field of Studies');
            await saveBtn.click();
            await page.waitForTimeout(4000); // Crucial: Wait for API to save

            // 3. Validate saved card is visible
            const savedCard = workAndEducationPage.getSavedEntry(targetFoS);
            await expect(savedCard).toBeVisible({ timeout: 15000 });
        });

        test('TC_FoS_VerifyEditIconWorking', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const editIcon = await workAndEducationPage.getEditIcon(targetFoS);
            await expect(editIcon).toBeVisible({ timeout: 15000 });
            await editIcon.click();
            
            await expect(workAndEducationPage.studySub).toBeVisible({ timeout: 15000 });
        });

        test('TC_FoS_VerifySaveCancelDeleteButtonsOptions', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const editIcon = await workAndEducationPage.getEditIcon(targetFoS);
            await editIcon.click();
            await expect(workAndEducationPage.studySub).toBeVisible({ timeout: 15000 });

            const saveBtn = await workAndEducationPage.getSaveButton('Field of Studies');
            const cancelBtn = await workAndEducationPage.getCancelButton('Field of Studies');
            const deleteBtn = await workAndEducationPage.getDeleteButton('Field of Studies');

            await expect(saveBtn).toBeVisible();
            await expect(cancelBtn).toBeVisible();
            await expect(deleteBtn).toBeVisible();
        });

        test('TC_FoS_VerifyCancelClosesForm', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const editIcon = await workAndEducationPage.getEditIcon(targetFoS);
            await editIcon.click();
            await expect(workAndEducationPage.studySub).toBeVisible({ timeout: 15000 });

            const cancelBtn = await workAndEducationPage.getCancelButton('Field of Studies');
            await cancelBtn.click();

            await expect(workAndEducationPage.studySub).toBeHidden({ timeout: 15000 });
        });

        test('TC_FoS_VerifyEditCanChangeTitleAndSave', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const editIcon = await workAndEducationPage.getEditIcon(targetFoS);
            await editIcon.click();
            await expect(workAndEducationPage.studySub).toBeVisible({ timeout: 15000 });

            // Use a completely new, shorter string to avoid UI truncation issues (e.g. max 50 chars)
            const editedFoS = `Edited FoS ${Date.now()}`;
            await workAndEducationPage.studySub.clear();
            await workAndEducationPage.studySub.fill(editedFoS);
            await workAndEducationPage.studySub.press('Tab'); // Trigger React hook form validation blur

            const saveBtn = await workAndEducationPage.getSaveButton('Field of Studies');
            await expect(saveBtn).toBeEnabled({ timeout: 5000 });
            await saveBtn.click();
            
            // Wait for form to close (indicating successful save)
            await expect(workAndEducationPage.studySub).toBeHidden({ timeout: 10000 });

            const newSavedCard = workAndEducationPage.getSavedEntry(editedFoS);
            await expect(newSavedCard).toBeVisible({ timeout: 15000 });
            
            targetFoS = editedFoS; // Update for the delete test
        });

        test('TC_FoS_VerifyDeleteContent', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const deleteIcon = await workAndEducationPage.getDeleteIcon(targetFoS);
            // Fallback to edit icon and then delete button if direct delete icon isn't there
            if (await deleteIcon.isVisible()) {
                await deleteIcon.click();
            } else {
                const editIcon = await workAndEducationPage.getEditIcon(targetFoS);
                await editIcon.click();
                await expect(workAndEducationPage.studySub).toBeVisible({ timeout: 15000 });
                const deleteBtn = await workAndEducationPage.getDeleteButton('Field of Studies');
                await deleteBtn.click();
            }

            await page.waitForTimeout(1000);
            const confirmBtn = page.getByRole('button', { name: /Yes|Confirm|Ok|Delete/i }).first();
            if (await confirmBtn.isVisible().catch(() => false)) {
                await confirmBtn.click();
            }
            await page.waitForTimeout(4000);

            await expect(page.getByText(targetFoS, { exact: true })).toBeHidden({ timeout: 15000 });
        });

        test('TC_FoS_Verify3FieldsOfStudyAreVisible', async ({ page }) => {
            const workAndEducationPage = new WorkAndEducationPage(page);
            const fosHeading = page.getByRole('heading', { name: 'Field of Studies', exact: false });

            const fields = [`FoS 1 ${Date.now()}`, `FoS 2 ${Date.now()}`, `FoS 3 ${Date.now()}`];

            for (const field of fields) {
                // Open form
                if (!(await workAndEducationPage.studySub.isVisible())) {
                    const fosContainer = page.locator('div').filter({ has: fosHeading }).last();
                    const addMoreBtn = fosContainer.locator('..').getByText('Add more', { exact: true });
                    await page.waitForTimeout(2000);
                    if (await addMoreBtn.first().isVisible()) {
                        await addMoreBtn.first().click();
                    } else {
                        await fosContainer.locator('..').locator('button, a').filter({ has: page.locator('svg') }).first().click();
                    }
                }

                await workAndEducationPage.studySub.fill(field);
                const saveBtn = await workAndEducationPage.getSaveButton('Field of Studies');
                await saveBtn.click();
                await page.waitForTimeout(4000);
            }

            // Validate all 3 are visible
            for (const field of fields) {
                await expect(page.getByText(field, { exact: true })).toBeVisible({ timeout: 15000 });
            }

            // Cleanup
            for (const field of fields) {
                const savedCard = page.locator('div')
                    .filter({ has: page.getByText(field, { exact: true }) })
                    .filter({ has: page.locator('svg') })
                    .last();
                const editIcon = savedCard.locator('svg').first();
                await editIcon.click();
                await expect(workAndEducationPage.studySub).toBeVisible({ timeout: 15000 });

                const deleteBtn = await workAndEducationPage.getDeleteButton('Field of Studies');
                await deleteBtn.click();

                await page.waitForTimeout(1000);
                const confirmBtn = page.getByRole('button', { name: /Yes|Confirm|Ok|Delete/i }).first();
                if (await confirmBtn.isVisible().catch(() => false)) {
                    await confirmBtn.click();
                }
                await page.waitForTimeout(4000);
            }
        });
    });
});

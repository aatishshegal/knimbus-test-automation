import { test, expect, Page } from '@playwright/test';
import { WorkAndEducationPage } from '../../../src/pages/portal/WorkAndEducationPage';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import profileData from '../../test-data/portal/profile-data.json';

const workEducationScenarios = (profileData as Record<string, any>)['work-and-education.spec.ts'];

const workExpValidationScenarios: any[] = workEducationScenarios.workExperienceData.granularValidationScenarios || workEducationScenarios.workExperienceData.negativeScenarios;
const workExpPositiveData = workEducationScenarios.workExperienceData.positiveData;
const workExpUpdateData = workEducationScenarios.workExperienceData.updateData;

const eduValidationScenarios: any[] = workEducationScenarios.educationData.negativeScenarios;
const eduPositiveData = workEducationScenarios.educationData.positiveData;
const eduUpdateData = workEducationScenarios.educationData.updateData;

const fosValidationScenarios: any[] = workEducationScenarios.fieldOfStudiesData.negativeScenarios;
const fosPositiveData = workEducationScenarios.fieldOfStudiesData.positiveData;
const fosUpdateData = workEducationScenarios.fieldOfStudiesData.updateData;

test.describe('Profile Work & Education Suite', () => {

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext({ storageState: '.auth/user.json' });
        const page = await context.newPage();
        await page.goto(process.env.PORTAL_URL as string);
        const topBar = new TopNavigationBar(page);
        await topBar.openProfileMenu().catch(() => {});
        await topBar.profileMenuProfileLink.click().catch(() => {});
        await page.locator('a[data-rr-ui-event-key="Work & Education"]').click().catch(() => {});
        const workAndEducationPage = new WorkAndEducationPage(page);
        await workAndEducationPage.cleanupAllEntries().catch(() => {});
        await context.close();
    });

    // ==========================================
    // 1. WORK EXPERIENCE - FIELD VALIDATIONS
    // ==========================================
    test.describe('Work Experience - Field Validation', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(process.env.PORTAL_URL as string);
            const topBar = new TopNavigationBar(page);
            await topBar.openProfileMenu();
            await topBar.profileMenuProfileLink.click();
            await page.locator('a[data-rr-ui-event-key="Work & Education"]').click();
            await page.waitForTimeout(1000);
        });

        workExpValidationScenarios.forEach((scenarioData) => {
            test(`Work & Education - Work Experience - ${scenarioData.scenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: JSON.stringify(scenarioData) });
                const workAndEducationPage = new WorkAndEducationPage(page);
                await workAndEducationPage.runValidationScenario('work', scenarioData, workExpPositiveData);
            });
        });
    });

    // ==========================================
    // 2. WORK EXPERIENCE - FUNCTIONAL LIFECYCLE
    // ==========================================
    test.describe('Work Experience - Functional Lifecycle', () => {
        test.describe.configure({ mode: 'serial' });

        let page: Page;
        let workAndEducationPage: WorkAndEducationPage;
        const targetJobTitle = `${workExpPositiveData.jobTitle} ${Date.now()}`;
        const targetCompany = `${workExpPositiveData.companyName} ${Date.now()}`;
        const updatedJobTitle = `${workExpUpdateData.jobTitle} ${Date.now()}`;
        const updatedCompany = `${workExpUpdateData.companyName} ${Date.now()}`;

        test.beforeAll(async ({ browser }) => {
            const context = await browser.newContext({ storageState: '.auth/user.json' });
            page = await context.newPage();
            await page.goto(process.env.PORTAL_URL as string);
            const topBar = new TopNavigationBar(page);
            await topBar.openProfileMenu();
            await topBar.profileMenuProfileLink.click();
            await page.locator('a[data-rr-ui-event-key="Work & Education"]').click();
            workAndEducationPage = new WorkAndEducationPage(page);
        });

        test.afterAll(async () => {
            if (workAndEducationPage) {
                await workAndEducationPage.cleanupAllEntries().catch(() => {});
            }
            if (page) {
                await page.close().catch(() => {});
            }
        });

        test('Work & Education - Work Experience - Adds new work history entry and displays card on profile', async () => {
            await workAndEducationPage.createEntry('work', {
                jobTitle: targetJobTitle,
                companyName: targetCompany,
                workExpFromYr: workExpPositiveData.workExpFromYr,
                workExpToYr: workExpPositiveData.workExpToYr
            });
            await workAndEducationPage.verifyCardVisible('work', targetJobTitle);
        });

        test('Work & Education - Work Experience - Add More button opens empty entry form', async () => {
            await workAndEducationPage.verifyAddMoreOpensBlankForm('work');
        });

        test('Work & Education - Work Experience - Action buttons are visible and enabled in edit mode', async () => {
            await workAndEducationPage.verifyEditFormButtonsVisible('work', targetJobTitle);
        });

        test('Work & Education - Work Experience - Cancel button discards changes and preserves existing card', async () => {
            await workAndEducationPage.cancelEdit('work', targetJobTitle);
        });

        test('Work & Education - Work Experience - Modifies existing entry and updates profile card', async () => {
            await workAndEducationPage.updateEntry('work', targetJobTitle, {
                jobTitle: updatedJobTitle,
                companyName: updatedCompany
            });
            await workAndEducationPage.verifyCardVisible('work', updatedJobTitle);
        });

        test('Work & Education - Work Experience - Delete action removes entry card from profile', async () => {
            await workAndEducationPage.deleteCard('work', updatedJobTitle);
        });
    });

    // ==========================================
    // 3. EDUCATION - FIELD VALIDATIONS
    // ==========================================
    test.describe('Education - Field Validation', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(process.env.PORTAL_URL as string);
            const topBar = new TopNavigationBar(page);
            await topBar.openProfileMenu();
            await topBar.profileMenuProfileLink.click();
            await page.locator('a[data-rr-ui-event-key="Work & Education"]').click();
            await page.waitForTimeout(1000);
        });

        eduValidationScenarios.forEach((scenarioData) => {
            const cleanScenario = scenarioData.scenario.replace(/_/g, ' ').replace(/^Validation\s*-\s*/i, '');
            test(`Work & Education - Education - ${cleanScenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: JSON.stringify(scenarioData) });
                const workAndEducationPage = new WorkAndEducationPage(page);
                await workAndEducationPage.runValidationScenario('edu', scenarioData, eduPositiveData);
            });
        });
    });

    // ==========================================
    // 4. EDUCATION - FUNCTIONAL LIFECYCLE
    // ==========================================
    test.describe('Education - Functional Lifecycle', () => {
        test.describe.configure({ mode: 'serial' });

        let page: Page;
        let workAndEducationPage: WorkAndEducationPage;
        const targetInstitution = `${eduPositiveData.institutionName} ${Date.now()}`;
        const targetDegree = `${eduPositiveData.eduDegree} ${Date.now()}`;
        const updatedInstitution = `${eduUpdateData.institutionName} ${Date.now()}`;
        const updatedDegree = `${eduUpdateData.eduDegree} ${Date.now()}`;

        test.beforeAll(async ({ browser }) => {
            const context = await browser.newContext({ storageState: '.auth/user.json' });
            page = await context.newPage();
            await page.goto(process.env.PORTAL_URL as string);
            const topBar = new TopNavigationBar(page);
            await topBar.openProfileMenu();
            await topBar.profileMenuProfileLink.click();
            await page.locator('a[data-rr-ui-event-key="Work & Education"]').click();
            workAndEducationPage = new WorkAndEducationPage(page);
        });

        test.afterAll(async () => {
            if (workAndEducationPage) {
                await workAndEducationPage.cleanupAllEntries().catch(() => {});
            }
            if (page) {
                await page.close().catch(() => {});
            }
        });

        test('Work & Education - Education - Adds new education entry and displays card on profile', async () => {
            await workAndEducationPage.createEntry('edu', {
                institutionName: targetInstitution,
                eduDegree: targetDegree,
                eduFromYr: eduPositiveData.eduFromYr,
                eduToYr: eduPositiveData.eduToYr
            });
            await workAndEducationPage.verifyCardVisible('edu', targetInstitution);
        });

        test('Work & Education - Education - Add More button opens empty entry form', async () => {
            await workAndEducationPage.verifyAddMoreOpensBlankForm('edu');
        });

        test('Work & Education - Education - Action buttons are visible and enabled in edit mode', async () => {
            await workAndEducationPage.verifyEditFormButtonsVisible('edu', targetInstitution);
        });

        test('Work & Education - Education - Cancel button discards changes and preserves existing card', async () => {
            await workAndEducationPage.cancelEdit('edu', targetInstitution);
        });

        test('Work & Education - Education - Modifies existing entry and updates profile card', async () => {
            await workAndEducationPage.updateEntry('edu', targetInstitution, {
                institutionName: updatedInstitution,
                eduDegree: updatedDegree
            });
            await workAndEducationPage.verifyCardVisible('edu', updatedInstitution);
        });

        test('Work & Education - Education - Delete action removes entry card from profile', async () => {
            await workAndEducationPage.deleteCard('edu', updatedInstitution);
        });
    });

    // ==========================================
    // 5. FIELD OF STUDIES - FIELD VALIDATIONS
    // ==========================================
    test.describe('Field of Studies - Field Validation', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(process.env.PORTAL_URL as string);
            const topBar = new TopNavigationBar(page);
            await topBar.openProfileMenu();
            await topBar.profileMenuProfileLink.click();
            await page.locator('a[data-rr-ui-event-key="Work & Education"]').click();
            await page.waitForTimeout(1000);
        });

        fosValidationScenarios.forEach((scenarioData) => {
            const cleanScenario = scenarioData.scenario.replace(/_/g, ' ').replace(/^Validation\s*-\s*/i, '');
            test(`Work & Education - Field of Study - ${cleanScenario}`, async ({ page }) => {
                test.info().annotations.push({ type: 'testData', description: JSON.stringify(scenarioData) });
                const workAndEducationPage = new WorkAndEducationPage(page);
                await workAndEducationPage.runValidationScenario('fos', scenarioData, fosPositiveData);
            });
        });
    });

    // ==========================================
    // 6. FIELD OF STUDIES - FUNCTIONAL LIFECYCLE
    // ==========================================
    test.describe('Field of Studies - Functional Lifecycle', () => {
        test.describe.configure({ mode: 'serial' });

        let page: Page;
        let workAndEducationPage: WorkAndEducationPage;
        const targetSubject = `${fosPositiveData.studySub} ${Date.now()}`;
        const updatedSubject = `${fosUpdateData.studySub} ${Date.now()}`;

        test.beforeAll(async ({ browser }) => {
            const context = await browser.newContext({ storageState: '.auth/user.json' });
            page = await context.newPage();
            await page.goto(process.env.PORTAL_URL as string);
            const topBar = new TopNavigationBar(page);
            await topBar.openProfileMenu();
            await topBar.profileMenuProfileLink.click();
            await page.locator('a[data-rr-ui-event-key="Work & Education"]').click();
            workAndEducationPage = new WorkAndEducationPage(page);
        });

        test.afterAll(async () => {
            if (workAndEducationPage) {
                await workAndEducationPage.cleanupAllEntries().catch(() => {});
            }
            if (page) {
                await page.close().catch(() => {});
            }
        });

        test('Work & Education - Field of Study - Adds new field of study entry and displays card on profile', async () => {
            await workAndEducationPage.createEntry('fos', {
                studySub: targetSubject
            });
            await workAndEducationPage.verifyCardVisible('fos', targetSubject);
        });

        test('Work & Education - Field of Study - Add More button opens empty entry form', async () => {
            await workAndEducationPage.verifyAddMoreOpensBlankForm('fos');
        });

        test('Work & Education - Field of Study - Action buttons are visible and enabled in edit mode', async () => {
            await workAndEducationPage.verifyEditFormButtonsVisible('fos', targetSubject);
        });

        test('Work & Education - Field of Study - Cancel button discards changes and preserves existing card', async () => {
            await workAndEducationPage.cancelEdit('fos', targetSubject);
        });

        test('Work & Education - Field of Study - Modifies existing entry and updates profile card', async () => {
            await workAndEducationPage.updateEntry('fos', targetSubject, {
                studySub: updatedSubject
            });
            await workAndEducationPage.verifyCardVisible('fos', updatedSubject);
        });

        test('Work & Education - Field of Study - Delete action removes entry card from profile', async () => {
            await workAndEducationPage.deleteCard('fos', updatedSubject);
        });
    });
});

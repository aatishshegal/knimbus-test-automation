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
            test(`TC_WorkExp_${scenarioData.scenario.replace(/[^a-zA-Z0-9]/g, '_')}`, async ({ page }) => {
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

        test('TC_WorkExp_CreateEntryAndVerifyCard', async () => {
            await workAndEducationPage.createEntry('work', {
                jobTitle: targetJobTitle,
                companyName: targetCompany,
                workExpFromYr: workExpPositiveData.workExpFromYr,
                workExpToYr: workExpPositiveData.workExpToYr
            });
            await workAndEducationPage.verifyCardVisible('work', targetJobTitle);
        });

        test('TC_WorkExp_VerifyAddMoreOpensBlankForm', async () => {
            await workAndEducationPage.verifyAddMoreOpensBlankForm('work');
        });

        test('TC_WorkExp_VerifySaveCancelDeleteButtonsInEditMode', async () => {
            await workAndEducationPage.verifyEditFormButtonsVisible('work', targetJobTitle);
        });

        test('TC_WorkExp_CancelEditPreservesCard', async () => {
            await workAndEducationPage.cancelEdit('work', targetJobTitle);
        });

        test('TC_WorkExp_EditEntryAndVerifyUpdate', async () => {
            await workAndEducationPage.updateEntry('work', targetJobTitle, {
                jobTitle: updatedJobTitle,
                companyName: updatedCompany
            });
            await workAndEducationPage.verifyCardVisible('work', updatedJobTitle);
        });

        test('TC_WorkExp_DeleteRemovesCard', async () => {
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
            test(`TC_Education_${scenarioData.scenario.replace(/[^a-zA-Z0-9]/g, '_')}`, async ({ page }) => {
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

        test('TC_Education_CreateEntryAndVerifyCard', async () => {
            await workAndEducationPage.createEntry('edu', {
                institutionName: targetInstitution,
                eduDegree: targetDegree,
                eduFromYr: eduPositiveData.eduFromYr,
                eduToYr: eduPositiveData.eduToYr
            });
            await workAndEducationPage.verifyCardVisible('edu', targetInstitution);
        });

        test('TC_Education_VerifyAddMoreOpensBlankForm', async () => {
            await workAndEducationPage.verifyAddMoreOpensBlankForm('edu');
        });

        test('TC_Education_VerifySaveCancelDeleteButtonsInEditMode', async () => {
            await workAndEducationPage.verifyEditFormButtonsVisible('edu', targetInstitution);
        });

        test('TC_Education_CancelEditPreservesCard', async () => {
            await workAndEducationPage.cancelEdit('edu', targetInstitution);
        });

        test('TC_Education_EditEntryAndVerifyUpdate', async () => {
            await workAndEducationPage.updateEntry('edu', targetInstitution, {
                institutionName: updatedInstitution,
                eduDegree: updatedDegree
            });
            await workAndEducationPage.verifyCardVisible('edu', updatedInstitution);
        });

        test('TC_Education_DeleteRemovesCard', async () => {
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
            test(`TC_FieldOfStudies_${scenarioData.scenario.replace(/[^a-zA-Z0-9]/g, '_')}`, async ({ page }) => {
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

        test('TC_FieldOfStudies_CreateEntryAndVerifyCard', async () => {
            await workAndEducationPage.createEntry('fos', {
                studySub: targetSubject
            });
            await workAndEducationPage.verifyCardVisible('fos', targetSubject);
        });

        test('TC_FieldOfStudies_VerifyAddMoreOpensBlankForm', async () => {
            await workAndEducationPage.verifyAddMoreOpensBlankForm('fos');
        });

        test('TC_FieldOfStudies_VerifySaveCancelDeleteButtonsInEditMode', async () => {
            await workAndEducationPage.verifyEditFormButtonsVisible('fos', targetSubject);
        });

        test('TC_FieldOfStudies_CancelEditPreservesCard', async () => {
            await workAndEducationPage.cancelEdit('fos', targetSubject);
        });

        test('TC_FieldOfStudies_EditEntryAndVerifyUpdate', async () => {
            await workAndEducationPage.updateEntry('fos', targetSubject, {
                studySub: updatedSubject
            });
            await workAndEducationPage.verifyCardVisible('fos', updatedSubject);
        });

        test('TC_FieldOfStudies_DeleteRemovesCard', async () => {
            await workAndEducationPage.deleteCard('fos', updatedSubject);
        });
    });
});

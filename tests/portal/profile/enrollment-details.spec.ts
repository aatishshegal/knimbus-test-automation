import { test, expect, Page } from '@playwright/test';
import { EnrollmentDetailsPage } from '../../../src/pages/portal/EnrollmentDetailsPage';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import postLoginData from '../../test-data/postLoginProfileData.json';
import { AdminApiService } from '../../../src/api/AdminApiService';
import * as fs from 'fs';
import * as path from 'path';


const backendFieldMap: Record<string, string> = {
    'idNumber': 'Student ID/ Staff ID',
    'college': 'College/Affiliation',
    'department': 'Department',
    'qualification': 'Degree/Program',
    'designation': 'Designation',
    'areaOfStudy': 'Speciality',
    'rank': 'Rank',
    'batch': 'Batch',
    'cadre': 'Cadre',
    'admissionYear': 'Admission Year',
    'membershipStatus': 'Membership Status',
    'membershipType': 'Membership Type'
};

const enrollmentFields = ['idNumber', 'college', 'department', 'qualification', 'designation', 'areaOfStudy', 'rank', 'batch', 'cadre', 'admissionYear', 'membershipStatus', 'membershipType'];

const csvFilePath = path.join(__dirname, '..', '..', '..', 'test-results', `Enrollment_Details_Validation_Report.csv`);

function logToCsv(testCaseName: string, scenario: string, field: string, testData: string, status: string, errorReason: string = '') {
    if (!fs.existsSync(csvFilePath)) {
        fs.writeFileSync(csvFilePath, 'Test Case Name,Scenario,Field,Test Data,Status,Error Reason\n');
    }
    const safeError = errorReason ? errorReason.replace(/"/g, '""').replace(/\n/g, ' ') : '';
    const row = `"${testCaseName}","${scenario}","${field}","${testData}","${status}","${safeError}"\n`;
    fs.appendFileSync(csvFilePath, row);
    
    // Console log for visibility during execution
    console.log(`[${status}] ${testCaseName} | Scenario: ${scenario} | Field: ${field} | Data: '${testData}'`);
    if (status === 'Fail' && errorReason) {
        console.log(`       -> Error: ${errorReason.substring(0, 150)}...`);
    }
}

function failTest(e: any, testInfo: any) {
    testInfo.errors.push(e);
    testInfo.status = 'failed';
}

test.describe('Enrollment Details Suite', () => {
    test.setTimeout(240000); // 4 minutes
    let page: Page;
    let topNav: TopNavigationBar;
    let enrollmentPage: EnrollmentDetailsPage;
    let adminApi: AdminApiService;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        topNav = new TopNavigationBar(page);
        enrollmentPage = new EnrollmentDetailsPage(page);
        adminApi = new AdminApiService();

        await adminApi.login();
        await adminApi.updateSecuritySettings({ 
            mandatoryFields: { fields: [], isMandatory: false },
            editableFields: { fields: [], isEditable: true },
            allFieldsEditable: true
        });

        await page.goto('https://sydneyuniversity.knimbus.com/portal/v2/default/home');
        await topNav.openProfileMenu();
        await topNav.profileMenuProfileLink.click();
        await page.getByRole('tab', { name: /Enrollment Details/i }).click();
    });

    test.afterAll(async () => {
        console.log(`\n✅ Enrollment Details CSV Report generated successfully: ${csvFilePath}\n`);
        if (adminApi) await adminApi.close();
        if (page) await page.close();
    });

    test('Positive Data Entry for all fields', async ({}, testInfo) => {
        console.log('\n--- Starting: Positive Data Entry for all fields ---');
        const { positiveData } = (postLoginData as any).enrollmentScenarios;
        try {
            if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
            
            await enrollmentPage.fillAndVerifyAllFields(positiveData, enrollmentFields, logToCsv);
        } catch (e: any) {
            failTest(e, testInfo);
            await enrollmentPage.logFailureToCsv(positiveData, enrollmentFields, logToCsv, e.message);
        } finally {
            if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
// Cleanups are handled in the helper method now
            if (await enrollmentPage.cancelBtn.isVisible().catch(()=>false)) try { await enrollmentPage.clickCancel(); } catch(e){}
        }
    });

    test('Blank Entry Validation', async ({}, testInfo) => {
        console.log('\n--- Starting: Blank Entry Validation ---');
        await adminApi.updateSecuritySettings({ mandatoryFields: { fields: [], isMandatory: true } });
        await page.reload();
        await page.getByRole('tab', { name: /Enrollment Details/i }).click();
        
        // Wait for edit button and enter Edit mode ONCE for all blank validations
        await expect(enrollmentPage.editBtn).toBeVisible({ timeout: 5000 });
        await enrollmentPage.clickEdit();

        const { positiveData } = (postLoginData as any).enrollmentScenarios;

        await enrollmentPage.verifyBlankEntry(positiveData, enrollmentFields, logToCsv);

        // Cancel out of Edit mode at the end
        if (await enrollmentPage.cancelBtn.isVisible().catch(()=>false)) {
            try { await enrollmentPage.clickCancel(); } catch(e){}
        }

        await adminApi.updateSecuritySettings({ mandatoryFields: { fields: [], isMandatory: false } });
        await page.reload();
        await page.getByRole('tab', { name: /Enrollment Details/i }).click();
    });

    test('Leading and Trailing Spaces Validation', async ({}, testInfo) => {
        console.log('\n--- Starting: Leading and Trailing Spaces Validation ---');
        const scenarios = (postLoginData as any).enrollmentScenarios.negativeScenarios.filter((s: any) => s.scenario.includes('Space'));
        await enrollmentPage.verifyNegativeScenarios(scenarios, logToCsv);
    });

    test('Maximum Character Limits Validation', async ({}, testInfo) => {
        console.log('\n--- Starting: Maximum Character Limits Validation ---');
        const scenarios = (postLoginData as any).enrollmentScenarios.negativeScenarios.filter((s: any) => s.scenario.includes('More than') || s.scenario.includes('restricts input'));
        await enrollmentPage.verifyNegativeScenarios(scenarios, logToCsv);
    });

    test('HTML Tags and Invalid Data Entry Validation', async ({}, testInfo) => {
        console.log('\n--- Starting: HTML Tags and Invalid Data Entry Validation ---');
        const scenarios = (postLoginData as any).enrollmentScenarios.negativeScenarios.filter((s: any) => s.scenario.includes('HTML') || s.scenario.includes('apart from numbers'));
        await enrollmentPage.verifyNegativeScenarios(scenarios, logToCsv);
    });

    test('Auto-suggestion triggers on double click', async ({}, testInfo) => {
        console.log('\n--- Starting: Auto-suggestion triggers on double click ---');
        try {
            await expect(enrollmentPage.editBtn).toBeVisible({ timeout: 5000 }).catch(()=>null);
            if (await enrollmentPage.editBtn.isVisible().catch(()=>false)) await enrollmentPage.clickEdit();
            await expect(enrollmentPage.cancelBtn).toBeVisible({ timeout: 5000 });
            
            await enrollmentPage.verifyAutoSuggestion(enrollmentFields, logToCsv, true);
        } catch (e: any) {
            failTest(e, testInfo);
            logToCsv('Auto-suggestion Validation', 'Auto-suggestion on double click', 'multiple', 'Double Click', 'Fail', e.message);
        } finally {
            if (await enrollmentPage.cancelBtn.isVisible().catch(()=>false)) try { await enrollmentPage.clickCancel(); } catch(e){}
        }
    });

    test('Auto-suggestion triggers on typing', async ({}, testInfo) => {
        console.log('\n--- Starting: Auto-suggestion triggers on typing ---');
        try {
            await expect(enrollmentPage.editBtn).toBeVisible({ timeout: 5000 }).catch(()=>null);
            if (await enrollmentPage.editBtn.isVisible().catch(()=>false)) await enrollmentPage.clickEdit();
            await expect(enrollmentPage.cancelBtn).toBeVisible({ timeout: 5000 });
            
            await enrollmentPage.verifyAutoSuggestion(enrollmentFields, logToCsv, false);
        } catch (e: any) {
            failTest(e, testInfo);
            logToCsv('Auto-suggestion Validation', 'Auto-suggestion on typing', 'multiple', 'a', 'Fail', e.message);
        } finally {
            if (await enrollmentPage.cancelBtn.isVisible().catch(()=>false)) try { await enrollmentPage.clickCancel(); } catch(e){}
        }
    });

    test('Admin Override: All fields non-editable', async ({}, testInfo) => {
        console.log('\n--- Starting: Admin Override (All fields non-editable) ---');
        try {
            await adminApi.updateSecuritySettings({ allFieldsEditable: false });
            await page.reload();
            await page.getByRole('tab', { name: /Enrollment Details/i }).click();

            const expectedMessage = postLoginData.adminOverrides.disabledMessage || "All the fields are set to be non-editable by your institution";
            await expect(page.getByText(expectedMessage).first()).toBeVisible({ timeout: 5000 });
            await expect(enrollmentPage.editBtn).toBeHidden();
            
            await adminApi.updateSecuritySettings({ allFieldsEditable: true });
            logToCsv('Admin Override Validation', 'Admin Override: All non-editable', 'Global', 'N/A', 'Pass');
        } catch (e: any) {
            failTest(e, testInfo);
            logToCsv('Admin Override Validation', 'Admin Override: All non-editable', 'Global', 'N/A', 'Fail', e.message);
        }
    });

    test('Admin Override: Individual fields non-editable', async ({}, testInfo) => {
        console.log('\n--- Starting: Admin Override (Individual fields non-editable) ---');
        try {
            await enrollmentPage.verifyAdminOverrideIndividualFields(enrollmentFields, backendFieldMap, adminApi, logToCsv);
        } catch (e: any) {
            failTest(e, testInfo);
            logToCsv('Admin Override Validation', 'Admin Override: Individual field non-editable', 'multiple', 'N/A', 'Fail', e.message);
        } finally {
            await adminApi.updateSecuritySettings({ editableFields: { fields: [], isEditable: true } });
        }
    });
});

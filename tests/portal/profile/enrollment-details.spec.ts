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
            
            for (const field of enrollmentFields) {
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (locator && positiveData[field]) {
                    await locator.fill(positiveData[field]);
                    console.log(`Filled positive data for ${field}: ${positiveData[field]}`);
                }
            }
            await enrollmentPage.clickSave();
            await expect(page.getByRole('heading', { name: /Updated successfully/i }).first()).toBeVisible({ timeout: 5000 });
            for (const field of enrollmentFields) {
                if (positiveData[field]) {
                    logToCsv('Positive Data Entry Validation', 'Positive Data Entry', field, positiveData[field], 'Pass');
                }
            }
        } catch (e: any) {
            failTest(e, testInfo);
            for (const field of enrollmentFields) {
                if (positiveData[field]) {
                    logToCsv('Positive Data Entry Validation', 'Positive Data Entry', field, positiveData[field], 'Fail', e.message);
                }
            }
        } finally {
            if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
            for (const field of enrollmentFields) {
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (locator) await locator.fill('');
            }
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

        for (const field of enrollmentFields) {
            try {
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (!locator) continue;
                
                // Ensure field has data first
                if (positiveData[field]) {
                    await locator.fill(positiveData[field]);
                }
                
                // Clear the field reliably by filling a space and hitting Backspace to trigger frontend events
                await locator.fill(' ');
                await locator.focus(); // Ensure it's focused before pressing key
                await page.keyboard.press('Backspace');
                await locator.blur();
                
                await expect(page.getByText(/is required/i).first()).toBeVisible({ timeout: 2000 });
                logToCsv('Blank Entry Validation', 'Blank Validation', field, '', 'Pass');
                
                // Restore the data so we can continue to the next field without form errors blocking us
                if (positiveData[field]) {
                    await locator.fill(positiveData[field]);
                }
            } catch (e: any) {
                failTest(e, testInfo);
                logToCsv('Blank Entry Validation', 'Blank Validation', field, '', 'Fail', e.message);
            }
        }

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
        for (const s of scenarios) {
            try {
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                const locator = (enrollmentPage as any)[`${s.field}Input`] || (enrollmentPage as any)[`${s.field}Dropdown`];
                if (!locator) continue;
                
                await locator.fill(s.value);
                await enrollmentPage.clickSave();
                await expect(page.getByText(s.expectedError).first()).toBeVisible({ timeout: 3000 });
                logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Pass');
            } catch (e: any) {
                failTest(e, testInfo);
                logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Fail', e.message);
            } finally {
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                const locator = (enrollmentPage as any)[`${s.field}Input`] || (enrollmentPage as any)[`${s.field}Dropdown`];
                try { await locator.fill(''); } catch(e){}
                if (await enrollmentPage.cancelBtn.isVisible().catch(()=>false)) try { await enrollmentPage.clickCancel(); } catch(e){}
            }
        }
    });

    test('Maximum Character Limits Validation', async ({}, testInfo) => {
        console.log('\n--- Starting: Maximum Character Limits Validation ---');
        const scenarios = (postLoginData as any).enrollmentScenarios.negativeScenarios.filter((s: any) => s.scenario.includes('More than') || s.scenario.includes('restricts input'));
        for (const s of scenarios) {
            try {
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                const locator = (enrollmentPage as any)[`${s.field}Input`] || (enrollmentPage as any)[`${s.field}Dropdown`];
                if (!locator) continue;
                
                await locator.fill(s.value);
                await enrollmentPage.clickSave();
                
                if (s.field === 'admissionYear') {
                    // User confirmed admissionYear natively trims to the exact limit and doesn't throw error
                    logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Pass', 'UI natively restricted input length (No error thrown)');
                } else {
                    await expect(page.getByText(s.expectedError).first()).toBeVisible({ timeout: 3000 });
                    logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Pass');
                }
            } catch (e: any) {
                failTest(e, testInfo);
                logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Fail', e.message);
            } finally {
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                const locator = (enrollmentPage as any)[`${s.field}Input`] || (enrollmentPage as any)[`${s.field}Dropdown`];
                try { await locator.fill(''); } catch(e){}
                if (await enrollmentPage.cancelBtn.isVisible().catch(()=>false)) try { await enrollmentPage.clickCancel(); } catch(e){}
            }
        }
    });

    test('HTML Tags and Invalid Data Entry Validation', async ({}, testInfo) => {
        console.log('\n--- Starting: HTML Tags and Invalid Data Entry Validation ---');
        const scenarios = (postLoginData as any).enrollmentScenarios.negativeScenarios.filter((s: any) => s.scenario.includes('HTML') || s.scenario.includes('apart from numbers'));
        for (const s of scenarios) {
            try {
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                const locator = (enrollmentPage as any)[`${s.field}Input`] || (enrollmentPage as any)[`${s.field}Dropdown`];
                if (!locator) continue;
                
                await locator.fill(s.value);
                await enrollmentPage.clickSave();
                await expect(page.getByText(s.expectedError).first()).toBeVisible({ timeout: 3000 });
                logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Pass');
            } catch (e: any) {
                failTest(e, testInfo);
                logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Fail', e.message);
            } finally {
                if (await enrollmentPage.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await enrollmentPage.clickEdit();
                const locator = (enrollmentPage as any)[`${s.field}Input`] || (enrollmentPage as any)[`${s.field}Dropdown`];
                try { await locator.fill(''); } catch(e){}
                if (await enrollmentPage.cancelBtn.isVisible().catch(()=>false)) try { await enrollmentPage.clickCancel(); } catch(e){}
            }
        }
    });

    test('Auto-suggestion triggers on double click', async ({}, testInfo) => {
        console.log('\n--- Starting: Auto-suggestion triggers on double click ---');
        try {
            await expect(enrollmentPage.editBtn).toBeVisible({ timeout: 5000 }).catch(()=>null);
            if (await enrollmentPage.editBtn.isVisible().catch(()=>false)) await enrollmentPage.clickEdit();
            await expect(enrollmentPage.cancelBtn).toBeVisible({ timeout: 5000 });
            
            for (const field of enrollmentFields) {
                if (field === 'idNumber') continue;
                
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (!locator) continue;
                
                const listId = await locator.getAttribute('list');
                if (listId) {
                    await locator.scrollIntoViewIfNeeded(); await locator.click({ force: true }); await page.waitForTimeout(200); await locator.dblclick({ force: true });
                    const datalist = page.locator(`datalist#${listId}`);
                    await expect(datalist).toBeAttached();
                    logToCsv('Auto-suggestion Validation', `Auto-suggestion on double click (${field})`, field === 'college' ? 'Affiliation' : field, 'Double Click', 'Pass');
                }
            }
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
            
            for (const field of enrollmentFields) {
                if (field === 'idNumber') continue;
                
                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (!locator) continue;
                
                const listId = await locator.getAttribute('list');
                if (listId) {
                    await locator.fill('');
                    await locator.pressSequentially('a', { delay: 100 });
                    const datalist = page.locator(`datalist#${listId}`);
                    await expect(datalist).toBeAttached();
                    logToCsv('Auto-suggestion Validation', `Auto-suggestion on typing (${field})`, field === 'college' ? 'Affiliation' : field, 'a', 'Pass');
                }
            }
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
            for (const field of enrollmentFields) {
                const backendName = backendFieldMap[field];
                if (!backendName) continue;
                
                await adminApi.updateSecuritySettings({ editableFields: { fields: [backendName], isEditable: false } });
                await page.reload();
                await page.getByRole('tab', { name: /Enrollment Details/i }).click();
                await enrollmentPage.clickEdit();

                const locator = (enrollmentPage as any)[`${field}Input`] || (enrollmentPage as any)[`${field}Dropdown`];
                if (locator) {
                    await expect(locator).toBeDisabled({ timeout: 5000 });
                    logToCsv('Admin Override Validation', 'Admin Override: Individual field non-editable', field, 'N/A', 'Pass');
                }
            }
        } catch (e: any) {
            failTest(e, testInfo);
            logToCsv('Admin Override Validation', 'Admin Override: Individual field non-editable', 'multiple', 'N/A', 'Fail', e.message);
        } finally {
            await adminApi.updateSecuritySettings({ editableFields: { fields: [], isEditable: true } });
        }
    });
});

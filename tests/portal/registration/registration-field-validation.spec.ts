import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';
import validationData from '../../test-data/field-validation-data.json';
import { Locator } from '@playwright/test';

test.describe('Registration Form Field Validation', () => {
    test.beforeAll(async () => {
        const adminApi = new AdminApiService();
        await adminApi.login();
        await adminApi.updateSecuritySettings({
            automatedVerification: false,
            mandatoryFields: { fields: [], isMandatory: true }
        });
        await adminApi.close();
    });

    // Increased timeout to 300 seconds to safely allow all 70 data-driven scenarios to finish
    test.setTimeout(300000);

    test('Data-Driven Boundary Validation on Registration Form', async ({ page, portalLoginPage, registrationPage }) => {
        // 1. Navigate to Registration Form
        await portalLoginPage.navigateTo(process.env.PORTAL_URL!);
        await portalLoginPage.signInPopupTrigger.click();
        await portalLoginPage.signUpLink.click();
        await expect(registrationPage.registrationPageIdentifier).toBeVisible();

        // 3. Prepare CSV Report array
        const reportData: any[] = [];
        const csvHeader = 'Scenario,Field,Test Value,Expected Error,Result,Details\n';



        // Iterate through all validation scenarios
        for (const data of validationData) {
            console.log(`Testing Scenario: ${data.scenario}`);

            // Fetch the target locator from the RegistrationPage object dynamically based on the field name in JSON
            const targetField = registrationPage[data.field as keyof typeof registrationPage] as Locator;

            let resultStatus = 'Passed';
            let resultDetails = '';

            if (targetField) {
                try {
                    const tagName = await targetField.evaluate((el: HTMLElement) => el.tagName.toLowerCase()).catch(() => 'input');
                    // Always clear the existing value before filling per user requirement, EXCEPT for file inputs and selects
                    if (tagName !== 'select' && data.field !== 'idDocumentFront' && data.field !== 'idDocumentBack') {
                        await targetField.clear({ timeout: 1000 });
                    }

                    if (data.field === 'idDocumentFront' || data.field === 'idDocumentBack') {
                        const filePath = `tests/test-data/files/${data.value}`;
                        await targetField.setInputFiles(filePath, { timeout: 1000 });
                    }
                    else if (tagName === 'select') {
                        if (data.value === 'BLANK') {
                            await targetField.selectOption({ index: 0 }, { timeout: 1000 }).catch(() => { });
                        } else {
                            await targetField.selectOption(data.value, { timeout: 1000 }).catch(() => { });
                        }
                    }
                    else if (data.bypassLength === true) {
                        await targetField.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
                        await targetField.fill(data.value === 'BLANK' ? '' : data.value, { timeout: 1000 });
                        if (data.value === 'BLANK') await targetField.blur({ timeout: 1000 });
                    }
                    else {
                        if (data.value === 'BLANK') {
                            await targetField.focus({ timeout: 1000 });
                            await targetField.pressSequentially('a', { timeout: 1000 });
                            await targetField.clear({ timeout: 1000 });
                            await targetField.blur({ timeout: 1000 }).catch(() => { });
                        } else {
                            await targetField.fill(data.value, { timeout: 1000 });
                        }
                    }

                    await page.locator('body').click({ position: { x: 0, y: 0 }, timeout: 1000 });

                    // Assert based on validation type
                    if (data.validationType === 'fileUpload' || data.validationType === 'errorMessage') {
                        // Use .last() to avoid strict mode violation when multiple fields share same error text
                        const errorMessage = page.getByText(data.expectedError!, { exact: false }).last();
                        await expect(errorMessage).toBeVisible({ timeout: 1000 });
                        await expect(page.getByRole('button', { name: 'Continue' }).last()).toBeDisabled({ timeout: 1000 });
                    }
                    else if (data.validationType === 'invalidState') {
                        await expect(targetField).toHaveClass(/is-invalid/, { timeout: 1000 });
                        await expect(page.getByRole('button', { name: 'Continue' }).last()).toBeDisabled({ timeout: 1000 });
                    }
                } catch (error: any) {
                    resultStatus = 'Failed';
                    resultDetails = error.message.replace(/[\n\r,]/g, ' '); // Clean for CSV
                }
            } else {
                resultStatus = 'Failed';
                resultDetails = `Target field locator for ${data.field} not found`;
            }

            // Append to report data
            reportData.push(`"${data.scenario}","${data.field}","${data.value || 'BLANK'}","${data.expectedError || 'N/A'}","${resultStatus}","${resultDetails}"\n`);
        }

        // 5. Generate dynamic CSV Report with IST timestamp
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST
        const timestamp = istTime.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0] + '_IST';
        const fs = require('fs');
        const reportPath = `tests/reports/Validation_Report_${timestamp}.csv`;

        if (!fs.existsSync('tests/reports')) {
            fs.mkdirSync('tests/reports', { recursive: true });
        }

        fs.writeFileSync(reportPath, csvHeader + reportData.join(''));
        console.log(`\n✅ CSV Report generated successfully: ${reportPath}\n`);
    });
});

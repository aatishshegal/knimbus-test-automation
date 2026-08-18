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

    // Increase timeout to 300 seconds to safely allow all 70 data-driven scenarios to finish
    test.setTimeout(300000);

    test('Data-Driven Boundary Validation on Registration Form', async ({ page, portalLoginPage, registrationPage }, testInfo) => {
        // 1. Navigate to Registration Form
        await portalLoginPage.navigateTo(process.env.PORTAL_URL!);
        await portalLoginPage.signInPopupTrigger.click();
        await portalLoginPage.signUpLink.click();
        await expect(registrationPage.registrationPageIdentifier).toBeVisible();

        // 3. Prepare CSV Report array
        const reportData: any[] = [];
        const csvHeader = 'Scenario,Field,Test Value,Expected Error,Result,Details\n';
        
        const logResult = (data: any, passed: boolean, details: string) => {
            const status = passed ? 'Passed' : 'Failed';
            const cleanDetails = details.replace(/[\n\r,]/g, ' '); // Clean for CSV
            reportData.push(`"${data.scenario}","${data.field}","${data.value || 'BLANK'}","${data.expectedError || 'N/A'}","${status}","${cleanDetails}"\n`);
        };

        // Iterate through all validation scenarios using the encapsulated POM method
        await registrationPage.executeValidationScenarios(validationData.scenarios, logResult);

        // 5. Generate dynamic CSV Report with IST timestamp
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST
        const timestamp = istTime.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0] + '_IST';
        const fs = require('fs');
        const csvContent = csvHeader + reportData.join('');
        
        // Save to actual report section (test-results directory)
        const reportDir = 'test-results';
        const reportPath = `${reportDir}/Validation_Report_${timestamp}.csv`;
        
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        fs.writeFileSync(reportPath, csvContent);
        
        // Attach the report to the Playwright HTML report
        await testInfo.attach('Validation Report', {
            body: csvContent,
            contentType: 'text/csv'
        });
        
        console.log(`\n✅ CSV Report generated successfully: ${reportPath}\n`);
    });
});

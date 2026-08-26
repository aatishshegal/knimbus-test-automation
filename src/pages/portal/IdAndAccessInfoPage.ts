import { Page, Locator } from '@playwright/test';

export class IdAndAccessInfoPage {
    readonly page: Page;

    // Headings and Containers
    readonly pageHeading: Locator;
    
    // Id Document Section
    readonly frontsideContainer: Locator;
    readonly backsideContainer: Locator;
    readonly frontsideUploadInput: Locator;
    readonly backsideUploadInput: Locator;
    readonly saveBtn: Locator;
    
    // Toast Messages
    readonly toastMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        this.pageHeading = page.getByRole('heading', { name: 'Id Document', exact: true });

        // Using highly resilient parent-filtering for the frontside/backside boxes
        this.frontsideContainer = page.locator('div').filter({ hasText: /^Frontside$/ }).locator('..');
        this.backsideContainer = page.locator('div').filter({ hasText: /^Backside$/ }).locator('..');

        // Locate the file inputs inside their respective containers
        this.frontsideUploadInput = this.frontsideContainer.locator('input[type="file"]');
        this.backsideUploadInput = this.backsideContainer.locator('input[type="file"]');

        this.saveBtn = page.getByRole('button', { name: 'Save', exact: true });
        
        // Common toast message for the application
        this.toastMessage = page.locator('.p-toast-message, .toast-message, snack-bar-container, .ngx-toastr').first();
    }

    async executeImageUploadScenarios(scenarios: any[], dataDir: string, filesDir: string) {
        const { expect } = require('@playwright/test');
        const fs = require('fs');
        const path = require('path');
        
        for (const s of scenarios) {
            console.log(`Executing Scenario: [${s.ScenarioType}] ${s.Scenario}`);
            // Upload Frontside if provided
            if (s.FileName1) {
                const filePath1 = path.resolve(filesDir, s.FileName1);
                const finalPath1 = fs.existsSync(filePath1) ? filePath1 : path.resolve(dataDir, s.FileName1);
                await this.frontsideUploadInput.setInputFiles(finalPath1);
            } else {
                await this.frontsideUploadInput.setInputFiles([]);
            }

            // Upload Backside if provided
            if (s.FileName2) {
                const filePath2 = path.resolve(filesDir, s.FileName2);
                const finalPath2 = fs.existsSync(filePath2) ? filePath2 : path.resolve(dataDir, s.FileName2);
                await this.backsideUploadInput.setInputFiles(finalPath2);
            } else {
                await this.backsideUploadInput.setInputFiles([]);
            }

            // Save
            await this.saveBtn.click();

            // Validate
            try {
                if (s.ScenarioType === 'Positive') {
                    // Wait for the upload to process
                    await this.page.waitForTimeout(1000);
                    
                    if (s.FileName1) {
                        const frontImg = this.frontsideContainer.locator('img').first();
                        await expect(frontImg).toBeVisible({ timeout: 5000 });
                    }
                    if (s.FileName2) {
                        const backImg = this.backsideContainer.locator('img').first();
                        await expect(backImg).toBeVisible({ timeout: 5000 });
                    }
                } else {
                    // Validate error message (can be toast or inline text)
                    const msgLocator = this.page.getByText(s.ExpectedMessage, { exact: false });
                    await expect(msgLocator.first()).toBeVisible({ timeout: 5000 });
                }
                this.logToCsv('Id Document Validation', s.Scenario, s.Side, `${s.FileName1} | ${s.FileName2}`, 'Pass');
            } catch (error: any) {
                this.logToCsv('Id Document Validation', s.Scenario, s.Side, `${s.FileName1} | ${s.FileName2}`, 'Fail', error.message);
                throw error; // Fail the test runner as well
            }
            
            // Clear inputs for the next scenario to avoid pollution
            await this.frontsideUploadInput.setInputFiles([]);
            await this.backsideUploadInput.setInputFiles([]);

            // Dismiss any lingering error modals that might block the next iteration
            const okBtn = this.page.getByRole('button', { name: 'OK', exact: true });
            if (await okBtn.isVisible()) {
                await okBtn.click();
                await this.page.waitForTimeout(500);
            }
        }
    }

    private logToCsv(testCaseName: string, scenario: string, field: string, testData: string, status: string, errorReason: string = '') {
        const fs = require('fs');
        const path = require('path');
        const csvFilePath = path.join(__dirname, '..', '..', '..', 'test-results', 'Id_Access_Info_Validation_Report.csv');
        
        if (!fs.existsSync(csvFilePath)) {
            fs.writeFileSync(csvFilePath, 'Test Case Name,Scenario,Field,Test Data,Status,Error Reason\n');
        }
        const safeError = errorReason ? errorReason.replace(/"/g, '""').replace(/\n/g, ' ') : '';
        const row = `"${testCaseName}","${scenario}","${field}","${testData}","${status}","${safeError}"\n`;
        fs.appendFileSync(csvFilePath, row);
        
        console.log(`[${status}] ${testCaseName} | Scenario: ${scenario} | Data: '${testData}'`);
    }

    // --- Access Section Locators and Methods ---
    
    get accessHeading() {
        return this.page.getByRole('heading', { name: 'Access', exact: true });
    }

    get notActivatedText() {
        return this.page.getByText('This feature is not activated for you. Kindly, raise a request to your librarian.', { exact: true });
    }

    get pendingRequestText() {
        return this.page.getByText('An open request is pending for approval.', { exact: true });
    }

    get raiseRequestBtn() {
        return this.page.getByRole('button', { name: 'Raise a request', exact: true });
    }

    async verifyAccessState(expectedState: 'pending' | 'notActivated') {
        const { expect } = require('@playwright/test');
        
        // Ensure the heading is visible
        await expect(this.accessHeading).toBeVisible();

        if (expectedState === 'pending') {
            await expect(this.pendingRequestText).toBeVisible({ timeout: 5000 });
            // The button might not exist or might be disabled when pending
            if (await this.raiseRequestBtn.isVisible()) {
                await expect(this.raiseRequestBtn).toBeDisabled();
            }
        } else if (expectedState === 'notActivated') {
            await expect(this.notActivatedText).toBeVisible({ timeout: 5000 });
            await expect(this.raiseRequestBtn).toBeVisible();
            // Button is disabled until ID is uploaded
        }
    }

    async raiseOcaRequest() {
        const { expect } = require('@playwright/test');
        await this.raiseRequestBtn.click();
        
        // Handle the Raise a Request modal
        const modal = this.page.getByRole('dialog', { name: 'Raise a Request' }).or(this.page.locator('.modal-content').filter({ hasText: 'Raise a Request' }));
        await expect(modal).toBeVisible({ timeout: 5000 });
        
        // Check Off-Campus Access
        const offCampusCheckbox = modal.locator('input[type="checkbox"]').first();
        await offCampusCheckbox.check({ force: true });
        
        // Click Submit
        const submitBtn = modal.getByRole('button', { name: 'Submit' });
        await submitBtn.click();
        
        // Ensure modal closes
        await expect(modal).toBeHidden({ timeout: 5000 });
    }
}

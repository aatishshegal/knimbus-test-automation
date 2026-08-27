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

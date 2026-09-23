import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class ManageUsersPage extends AdminBasePage {
    // Search Block
    readonly searchInput: Locator;
    readonly searchBtn: Locator;
    readonly clearSearchBtn: Locator;

    // Filters
    readonly expiryDateRangeInput: Locator;
    readonly ocaPendingCheckbox: Locator;
    readonly noServiceGroupCheckbox: Locator;
    readonly applyFiltersBtn: Locator;
    readonly clearFiltersBtn: Locator;

    // Bulk Actions
    readonly exportAllUsersBtn: Locator;
    readonly bulkDeleteUsersBtn: Locator;
    readonly exportFilteredUsersBtn: Locator;
    
    // Dynamic Table Header (when selected)
    readonly headerCancelSelectionBtn: Locator;
    readonly headerDeleteSelectedBtn: Locator;

    // Table
    readonly tableRows: Locator;
    
    // Toasts
    readonly swalToast: Locator;

    // Assign Group Modal
    readonly assignGroupModal: Locator;
    readonly assignGroupSelect: Locator;
    readonly assignGroupExpiryDateInput: Locator;
    readonly assignGroupSaveBtn: Locator;

    // Notification Modal
    readonly notificationModal: Locator;
    readonly notificationTypeWeb: Locator;
    readonly notificationTypeMobile: Locator;
    readonly notificationTypeBoth: Locator;
    readonly userProfileModal: Locator;
    readonly userProfileSaveBtn: Locator;
    readonly userProfileCancelBtn: Locator;

    // Added to fix compilation
    getProfileLocator(name: string) {
        return this.userProfileModal.locator('input[name="' + name + '"]');
    }

    async clickProfileSave() {
        await this.userProfileSaveBtn.click();
    }

    async clickProfileCancel() {
        if (await this.userProfileCancelBtn.isVisible()) {
            await this.userProfileCancelBtn.click();
        } else {
            const closeBtn = this.userProfileModal.getByRole('button', { name: 'Close', exact: true });
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
            } else {
                await this.page.keyboard.press('Escape');
            }
        }
    }


    constructor(page: Page) {
        super(page);

        // Search Block
        this.searchInput = page.locator('input#user-search');
        this.searchBtn = page.getByRole('button', { name: 'Search', exact: true });
        this.clearSearchBtn = page.getByRole('button', { name: 'Clear', exact: true });

        // Filters
        this.expiryDateRangeInput = page.locator('input[name="expiryDateRange"]');
        this.ocaPendingCheckbox = page.locator('input[name="OCA Pending Request"]');
        this.noServiceGroupCheckbox = page.locator('input[name="No Service Group"]');
        this.applyFiltersBtn = page.getByRole('button', { name: 'Apply' });
        this.clearFiltersBtn = page.getByRole('button', { name: 'Clear' });

        // Bulk Actions
        this.exportAllUsersBtn = page.getByRole('button', { name: 'Export All Users' });
        this.bulkDeleteUsersBtn = page.getByRole('button', { name: 'Bulk Delete Users' });
        this.exportFilteredUsersBtn = page.getByRole('button', { name: 'Export Filtered Users' });
        
        // Dynamic Table Header (when selected)
        this.headerCancelSelectionBtn = page.getByRole('button', { name: 'Cancel', exact: true });
        this.headerDeleteSelectedBtn = page.getByRole('button', { name: 'Delete', exact: true });

        // Table
        this.tableRows = page.locator('.user-list-card').locator('xpath=ancestor::tr'); // Robust way to find row containing a user card
        
        this.swalToast = page.locator('.swal2-toast, .swal2-popup');
        
        // Assign Group Modal
        this.assignGroupModal = page.locator('.modal.show, .swal2-popup, .offcanvas.show, [role="dialog"]').filter({ hasText: 'Assign Service Group' });
        this.assignGroupSelect = this.assignGroupModal.locator('select[name="group"]');
        this.assignGroupExpiryDateInput = this.assignGroupModal.locator('input[name="expiryDate"]');
        this.assignGroupSaveBtn = this.assignGroupModal.getByRole('button', { name: 'Save', exact: true });

        // Notification Modal
        this.notificationModal = page.locator('.modal.show, .modal').filter({ hasText: 'Send Notification' });
        this.notificationTypeWeb = this.notificationModal.locator('input#Notification-Type-Web');
        this.notificationTypeMobile = this.notificationModal.locator('input#Notification-Type-Mobile');
        this.notificationTypeBoth = this.notificationModal.locator('input#Notification-Type-Both');
        this.userProfileModal = page.locator('.modal.show, .swal2-popup, .offcanvas.show, [role=\"dialog\"]').filter({ hasText: 'User Profile' });
        this.userProfileSaveBtn = this.userProfileModal.getByRole('button', { name: 'Update', exact: true });
        this.userProfileCancelBtn = this.userProfileModal.getByRole('button', { name: 'Cancel', exact: true });

    }

    async searchForUser(emailOrName: string) {
        await this.page.locator('.overlay').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.searchInput.waitFor({ state: 'visible' });
        await this.searchInput.fill(emailOrName);
        await this.searchBtn.click();
        // Allow time for search results to load
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('.overlay').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    // Helper to get a specific row by email
    getRowByEmail(email: string): Locator {
        return this.tableRows.filter({ hasText: email });
    }

    async selectUserCheckbox(email: string) {
        const row = this.getRowByEmail(email);
        const checkbox = row.locator('input[type="checkbox"]');
        if (!(await checkbox.isChecked())) {
            await checkbox.check();
        }
    }
    
    async deselectUserCheckbox(email: string) {
        const row = this.getRowByEmail(email);
        const checkbox = row.locator('input[type="checkbox"]');
        if (await checkbox.isChecked()) {
            await checkbox.uncheck();
        }
    }

    // Row Actions
    async clickAssignGroup(email: string) {
        const row = this.getRowByEmail(email);
        await row.getByRole('button', { name: 'Assign Group', exact: true }).click();
    }
    
    async assignServiceGroup(email: string, groupName: string) {
        await this.clickAssignGroup(email);
        await this.assignGroupModal.waitFor({ state: 'visible', timeout: 5000 });
        
        // Select the group from the dropdown by text
        await this.assignGroupSelect.selectOption({ label: groupName });
        
        // Leave date field empty (as per requirements)
        
        // Click save
        await this.assignGroupSaveBtn.click();
        
        // Wait for modal to close and toast to appear/disappear
        await this.assignGroupModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.swalToast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await this.swalToast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    async assignServiceGroupWithDate(email: string, groupName: string, dateYYYYMMDD: string) {
        await this.clickAssignGroup(email);
        await this.assignGroupModal.waitFor({ state: 'visible', timeout: 5000 });
        
        // Select the group from the dropdown by text
        await this.assignGroupSelect.selectOption({ label: groupName });
        
        // Input the expiry date using the react-datepicker input field
        await this.assignGroupExpiryDateInput.waitFor({ state: 'visible', timeout: 5000 });
        await this.assignGroupExpiryDateInput.fill(dateYYYYMMDD);
        await this.page.keyboard.press('Enter'); // Dismiss the datepicker calendar
        
        // Click save
        await this.assignGroupSaveBtn.click();
        
        // Wait for modal to close and toast to appear/disappear
        await this.assignGroupModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.swalToast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await this.swalToast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }
    
    async verifyAssignedServiceGroup(email: string, expectedGroup: string) {
        const row = this.getRowByEmail(email);
        // The service group is in the 3rd column (index 2). 
        // When assigned, the 'Assign Group' button is replaced by the group name.
        const { expect } = require('@playwright/test');
        await expect(row.locator('td').nth(2)).toContainText(expectedGroup, { timeout: 10000 });
    }

    async verifyAssignedServiceGroupWithDate(email: string, expectedGroup: string, expectedDateStr: string) {
        const row = this.getRowByEmail(email);
        const { expect } = require('@playwright/test');
        // Ensure both the group name and date appear within the row
        await expect(row).toContainText(expectedGroup, { timeout: 10000 });
        await expect(row).toContainText(expectedDateStr, { timeout: 10000 });
    }
    
    async clickUserDetailsOverview(email: string) {
        const row = this.getRowByEmail(email);
        await row.locator('span[title="User Details Overview"] button, button[title="User Details Overview"]').first().click();
    }
    
    async clickSendNotification(email: string) {
        const row = this.getRowByEmail(email);
        await row.locator('span[title="Send Notification"] button, button[title="Send Notification"]').first().click();
    }
    
    async clickExportUsageLog(email: string) {
        const row = this.getRowByEmail(email);
        await row.locator('span[title="Export Usage Log"] button, button[title="Export Usage Log"]').first().click();
    }
    async deleteUser(email: string) {
        await this.selectUserCheckbox(email);
        const row = this.getRowByEmail(email);
        await row.locator('span[title="Delete user"] button').click();
        
        const confirmBtnYesDelete = this.page.getByRole('button', { name: 'Yes, Delete' });
        const confirmBtnYes = this.page.getByRole('button', { name: 'Yes', exact: true });
        const swalConfirm = this.page.locator('.swal2-confirm');
        
        // Wait for animation to finish
        await this.page.waitForTimeout(500);
        
        if (await confirmBtnYesDelete.isVisible()) {
            await confirmBtnYesDelete.click();
        } else if (await confirmBtnYes.isVisible()) {
            await confirmBtnYes.click();
        } else if (await swalConfirm.isVisible()) {
            await swalConfirm.click();
        }
        
        await this.page.locator('.modal').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.page.locator('.swal2-container').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }
    
    async multiSelectDeleteSelected() {
        // When multiple checkboxes are checked, a "Delete" button appears in the table header
        await this.page.getByRole('button', { name: 'Delete', exact: true }).click();
        
        const confirmBtnYesDelete = this.page.getByRole('button', { name: 'Yes, Delete' });
        const confirmBtnYes = this.page.getByRole('button', { name: 'Yes', exact: true });
        const swalConfirm = this.page.locator('.swal2-confirm');
        
        // Wait for animation to finish
        await this.page.waitForTimeout(500);
        
        if (await confirmBtnYesDelete.isVisible()) {
            await confirmBtnYesDelete.click();
        } else if (await confirmBtnYes.isVisible()) {
            await confirmBtnYes.click();
        } else if (await swalConfirm.isVisible()) {
            await swalConfirm.click();
        }
        
        await this.page.locator('.modal').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.page.locator('.swal2-container').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }
    async closeModal(modalLocator: Locator) {
        const closeBtn = modalLocator.getByRole('button', { name: 'Close', exact: true });
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await this.page.keyboard.press('Escape');
        }
    }

    async cancelAssignGroupModal() {
        const closeBtn = this.assignGroupModal.getByRole('button', { name: 'Cancel' }).first();
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await this.page.keyboard.press('Escape');
        }
    }

    async cancelDeletionSafely() {
        const swalCancel = this.page.locator('.swal2-cancel');
        const modalCancel = this.page.locator('.modal.show').getByRole('button', { name: 'Cancel', exact: true });
        if (await swalCancel.isVisible()) {
            await swalCancel.click();
        } else if (await modalCancel.isVisible()) {
            await modalCancel.click();
        } else {
            await this.page.keyboard.press('Escape');
        }
    }

    async cancelSendNotificationModal(modalLocator: Locator) {
        const cancelBtn = modalLocator.getByRole('button', { name: 'Cancel' });
        if (await cancelBtn.isVisible()) await cancelBtn.click();
    }

    async clearSearchSafely() {
        if (await this.clearSearchBtn.isVisible()) { 
            await this.clearSearchBtn.click(); 
        }
    }
}

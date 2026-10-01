import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class ManageUsersPage extends AdminBasePage {
    // Search Block
    readonly searchInput: Locator;
    readonly searchBtn: Locator;
    readonly clearSearchBtn: Locator;

    // Filters
    readonly filterToggleBtn: Locator;
    readonly contentGroupSelect: Locator;
    readonly serviceGroupSelect: Locator;
    readonly userTypeSelect: Locator;
    readonly designationSelect: Locator;
    readonly expiryDateRangeInput: Locator;
    readonly ocaPendingCheckbox: Locator;
    readonly noServiceGroupCheckbox: Locator;
    readonly incompleteRegistrationsCheckbox: Locator;
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
    readonly notificationTitleInput: Locator;
    readonly notificationDescTextarea: Locator;
    readonly notificationCharCounter: Locator;
    readonly notificationTypeWeb: Locator;
    readonly notificationTypeMobile: Locator;
    readonly notificationTypeBoth: Locator;
    readonly notificationSendBtn: Locator;
    readonly notificationCancelBtn: Locator;
    readonly notificationCloseCrossBtn: Locator;

    // Export Usage Log Modal
    readonly exportUsageLogModal: Locator;
    readonly exportUsageLogDateRangeInput: Locator;
    readonly exportUsageLogExportBtn: Locator;
    readonly exportUsageLogCancelBtn: Locator;
    readonly exportUsageLogCloseCrossBtn: Locator;
    readonly userProfileModal: Locator;
    readonly userProfileSaveBtn: Locator;
    readonly userProfileCancelBtn: Locator;

    // Content Group Locators
    readonly contentGroupInput: Locator;
    readonly contentGroupDropdown: Locator;
    readonly contentGroupOptionList: Locator;
    readonly contentGroupOptions: Locator;
    readonly contentGroupSelectAllBtn: Locator;
    readonly contentGroupClearAllBtn: Locator;

    // Service Group Locators (User Profile Modal)
    readonly userProfileServiceGroupSelect: Locator;
    readonly userProfileRaExpiryDateInput: Locator;
    readonly userProfileServiceGroupExpiredWarning: Locator;

    // Change Password Locators
    readonly changePasswordTab: Locator;
    readonly newPasswordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly newPasswordEyeIcon: Locator;
    readonly confirmPasswordEyeIcon: Locator;
    readonly changePasswordUpdateBtn: Locator;
    readonly changePasswordCloseBtn: Locator;
    readonly newPasswordError: Locator;
    readonly confirmPasswordError: Locator;
    readonly passwordMismatchError: Locator;

    // ID Document Locators
    readonly idDocumentTab: Locator;
    readonly idDocIntroText: Locator;
    readonly idDocFrontContainer: Locator;
    readonly idDocBackContainer: Locator;
    readonly idDocFrontHeading: Locator;
    readonly idDocBackHeading: Locator;
    readonly idDocFrontInput: Locator;
    readonly idDocBackInput: Locator;
    readonly idDocFrontBrowseLabel: Locator;
    readonly idDocBackBrowseLabel: Locator;
    readonly idDocFrontMainInstruction: Locator;
    readonly idDocBackMainInstruction: Locator;
    readonly idDocFrontBestFitInfo: Locator;
    readonly idDocBackBestFitInfo: Locator;
    readonly idDocFrontFormatInfo: Locator;
    readonly idDocBackFormatInfo: Locator;
    readonly idDocFrontFileName: Locator;
    readonly idDocBackFileName: Locator;
    readonly idDocFrontPreviewImage: Locator;
    readonly idDocBackPreviewImage: Locator;
    readonly idDocFrontError: Locator;
    readonly idDocBackError: Locator;
    readonly idDocUpdateBtn: Locator;
    readonly idDocCloseBtn: Locator;

    async selectProfileServiceGroup(groupName: string) {
        await this.scrollToGroupDetails();
        await this.userProfileServiceGroupSelect.focus();
        await this.userProfileServiceGroupSelect.selectOption({ label: groupName });
        await this.userProfileServiceGroupSelect.evaluate(node => node.dispatchEvent(new Event('change', { bubbles: true })));
    }

    async getSelectedProfileServiceGroup(): Promise<string> {
        await this.scrollToGroupDetails();
        const checkedOption = this.userProfileServiceGroupSelect.locator('option:checked');
        return (await checkedOption.innerText()).trim();
    }

    async getProfileRaExpiryDateValue(): Promise<string> {
        return await this.userProfileRaExpiryDateInput.inputValue();
    }

    async isProfileServiceGroupExpiredWarningVisible(): Promise<boolean> {
        return await this.userProfileServiceGroupExpiredWarning.isVisible();
    }

    async closeUserProfileModalViaCloseButton() {
        const closeBtn = this.userProfileModal.getByRole('button', { name: 'Close', exact: true });
        await closeBtn.click();
        await this.userProfileModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async closeUserProfileModalViaCrossIcon() {
        const crossBtn = this.userProfileModal.locator('.fa-x, .btn-close, button.close').first();
        await crossBtn.click();
        await this.userProfileModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async closeAssignGroupModalViaEscape() {
        await this.page.keyboard.press('Escape');
        await this.assignGroupModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async closeAssignGroupModalViaBackdrop() {
        await this.page.mouse.click(10, 10);
        await this.assignGroupModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    // Added to fix compilation
    getProfileLocator(name: string) {
        return this.userProfileModal.locator('[name="' + name + '"]');
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

    async scrollToGroupDetails() {
        await this.page.evaluate(() => {
            const modalBody = document.querySelector('.modal-body') || document.querySelector('.modal-content');
            if (modalBody) modalBody.scrollTop = modalBody.scrollHeight;
        });
        await this.contentGroupInput.scrollIntoViewIfNeeded();
    }

    async openContentGroupDropdown() {
        await this.scrollToGroupDetails();
        if (!(await this.contentGroupDropdown.isVisible())) {
            await this.contentGroupInput.click();
            await this.contentGroupDropdown.waitFor({ state: 'visible', timeout: 5000 });
        }
    }

    async closeContentGroupDropdown() {
        if (await this.contentGroupDropdown.isVisible()) {
            await this.contentGroupInput.click();
            await this.contentGroupDropdown.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
    }

    async closeContentGroupDropdownViaBackdrop() {
        if (await this.contentGroupDropdown.isVisible()) {
            await this.userProfileModal.getByText('Group details').click();
            await this.contentGroupDropdown.waitFor({ state: 'hidden', timeout: 5000 });
        }
    }

    async selectAllContentGroupsManually(groupNames: string[]) {
        await this.openContentGroupDropdown();
        const count = groupNames.length;
        for (let i = 0; i < count; i++) {
            const name = groupNames[i];
            const option = this.getContentGroupOptionLocator(name);
            const button = option.locator('button');
            const isSelected = ((await button.getAttribute('class')) || '').includes('selected');
            if (!isSelected) {
                await option.click();
            }
        }
    }

    getContentGroupOptionLocator(groupName: string): Locator {
        return this.contentGroupOptions.filter({ hasText: groupName }).first();
    }

    async selectContentGroup(groupName: string) {
        await this.openContentGroupDropdown();
        const option = this.getContentGroupOptionLocator(groupName);
        await option.click();
    }

    async isContentGroupOptionSelected(groupName: string): Promise<boolean> {
        await this.openContentGroupDropdown();
        const option = this.getContentGroupOptionLocator(groupName);
        const button = option.locator('button');
        const classAttr = await button.getAttribute('class') || '';
        return classAttr.includes('selected');
    }

    async clickSelectAllContentGroups() {
        await this.openContentGroupDropdown();
        await this.contentGroupSelectAllBtn.click();
    }

    async clickClearAllContentGroups() {
        await this.openContentGroupDropdown();
        if (!(await this.contentGroupClearAllBtn.isDisabled())) {
            await this.contentGroupClearAllBtn.click();
        }
    }

    async getContentGroupInputValue(): Promise<string> {
        await this.scrollToGroupDetails();
        return await this.contentGroupInput.inputValue();
    }

    async isClearAllContentGroupsDisabled(): Promise<boolean> {
        await this.openContentGroupDropdown();
        return await this.contentGroupClearAllBtn.isDisabled();
    }

    async saveProfileAndExpectSuccess() {
        await this.closeContentGroupDropdown();
        await this.userProfileSaveBtn.click();
        await this.swalToast.waitFor({ state: 'visible', timeout: 10000 });
        await this.userProfileModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    async verifyOnlyContentGroupsSelected(expectedGroups: string[]) {
        await this.openContentGroupDropdown();
        const count = await this.contentGroupOptions.count();
        for (let i = 0; i < count; i++) {
            const opt = this.contentGroupOptions.nth(i);
            const text = (await opt.innerText()).trim();
            const btn = opt.locator('button');
            const isSelected = ((await btn.getAttribute('class')) || '').includes('selected');
            if (expectedGroups.includes(text)) {
                if (!isSelected) {
                    throw new Error(`Expected group "${text}" to be selected, but it was not.`);
                }
            } else {
                if (isSelected) {
                    throw new Error(`Expected group "${text}" NOT to be selected, but it was.`);
                }
            }
        }
    }

    async verifyAllContentGroupsSelected() {
        await this.openContentGroupDropdown();
        const count = await this.contentGroupOptions.count();
        for (let i = 0; i < count; i++) {
            const opt = this.contentGroupOptions.nth(i);
            const text = (await opt.innerText()).trim();
            const btn = opt.locator('button');
            const isSelected = ((await btn.getAttribute('class')) || '').includes('selected');
            if (!isSelected) {
                throw new Error(`Expected all groups to be selected, but "${text}" was not selected.`);
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
        this.filterToggleBtn = page.locator('button.filter-toggle-button');
        this.contentGroupSelect = page.locator('select#contentGroup');
        this.serviceGroupSelect = page.locator('select#serviceGroup');
        this.userTypeSelect = page.locator('select#userType');
        this.designationSelect = page.locator('select#designation');
        this.expiryDateRangeInput = page.locator('input#floating-expiryDateRange');
        this.ocaPendingCheckbox = page.locator('input[name="OCA Pending Request"]');
        this.noServiceGroupCheckbox = page.locator('input[name="No Service Group"]');
        this.incompleteRegistrationsCheckbox = page.locator('input[name="Incomplete Registrations"]');
        this.applyFiltersBtn = page.locator('button.btn-fltr-cta').filter({ hasText: 'Apply' });
        this.clearFiltersBtn = page.locator('button.btn-fltr-cta').filter({ hasText: 'Clear' });

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
        this.notificationTitleInput = this.notificationModal.locator('input[name="title"]');
        this.notificationDescTextarea = this.notificationModal.locator('textarea[name="description"]');
        this.notificationCharCounter = this.notificationModal.locator('.desc-remain-char');
        this.notificationTypeWeb = this.notificationModal.locator('input#Notification-Type-Web');
        this.notificationTypeMobile = this.notificationModal.locator('input#Notification-Type-Mobile');
        this.notificationTypeBoth = this.notificationModal.locator('input#Notification-Type-Both');
        this.notificationSendBtn = this.notificationModal.locator('button[form="singleUserNotificationForm"]');
        this.notificationCancelBtn = this.notificationModal.locator('.modal-footer button.btn-outline-danger');
        this.notificationCloseCrossBtn = this.notificationModal.locator('button.custom-modal-close');

        // Export Usage Log Modal
        this.exportUsageLogModal = page.locator('.modal.show, .modal').filter({ hasText: 'Export Usage Log' });
        this.exportUsageLogDateRangeInput = this.exportUsageLogModal.locator('input[name="usageDateRange"]');
        this.exportUsageLogExportBtn = this.exportUsageLogModal.getByRole('button', { name: 'Export', exact: true });
        this.exportUsageLogCancelBtn = this.exportUsageLogModal.getByRole('button', { name: 'Cancel', exact: true });
        this.exportUsageLogCloseCrossBtn = this.exportUsageLogModal.locator('button.custom-modal-close');
        this.userProfileModal = page.locator('.modal.show, .swal2-popup, .offcanvas.show, [role=\"dialog\"]').filter({ hasText: 'User Profile' });
        this.userProfileSaveBtn = this.userProfileModal.getByRole('button', { name: 'Update', exact: true });
        this.userProfileCancelBtn = this.userProfileModal.getByRole('button', { name: 'Cancel', exact: true });

        // Content Group Initializations
        this.contentGroupInput = this.userProfileModal.locator('#content-group');
        this.contentGroupDropdown = this.userProfileModal.locator('.multi-dropdown');
        this.contentGroupOptionList = this.userProfileModal.locator('.multi-dropdown ul.option-list');
        this.contentGroupOptions = this.userProfileModal.locator('.multi-dropdown ul.option-list li[role="option"]');
        this.contentGroupSelectAllBtn = this.userProfileModal.locator('.multi-dropdown').getByRole('button', { name: 'Select all', exact: true });
        this.contentGroupClearAllBtn = this.userProfileModal.locator('.multi-dropdown').getByRole('button', { name: 'Clear all', exact: true });

        // Service Group Initializations
        this.userProfileServiceGroupSelect = this.userProfileModal.locator('#serviceGroup');
        this.userProfileRaExpiryDateInput = this.userProfileModal.locator('input[name="raExpiryDate"]');
        this.userProfileServiceGroupExpiredWarning = this.userProfileModal.locator('.text-danger').filter({ hasText: 'This service group is already expired!!' });

        // Change Password Initializations
        this.changePasswordTab = this.userProfileModal.getByRole('tab', { name: 'Change password' });
        this.newPasswordInput = this.userProfileModal.locator('input#password');
        this.confirmPasswordInput = this.userProfileModal.locator('input#confirmPassword');
        this.newPasswordEyeIcon = this.userProfileModal.locator('.input-group:has(#password) .password-eye-icon-wrapper');
        this.confirmPasswordEyeIcon = this.userProfileModal.locator('.input-group:has(#confirmPassword) .password-eye-icon-wrapper');
        this.changePasswordUpdateBtn = this.userProfileModal.locator('button[form="changePasswordForm"]');
        this.changePasswordCloseBtn = this.userProfileModal.locator('#changePasswordForm button').filter({ hasText: 'Close' });
        this.newPasswordError = this.userProfileModal.locator('.col-xl-6:has(#password) .text-danger, .col-xl-6:has(#password) span.text-danger');
        this.confirmPasswordError = this.userProfileModal.locator('.col-xl-6:has(#confirmPassword) .text-danger, .col-xl-6:has(#confirmPassword) span.text-danger');
        this.passwordMismatchError = this.userProfileModal.locator('.text-danger').filter({ hasText: 'New password and confirm password should be same!' });

        // ID Document Initializations
        this.idDocumentTab = this.userProfileModal.getByRole('tab', { name: 'ID document' });
        this.idDocIntroText = this.userProfileModal.locator('.custom-modal-w-tab-padding .ft-14').first();
        this.idDocFrontContainer = this.userProfileModal.locator('.id-doc-card-container:has(input[name="idCardFront"])');
        this.idDocBackContainer = this.userProfileModal.locator('.id-doc-card-container:has(input[name="idCardBack"])');
        this.idDocFrontHeading = this.idDocFrontContainer.locator('.id-doc-heading');
        this.idDocBackHeading = this.idDocBackContainer.locator('.id-doc-heading');
        this.idDocFrontInput = this.idDocFrontContainer.locator('input[name="idCardFront"]');
        this.idDocBackInput = this.idDocBackContainer.locator('input[name="idCardBack"]');
        this.idDocFrontBrowseLabel = this.idDocFrontContainer.locator('label.browse-button');
        this.idDocBackBrowseLabel = this.idDocBackContainer.locator('label.browse-button');
        this.idDocFrontMainInstruction = this.idDocFrontContainer.locator('.main-instruction');
        this.idDocBackMainInstruction = this.idDocBackContainer.locator('.main-instruction');
        this.idDocFrontBestFitInfo = this.idDocFrontContainer.locator('.best-fit-info');
        this.idDocBackBestFitInfo = this.idDocBackContainer.locator('.best-fit-info');
        this.idDocFrontFormatInfo = this.idDocFrontContainer.locator('.format-info');
        this.idDocBackFormatInfo = this.idDocBackContainer.locator('.format-info');
        this.idDocFrontFileName = this.idDocFrontContainer.locator('.fst-italic');
        this.idDocBackFileName = this.idDocBackContainer.locator('.fst-italic');
        this.idDocFrontPreviewImage = this.idDocFrontContainer.locator('.preview-image');
        this.idDocBackPreviewImage = this.idDocBackContainer.locator('.preview-image');
        this.idDocFrontError = this.idDocFrontContainer.locator('.text-danger').filter({ hasNotText: '*' });
        this.idDocBackError = this.idDocBackContainer.locator('.text-danger').filter({ hasNotText: '*' });
        this.idDocUpdateBtn = this.userProfileModal.locator('button[form="idDocumentForm"]');
        this.idDocCloseBtn = this.userProfileModal.locator('#idDocumentForm button').filter({ hasText: 'Close' });
    }

    async clickChangePasswordTab() {
        await this.changePasswordTab.click();
        await this.newPasswordInput.waitFor({ state: 'visible', timeout: 5000 });
    }

    async fillNewPassword(value: string) {
        await this.newPasswordInput.fill(value);
        await this.newPasswordInput.blur();
    }

    async fillConfirmPassword(value: string) {
        await this.confirmPasswordInput.fill(value);
        await this.confirmPasswordInput.blur();
    }

    async clearNewPassword() {
        await this.newPasswordInput.fill('');
        await this.newPasswordInput.blur();
    }

    async clearConfirmPassword() {
        await this.confirmPasswordInput.fill('');
        await this.confirmPasswordInput.blur();
    }

    async clickNewPasswordEyeIcon() {
        await this.newPasswordEyeIcon.click();
    }

    async clickConfirmPasswordEyeIcon() {
        await this.confirmPasswordEyeIcon.click();
    }

    async getNewPasswordInputType(): Promise<string> {
        return (await this.newPasswordInput.getAttribute('type')) || '';
    }

    async getConfirmPasswordInputType(): Promise<string> {
        return (await this.confirmPasswordInput.getAttribute('type')) || '';
    }

    async clickChangePasswordUpdate() {
        await this.changePasswordUpdateBtn.click();
    }

    async clickChangePasswordClose() {
        await this.changePasswordCloseBtn.click();
        await this.userProfileModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    // ID Document Actions
    async clickIdDocumentTab() {
        await this.idDocumentTab.click();
        await this.idDocFrontContainer.waitFor({ state: 'visible', timeout: 5000 });
    }

    async uploadFrontIdFile(filePath: string) {
        await this.idDocFrontInput.setInputFiles(filePath);
    }

    async uploadBackIdFile(filePath: string) {
        await this.idDocBackInput.setInputFiles(filePath);
    }

    async getFrontMainInstructionText(): Promise<string> {
        return (await this.idDocFrontMainInstruction.innerText()).trim();
    }

    async getBackMainInstructionText(): Promise<string> {
        return (await this.idDocBackMainInstruction.innerText()).trim();
    }

    async getFrontErrorText(): Promise<string> {
        return (await this.idDocFrontError.innerText()).trim();
    }

    async getBackErrorText(): Promise<string> {
        return (await this.idDocBackError.innerText()).trim();
    }

    async clickIdDocUpdate() {
        await this.idDocUpdateBtn.click();
    }

    async clickIdDocClose() {
        await this.idDocCloseBtn.click();
        await this.userProfileModal.waitFor({ state: 'hidden', timeout: 5000 });
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
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator('span[title="User Details Overview"] button, button[title="User Details Overview"]').first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.userProfileModal.waitFor({ state: 'visible', timeout: 10000 });
    }
    
    async clickSendNotification(email: string) {
        const row = this.getRowByEmail(email);
        await row.locator('span[title="Send Notification"] button, button[title="Send Notification"]').first().click();
        await this.notificationModal.waitFor({ state: 'visible', timeout: 5000 });
    }

    async fillNotificationTitle(title: string) {
        await this.notificationTitleInput.fill(title);
    }

    async fillNotificationDescription(description: string) {
        await this.notificationDescTextarea.fill(description);
    }

    async selectNotificationType(type: 'Web' | 'Mobile' | 'Both') {
        if (type === 'Web') {
            await this.notificationTypeWeb.check();
        } else if (type === 'Mobile') {
            await this.notificationTypeMobile.check();
        } else if (type === 'Both') {
            await this.notificationTypeBoth.check();
        }
    }

    async clickSendNotificationSubmit() {
        await this.notificationSendBtn.click();
        await this.notificationModal.waitFor({ state: 'hidden', timeout: 10000 });
    }

    async clickExportUsageLog(email: string) {
        const row = this.getRowByEmail(email);
        await row.locator('span[title="Export Usage Log"] button, button[title="Export Usage Log"]').first().click();
        await this.exportUsageLogModal.waitFor({ state: 'visible', timeout: 5000 });
    }

    async clickExportUsageLogSubmit(): Promise<any> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.exportUsageLogExportBtn.click();
        const download = await downloadPromise;
        await this.exportUsageLogModal.waitFor({ state: 'hidden', timeout: 10000 });
        return download;
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

    // Filter Actions
    async openFilters() {
        if (!(await this.serviceGroupSelect.isVisible())) {
            await this.filterToggleBtn.click();
            await this.serviceGroupSelect.waitFor({ state: 'visible', timeout: 5000 });
        }
    }

    async closeFilters() {
        if (await this.serviceGroupSelect.isVisible()) {
            await this.filterToggleBtn.click();
            await this.serviceGroupSelect.waitFor({ state: 'hidden', timeout: 5000 });
        }
    }

    async isApplyFilterDisabled(): Promise<boolean> {
        const isBtnDisabled = await this.applyFiltersBtn.isDisabled();
        const parentClass = await this.applyFiltersBtn.locator('..').getAttribute('class') || '';
        return isBtnDisabled || parentClass.includes('cursor-not-allowed');
    }

    async isClearFilterDisabled(): Promise<boolean> {
        const isBtnDisabled = await this.clearFiltersBtn.isDisabled();
        const parentClass = await this.clearFiltersBtn.locator('..').getAttribute('class') || '';
        return isBtnDisabled || parentClass.includes('cursor-not-allowed');
    }

    async filterByServiceGroup(groupName: string) {
        await this.openFilters();
        await this.serviceGroupSelect.selectOption({ label: groupName });
        await this.applyFiltersBtn.click();
        await this.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async filterByUserType(userType: string) {
        await this.openFilters();
        await this.userTypeSelect.selectOption({ label: userType });
        await this.applyFiltersBtn.click();
        await this.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async filterByIncompleteRegistrations() {
        await this.openFilters();
        await this.incompleteRegistrationsCheckbox.check({ force: true });
        await this.applyFiltersBtn.click();
        await this.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async clickClearFilters() {
        await this.clearFiltersBtn.click();
        await this.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async verifyAllVisibleRowsHaveServiceGroup(expectedGroup: string) {
        const count = await this.tableRows.count();
        const { expect } = require('@playwright/test');
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const row = this.tableRows.nth(i);
            await expect(row.locator('td').nth(2)).toContainText(expectedGroup);
        }
    }
}

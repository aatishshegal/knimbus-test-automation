import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class ServiceGroupsPage extends AdminBasePage {
    // Page Elements
    readonly createGroupBtn: Locator;
    readonly searchInput: Locator;
    readonly showingText: Locator;
    readonly showingCount: Locator;
    readonly tableRows: Locator;
    readonly loadMoreBtn: Locator;
    readonly groupNameHeader: Locator;
    readonly groupNameSortLink: Locator;
    readonly groupNameSortIcon: Locator;

    // Create Group Modal
    readonly modal: Locator;
    readonly modalBackdrop: Locator;
    readonly closeCrossBtn: Locator;
    readonly groupNameInput: Locator;
    readonly expiryDateInput: Locator;
    readonly datePicker: Locator;
    readonly nextMonthBtn: Locator;
    readonly disabledDateDays: Locator;
    readonly availableDateDays: Locator;
    readonly raCheckbox: Locator;
    readonly mobileCheckbox: Locator;
    readonly accessOptionsContainer: Locator;
    readonly accessLabels: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    // Errors & Alerts
    readonly groupNameError: Locator;
    readonly expiryDateError: Locator;
    readonly duplicateGroupAlert: Locator;

    // Delete Modal
    readonly deleteModal: Locator;
    readonly deleteAlertTitle: Locator;
    readonly deleteAlertMessage: Locator;
    readonly deleteYesBtn: Locator;
    readonly deleteCancelBtn: Locator;
    readonly deleteCloseCrossBtn: Locator;

    // Expired Group SweetAlert
    readonly expiredAlert: Locator;
    readonly expiredAlertTitle: Locator;
    readonly expiredAlertMessage: Locator;
    readonly expiredContinueBtn: Locator;
    readonly expiredCancelBtn: Locator;

    constructor(page: Page) {
        super(page);

        // Page Elements
        this.createGroupBtn = page.getByRole('button', { name: /create group/i });
        this.searchInput = page.getByPlaceholder(/find group/i);
        this.showingText = page.locator('span.show-more-text');
        this.showingCount = page.locator('span.show-more-text .show-more-count').last();
        this.tableRows = page.locator('table tbody tr');
        this.loadMoreBtn = page.getByRole('button', { name: /load more/i });
        this.groupNameHeader = page.locator('table thead th').filter({ hasText: /group name/i });
        this.groupNameSortLink = this.groupNameHeader.locator('a.sorting-icons');
        this.groupNameSortIcon = this.groupNameHeader.locator('a.sorting-icons svg');

        // Modal Elements
        this.modal = page.locator('.modal.show, .modal').filter({ hasText: 'Create group' });
        this.modalBackdrop = page.locator('.modal-backdrop');
        this.closeCrossBtn = this.modal.locator('button.custom-modal-close');
        this.groupNameInput = this.modal.locator('input#group-name');
        this.expiryDateInput = this.modal.locator('input[name="expiryDate"]');
        this.datePicker = page.locator('.react-datepicker');
        this.nextMonthBtn = page.locator('.react-datepicker__navigation--next');
        this.disabledDateDays = page.locator('.react-datepicker__day--disabled');
        this.availableDateDays = page.locator('.react-datepicker__day:not(.react-datepicker__day--disabled):not(.react-datepicker__day--outside-month)');
        this.raCheckbox = this.modal.locator('input#raService');
        this.mobileCheckbox = this.modal.locator('input#mobileService');
        this.accessOptionsContainer = this.modal.locator('.d-flex.flex-column.flex-sm-row');
        this.accessLabels = this.accessOptionsContainer.locator('label.custom-check-box-w-icon');
        this.saveBtn = this.modal.locator('button[form="createServiceGroupForm"]');
        this.cancelBtn = this.modal.locator('.modal-footer button.btn-outline-danger');

        // Error & Alert Elements
        this.groupNameError = this.modal.locator('.text-danger').filter({ hasText: /group name|only plain text|leading or trailing|maximum 100/i });
        this.expiryDateError = this.modal.locator('.text-danger').filter({ hasText: /expiry date is required/i });
        this.duplicateGroupAlert = this.modal.locator('.custom-alert-info');

        // Delete Modal Elements
        this.deleteModal = page.locator('.modal.show').filter({ hasText: /are you sure you want to delete group/i });
        this.deleteAlertTitle = this.deleteModal.locator('.custom-modal-header .title');
        this.deleteAlertMessage = this.deleteModal.locator('.custom-modal-body');
        this.deleteYesBtn = this.deleteModal.locator('button:has-text("Yes, Delete")');
        this.deleteCancelBtn = this.deleteModal.locator('.modal-footer button:has-text("Cancel")');
        this.deleteCloseCrossBtn = this.deleteModal.locator('button.custom-modal-close');

        // Expired Group SweetAlert
        this.expiredAlert = page.locator('.swal2-popup');
        this.expiredAlertTitle = this.expiredAlert.locator('.swal2-title');
        this.expiredAlertMessage = this.expiredAlert.locator('.swal2-html-container');
        this.expiredContinueBtn = this.expiredAlert.locator('.swal2-confirm');
        this.expiredCancelBtn = this.expiredAlert.locator('.swal2-cancel');
    }

    async clickCreateGroup(): Promise<void> {
        await this.createGroupBtn.click();
        await this.modal.waitFor({ state: 'visible', timeout: 5000 });
    }

    async closeModalViaCross(): Promise<void> {
        await this.closeCrossBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async closeModalViaCancel(): Promise<void> {
        await this.cancelBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async fillGroupName(name: string): Promise<void> {
        await this.groupNameInput.fill(name);
        await this.groupNameInput.blur();
    }

    async clearGroupName(): Promise<void> {
        await this.groupNameInput.fill('');
        await this.groupNameInput.blur();
    }

    async openCalendar(): Promise<void> {
        await this.expiryDateInput.click();
        await this.datePicker.waitFor({ state: 'visible', timeout: 5000 });
    }

    async closeCalendarViaEscape(): Promise<void> {
        await this.page.keyboard.press('Escape');
        await this.datePicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    async setExpiryDate(dateYYYYMMDD: string): Promise<void> {
        await this.expiryDateInput.fill(dateYYYYMMDD);
        await this.groupNameInput.click();
        await this.datePicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    async selectRandomFutureExpiryDateViaCalendar(): Promise<string> {
        await this.openCalendar();
        if (await this.nextMonthBtn.isVisible()) {
            await this.nextMonthBtn.click();
        }
        const availableDays = this.availableDateDays;
        const count = await availableDays.count();
        if (count === 0) {
            throw new Error('No available future dates in calendar picker');
        }
        const randomIndex = Math.floor(Math.random() * count);
        const selectedDay = availableDays.nth(randomIndex);
        await selectedDay.click();
        await this.datePicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        return (await this.expiryDateInput.inputValue()).trim();
    }

    async selectOffCampusAccess(): Promise<void> {
        if (!(await this.raCheckbox.isChecked())) {
            await this.raCheckbox.check();
        }
    }

    async unselectOffCampusAccess(): Promise<void> {
        if (await this.raCheckbox.isChecked()) {
            await this.raCheckbox.uncheck();
        }
    }

    async selectMobileApp(): Promise<void> {
        if (!(await this.mobileCheckbox.isChecked())) {
            await this.mobileCheckbox.check();
        }
    }

    async clickSave(): Promise<void> {
        await this.saveBtn.click();
    }

    async saveGroupAndReload(): Promise<void> {
        await this.saveBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 10000 });
        const swalOk = this.page.locator('.swal2-confirm');
        if (await swalOk.isVisible({ timeout: 2000 }).catch(() => false)) {
            await swalOk.click();
        }
        await this.waitForTableLoaded();
    }

    async waitForTableLoaded(): Promise<void> {
        await this.modalBackdrop.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
        const isLoaded = await this.showingText.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
        if (!isLoaded) {
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.showingText.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
        }
    }

    async waitForShowingCount(expectedCount: number, timeoutMs = 15000): Promise<void> {
        const matched = await this.page.waitForFunction(
            ({ sel, exp }) => {
                const el = document.querySelectorAll(sel);
                if (!el || el.length === 0) return false;
                const lastEl = el[el.length - 1];
                return lastEl && lastEl.textContent?.trim() === String(exp);
            },
            { sel: 'span.show-more-text .show-more-count', exp: expectedCount },
            { timeout: 5000 }
        ).then(() => true).catch(() => false);

        if (!matched) {
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.waitForTableLoaded();
            await this.page.waitForFunction(
                ({ sel, exp }) => {
                    const el = document.querySelectorAll(sel);
                    if (!el || el.length === 0) return false;
                    const lastEl = el[el.length - 1];
                    return lastEl && lastEl.textContent?.trim() === String(exp);
                },
                { sel: 'span.show-more-text .show-more-count', exp: expectedCount },
                { timeout: timeoutMs }
            );
        }
    }

    async getShowingCount(): Promise<number> {
        await this.waitForTableLoaded();
        const countText = await this.showingCount.innerText();
        return parseInt(countText.trim(), 10);
    }

    getGroupRow(groupName: string): Locator {
        return this.tableRows.filter({ hasText: groupName });
    }

    getExpiryDateCell(groupName: string): Locator {
        return this.getGroupRow(groupName).locator('td:nth-child(5)');
    }

    async getExpiryDate(groupName: string): Promise<string> {
        return (await this.getExpiryDateCell(groupName).innerText()).trim();
    }

    async isGroupPresentInTable(groupName: string): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        const row = this.getGroupRow(groupName);
        return (await row.count()) > 0;
    }

    async ensureGroupVisibleInTable(groupName: string): Promise<void> {
        await this.waitForTableLoaded();
        const row = this.getGroupRow(groupName).first();
        if (!(await row.isVisible())) {
            await this.searchGroup(groupName);
        }
        await this.getGroupRow(groupName).first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async createGroupIfNotPresent(groupName: string, expiryDateStr: string): Promise<void> {
        await this.waitForTableLoaded();
        const isPresent = await this.isGroupPresentInTable(groupName);
        if (!isPresent) {
            await this.clearSearch();
            await this.clickCreateGroup();
            await this.fillGroupName(groupName);
            await this.setExpiryDate(expiryDateStr);
            await this.saveGroupAndReload();
        }
        await this.ensureGroupVisibleInTable(groupName);
    }

    // --- Search Helpers ---
    async searchGroup(name: string): Promise<void> {
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('getAllGroupsByOrgIdWithPagging') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.searchInput.fill(name);
        await this.page.keyboard.press('Enter');
        await responsePromise;
        await this.waitForTableLoaded();
    }

    async clearSearch(): Promise<void> {
        const currentVal = await this.searchInput.inputValue();
        if (currentVal.trim().length > 0) {
            const responsePromise = this.page.waitForResponse(
                resp => resp.url().includes('getAllGroupsByOrgIdWithPagging') && resp.status() === 200,
                { timeout: 15000 }
            ).catch(() => null);
            await this.searchInput.fill('');
            await this.page.keyboard.press('Enter');
            await responsePromise;
            await this.waitForTableLoaded();
        }
    }

    // --- Delete Action Helpers ---
    getDeleteBtn(groupName: string): Locator {
        return this.getGroupRow(groupName).locator('td:nth-child(6) a[title="Delete service group"]');
    }

    async clickDeleteGroup(groupName: string): Promise<void> {
        const deleteBtn = this.getDeleteBtn(groupName);
        await deleteBtn.click();
        await this.deleteModal.waitFor({ state: 'visible', timeout: 5000 });
    }

    async confirmDelete(): Promise<void> {
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('getAllGroupsByOrgIdWithPagging') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.deleteYesBtn.click();
        await this.deleteModal.waitFor({ state: 'hidden', timeout: 8000 });
        await responsePromise;
        await this.waitForTableLoaded();
    }

    async cancelDelete(): Promise<void> {
        await this.deleteCancelBtn.click();
        await this.deleteModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    // --- Load More Helpers ---
    async clickLoadMore(): Promise<void> {
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('getAllGroupsByOrgIdWithPagging') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.loadMoreBtn.click();
        await responsePromise;
        await this.waitForTableLoaded();
    }

    // --- Sorting Helpers ---
    async sortByGroupName(): Promise<void> {
        await this.waitForTableLoaded();
        const initialClass = await this.groupNameSortIcon.getAttribute('class') || '';

        // Trigger click directly on the sort element (immune to scroll or sticky header interception)
        await this.groupNameSortLink.evaluate(el => (el as HTMLElement).click());

        // Wait for sorting icon class to change
        await this.page.waitForFunction(
            ({ sel, initCls }) => {
                const el = document.querySelector(sel);
                if (!el) return false;
                const cls = el.getAttribute('class') || '';
                return cls !== initCls;
            },
            { sel: 'table thead th a.sorting-icons svg', initCls: initialClass },
            { timeout: 5000 }
        );

        await this.waitForTableLoaded();
    }

    async getVisibleGroupNames(): Promise<string[]> {
        await this.waitForTableLoaded();
        const texts = await this.tableRows.locator('td:first-child').allInnerTexts();
        return texts.map(t => t.trim()).filter(t => t.length > 0 && t !== '‌');
    }

    async getSortTitle(): Promise<string> {
        return (await this.groupNameSortIcon.locator('title').textContent()) || '';
    }

    isSortedAscending(names: string[]): boolean {
        const cleaned = names.map(n => n.trim().toLowerCase());
        const sorted = [...cleaned].sort((a, b) => a.localeCompare(b));
        return JSON.stringify(cleaned) === JSON.stringify(sorted);
    }

    isSortedDescending(names: string[]): boolean {
        const cleaned = names.map(n => n.trim().toLowerCase());
        const sorted = [...cleaned].sort((a, b) => b.localeCompare(a));
        return JSON.stringify(cleaned) === JSON.stringify(sorted);
    }

    // --- Associated Users Helpers ---
    getAddUsersBtn(groupName: string): Locator {
        return this.getGroupRow(groupName).locator('td:nth-child(3) button[title="Add users"]');
    }

    getEditUsersBtn(groupName: string): Locator {
        return this.getGroupRow(groupName).locator('td:nth-child(3) a[title="Edit users"]');
    }

    async clickAddOrEditUsers(groupName: string): Promise<void> {
        const row = this.getGroupRow(groupName);
        const addBtn = row.locator('td:nth-child(3) button[title="Add users"]');
        const editBtn = row.locator('td:nth-child(3) a[title="Edit users"]');
        if (await addBtn.isVisible()) {
            await addBtn.click();
        } else {
            await editBtn.click();
        }
    }

    async getUsersCount(groupName: string): Promise<number> {
        const text = await this.getGroupRow(groupName).locator('td:nth-child(3)').innerText();
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    // --- Associated Resources Helpers ---
    getAddResourcesBtn(groupName: string): Locator {
        return this.getGroupRow(groupName).locator('td:nth-child(4) button[title="Add resources"]');
    }

    getEditResourcesBtn(groupName: string): Locator {
        return this.getGroupRow(groupName).locator('td:nth-child(4) a[title="Edit resources"]');
    }

    async clickAddResources(groupName: string): Promise<void> {
        await this.getAddResourcesBtn(groupName).click();
    }

    async clickEditResources(groupName: string): Promise<void> {
        await this.getEditResourcesBtn(groupName).click();
    }

    async getResourcesCount(groupName: string): Promise<number> {
        const text = await this.getGroupRow(groupName).locator('td:nth-child(4)').innerText();
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    async hasAddResourcesButton(groupName: string): Promise<boolean> {
        return await this.getAddResourcesBtn(groupName).isVisible();
    }

    async hasEditResourcesButton(groupName: string): Promise<boolean> {
        return await this.getEditResourcesBtn(groupName).isVisible();
    }

    // --- Expired Alert Helpers ---
    async clickExpiredContinue(): Promise<void> {
        await this.expiredContinueBtn.click();
        await this.expiredAlert.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async clickExpiredCancel(): Promise<void> {
        if (await this.expiredCancelBtn.isVisible()) {
            await this.expiredCancelBtn.click();
            await this.expiredAlert.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
    }

    // --- Utility Cleaners for Test Execution ---
    async dismissAnyOpenModals(): Promise<void> {
        if (await this.modal.isVisible()) {
            await this.closeModalViaCancel().catch(() => {});
        }
        if (await this.deleteModal.isVisible()) {
            await this.cancelDelete().catch(() => {});
        }
        if (await this.expiredCancelBtn.isVisible()) {
            await this.clickExpiredCancel().catch(() => {});
        }
        const selectUsersClose = this.page.locator('.modal.show button.custom-modal-close, .modal.show .modal-footer button:has-text("Cancel")');
        if (await selectUsersClose.count() > 0 && await selectUsersClose.first().isVisible()) {
            await selectUsersClose.first().click().catch(() => {});
        }
    }

    async deleteExcessTestGroupsUntilCount(targetCount: number): Promise<void> {
        let currentCount = await this.getShowingCount();
        while (currentCount > targetCount) {
            const autoRow = this.tableRows.filter({ hasText: /AutoSG_/i }).filter({
                has: this.page.locator('td:nth-child(3) button[title="Add users"]')
            }).first();
            if (await autoRow.count() === 0) break;
            const nameEl = autoRow.locator('td:first-child');
            const groupName = (await nameEl.innerText()).trim();
            await this.clickDeleteGroup(groupName);
            await this.confirmDelete();
            currentCount = await this.getShowingCount();
        }
    }

    async ensureAtLeastNGroups(minCount: number, futureDateStr: string): Promise<void> {
        let count = await this.getShowingCount();
        while (count < minCount) {
            const uniqueName = `AutoSG_Seed_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            await this.clickCreateGroup();
            await this.fillGroupName(uniqueName);
            await this.setExpiryDate(futureDateStr);
            await this.saveGroupAndReload();
            count = await this.getShowingCount();
        }
    }

    async ensureGroupHasAssociatedUsers(groupName: string, futureDateStr: string, modal: any, allUsersTabName: string): Promise<string[]> {
        await this.createGroupIfNotPresent(groupName, futureDateStr);
        await this.ensureGroupVisibleInTable(groupName);
        const count = await this.getUsersCount(groupName);
        if (count === 0) {
            await this.clickAddOrEditUsers(groupName);
            await modal.modal.waitFor({ state: 'visible', timeout: 5000 });
            await modal.clickTab(allUsersTabName);
            const u1 = (await modal.tableRows.nth(0).locator('.user-list-item-email').innerText()).trim();
            const u2 = (await modal.tableRows.nth(1).locator('.user-list-item-email').innerText()).trim();
            await modal.checkUser(u1);
            await modal.checkUser(u2);
            await modal.clickUpdate();
            await modal.closeViaCross();
            return [u1, u2];
        }
        return [];
    }
}

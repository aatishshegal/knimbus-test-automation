import { Page, Locator, expect } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class ContentGroupsPage extends AdminBasePage {
    // --- Page Elements ---
    readonly pageHeader: Locator;
    readonly breadcrumb: Locator;
    readonly subtitle: Locator;
    readonly createGroupBtn: Locator;
    readonly searchInput: Locator;
    readonly searchSubmitBtn: Locator;
    readonly searchClearBtn: Locator;
    readonly table: Locator;
    readonly tableHeaders: Locator;
    readonly tableRows: Locator;
    readonly tableNoResultsCell: Locator;
    readonly loadMoreBtn: Locator;
    readonly groupNameHeader: Locator;
    readonly groupNameSortLink: Locator;
    readonly groupNameSortIcon: Locator;

    // --- Create / Edit Group Modal Elements ---
    readonly modal: Locator;
    readonly modalHeaderTitle: Locator;
    readonly modalCloseCrossBtn: Locator;
    readonly groupNameInput: Locator;
    readonly groupDescriptionInput: Locator;
    readonly modalSaveBtn: Locator;
    readonly modalCancelBtn: Locator;
    readonly groupNameError: Locator;
    readonly modalDuplicateAlert: Locator;
    readonly duplicateAlertModal: Locator;
    readonly duplicateAlertTitle: Locator;
    readonly duplicateAlertMessage: Locator;
    readonly duplicateAlertOkBtn: Locator;

    // --- Delete Confirmation Modal ---
    readonly deleteModal: Locator;
    readonly deleteAlertTitle: Locator;
    readonly deleteAlertMessage: Locator;
    readonly deleteYesBtn: Locator;
    readonly deleteCancelBtn: Locator;

    // --- Select Sections Modal ---
    readonly sectionModal: Locator;
    readonly sectionModalTitle: Locator;
    readonly sectionModalGroupName: Locator;
    readonly sectionModalSelectedCount: Locator;
    readonly sectionCheckboxes: Locator;
    readonly sectionModalUpdateBtn: Locator;
    readonly sectionModalCancelBtn: Locator;
    readonly sectionModalCloseCrossBtn: Locator;

    // --- Select Users Modal ---
    readonly userModal: Locator;
    readonly userModalTitle: Locator;
    readonly userModalGroupName: Locator;
    readonly userModalSelectedCount: Locator;
    readonly userModalLoadMoreBtn: Locator;
    readonly userModalUpdateBtn: Locator;
    readonly userModalCancelBtn: Locator;
    readonly userModalCloseCrossBtn: Locator;

    constructor(page: Page) {
        super(page);

        // Landing Elements
        this.pageHeader = page.locator('.menu-label-name, .db-breadcrumb, h1').filter({ hasText: /Content Groups/i }).first();
        this.breadcrumb = page.locator('.menu-label-breadcrumb').first();
        this.subtitle = page.locator('.mb-4').filter({ hasText: /Content groups let you easily manage/i }).first();
        this.createGroupBtn = page.getByRole('button', { name: 'Create group' });
        this.searchInput = page.locator('input#table-search');
        this.searchSubmitBtn = page.locator('button.table-search-btn[title="Search"]');
        this.searchClearBtn = page.locator('a.table-search-clr-btn[title="Clear"], a[title="Clear"]');
        this.table = page.locator('table.custom-table').first();
        this.tableHeaders = this.table.locator('thead th');
        this.tableRows = this.table.locator('tbody tr');
        this.tableNoResultsCell = this.table.locator('td:has-text("No results found")');
        this.loadMoreBtn = page.getByRole('button', { name: /load more/i });
        this.groupNameHeader = this.tableHeaders.filter({ hasText: /Group Name/i }).first();
        this.groupNameSortLink = this.groupNameHeader.locator('a.sorting-icons');
        this.groupNameSortIcon = this.groupNameSortLink.locator('svg');

        // Create / Edit Modal
        this.modal = page.locator('.modal.show').filter({ hasText: /Create group|Edit group/i });
        this.modalHeaderTitle = this.modal.locator('.custom-modal-header .title');
        this.modalCloseCrossBtn = this.modal.locator('button.custom-modal-close');
        this.groupNameInput = this.modal.locator('input[name="groupName"]');
        this.groupDescriptionInput = this.modal.locator('textarea[name="description"]');
        this.modalSaveBtn = this.modal.locator('button[type="submit"]');
        this.modalCancelBtn = this.modal.locator('.custom-modal-footer button.btn-outline-danger');
        this.groupNameError = this.modal.locator('.invalid-feedback, .error-msg, .text-danger');
        this.modalDuplicateAlert = page.locator('.alert-danger, .swal2-html-container');
        this.duplicateAlertModal = page.locator('.modal.show').filter({ hasText: /already exists/i });
        this.duplicateAlertTitle = this.duplicateAlertModal.locator('.custom-modal-header .title, .title');
        this.duplicateAlertMessage = this.duplicateAlertModal.locator('.modal-body');
        this.duplicateAlertOkBtn = this.duplicateAlertModal.locator('button:has-text("OK")');

        // Delete Modal
        this.deleteModal = page.locator('.modal.show').filter({ hasText: /delete the group/i });
        this.deleteAlertTitle = this.deleteModal.locator('.custom-modal-header .title, .swal2-title');
        this.deleteAlertMessage = this.deleteModal.locator('.modal-body, .swal2-html-container');
        this.deleteYesBtn = this.deleteModal.locator('button.btn-danger:has-text("Yes, Delete"), .swal2-confirm');
        this.deleteCancelBtn = this.deleteModal.locator('button.btn-outline-danger:has-text("Cancel"), .swal2-cancel');

        // Select Sections Modal
        this.sectionModal = page.locator('.modal.show').filter({ hasText: /Select sections/i });
        this.sectionModalTitle = this.sectionModal.locator('.custom-modal-header .title');
        this.sectionModalGroupName = this.sectionModal.locator('.group-association-info').filter({ hasText: /Group Name:/i });
        this.sectionModalSelectedCount = this.sectionModal.locator('.grp-selection-info');
        this.sectionCheckboxes = this.sectionModal.locator('input[type="checkbox"]');
        this.sectionModalUpdateBtn = this.sectionModal.locator('button:has-text("Update")');
        this.sectionModalCancelBtn = this.sectionModal.locator('button:has-text("Cancel")');
        this.sectionModalCloseCrossBtn = this.sectionModal.locator('button.custom-modal-close');

        // Select Users Modal
        this.userModal = page.locator('.modal.show').filter({ hasText: /Select users/i });
        this.userModalTitle = this.userModal.locator('.custom-modal-header .title');
        this.userModalGroupName = this.userModal.locator('.group-association-info').filter({ hasText: /Group Name:/i });
        this.userModalSelectedCount = this.userModal.locator('.grp-selection-info');
        this.userModalLoadMoreBtn = this.userModal.getByRole('button', { name: /load more/i });
        this.userModalUpdateBtn = this.userModal.locator('button:has-text("Update")');
        this.userModalCancelBtn = this.userModal.locator('button:has-text("Cancel")');
        this.userModalCloseCrossBtn = this.userModal.locator('button.custom-modal-close');
    }

    async navigate(): Promise<void> {
        const url = (process.env.ADMIN_TEST_URL || 'https://qa.knimbus.com') + '/librarian/v2/elibrarySetup/userManagement/contentGroups';
        await this.page.goto(url, { waitUntil: 'networkidle' });
        await this.waitForTableLoaded();
    }

    async waitForTableLoaded(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.table.waitFor({ state: 'visible', timeout: 15000 });
    }

    // --- Search Helpers ---
    async searchGroup(query: string): Promise<void> {
        await this.clearSearch().catch(() => {});
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('listUserGroup') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.searchInput.fill(query);
        const searchBtn = this.page.locator('button:has(svg[data-icon="magnifying-glass"]), button.btn-primary:has(i.fa-search)').first();
        if (await searchBtn.isEnabled().catch(() => false)) {
            await searchBtn.click();
        } else {
            await this.searchInput.press('Enter');
        }
        await responsePromise;
        await this.waitForTableLoaded();
    }

    async clearSearch(): Promise<void> {
        if (await this.searchClearBtn.isVisible().catch(() => false)) {
            const responsePromise = this.page.waitForResponse(
                resp => resp.url().includes('listUserGroup') && resp.status() === 200,
                { timeout: 4000 }
            ).catch(() => null);
            await this.searchClearBtn.click();
            await responsePromise;
            await this.waitForTableLoaded();
        } else {
            await this.searchInput.fill('');
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.waitForTableLoaded();
        }
    }

    async hasNoResults(): Promise<boolean> {
        return await this.tableNoResultsCell.isVisible().catch(() => false);
    }

    getGroupRow(groupName: string): Locator {
        return this.tableRows.filter({ hasText: groupName }).first();
    }

    async isGroupPresentInTable(groupName: string): Promise<boolean> {
        await this.waitForTableLoaded();
        const row = this.getGroupRow(groupName);
        if (await row.isVisible({ timeout: 1500 }).catch(() => false)) {
            return true;
        }
        await this.searchGroup(groupName);
        const searchRow = this.getGroupRow(groupName);
        const visible = await searchRow.isVisible({ timeout: 3000 }).catch(() => false);
        await this.clearSearch().catch(() => {});
        return visible;
    }

    async findAndGetGroupRow(groupName: string): Promise<Locator> {
        await this.waitForTableLoaded();
        let row = this.getGroupRow(groupName);
        if (await row.isVisible({ timeout: 1500 }).catch(() => false)) {
            return row;
        }
        if (await this.loadMoreBtn.isVisible().catch(() => false)) {
            await this.loadMoreBtn.click();
            await this.page.waitForTimeout(500);
            row = this.getGroupRow(groupName);
            if (await row.isVisible({ timeout: 1500 }).catch(() => false)) {
                return row;
            }
        }
        await this.searchGroup(groupName);
        const searchRow = this.getGroupRow(groupName);
        await searchRow.waitFor({ state: 'visible', timeout: 8000 });
        return searchRow;
    }

    async getGroupRowCount(): Promise<number> {
        return await this.tableRows.count();
    }

    async getVisibleGroupNames(): Promise<string[]> {
        const texts = await this.tableRows.locator('td:first-child').allInnerTexts();
        return texts.map(t => t.trim()).filter(t => t.length > 0);
    }

    async verifyTableHeaders(expectedHeaders: string[]): Promise<void> {
        const headerCount = await this.tableHeaders.count();
        expect(headerCount).toBe(expectedHeaders.length);
        for (let i = 0; i < expectedHeaders.length; i++) {
            await expect(this.tableHeaders.nth(i)).toContainText(expectedHeaders[i]);
        }
    }

    async clickLoadMore(): Promise<void> {
        const currentCount = await this.getGroupRowCount();
        await this.loadMoreBtn.click();
        await this.page.waitForFunction(
            ({ sel, prev }) => document.querySelectorAll(sel).length > prev,
            { sel: 'table.custom-table tbody tr', prev: currentCount },
            { timeout: 10000 }
        );
        await this.waitForTableLoaded();
    }

    // --- Create Group Helpers ---
    async clickCreateGroup(): Promise<void> {
        await this.createGroupBtn.click();
        await this.groupNameInput.waitFor({ state: 'visible', timeout: 5000 });
    }

    async fillGroupName(name: string): Promise<void> {
        await this.groupNameInput.fill(name);
    }

    async fillDescription(description: string): Promise<void> {
        await this.groupDescriptionInput.fill(description);
    }

    async clickSave(): Promise<void> {
        await this.modalSaveBtn.click();
    }

    async clickCancel(): Promise<void> {
        await this.modalCancelBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    async closeModalViaCross(): Promise<void> {
        await this.modalCloseCrossBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    async ensureGroupExists(groupName: string): Promise<void> {
        await this.waitForTableLoaded();
        const exists = await this.isGroupPresentInTable(groupName);
        if (!exists) {
            await this.createContentGroup(groupName, 'Automated test content group');
        }
    }

    async createContentGroup(name: string, description: string): Promise<void> {
        await this.clickCreateGroup();
        await this.fillGroupName(name);
        await this.fillDescription(description);
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('listUserGroup') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.clickSave();
        await responsePromise;
        await this.modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.waitForTableLoaded();
    }

    // --- Edit Group Helpers ---
    async clickEditGroup(groupName: string): Promise<void> {
        const row = await this.findAndGetGroupRow(groupName);
        const editBtn = row.locator('a[title="Edit content group"]');
        await editBtn.click();
        await this.groupNameInput.waitFor({ state: 'visible', timeout: 5000 });
    }

    async getEditGroupNameValue(): Promise<string> {
        return (await this.groupNameInput.inputValue()).trim();
    }

    async getEditDescriptionValue(): Promise<string> {
        return (await this.groupDescriptionInput.inputValue()).trim();
    }

    async updateContentGroup(oldName: string, newName: string, description: string): Promise<void> {
        await this.clickEditGroup(oldName);
        await this.fillGroupName(newName);
        await this.fillDescription(description);
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('listUserGroup') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.clickSave();
        await responsePromise;
        await this.modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.waitForTableLoaded();
    }

    // --- Delete Group Helpers ---
    async clickDeleteGroup(groupName: string): Promise<void> {
        const row = await this.findAndGetGroupRow(groupName);
        const delBtn = row.locator('a[title="Delete content group"]');
        await delBtn.click();
        await this.deleteYesBtn.waitFor({ state: 'visible', timeout: 5000 });
    }

    async confirmDelete(): Promise<void> {
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('listUserGroup') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.deleteYesBtn.click();
        await this.deleteModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        const swalOk = this.page.locator('.swal2-confirm');
        if (await swalOk.isVisible({ timeout: 2000 }).catch(() => false)) {
            await swalOk.click();
        }
        await responsePromise;
        await this.waitForTableLoaded();
    }

    async cancelDelete(): Promise<void> {
        await this.deleteCancelBtn.click();
        await this.deleteModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    // --- Associated Sections Helpers ---
    async clickAddSection(groupName: string): Promise<void> {
        const row = await this.findAndGetGroupRow(groupName);
        const btn = row.locator('td:nth-child(3)').locator('button, a');
        await btn.click();
        await this.sectionModal.waitFor({ state: 'visible', timeout: 5000 });
        await this.sectionCheckboxes.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    }

    async getAssociatedSectionsCount(groupName: string): Promise<number> {
        const row = await this.findAndGetGroupRow(groupName);
        const text = (await row.locator('td:nth-child(3)').innerText()).trim();
        if (text.includes('ADD SECTION')) return 0;
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    async getSectionCheckbox(sectionName: string): Promise<Locator> {
        return this.sectionModal.locator(`input[aria-label*="${sectionName}"]`);
    }

    async isSectionChecked(sectionName: string): Promise<boolean> {
        const cb = await this.getSectionCheckbox(sectionName);
        return await cb.isChecked();
    }

    async toggleSection(sectionName: string): Promise<void> {
        const cb = await this.getSectionCheckbox(sectionName);
        await cb.click();
    }

    async updateSections(): Promise<void> {
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('listUserGroup') && resp.status() === 200,
            { timeout: 8000 }
        ).catch(() => null);
        await this.sectionModalUpdateBtn.click();
        await responsePromise;
        await this.sectionModal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
        await this.waitForTableLoaded();
    }

    async cancelSections(): Promise<void> {
        await this.sectionModalCancelBtn.click();
        await this.sectionModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    // --- Associated Users Helpers ---
    async clickEditUsers(groupName: string): Promise<void> {
        const row = await this.findAndGetGroupRow(groupName);
        const editUsersBtn = row.locator('td:nth-child(2)').locator('button, a');
        await editUsersBtn.click();
        await this.userModal.waitFor({ state: 'visible', timeout: 5000 });
        await this.userModal.locator('.user-list-card').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    }

    async getAssociatedUsersCount(groupName: string): Promise<number> {
        const row = await this.findAndGetGroupRow(groupName);
        const text = (await row.locator('td:nth-child(2)').innerText()).trim();
        if (text.includes('ADD USER')) return 0;
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    async searchUserInModal(searchQuery: string): Promise<void> {
        const modalSearchInput = this.userModal.locator('input#table-search');
        const modalSearchBtn = this.userModal.locator('button.table-search-btn');
        await modalSearchInput.fill(searchQuery);
        await modalSearchBtn.click();
        await this.page.waitForTimeout(500);
    }

    async clearUserSearchInModal(): Promise<void> {
        const modalSearchInput = this.userModal.locator('input#table-search');
        const clearBtn = this.userModal.locator('.clear-icon, i.fa-times, .clear-btn, [title="Clear"]');
        if (await clearBtn.isVisible().catch(() => false)) {
            await clearBtn.click();
        } else {
            await modalSearchInput.fill('');
            await modalSearchInput.press('Enter');
        }
        await this.page.waitForTimeout(500);
    }

    getUserCheckbox(userEmail: string): Locator {
        const userRow = this.userModal.locator('.user-list-card').filter({ hasText: userEmail });
        return userRow.locator('input[type="checkbox"]');
    }

    async isUserChecked(userEmail: string): Promise<boolean> {
        return await this.getUserCheckbox(userEmail).isChecked();
    }

    async checkUser(userEmail: string, userName?: string): Promise<void> {
        if (userName) {
            await this.searchUserInModal(userName);
        }
        const cb = this.getUserCheckbox(userEmail);
        await cb.waitFor({ state: 'visible', timeout: 5000 });
        if (!(await cb.isChecked())) {
            await cb.click();
        }
    }

    async uncheckUser(userEmail: string, userName?: string): Promise<void> {
        if (userName) {
            await this.searchUserInModal(userName);
        }
        const cb = this.getUserCheckbox(userEmail);
        await cb.waitFor({ state: 'visible', timeout: 5000 });
        if (await cb.isChecked()) {
            await cb.click();
        }
    }

    async updateUsers(): Promise<void> {
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('listUserGroup') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.userModalUpdateBtn.click();
        await responsePromise;
        await this.userModal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
        await this.waitForTableLoaded();
    }

    async cancelUsers(): Promise<void> {
        await this.userModalCancelBtn.click();
        await this.userModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    // --- Sorting Helpers ---
    async sortByGroupName(): Promise<void> {
        await this.waitForTableLoaded();
        const initialClass = (await this.groupNameSortIcon.getAttribute('class')) || '';
        await this.groupNameSortLink.evaluate(el => (el as HTMLElement).click());
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

    async dismissDuplicateAlert(): Promise<void> {
        if (await this.duplicateAlertModal.isVisible().catch(() => false)) {
            await this.duplicateAlertOkBtn.click();
            await this.duplicateAlertModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
    }

    // --- Modal Reset Utilities ---
    async dismissAnyOpenModals(): Promise<void> {
        await this.dismissDuplicateAlert().catch(() => {});
        if (await this.modal.isVisible().catch(() => false)) {
            await this.clickCancel().catch(() => {});
        }
        if (await this.deleteModal.isVisible().catch(() => false)) {
            await this.cancelDelete().catch(() => {});
        }
        if (await this.sectionModal.isVisible().catch(() => false)) {
            await this.cancelSections().catch(() => {});
        }
        if (await this.userModal.isVisible().catch(() => false)) {
            await this.cancelUsers().catch(() => {});
        }
    }
}

import { Page, Locator, expect } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class SelectUsersModal extends AdminBasePage {
    readonly modal: Locator;
    readonly title: Locator;
    readonly closeCrossBtn: Locator;
    readonly cancelBtn: Locator;
    readonly updateBtn: Locator;
    readonly tabs: Locator;
    readonly activeTab: Locator;
    readonly groupNameContainer: Locator;
    readonly allUsersCountContainer: Locator;
    readonly searchInput: Locator;
    readonly searchBtn: Locator;
    readonly loadMoreBtn: Locator;
    readonly showingTextSpan: Locator;
    readonly showingCountSpan: Locator;
    readonly totalCountSpan: Locator;
    readonly tableRows: Locator;
    readonly selectAllBtn: Locator;
    readonly deselectAllBtn: Locator;
    readonly emptyTableText: Locator;
    readonly selectAllNote: Locator;
    readonly deselectAllNote: Locator;
    readonly undoBtn: Locator;
    readonly alertPopup: Locator;
    readonly alertTitle: Locator;
    readonly alertMessage: Locator;
    readonly alertOkBtn: Locator;
    readonly searchClearCrossBtn: Locator;

    // Via CSV elements
    readonly viaCsvDesc: Locator;
    readonly viaCsvDropzone: Locator;
    readonly viaCsvFileInput: Locator;
    readonly viaCsvSelectedFileName: Locator;
    readonly viaCsvDownloadSampleLink: Locator;
    readonly viaCsvErrorText: Locator;
    readonly viaCsvInvalidFormatError: Locator;

    constructor(page: Page) {
        super(page);
        this.modal = page.locator('.modal.show').filter({ hasText: /select users/i });
        this.title = this.modal.locator('.custom-modal-header');
        this.closeCrossBtn = this.modal.locator('button.custom-modal-close');
        this.cancelBtn = this.modal.locator('.modal-footer button:has-text("Cancel")');
        this.updateBtn = this.modal.locator('.modal-footer button:has-text("Update")');
        this.tabs = this.modal.locator('.nav-item a.nav-link');
        this.activeTab = this.modal.locator('.nav-item a.nav-link.active');
        this.groupNameContainer = this.modal.locator('.text-break').filter({ hasText: /group name/i });
        this.allUsersCountContainer = this.modal.locator('.grp-selection-info');
        this.searchInput = this.modal.locator('input#table-search');
        this.searchBtn = this.modal.locator('button.table-search-btn');
        this.searchClearCrossBtn = this.modal.locator('a.table-search-clr-btn');
        this.loadMoreBtn = this.modal.locator('button.show-more-btn-sm');
        this.showingTextSpan = this.modal.locator('span.show-more-text-sm');
        this.showingCountSpan = this.modal.locator('span.show-more-text-sm span.show-more-count-sm').first();
        this.totalCountSpan = this.modal.locator('span.show-more-text-sm span.show-more-count-sm').nth(1);
        this.tableRows = this.modal.locator('tbody.custom-table-body tr');
        this.selectAllBtn = this.modal.locator('button:has-text("Select all"), button:has-text("Select All")');
        this.deselectAllBtn = this.modal.locator('button:has-text("Deselect All")');
        this.emptyTableText = this.modal.locator('tbody.custom-table-body td:has-text("No user found")');
        this.selectAllNote = this.modal.locator('.modal-body').filter({ hasText: /Select All operation takes some time/i });
        this.deselectAllNote = this.modal.locator('.modal-body').filter({ hasText: /De-select All operation takes some time/i });
        this.undoBtn = this.modal.locator('button:has-text("Undo")');
        this.alertPopup = page.locator('.swal2-popup');
        this.alertTitle = this.alertPopup.locator('.swal2-title');
        this.alertMessage = this.alertPopup.locator('.swal2-html-container');
        this.alertOkBtn = this.alertPopup.locator('.swal2-confirm');

        // Via CSV locators
        this.viaCsvDesc = this.modal.locator('.group-association-info .ft-16');
        this.viaCsvDropzone = this.modal.locator('.custom-file-upload-input');
        this.viaCsvFileInput = this.modal.locator('input#userFile');
        this.viaCsvSelectedFileName = this.modal.locator('.format-info.fst-italic');
        this.viaCsvDownloadSampleLink = this.modal.locator('a:has-text("Download sample CSV")');
        this.viaCsvErrorText = this.modal.locator('.text-danger').filter({ hasText: /please select a file/i });
        this.viaCsvInvalidFormatError = this.modal.locator('.text-danger').filter({ hasText: /invalid file format/i });
    }

    async clickCancel(): Promise<void> {
        await this.cancelBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async closeViaCross(): Promise<void> {
        await this.closeCrossBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async verifyTabsPresent(expectedTabs: string[]): Promise<void> {
        const actualTabs = (await this.tabs.allInnerTexts()).map(t => t.trim());
        expect(actualTabs).toEqual(expectedTabs);
    }

    async getGroupName(): Promise<string> {
        const text = await this.groupNameContainer.innerText();
        return text.replace(/Group Name:\s*/i, '').trim();
    }

    async getAllUsersCount(): Promise<string> {
        await this.allUsersCountContainer.waitFor({ state: 'visible', timeout: 5000 });
        await expect(this.allUsersCountContainer).toContainText(/\d+/, { timeout: 10000 });
        const text = await this.allUsersCountContainer.innerText();
        const match = text.match(/\d+/);
        return match ? match[0] : '';
    }

    async searchUser(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.searchBtn.click();
        await this.page.waitForTimeout(2000);
    }

    async clearSearch(): Promise<void> {
        await this.searchInput.fill('');
        await this.searchBtn.click();
        await this.page.waitForTimeout(2000);
    }

    getUserRow(identifier: string): Locator {
        return this.tableRows.filter({ hasText: identifier }).first();
    }

    async verifySearchResultsMatch(keyword: string): Promise<void> {
        const count = await this.tableRows.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const rowText = await this.tableRows.nth(i).innerText();
            expect(rowText.toLowerCase()).toContain(keyword.toLowerCase());
        }
    }

    async isLoadMoreVisible(): Promise<boolean> {
        return await this.loadMoreBtn.isVisible();
    }

    async getShowingCount(): Promise<number> {
        await this.showingCountSpan.waitFor({ state: 'visible', timeout: 5000 });
        const text = await this.showingCountSpan.innerText();
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    async clickLoadMore(): Promise<void> {
        const initialCount = await this.tableRows.count();
        await this.loadMoreBtn.click();
        await expect(this.tableRows).toHaveCount(initialCount + 10, { timeout: 10000 });
    }

    async verifyAllRowsHaveCheckbox(): Promise<void> {
        const count = await this.tableRows.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(this.tableRows.nth(i).locator('input[type="checkbox"]')).toBeVisible();
        }
    }

    async isUserChecked(identifier: string): Promise<boolean> {
        const row = this.getUserRow(identifier);
        return await row.locator('input[type="checkbox"]').isChecked();
    }

    async checkUser(identifier: string): Promise<void> {
        const row = this.getUserRow(identifier);
        const cb = row.locator('input[type="checkbox"]');
        if (!(await cb.isChecked())) {
            await cb.check();
        }
    }

    async uncheckUser(identifier: string): Promise<void> {
        const row = this.getUserRow(identifier);
        const cb = row.locator('input[type="checkbox"]');
        if (await cb.isChecked()) {
            await cb.uncheck();
        }
    }

    async getUserAssignedGroupBadge(identifier: string): Promise<string> {
        const row = this.getUserRow(identifier);
        const badge = row.locator('.border-primary, .text-primary').first();
        if (await badge.isVisible()) {
            return (await badge.innerText()).trim();
        }
        return '';
    }

    async isUserAssignedToAnyGroup(identifier: string): Promise<boolean> {
        const row = this.getUserRow(identifier);
        return await row.locator('.border-primary, .text-primary').first().isVisible();
    }

    async clickUpdate(): Promise<void> {
        await this.updateBtn.click();
        await this.page.waitForTimeout(2000);
    }

    async clickTab(tabName: string): Promise<void> {
        await this.modal.getByRole('tab', { name: tabName, exact: true }).click();
        await this.page.waitForTimeout(1500);
    }

    async getFirstUserEmail(): Promise<string> {
        const firstRow = this.tableRows.first();
        return (await firstRow.locator('.user-list-item-email').innerText()).trim();
    }

    async ensureUserAssigned(email: string): Promise<void> {
        await this.searchUser(email);
        const row = this.getUserRow(email);
        const cb = row.locator('input[type="checkbox"]');
        if (!(await cb.isChecked())) {
            await cb.check();
            await this.clickUpdate();
        }
    }

    async getSelectedUsersCount(): Promise<number> {
        await this.allUsersCountContainer.waitFor({ state: 'visible', timeout: 5000 });
        const text = await this.allUsersCountContainer.innerText();
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    async getUnselectedUsersCount(): Promise<number> {
        await this.allUsersCountContainer.waitFor({ state: 'visible', timeout: 5000 });
        await expect(this.allUsersCountContainer).toContainText(/\d+/, { timeout: 10000 });
        const text = await this.allUsersCountContainer.innerText();
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    async clickSelectAll(): Promise<void> {
        await this.selectAllBtn.click();
        await this.page.waitForTimeout(1000);
    }

    async isUserPresentInList(identifier: string): Promise<boolean> {
        const row = this.getUserRow(identifier);
        return await row.isVisible();
    }

    async clickDeselectAll(): Promise<void> {
        await this.deselectAllBtn.click();
        await this.page.waitForTimeout(1000);
    }

    async clickUndo(): Promise<void> {
        await this.undoBtn.click();
        await this.page.waitForTimeout(1000);
    }

    async dismissAlert(): Promise<void> {
        await this.alertOkBtn.click();
        await this.alertPopup.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    async areAllListedUsersChecked(): Promise<boolean> {
        const count = await this.tableRows.count();
        if (count === 0) return false;
        for (let i = 0; i < count; i++) {
            if (!(await this.tableRows.nth(i).locator('input[type="checkbox"]').isChecked())) {
                return false;
            }
        }
        return true;
    }

    async areAllListedUsersUnchecked(): Promise<boolean> {
        const count = await this.tableRows.count();
        if (count === 0) return true;
        for (let i = 0; i < count; i++) {
            if (await this.tableRows.nth(i).locator('input[type="checkbox"]').isChecked()) {
                return false;
            }
        }
        return true;
    }

    async clickSearchClearCross(): Promise<void> {
        await this.searchClearCrossBtn.click();
        await this.page.waitForTimeout(1500);
    }

    async getSearchInputValue(): Promise<string> {
        return await this.searchInput.inputValue();
    }

    async areAllListedUserBadgesMatching(expectedGroup: string): Promise<boolean> {
        const count = await this.tableRows.count();
        if (count === 0) return false;
        for (let i = 0; i < count; i++) {
            const badge = this.tableRows.nth(i).locator('.border-primary, .text-primary').first();
            if (!(await badge.isVisible())) {
                return false;
            }
            const badgeText = (await badge.innerText()).trim();
            if (badgeText !== expectedGroup) {
                return false;
            }
        }
        return true;
    }

    // --- Via CSV Action Helpers ---
    async selectCsvFile(filePath: string): Promise<void> {
        await this.viaCsvFileInput.setInputFiles(filePath);
    }

    async getUploadedFileName(): Promise<string> {
        return (await this.viaCsvSelectedFileName.innerText()).trim();
    }

    async clickDownloadSampleCsv(): Promise<{ filename: string, content: string }> {
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.viaCsvDownloadSampleLink.click()
        ]);
        const path = await download.path();
        const fs = require('fs');
        const content = fs.readFileSync(path, 'utf8');
        return {
            filename: download.suggestedFilename(),
            content
        };
    }

    async clickUpdateViaCsvAndConfirm(): Promise<void> {
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('updateBulkUserInGroup') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);
        await this.updateBtn.click();
        await responsePromise;
        await this.alertOkBtn.waitFor({ state: 'visible', timeout: 5000 });
        await this.alertOkBtn.click();
        await this.alertPopup.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
}




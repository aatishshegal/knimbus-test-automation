import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class SelectResourcesModal extends AdminBasePage {
    readonly modal: Locator;
    readonly title: Locator;
    readonly groupNameLabel: Locator;
    readonly selectedInfo: Locator;
    readonly checkboxes: Locator;
    readonly resourceNames: Locator;
    readonly updateBtn: Locator;
    readonly cancelBtn: Locator;
    readonly closeCrossBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.modal = page.locator('.modal.show').filter({ hasText: /select resources/i });
        this.title = this.modal.locator('.custom-modal-header .title');
        this.groupNameLabel = this.modal.locator('.group-association-info');
        this.selectedInfo = this.modal.locator('.grp-selection-info');
        this.checkboxes = this.modal.locator('table.custom-table tbody tr input[type="checkbox"]');
        this.resourceNames = this.modal.locator('table.custom-table tbody tr span.user-list-item-name');
        this.updateBtn = this.modal.locator('.modal-footer button.btn-primary');
        this.cancelBtn = this.modal.locator('.modal-footer button.btn-outline-danger');
        this.closeCrossBtn = this.modal.locator('button.custom-modal-close');
    }

    async expectSelectedCount(expected: number): Promise<void> {
        await this.selectedInfo.filter({ hasText: String(expected) }).waitFor({ state: 'visible', timeout: 10000 });
    }

    async getSelectedCount(): Promise<number> {
        await this.selectedInfo.waitFor({ state: 'visible', timeout: 5000 });
        const text = await this.selectedInfo.innerText();
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    async selectResourceByIndex(index: number): Promise<void> {
        const checkbox = this.checkboxes.nth(index);
        if (!(await checkbox.isChecked())) {
            await checkbox.check();
        }
    }

    async unselectResourceByIndex(index: number): Promise<void> {
        const checkbox = this.checkboxes.nth(index);
        if (await checkbox.isChecked()) {
            await checkbox.uncheck();
        }
    }

    async isResourceChecked(index: number): Promise<boolean> {
        return await this.checkboxes.nth(index).isChecked();
    }

    async clickUpdate(): Promise<void> {
        await this.updateBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 8000 });
    }

    async clickCancel(): Promise<void> {
        await this.cancelBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async closeViaCross(): Promise<void> {
        await this.closeCrossBtn.click();
        await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    }
}

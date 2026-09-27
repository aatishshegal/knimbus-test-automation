import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class SelectUsersModal extends AdminBasePage {
    readonly modal: Locator;
    readonly title: Locator;
    readonly closeCrossBtn: Locator;
    readonly cancelBtn: Locator;
    readonly updateBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.modal = page.locator('.modal.show').filter({ hasText: /select users/i });
        this.title = this.modal.locator('.custom-modal-header');
        this.closeCrossBtn = this.modal.locator('button.custom-modal-close');
        this.cancelBtn = this.modal.locator('.modal-footer button:has-text("Cancel")');
        this.updateBtn = this.modal.locator('.modal-footer button:has-text("Update")');
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

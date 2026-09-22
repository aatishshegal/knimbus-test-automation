import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../pages/BasePage';

export class AdminHeader extends BasePage {
    // Bulk Email Limit Locators
    readonly bulkEmailContainer: Locator;
    readonly bulkEmailTitle: Locator;
    readonly bulkEmailUsageText: Locator;
    readonly bulkEmailDropdownPopover: Locator;
    
    // Locators inside the opened popover
    readonly popoverDailyUsageText: Locator;
    readonly popoverProgressBar: Locator;
    readonly popoverUsageCountText: Locator;
    readonly popoverInfoIcon: Locator;
    readonly popoverMoreInfoLink: Locator;

    // Locators for the Info Modal (opened via More Info)
    readonly bulkEmailInfoModal: Locator;
    readonly bulkEmailInfoModalTitle: Locator;
    readonly bulkEmailInfoModalDescription: Locator;
    readonly bulkEmailInfoModalCloseBtn: Locator;

    constructor(page: Page) {
        super(page);
        
        // Header Widget Locators
        this.bulkEmailContainer = page.getByRole('button', { name: 'Email sending limit' });
        this.bulkEmailTitle = page.getByText('Bulk Email Limit');
        this.bulkEmailUsageText = page.locator('.header-overlay-desc');
        
        // Popover Locators
        this.bulkEmailDropdownPopover = page.locator('.info-popover-container-wraper');
        this.popoverDailyUsageText = this.bulkEmailDropdownPopover.getByText('Daily Bulk Email Usage');
        this.popoverProgressBar = this.bulkEmailDropdownPopover.locator('.email-usage-progress-bar');
        this.popoverUsageCountText = this.bulkEmailDropdownPopover.locator('.email-usage-count');
        this.popoverInfoIcon = this.bulkEmailDropdownPopover.locator('.email-usage-info-icon');
        this.popoverMoreInfoLink = this.bulkEmailDropdownPopover.getByRole('link', { name: /More info/i });
        
        // Modal Locators
        this.bulkEmailInfoModal = page.locator('.custom-modal');
        this.bulkEmailInfoModalTitle = this.bulkEmailInfoModal.locator('h4').filter({ hasText: 'Daily Bulk Email Limit Info' });
        this.bulkEmailInfoModalDescription = this.bulkEmailInfoModal.locator('.email-limit-description');
        this.bulkEmailInfoModalCloseBtn = this.bulkEmailInfoModal.getByRole('button', { name: 'Close' });
    }

    async verifyBulkEmailLimitVisible() {
        await this.bulkEmailContainer.waitFor({ state: 'visible', timeout: 10000 });
        await this.bulkEmailTitle.waitFor({ state: 'visible' });
        await this.bulkEmailUsageText.waitFor({ state: 'visible' });
    }

    async clickBulkEmailLimitDropdown() {
        await this.bulkEmailContainer.click();
    }

    async clickPopoverInfoIcon() {
        await this.popoverInfoIcon.click();
    }

    async clickPopoverMoreInfoLink() {
        await this.popoverMoreInfoLink.click();
    }

    async closeBulkEmailInfoModal() {
        await this.bulkEmailInfoModalCloseBtn.click();
    }
}

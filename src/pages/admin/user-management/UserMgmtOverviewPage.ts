import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class UserMgmtOverviewPage extends AdminBasePage {
    // 1. Manage Users Block
    readonly totalRegisteredUsersCard: Locator;
    readonly totalRegisteredUsersCount: Locator;
    
    // 2. Pending OCA Requests Block
    readonly pendingOcaRequestsCard: Locator;
    readonly pendingOcaRequestsCount: Locator;
    
    // 3. Quick Find Block
    readonly quickFindInput: Locator;
    readonly quickFindSearchBtn: Locator;
    readonly quickFindClearBtn: Locator;
    
    // 4. Other Cards
    readonly serviceGroupsCard: Locator;
    readonly serviceGroupsAssignedUsers: Locator;
    readonly serviceGroupsMaxUsers: Locator;
    
    readonly contentGroupsCard: Locator;
    readonly contentGroupsCount: Locator;
    
    readonly addSingleUserCard: Locator;
    readonly addMultipleUsersCard: Locator;
    readonly profileSettingsCard: Locator;
    
    readonly exportUsersCard: Locator;
    readonly securitySettingsCard: Locator;

    constructor(page: Page) {
        super(page);

        // Locators based on HTML provided by user
        this.totalRegisteredUsersCard = page.locator('a.card-vertical[href*="/manageUsers"]');
        this.totalRegisteredUsersCount = this.totalRegisteredUsersCard.locator('.card-vertical-count');

        this.pendingOcaRequestsCard = page.locator('a.card-vertical[href*="/ocaPendingRequests"]');
        this.pendingOcaRequestsCount = this.pendingOcaRequestsCard.locator('.card-vertical-count');

        // Quick find form
        const quickFindForm = page.locator('form').filter({ has: page.locator('input#quick-find') });
        this.quickFindInput = quickFindForm.locator('input#quick-find');
        this.quickFindSearchBtn = quickFindForm.locator('button[type="submit"]');
        this.quickFindClearBtn = quickFindForm.locator('button[title="Clear"]');

        this.serviceGroupsCard = page.locator('a.card-horizontal[href*="/serviceGroups"]');
        this.serviceGroupsAssignedUsers = this.serviceGroupsCard.locator('span.sub-info div').filter({ hasText: 'Total assigned users' }).locator('span');
        this.serviceGroupsMaxUsers = this.serviceGroupsCard.locator('span.sub-info div').filter({ hasText: 'Maximum allowed users' }).locator('span');

        this.contentGroupsCard = page.locator('a.card-horizontal[href*="/contentGroups"]');
        this.contentGroupsCount = this.contentGroupsCard.locator('.card-horizontal-count');

        this.addSingleUserCard = page.locator('a.card-horizontal[href*="/addSingleUser"]');
        this.addMultipleUsersCard = page.locator('a.card-horizontal[href*="/addMultipleUsers"]');
        this.profileSettingsCard = page.locator('a.card-horizontal[href*="/userProfileSettings"]');
        
        // Note: For export users, the URL ends with /overview, and it opens a modal.
        this.exportUsersCard = page.locator('a.card-horizontal').filter({ hasText: 'Export Users' });
        this.securitySettingsCard = page.locator('a.card-horizontal[href*="/securitySettings"]');
    }

    async getRegisteredUsersCount(): Promise<string> {
        await this.totalRegisteredUsersCount.waitFor({ state: 'visible' });
        return (await this.totalRegisteredUsersCount.textContent())?.trim() || '';
    }

    async getPendingOcaRequestsCount(): Promise<string> {
        await this.pendingOcaRequestsCount.waitFor({ state: 'visible' });
        return (await this.pendingOcaRequestsCount.textContent())?.trim() || '';
    }

    async performQuickFindSearch(keyword: string) {
        await this.quickFindInput.waitFor({ state: 'visible' });
        await this.quickFindInput.fill(keyword);
        await this.quickFindSearchBtn.click();
    }
}

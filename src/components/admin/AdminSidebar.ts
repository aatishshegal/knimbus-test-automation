import { Page } from '@playwright/test';

export class AdminSidebar {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Helper to navigate to a sub-menu item while safely handling the animated SPA accordion toggle.
     * @param groupTitle The title of the parent expandable menu (e.g. 'User Management')
     * @param itemName The text of the target link to click (e.g. 'Security Settings')
     */
    private async navigateToSubMenu(groupTitle: string, itemName: string) {
        // Step 1: Find the parent container (list item or div) that contains the group title.
        // This prevents strict mode violations when multiple submenus share the same name (e.g. "Overview")
        const groupContainer = this.page.locator('li, .ps-menuitem-root, .menu-group').filter({ hasText: groupTitle }).first();
        
        // Step 2: Look for the specific link strictly INSIDE that group container
        const targetLink = groupContainer.getByRole('link', { name: itemName, exact: true });
        
        let isVisible = false;
        try {
            isVisible = await targetLink.isVisible({ timeout: 1000 });
        } catch(e) {
            isVisible = false;
        }

        if (!isVisible) {
            // Click the title to expand the accordion
            await this.page.getByTitle(groupTitle, { exact: true }).click();
            await targetLink.waitFor({ state: 'visible', timeout: 5000 });
        }
        
        try {
            await targetLink.click({ timeout: 2000 });
        } catch (e) {
            await targetLink.evaluate((node) => (node as HTMLElement).click());
        }
    }

    // ==========================================
    // UTILITIES > User Management
    // ==========================================

    async navigateToOverview() {
        await this.navigateToSubMenu('User Management', 'Overview');
    }

    async navigateToAddSingleUser() {
        await this.navigateToSubMenu('User Management', 'Add Single User');
    }

    async navigateToSecuritySettings() {
        await this.navigateToSubMenu('User Management', 'Security Settings');
    }

    async navigateToManageUsers() {
        await this.navigateToSubMenu('User Management', 'Manage Users');
    }

    // ==========================================
    // SETUP > Content
    // ==========================================
    
    async navigateToInstituteSubscriptions() {
        await this.navigateToSubMenu('Content', 'Institute Subscriptions');
    }

    // (We will add more methods here as needed for specific test cases)
}

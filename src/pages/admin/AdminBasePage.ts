import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';

export class AdminBasePage extends BasePage {
    public readonly sidebar: AdminSidebar;
    public readonly header: AdminHeader;

    constructor(page: Page) {
        super(page);
        this.sidebar = new AdminSidebar(page);
        this.header = new AdminHeader(page);
    }
}

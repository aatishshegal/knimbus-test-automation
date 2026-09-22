import { Page } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class AdminDashboardLoginPage extends AdminBasePage {
    constructor(page: Page) {
        super(page);
    }

    async navigate() {
        const url = process.env.ADMIN_TEST_URL;
        if (!url) throw new Error("ADMIN_TEST_URL is not defined in .env");
        await this.page.goto(url);
    }

    async login(email: string, pass: string) {
        // Resilient Playwright DOM locators based on the live qa.knimbus.com application
        // Using name attributes to avoid strict mode violations (there are hidden 'Forgot Password' inputs)
        await this.page.locator('input[name="username"]').fill(email);
        await this.page.locator('input[name="password"]').fill(pass);
        await this.page.getByRole('button', { name: 'Next' }).click();
    }
}

import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export class AddSingleUserPage extends AdminBasePage {
    readonly userNameInput: Locator;
    readonly emailInput: Locator;
    readonly userTypeSelect: Locator;
    readonly genderSelect: Locator;
    readonly serviceGroupSelect: Locator;
    readonly saveBtn: Locator;

    constructor(page: Page) {
        super(page);

        // Required fields based on DOM
        this.userNameInput = page.locator('input#userName');
        this.emailInput = page.locator('input#email');
        
        // Select dropdowns
        this.userTypeSelect = page.locator('select#userType');
        this.genderSelect = page.locator('select#gender');
        this.serviceGroupSelect = page.locator('select#serviceGroup');
        
        this.saveBtn = page.getByRole('button', { name: 'Save' });
    }

    async fillRegistrationForm(userData: {
        userName: string;
        email: string;
        userType: string;
        gender: string;
        serviceGroup: string;
    }) {
        await this.userNameInput.waitFor({ state: 'visible' });
        await this.userNameInput.fill(userData.userName);
        await this.emailInput.fill(userData.email);
        
        await this.userTypeSelect.selectOption({ label: userData.userType });
        await this.genderSelect.selectOption({ label: userData.gender });
        if (userData.serviceGroup) {
            await this.serviceGroupSelect.focus();
            await this.serviceGroupSelect.selectOption({ label: userData.serviceGroup });
            await this.serviceGroupSelect.evaluate(node => node.dispatchEvent(new Event('change', { bubbles: true })));
            await this.page.waitForTimeout(500); // Give React state time to update
        }
    }

    async submitForm() {
        await this.saveBtn.click();
    }
}

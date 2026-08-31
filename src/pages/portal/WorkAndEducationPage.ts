import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class WorkAndEducationPage extends BasePage {
    readonly tabHeader: Locator;
    
    // Using Index Signature for dynamic access
    [key: string]: Locator | any;

    constructor(page: Page) {
        super(page);
        this.tabHeader = page.getByRole('tab', { name: /Work & Education/i });
        
        // Work Experience Fields
        this.jobTitle = page.locator('#jobTitle');
        this.companyName = page.locator('#companyName');
        this.workExpFromYr = page.locator('#workExpFromYr');
        this.workExpToYr = page.locator('#workExpToYr');
        this.isCurrentCompany = page.locator('#isCurrentCompany');
        
        // Education Fields
        this.institutionName = page.locator('#institutionName');
        this.eduDegree = page.locator('#eduDegree');
        this.eduFromYr = page.locator('#eduFromYr');
        this.eduToYr = page.locator('#eduToYr');
        
        // Field of Studies Fields
        this.studySub = page.locator('#studySub');
    }

    /**
     * Gets a locator dynamically based on the field ID
     * @param field The field string (e.g. "jobTitle")
     */
    getLocator(field: string): Locator {
        const locator = this[field] as Locator;
        if (!locator) {
            throw new Error(`Locator not defined for field: ${field} in WorkAndEducationPage`);
        }
        return locator;
    }

    async getSaveButton(sectionTitle: string): Promise<Locator> {
        // Find the form that contains the specific heading and click its save button
        return this.page.locator('form').filter({ has: this.page.getByRole('heading', { name: sectionTitle }) }).locator('button:has-text("Save")');
    }

    async clickAddMore(sectionTitle: string): Promise<void> {
        // The Add more link appears after the list of items for the given section
        // We can find the heading, then the nearest 'Add more' button in its container
        // Alternatively, since there might be multiple Add more links (Work, Edu), we can scope by the parent wrapper.
        // Let's use a simpler approach: finding the heading, and then its next sibling container that holds "Add more"
        const sectionContainer = this.page.locator(`div:has(> h5:has-text("${sectionTitle}"))`).locator('..');
        const addMoreBtn = sectionContainer.locator('text=Add more');
        if (await addMoreBtn.isVisible()) {
            await addMoreBtn.click();
        } else {
            // It's possible there are no existing entries and the form is already open, 
            // or we need to find "Add more" differently
            const alternateAddMore = this.page.getByText('Add more');
            if (await alternateAddMore.count() > 0) {
                // If there are multiple, try to find the right one based on index
                if (sectionTitle === 'Work Experience') {
                    await alternateAddMore.nth(0).click();
                } else if (sectionTitle === 'Education') {
                    await alternateAddMore.nth(1).click();
                } else {
                    await alternateAddMore.last().click();
                }
            }
        }
    }

    async getCancelButton(sectionTitle: string): Promise<Locator> {
        return this.page.locator('form').filter({ has: this.page.getByRole('heading', { name: sectionTitle }) }).getByRole('button', { name: /Cancel/i });
    }

    async getDeleteButton(sectionTitle: string): Promise<Locator> {
        // Some forms might have a trash icon or "Delete" button
        const form = this.page.locator('form').filter({ has: this.page.getByRole('heading', { name: sectionTitle }) });
        const delBtn = form.getByRole('button', { name: /Delete/i });
        if (await delBtn.count() > 0) return delBtn;
        
        return form.locator('button.delete-btn, button:has(.fa-trash), button:has-text("Delete")').first();
    }

    getSavedEntry(textValue: string): Locator {
        // Find a visible element containing the saved text (e.g., job title or company)
        return this.page.getByText(textValue, { exact: true }).locator('..').first();
    }

    async getEditIcon(companyOrSchool: string) {
        return this.page
            .locator('.row, .list-group-item')
            .filter({ has: this.page.getByText(companyOrSchool, { exact: true }) })
            .locator('button, a.btn-link')
            .first();
    }

    async getDeleteIcon(companyOrSchool: string) {
        return this.page
            .locator('.row, .list-group-item')
            .filter({ has: this.page.getByText(companyOrSchool, { exact: true }) })
            .locator('button')
            .filter({ has: this.page.locator('.fa-trash, .fa-trash-alt, svg[data-icon*="trash"]') })
            .first();
    }

    async isFormOpen(sectionTitle: string): Promise<boolean> {
        const form = this.page.locator('form').filter({ has: this.page.getByRole('heading', { name: sectionTitle }) });
        if (await form.count() === 0) return false;
        
        // Also check if it's visually hidden via class
        const classVal = await form.getAttribute('class');
        if (classVal && (classVal.includes('d-none') || classVal.includes('hidden'))) return false;
        
        return await form.isVisible();
    }
}

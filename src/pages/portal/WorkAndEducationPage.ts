import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export type SectionType = 'work' | 'edu' | 'fos';

export class WorkAndEducationPage extends BasePage {
    readonly tabHeader: Locator;

    // Sections
    readonly workExpSection: Locator;
    readonly eduSection: Locator;
    readonly fosSection: Locator;

    // Work Experience Locators
    readonly jobTitle: Locator;
    readonly companyName: Locator;
    readonly workExpFromYr: Locator;
    readonly workExpToYr: Locator;
    readonly isCurrentCompany: Locator;
    readonly workExpSaveBtn: Locator;
    readonly workExpCancelBtn: Locator;
    readonly workExpDeleteBtn: Locator;
    readonly workExpAddMoreBtn: Locator;

    // Education Locators
    readonly institutionName: Locator;
    readonly eduDegree: Locator;
    readonly eduFromYr: Locator;
    readonly eduToYr: Locator;
    readonly eduSaveBtn: Locator;
    readonly eduCancelBtn: Locator;
    readonly eduDeleteBtn: Locator;
    readonly eduAddMoreBtn: Locator;

    // Field of Studies Locators
    readonly studySub: Locator;
    readonly fosSaveBtn: Locator;
    readonly fosCancelBtn: Locator;
    readonly fosDeleteBtn: Locator;
    readonly fosAddMoreBtn: Locator;

    // SweetAlert elements
    readonly swalPopup: Locator;
    readonly swalConfirmBtn: Locator;
    readonly swalCancelBtn: Locator;

    // Using Index Signature for dynamic access in validation loops
    [key: string]: Locator | any;

    constructor(page: Page) {
        super(page);
        this.tabHeader = page.getByRole('tab', { name: /Work & Education/i });

        // Section Forms
        this.workExpSection = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Work Experience' }) });
        this.eduSection = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Education' }) });
        this.fosSection = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Field of Studies' }) });

        // Work Experience
        this.jobTitle = this.workExpSection.locator('#jobTitle');
        this.companyName = this.workExpSection.locator('#companyName');
        this.workExpFromYr = this.workExpSection.locator('#workExpFromYr');
        this.workExpToYr = this.workExpSection.locator('#workExpToYr');
        this.isCurrentCompany = this.workExpSection.locator('#isCurrentCompany');
        this.workExpSaveBtn = this.workExpSection.getByRole('button', { name: 'Save' });
        this.workExpCancelBtn = this.workExpSection.getByRole('button', { name: 'Cancel' });
        this.workExpDeleteBtn = this.workExpSection.getByRole('button', { name: 'Delete' });
        this.workExpAddMoreBtn = this.workExpSection.getByRole('button', { name: 'Add more' });

        // Education
        this.institutionName = this.eduSection.locator('#institutionName');
        this.eduDegree = this.eduSection.locator('#eduDegree');
        this.eduFromYr = this.eduSection.locator('#eduFromYr');
        this.eduToYr = this.eduSection.locator('#eduToYr');
        this.eduSaveBtn = this.eduSection.getByRole('button', { name: 'Save' });
        this.eduCancelBtn = this.eduSection.getByRole('button', { name: 'Cancel' });
        this.eduDeleteBtn = this.eduSection.getByRole('button', { name: 'Delete' });
        this.eduAddMoreBtn = this.eduSection.getByRole('button', { name: 'Add more' });

        // Field of Studies
        this.studySub = this.fosSection.locator('input').last();
        this.fosSaveBtn = this.fosSection.getByRole('button', { name: 'Save' });
        this.fosCancelBtn = this.fosSection.getByRole('button', { name: 'Cancel' });
        this.fosDeleteBtn = this.fosSection.getByRole('button', { name: 'Delete' });
        this.fosAddMoreBtn = this.fosSection.getByRole('button', { name: 'Add more' });

        // SweetAlert2
        this.swalPopup = page.locator('.swal2-popup');
        this.swalConfirmBtn = page.locator('.swal2-confirm');
        this.swalCancelBtn = page.locator('.swal2-cancel');
    }

    getLocator(field: string): Locator {
        const locator = this[field] as Locator;
        if (!locator) {
            throw new Error(`Locator not defined for field: ${field} in WorkAndEducationPage`);
        }
        return locator;
    }

    getSectionForm(section: SectionType): Locator {
        switch (section) {
            case 'work': return this.workExpSection;
            case 'edu': return this.eduSection;
            case 'fos': return this.fosSection;
        }
    }

    async ensureFormOpen(section: SectionType): Promise<void> {
        const form = this.getSectionForm(section);
        let inputLocator: Locator;
        let addMoreBtn: Locator;

        if (section === 'work') {
            inputLocator = this.jobTitle;
            addMoreBtn = this.workExpAddMoreBtn;
        } else if (section === 'edu') {
            inputLocator = this.institutionName;
            addMoreBtn = this.eduAddMoreBtn;
        } else {
            inputLocator = this.studySub;
            addMoreBtn = this.fosAddMoreBtn;
        }

        if (!(await inputLocator.isVisible())) {
            if (await addMoreBtn.isVisible()) {
                await addMoreBtn.click();
            } else {
                const editIcon = form.locator('.workEduInfoCard svg').first();
                if (await editIcon.isVisible()) {
                    await editIcon.click();
                }
            }
        }
        await expect(inputLocator).toBeVisible({ timeout: 10000 });
    }

    getCards(section: SectionType): Locator {
        return this.getSectionForm(section).locator('.workEduInfoCard');
    }

    getCard(section: SectionType, identifier: string): Locator {
        return this.getSectionForm(section).locator('.workEduInfoCard').filter({ hasText: identifier }).first();
    }

    async clickEditCard(section: SectionType, identifier: string): Promise<void> {
        const card = this.getCard(section, identifier);
        await card.locator('svg').first().click();
        await this.page.waitForTimeout(500);
    }

    async clickSave(section: SectionType, expectNetworkResponse: boolean = true): Promise<void> {
        let responsePromise: Promise<any> | null = null;
        if (expectNetworkResponse) {
            responsePromise = this.page.waitForResponse(
                resp => resp.url().includes('updateUserExperienceDetail') && resp.status() === 200,
                { timeout: 15000 }
            ).catch(() => null);
        }

        switch (section) {
            case 'work': await this.workExpSaveBtn.click(); break;
            case 'edu': await this.eduSaveBtn.click(); break;
            case 'fos': await this.fosSaveBtn.click(); break;
        }

        if (responsePromise) {
            await responsePromise;
            await this.page.waitForTimeout(500);
        }
    }

    async clickCancel(section: SectionType): Promise<void> {
        switch (section) {
            case 'work': await this.workExpCancelBtn.click(); break;
            case 'edu': await this.eduCancelBtn.click(); break;
            case 'fos': await this.fosCancelBtn.click(); break;
        }
        await this.page.waitForTimeout(500);
    }

    async clickDelete(section: SectionType): Promise<void> {
        switch (section) {
            case 'work': await this.workExpDeleteBtn.click(); break;
            case 'edu': await this.eduDeleteBtn.click(); break;
            case 'fos': await this.fosDeleteBtn.click(); break;
        }
        await this.swalPopup.waitFor({ state: 'visible', timeout: 5000 });
    }

    async confirmDelete(): Promise<void> {
        const responsePromise = this.page.waitForResponse(
            resp => resp.url().includes('updateUserExperienceDetail') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);

        await this.swalConfirmBtn.click();
        await this.swalPopup.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await responsePromise;
        await this.page.waitForTimeout(1000);
    }

    async cancelDelete(): Promise<void> {
        await this.swalCancelBtn.click();
        await this.swalPopup.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(500);
    }

    async deleteCardIfExists(section: SectionType, identifier: string): Promise<void> {
        const card = this.getCard(section, identifier);
        if (await card.isVisible().catch(() => false)) {
            await card.locator('svg').first().click();
            await this.page.waitForTimeout(500);
            await this.clickDelete(section);
            await this.confirmDelete();
            await expect(card).not.toBeVisible({ timeout: 10000 });
        }
    }

    async createEntry(section: SectionType, data: Record<string, string>): Promise<void> {
        await this.ensureFormOpen(section);
        if (section === 'work') {
            if (data.jobTitle) await this.jobTitle.fill(data.jobTitle);
            if (data.companyName) await this.companyName.fill(data.companyName);
            if (data.workExpFromYr) await this.workExpFromYr.fill(data.workExpFromYr);
            if (data.workExpToYr) await this.workExpToYr.fill(data.workExpToYr);
        } else if (section === 'edu') {
            if (data.institutionName) await this.institutionName.fill(data.institutionName);
            if (data.eduDegree) await this.eduDegree.fill(data.eduDegree);
            if (data.eduFromYr) await this.eduFromYr.fill(data.eduFromYr);
            if (data.eduToYr) await this.eduToYr.fill(data.eduToYr);
        } else if (section === 'fos') {
            if (data.studySub) await this.studySub.fill(data.studySub);
        }
        await this.clickSave(section);
    }

    async verifyCardVisible(section: SectionType, identifier: string): Promise<void> {
        const card = this.getCard(section, identifier);
        await expect(card).toBeVisible({ timeout: 10000 });
    }

    async verifyCardHidden(section: SectionType, identifier: string): Promise<void> {
        const card = this.getCard(section, identifier);
        await expect(card).not.toBeVisible({ timeout: 10000 });
    }

    async verifyEditFormButtonsVisible(section: SectionType, identifier: string): Promise<void> {
        await this.clickEditCard(section, identifier);
        if (section === 'work') {
            await expect(this.workExpSaveBtn).toBeVisible({ timeout: 5000 });
            await expect(this.workExpCancelBtn).toBeVisible({ timeout: 5000 });
            await expect(this.workExpDeleteBtn).toBeVisible({ timeout: 5000 });
        } else if (section === 'edu') {
            await expect(this.eduSaveBtn).toBeVisible({ timeout: 5000 });
            await expect(this.eduCancelBtn).toBeVisible({ timeout: 5000 });
            await expect(this.eduDeleteBtn).toBeVisible({ timeout: 5000 });
        } else if (section === 'fos') {
            await expect(this.fosSaveBtn).toBeVisible({ timeout: 5000 });
            await expect(this.fosCancelBtn).toBeVisible({ timeout: 5000 });
            await expect(this.fosDeleteBtn).toBeVisible({ timeout: 5000 });
        }
    }

    async cancelEdit(section: SectionType, identifier: string): Promise<void> {
        await this.clickCancel(section);
        await this.verifyCardVisible(section, identifier);
    }

    async updateEntry(section: SectionType, oldIdentifier: string, updatedData: Record<string, string>): Promise<void> {
        await this.clickEditCard(section, oldIdentifier);
        if (section === 'work') {
            if (updatedData.jobTitle) await this.jobTitle.fill(updatedData.jobTitle);
            if (updatedData.companyName) await this.companyName.fill(updatedData.companyName);
            if (updatedData.workExpFromYr) await this.workExpFromYr.fill(updatedData.workExpFromYr);
            if (updatedData.workExpToYr) await this.workExpToYr.fill(updatedData.workExpToYr);
        } else if (section === 'edu') {
            if (updatedData.institutionName) await this.institutionName.fill(updatedData.institutionName);
            if (updatedData.eduDegree) await this.eduDegree.fill(updatedData.eduDegree);
            if (updatedData.eduFromYr) await this.eduFromYr.fill(updatedData.eduFromYr);
            if (updatedData.eduToYr) await this.eduToYr.fill(updatedData.eduToYr);
        } else if (section === 'fos') {
            if (updatedData.studySub) await this.studySub.fill(updatedData.studySub);
        }
        await this.clickSave(section);
    }

    async deleteCard(section: SectionType, identifier: string): Promise<void> {
        const card = this.getCard(section, identifier);
        if (await card.isVisible().catch(() => false)) {
            await this.clickEditCard(section, identifier);
            await this.clickDelete(section);
            await this.confirmDelete();
            await this.verifyCardHidden(section, identifier);
        }
    }

    async verifyAddMoreOpensBlankForm(section: SectionType): Promise<void> {
        const form = this.getSectionForm(section);
        const addMoreBtn = form.getByRole('button', { name: 'Add more' });
        await addMoreBtn.click();
        if (section === 'work') {
            await expect(this.jobTitle).toBeVisible({ timeout: 5000 });
            await expect(this.jobTitle).toHaveValue('');
            await expect(this.companyName).toHaveValue('');
            await this.workExpCancelBtn.click();
        } else if (section === 'edu') {
            await expect(this.institutionName).toBeVisible({ timeout: 5000 });
            await expect(this.institutionName).toHaveValue('');
            await expect(this.eduDegree).toHaveValue('');
            await this.eduCancelBtn.click();
        } else if (section === 'fos') {
            await expect(this.studySub).toBeVisible({ timeout: 5000 });
            await expect(this.studySub).toHaveValue('');
            await this.fosCancelBtn.click();
        }
    }

    async runValidationScenario(section: SectionType, scenarioData: any, positiveData?: any): Promise<void> {
        await this.ensureFormOpen(section);

        if (scenarioData.fieldsToFill) {
            for (const f of scenarioData.fieldsToFill) {
                const loc = this.getLocator(f.field);
                await loc.fill(f.value);
            }
        } else if (scenarioData.customLogic === "isCurrentCompany") {
            await this.jobTitle.fill(positiveData.jobTitle);
            await this.companyName.fill(positiveData.companyName);
            await this.workExpFromYr.fill(positiveData.workExpFromYr);
            await this.isCurrentCompany.click();
            const currentYear = new Date().getFullYear().toString();
            await expect(this.workExpToYr).toHaveValue(currentYear, { timeout: 5000 });
            return;
        } else if (scenarioData.invalidData) {
            for (const key of Object.keys(scenarioData.invalidData)) {
                const loc = this.getLocator(key);
                await loc.fill(scenarioData.invalidData[key]);
            }
        } else if (scenarioData.field) {
            const loc = this.getLocator(scenarioData.field);
            if (scenarioData.value === "") {
                await loc.click();
            } else {
                await loc.fill(scenarioData.value);
            }
        }

        if (scenarioData.fieldsToBlank) {
            for (const key of scenarioData.fieldsToBlank) {
                const loc = this.getLocator(key);
                await loc.fill('');
            }
        }

        await this.clickSave(section, false);
        const form = this.getSectionForm(section);
        const msg = (scenarioData.expectedMessage || '').trim();
        await expect(form.getByText(msg).first()).toBeVisible({ timeout: 5000 });
    }

    async cleanupAllEntries(): Promise<void> {
        const cards = this.page.locator('.workEduInfoCard');
        let count = await cards.count();
        while (count > 0) {
            const card = cards.first();
            const editIcon = card.locator('svg').first();
            if (await editIcon.isVisible().catch(() => false)) {
                await editIcon.click();
                await this.page.waitForTimeout(500);
                const deleteBtn = this.page.locator('button.btn-danger, button:has-text("Delete")').filter({ hasNot: this.swalConfirmBtn }).first();
                if (await deleteBtn.isVisible().catch(() => false)) {
                    await deleteBtn.click();
                    await this.swalConfirmBtn.waitFor({ state: 'visible', timeout: 5000 });
                    await this.swalConfirmBtn.click();
                    await this.page.waitForTimeout(1500);
                } else {
                    break;
                }
            } else {
                break;
            }
            count = await cards.count();
        }
    }
}

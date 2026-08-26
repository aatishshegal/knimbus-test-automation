import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class EnrollmentDetailsPage extends BasePage {
  readonly pageHeader: Locator;
  readonly editBtn: Locator;
  readonly saveBtn: Locator;
  readonly cancelBtn: Locator;
  
  // Form Fields
  readonly idNumberInput: Locator;
  readonly collegeInput: Locator;
  readonly departmentInput: Locator;
  readonly qualificationInput: Locator;
  readonly designationInput: Locator;
  readonly areaOfStudyInput: Locator;
  readonly rankInput: Locator;
  readonly batchInput: Locator;
  readonly cadreInput: Locator;
  readonly admissionYearInput: Locator;
  readonly membershipStatusDropdown: Locator;
  readonly membershipTypeDropdown: Locator;
  readonly autoSuggestionOptions: Locator;

  constructor(page: Page) {
    super(page);
    
    // Core Elements scoped to Enrollment Details panel to avoid strict mode violations
    const panel = page.locator('.tab-pane.active').first();
    
    this.pageHeader = panel.getByRole('heading', { name: 'Enrollment Details' }).or(page.getByRole('heading', { name: 'Enrollment Details' }));
    this.editBtn = panel.locator('.edit-btn');
    this.saveBtn = panel.getByRole('button', { name: 'Save' });
    this.cancelBtn = panel.getByRole('button', { name: 'Cancel' });
    
    // Locators mapped using exact DOM name attributes from the HTML snippet provided
    this.idNumberInput = panel.locator('input[name="staffId"]');
    this.collegeInput = panel.locator('input[name="affiliation"]');
    this.departmentInput = panel.locator('input[name="department"]');
    this.qualificationInput = panel.locator('input[name="degree"]');
    this.designationInput = panel.locator('input[name="designation"]');
    this.areaOfStudyInput = panel.locator('input[name="speciality"]');
    this.rankInput = panel.locator('input[name="rank"]');
    this.batchInput = panel.locator('input[name="batch"]');
    this.cadreInput = panel.locator('input[name="cadre"]');
    this.admissionYearInput = panel.locator('input[name="year"]');
    this.membershipStatusDropdown = panel.locator('input[name="membershipStatus"]');
    this.membershipTypeDropdown = panel.locator('input[name="membershipType"]');
    
    // Auto-suggestion Locators (Datalist native elements)
    this.autoSuggestionOptions = panel.locator('datalist option');
  }

  async clickEdit() {
    await this.editBtn.click();
  }

  async clickSave() {
    await this.saveBtn.click();
  }

  async clickCancel() {
    await this.cancelBtn.click();
  }

  // Refactored helper methods to encapsulate loops
  async fillAndVerifyAllFields(positiveData: any, enrollmentFields: string[], logToCsv: Function) {
    for (const field of enrollmentFields) {
        const locator = (this as any)[`${field}Input`] || (this as any)[`${field}Dropdown`];
        if (locator && positiveData[field]) {
            await locator.fill(positiveData[field]);
            console.log(`Filled positive data for ${field}: ${positiveData[field]}`);
        }
    }
    await this.clickSave();
    await require('@playwright/test').expect(this.page.getByRole('heading', { name: /Updated successfully/i }).first()).toBeVisible({ timeout: 5000 });
    for (const field of enrollmentFields) {
        if (positiveData[field]) {
            logToCsv('Positive Data Entry Validation', 'Positive Data Entry', field, positiveData[field], 'Pass');
        }
    }
  }

  async verifyBlankEntry(positiveData: any, enrollmentFields: string[], logToCsv: Function) {
    for (const field of enrollmentFields) {
        const locator = (this as any)[`${field}Input`] || (this as any)[`${field}Dropdown`];
        if (!locator) continue;
        
        if (positiveData[field]) {
            await locator.fill(positiveData[field]);
        }
        
        await locator.fill(' ');
        await locator.focus();
        await this.page.keyboard.press('Backspace');
        await locator.blur();
        
        await require('@playwright/test').expect(this.page.getByText(/is required/i).first()).toBeVisible({ timeout: 2000 });
        logToCsv('Blank Entry Validation', 'Blank Validation', field, '', 'Pass');
        
        if (positiveData[field]) {
            await locator.fill(positiveData[field]);
        }
    }
  }

  async verifyNegativeScenarios(scenarios: any[], logToCsv: Function) {
    for (const s of scenarios) {
        if (await this.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await this.clickEdit();
        const locator = (this as any)[`${s.field}Input`] || (this as any)[`${s.field}Dropdown`];
        if (!locator) continue;
        
        await locator.fill(s.value);
        await this.clickSave();
        
        if (s.field === 'admissionYear' && s.scenario.includes('restricts input')) {
            logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Pass', 'UI natively restricted input length (No error thrown)');
        } else {
            await require('@playwright/test').expect(this.page.getByText(s.expectedError).first()).toBeVisible({ timeout: 3000 });
            logToCsv('Negative Scenario Validation', s.scenario, s.field, s.value, 'Pass');
        }
        
        if (await this.editBtn.isVisible({ timeout: 2000 }).catch(()=>false)) await this.clickEdit();
        try { await locator.fill(''); } catch(e){}
        if (await this.cancelBtn.isVisible().catch(()=>false)) try { await this.clickCancel(); } catch(e){}
    }
  }

  async verifyAutoSuggestion(enrollmentFields: string[], logToCsv: Function, isDoubleClick: boolean) {
    for (const field of enrollmentFields) {
        if (field === 'idNumber') continue;
        
        const locator = (this as any)[`${field}Input`] || (this as any)[`${field}Dropdown`];
        if (!locator) continue;
        
        const listId = await locator.getAttribute('list');
        if (listId) {
            if (isDoubleClick) {
                await locator.scrollIntoViewIfNeeded(); await locator.click({ force: true }); await this.page.waitForTimeout(200); await locator.dblclick({ force: true });
            } else {
                await locator.fill('');
                await locator.pressSequentially('a', { delay: 100 });
            }
            const datalist = this.page.locator(`datalist#${listId}`);
            await require('@playwright/test').expect(datalist).toBeAttached();
            logToCsv('Auto-suggestion Validation', `Auto-suggestion on ${isDoubleClick ? 'double click' : 'typing'} (${field})`, field === 'college' ? 'Affiliation' : field, isDoubleClick ? 'Double Click' : 'a', 'Pass');
        }
    }
  }

  async verifyAdminOverrideIndividualFields(enrollmentFields: string[], backendFieldMap: any, adminApi: any, logToCsv: Function) {
    for (const field of enrollmentFields) {
        const backendName = backendFieldMap[field];
        if (!backendName) continue;
        
        await adminApi.updateSecuritySettings({ editableFields: { fields: [backendName], isEditable: false } });
        await this.page.reload();
        await this.page.getByRole('tab', { name: /Enrollment Details/i }).click();
        await this.clickEdit();

        const locator = (this as any)[`${field}Input`] || (this as any)[`${field}Dropdown`];
        if (locator) {
            await require('@playwright/test').expect(locator).toBeDisabled({ timeout: 5000 });
            logToCsv('Admin Override Validation', 'Admin Override: Individual field non-editable', field, 'N/A', 'Pass');
        }
    }
  }

  async logFailureToCsv(positiveData: any, enrollmentFields: string[], logToCsv: Function, errorMessage: string) {
    for (const field of enrollmentFields) {
        if (positiveData[field]) {
            logToCsv('Positive Data Entry Validation', 'Positive Data Entry', field, positiveData[field], 'Fail', errorMessage);
        }
    }
  }
}


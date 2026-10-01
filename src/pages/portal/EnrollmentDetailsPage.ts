import { Locator, Page, expect } from '@playwright/test';
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
  readonly staffIdHelpText: Locator;
  readonly autoSuggestionOptions: Locator;

  constructor(page: Page) {
    super(page);
    
    const panel = page.locator('.tab-pane.active').first();
    this.pageHeader = panel.locator('.profile-form-content-heading, h5, [role="heading"]').filter({ hasText: /enrollment details/i }).first();
    this.editBtn = panel.locator('.profile-form-content-heading-wrapper .edit-btn, .edit-btn').first();
    this.saveBtn = panel.locator('button.btn-primary:has-text("Save"), button:has-text("Save"), .btn-save').first();
    this.cancelBtn = panel.locator('button.btn-outline-secondary:has-text("Cancel"), button:has-text("Cancel")').first();
    
    // Locators mapped using resilient selectors within panel
    this.idNumberInput = panel.locator('input[name="staffId"]');
    this.staffIdHelpText = panel.locator('#staffId-help, .staff-id-help, small, span, div').filter({ hasText: /Example: Membership/i }).first();
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

  async ensureInEditMode() {
    if (await this.editBtn.isVisible()) {
      await this.clickEdit();
    }
  }

  async setFieldValue(field: string, value: string, bypassLength: boolean = false) {
    await this.ensureInEditMode();
    const locator = this.getLocator(field);
    if (bypassLength) {
      await locator.evaluate((el: HTMLElement) => el.removeAttribute('maxlength'));
    }
    await locator.fill(value);
    await locator.blur();
  }

  async clearFieldAndBlur(field: string) {
    await this.ensureInEditMode();
    const locator = this.getLocator(field);
    await locator.fill(' ');
    await locator.focus();
    await this.page.keyboard.press('Backspace');
    await locator.blur();
  }

  getLocator(fieldName: string): Locator {
    const fieldMap: Record<string, Locator> = {
      'idNumber': this.idNumberInput,
      'college': this.collegeInput,
      'department': this.departmentInput,
      'qualification': this.qualificationInput,
      'designation': this.designationInput,
      'areaOfStudy': this.areaOfStudyInput,
      'rank': this.rankInput,
      'batch': this.batchInput,
      'cadre': this.cadreInput,
      'admissionYear': this.admissionYearInput,
      'membershipStatus': this.membershipStatusDropdown,
      'membershipType': this.membershipTypeDropdown
    };
    return fieldMap[fieldName] as Locator;
  }

  async verifyFieldDisabled(fieldName: string) {
    const locator = this.getLocator(fieldName);
    await expect(locator).toBeDisabled();
  }

  async verifyFieldVisible(fieldName: string) {
    const locator = this.getLocator(fieldName);
    await expect(locator).toBeVisible();
  }
}

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
}

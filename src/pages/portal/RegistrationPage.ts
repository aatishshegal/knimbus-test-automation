import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RegistrationPage extends BasePage {
  readonly registrationPageIdentifier: Locator;
  readonly FullName: Locator;
  readonly Email: Locator;
  readonly Password: Locator;
  readonly termsCheckbox: Locator;
  readonly continueButton: Locator;

  // New fields for validation
  readonly membershipStatus: Locator;
  readonly membershipType: Locator;
  readonly summary: Locator;
  readonly cadre: Locator;
  readonly batch: Locator;
  readonly rank: Locator;
  readonly designation: Locator;
  readonly residentialAddress: Locator;
  readonly officeAddress: Locator;
  readonly areaOfStudy: Locator;
  readonly qualification: Locator;
  readonly department: Locator;
  readonly idNumber: Locator;
  readonly college: Locator;
  readonly admissionYear: Locator;
  readonly mobile: Locator;
  readonly officePhone: Locator;
  readonly residentialPhone: Locator;
  readonly nationality: Locator;
  readonly idDocumentFront: Locator;
  readonly idDocumentBack: Locator;
  readonly affiliation: Locator;
  readonly degree: Locator;
  readonly year: Locator;

  constructor(page: Page) {
    super(page);
    this.registrationPageIdentifier = page.locator('input#userName');
    
    this.FullName = page.locator('input#userName');
    this.Email = page.locator('input#email');
    this.Password = page.locator('input#password');
    this.termsCheckbox = page.getByRole('checkbox', { name: 'I have read and agree to the' });
    this.continueButton = page.getByRole('button', { name: /Next|Continue/i });

    // Initializing new locators using actual DOM names and IDs
    this.membershipStatus = page.locator('input[name="membershipStatus"], select[name="membershipStatus"], #membershipStatus');
    this.membershipType = page.locator('input[name="membershipType"], select[name="membershipType"], #membershipType');
    this.summary = page.locator('textarea[name="about"], #about');
    this.cadre = page.locator('input[name="cadre"], #cadre');
    this.batch = page.locator('input[name="batch"], #batch');
    this.rank = page.locator('input[name="rank"], #rank');
    this.designation = page.locator('input[name="designation"], #designation');
    this.residentialAddress = page.locator('textarea[name="residentialAddress"], #residentialAddress');
    this.officeAddress = page.locator('textarea[name="officeAddress"], #officeAddress');
    this.areaOfStudy = page.locator('input[name="speciality"], #speciality');
    this.qualification = page.locator('input[name="degree"], #degree');
    this.department = page.locator('input[name="department"], #department');
    this.idNumber = page.locator('input[name="staffId"], #staffId');
    this.college = page.locator('input[name="affiliation"], #affiliation');
    this.admissionYear = page.locator('input[name="year"], #year');
    this.mobile = page.locator('input[name="contactNos"]');
    this.officePhone = page.locator('input[name="officePhone"], #officePhone');
    this.residentialPhone = page.locator('input[name="residentialPhone"], #residentialPhone');
    this.nationality = page.locator('select[name="nationality"], #nationality');
    
    this.idDocumentFront = page.locator('input[type="file"]').first();
    this.idDocumentBack = page.locator('input[type="file"]').nth(1);
    
    this.affiliation = page.locator('input[name="affiliation"], #affiliation');
    this.degree = page.locator('input[name="degree"], #degree');
    this.year = page.locator('input[name="year"], #year');
  }

  async fillRegistration(fullName: string, email: string, password: string) {
    console.log(`[RegistrationPage] Registering user: ${fullName} (${email})`);
    await this.fillText(this.FullName, fullName, 'Full Name');
    await this.fillText(this.Email, email, 'Email');
    await this.fillText(this.Password, password, 'Password');
  }

  async acceptTermsAndConditions() {
    console.log(`[RegistrationPage] Checking Terms & Conditions checkbox...`);
    await this.termsCheckbox.check({ force: true });
  }
  
  async submitRegistration() {
    await this.clickElement(this.continueButton, 'Continue Button');
  }

  /**
   * Validates a single scenario using web-first soft assertions.
   */
  async validateFieldScenario(data: any) {
    const targetField = (this as any)[data.field] as Locator;
    if (!targetField) {
      expect.soft(false, `Locator for field '${data.field}' is not mapped in RegistrationPage`).toBeTruthy();
      return;
    }

    try {
      const tagName = await targetField.evaluate((el: HTMLElement) => el.tagName.toLowerCase()).catch(() => 'input');
      if (tagName !== 'select' && data.field !== 'idDocumentFront' && data.field !== 'idDocumentBack') {
        await targetField.clear({ timeout: 1000 });
      }

      if (data.field === 'idDocumentFront' || data.field === 'idDocumentBack') {
        const filePath = `tests/test-data/files/${data.value}`;
        await targetField.setInputFiles(filePath, { timeout: 1000 });
      } else if (tagName === 'select') {
        if (data.value === 'BLANK') {
          await targetField.selectOption({ index: 0 }, { timeout: 1000 }).catch(() => {});
        } else {
          await targetField.selectOption(data.value, { timeout: 1000 }).catch(() => {});
        }
      } else {
        if (data.value !== 'BLANK') {
          await targetField.fill(data.value, { timeout: 1000 });
          await targetField.blur();
        }
      }

      if (data.expectedValidity === 'invalid') {
        const validationMessage = await targetField.evaluate((el: HTMLInputElement) => el.validationMessage).catch(() => '');
        const isCssInvalid = await targetField.evaluate((el: HTMLElement) => el.classList.contains('is-invalid') || el.classList.contains('ng-invalid')).catch(() => false);
        const isInvalid = !!validationMessage || isCssInvalid;
        expect.soft(isInvalid, `[${data.field}] Scenario '${data.scenario}' failed: Accepted invalid value '${data.value}' without triggering validation`).toBeTruthy();
      } else if (data.expectedValidity === 'valid') {
        const isCssInvalid = await targetField.evaluate((el: HTMLElement) => el.classList.contains('is-invalid')).catch(() => false);
        expect.soft(!isCssInvalid, `[${data.field}] Scenario '${data.scenario}' failed: Valid value '${data.value}' was incorrectly flagged as invalid`).toBeTruthy();
      }
    } catch (e) {
      expect.soft(false, `[${data.field}] Scenario '${data.scenario}' error: ${(e as Error).message}`).toBeTruthy();
    }
  }

  /**
   * Iterates through scenarios matching the given fields array, encapsulating loops inside the POM.
   */
  async validateScenariosForFields(fields: string[], allScenarios: any[]) {
    const scenarios = allScenarios.filter((s: any) => fields.includes(s.field));
    for (const scenario of scenarios) {
      await this.validateFieldScenario(scenario);
    }
  }

  /**
   * Legacy batch validation method maintained for backwards compatibility.
   */
  async executeValidationScenarios(scenarios: any[], logResultCallback?: (data: any, passed: boolean, message: string) => void) {
    for (const data of scenarios) {
      await this.validateFieldScenario(data);
    }
  }
}

import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MandatoryDetailsPage extends BasePage {
  readonly mandatoryDetailsIdentifier: Locator;
  readonly genderDropdown: Locator;
  readonly departmentInput: Locator;
  readonly degreeInput: Locator;
  readonly designationInput: Locator;
  readonly batchInput: Locator;
  readonly nationalityInput: Locator;
  readonly idDocumentFrontInput: Locator;
  readonly idDocumentBackInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.mandatoryDetailsIdentifier = page.getByText('Fill the mandatory detail(s)');
    this.genderDropdown = page.locator('#gender');
    this.departmentInput = page.locator('#department');
    // Using resilient locators based on the DOM pattern we discovered
    this.degreeInput = page.locator('#degree');
    this.designationInput = page.locator('#designation');
    this.batchInput = page.locator('input[name="batch"]');
    this.nationalityInput = page.locator('#nationality');
    // ID Document has two inputs: Front and Back
    this.idDocumentFrontInput = page.locator('#idDocumentFront');
    this.idDocumentBackInput = page.locator('#idDocumentBack');
    this.submitButton = page.getByRole('button', { name: 'Update & continue' });
  }

  private async typeDropdown(locator: Locator, text: string) {
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    await locator.click();
    await locator.fill(''); // Clear
    await this.page.waitForTimeout(500);
    // Type and hit Enter
    await locator.pressSequentially(text, { delay: 50 });
    await this.page.waitForTimeout(1000);
    
    const option = this.page.getByRole('option', { name: text }).first();
    const fallbackOption = this.page.getByText(text, { exact: true }).last();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    } else if (await fallbackOption.isVisible().catch(() => false)) {
      await fallbackOption.click();
    } else {
      await locator.press('ArrowDown');
      await this.page.waitForTimeout(200);
      await locator.press('Enter');
    }
    await locator.press('Escape');
    await locator.blur();
  }

  async fillMandatoryFields(data: {
    gender?: string,
    department?: string,
    degree?: string,
    designation?: string,
    batch?: string,
    nationality?: string,
    idDocumentFrontPath?: string,
    idDocumentBackPath?: string
  }) {
    console.log("=== Initial Form Fill ===");
    await this.performFill(data);

    // Wait a moment for validation
    await this.page.waitForTimeout(1500);
    
    let isEnabled = await this.submitButton.isEnabled();
    console.log(`Update & continue button enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log("Button is not enabled, rechecking each field...");
      for (let attempt = 1; attempt <= 3; attempt++) {
        await this.checkAndRefill(data);
        await this.page.waitForTimeout(1500);
        isEnabled = await this.submitButton.isEnabled();
        console.log(`Update & continue button enabled after retry ${attempt}: ${isEnabled}`);
        if (isEnabled) break;
      }
    }
    
    if (!isEnabled) {
      throw new Error("Failed to fill mandatory fields properly: Update & continue button remained disabled.");
    }
  }

  private async performFill(data: any) {
    if (data.gender) {
      console.log(`Filling Gender: ${data.gender}`);
      await this.genderDropdown.selectOption(data.gender).catch(() => {});
    }
    if (data.department) {
      console.log(`Filling Department: ${data.department}`);
      await this.typeDropdown(this.departmentInput, data.department);
    }
    if (data.degree) {
      console.log(`Filling Degree: ${data.degree}`);
      await this.typeDropdown(this.degreeInput, data.degree);
    }
    if (data.designation) {
      console.log(`Filling Designation: ${data.designation}`);
      await this.typeDropdown(this.designationInput, data.designation);
    }
    if (data.batch) {
      console.log(`Filling Batch: ${data.batch}`);
      await this.typeDropdown(this.batchInput, data.batch);
    }
    if (data.nationality) {
      console.log(`Filling Nationality: ${data.nationality}`);
      await this.nationalityInput.selectOption(data.nationality).catch(() => {});
    }
    if (data.idDocumentFrontPath) {
      console.log(`Uploading Front ID: ${data.idDocumentFrontPath}`);
      await this.idDocumentFrontInput.setInputFiles(data.idDocumentFrontPath).catch(() => {});
    }
    if (data.idDocumentBackPath) {
      console.log(`Uploading Back ID: ${data.idDocumentBackPath}`);
      await this.idDocumentBackInput.setInputFiles(data.idDocumentBackPath).catch(() => {});
    }
  }

  private async checkAndRefill(data: any) {
    // Check Gender
    if (data.gender) {
      const val = await this.genderDropdown.inputValue().catch(() => '');
      if (val !== data.gender) {
        console.log(`Gender mismatch (Expected: ${data.gender}, Found: ${val}). Refilling...`);
        await this.genderDropdown.selectOption(data.gender).catch(() => {});
      }
    }
    
    // Helper to check dropdowns
    const checkDropdown = async (locator: Locator, expected: string, name: string) => {
      const val = await locator.inputValue().catch(() => '');
      const errorMsg = this.page.locator(`text=/${name}.*is required/i`);
      const hasError = await errorMsg.isVisible().catch(() => false);
      if (val !== expected || hasError) {
        console.log(`${name} mismatch/error (Expected: ${expected}, Found: ${val}, HasError: ${hasError}). Refilling...`);
        await this.typeDropdown(locator, expected);
      }
    };

    if (data.department) await checkDropdown(this.departmentInput, data.department, 'Department');
    if (data.degree) await checkDropdown(this.degreeInput, data.degree, 'Qualification / Degree / Program');
    if (data.designation) await checkDropdown(this.designationInput, data.designation, 'Designation');
    if (data.batch) await checkDropdown(this.batchInput, data.batch, 'Batch');

    // Check Nationality
    if (data.nationality) {
      const val = await this.nationalityInput.inputValue().catch(() => '');
      if (val !== data.nationality) {
        console.log(`Nationality mismatch (Expected: ${data.nationality}, Found: ${val}). Refilling...`);
        await this.nationalityInput.selectOption(data.nationality).catch(() => {});
      }
    }
  }

  async submitForm() {
    await this.clickElement(this.submitButton, 'Update & continue');
  }
}

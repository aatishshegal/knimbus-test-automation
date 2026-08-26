import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export interface EnrollmentData {
  staffId?: string;
  affiliation?: string;
  department?: string;
  degree?: string;
  designation?: string;
  speciality?: string;
  rank?: string;
  batch?: string;
  cadre?: string;
  year?: string;
  membershipStatus?: string;
  membershipType?: string;
}

export class EnrollmentDetailsPage extends BasePage {
  // Navigation & Container Locators
  readonly enrollmentTabLink: Locator;
  readonly tabHeader: Locator;
  readonly editButton: Locator;
  readonly loadingOverlay: Locator;

  // Form Fields Locators
  readonly staffIdInput: Locator;
  readonly staffIdHelpText: Locator;
  readonly affiliationInput: Locator;
  readonly departmentInput: Locator;
  readonly degreeInput: Locator;
  readonly designationInput: Locator;
  readonly specialityInput: Locator;
  readonly rankInput: Locator;
  readonly batchInput: Locator;
  readonly cadreInput: Locator;
  readonly yearInput: Locator;
  readonly membershipStatusInput: Locator;
  readonly membershipTypeInput: Locator;

  // Action Buttons & Notifications
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly toastNotification: Locator;

  constructor(page: Page) {
    super(page);

    // Tab Navigation & Loader
    this.loadingOverlay = page.locator('.book-loader, .overlay_inner, .overlay').first();
    this.enrollmentTabLink = page.locator('a[data-rr-ui-event-key="Enrollment Details"], [role="tab"]:has-text("Enrollment Details"), .nav-link:has-text("Enrollment Details"), button:has-text("Enrollment Details"), .profile-tab:has-text("Enrollment Details")').first();
    this.tabHeader = page.locator('.profile-form-content-heading, h5').filter({ hasText: /enrollment details/i }).first();
    this.editButton = page.locator('.profile-form-content-heading-wrapper .edit-btn, .edit-btn').first();

    // Field Locators
    this.staffIdInput = page.locator('#staffId, #membershipId, #idNumber, input[name="staffId"], input[name="membershipId"]').first();
    this.staffIdHelpText = page.locator('#staffId-help');
    this.affiliationInput = page.locator('#affiliation');
    this.departmentInput = page.locator('#department');
    this.degreeInput = page.locator('#degree');
    this.designationInput = page.locator('#designation');
    this.specialityInput = page.locator('#speciality');
    this.rankInput = page.locator('#rank');
    this.batchInput = page.locator('#batch');
    this.cadreInput = page.locator('#cadre');
    this.yearInput = page.locator('#year');
    this.membershipStatusInput = page.locator('#membershipStatus');
    this.membershipTypeInput = page.locator('#membershipType');

    // Form Action Buttons
    this.saveButton = page.locator('button.btn-primary:has-text("Save"), button:has-text("Save"), button.btn-primary').first();
    this.cancelButton = page.locator('button.btn-outline-secondary:has-text("Cancel"), button:has-text("Cancel")').first();
    this.toastNotification = page.locator('.toast, .toast-message, .alert, [role="alert"]').first();
  }

  /**
   * Clicks on the Enrollment Details profile tab if not already active and waits for loader to clear.
   * Handles session expiration or login popup redirects gracefully without hanging.
   */
  async navigateToTab() {
    try {
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.loadingOverlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if redirected to login page due to expired session
      if (this.page.url().includes('signin') || this.page.url().includes('login')) {
        console.log('[LOG] Session redirect/expiration detected. Bypassing tab wait.');
        return;
      }

      if (await this.enrollmentTabLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await this.enrollmentTabLink.click({ timeout: 3000 }).catch(() => {});
        await this.loadingOverlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      }

      await this.tabHeader.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    } catch (e) {
      console.log('[LOG] Exception during navigateToTab caught cleanly:', e);
    }
  }

  /**
   * Clicks the Edit button if present, or returns if fields are already editable.
   */
  async clickEdit() {
    const editBtn = this.page.locator('.profile-form-content-heading-wrapper .edit-btn, .edit-btn, button:has-text("Edit")').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Retrieves validation attributes (maxlength, minlength, placeholder, list, required) for all inputs.
   */
  async getFieldAttributes() {
    return {
      staffId: {
        maxlength: await this.staffIdInput.getAttribute('maxlength'),
        placeholder: await this.staffIdInput.getAttribute('placeholder'),
        required: await this.staffIdInput.getAttribute('required'),
      },
      affiliation: {
        maxlength: await this.affiliationInput.getAttribute('maxlength'),
        placeholder: await this.affiliationInput.getAttribute('placeholder'),
        list: await this.affiliationInput.getAttribute('list'),
        required: await this.affiliationInput.getAttribute('required'),
      },
      department: {
        maxlength: await this.departmentInput.getAttribute('maxlength'),
        placeholder: await this.departmentInput.getAttribute('placeholder'),
        list: await this.departmentInput.getAttribute('list'),
        required: await this.departmentInput.getAttribute('required'),
      },
      degree: {
        maxlength: await this.degreeInput.getAttribute('maxlength'),
        placeholder: await this.degreeInput.getAttribute('placeholder'),
        list: await this.degreeInput.getAttribute('list'),
        required: await this.degreeInput.getAttribute('required'),
      },
      designation: {
        maxlength: await this.designationInput.getAttribute('maxlength'),
        placeholder: await this.designationInput.getAttribute('placeholder'),
        list: await this.designationInput.getAttribute('list'),
        required: await this.designationInput.getAttribute('required'),
      },
      speciality: {
        maxlength: await this.specialityInput.getAttribute('maxlength'),
        placeholder: await this.specialityInput.getAttribute('placeholder'),
        list: await this.specialityInput.getAttribute('list'),
        required: await this.specialityInput.getAttribute('required'),
      },
      rank: {
        maxlength: await this.rankInput.getAttribute('maxlength'),
        placeholder: await this.rankInput.getAttribute('placeholder'),
        list: await this.rankInput.getAttribute('list'),
        required: await this.rankInput.getAttribute('required'),
      },
      batch: {
        maxlength: await this.batchInput.getAttribute('maxlength'),
        placeholder: await this.batchInput.getAttribute('placeholder'),
        list: await this.batchInput.getAttribute('list'),
        required: await this.batchInput.getAttribute('required'),
      },
      cadre: {
        maxlength: await this.cadreInput.getAttribute('maxlength'),
        placeholder: await this.cadreInput.getAttribute('placeholder'),
        list: await this.cadreInput.getAttribute('list'),
        required: await this.cadreInput.getAttribute('required'),
      },
      year: {
        minlength: await this.yearInput.getAttribute('minlength'),
        maxlength: await this.yearInput.getAttribute('maxlength'),
        placeholder: await this.yearInput.getAttribute('placeholder'),
        list: await this.yearInput.getAttribute('list'),
        required: await this.yearInput.getAttribute('required'),
      },
      membershipStatus: {
        maxlength: await this.membershipStatusInput.getAttribute('maxlength'),
        placeholder: await this.membershipStatusInput.getAttribute('placeholder'),
        list: await this.membershipStatusInput.getAttribute('list'),
        required: await this.membershipStatusInput.getAttribute('required'),
      },
      membershipType: {
        maxlength: await this.membershipTypeInput.getAttribute('maxlength'),
        placeholder: await this.membershipTypeInput.getAttribute('placeholder'),
        list: await this.membershipTypeInput.getAttribute('list'),
        required: await this.membershipTypeInput.getAttribute('required'),
      },
    };
  }

  /**
   * Checks mandatory status (presence of required attribute or * in associated label) for a specified field ID.
   */
  async checkFieldMandatoryState(fieldId: string) {
    try {
      const inputLocator = this.page.locator(`#${fieldId}, input[name="${fieldId}"], select[name="${fieldId}"], #${fieldId}Input`).first()
        .or(this.page.locator(`[id*="${fieldId}"]`).first());
      const labelLocator = this.page.locator(`label[for="${fieldId}"], div:has(#${fieldId}) label, label:has-text("${fieldId}")`).first();

      const isRequiredAttr = await inputLocator.getAttribute('required', { timeout: 3000 }).then(val => val !== null).catch(() => false);
      const labelText = await labelLocator.innerText().catch(() => '');
      const hasAsterisk = labelText.includes('*');

      return {
        fieldId,
        isRequiredAttr,
        hasAsterisk,
        isMandatory: isRequiredAttr || hasAsterisk,
      };
    } catch {
      return {
        fieldId,
        isRequiredAttr: false,
        hasAsterisk: false,
        isMandatory: false,
      };
    }
  }

  /**
   * Clears text from all editable inputs.
   */
  async clearAllEditableFields() {
    await this.clickEdit();
    const fields = [
      this.staffIdInput,
      this.affiliationInput,
      this.departmentInput,
      this.degreeInput,
      this.designationInput,
      this.specialityInput,
      this.rankInput,
      this.batchInput,
      this.cadreInput,
      this.yearInput,
      this.membershipStatusInput,
      this.membershipTypeInput,
    ];

    for (const field of fields) {
      if (await field.isEnabled().catch(() => false)) {
        await field.clear({ timeout: 1000 }).catch(() => {});
      }
    }
  }

  /**
   * Retrieves text content of the ID Number help label.
   */
  async getStaffIdHelpText(): Promise<string> {
    return (await this.staffIdHelpText.innerText()).trim();
  }

  /**
   * Fills specified enrollment details fields.
   */
  async updateEnrollmentDetails(data: EnrollmentData) {
    await this.clickEdit();

    if (data.staffId !== undefined && await this.staffIdInput.isEnabled().catch(() => false)) {
      await this.fillText(this.staffIdInput, data.staffId, 'ID Number Field');
    }
    if (data.affiliation !== undefined && await this.affiliationInput.isEnabled().catch(() => false)) {
      await this.fillText(this.affiliationInput, data.affiliation, 'College / Organization Field');
    }
    if (data.department !== undefined && await this.departmentInput.isEnabled().catch(() => false)) {
      await this.fillText(this.departmentInput, data.department, 'Department Field');
    }
    if (data.degree !== undefined && await this.degreeInput.isEnabled().catch(() => false)) {
      await this.fillText(this.degreeInput, data.degree, 'Qualification / Degree / Program Field');
    }
    if (data.designation !== undefined && await this.designationInput.isEnabled().catch(() => false)) {
      await this.fillText(this.designationInput, data.designation, 'Designation Field');
    }
    if (data.speciality !== undefined && await this.specialityInput.isEnabled().catch(() => false)) {
      await this.fillText(this.specialityInput, data.speciality, 'Area of Study / Speciality Field');
    }
    if (data.rank !== undefined && await this.rankInput.isEnabled().catch(() => false)) {
      await this.fillText(this.rankInput, data.rank, 'Rank Field');
    }
    if (data.batch !== undefined && await this.batchInput.isEnabled().catch(() => false)) {
      await this.fillText(this.batchInput, data.batch, 'Batch Field');
    }
    if (data.cadre !== undefined && await this.cadreInput.isEnabled().catch(() => false)) {
      await this.fillText(this.cadreInput, data.cadre, 'Cadre Field');
    }
    if (data.year !== undefined && await this.yearInput.isEnabled().catch(() => false)) {
      await this.fillText(this.yearInput, data.year, 'Admission Year Field');
    }
    if (data.membershipStatus !== undefined && await this.membershipStatusInput.isEnabled().catch(() => false)) {
      await this.fillText(this.membershipStatusInput, data.membershipStatus, 'Membership Status Field');
    }
    if (data.membershipType !== undefined && await this.membershipTypeInput.isEnabled().catch(() => false)) {
      await this.fillText(this.membershipTypeInput, data.membershipType, 'Membership Type Field');
    }
  }

  /**
   * Clicks the Save button.
   */
  async saveChanges() {
    if (await this.saveButton.isVisible().catch(() => false) && await this.saveButton.isEnabled().catch(() => false)) {
      await this.clickElement(this.saveButton, 'Save Button');
    }
  }

  /**
   * Clicks the Cancel button.
   */
  async cancelEdit() {
    if (await this.cancelButton.isVisible().catch(() => false) && await this.cancelButton.isEnabled().catch(() => false)) {
      await this.clickElement(this.cancelButton, 'Cancel Button');
    }
  }

  /**
   * Retrieves current values from all enrollment form inputs.
   */
  async getEnrollmentValues(): Promise<EnrollmentData> {
    return {
      staffId: await this.staffIdInput.inputValue().catch(() => ''),
      affiliation: await this.affiliationInput.inputValue().catch(() => ''),
      department: await this.departmentInput.inputValue().catch(() => ''),
      degree: await this.degreeInput.inputValue().catch(() => ''),
      designation: await this.designationInput.inputValue().catch(() => ''),
      speciality: await this.specialityInput.inputValue().catch(() => ''),
      rank: await this.rankInput.inputValue().catch(() => ''),
      batch: await this.batchInput.inputValue().catch(() => ''),
      cadre: await this.cadreInput.inputValue().catch(() => ''),
      year: await this.yearInput.inputValue().catch(() => ''),
      membershipStatus: await this.membershipStatusInput.inputValue().catch(() => ''),
      membershipType: await this.membershipTypeInput.inputValue().catch(() => ''),
    };
  }

  /**
   * Retrieves list of options inside a datalist by list id.
   */
  async getDatalistOptions(listId: string): Promise<string[]> {
    const options = this.page.locator(`datalist#${listId} option`);
    const count = await options.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute('value');
      if (val && val.trim().length > 0) {
        result.push(val.trim());
      }
    }
    return result;
  }
}

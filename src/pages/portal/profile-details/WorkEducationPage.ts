import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class WorkEducationPage extends BasePage {
  readonly tabHeader: Locator;

  // Section Headings
  readonly headingWorkExperience: Locator;
  readonly headingEducation: Locator;
  readonly headingFieldOfStudies: Locator;

  // Form Containers
  readonly workExpForm: Locator;
  readonly educationForm: Locator;
  readonly fieldOfStudiesForm: Locator;

  // Work Experience Form Locators
  readonly jobTitleInput: Locator;
  readonly companyNameInput: Locator;
  readonly workExpFromYrInput: Locator;
  readonly workExpToYrInput: Locator;
  readonly isCurrentCompanyCheckbox: Locator;
  readonly isCurrentCompanyLabel: Locator;
  readonly saveWorkExpButton: Locator;

  // Education Form Locators
  readonly institutionNameInput: Locator;
  readonly eduDegreeInput: Locator;
  readonly eduFromYrInput: Locator;
  readonly eduToYrInput: Locator;
  readonly saveEducationButton: Locator;

  // Field of Studies Form Locators
  readonly studySubInput: Locator;
  readonly saveFieldOfStudiesButton: Locator;

  // Card & Action Locators
  readonly editCardIcon: Locator;
  readonly editFieldOfStudiesCardIcon: Locator;
  readonly cancelEditButton: Locator;
  readonly deleteExpButton: Locator;
  readonly addMoreButton: Locator;

  // Delete Confirmation Modal Locators
  readonly deleteConfirmModal: Locator;
  readonly deleteModalText: Locator;
  readonly deleteModalConfirmButton: Locator;
  readonly deleteModalCancelButton: Locator;

  // Toast & Error Message Locators
  readonly toastNotification: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.tabHeader = page.locator('h1, h2, h3, .heading, [role="tab"]').filter({ hasText: /work & education/i }).first();

    // Section Headings
    this.headingWorkExperience = page.locator('.profile-form-content-heading').filter({ hasText: /work experience/i });
    this.headingEducation = page.locator('.profile-form-content-heading').filter({ hasText: /education/i });
    this.headingFieldOfStudies = page.locator('.profile-form-content-heading').filter({ hasText: /field of studies/i });

    // Form Containers
    this.workExpForm = page.locator('form').filter({ has: page.locator('.profile-form-content-heading', { hasText: /work experience/i }) });
    this.educationForm = page.locator('form').filter({ has: page.locator('.profile-form-content-heading', { hasText: /education/i }) });
    this.fieldOfStudiesForm = page.locator('form').filter({ has: page.locator('.profile-form-content-heading', { hasText: /field of studies/i }) });

    // Work Experience Locators
    this.jobTitleInput = page.locator('#jobTitle, input[name="jobTitle"]');
    this.companyNameInput = page.locator('#companyName, input[name="companyName"]');
    this.workExpFromYrInput = page.locator('#workExpFromYr, input[name="workExpFromYr"]');
    this.workExpToYrInput = page.locator('#workExpToYr, input[name="workExpToYr"]');
    this.isCurrentCompanyCheckbox = page.locator('#isCurrentCompany');
    this.isCurrentCompanyLabel = page.locator('label[for="isCurrentCompany"]');
    this.saveWorkExpButton = this.workExpForm.locator('button').filter({ hasText: /save/i });

    // Education Locators
    this.institutionNameInput = page.locator('#institutionName, input[name="institutionName"]');
    this.eduDegreeInput = page.locator('#eduDegree, input[name="degree"]');
    this.eduFromYrInput = page.locator('#eduFromYr, input[name="eduFromYr"]');
    this.eduToYrInput = page.locator('#eduToYr, input[name="eduToYr"]');
    this.saveEducationButton = this.educationForm.locator('button').filter({ hasText: /save/i });

    // Field of Studies Locators
    this.studySubInput = page.locator('#studySub, input[name="studySub"]');
    this.saveFieldOfStudiesButton = this.fieldOfStudiesForm.locator('button').filter({ hasText: /save/i });

    // Card & Action Locators
    this.editCardIcon = this.workExpForm.locator('img, svg, .edit-icon, [class*="edit"]').first();
    this.editFieldOfStudiesCardIcon = this.fieldOfStudiesForm.locator('img, svg, .edit-icon, [class*="edit"]').first();
    this.cancelEditButton = page.locator('button').filter({ hasText: /^cancel$/i }).first();
    this.deleteExpButton = page.locator('button').filter({ hasText: /^delete$/i }).first();
    this.addMoreButton = page.locator('a, button, [role="button"]').filter({ hasText: /^add more$/i }).first();

    // Delete Confirmation Modal Locators
    this.deleteConfirmModal = page.locator('.modal, .swal2-popup, .modal-dialog, [role="dialog"]').filter({ hasText: /are you sure you want to delete/i }).first();
    this.deleteModalText = page.getByText('Are you sure you want to delete?', { exact: false }).first();
    this.deleteModalConfirmButton = page.locator('.modal, .swal2-popup, [role="dialog"], .modal-content').locator('button').filter({ hasText: /^delete$/i }).first();
    this.deleteModalCancelButton = page.locator('.modal, .swal2-popup, [role="dialog"], .modal-content').locator('button').filter({ hasText: /^cancel$/i }).first();

    // Feedback Locators
    this.toastNotification = page.locator('.toast, .alert, .toast-message, [role="alert"]').first();
    this.errorMessage = page.locator('.invalid-feedback, .error-message, .alert-danger').first();
  }

  /**
   * Fills out the Work Experience form fields.
   */
  async fillWorkExperience(data: {
    jobTitle?: string;
    companyName?: string;
    workExpFromYr?: string;
    workExpToYr?: string;
    isCurrentCompany?: boolean;
  }) {
    if (data.jobTitle !== undefined) {
      await this.fillText(this.jobTitleInput, data.jobTitle, 'Job Title');
    }
    if (data.companyName !== undefined) {
      await this.fillText(this.companyNameInput, data.companyName, 'Company Name');
    }
    if (data.workExpFromYr !== undefined) {
      await this.fillText(this.workExpFromYrInput, data.workExpFromYr, 'Work Experience From Year');
    }
    if (data.workExpToYr !== undefined) {
      await this.fillText(this.workExpToYrInput, data.workExpToYr, 'Work Experience To Year');
    }
    if (data.isCurrentCompany !== undefined) {
      const isChecked = await this.isCurrentCompanyCheckbox.isChecked();
      if (isChecked !== data.isCurrentCompany) {
        await this.isCurrentCompanyCheckbox.click();
      }
    }
  }

  /**
   * Clicks Save button inside Work Experience form.
   */
  async saveWorkExperience() {
    await this.clickElement(this.saveWorkExpButton, 'Save Work Experience Button');
  }

  /**
   * Clears all fields in Work Experience form.
   */
  async clearWorkExperience() {
    await this.jobTitleInput.fill('');
    await this.companyNameInput.fill('');
    await this.workExpFromYrInput.fill('');
    await this.workExpToYrInput.fill('');
    if (await this.isCurrentCompanyCheckbox.isChecked()) {
      await this.isCurrentCompanyCheckbox.click();
    }
  }

  /**
   * Fills out the Education form fields.
   */
  async fillEducation(data: {
    institutionName?: string;
    eduDegree?: string;
    eduFromYr?: string;
    eduToYr?: string;
  }) {
    if (data.institutionName !== undefined) {
      await this.fillText(this.institutionNameInput, data.institutionName, 'Institution Name');
    }
    if (data.eduDegree !== undefined) {
      await this.fillText(this.eduDegreeInput, data.eduDegree, 'Degree');
    }
    if (data.eduFromYr !== undefined) {
      await this.fillText(this.eduFromYrInput, data.eduFromYr, 'Education From Year');
    }
    if (data.eduToYr !== undefined) {
      await this.fillText(this.eduToYrInput, data.eduToYr, 'Education To Year');
    }
  }

  /**
   * Clicks Save button inside Education form.
   */
  async saveEducation() {
    await this.clickElement(this.saveEducationButton, 'Save Education Button');
  }

  /**
   * Clears all fields in Education form.
   */
  async clearEducation() {
    await this.institutionNameInput.fill('');
    await this.eduDegreeInput.fill('');
    await this.eduFromYrInput.fill('');
    await this.eduToYrInput.fill('');
  }

  /**
   * Fills out the Field of Studies form.
   */
  async fillFieldOfStudies(data: { studySub?: string }) {
    if (data.studySub !== undefined) {
      await this.fillText(this.studySubInput, data.studySub, 'Field of Study');
    }
  }

  /**
   * Clicks Save button inside Field of Studies form.
   */
  async saveFieldOfStudies() {
    await this.clickElement(this.saveFieldOfStudiesButton, 'Save Field of Studies Button');
  }

  /**
   * Clears Field of Studies input.
   */
  async clearFieldOfStudies() {
    await this.studySubInput.fill('');
  }

  /**
   * Gets attributes of all inputs in the Work & Education forms.
   */
  async getFieldAttributes() {
    return {
      jobTitlePlaceholder: await this.jobTitleInput.getAttribute('placeholder'),
      companyNamePlaceholder: await this.companyNameInput.getAttribute('placeholder'),
      workExpFromYrMaxLength: await this.workExpFromYrInput.getAttribute('maxlength'),
      workExpToYrMaxLength: await this.workExpToYrInput.getAttribute('maxlength'),
      institutionNamePlaceholder: await this.institutionNameInput.getAttribute('placeholder'),
      eduDegreePlaceholder: await this.eduDegreeInput.getAttribute('placeholder'),
      eduFromYrMaxLength: await this.eduFromYrInput.getAttribute('maxlength'),
      eduToYrMaxLength: await this.eduToYrInput.getAttribute('maxlength'),
      studySubPlaceholder: await this.studySubInput.getAttribute('placeholder'),
    };
  }

  /**
   * Returns a Locator for error validation messages matching text or generic error elements.
   */
  getErrorMessage(expectedText?: string): Locator {
    if (expectedText) {
      return this.page.locator('.invalid-feedback, .error-message, .alert-danger, .error, [role="alert"]').filter({ hasText: expectedText }).first();
    }
    return this.errorMessage;
  }

  /**
   * Clicks edit button on saved card.
   */
  async clickEditCard() {
    await this.clickElement(this.editCardIcon, 'Edit Card Icon');
  }

  /**
   * Clicks edit button on Field of Studies saved card.
   */
  async clickEditFieldOfStudiesCard() {
    await this.clickElement(this.editFieldOfStudiesCardIcon, 'Edit Field of Studies Card Icon');
  }

  /**
   * Clicks Cancel button while in edit mode.
   */
  async clickCancelEdit() {
    await this.clickElement(this.cancelEditButton, 'Cancel Edit Button');
  }

  /**
   * Clicks Delete button inside edit mode.
   */
  async clickDeleteCard() {
    await this.clickElement(this.deleteExpButton, 'Delete Experience Button');
  }

  /**
   * Clicks Delete button on the confirmation modal.
   */
  async confirmDeleteModal() {
    await this.clickElement(this.deleteModalConfirmButton, 'Confirm Delete Modal Button');
  }

  /**
   * Clicks Cancel button on the confirmation modal.
   */
  async cancelDeleteModal() {
    await this.clickElement(this.deleteModalCancelButton, 'Cancel Delete Modal Button');
  }

  /**
   * Clicks the "Add more" link to open the new entry form.
   */
  async clickAddMore() {
    await this.clickElement(this.addMoreButton, 'Add More Link');
  }
}


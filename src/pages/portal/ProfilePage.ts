import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProfilePage extends BasePage {
  readonly profileHeader: Locator;
  readonly profileTitle: Locator;

  // Sidebar Tab Locators
  readonly profileTab: Locator;
  readonly enrollmentDetailsTab: Locator;
  readonly idAccessInfoTab: Locator;
  readonly workEducationTab: Locator;
  readonly contactTab: Locator;
  readonly passwordTab: Locator;

  // Header & Avatar Locators
  readonly profileImage: Locator;
  readonly profileImageUploadTrigger: Locator;
  readonly fileInput: Locator;
  readonly profileTitleName: Locator;
  readonly profileTitleEmail: Locator;

  // Basic Details Section Locators
  readonly basicDetailsHeading: Locator;
  readonly editButton: Locator;
  readonly fullNameInput: Locator;
  readonly genderSelect: Locator;
  readonly dobInput: Locator;
  readonly summaryInput: Locator;
  readonly emailSubscriptionCheckbox: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Legacy & Feedback Locators
  readonly departmentInput: Locator;
  readonly designationInput: Locator;
  readonly degreeInput: Locator;
  readonly phoneInput: Locator;
  readonly successToast: Locator;
  readonly toastNotification: Locator;

  constructor(page: Page) {
    super(page);
    // Generic resilient locators for the Profile page
    this.profileHeader = page.locator('.profile-tab-content-wrapper, .container, body').first();
    this.profileTitle = page.locator('h1, h2, h3, .profile-title, .page-header').filter({ hasText: /profile/i }).first();

    // Navigation Tabs
    this.profileTab = page.locator('a[data-rr-ui-event-key="Profile"]');
    this.enrollmentDetailsTab = page.locator('a[data-rr-ui-event-key="Enrollment Details"]');
    this.idAccessInfoTab = page.locator('a[data-rr-ui-event-key="Id & Access Info"]');
    this.workEducationTab = page.locator('a[data-rr-ui-event-key="Work & Education"]');
    this.contactTab = page.locator('a[data-rr-ui-event-key="Contact"]');
    this.passwordTab = page.locator('a[data-rr-ui-event-key="Password"]');

    // Header Details & Profile Image
    this.profileImage = page.locator('.profile-img');
    this.profileImageUploadTrigger = page.locator('.profile-img-cicon-wrapper');
    this.fileInput = page.locator('input[type="file"]');
    this.profileTitleName = page.locator('.profile-title-name');
    this.profileTitleEmail = page.locator('.profile-title-email');

    // Basic Details Form Locators
    this.basicDetailsHeading = page.locator('.profile-form-content-heading').filter({ hasText: /basic details/i });
    this.editButton = page.locator('.edit-btn').or(page.getByRole('button', { name: /edit/i })).first();
    this.fullNameInput = page.locator('#userName');
    this.genderSelect = page.locator('#gender');
    this.dobInput = page.locator('.custom-date-picker input');
    this.summaryInput = page.locator('#about');
    this.emailSubscriptionCheckbox = page.locator('#Email\\ subscription, input[name="isSubscribed"]').first();

    // Action buttons & Feedback
    this.saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update"), .btn-save').first();
    this.cancelButton = page.locator('button:has-text("Cancel")').first();
    this.successToast = page.locator('.toast-success, .alert-success, .success-message, [role="alert"]').first();
    this.toastNotification = page.locator('.toast, .toast-message, .alert, [role="alert"]').first();

    // Legacy fields for backward compatibility
    this.departmentInput = page.locator('#department, input[name="department"]').first();
    this.designationInput = page.locator('#designation, input[name="designation"]').first();
    this.degreeInput = page.locator('#degree, input[name="degree"]').first();
    this.phoneInput = page.locator('#phone, #mobile, input[name="mobile"], input[name="phone"]').first();
  }

  /**
   * Navigates directly to the user profile URL.
   */
  async navigateToProfile() {
    const portalUrl = process.env.PORTAL_URL || 'https://qa-qatesting-v2.knimbus.com/portal/v2/default/home';
    const profileUrl = portalUrl.replace(/\/home\/?$/, '/profile');
    console.log(`Navigating to profile URL: ${profileUrl}`);
    await this.page.goto(profileUrl);
  }

  /**
   * Clicks the specified profile navigation tab by name.
   */
  async clickTab(tabName: 'Profile' | 'Enrollment Details' | 'Id & Access Info' | 'Work & Education' | 'Contact' | 'Password') {
    const tabLocator = this.page.locator(`a[data-rr-ui-event-key="${tabName}"]`);
    await this.clickElement(tabLocator, `${tabName} Tab`);
  }

  /**
   * Clicks the Edit Profile button if it exists and is visible.
   */
  async clickEdit() {
    if (await this.editButton.isVisible()) {
      await this.clickElement(this.editButton, 'Edit Basic Details Button');
    }
  }

  /**
   * Checks whether all Basic Details form fields are currently disabled/read-only.
   */
  async areBasicFieldsDisabled(): Promise<{ fullName: boolean; gender: boolean; dob: boolean; summary: boolean; emailSub: boolean }> {
    return {
      fullName: await this.fullNameInput.isDisabled(),
      gender: await this.genderSelect.isDisabled(),
      dob: await this.dobInput.isDisabled(),
      summary: await this.summaryInput.isDisabled(),
      emailSub: await this.emailSubscriptionCheckbox.isDisabled(),
    };
  }

  /**
   * Fills basic profile details (Gender, Summary, Email Subscription, etc.)
   */
  async updateBasicDetails(data: { gender?: string; summary?: string; emailSubscribed?: boolean; dob?: string }) {
    await this.clickEdit();

    if (data.gender && await this.genderSelect.isEnabled()) {
      await this.genderSelect.selectOption(data.gender);
    }

    if (data.summary !== undefined && await this.summaryInput.isEnabled()) {
      await this.fillText(this.summaryInput, data.summary, 'Summary Textarea');
    }

    if (data.emailSubscribed !== undefined && await this.emailSubscriptionCheckbox.isEnabled()) {
      const isChecked = await this.emailSubscriptionCheckbox.isChecked();
      if (isChecked !== data.emailSubscribed) {
        await this.emailSubscriptionCheckbox.click();
      }
    }

    if (data.dob && await this.dobInput.isEnabled()) {
      await this.fillText(this.dobInput, data.dob, 'Date of Birth Input');
    }
  }

  /**
   * Submits profile changes by clicking the Save/Update button.
   */
  async saveProfile() {
    if (await this.saveButton.isVisible() && await this.saveButton.isEnabled()) {
      await this.clickElement(this.saveButton, 'Save Profile Button');
    }
  }

  /**
   * Uploads a profile image given an absolute file path.
   */
  async uploadProfileImage(filePath: string) {
    if (await this.fileInput.count() > 0) {
      await this.fileInput.setInputFiles(filePath);
    } else {
      const fileChooserPromise = this.page.waitForEvent('filechooser');
      await this.profileImageUploadTrigger.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(filePath);
    }
  }

  /**
   * Legacy method maintained for backward compatibility.
   */
  async updateProfileDetails(data: { department?: string; designation?: string; degree?: string; phone?: string }) {
    await this.clickEdit();

    if (data.department && await this.departmentInput.isVisible()) {
      await this.fillText(this.departmentInput, data.department, 'Department Input');
    }
    if (data.designation && await this.designationInput.isVisible()) {
      await this.fillText(this.designationInput, data.designation, 'Designation Input');
    }
    if (data.degree && await this.degreeInput.isVisible()) {
      await this.fillText(this.degreeInput, data.degree, 'Degree Input');
    }
    if (data.phone && await this.phoneInput.isVisible()) {
      await this.fillText(this.phoneInput, data.phone, 'Phone Input');
    }
  }
}

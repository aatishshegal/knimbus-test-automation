import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProfilePage extends BasePage {
  readonly profileHeader: Locator;
  readonly editBtn: Locator;
  
  // Sidebar Tabs
  readonly navProfile: Locator;
  readonly navEnrollmentDetails: Locator;
  readonly navIdAccessInfo: Locator;
  readonly navWorkEducation: Locator;
  readonly navContact: Locator;
  readonly navPassword: Locator;

  // Basic Details Fields
  readonly fullNameInput: Locator;
  readonly genderDropdown: Locator;
  readonly dobInput: Locator;
  readonly summaryTextarea: Locator;
  readonly emailSubscriptionCheckbox: Locator;
  readonly saveBtn: Locator;
  readonly cancelBtn: Locator;
  
  // Calendar / Datepicker
  readonly calendarPopup: Locator;
  readonly calendarYearDropdown: Locator;
  readonly calendarMonthDropdown: Locator;
  readonly calendarPrevMonthBtn: Locator;
  readonly calendarNextMonthBtn: Locator;
  readonly calendarDayCells: Locator;
  readonly calendarCurrentMonthLabel: Locator;
  
  readonly imageUploadInput: Locator;
  readonly imageModalSaveBtn: Locator;
  readonly profileImage: Locator;
  readonly imageUploadErrorMsg: Locator;
  readonly toastMessage: Locator;
  readonly profileImgEditIcon: Locator;

  constructor(page: Page) {
    super(page);
    this.profileHeader = page.locator('.main-content, .container, body').first();
    this.editBtn = page.locator('.edit-btn');
    
    // Sidebar Tabs
    this.navProfile = page.getByRole('tab', { name: 'Profile Personal information' });
    this.navEnrollmentDetails = page.getByRole('tab', { name: 'Enrollment Details Manage designation, rank and more' });
    this.navIdAccessInfo = page.getByRole('tab', { name: 'Id & Access Info Update id card, off-campus access and more' });
    this.navWorkEducation = page.getByRole('tab', { name: 'Work & Education Field of study, work exp. and more' });
    this.navContact = page.getByRole('tab', { name: 'Contact Manage mobile, address and more' });
    this.navPassword = page.getByRole('tab', { name: 'Password Update password' });

    // Basic Details Locators
    this.fullNameInput = page.locator('input[name="userName"]');
    this.genderDropdown = page.locator('select[name="gender"]');
    // Using nth(1) if there's multiple date pickers, or specific class
    this.dobInput = page.locator('.custom-date-picker input'); 
    this.summaryTextarea = page.locator('textarea[name="about"]');
    this.emailSubscriptionCheckbox = page.locator('input[name="isSubscribed"]');
    
    // Save/Cancel (appear after clicking Edit)
    this.saveBtn = page.getByRole('button', { name: 'Save' });
    this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
    
    // Image Upload
    this.imageUploadInput = page.locator('input[type="file"]');
    this.profileImgEditIcon = page.locator('.profile-img-cicon-wrapper');
    this.imageModalSaveBtn = page.locator('.modal-footer button.btn-primary').filter({ hasText: 'Save' });
    this.profileImage = page.locator('.profile-img');

    // Calendar / Datepicker
    this.calendarPopup = page.locator('.react-datepicker');
    this.calendarYearDropdown = page.locator('.react-datepicker__year-select');
    this.calendarMonthDropdown = page.locator('.react-datepicker__month-select');
    this.calendarPrevMonthBtn = page.locator('.react-datepicker__navigation--previous');
    this.calendarNextMonthBtn = page.locator('.react-datepicker__navigation--next');
    this.calendarDayCells = page.locator('.react-datepicker__day:not(.react-datepicker__day--outside-month)');
    this.calendarCurrentMonthLabel = page.locator('.react-datepicker__current-month');
    this.imageUploadErrorMsg = page.locator('.profile-form-errortxt');
    // Many UI libraries use role='alert' or role='heading' for toasts
    this.toastMessage = page.locator('.Toastify__toast-body, .toast-message, .msg-container, [role="alert"], [role="status"], .toast-body').filter({ hasText: /update|success|error|saved/i }).first();
  }

  async clickEdit() {
    await this.editBtn.click();
  }

  async clickSave() {
    await this.saveBtn.click();
  }
}

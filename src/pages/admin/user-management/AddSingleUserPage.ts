import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from '../AdminBasePage';

export interface UserRegistrationData {
    userName: string;
    email: string;
    alternateEmail?: string;
    mobile?: string;
    userType?: string;
    gender?: string;
    dob?: string;
    staffId?: string;
    affiliation?: string;
    department?: string;
    degree?: string;
    designation?: string;
    speciality?: string;
    rank?: string;
    batch?: string;
    cadre?: string;
    admissionYear?: string;
    membershipStatus?: string;
    membershipType?: string;
    serviceGroup?: string;
    contentGroup?: string;
}

export class AddSingleUserPage extends AdminBasePage {
    // Header & Layout
    readonly breadcrumb: Locator;
    readonly pageTitle: Locator;
    readonly headerIcon: Locator;
    readonly subtitle: Locator;

    // Section Headings
    readonly requiredDetailsHeading: Locator;
    readonly basicDetailsHeading: Locator;
    readonly enrollmentDetailsHeading: Locator;
    readonly groupDetailsHeading: Locator;

    // Side Banner (Bulk Upload Promo)
    readonly bulkPromoCard: Locator;
    readonly bulkPromoImage: Locator;
    readonly bulkPromoHeading: Locator;
    readonly bulkPromoDescription: Locator;
    readonly bulkPromoLink: Locator;

    // Required Details Inputs & Errors
    readonly userNameInput: Locator;
    readonly userNameError: Locator;
    readonly emailInput: Locator;
    readonly emailError: Locator;

    // Basic Details Inputs & Errors
    readonly alternateEmailInput: Locator;
    readonly alternateEmailError: Locator;
    readonly mobileInput: Locator;
    readonly mobileError: Locator;
    readonly userTypeSelect: Locator;
    readonly genderSelect: Locator;
    readonly dobInput: Locator;
    readonly dobCalendarPopup: Locator;
    readonly dobDisabledDays: Locator;
    readonly dobActiveDays: Locator;

    // Enrollment Details Inputs & Errors
    readonly staffIdInput: Locator;
    readonly staffIdError: Locator;
    readonly staffIdHelper: Locator;
    readonly affiliationInput: Locator;
    readonly affiliationError: Locator;
    readonly departmentInput: Locator;
    readonly departmentError: Locator;
    readonly degreeInput: Locator;
    readonly degreeError: Locator;
    readonly designationInput: Locator;
    readonly designationError: Locator;
    readonly specialityInput: Locator;
    readonly specialityError: Locator;
    readonly rankInput: Locator;
    readonly rankError: Locator;
    readonly batchInput: Locator;
    readonly batchError: Locator;
    readonly cadreInput: Locator;
    readonly cadreError: Locator;
    readonly yearInput: Locator;
    readonly yearError: Locator;
    readonly membershipStatusInput: Locator;
    readonly membershipStatusError: Locator;
    readonly membershipTypeInput: Locator;
    readonly membershipTypeError: Locator;

    // Group Details
    readonly contentGroupInput: Locator;
    readonly contentGroupDropdown: Locator;
    readonly contentGroupSelectAllBtn: Locator;
    readonly contentGroupClearAllBtn: Locator;
    readonly contentGroupOptions: Locator;

    // Legacy Support (Backward Compatibility)
    readonly serviceGroupSelect: Locator;

    // Form Submission & Feedback
    readonly saveBtn: Locator;
    readonly toast: Locator;

    constructor(page: Page) {
        super(page);

        // Header & Layout
        this.breadcrumb = page.locator('.db-breadcrumb .menu-label-breadcrumb');
        this.pageTitle = page.locator('.db-breadcrumb .menu-label-name');
        this.headerIcon = page.locator('.db-breadcrumb .menu-label-icon svg[data-icon="user-plus"]');
        this.subtitle = page.getByText('Seamlessly create and register individual user accounts', { exact: false });

        // Section Headings
        this.requiredDetailsHeading = page.locator('.db-white-container-heading').filter({ hasText: 'Required details' });
        this.basicDetailsHeading = page.locator('.db-white-container-heading').filter({ hasText: 'Basic details' });
        this.enrollmentDetailsHeading = page.locator('.db-white-container-heading').filter({ hasText: 'Enrollment details' });
        this.groupDetailsHeading = page.locator('.db-white-container-heading').filter({ hasText: 'Group details' });

        // Side Banner
        this.bulkPromoCard = page.locator('.feature-promo');
        this.bulkPromoImage = page.locator('.feature-promo img');
        this.bulkPromoHeading = page.locator('.feature-promo p.title');
        this.bulkPromoDescription = page.locator('.feature-promo p.sub-title');
        this.bulkPromoLink = page.locator('.feature-promo a.btn-outline-success');

        // Required Details
        this.userNameInput = page.locator('input#userName');
        this.userNameError = page.locator('div:has(> .form-floating > #userName) .profile-form-errortxt');
        this.emailInput = page.locator('input#email');
        this.emailError = page.locator('div:has(> .form-floating > #email) .profile-form-errortxt');

        // Basic Details
        this.alternateEmailInput = page.locator('input#alternateEmail');
        this.alternateEmailError = page.locator('div:has(> .form-floating > #alternateEmail) .profile-form-errortxt');
        this.mobileInput = page.locator('input[name="contactNos"]');
        this.mobileError = page.locator('div:has(> .form-floating > input[name="contactNos"]) .profile-form-errortxt');
        this.userTypeSelect = page.locator('select#userType');
        this.genderSelect = page.locator('select#gender');
        this.dobInput = page.locator('input[name="dob"]');
        this.dobCalendarPopup = page.locator('.react-datepicker');
        this.dobDisabledDays = page.locator('.react-datepicker__day--disabled');
        this.dobActiveDays = page.locator('.react-datepicker__day:not(.react-datepicker__day--disabled)');

        // Enrollment Details
        this.staffIdInput = page.locator('input#staffId');
        this.staffIdError = page.locator('div:has(> .form-floating > #staffId) .profile-form-errortxt');
        this.staffIdHelper = page.locator('div.text-secondary.ft-12').filter({ hasText: 'Example: Membership / Student / Staff ID' });
        this.affiliationInput = page.locator('input#affiliation');
        this.affiliationError = page.locator('div:has(> .form-floating > #affiliation) .profile-form-errortxt');
        this.departmentInput = page.locator('input#department');
        this.departmentError = page.locator('div:has(> .form-floating > #department) .profile-form-errortxt');
        this.degreeInput = page.locator('input#degree');
        this.degreeError = page.locator('div:has(> .form-floating > #degree) .profile-form-errortxt');
        this.designationInput = page.locator('input#designation');
        this.designationError = page.locator('div:has(> .form-floating > #designation) .profile-form-errortxt');
        this.specialityInput = page.locator('input#speciality');
        this.specialityError = page.locator('div:has(> .form-floating > #speciality) .profile-form-errortxt');
        this.rankInput = page.locator('input#rank');
        this.rankError = page.locator('div:has(> .form-floating > #rank) .profile-form-errortxt');
        this.batchInput = page.locator('input[name="batch"]');
        this.batchError = page.locator('div:has(> .form-floating > input[name="batch"]) .profile-form-errortxt');
        this.cadreInput = page.locator('input#cadre');
        this.cadreError = page.locator('div:has(> .form-floating > #cadre) .profile-form-errortxt');
        this.yearInput = page.locator('input#year');
        this.yearError = page.locator('div:has(> .form-floating > #year) .profile-form-errortxt');
        this.membershipStatusInput = page.locator('input#membershipStatus');
        this.membershipStatusError = page.locator('div:has(> .form-floating > #membershipStatus) .profile-form-errortxt');
        this.membershipTypeInput = page.locator('input#membershipType');
        this.membershipTypeError = page.locator('div:has(> .form-floating > #membershipType) .profile-form-errortxt');

        // Group Details
        this.contentGroupInput = page.locator('#content-group');
        this.contentGroupDropdown = page.locator('.multi-dropdown');
        this.contentGroupSelectAllBtn = page.locator('.multi-dropdown button').filter({ hasText: 'Select all' });
        this.contentGroupClearAllBtn = page.locator('.multi-dropdown button').filter({ hasText: 'Clear all' });
        this.contentGroupOptions = page.locator('.multi-dropdown button.option-item');

        // Legacy compatibility
        this.serviceGroupSelect = page.locator('select#serviceGroup');

        // Submission & Feedback
        this.saveBtn = page.locator('button.btn-primary').filter({ hasText: 'Save' });
        this.toast = page.locator('.swal2-toast, .swal2-popup');
    }

    async fillRegistrationForm(userData: {
        userName: string;
        email: string;
        userType?: string;
        gender?: string;
        serviceGroup?: string;
        alternateEmail?: string;
        mobile?: string;
    }) {
        await this.userNameInput.waitFor({ state: 'visible' });
        await this.userNameInput.fill(userData.userName);
        await this.emailInput.fill(userData.email);

        if (userData.alternateEmail) {
            await this.alternateEmailInput.fill(userData.alternateEmail);
        }
        if (userData.mobile) {
            await this.mobileInput.fill(userData.mobile);
        }
        if (userData.userType) {
            await this.userTypeSelect.selectOption({ label: userData.userType });
        }
        if (userData.gender) {
            await this.genderSelect.selectOption({ label: userData.gender });
        }
    }

    async fillAllEnrollmentDetails(details: {
        staffId?: string;
        affiliation?: string;
        department?: string;
        degree?: string;
        designation?: string;
        speciality?: string;
        rank?: string;
        batch?: string;
        cadre?: string;
        admissionYear?: string;
        membershipStatus?: string;
        membershipType?: string;
    }) {
        if (details.staffId) await this.staffIdInput.fill(details.staffId);
        if (details.affiliation) await this.affiliationInput.fill(details.affiliation);
        if (details.department) await this.departmentInput.fill(details.department);
        if (details.degree) await this.degreeInput.fill(details.degree);
        if (details.designation) await this.designationInput.fill(details.designation);
        if (details.speciality) await this.specialityInput.fill(details.speciality);
        if (details.rank) await this.rankInput.fill(details.rank);
        if (details.batch) await this.batchInput.fill(details.batch);
        if (details.cadre) await this.cadreInput.fill(details.cadre);
        if (details.admissionYear) await this.yearInput.fill(details.admissionYear);
        if (details.membershipStatus) await this.membershipStatusInput.fill(details.membershipStatus);
        if (details.membershipType) await this.membershipTypeInput.fill(details.membershipType);
    }

    async openContentGroupDropdown() {
        if (!(await this.contentGroupDropdown.isVisible())) {
            await this.contentGroupInput.click();
            await this.contentGroupDropdown.waitFor({ state: 'visible' });
        }
    }

    async selectContentGroupByName(groupName: string) {
        await this.openContentGroupDropdown();
        const option = this.contentGroupOptions.filter({ hasText: groupName }).first();
        await option.click();
    }

    async selectAllContentGroups() {
        await this.openContentGroupDropdown();
        await this.contentGroupSelectAllBtn.click();
    }

    async clearAllContentGroups() {
        await this.openContentGroupDropdown();
        await this.contentGroupClearAllBtn.click();
    }

    async openDobCalendar() {
        if (!(await this.dobCalendarPopup.isVisible())) {
            await this.dobInput.click();
            await this.dobCalendarPopup.waitFor({ state: 'visible' });
        }
    }

    async selectPastDateInCalendar() {
        await this.openDobCalendar();
        const selectableDay = this.dobActiveDays.first();
        await selectableDay.click();
    }

    async submitForm() {
        await this.saveBtn.click();
    }

    async dismissAnyOpenPopups() {
        await this.page.keyboard.press('Escape');
    }

    async clearAllInputs() {
        await this.userNameInput.clear();
        await this.emailInput.clear();
        await this.alternateEmailInput.clear();
        await this.mobileInput.clear();
        await this.userTypeSelect.selectOption({ index: 0 });
        await this.genderSelect.selectOption({ index: 0 });
        await this.staffIdInput.clear();
        await this.affiliationInput.clear();
        await this.departmentInput.clear();
        await this.degreeInput.clear();
        await this.designationInput.clear();
        await this.specialityInput.clear();
        await this.rankInput.clear();
        await this.batchInput.clear();
        await this.cadreInput.clear();
        await this.yearInput.clear();
        await this.membershipStatusInput.clear();
        await this.membershipTypeInput.clear();
        await this.dismissAnyOpenPopups();
    }

    async navigateIfNotCurrent(expectedSubUrl: string) {
        if (!this.page.url().includes(expectedSubUrl)) {
            await this.page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${expectedSubUrl}`);
            await this.page.waitForLoadState('domcontentloaded');
        }
    }
}

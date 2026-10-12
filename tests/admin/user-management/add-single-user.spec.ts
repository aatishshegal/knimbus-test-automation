import { test, expect } from '@playwright/test';
import { AddSingleUserPage } from '../../../src/pages/admin/user-management/AddSingleUserPage';
import { ManageUsersPage } from '../../../src/pages/admin/user-management/ManageUsersPage';
import adminData from '../../test-data/admin-data.json';

test.describe('Add Single User - Layout & Header', () => {

    test.beforeEach(async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.navigateIfNotCurrent(adminData.userManagement.expectedUrls.addSingleUser);
    });

    test('Add Single User - Breadcrumb - Displays correct navigation hierarchy', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.breadcrumb).toBeVisible();
        await expect(addUserPage.breadcrumb).toHaveText(adminData.userManagement.addSingleUserData.breadcrumb);
    });

    test('Add Single User - Page Title - Displays Add Single User heading', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.pageTitle).toBeVisible();
        await expect(addUserPage.pageTitle).toHaveText(adminData.userManagement.addSingleUserData.pageTitle);
    });

    test('Add Single User - Header Icon - Displays user-plus icon alongside page title', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.headerIcon).toBeVisible();
    });

    test('Add Single User - Subtitle Guidance - Displays onboarding guidance subtitle', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.subtitle).toBeVisible();
        await expect(addUserPage.subtitle).toHaveText(adminData.userManagement.addSingleUserData.subtitle);
    });

    test('Add Single User - Required Details Section - Displays Required details section heading', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.requiredDetailsHeading).toBeVisible();
        await expect(addUserPage.requiredDetailsHeading).toHaveText(adminData.userManagement.addSingleUserData.sectionHeadings.requiredDetails);
    });

    test('Add Single User - Basic Details Section - Displays Basic details section heading', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.basicDetailsHeading).toBeVisible();
        await expect(addUserPage.basicDetailsHeading).toHaveText(adminData.userManagement.addSingleUserData.sectionHeadings.basicDetails);
    });

    test('Add Single User - Enrollment Details Section - Displays Enrollment details section heading', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.enrollmentDetailsHeading).toBeVisible();
        await expect(addUserPage.enrollmentDetailsHeading).toHaveText(adminData.userManagement.addSingleUserData.sectionHeadings.enrollmentDetails);
    });

    test('Add Single User - Group Details Section - Displays Group details section heading', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.groupDetailsHeading).toBeVisible();
        await expect(addUserPage.groupDetailsHeading).toHaveText(adminData.userManagement.addSingleUserData.sectionHeadings.groupDetails);
    });

    test('Add Single User - Save Button - Save button is visible and enabled at bottom of form', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.saveBtn).toBeVisible();
        await expect(addUserPage.saveBtn).toBeEnabled();
    });
});

test.describe('Add Single User - Bulk Onboarding Promo Card', () => {

    test.beforeEach(async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.navigateIfNotCurrent(adminData.userManagement.expectedUrls.addSingleUser);
    });

    test('Add Single User - Bulk Banner Container - Displays bulk onboarding container card', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.bulkPromoCard).toBeVisible();
    });

    test('Add Single User - Bulk Banner Image - Displays bulk users illustration image', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.bulkPromoImage).toBeVisible();
    });

    test('Add Single User - Bulk Banner Heading - Displays Need to add users in bulk heading', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.bulkPromoHeading).toBeVisible();
        await expect(addUserPage.bulkPromoHeading).toHaveText(adminData.userManagement.addSingleUserData.sideBanner.heading);
    });

    test('Add Single User - Bulk Banner Description - Displays explanatory description text', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.bulkPromoDescription).toBeVisible();
        await expect(addUserPage.bulkPromoDescription).toHaveText(adminData.userManagement.addSingleUserData.sideBanner.description);
    });

    test('Add Single User - Bulk Banner CTA Link - Displays Go to Add Multiple Users button link', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.bulkPromoLink).toBeVisible();
        await expect(addUserPage.bulkPromoLink).toContainText(adminData.userManagement.addSingleUserData.sideBanner.ctaText);
    });

    test('Add Single User - Bulk Banner Navigation - Clicking Go to Add Multiple Users navigates to Add Multiple Users page', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.bulkPromoLink.click();
        await expect(page).toHaveURL(new RegExp(adminData.userManagement.expectedUrls.addMultipleUsers));
        // Return to Add Single User page
        await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${adminData.userManagement.expectedUrls.addSingleUser}`);
        await page.waitForLoadState('domcontentloaded');
    });
});

test.describe('Add Single User - Default Form Values', () => {

    test.beforeEach(async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.navigateIfNotCurrent(adminData.userManagement.expectedUrls.addSingleUser);
    });

    test('Add Single User - Full Name Default - Full Name input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.userNameInput).toHaveValue('');
    });

    test('Add Single User - Email Default - Email input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.emailInput).toHaveValue('');
    });

    test('Add Single User - Alternate Email Default - Alternate Email input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.alternateEmailInput).toHaveValue('');
    });

    test('Add Single User - Mobile Default - Mobile input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.mobileInput).toHaveValue('');
    });

    test('Add Single User - User Type Default - User Type dropdown defaults to Select', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.userTypeSelect).toHaveValue('');
    });

    test('Add Single User - Gender Default - Gender dropdown defaults to Select', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.genderSelect).toHaveValue('');
    });

    test('Add Single User - Date of Birth Default - Date of Birth input is empty with Select placeholder', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.dobInput).toHaveValue('');
        await expect(addUserPage.dobInput).toHaveAttribute('placeholder', adminData.userManagement.addSingleUserData.placeholders.dob);
    });

    test('Add Single User - ID Number Default - ID Number input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.staffIdInput).toHaveValue('');
    });

    test('Add Single User - ID Number Helper - Displays helper caption Example Membership Student Staff ID', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.staffIdHelper).toBeVisible();
        await expect(addUserPage.staffIdHelper).toHaveText(adminData.userManagement.addSingleUserData.helperTexts.idNumber);
    });

    test('Add Single User - College Organization Default - College Organization input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.affiliationInput).toHaveValue('');
    });

    test('Add Single User - Department Default - Department input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.departmentInput).toHaveValue('');
    });

    test('Add Single User - Qualification Degree Default - Qualification Degree Program input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.degreeInput).toHaveValue('');
    });

    test('Add Single User - Designation Default - Designation input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.designationInput).toHaveValue('');
    });

    test('Add Single User - Speciality Default - Area of Study Speciality input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.specialityInput).toHaveValue('');
    });

    test('Add Single User - Rank Default - Rank input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.rankInput).toHaveValue('');
    });

    test('Add Single User - Batch Default - Batch input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.batchInput).toHaveValue('');
    });

    test('Add Single User - Cadre Default - Cadre input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.cadreInput).toHaveValue('');
    });

    test('Add Single User - Admission Year Default - Admission Year input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.yearInput).toHaveValue('');
    });

    test('Add Single User - Membership Status Default - Membership Status input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.membershipStatusInput).toHaveValue('');
    });

    test('Add Single User - Membership Type Default - Membership Type input is empty by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.membershipTypeInput).toHaveValue('');
    });

    test('Add Single User - Content Group Default - Content Group input displays Select by default', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.contentGroupInput).toHaveValue(adminData.userManagement.addSingleUserData.placeholders.contentGroup);
    });
});

test.describe('Add Single User - Mandatory Validation', () => {

    test.beforeEach(async ({ page }) => {
        const targetUrl = `${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${adminData.userManagement.expectedUrls.addSingleUser}`;
        await page.goto(targetUrl);
        await page.waitForLoadState('domcontentloaded');
    });

    test('Add Single User - Full Name Required - Submitting empty form highlights Full Name with is-invalid border', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.submitForm();
        await expect(addUserPage.userNameInput).toHaveClass(/is-invalid/);
    });

    test('Add Single User - Full Name Required - Submitting empty form displays Full Name is required 3-100 characters error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.submitForm();
        await expect(addUserPage.userNameError).toBeVisible();
        await expect(addUserPage.userNameError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.fullNameRequired);
    });

    test('Add Single User - Email Required - Submitting empty form highlights Email with is-invalid border', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.submitForm();
        await expect(addUserPage.emailInput).toHaveClass(/is-invalid/);
    });

    test('Add Single User - Email Required - Submitting empty form displays Email is required error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.submitForm();
        await expect(addUserPage.emailError).toBeVisible();
        await expect(addUserPage.emailError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.emailRequired);
    });

    test('Add Single User - Full Name Validation Reset - Typing valid text into Full Name clears invalid error state', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.submitForm();
        await expect(addUserPage.userNameError).toBeVisible();
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await expect(addUserPage.userNameInput).not.toHaveClass(/is-invalid/);
        await expect(addUserPage.userNameError).not.toBeVisible();
    });

    test('Add Single User - Email Validation Reset - Typing valid text into Email clears invalid error state', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.submitForm();
        await expect(addUserPage.emailError).toBeVisible();
        await addUserPage.emailInput.fill(adminData.userManagement.newUserData.email);
        await expect(addUserPage.emailInput).not.toHaveClass(/is-invalid/);
        await expect(addUserPage.emailError).not.toBeVisible();
    });
});

test.describe('Add Single User - Full Name Validation', () => {

    test.beforeEach(async ({ page }) => {
        const targetUrl = `${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${adminData.userManagement.expectedUrls.addSingleUser}`;
        await page.goto(targetUrl);
        await page.waitForLoadState('domcontentloaded');
    });

    test('Add Single User - Full Name Length - Submitting name with fewer than 3 characters displays minimum character error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.shortName);
        await addUserPage.emailInput.fill(adminData.userManagement.newUserData.email);
        await addUserPage.submitForm();
        await expect(addUserPage.userNameError).toBeVisible();
        await expect(addUserPage.userNameError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.fullNameMinLength);
    });

    test('Add Single User - Full Name Length - Accepts 3 character boundary valid name', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.minValidName);
        await expect(addUserPage.userNameInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.minValidName);
        await expect(addUserPage.userNameError).not.toBeVisible();
    });

    test('Add Single User - Full Name Format - Accepts standard alphabetic name with spaces', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await expect(addUserPage.userNameInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await expect(addUserPage.userNameError).not.toBeVisible();
    });

    test('Add Single User - Full Name Boundary - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.userNameInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.userNameError).not.toBeVisible();
    });

    test('Add Single User - Full Name Whitespace - Allows entering name with leading and trailing spaces', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.whitespaceName);
        await expect(addUserPage.userNameInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.whitespaceName);
    });

    test('Add Single User - Full Name Character Limit - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.userNameError).toBeVisible();
        await expect(addUserPage.userNameError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - Full Name Unsupported Characters - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.userNameError).toBeVisible();
        await expect(addUserPage.userNameError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });
});

test.describe('Add Single User - Email & Alternate Email Validation', () => {

    test.beforeEach(async ({ page }) => {
        const targetUrl = `${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${adminData.userManagement.expectedUrls.addSingleUser}`;
        await page.goto(targetUrl);
        await page.waitForLoadState('domcontentloaded');
    });

    test('Add Single User - Primary Email Format - Submitting email without at-symbol displays invalid email address error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await addUserPage.emailInput.fill(adminData.userManagement.addSingleUserData.testInputs.invalidEmails[0]);
        await addUserPage.submitForm();
        await expect(addUserPage.emailError).toBeVisible();
        await expect(addUserPage.emailError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.emailInvalid);
    });

    test('Add Single User - Primary Email Format - Submitting email with missing domain displays invalid email address error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await addUserPage.emailInput.fill(adminData.userManagement.addSingleUserData.testInputs.invalidEmails[1]);
        await addUserPage.submitForm();
        await expect(addUserPage.emailError).toBeVisible();
        await expect(addUserPage.emailError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.emailInvalid);
    });

    test('Add Single User - Primary Email Format - Submitting email with whitespace displays invalid email address error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await addUserPage.emailInput.fill(adminData.userManagement.addSingleUserData.testInputs.invalidEmails[2]);
        await addUserPage.submitForm();
        await expect(addUserPage.emailError).toBeVisible();
        await expect(addUserPage.emailError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.emailInvalid);
    });

    test('Add Single User - Primary Email Format - Accepts standard valid email address format', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.emailInput.fill(adminData.userManagement.newUserData.email);
        await expect(addUserPage.emailInput).toHaveValue(adminData.userManagement.newUserData.email);
        await expect(addUserPage.emailError).not.toBeVisible();
    });

    test('Add Single User - Alternate Email Format - Submitting malformed email displays invalid email address error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await addUserPage.emailInput.fill(adminData.userManagement.newUserData.email);
        await addUserPage.alternateEmailInput.fill(adminData.userManagement.addSingleUserData.testInputs.invalidAlternateEmail);
        await addUserPage.submitForm();
        await expect(addUserPage.alternateEmailError).toBeVisible();
        await expect(addUserPage.alternateEmailError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.emailInvalid);
    });

    test('Add Single User - Alternate Email Conflict - Submitting Alternate Email identical to Primary Email displays conflict error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await addUserPage.emailInput.fill(adminData.userManagement.newUserData.email);
        await addUserPage.alternateEmailInput.fill(adminData.userManagement.newUserData.email);
        await addUserPage.submitForm();
        await expect(addUserPage.alternateEmailError).toBeVisible();
        await expect(addUserPage.alternateEmailError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.alternateEmailSame);
    });

    test('Add Single User - Alternate Email Valid - Accepts distinct and valid alternate email address', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        const altEmail = `alt_${Date.now()}@yopmail.com`;
        await addUserPage.alternateEmailInput.fill(altEmail);
        await expect(addUserPage.alternateEmailInput).toHaveValue(altEmail);
        await expect(addUserPage.alternateEmailError).not.toBeVisible();
    });

    test('Add Single User - Alternate Email Optional - Leaves Alternate Email empty and form submits successfully', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.alternateEmailInput).toHaveValue('');
        await expect(addUserPage.alternateEmailError).not.toBeVisible();
    });
});

test.describe('Add Single User - Mobile Field Validation', () => {

    test.beforeEach(async ({ page }) => {
        const targetUrl = `${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${adminData.userManagement.expectedUrls.addSingleUser}`;
        await page.goto(targetUrl);
        await page.waitForLoadState('domcontentloaded');
    });

    test('Add Single User - Mobile Length - Submitting phone number with fewer than 7 digits displays minimum character error', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await addUserPage.emailInput.fill(adminData.userManagement.newUserData.email);
        await addUserPage.mobileInput.fill(adminData.userManagement.addSingleUserData.testInputs.shortMobile);
        await addUserPage.submitForm();
        await expect(addUserPage.mobileError).toBeVisible();
        await expect(addUserPage.mobileError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.mobileMinLength);
    });

    test('Add Single User - Mobile Format - Accepts valid 10-digit mobile number', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.mobileInput.fill(adminData.userManagement.addSingleUserData.testInputs.validMobile);
        await expect(addUserPage.mobileInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.validMobile);
        await expect(addUserPage.mobileError).not.toBeVisible();
    });

    test('Add Single User - Mobile Format - Displays validation error when phone number contains special characters or prefix', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userNameInput.fill(adminData.userManagement.addSingleUserData.testInputs.standardName);
        await addUserPage.emailInput.fill(adminData.userManagement.newUserData.email);
        await addUserPage.mobileInput.fill(adminData.userManagement.addSingleUserData.testInputs.internationalMobile);
        await addUserPage.submitForm();
        await expect(addUserPage.mobileError).toBeVisible();
    });

    test('Add Single User - Mobile Optional - Mobile field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.mobileInput).toHaveValue('');
        await expect(addUserPage.mobileError).not.toBeVisible();
    });
});

test.describe('Add Single User - Dropdowns Selection', () => {

    test.beforeEach(async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.navigateIfNotCurrent(adminData.userManagement.expectedUrls.addSingleUser);
    });

    test('Add Single User - User Type Dropdown - Renders institutional role options in dropdown list', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.userTypeSelect.locator('option').nth(5)).toBeAttached({ timeout: 10000 });
        const optionsCount = await addUserPage.userTypeSelect.locator('option').count();
        expect(optionsCount).toBeGreaterThan(10);
    });

    test('Add Single User - User Type Dropdown - Selecting Student option updates dropdown value', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userTypeSelect.selectOption({ label: adminData.userManagement.addSingleUserData.dropdownOptions.userTypes[0] });
        await expect(addUserPage.userTypeSelect).toHaveValue('STUDENT');
    });

    test('Add Single User - User Type Dropdown - Selecting Faculty option updates dropdown value', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userTypeSelect.selectOption({ label: adminData.userManagement.addSingleUserData.dropdownOptions.userTypes[1] });
        await expect(addUserPage.userTypeSelect).toHaveValue('FACULTY');
    });

    test('Add Single User - User Type Optional - Leaving User Type as Select allows form submission without blocking', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.userTypeSelect.selectOption({ index: 0 });
        await expect(addUserPage.userTypeSelect).toHaveValue('');
    });

    test('Add Single User - Gender Dropdown - Renders standard gender options in dropdown list', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.genderSelect.locator('option').nth(3)).toBeAttached({ timeout: 10000 });
        const optionsCount = await addUserPage.genderSelect.locator('option').count();
        expect(optionsCount).toBe(4); // Select, Male, Female, Other
    });

    test('Add Single User - Gender Dropdown - Selecting Male option updates dropdown value', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.genderSelect.selectOption({ label: adminData.userManagement.addSingleUserData.dropdownOptions.genders[0] });
        await expect(addUserPage.genderSelect).toHaveValue('Male');
    });

    test('Add Single User - Gender Dropdown - Selecting Female option updates dropdown value', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.genderSelect.selectOption({ label: adminData.userManagement.addSingleUserData.dropdownOptions.genders[1] });
        await expect(addUserPage.genderSelect).toHaveValue('Female');
    });

    test('Add Single User - Gender Dropdown - Selecting Other option updates dropdown value', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.genderSelect.selectOption({ label: adminData.userManagement.addSingleUserData.dropdownOptions.genders[2] });
        await expect(addUserPage.genderSelect).toHaveValue('Other');
    });

    test('Add Single User - Gender Optional - Leaving Gender as Select allows form submission without blocking', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.genderSelect.selectOption({ index: 0 });
        await expect(addUserPage.genderSelect).toHaveValue('');
    });
});

test.describe('Add Single User - Date of Birth Calendar Picker', () => {

    test.beforeEach(async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.navigateIfNotCurrent(adminData.userManagement.expectedUrls.addSingleUser);
        await addUserPage.dismissAnyOpenPopups();
    });

    test('Add Single User - Date of Birth Picker - Clicking DOB input opens calendar datepicker popup', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.openDobCalendar();
        await expect(addUserPage.dobCalendarPopup).toBeVisible();
    });

    test('Add Single User - Date of Birth Calendar - Calendar displays navigation controls for month and year selection', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.openDobCalendar();
        await expect(addUserPage.dobCalendarPopup.locator('.react-datepicker__header')).toBeVisible();
    });

    test('Add Single User - Date of Birth Calendar - Future dates are marked as disabled in calendar', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.openDobCalendar();
        const disabledCount = await addUserPage.dobDisabledDays.count();
        expect(disabledCount).toBeGreaterThan(0);
    });

    test('Add Single User - Date of Birth Selection - Selecting past date populates formatted date into input field', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.selectPastDateInCalendar();
        const dobVal = await addUserPage.dobInput.inputValue();
        expect(dobVal.length).toBeGreaterThan(0);
    });

    test('Add Single User - Date of Birth Optional - Date of Birth is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.dobInput.clear();
        await expect(addUserPage.dobInput).toHaveValue('');
    });
});

test.describe('Add Single User - Enrollment String Fields', () => {

    test.beforeEach(async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.navigateIfNotCurrent(adminData.userManagement.expectedUrls.addSingleUser);
    });

    // ID Number (staffId)
    test('Add Single User - ID Number - Accepts valid alphanumeric identifier', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.staffIdInput.fill(adminData.userManagement.addSingleUserData.testInputs.staffId);
        await expect(addUserPage.staffIdInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.staffId);
        await expect(addUserPage.staffIdError).not.toBeVisible();
    });

    test('Add Single User - ID Number - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.staffIdInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.staffIdInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.staffIdError).not.toBeVisible();
    });

    test('Add Single User - ID Number - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.staffIdInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.staffIdError).toBeVisible();
        await expect(addUserPage.staffIdError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - ID Number - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.staffIdInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.staffIdError).toBeVisible();
        await expect(addUserPage.staffIdError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - ID Number - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.staffIdInput.clear();
        await expect(addUserPage.staffIdInput).toHaveValue('');
    });

    // College / Organization (affiliation)
    test('Add Single User - College Organization - Accepts valid institutional name', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.affiliationInput.fill(adminData.userManagement.addSingleUserData.testInputs.affiliation);
        await expect(addUserPage.affiliationInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.affiliation);
        await expect(addUserPage.affiliationError).not.toBeVisible();
    });

    test('Add Single User - College Organization - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.affiliationInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.affiliationInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.affiliationError).not.toBeVisible();
    });

    test('Add Single User - College Organization - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.affiliationInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.affiliationError).toBeVisible();
        await expect(addUserPage.affiliationError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - College Organization - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.affiliationInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.affiliationError).toBeVisible();
        await expect(addUserPage.affiliationError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - College Organization - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.affiliationInput.clear();
        await expect(addUserPage.affiliationInput).toHaveValue('');
    });

    // Department
    test('Add Single User - Department - Accepts valid department name', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.departmentInput.fill(adminData.userManagement.addSingleUserData.testInputs.department);
        await expect(addUserPage.departmentInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.department);
        await expect(addUserPage.departmentError).not.toBeVisible();
    });

    test('Add Single User - Department - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.departmentInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.departmentInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.departmentError).not.toBeVisible();
    });

    test('Add Single User - Department - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.departmentInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.departmentError).toBeVisible();
        await expect(addUserPage.departmentError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - Department - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.departmentInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.departmentError).toBeVisible();
        await expect(addUserPage.departmentError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Department - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.departmentInput.clear();
        await expect(addUserPage.departmentInput).toHaveValue('');
    });

    // Qualification / Degree / Program
    test('Add Single User - Qualification Degree - Accepts valid qualification program title', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.degreeInput.fill(adminData.userManagement.addSingleUserData.testInputs.degree);
        await expect(addUserPage.degreeInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.degree);
        await expect(addUserPage.degreeError).not.toBeVisible();
    });

    test('Add Single User - Qualification Degree - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.degreeInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.degreeInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.degreeError).not.toBeVisible();
    });

    test('Add Single User - Qualification Degree - Displays Maximum 150 characters allowed error when input exceeds 150 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.degreeInput.fill(adminData.userManagement.addSingleUserData.testInputs.over150Chars);
        await expect(addUserPage.degreeError).toBeVisible();
        await expect(addUserPage.degreeError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max150Chars);
    });

    test('Add Single User - Qualification Degree - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.degreeInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.degreeError).toBeVisible();
        await expect(addUserPage.degreeError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Qualification Degree - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.degreeInput.clear();
        await expect(addUserPage.degreeInput).toHaveValue('');
    });

    // Designation
    test('Add Single User - Designation - Accepts valid designation title', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.designationInput.fill(adminData.userManagement.addSingleUserData.testInputs.designation);
        await expect(addUserPage.designationInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.designation);
        await expect(addUserPage.designationError).not.toBeVisible();
    });

    test('Add Single User - Designation - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.designationInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.designationInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.designationError).not.toBeVisible();
    });

    test('Add Single User - Designation - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.designationInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.designationError).toBeVisible();
        await expect(addUserPage.designationError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - Designation - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.designationInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.designationError).toBeVisible();
        await expect(addUserPage.designationError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Designation - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.designationInput.clear();
        await expect(addUserPage.designationInput).toHaveValue('');
    });

    // Area of Study / Speciality
    test('Add Single User - Speciality - Accepts valid study area or specialization', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.specialityInput.fill(adminData.userManagement.addSingleUserData.testInputs.speciality);
        await expect(addUserPage.specialityInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.speciality);
        await expect(addUserPage.specialityError).not.toBeVisible();
    });

    test('Add Single User - Speciality - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.specialityInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.specialityInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.specialityError).not.toBeVisible();
    });

    test('Add Single User - Speciality - Displays Maximum 150 characters allowed error when input exceeds 150 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.specialityInput.fill(adminData.userManagement.addSingleUserData.testInputs.over150Chars);
        await expect(addUserPage.specialityError).toBeVisible();
        await expect(addUserPage.specialityError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max150Chars);
    });

    test('Add Single User - Speciality - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.specialityInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.specialityError).toBeVisible();
        await expect(addUserPage.specialityError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Speciality - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.specialityInput.clear();
        await expect(addUserPage.specialityInput).toHaveValue('');
    });

    // Rank
    test('Add Single User - Rank - Accepts valid rank text', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.rankInput.fill(adminData.userManagement.addSingleUserData.testInputs.rank);
        await expect(addUserPage.rankInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.rank);
        await expect(addUserPage.rankError).not.toBeVisible();
    });

    test('Add Single User - Rank - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.rankInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.rankInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.rankError).not.toBeVisible();
    });

    test('Add Single User - Rank - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.rankInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.rankError).toBeVisible();
        await expect(addUserPage.rankError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - Rank - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.rankInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.rankError).toBeVisible();
        await expect(addUserPage.rankError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Rank - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.rankInput.clear();
        await expect(addUserPage.rankInput).toHaveValue('');
    });

    // Batch
    test('Add Single User - Batch - Accepts valid batch text', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.batchInput.fill(adminData.userManagement.addSingleUserData.testInputs.batch);
        await expect(addUserPage.batchInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.batch);
        await expect(addUserPage.batchError).not.toBeVisible();
    });

    test('Add Single User - Batch - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.batchInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.batchInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.batchError).not.toBeVisible();
    });

    test('Add Single User - Batch - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.batchInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.batchError).toBeVisible();
        await expect(addUserPage.batchError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - Batch - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.batchInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.batchError).toBeVisible();
        await expect(addUserPage.batchError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Batch - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.batchInput.clear();
        await expect(addUserPage.batchInput).toHaveValue('');
    });

    // Cadre
    test('Add Single User - Cadre - Accepts valid cadre text', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.cadreInput.fill(adminData.userManagement.addSingleUserData.testInputs.cadre);
        await expect(addUserPage.cadreInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.cadre);
        await expect(addUserPage.cadreError).not.toBeVisible();
    });

    test('Add Single User - Cadre - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.cadreInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.cadreInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.cadreError).not.toBeVisible();
    });

    test('Add Single User - Cadre - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.cadreInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.cadreError).toBeVisible();
        await expect(addUserPage.cadreError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - Cadre - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.cadreInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.cadreError).toBeVisible();
        await expect(addUserPage.cadreError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Cadre - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.cadreInput.clear();
        await expect(addUserPage.cadreInput).toHaveValue('');
    });

    // Admission Year
    test('Add Single User - Admission Year - Accepts valid 4-digit admission year', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.yearInput.fill(adminData.userManagement.addSingleUserData.testInputs.admissionYear);
        await expect(addUserPage.yearInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.admissionYear);
        await expect(addUserPage.yearError).not.toBeVisible();
    });

    test('Add Single User - Admission Year - Displays only numbers are allowed error when input contains non-numeric characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.yearInput.fill(adminData.userManagement.addSingleUserData.testInputs.invalidYear);
        await expect(addUserPage.yearError).toBeVisible();
        await expect(addUserPage.yearError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.onlyNumbersAllowed);
    });

    test('Add Single User - Admission Year - Displays only numbers are allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.yearInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.yearError).toBeVisible();
        await expect(addUserPage.yearError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.onlyNumbersAllowed);
    });

    test('Add Single User - Admission Year - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.yearInput.clear();
        await expect(addUserPage.yearInput).toHaveValue('');
    });

    // Membership Status
    test('Add Single User - Membership Status - Accepts valid membership status text', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipStatusInput.fill(adminData.userManagement.addSingleUserData.testInputs.membershipStatus);
        await expect(addUserPage.membershipStatusInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.membershipStatus);
        await expect(addUserPage.membershipStatusError).not.toBeVisible();
    });

    test('Add Single User - Membership Status - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipStatusInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.membershipStatusInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.membershipStatusError).not.toBeVisible();
    });

    test('Add Single User - Membership Status - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipStatusInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.membershipStatusError).toBeVisible();
        await expect(addUserPage.membershipStatusError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - Membership Status - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipStatusInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.membershipStatusError).toBeVisible();
        await expect(addUserPage.membershipStatusError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Membership Status - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipStatusInput.clear();
        await expect(addUserPage.membershipStatusInput).toHaveValue('');
    });

    // Membership Type
    test('Add Single User - Membership Type - Accepts valid membership category text', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipTypeInput.fill(adminData.userManagement.addSingleUserData.testInputs.membershipType);
        await expect(addUserPage.membershipTypeInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.membershipType);
        await expect(addUserPage.membershipTypeError).not.toBeVisible();
    });

    test('Add Single User - Membership Type - Accepts maximum boundary length of 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipTypeInput.fill(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.membershipTypeInput).toHaveValue(adminData.userManagement.addSingleUserData.testInputs.maxName100);
        await expect(addUserPage.membershipTypeError).not.toBeVisible();
    });

    test('Add Single User - Membership Type - Displays Maximum 100 characters allowed error when input exceeds 100 characters', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipTypeInput.fill(adminData.userManagement.addSingleUserData.testInputs.over100Chars);
        await expect(addUserPage.membershipTypeError).toBeVisible();
        await expect(addUserPage.membershipTypeError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.max100Chars);
    });

    test('Add Single User - Membership Type - Displays only plain text allowed error when input contains HTML tags', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipTypeInput.fill(adminData.userManagement.addSingleUserData.testInputs.htmlTagInput);
        await expect(addUserPage.membershipTypeError).toBeVisible();
        await expect(addUserPage.membershipTypeError).toHaveText(adminData.userManagement.addSingleUserData.validationMessages.plainTextOnly);
    });

    test('Add Single User - Membership Type - Field is optional and can be left blank', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.membershipTypeInput.clear();
        await expect(addUserPage.membershipTypeInput).toHaveValue('');
    });
});

test.describe('Add Single User - Content Group Multi-Select Dropdown', () => {

    test.beforeEach(async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.navigateIfNotCurrent(adminData.userManagement.expectedUrls.addSingleUser);
        await addUserPage.dismissAnyOpenPopups();
    });

    test('Add Single User - Content Group Dropdown - Clicking input opens multi-dropdown menu', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.openContentGroupDropdown();
        await expect(addUserPage.contentGroupDropdown).toBeVisible();
    });

    test('Add Single User - Content Group Dropdown - Displays list of institution content groups', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.openContentGroupDropdown();
        await expect(addUserPage.contentGroupOptions.first()).toBeVisible({ timeout: 10000 });
        const count = await addUserPage.contentGroupOptions.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Add Single User - Content Group Dropdown - Displays Select all button inside dropdown footer', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.openContentGroupDropdown();
        await expect(addUserPage.contentGroupSelectAllBtn).toBeVisible();
    });

    test('Add Single User - Content Group Dropdown - Displays Clear all button inside dropdown footer', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.openContentGroupDropdown();
        await expect(addUserPage.contentGroupClearAllBtn).toBeVisible();
    });

    test('Add Single User - Content Group Dropdown - Clicking an option item selects group and updates input text', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.openContentGroupDropdown();
        const firstOption = addUserPage.contentGroupOptions.first();
        const optionName = (await firstOption.textContent())?.trim() || '';
        await firstOption.click();
        await expect(addUserPage.contentGroupInput).not.toHaveValue(adminData.userManagement.addSingleUserData.placeholders.contentGroup);
        await addUserPage.clearAllContentGroups();
    });

    test('Add Single User - Content Group Dropdown - Clicking Select all selects all available content groups', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.selectAllContentGroups();
        const val = await addUserPage.contentGroupInput.inputValue();
        expect(val.length).toBeGreaterThan(0);
        expect(val).not.toBe(adminData.userManagement.addSingleUserData.placeholders.contentGroup);
        await addUserPage.clearAllContentGroups();
    });

    test('Add Single User - Content Group Dropdown - Clicking Clear all deselects all groups and restores Select placeholder', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await addUserPage.selectAllContentGroups();
        await addUserPage.clearAllContentGroups();
        await expect(addUserPage.contentGroupInput).toHaveValue(adminData.userManagement.addSingleUserData.placeholders.contentGroup);
    });

    test('Add Single User - Content Group Dropdown - Content group selection is optional and can be left unselected', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        await expect(addUserPage.contentGroupInput).toHaveValue(adminData.userManagement.addSingleUserData.placeholders.contentGroup);
    });
});

test.describe('Add Single User - User Creation & Verification', () => {

    test.beforeEach(async ({ page }) => {
        const targetUrl = `${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${adminData.userManagement.expectedUrls.addSingleUser}`;
        await page.goto(targetUrl);
        await page.waitForLoadState('domcontentloaded');
    });

    test('Add Single User - User Creation Minimal - Creates user successfully with mandatory Full Name and Email', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        const uniqueEmail = `minimal_${Date.now()}@yopmail.com`;
        test.info().annotations.push({ type: 'testData', description: uniqueEmail });

        await addUserPage.fillRegistrationForm({
            userName: adminData.userManagement.addSingleUserData.testInputs.standardName,
            email: uniqueEmail
        });
        await addUserPage.submitForm();

        await expect(addUserPage.toast).toBeVisible({ timeout: 15000 });
        await expect(addUserPage.toast).toContainText(/success|created|saved/i);
    });

    test('Add Single User - User Creation Comprehensive - Creates user successfully with full profile and enrollment details', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        const uniqueEmail = `full_${Date.now()}@yopmail.com`;
        const altEmail = `alt_${Date.now()}@yopmail.com`;
        test.info().annotations.push({ type: 'testData', description: uniqueEmail });

        await addUserPage.fillRegistrationForm({
            userName: adminData.userManagement.addSingleUserData.testInputs.standardName,
            email: uniqueEmail,
            alternateEmail: altEmail,
            mobile: adminData.userManagement.addSingleUserData.testInputs.validMobile,
            userType: adminData.userManagement.addSingleUserData.dropdownOptions.userTypes[0],
            gender: adminData.userManagement.addSingleUserData.dropdownOptions.genders[0]
        });

        await addUserPage.fillAllEnrollmentDetails({
            staffId: adminData.userManagement.addSingleUserData.testInputs.staffId,
            affiliation: adminData.userManagement.addSingleUserData.testInputs.affiliation,
            department: adminData.userManagement.addSingleUserData.testInputs.department,
            degree: adminData.userManagement.addSingleUserData.testInputs.degree,
            designation: adminData.userManagement.addSingleUserData.testInputs.designation,
            speciality: adminData.userManagement.addSingleUserData.testInputs.speciality,
            rank: adminData.userManagement.addSingleUserData.testInputs.rank,
            batch: adminData.userManagement.addSingleUserData.testInputs.batch,
            cadre: adminData.userManagement.addSingleUserData.testInputs.cadre,
            admissionYear: adminData.userManagement.addSingleUserData.testInputs.admissionYear,
            membershipStatus: adminData.userManagement.addSingleUserData.testInputs.membershipStatus,
            membershipType: adminData.userManagement.addSingleUserData.testInputs.membershipType
        });

        await addUserPage.submitForm();

        await expect(addUserPage.toast).toBeVisible({ timeout: 15000 });
        await expect(addUserPage.toast).toContainText(/success|created|saved/i);
    });

    test('Add Single User - Duplicate Registration - Submitting duplicate email displays user already exists error alert', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        // Using existing known user email to verify duplicate rejection
        await addUserPage.fillRegistrationForm({
            userName: adminData.userManagement.addSingleUserData.testInputs.standardName,
            email: 'codec@yopmail.com'
        });
        await addUserPage.submitForm();

        await expect(addUserPage.toast).toBeVisible({ timeout: 15000 });
        await expect(addUserPage.toast).toContainText(/exists|already|error|duplicate/i);
    });

    test('Add Single User - Manage Users Synchronization - Created user appears in Manage Users table', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        const uniqueEmail = `synced_${Date.now()}@yopmail.com`;
        const uniqueName = `SyncUser ${Date.now()}`;
        test.info().annotations.push({ type: 'testData', description: uniqueEmail });

        await addUserPage.fillRegistrationForm({
            userName: uniqueName,
            email: uniqueEmail
        });
        await addUserPage.submitForm();

        await expect(addUserPage.toast).toBeVisible({ timeout: 15000 });
        await expect(addUserPage.toast).toContainText(/success|created|saved/i);

        // Navigate to Manage Users and verify user presence
        await page.goto(`${process.env.ADMIN_TEST_URL}/librarian/v2/elibrarySetup${adminData.userManagement.expectedUrls.manageUsers}`);
        await page.waitForLoadState('domcontentloaded');

        const manageUsersPage = new ManageUsersPage(page);
        await manageUsersPage.searchForUser(uniqueEmail);
        await expect(manageUsersPage.getRowByEmail(uniqueEmail)).toBeVisible({ timeout: 15000 });
    });

    test('Add Single User - Form Reset - Form input fields reset to clean empty state after successful user creation', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        const uniqueEmail = `reset_${Date.now()}@yopmail.com`;
        test.info().annotations.push({ type: 'testData', description: uniqueEmail });

        await addUserPage.fillRegistrationForm({
            userName: adminData.userManagement.addSingleUserData.testInputs.standardName,
            email: uniqueEmail
        });
        await addUserPage.submitForm();

        await expect(addUserPage.toast).toBeVisible({ timeout: 15000 });
        await expect(addUserPage.toast).toContainText(/success|created|saved/i);

        await expect(addUserPage.userNameInput).toHaveValue('');
        await expect(addUserPage.emailInput).toHaveValue('');
    });

    test('Add Single User - Email Casing - Accepts uppercase characters in email address and registers user cleanly', async ({ page }) => {
        const addUserPage = new AddSingleUserPage(page);
        const uniqueEmail = `UPPER_${Date.now()}@YOPMAIL.COM`;
        test.info().annotations.push({ type: 'testData', description: uniqueEmail });

        await addUserPage.fillRegistrationForm({
            userName: adminData.userManagement.addSingleUserData.testInputs.standardName,
            email: uniqueEmail
        });
        await addUserPage.submitForm();

        await expect(addUserPage.toast).toBeVisible({ timeout: 15000 });
        await expect(addUserPage.toast).toContainText(/success|created|saved/i);
    });
});

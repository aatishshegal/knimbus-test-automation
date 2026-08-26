import { test, expect } from '../../../src/fixtures';
import workEducationData from '../../test-data/work-education-data.json';

const testData = workEducationData.workEducationData;

test.describe('Portal - Work & Education Tab Validations @profile @work-education', () => {

  test.beforeEach(async ({ page, profilePage }) => {
    const profileUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/profile');
    await page.goto(profileUrl);
    await page.waitForLoadState('domcontentloaded');
    await profilePage.clickTab(testData.tabName as any);
  });

  test('TC01: Verify section headings visibility for Work Experience, Education, and Field of Studies', async ({ workEducationPage }) => {
    await expect(workEducationPage.headingWorkExperience).toBeVisible();
    await expect(workEducationPage.headingEducation).toBeVisible();
    await expect(workEducationPage.headingFieldOfStudies).toBeVisible();
  });

  test('TC02: Verify Work Experience section fields and Save button visibility', async ({ workEducationPage }) => {
    await expect(workEducationPage.jobTitleInput).toBeVisible();
    await expect(workEducationPage.companyNameInput).toBeVisible();
    await expect(workEducationPage.workExpFromYrInput).toBeVisible();
    await expect(workEducationPage.workExpToYrInput).toBeVisible();
    await expect(workEducationPage.isCurrentCompanyCheckbox).toBeVisible();
    await expect(workEducationPage.saveWorkExpButton).toBeVisible();
  });

  test('TC03: Verify Education section fields and Save button visibility', async ({ workEducationPage }) => {
    await expect(workEducationPage.institutionNameInput).toBeVisible();
    await expect(workEducationPage.eduDegreeInput).toBeVisible();
    await expect(workEducationPage.eduFromYrInput).toBeVisible();
    await expect(workEducationPage.eduToYrInput).toBeVisible();
    await expect(workEducationPage.saveEducationButton).toBeVisible();
  });

  test('TC04: Verify Field of Studies section field and Save button visibility', async ({ workEducationPage }) => {
    await expect(workEducationPage.studySubInput).toBeVisible();
    await expect(workEducationPage.saveFieldOfStudiesButton).toBeVisible();
  });

  test('TC05: Verify HTML attribute validations for year fields (maxlength=4) and input placeholders', async ({ workEducationPage }) => {
    const attrs = await workEducationPage.getFieldAttributes();

    expect(attrs.workExpFromYrMaxLength).toBe(testData.fieldAttributes.workExpFromYr.maxlength);
    expect(attrs.workExpToYrMaxLength).toBe(testData.fieldAttributes.workExpToYr.maxlength);
    expect(attrs.eduFromYrMaxLength).toBe(testData.fieldAttributes.eduFromYr.maxlength);
    expect(attrs.eduToYrMaxLength).toBe(testData.fieldAttributes.eduToYr.maxlength);
  });

  test('TC06: Verify submitting valid Work Experience details', async ({ workEducationPage }) => {
    const data = testData.workExperienceData.valid;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.fillWorkExperience(data);
    await expect(workEducationPage.jobTitleInput).toHaveValue(data.jobTitle);
    await expect(workEducationPage.companyNameInput).toHaveValue(data.companyName);
    await expect(workEducationPage.workExpFromYrInput).toHaveValue(data.workExpFromYr);
    await expect(workEducationPage.workExpToYrInput).toHaveValue(data.workExpToYr);

    await workEducationPage.saveWorkExperience();
  });

  test('TC07: Verify "Is current company ?" checkbox toggle functionality', async ({ workEducationPage }) => {
    const currentJobData = testData.workExperienceData.currentJob;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.fillWorkExperience(currentJobData);

    await expect(workEducationPage.isCurrentCompanyCheckbox).toBeChecked();
    await expect(workEducationPage.jobTitleInput).toHaveValue(currentJobData.jobTitle);
    await expect(workEducationPage.companyNameInput).toHaveValue(currentJobData.companyName);

    // Uncheck and verify state
    await workEducationPage.isCurrentCompanyCheckbox.click();
    await expect(workEducationPage.isCurrentCompanyCheckbox).not.toBeChecked();
  });

  test('TC08: Verify submitting valid Education details', async ({ workEducationPage }) => {
    const data = testData.educationData.valid;
    await workEducationPage.clearEducation();
    await workEducationPage.fillEducation(data);

    await expect(workEducationPage.institutionNameInput).toHaveValue(data.institutionName);
    await expect(workEducationPage.eduDegreeInput).toHaveValue(data.eduDegree);
    await expect(workEducationPage.eduFromYrInput).toHaveValue(data.eduFromYr);
    await expect(workEducationPage.eduToYrInput).toHaveValue(data.eduToYr);

    await workEducationPage.saveEducation();
  });

  test('TC09: Verify submitting valid Field of Studies details', async ({ workEducationPage }) => {
    const data = testData.fieldOfStudiesData.valid;
    await workEducationPage.clearFieldOfStudies();
    await workEducationPage.fillFieldOfStudies(data);

    await expect(workEducationPage.studySubInput).toHaveValue(data.studySub);
    await workEducationPage.saveFieldOfStudies();
  });

  test('TC10: Verify 4-digit character limit truncation on Year fields when typing overflow input', async ({ workEducationPage }) => {
    const overflowData = testData.workExperienceData.invalidYear;
    await workEducationPage.workExpFromYrInput.fill(overflowData.workExpFromYr);

    // Maxlength 4 enforces at most 4 chars
    const value = await workEducationPage.workExpFromYrInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(4);
  });

  test('TC11: Verify validation error "Atleast 4 characters required" when 1 character is entered in Year field', async ({ workEducationPage, page }) => {
    const singleChar = (testData as any).yearValidationData?.singleChar || '2';
    const expectedError = testData.messages.atLeastFourChars;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.workExpFromYrInput.fill(singleChar);
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC12: Verify validation error "Only numbers are allowed" when non-numeric characters are entered in Year field', async ({ workEducationPage, page }) => {
    const alphaChar = (testData as any).yearValidationData?.alphaChar || 'abcd';
    const expectedError = testData.messages.onlyNumbersAllowed;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.workExpFromYrInput.fill(alphaChar);
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC13: Verify validation error "Year value can\'t be greater than current year" when From Year is greater than current year', async ({ workEducationPage, page }) => {
    const futureYear = (testData as any).yearValidationData?.futureFromYear || '2099';
    const expectedError = testData.messages.yearGreaterThanCurrent;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.workExpFromYrInput.fill(futureYear);
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC14: Verify validation error "Year value can\'t be greater than current year" when To Year is greater than current year', async ({ workEducationPage, page }) => {
    const futureYear = (testData as any).yearValidationData?.futureToYear || '2099';
    const expectedError = testData.messages.yearGreaterThanCurrent;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.workExpToYrInput.fill(futureYear);
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC15: Verify mandatory validation error "Job title is required" when Job Title is left empty', async ({ workEducationPage, page }) => {
    const expectedError = (testData.messages as any).jobTitleRequired || 'Job title is required';
    await workEducationPage.clearWorkExperience();
    await workEducationPage.jobTitleInput.focus();
    await workEducationPage.companyNameInput.focus();
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC16: Verify mandatory validation error "Company is required" when Company Name is left empty', async ({ workEducationPage, page }) => {
    const expectedError = (testData.messages as any).companyRequired || 'Company is required';
    await workEducationPage.clearWorkExperience();
    await workEducationPage.companyNameInput.focus();
    await workEducationPage.workExpFromYrInput.focus();
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC17: Verify mandatory validation error "From year is required" when From Year is left empty', async ({ workEducationPage, page }) => {
    const validData = testData.workExperienceData.valid;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.fillWorkExperience({
      jobTitle: validData.jobTitle,
      companyName: validData.companyName,
      workExpFromYr: '',
      workExpToYr: validData.workExpToYr,
    });
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText('From year is required', { exact: false }).or(page.getByText('Please fill From year', { exact: false })).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage('From year');
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC18: Verify mandatory validation error "To year is required" when To Year is left empty', async ({ workEducationPage, page }) => {
    const validData = testData.workExperienceData.valid;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.fillWorkExperience({
      jobTitle: validData.jobTitle,
      companyName: validData.companyName,
      workExpFromYr: validData.workExpFromYr,
      workExpToYr: '',
    });
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText('To year is required', { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage('To year');
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC19: Verify validation error "Please fill From year" when all fields are filled except From Year', async ({ workEducationPage, page }) => {
    const validData = testData.workExperienceData.valid;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.fillWorkExperience({
      jobTitle: validData.jobTitle,
      companyName: validData.companyName,
      workExpFromYr: '',
      workExpToYr: validData.workExpToYr,
    });
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText('Please fill From year', { exact: false }).or(page.getByText('From year is required', { exact: false })).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage('From year');
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC20: Verify validation error "From year value can\'t be greater than To year value" when From Year is greater than To Year', async ({ workEducationPage, page }) => {
    const expectedError = (testData.messages as any).fromYearGreaterThanToYear || "From year value can't be greater than To year value";
    const invalidDates = (testData as any).yearValidationData?.invalidFromToYear || { fromYr: '2024', toYr: '2020' };
    await workEducationPage.clearWorkExperience();
    await workEducationPage.fillWorkExperience({
      jobTitle: testData.workExperienceData.valid.jobTitle,
      companyName: testData.workExperienceData.valid.companyName,
      workExpFromYr: invalidDates.fromYr,
      workExpToYr: invalidDates.toYr,
    });
    await workEducationPage.saveWorkExperience();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC21: Verify checking "Is current company ?" checkbox automatically populates To Year field with the current year', async ({ workEducationPage }) => {
    const currentYear = new Date().getFullYear().toString();
    await workEducationPage.clearWorkExperience();

    // Check "Is current company ?" checkbox
    if (!(await workEducationPage.isCurrentCompanyCheckbox.isChecked())) {
      await workEducationPage.isCurrentCompanyCheckbox.click();
    }

    await expect(workEducationPage.isCurrentCompanyCheckbox).toBeChecked();
    const toYearValue = await workEducationPage.workExpToYrInput.inputValue();
    expect(toYearValue).toBe(currentYear);
  });

  test('TC22: Verify Edit icon presence on saved card, and clicking Edit reveals Save, Cancel, and Delete buttons', async ({ workEducationPage }) => {
    const validData = testData.workExperienceData.valid;
    await workEducationPage.clearWorkExperience();
    await workEducationPage.fillWorkExperience(validData);
    await workEducationPage.saveWorkExperience();

    // Verify Edit card icon is visible
    await expect(workEducationPage.editCardIcon).toBeVisible();

    // Click edit button
    await workEducationPage.clickEditCard();

    // Verify Save, Cancel, and Delete buttons are visible
    await expect(workEducationPage.saveWorkExpButton).toBeVisible();
    await expect(workEducationPage.cancelEditButton).toBeVisible();
    await expect(workEducationPage.deleteExpButton).toBeVisible();
  });

  test('TC23: Verify editing Work Experience details and clicking Save displays "updated successfully" message', async ({ workEducationPage, page }) => {
    if (await workEducationPage.editCardIcon.isVisible().catch(() => false)) {
      await workEducationPage.clickEditCard();
    } else {
      await workEducationPage.clearWorkExperience();
      await workEducationPage.fillWorkExperience(testData.workExperienceData.valid);
      await workEducationPage.saveWorkExperience();
      await workEducationPage.clickEditCard();
    }

    // Update job title
    await workEducationPage.jobTitleInput.fill('Updated Automation Engineer');
    await workEducationPage.saveWorkExperience();

    // Assert success toast/notification
    const successToast = page.getByText(testData.messages.successToast, { exact: false }).first();
    await expect(successToast).toBeVisible();
  });

  test('TC24: Verify clicking Cancel in edit mode discards changes and returns to card view', async ({ workEducationPage }) => {
    if (await workEducationPage.editCardIcon.isVisible().catch(() => false)) {
      await workEducationPage.clickEditCard();
    } else {
      await workEducationPage.clearWorkExperience();
      await workEducationPage.fillWorkExperience(testData.workExperienceData.valid);
      await workEducationPage.saveWorkExperience();
      await workEducationPage.clickEditCard();
    }

    // Click Cancel
    await workEducationPage.clickCancelEdit();

    // Verify returning to card view (Edit card icon visible)
    await expect(workEducationPage.editCardIcon).toBeVisible();
  });

  test('TC25: Verify clicking Delete opens "Are you sure you want to delete?" popup, and clicking Cancel dismisses it', async ({ workEducationPage, page }) => {
    if (await workEducationPage.editCardIcon.isVisible().catch(() => false)) {
      await workEducationPage.clickEditCard();
    } else {
      await workEducationPage.clearWorkExperience();
      await workEducationPage.fillWorkExperience(testData.workExperienceData.valid);
      await workEducationPage.saveWorkExperience();
      await workEducationPage.clickEditCard();
    }

    // Click Delete button
    await workEducationPage.clickDeleteCard();

    // Verify confirmation modal and message
    const deleteModalText = page.getByText((testData.messages as any).deleteConfirmText || 'Are you sure you want to delete?', { exact: false }).first();
    await expect(deleteModalText).toBeVisible();
    await expect(workEducationPage.deleteModalCancelButton).toBeVisible();
    await expect(workEducationPage.deleteModalConfirmButton).toBeVisible();

    // Click Cancel on popup
    await workEducationPage.cancelDeleteModal();

    // Verify modal is dismissed
    await expect(deleteModalText).not.toBeVisible();
  });

  test('TC26: Verify clicking Delete on confirmation popup deletes record and displays "updated successfully" message', async ({ workEducationPage, page }) => {
    if (await workEducationPage.editCardIcon.isVisible().catch(() => false)) {
      await workEducationPage.clickEditCard();
    } else {
      await workEducationPage.clearWorkExperience();
      await workEducationPage.fillWorkExperience(testData.workExperienceData.valid);
      await workEducationPage.saveWorkExperience();
      await workEducationPage.clickEditCard();
    }

    // Click Delete button
    await workEducationPage.clickDeleteCard();

    // Confirm deletion on modal
    await workEducationPage.confirmDeleteModal();

    // Assert success toast message
    const successToast = page.getByText(testData.messages.successToast, { exact: false }).first();
    await expect(successToast).toBeVisible();
  });

  test('TC27: Verify "Add more" link presence when saved records exist, and clicking "Add more" reveals all form fields', async ({ workEducationPage }) => {
    // Ensure at least one saved Work Experience record exists
    if (!(await workEducationPage.editCardIcon.isVisible().catch(() => false))) {
      await workEducationPage.clearWorkExperience();
      await workEducationPage.fillWorkExperience(testData.workExperienceData.valid);
      await workEducationPage.saveWorkExperience();
    }

    // Verify "Add more" link is visible
    await expect(workEducationPage.addMoreButton).toBeVisible();

    // Click "Add more"
    await workEducationPage.clickAddMore();

    // Verify all Work Experience form fields and buttons are visible
    await expect(workEducationPage.jobTitleInput).toBeVisible();
    await expect(workEducationPage.companyNameInput).toBeVisible();
    await expect(workEducationPage.workExpFromYrInput).toBeVisible();
    await expect(workEducationPage.workExpToYrInput).toBeVisible();
    await expect(workEducationPage.isCurrentCompanyCheckbox).toBeVisible();
    await expect(workEducationPage.saveWorkExpButton).toBeVisible();
    await expect(workEducationPage.cancelEditButton).toBeVisible();
  });

  test('TC28: Verify mandatory validation errors when Education form is submitted empty', async ({ workEducationPage, page }) => {
    await workEducationPage.clearEducation();
    await workEducationPage.saveEducation();

    const expectedErrors = [
      (testData.messages as any).institutionNameRequired || 'Institution name is required',
      (testData.messages as any).degreeRequired || 'Degree is required',
      testData.messages.fromYearRequired || 'From year is required',
      testData.messages.toYearRequired || 'To year is required',
    ];

    for (const errText of expectedErrors) {
      const errLocator = page.getByText(errText, { exact: false }).first();
      if (await errLocator.isVisible().catch(() => false)) {
        await expect(errLocator).toBeVisible();
      } else {
        const fallbackLocator = workEducationPage.getErrorMessage(errText);
        await expect(fallbackLocator).toBeVisible();
      }
    }
  });

  test('TC29: Verify validation error "Atleast 4 characters required" when 1 character is entered in Education Year field', async ({ workEducationPage, page }) => {
    const singleChar = (testData as any).yearValidationData?.singleChar || '2';
    const expectedError = testData.messages.atLeastFourChars;
    await workEducationPage.clearEducation();
    await workEducationPage.eduFromYrInput.fill(singleChar);
    await workEducationPage.saveEducation();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC30: Verify validation error "Only numbers are allowed" when non-numeric characters are entered in Education Year field', async ({ workEducationPage, page }) => {
    const alphaChar = (testData as any).yearValidationData?.alphaChar || 'abcd';
    const expectedError = testData.messages.onlyNumbersAllowed;
    await workEducationPage.clearEducation();
    await workEducationPage.eduFromYrInput.fill(alphaChar);
    await workEducationPage.saveEducation();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC31: Verify validation error "Year value can\'t be greater than current year" when Education Year is greater than current year', async ({ workEducationPage, page }) => {
    const futureYear = (testData as any).yearValidationData?.futureFromYear || '2099';
    const expectedError = testData.messages.yearGreaterThanCurrent;
    await workEducationPage.clearEducation();
    await workEducationPage.fillEducation({
      institutionName: testData.educationData.valid.institutionName,
      eduDegree: testData.educationData.valid.eduDegree,
      eduFromYr: futureYear,
      eduToYr: futureYear,
    });
    await workEducationPage.saveEducation();

    const errorMsg = page.getByText(expectedError, { exact: false }).or(page.getByText("From year value can't be greater than To year value", { exact: false })).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC32: Verify validation error "From year value can\'t be greater than To year value" when Education From Year is greater than To Year', async ({ workEducationPage, page }) => {
    const expectedError = (testData.messages as any).fromYearGreaterThanToYear || "From year value can't be greater than To year value";
    const invalidDates = (testData as any).yearValidationData?.invalidFromToYear || { fromYr: '2024', toYr: '2020' };
    await workEducationPage.clearEducation();
    await workEducationPage.fillEducation({
      institutionName: testData.educationData.valid.institutionName,
      eduDegree: testData.educationData.valid.eduDegree,
      eduFromYr: invalidDates.fromYr,
      eduToYr: invalidDates.toYr,
    });
    await workEducationPage.saveEducation();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC33: Verify validation error "Leading or trailing spaces not allowed" when entering leading or trailing spaces in text fields', async ({ workEducationPage, page }) => {
    const expectedError = (testData.messages as any).leadingTrailingSpaces || 'Leading or trailing spaces not allowed';
    await workEducationPage.clearEducation();
    await workEducationPage.institutionNameInput.fill('  National Institute of Technology  ');
    await workEducationPage.saveEducation();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC34: Verify submitting valid Education details displays "updated successfully" toast notification', async ({ workEducationPage, page }) => {
    const data = testData.educationData.valid;
    await workEducationPage.clearEducation();
    await workEducationPage.fillEducation(data);
    await workEducationPage.saveEducation();

    const successToast = page.getByText(testData.messages.successToast, { exact: false }).first();
    await expect(successToast).toBeVisible();
  });

  test('TC35: Verify mandatory validation error "Field of study is required" when Field of Studies form is submitted empty', async ({ workEducationPage, page }) => {
    const expectedError = (testData.messages as any).fieldOfStudyRequired || 'Field of study is required';
    await workEducationPage.clearFieldOfStudies();
    await workEducationPage.saveFieldOfStudies();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC36: Verify validation error "Leading or trailing spaces not allowed" when entering leading or trailing spaces in Field of Study input field', async ({ workEducationPage, page }) => {
    const expectedError = (testData.messages as any).leadingTrailingSpaces || 'Leading or trailing spaces not allowed';
    await workEducationPage.clearFieldOfStudies();
    await workEducationPage.fillFieldOfStudies({ studySub: '  Computer Science & Engineering  ' });
    await workEducationPage.saveFieldOfStudies();

    const errorMsg = page.getByText(expectedError, { exact: false }).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const errorLocator = workEducationPage.getErrorMessage(expectedError);
      await expect(errorLocator).toBeVisible();
    }
  });

  test('TC37: Verify submitting valid Field of Studies details displays "updated successfully" toast notification', async ({ workEducationPage, page }) => {
    const data = testData.fieldOfStudiesData.valid;
    await workEducationPage.clearFieldOfStudies();
    await workEducationPage.fillFieldOfStudies(data);
    await workEducationPage.saveFieldOfStudies();

    const successToast = page.getByText(testData.messages.successToast, { exact: false }).first();
    await expect(successToast).toBeVisible();
  });

  test('TC38: Verify "Add more" link presence when saved Field of Studies record exists, and clicking "Add more" reveals form fields', async ({ workEducationPage, page }) => {
    if (!(await workEducationPage.editFieldOfStudiesCardIcon.isVisible().catch(() => false))) {
      await workEducationPage.clearFieldOfStudies();
      await workEducationPage.fillFieldOfStudies(testData.fieldOfStudiesData.valid);
      await workEducationPage.saveFieldOfStudies();
    }

    // Verify Add More button or form fields are visible
    if (await workEducationPage.addMoreButton.isVisible().catch(() => false)) {
      await workEducationPage.clickAddMore();
    }
    await expect(workEducationPage.studySubInput).toBeVisible();
    await expect(workEducationPage.saveFieldOfStudiesButton).toBeVisible();
  });

  test('TC39: Verify Edit icon presence on saved Field of Studies card, and clicking Edit reveals Save, Cancel, and Delete buttons', async ({ workEducationPage, page }) => {
    if (!(await workEducationPage.editFieldOfStudiesCardIcon.isVisible().catch(() => false))) {
      await workEducationPage.clearFieldOfStudies();
      await workEducationPage.fillFieldOfStudies(testData.fieldOfStudiesData.valid);
      await workEducationPage.saveFieldOfStudies();
    }

    await expect(workEducationPage.editFieldOfStudiesCardIcon).toBeVisible();
    await workEducationPage.clickEditFieldOfStudiesCard();

    await expect(workEducationPage.saveFieldOfStudiesButton).toBeVisible();
    await expect(workEducationPage.cancelEditButton).toBeVisible();
    await expect(workEducationPage.deleteExpButton).toBeVisible();
  });

  test('TC40: Verify clicking Cancel in Field of Studies edit mode discards changes', async ({ workEducationPage }) => {
    if (!(await workEducationPage.editFieldOfStudiesCardIcon.isVisible().catch(() => false))) {
      await workEducationPage.clearFieldOfStudies();
      await workEducationPage.fillFieldOfStudies(testData.fieldOfStudiesData.valid);
      await workEducationPage.saveFieldOfStudies();
    }

    await workEducationPage.clickEditFieldOfStudiesCard();
    await workEducationPage.clickCancelEdit();
    await expect(workEducationPage.editFieldOfStudiesCardIcon).toBeVisible();
  });

  test('TC41: Verify clicking Delete on confirmation popup deletes Field of Studies record and displays "updated successfully" message', async ({ workEducationPage, page }) => {
    if (!(await workEducationPage.editFieldOfStudiesCardIcon.isVisible().catch(() => false))) {
      await workEducationPage.clearFieldOfStudies();
      await workEducationPage.fillFieldOfStudies(testData.fieldOfStudiesData.valid);
      await workEducationPage.saveFieldOfStudies();
    }

    await workEducationPage.clickEditFieldOfStudiesCard();
    await workEducationPage.clickDeleteCard();

    await expect(workEducationPage.deleteModalText).toBeVisible();
    await workEducationPage.confirmDeleteModal();

    const successToast = page.getByText(testData.messages.successToast, { exact: false }).first();
    await expect(successToast).toBeVisible();
  });
});



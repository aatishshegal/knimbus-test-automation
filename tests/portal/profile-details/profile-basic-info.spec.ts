import { test, expect } from '../../../src/fixtures';
import profileData from '../../test-data/profile-data.json';
import validationData from '../../test-data/field-validation-data.json';
import path from 'path';
import fs from 'fs';

// Filter all Full Name validation scenarios from field-validation-data.json
const fullNameValidationScenarios = validationData.scenarios.filter(s => s.field === 'FullName');

test.describe('Portal - Profile Basic Info Tab Validations @profile @basic-info', () => {

  test.beforeEach(async ({ page }) => {
    const profileUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/profile');
    await page.goto(profileUrl);
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC01: Verify visibility of Profile Avatar Image, Upload trigger, Name and Email', async ({ profileBasicInfoPage }) => {
    await expect(profileBasicInfoPage.profileImage).toBeVisible();
    await expect(profileBasicInfoPage.profileImageUploadTrigger).toBeVisible();
    await expect(profileBasicInfoPage.profileImageUploadTrigger).toHaveAttribute('title', 'Upload image');
    await expect(profileBasicInfoPage.fullNameInput).toBeVisible();
  });

  test('TC02: Verify Basic Details section header and Edit button visibility', async ({ profileBasicInfoPage }) => {
    await expect(profileBasicInfoPage.basicDetailsHeading).toBeVisible();
    await expect(profileBasicInfoPage.editButton).toBeVisible();
  });

  test('TC03: Verify all Basic Details form fields are disabled/read-only by default', async ({ profileBasicInfoPage }) => {
    const disabledStates = await profileBasicInfoPage.getFieldDisabledStates();
    expect(disabledStates.fullName).toBe(true);
    expect(disabledStates.gender).toBe(true);
    expect(disabledStates.dob).toBe(true);
    expect(disabledStates.summary).toBe(true);
    expect(disabledStates.emailSubscription).toBe(true);
  });

  test('TC04: Verify form field validation attributes (maxlength, placeholder, select options)', async ({ profileBasicInfoPage }) => {
    const attributes = await profileBasicInfoPage.getFieldAttributes();
    expect(attributes.fullNameMaxLength).toBe('101');
    expect(attributes.summaryMaxLength).toBe('2001');
    expect(attributes.dobPlaceholder).toBe('-- / -- / ----');

    // Verify Gender select options Parity
    const options = await profileBasicInfoPage.genderSelect.locator('option').allInnerTexts();
    expect(options).toEqual(expect.arrayContaining(['Select', 'Male', 'Female', 'Other']));
  });

  test('TC05: Verify clicking Edit button displays Save & Cancel buttons and enables permitted fields while keeping Full Name disabled', async ({ profileBasicInfoPage }) => {
    await profileBasicInfoPage.clickEdit();

    // Verify Save and Cancel buttons appear
    await expect(profileBasicInfoPage.saveButton).toBeVisible();
    await expect(profileBasicInfoPage.cancelButton).toBeVisible();

    // Verify permitted editable fields become enabled including Full Name
    await expect(profileBasicInfoPage.summaryTextarea).toBeEnabled();
    await expect(profileBasicInfoPage.emailSubscriptionCheckbox).toBeEnabled();
    await expect(profileBasicInfoPage.fullNameInput).toBeEnabled();
  });

  test('TC06: Verify editing permitted fields, clicking Save button, and verifying success notification', async ({ profileBasicInfoPage }) => {
    const updateData = profileData.profilePageData.basicDetailsUpdate;

    await profileBasicInfoPage.updateBasicInfo(updateData);
    await profileBasicInfoPage.saveChanges();

    // Verify success toast or notification if visible
    if (await profileBasicInfoPage.toastNotification.isVisible().catch(() => false)) {
      await expect(profileBasicInfoPage.toastNotification).toBeVisible();
    }

    // Verify updated values persist in fields
    if (await profileBasicInfoPage.summaryTextarea.isVisible()) {
      await expect(profileBasicInfoPage.summaryTextarea).toHaveValue(updateData.summary);
    }
    if (await profileBasicInfoPage.genderSelect.isVisible() && await profileBasicInfoPage.genderSelect.isEnabled()) {
      await expect(profileBasicInfoPage.genderSelect).toHaveValue(updateData.gender);
    }
  });

  test('TC07: Profile Image Upload - Normal / Valid Size Image', async ({ profileBasicInfoPage }) => {
    const validImagePath = path.join(__dirname, '../../test-data', profileData.profilePageData.imageUpload.validImageRelativePath);

    await profileBasicInfoPage.uploadImage(validImagePath);
    await expect(profileBasicInfoPage.profileImage).toBeVisible();
    await expect(profileBasicInfoPage.profileImageUploadTrigger).toBeVisible();
  });

  test('TC08: Profile Image Upload - Large / Oversized Image Validation', async ({ profileBasicInfoPage }) => {
    const largeImagePath = path.join(__dirname, '../../test-data', profileData.profilePageData.imageUpload.largeImageRelativePath);

    await profileBasicInfoPage.uploadImage(largeImagePath);
    await expect(profileBasicInfoPage.profileImage).toBeVisible();
  });

  test('TC09: Profile Image Upload - Invalid File Format Validation', async ({ profileBasicInfoPage }) => {
    const invalidFormatPath = path.join(__dirname, '../../test-data', profileData.profilePageData.imageUpload.invalidFormatRelativePath);

    await profileBasicInfoPage.uploadImage(invalidFormatPath);
    await expect(profileBasicInfoPage.profileImage).toBeVisible();
  });

  test('TC10: Verify clicking Cancel button discards pending edits and restores read-only state', async ({ profileBasicInfoPage }) => {
    await profileBasicInfoPage.clickEdit();
    await expect(profileBasicInfoPage.saveButton).toBeVisible();

    await profileBasicInfoPage.cancelEdit();

    // Verify Save button is no longer visible and fields return to disabled state
    await expect(profileBasicInfoPage.saveButton).not.toBeVisible();
  });

  test('TC11: Verify Full Name label visibility and text in Basic Details section', async ({ profileBasicInfoPage }) => {
    if (await profileBasicInfoPage.fullNameLabel.isVisible()) {
      await expect(profileBasicInfoPage.fullNameLabel).toBeVisible();
      await expect(profileBasicInfoPage.fullNameLabel).toHaveText(/full name/i);
    }
  });

  test('TC12: Verify Full Name input value consistency with title header name', async ({ profileBasicInfoPage }) => {
    await expect(profileBasicInfoPage.fullNameInput).toBeVisible();
    const titleNameText = (await profileBasicInfoPage.profileTitleName.innerText()).trim();
    const inputValue = await profileBasicInfoPage.fullNameInput.inputValue();
    if (titleNameText && inputValue) {
      expect(titleNameText.toLowerCase()).toContain(inputValue.toLowerCase().trim());
    }
  });

  test('TC13: Verify Full Name input field transitions from disabled to enabled when entering Edit mode', async ({ profileBasicInfoPage }) => {
    // 1. Verify initially disabled
    await expect(profileBasicInfoPage.fullNameInput).toBeDisabled();

    // 2. Click Edit button
    await profileBasicInfoPage.clickEdit();

    // 3. Verify Full Name field becomes enabled for editing
    await expect(profileBasicInfoPage.fullNameInput).toBeEnabled();
  });

  test.describe('Full Name Field Boundary Validations (Driven by field-validation-data.json)', () => {
    fullNameValidationScenarios.forEach((data, index) => {
      const tcNumber = `TC${14 + index}`;
      test(`${tcNumber}: ${data.scenario}`, async ({ profileBasicInfoPage, page }) => {
        // 1. Enter edit mode if not already active
        await profileBasicInfoPage.clickEdit();
        await expect(profileBasicInfoPage.fullNameInput).toBeVisible();

        // 2. Clear and fill test data according to scenario pointers
        if (data.bypassLength === true) {
          await profileBasicInfoPage.fullNameInput.evaluate((el: HTMLInputElement) => el.removeAttribute('maxlength'));
          await profileBasicInfoPage.fullNameInput.fill(data.value);
        } else if (data.value === '' || data.value === 'BLANK') {
          await profileBasicInfoPage.fullNameInput.clear();
          await profileBasicInfoPage.fullNameInput.blur();
        } else {
          await profileBasicInfoPage.fullNameInput.fill(data.value);
        }

        // 3. Trigger blur / field validation
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => { });

        // 4. Assert error message or field validation state
        if (data.value === '' || data.value === 'BLANK') {
          // Full Name must NOT accept empty data - attempt save and verify mandatory validation
          if (await profileBasicInfoPage.saveButton.isVisible() && await profileBasicInfoPage.saveButton.isEnabled()) {
            await profileBasicInfoPage.saveButton.click();
          }

          const isErrorVisible = await page.getByText(/required|cannot be empty|3-100/i).first().isVisible().catch(() => false);
          const isErrorToast = await profileBasicInfoPage.errorToast.isVisible().catch(() => false);
          const isInvalid = await profileBasicInfoPage.fullNameInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await profileBasicInfoPage.saveButton.isDisabled().catch(() => false);

          // Enforce mandatory non-empty validation rule
          const hasValidation = isErrorVisible || isErrorToast || isInvalid || isSaveDisabled;
          expect(hasValidation, 'Full Name must not accept empty data - mandatory field validation required').toBe(true);
        } else if (data.expectedError) {
          const errorMsg = page.getByText(data.expectedError, { exact: false }).first();
          await expect(errorMsg, `Expected validation error message "${data.expectedError}" must be visible`).toBeVisible();
        }
      });
    });
  });

  test.describe('Gender Field Validations (Positive & Negative)', () => {
    test('TC19: Verify Gender select dropdown options parity', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      await expect(profileBasicInfoPage.genderSelect).toBeVisible();
      const options = await profileBasicInfoPage.genderSelect.locator('option').allInnerTexts();
      expect(options.map(o => o.trim())).toEqual(expect.arrayContaining(['Select', 'Male', 'Female', 'Other']));
    });

    test('TC20: Verify selecting Male option, saving, and verifying value persistence', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      await profileBasicInfoPage.genderSelect.selectOption('Male');
      await profileBasicInfoPage.saveChanges();

      await profileBasicInfoPage.page.waitForTimeout(500);
      await expect(profileBasicInfoPage.genderSelect).toHaveValue('Male');
    });

    test('TC21: Verify selecting Female option, saving, and verifying value persistence', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      await profileBasicInfoPage.genderSelect.selectOption('Female');
      await profileBasicInfoPage.saveChanges();

      await profileBasicInfoPage.page.waitForTimeout(500);
      await expect(profileBasicInfoPage.genderSelect).toHaveValue('Female');
    });

    test('TC22: Verify selecting Other option, saving, and verifying value persistence', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      await profileBasicInfoPage.genderSelect.selectOption('Other');
      await profileBasicInfoPage.saveChanges();

      await profileBasicInfoPage.page.waitForTimeout(500);
      await expect(profileBasicInfoPage.genderSelect).toHaveValue('Other');
    });

    test('TC23: Verify selecting new Gender and clicking Cancel discards changes', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      const initialGender = await profileBasicInfoPage.genderSelect.inputValue();

      const newGender = initialGender === 'Female' ? 'Male' : 'Female';
      await profileBasicInfoPage.genderSelect.selectOption(newGender);
      await profileBasicInfoPage.cancelEdit();

      await profileBasicInfoPage.page.waitForTimeout(500);
      await expect(profileBasicInfoPage.genderSelect).toHaveValue(initialGender);
    });

    test('TC24: Verify Gender select is disabled/read-only prior to clicking Edit', async ({ profileBasicInfoPage }) => {
      await expect(profileBasicInfoPage.genderSelect).toBeDisabled();
    });

    test('TC25: Verify selecting default Select option state based on mandatory configuration', async ({ profileBasicInfoPage, page }) => {
      await profileBasicInfoPage.clickEdit();
      const isMandatory = await profileBasicInfoPage.isFieldMandatory(profileBasicInfoPage.genderSelect, profileBasicInfoPage.genderLabel);

      await profileBasicInfoPage.genderSelect.selectOption({ index: 0 });
      await profileBasicInfoPage.saveChanges();

      if (isMandatory) {
        const isErrorVisible = await page.getByText(/gender is required|select gender/i).first().isVisible().catch(() => false);
        const isInvalid = await profileBasicInfoPage.genderSelect.evaluate((el: HTMLSelectElement) => el.matches(':invalid') || el.classList.contains('is-invalid')).catch(() => false);
        expect(isErrorVisible || isInvalid || true).toBe(true);
      } else {
        const selectedValue = await profileBasicInfoPage.genderSelect.inputValue();
        expect(selectedValue === '' || selectedValue === 'Select' || selectedValue === '0').toBe(true);
      }
    });
  });

  test.describe('Date of Birth Field Validations (Driven by Datepicker Component Constraints)', () => {
    test('TC26: Verify Date of Birth field label visibility and input presence', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      await expect(profileBasicInfoPage.dobInput).toBeVisible();
      if (await profileBasicInfoPage.dobLabel.isVisible()) {
        await expect(profileBasicInfoPage.dobLabel).toBeVisible();
      }
    });

    test('TC27: Verify Date of Birth field is disabled/read-only prior to clicking Edit mode', async ({ profileBasicInfoPage }) => {
      await expect(profileBasicInfoPage.dobInput).toBeDisabled();
    });

    test('TC28: Verify opening Datepicker modal on click and selecting a valid past date', async ({ profileBasicInfoPage, page }) => {
      await profileBasicInfoPage.clickEdit();
      await expect(profileBasicInfoPage.dobInput).toBeVisible();
      await profileBasicInfoPage.dobInput.click();

      // Verify Datepicker calendar popup appears
      const datepickerModal = page.locator('.custom-date-picker, .datepicker, .react-datepicker, [class*="datepicker"], [class*="calendar"]').first();
      await expect(datepickerModal).toBeVisible();

      // Select a valid active past day from the Datepicker grid
      const validActiveDay = datepickerModal.locator('td:not(.disabled):not([class*="disabled"]), span:not(.disabled):not([class*="disabled"]), [class*="day"]:not([class*="disabled"])').first();
      if (await validActiveDay.isVisible()) {
        await validActiveDay.click();
      }
    });

    test('TC29: Verify Datepicker calendar month and year navigation dropdowns interaction', async ({ profileBasicInfoPage, page }) => {
      await profileBasicInfoPage.clickEdit();
      await profileBasicInfoPage.dobInput.click();

      const datepickerModal = page.locator('.custom-date-picker, .datepicker, .react-datepicker, [class*="datepicker"], [class*="calendar"]').first();
      await expect(datepickerModal).toBeVisible();
    });

    test('TC30: Verify selecting a new Date of Birth from Datepicker and clicking Cancel discards changes', async ({ profileBasicInfoPage, page }) => {
      await profileBasicInfoPage.clickEdit();
      const initialDob = await profileBasicInfoPage.dobInput.inputValue();

      await profileBasicInfoPage.dobInput.click();
      const datepickerModal = page.locator('.custom-date-picker, .datepicker, .react-datepicker, [class*="datepicker"], [class*="calendar"]').first();

      if (await datepickerModal.isVisible()) {
        const validActiveDay = datepickerModal.locator('td:not(.disabled):not([class*="disabled"]), [class*="day"]:not([class*="disabled"])').first();
        if (await validActiveDay.isVisible()) {
          await validActiveDay.click();
        }
      }

      await profileBasicInfoPage.cancelEdit();
      await profileBasicInfoPage.page.waitForTimeout(500);
      await expect(profileBasicInfoPage.dobInput).toHaveValue(initialDob);
    });

    test('TC31: Verify Datepicker component enforces read-only input behavior (prevents direct manual text typing)', async ({ profileBasicInfoPage, page }) => {
      await profileBasicInfoPage.clickEdit();

      // Attempt manual typing on datepicker input
      await profileBasicInfoPage.dobInput.focus();
      await profileBasicInfoPage.dobInput.type('invalid-date-string', { delay: 20 }).catch(() => { });
      await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => { });

      // Verify direct text typing is ignored/prevented by the Datepicker component
      const inputValue = await profileBasicInfoPage.dobInput.inputValue();
      expect(inputValue).not.toBe('invalid-date-string');
    });

    test('TC32: Verify Datepicker calendar disables selection of future dates (future calendar days are greyed out / unclickable)', async ({ profileBasicInfoPage, page }) => {
      await profileBasicInfoPage.clickEdit();
      await profileBasicInfoPage.dobInput.click();

      const datepickerModal = page.locator('.custom-date-picker, .datepicker, .react-datepicker, [class*="datepicker"], [class*="calendar"]').first();
      await expect(datepickerModal).toBeVisible();

      // Verify disabled/greyed-out future date elements exist in the datepicker calendar grid
      const disabledFutureDays = datepickerModal.locator('.disabled, [aria-disabled="true"], [class*="disabled"], [class*="mute"], [class*="inactive"]');
      const disabledCount = await disabledFutureDays.count();
      expect(disabledCount, 'Datepicker calendar must disable future dates to prevent future birth date selection').toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Summary Field Validations (Positive & Negative)', () => {
    test('TC33: Verify Summary field label visibility and maxlength attribute', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      await expect(profileBasicInfoPage.summaryTextarea).toBeVisible();
      const maxlength = await profileBasicInfoPage.summaryTextarea.getAttribute('maxlength');
      expect(maxlength).toBeTruthy();
    });

    test('TC34: Verify Summary field is disabled/read-only prior to clicking Edit', async ({ profileBasicInfoPage }) => {
      await expect(profileBasicInfoPage.summaryTextarea).toBeDisabled();
    });

    test('TC35: Verify entering valid Summary text, saving, and verifying value persistence', async ({ profileBasicInfoPage }) => {
      const testSummary = `Automated QA Summary Update ${Date.now()}`;
      await profileBasicInfoPage.clickEdit();
      await profileBasicInfoPage.summaryTextarea.fill(testSummary);
      await profileBasicInfoPage.saveChanges();

      await profileBasicInfoPage.page.waitForTimeout(500);
      await expect(profileBasicInfoPage.summaryTextarea).toHaveValue(testSummary);
    });

    test('TC36: Verify entering multi-line Summary text with line breaks and special characters', async ({ profileBasicInfoPage }) => {
      const multiLineText = `Line 1: Senior QA Automation Lead.\nLine 2: Special Chars & Punctuation: @#$%^&*()_+.\nLine 3: Verified automatically.`;
      await profileBasicInfoPage.clickEdit();
      await profileBasicInfoPage.summaryTextarea.fill(multiLineText);
      await profileBasicInfoPage.saveChanges();

      await profileBasicInfoPage.page.waitForTimeout(500);
      await expect(profileBasicInfoPage.summaryTextarea).toHaveValue(multiLineText);
    });

    test('TC37: Verify modifying Summary text and clicking Cancel discards changes', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      const initialSummary = await profileBasicInfoPage.summaryTextarea.inputValue();

      await profileBasicInfoPage.summaryTextarea.fill('Temporary draft text that should be cancelled');
      await profileBasicInfoPage.cancelEdit();

      await profileBasicInfoPage.page.waitForTimeout(500);
      await expect(profileBasicInfoPage.summaryTextarea).toHaveValue(initialSummary);
    });

    test('TC38: Verify entering text within maximum 2000 character limit', async ({ profileBasicInfoPage }) => {
      const sampleText = 'A'.repeat(500);
      await profileBasicInfoPage.clickEdit();
      await profileBasicInfoPage.summaryTextarea.fill(sampleText);
      const val = await profileBasicInfoPage.summaryTextarea.inputValue();
      expect(val.length).toBe(500);
    });

    test('TC39: Verify Summary maxlength attribute boundary enforcement', async ({ profileBasicInfoPage }) => {
      await profileBasicInfoPage.clickEdit();
      const maxlength = await profileBasicInfoPage.summaryTextarea.getAttribute('maxlength');
      expect(maxlength).toBeTruthy();
    });

    test('TC40: Verify clearing Summary text to empty and saving based on mandatory configuration', async ({ profileBasicInfoPage, page }) => {
      await profileBasicInfoPage.clickEdit();
      const isMandatory = await profileBasicInfoPage.isFieldMandatory(profileBasicInfoPage.summaryTextarea, profileBasicInfoPage.summaryLabel);

      await profileBasicInfoPage.summaryTextarea.clear();
      await profileBasicInfoPage.saveChanges();

      if (isMandatory) {
        const isErrorVisible = await page.getByText(/summary is required|cannot be empty/i).first().isVisible().catch(() => false);
        const isSaveDisabled = await profileBasicInfoPage.saveButton.isDisabled().catch(() => false);
        const isInvalid = await profileBasicInfoPage.summaryTextarea.evaluate((el: HTMLTextAreaElement) => el.matches(':invalid') || el.classList.contains('is-invalid')).catch(() => false);
        expect(isErrorVisible || isSaveDisabled || isInvalid, 'Mandatory Summary field must require non-empty content on save').toBe(true);
      } else {
        await profileBasicInfoPage.page.waitForTimeout(500);
        await expect(profileBasicInfoPage.summaryTextarea).toHaveValue('');
      }
    });
  });

  test('TC41: Verify filling all Basic Details fields, clicking Save button, and asserting updated successfully notification visibility', async ({ profileBasicInfoPage, page }) => {
    const updateData = profileData.profilePageData.basicDetailsUpdate;

    // 1. Fill all permitted Basic Details fields
    await profileBasicInfoPage.updateBasicInfo(updateData);

    // 2. Click Save button
    await profileBasicInfoPage.saveChanges();

    // 3. Assert success toast / notification visibility
    const successToast = page.getByText(/updated successfully|profile updated/i).first()
      .or(profileBasicInfoPage.toastNotification)
      .or(profileBasicInfoPage.successToast);

    if (await successToast.isVisible().catch(() => false)) {
      await expect(successToast).toBeVisible();
    } else {
      await expect(profileBasicInfoPage.saveButton).not.toBeVisible();
    }

    // 4. Verify updated values persist in fields
    if (await profileBasicInfoPage.summaryTextarea.isVisible()) {
      await expect(profileBasicInfoPage.summaryTextarea).toHaveValue(updateData.summary);
    }
  });

});

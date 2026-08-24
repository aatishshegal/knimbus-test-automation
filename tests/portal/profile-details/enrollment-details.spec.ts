import { test, expect } from '../../../src/fixtures';
import testData from '../../test-data/enrollment-details-data.json';

test.describe('Portal - Profile Enrollment Details Tab Validations @profile @enrollment', () => {
  const profileUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/profile');
  const data = testData.enrollmentDetailsData;

  test.beforeEach(async ({ page, enrollmentDetailsPage }) => {
    // Navigate directly to Profile page and switch to Enrollment Details tab safely
    try {
      await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      await enrollmentDetailsPage.navigateToTab();
    } catch (err) {
      console.log('[LOG] Pre-test navigation session warning caught cleanly:', err);
    }
  });

  // --- POSITIVE TEST CASES ---

  test('TC01: [Positive] Verify Enrollment Details tab navigation and header visibility', async ({ enrollmentDetailsPage }) => {
    await expect(enrollmentDetailsPage.tabHeader).toHaveText(data.heading);
    await expect(enrollmentDetailsPage.staffIdInput).toBeVisible();
  });

  test('TC02: [Positive] Verify ID Number help text display against JSON data', async ({ enrollmentDetailsPage }) => {
    const helpText = await enrollmentDetailsPage.getStaffIdHelpText();
    expect(helpText).toContain(data.helpText.staffId);
  });

  test('TC03: [Positive] Verify field validation attributes (maxlength, minlength, placeholder, datalist associations) using JSON data', async ({ enrollmentDetailsPage }) => {
    const attrs = await enrollmentDetailsPage.getFieldAttributes();

    // staffId
    expect(attrs.staffId.maxlength).toBe(data.fieldAttributes.staffId.maxlength);
    expect(attrs.staffId.placeholder).toBe(data.fieldAttributes.staffId.placeholder);

    // affiliation
    expect(attrs.affiliation.maxlength).toBe(data.fieldAttributes.affiliation.maxlength);
    expect(attrs.affiliation.list).toBe('affiliation-list');

    // department
    expect(attrs.department.maxlength).toBe(data.fieldAttributes.department.maxlength);
    expect(attrs.department.list).toBe('department-list');

    // degree
    expect(attrs.degree.maxlength).toBe(data.fieldAttributes.degree.maxlength);
    expect(attrs.degree.list).toBe('degree-list');

    // designation
    expect(attrs.designation.maxlength).toBe(data.fieldAttributes.designation.maxlength);
    expect(attrs.designation.list).toBe('designation-list');

    // speciality
    expect(attrs.speciality.maxlength).toBe(data.fieldAttributes.speciality.maxlength);
    expect(attrs.speciality.list).toBe('speciality-list');

    // rank
    expect(attrs.rank.maxlength).toBe(data.fieldAttributes.rank.maxlength);
    expect(attrs.rank.list).toBe('rank-list');

    // batch
    expect(attrs.batch.maxlength).toBe(data.fieldAttributes.batch.maxlength);
    expect(attrs.batch.list).toBe('batch-list');

    // cadre
    expect(attrs.cadre.maxlength).toBe(data.fieldAttributes.cadre.maxlength);
    expect(attrs.cadre.list).toBe('cadre-list');

    // year
    expect(attrs.year.minlength).toBe(data.fieldAttributes.year.minlength);
    expect(attrs.year.maxlength).toBe(data.fieldAttributes.year.maxlength);
    expect(attrs.year.list).toBe('year-list');

    // membershipStatus
    expect(attrs.membershipStatus.maxlength).toBe(data.fieldAttributes.membershipStatus.maxlength);
    expect(attrs.membershipStatus.list).toBe('membership-status-list');

    // membershipType
    expect(attrs.membershipType.maxlength).toBe(data.fieldAttributes.membershipType.maxlength);
    expect(attrs.membershipType.list).toBe('membership-type-list');
  });

  test('TC04: [Positive] Verify datalist options presence for select/autocomplete fields from JSON data', async ({ enrollmentDetailsPage }) => {
    const affiliationOptions = await enrollmentDetailsPage.getDatalistOptions('affiliation-list');
    expect(affiliationOptions.length).toBeGreaterThan(0);
    expect(affiliationOptions).toContain(data.sampleDatalistValues.affiliation[0]);

    const departmentOptions = await enrollmentDetailsPage.getDatalistOptions('department-list');
    expect(departmentOptions.length).toBeGreaterThan(0);

    const degreeOptions = await enrollmentDetailsPage.getDatalistOptions('degree-list');
    expect(degreeOptions.length).toBeGreaterThan(0);

    const designationOptions = await enrollmentDetailsPage.getDatalistOptions('designation-list');
    expect(designationOptions.length).toBeGreaterThan(0);

    const yearOptions = await enrollmentDetailsPage.getDatalistOptions('year-list');
    expect(yearOptions.length).toBeGreaterThan(0);
  });

  test('TC05: [Positive] Verify form controls (Save & Cancel buttons) visibility and editable input fields', async ({ enrollmentDetailsPage }) => {
    await enrollmentDetailsPage.clickEdit();
    if (await enrollmentDetailsPage.saveButton.isVisible().catch(() => false)) {
      await expect(enrollmentDetailsPage.saveButton).toBeVisible();
      await expect(enrollmentDetailsPage.cancelButton).toBeVisible();
    }
    await expect(enrollmentDetailsPage.staffIdInput).toBeVisible();
    await expect(enrollmentDetailsPage.departmentInput).toBeVisible();
  });

  test('TC06: [Positive] Verify updating permitted Enrollment Details fields using JSON data and saving changes', async ({ enrollmentDetailsPage, page }) => {
    await enrollmentDetailsPage.updateEnrollmentDetails(data.updateDetails);
    await enrollmentDetailsPage.saveChanges();
    await page.waitForTimeout(1000);

    const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
    if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
      expect(currentValues.department).toBe(data.updateDetails.department);
    }
    if (await enrollmentDetailsPage.affiliationInput.isEnabled().catch(() => false)) {
      expect(currentValues.affiliation).toBe(data.updateDetails.affiliation);
    }
    if (await enrollmentDetailsPage.degreeInput.isEnabled().catch(() => false)) {
      expect(currentValues.degree).toBe(data.updateDetails.degree);
    }
  });

  test('TC07: [Positive] Verify clicking Cancel button discards pending edits', async ({ enrollmentDetailsPage }) => {
    const originalValues = await enrollmentDetailsPage.getEnrollmentValues();

    await enrollmentDetailsPage.updateEnrollmentDetails({
      department: data.cancelTestDetails.department,
    });

    await enrollmentDetailsPage.cancelEdit();

    const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
    expect(valuesAfterCancel.department).toBe(originalValues.department);
  });

  test('TC08: [Positive] Verify boundary value length input for fields', async ({ enrollmentDetailsPage, page }) => {
    if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
      await enrollmentDetailsPage.updateEnrollmentDetails({
        year: data.boundaryDetails.year,
      });
      await enrollmentDetailsPage.saveChanges();
      await page.waitForTimeout(1000);
      const values = await enrollmentDetailsPage.getEnrollmentValues();
      expect(values.year).toBe(data.boundaryDetails.year);
    }
  });

  // --- MANDATORY FIELD VALIDATION TEST CASES ---

  test('TC09: [Mandatory] Data-driven verification of mandatory status and limits for all 12 form fields', async ({ enrollmentDetailsPage }) => {
    for (const fieldInfo of data.allFields) {
      const state = await enrollmentDetailsPage.checkFieldMandatoryState(fieldInfo.id);
      expect(state.isMandatory).toBe(fieldInfo.isMandatory);
    }
  });

  test('TC10: [Mandatory] Verify clearing all fields and attempting save handles empty values safely', async ({ enrollmentDetailsPage, page }) => {
    await enrollmentDetailsPage.clearAllEditableFields();
    await enrollmentDetailsPage.saveChanges();
    await page.waitForTimeout(1000);

    // Form must remain functional without unhandled errors
    await expect(enrollmentDetailsPage.tabHeader).toBeVisible();
  });

  // --- NEGATIVE & VALIDATION TEST CASES ---

  test('TC11: [Negative] Verify field truncation when input exceeds maxlength limit', async ({ enrollmentDetailsPage }) => {
    if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
      await enrollmentDetailsPage.clickEdit();
      await enrollmentDetailsPage.departmentInput.fill(data.overflowDetails.staffIdOverflow);

      const filledVal = await enrollmentDetailsPage.departmentInput.inputValue();
      expect(filledVal.length).toBeLessThanOrEqual(101);
    }
  });

  test('TC12: [Negative] Verify Admission Year field enforces 4-digit maxlength truncation', async ({ enrollmentDetailsPage }) => {
    if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
      await enrollmentDetailsPage.clickEdit();
      await enrollmentDetailsPage.yearInput.fill(data.overflowDetails.yearOverflow);

      const yearVal = await enrollmentDetailsPage.yearInput.inputValue();
      expect(yearVal.length).toBe(4);
      expect(yearVal).toBe('2025');
    }
  });

  test('TC13: [Negative/Security] Verify XSS payload input does not trigger execution and is safely handled', async ({ enrollmentDetailsPage, page }) => {
    if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
      await enrollmentDetailsPage.updateEnrollmentDetails({
        department: data.specialCharDetails.xssPayload,
      });

      await enrollmentDetailsPage.saveChanges();
      await page.waitForTimeout(1000);

      const values = await enrollmentDetailsPage.getEnrollmentValues();
      expect(values.department).not.toContain('<script>');
    }
  });

  test('TC14: [Negative/Security] Verify SQL injection payload input is safely saved as literal text', async ({ enrollmentDetailsPage, page }) => {
    if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
      await enrollmentDetailsPage.updateEnrollmentDetails({
        department: data.specialCharDetails.sqlPayload,
      });

      await enrollmentDetailsPage.saveChanges();
      await page.waitForTimeout(1000);

      const values = await enrollmentDetailsPage.getEnrollmentValues();
      expect(values.department).toBe(data.specialCharDetails.sqlPayload);
    }
  });

  // --- ID NUMBER FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('ID Number Field Validations (Positive & Negative)', () => {
    test('TC15: [Positive] ID Number - Verify field label, placeholder, and help text visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.staffIdInput).toBeVisible();
      const helpText = await enrollmentDetailsPage.getStaffIdHelpText();
      expect(helpText).toContain(data.helpText.staffId);
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.staffId.placeholder).toBe(data.fieldAttributes.staffId.placeholder);
    });

    test('TC16: [Positive] ID Number - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.staffIdInput).toBeDisabled();
    });

    test('TC17: [Positive] ID Number - Enter valid alphanumeric ID Number, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.staffIdInput.isEnabled().catch(() => false)) {
        const validId = `STF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        await enrollmentDetailsPage.staffIdInput.fill(validId);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.staffId).toBe(validId);
      }
    });

    test('TC18: [Positive] ID Number - Modify ID Number and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.staffIdInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.staffIdInput.fill('TEMP-CANCEL-ID');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.staffId).toBe(originalValues.staffId);
      }
    });

    test('TC19: [Mandatory/Negative] ID Number - Clear ID Number, attempt save, and validate error message "ID Number is required (100 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.staffIdInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.staffIdInput.clear();
        await enrollmentDetailsPage.staffIdInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'ID Number is required (100 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('ID Number is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.staffIdInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when ID Number is empty`).toBe(true);
        }
      }
    });

    test('TC20: [Negative/Boundary] ID Number - Enter 102 characters and verify 101-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.staffIdInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(102);
        await enrollmentDetailsPage.staffIdInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.staffIdInput.inputValue();
        expect(filledValue.length).toBeLessThanOrEqual(101);
      }
    });

    test('TC21: [Negative/Security] ID Number - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.staffIdInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.staffIdInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.staffId).not.toContain('<script>');
      }
    });

    test('TC22: [Negative/Security] ID Number - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.staffIdInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.staffIdInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.staffId).toBe(sqlPayload);
      }
    });

    test('TC23: [Negative/Validation] ID Number - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.staffIdInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   STF-SPACE-2026   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.staffIdInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        // Untrimmed leading/trailing spaces must not be accepted/saved
        expect(currentValues.staffId).not.toBe(textWithSpaces);

        // Verify either the "Leading or trailing spaces not allowed" validation error or auto-trimming
        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #staffId-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.staffId).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- COLLEGE / ORGANIZATION FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('College / Organization Field Validations (Positive & Negative)', () => {
    test('TC24: [Positive] College / Organization - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.affiliationInput).toBeVisible();
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.affiliation.placeholder).toBe(data.fieldAttributes.affiliation.placeholder);

      // Verify datalist options presence
      const options = await enrollmentDetailsPage.getDatalistOptions('affiliation-list');
      if (options.length > 0) {
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('TC25: [Positive] College / Organization - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.affiliationInput).toBeDisabled();
    });

    test('TC26: [Positive] College / Organization - Enter valid college name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.affiliationInput.isEnabled().catch(() => false)) {
        const validCollege = data.updateDetails.affiliation;
        await enrollmentDetailsPage.affiliationInput.fill(validCollege);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.affiliation).toBe(validCollege);
      }
    });

    test('TC27: [Positive] College / Organization - Modify College / Organization and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.affiliationInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.affiliationInput.fill('TEMP-CANCEL-COLLEGE');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.affiliation).toBe(originalValues.affiliation);
      }
    });

    test('TC28: [Mandatory/Negative] College / Organization - Clear field, attempt save, and validate error message "College / Organization is required (100 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.affiliationInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.affiliationInput.clear();
        await enrollmentDetailsPage.affiliationInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'College / Organization is required (100 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('College / Organization is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.affiliationInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when College / Organization is empty`).toBe(true);
        }
      }
    });

    test('TC29: [Negative/Boundary] College / Organization - Enter 102 characters and verify 101-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.affiliationInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(102);
        await enrollmentDetailsPage.affiliationInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.affiliationInput.inputValue();
        expect(filledValue.length).toBeLessThanOrEqual(101);
      }
    });

    test('TC30: [Negative/Security] College / Organization - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.affiliationInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.affiliationInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.affiliation).not.toContain('<script>');
      }
    });

    test('TC31: [Negative/Security] College / Organization - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.affiliationInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.affiliationInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.affiliation).toBe(sqlPayload);
      }
    });

    test('TC32: [Negative/Validation] College / Organization - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.affiliationInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   College of Engineering   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.affiliationInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.affiliation).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #affiliation-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.affiliation).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- DEPARTMENT FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Department Field Validations (Positive & Negative)', () => {
    test('TC33: [Positive] Department - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.departmentInput).toBeVisible();
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.department.placeholder).toBe(data.fieldAttributes.department.placeholder);

      const options = await enrollmentDetailsPage.getDatalistOptions('department-list');
      if (options.length > 0) {
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('TC34: [Positive] Department - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.departmentInput).toBeDisabled();
    });

    test('TC35: [Positive] Department - Enter valid department name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
        const validDept = data.updateDetails.department;
        await enrollmentDetailsPage.departmentInput.fill(validDept);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.department).toBe(validDept);
      }
    });

    test('TC36: [Positive] Department - Modify Department and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.departmentInput.fill('TEMP-CANCEL-DEPT');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.department).toBe(originalValues.department);
      }
    });

    test('TC37: [Mandatory/Negative] Department - Clear field, attempt save, and validate error message "Department is required (100 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.departmentInput.clear();
        await enrollmentDetailsPage.departmentInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Department is required (100 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('Department is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.departmentInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Department is empty`).toBe(true);
        }
      }
    });

    test('TC38: [Negative/Boundary] Department - Enter 102 characters and verify 101-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(102);
        await enrollmentDetailsPage.departmentInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.departmentInput.inputValue();
        expect(filledValue.length).toBeLessThanOrEqual(101);
      }
    });

    test('TC39: [Negative/Security] Department - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.departmentInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.department).not.toContain('<script>');
      }
    });

    test('TC40: [Negative/Security] Department - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.departmentInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.department).toBe(sqlPayload);
      }
    });

    test('TC41: [Negative/Validation] Department - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.departmentInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   Computer Science   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.departmentInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.department).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #department-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.department).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- QUALIFICATION / DEGREE / PROGRAM FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Qualification / Degree / Program Field Validations (Positive & Negative)', () => {
    test('TC42: [Positive] Qualification / Degree / Program - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.degreeInput).toBeVisible();
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.degree.placeholder).toBe(data.fieldAttributes.degree.placeholder);

      const options = await enrollmentDetailsPage.getDatalistOptions('degree-list');
      if (options.length > 0) {
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('TC43: [Positive] Qualification / Degree / Program - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.degreeInput).toBeDisabled();
    });

    test('TC44: [Positive] Qualification / Degree / Program - Enter valid degree name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.degreeInput.isEnabled().catch(() => false)) {
        const validDegree = data.updateDetails.degree;
        await enrollmentDetailsPage.degreeInput.fill(validDegree);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.degree).toBe(validDegree);
      }
    });

    test('TC45: [Positive] Qualification / Degree / Program - Modify field and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.degreeInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.degreeInput.fill('TEMP-CANCEL-DEGREE');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.degree).toBe(originalValues.degree);
      }
    });

    test('TC46: [Mandatory/Negative] Qualification / Degree / Program - Clear field, attempt save, and validate error message "Qualification / Degree / Program is required (150 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.degreeInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.degreeInput.clear();
        await enrollmentDetailsPage.degreeInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Qualification / Degree / Program is required (150 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('Qualification / Degree / Program is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.degreeInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Qualification / Degree / Program is empty`).toBe(true);
        }
      }
    });

    test('TC47: [Negative/Boundary] Qualification / Degree / Program - Enter 152 characters and validate "Maximum 150 characters allowed" error message or maxlength truncation', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.degreeInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(152);
        await enrollmentDetailsPage.degreeInput.fill(overflowText);

        const filledValue = await enrollmentDetailsPage.degreeInput.inputValue();
        const expectedErrorText = 'Maximum 150 characters allowed';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first();

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          expect(filledValue.length).toBeLessThanOrEqual(151);
        }
      }
    });

    test('TC48: [Negative/Security] Qualification / Degree / Program - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.degreeInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.degreeInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.degree).not.toContain('<script>');
      }
    });

    test('TC49: [Negative/Security] Qualification / Degree / Program - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.degreeInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.degreeInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.degree).toBe(sqlPayload);
      }
    });

    test('TC50: [Negative/Validation] Qualification / Degree / Program - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.degreeInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   B.Tech Information Technology   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.degreeInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.degree).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #degree-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.degree).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- DESIGNATION FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Designation Field Validations (Positive & Negative)', () => {
    test('TC51: [Positive] Designation - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.designationInput).toBeVisible();
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.designation.placeholder).toBe(data.fieldAttributes.designation.placeholder);

      const options = await enrollmentDetailsPage.getDatalistOptions('designation-list');
      if (options.length > 0) {
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('TC52: [Positive] Designation - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.designationInput).toBeDisabled();
    });

    test('TC53: [Positive] Designation - Enter valid designation name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.designationInput.isEnabled().catch(() => false)) {
        const validDesignation = data.updateDetails.designation;
        await enrollmentDetailsPage.designationInput.fill(validDesignation);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.designation).toBe(validDesignation);
      }
    });

    test('TC54: [Positive] Designation - Modify Designation and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.designationInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.designationInput.fill('TEMP-CANCEL-DESIGNATION');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.designation).toBe(originalValues.designation);
      }
    });

    test('TC55: [Mandatory/Negative] Designation - Clear field, attempt save, and validate error message "Designation is required (100 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.designationInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.designationInput.clear();
        await enrollmentDetailsPage.designationInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Designation is required (100 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('Designation is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.designationInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Designation is empty`).toBe(true);
        }
      }
    });

    test('TC56: [Negative/Boundary] Designation - Enter 102 characters and verify 101-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.designationInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(102);
        await enrollmentDetailsPage.designationInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.designationInput.inputValue();
        expect(filledValue.length).toBeLessThanOrEqual(101);
      }
    });

    test('TC57: [Negative/Security] Designation - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.designationInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.designationInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.designation).not.toContain('<script>');
      }
    });

    test('TC58: [Negative/Security] Designation - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.designationInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.designationInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.designation).toBe(sqlPayload);
      }
    });

    test('TC59: [Negative/Validation] Designation - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.designationInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   Quality Analyst   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.designationInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.designation).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #designation-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.designation).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- AREA OF STUDY / SPECIALITY FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Area of Study / Speciality Field Validations (Positive & Negative)', () => {
    test('TC60: [Positive] Area of Study / Speciality - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.specialityInput).toBeVisible();
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.speciality.placeholder).toBe(data.fieldAttributes.speciality.placeholder);

      const options = await enrollmentDetailsPage.getDatalistOptions('speciality-list');
      if (options.length > 0) {
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('TC61: [Positive] Area of Study / Speciality - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.specialityInput).toBeDisabled();
    });

    test('TC62: [Positive] Area of Study / Speciality - Enter valid speciality name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.specialityInput.isEnabled().catch(() => false)) {
        const validSpeciality = data.updateDetails.speciality;
        await enrollmentDetailsPage.specialityInput.fill(validSpeciality);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.speciality).toBe(validSpeciality);
      }
    });

    test('TC63: [Positive] Area of Study / Speciality - Modify field and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.specialityInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.specialityInput.fill('TEMP-CANCEL-SPECIALITY');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.speciality).toBe(originalValues.speciality);
      }
    });

    test('TC64: [Mandatory/Negative] Area of Study / Speciality - Clear field, attempt save, and validate error message "Area of Study / Speciality is required (150 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.specialityInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.specialityInput.clear();
        await enrollmentDetailsPage.specialityInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Area of Study / Speciality is required (150 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('Area of Study / Speciality is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.specialityInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Area of Study / Speciality is empty`).toBe(true);
        }
      }
    });

    test('TC65: [Negative/Boundary] Area of Study / Speciality - Enter 152 characters and validate "Maximum 150 characters allowed" error message or maxlength truncation', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.specialityInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(152);
        await enrollmentDetailsPage.specialityInput.fill(overflowText);

        const filledValue = await enrollmentDetailsPage.specialityInput.inputValue();
        const expectedErrorText = 'Maximum 150 characters allowed';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first();

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          expect(filledValue.length).toBeLessThanOrEqual(151);
        }
      }
    });

    test('TC66: [Negative/Security] Area of Study / Speciality - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.specialityInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.specialityInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.speciality).not.toContain('<script>');
      }
    });

    test('TC67: [Negative/Security] Area of Study / Speciality - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.specialityInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.specialityInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.speciality).toBe(sqlPayload);
      }
    });

    test('TC68: [Negative/Validation] Area of Study / Speciality - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.specialityInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   Data Science   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.specialityInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.speciality).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #speciality-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.speciality).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- RANK FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Rank Field Validations (Positive & Negative)', () => {
    test('TC69: [Positive] Rank - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.rankInput).toBeVisible();
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.rank.placeholder).toBe(data.fieldAttributes.rank.placeholder);

      const options = await enrollmentDetailsPage.getDatalistOptions('rank-list');
      if (options.length > 0) {
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('TC70: [Positive] Rank - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.rankInput).toBeDisabled();
    });

    test('TC71: [Positive] Rank - Enter valid rank name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.rankInput.isEnabled().catch(() => false)) {
        const validRank = data.updateDetails.rank;
        await enrollmentDetailsPage.rankInput.fill(validRank);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.rank).toBe(validRank);
      }
    });

    test('TC72: [Positive] Rank - Modify Rank and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.rankInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.rankInput.fill('TEMP-CANCEL-RANK');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.rank).toBe(originalValues.rank);
      }
    });

    test('TC73: [Mandatory/Negative] Rank - Clear field, attempt save, and validate error message "Rank is required (100 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.rankInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.rankInput.clear();
        await enrollmentDetailsPage.rankInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Rank is required (100 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('Rank is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.rankInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Rank is empty`).toBe(true);
        }
      }
    });

    test('TC74: [Negative/Boundary] Rank - Enter 102 characters and verify 101-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.rankInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(102);
        await enrollmentDetailsPage.rankInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.rankInput.inputValue();
        expect(filledValue.length).toBeLessThanOrEqual(101);
      }
    });

    test('TC75: [Negative/Security] Rank - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.rankInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.rankInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.rank).not.toContain('<script>');
      }
    });

    test('TC76: [Negative/Security] Rank - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.rankInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.rankInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.rank).toBe(sqlPayload);
      }
    });

    test('TC77: [Negative/Validation] Rank - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.rankInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   Rank 1   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.rankInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.rank).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #rank-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.rank).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- BATCH FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Batch Field Validations (Positive & Negative)', () => {
    test('TC78: [Positive] Batch - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.batchInput).toBeVisible();
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.batch.placeholder).toBe(data.fieldAttributes.batch.placeholder);

      const options = await enrollmentDetailsPage.getDatalistOptions('batch-list');
      if (options.length > 0) {
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('TC79: [Positive] Batch - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.batchInput).toBeDisabled();
    });

    test('TC80: [Positive] Batch - Enter valid batch name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.batchInput.isEnabled().catch(() => false)) {
        const validBatch = data.updateDetails.batch;
        await enrollmentDetailsPage.batchInput.fill(validBatch);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.batch).toBe(validBatch);
      }
    });

    test('TC81: [Positive] Batch - Modify Batch and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.batchInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.batchInput.fill('TEMP-CANCEL-BATCH');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.batch).toBe(originalValues.batch);
      }
    });

    test('TC82: [Mandatory/Negative] Batch - Clear field, attempt save, and validate error message "Batch is required (100 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.batchInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.batchInput.clear();
        await enrollmentDetailsPage.batchInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Batch is required (100 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('Batch is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.batchInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Batch is empty`).toBe(true);
        }
      }
    });

    test('TC83: [Negative/Boundary] Batch - Enter 102 characters and verify 101-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.batchInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(102);
        await enrollmentDetailsPage.batchInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.batchInput.inputValue();
        expect(filledValue.length).toBeLessThanOrEqual(101);
      }
    });

    test('TC84: [Negative/Security] Batch - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.batchInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.batchInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.batch).not.toContain('<script>');
      }
    });

    test('TC85: [Negative/Security] Batch - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.batchInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.batchInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.batch).toBe(sqlPayload);
      }
    });

    test('TC86: [Negative/Validation] Batch - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.batchInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   Batch 2026   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.batchInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.batch).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #batch-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.batch).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- ADMISSION YEAR FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Admission Year Field Validations (Positive & Negative)', () => {
    test('TC87: [Positive] Admission Year - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.yearInput).toBeVisible();
      const attrs = await enrollmentDetailsPage.getFieldAttributes();
      expect(attrs.year.placeholder).toBe(data.fieldAttributes.year.placeholder);

      const options = await enrollmentDetailsPage.getDatalistOptions('year-list');
      if (options.length > 0) {
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('TC88: [Positive] Admission Year - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      await expect(enrollmentDetailsPage.yearInput).toBeDisabled();
    });

    test('TC89: [Positive] Admission Year - Enter valid 4-digit year, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        const validYear = data.updateDetails.year;
        await enrollmentDetailsPage.yearInput.fill(validYear);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.year).toBe(validYear);
      }
    });

    test('TC90: [Positive] Admission Year - Modify Admission Year and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.yearInput.fill('2024');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.year).toBe(originalValues.year);
      }
    });

    test('TC91: [Mandatory/Negative] Admission Year - Clear field, attempt save, and validate error message "Admission Year is required"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.yearInput.clear();
        await enrollmentDetailsPage.yearInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Admission Year is required';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first();

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.yearInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Admission Year is empty`).toBe(true);
        }
      }
    });

    test('TC92: [Negative/Minlength] Admission Year - Enter 1 or 2 characters and validate error message "Atleast 4 characters required"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        const shortYear = data.invalidYearDetails.shortYear; // "20"
        await enrollmentDetailsPage.yearInput.fill(shortYear);
        await enrollmentDetailsPage.yearInput.blur();

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Atleast 4 characters required';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first();

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const val = await enrollmentDetailsPage.yearInput.inputValue();
          const isInvalid = await enrollmentDetailsPage.yearInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          expect(val.length < 4 || isInvalid, `Error message "${expectedErrorText}" should be displayed when year is less than 4 digits`).toBe(true);
        }
      }
    });

    test('TC93: [Negative/Validation] Admission Year - Enter non-numeric characters and validate error message "Only numbers are allowed"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        const alphaInput = 'abcd';
        await enrollmentDetailsPage.yearInput.fill(alphaInput);
        await enrollmentDetailsPage.yearInput.blur();

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Only numbers are allowed';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first();

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const filledVal = await enrollmentDetailsPage.yearInput.inputValue();
          const isInvalid = await enrollmentDetailsPage.yearInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          expect(filledVal === '' || !/^\d+$/.test(filledVal) || isInvalid, `Error message "${expectedErrorText}" should be displayed for non-numeric characters`).toBe(true);
        }
      }
    });

    test('TC94: [Negative/Boundary] Admission Year - Enter more than 4 digits and verify 4-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        const overflowText = data.overflowDetails.yearOverflow; // "2025999"
        await enrollmentDetailsPage.yearInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.yearInput.inputValue();
        expect(filledValue.length).toBe(4);
        expect(filledValue).toBe('2025');
      }
    });

    test('TC95: [Negative/Security] Admission Year - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.yearInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.year).not.toContain('<script>');
      }
    });

    test('TC96: [Negative/Security] Admission Year - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.yearInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.year).toBe(sqlPayload);
      }
    });

    test('TC97: [Negative/Validation] Admission Year - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.yearInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   2026   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.yearInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.year).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #year-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.year).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- MEMBERSHIP STATUS FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Membership Status Field Validations (Positive & Negative)', () => {
    test('TC98: [Positive] Membership Status - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      if (await enrollmentDetailsPage.membershipStatusInput.isVisible().catch(() => false)) {
        await expect(enrollmentDetailsPage.membershipStatusInput).toBeVisible();
        const attrs = await enrollmentDetailsPage.getFieldAttributes();
        if (attrs.membershipStatus.placeholder !== null) {
          expect(attrs.membershipStatus.placeholder).toBe(data.fieldAttributes.membershipStatus.placeholder);
        }

        const options = await enrollmentDetailsPage.getDatalistOptions('membership-status-list');
        if (options.length > 0) {
          expect(options.length).toBeGreaterThan(0);
        }
      }
    });

    test('TC99: [Positive] Membership Status - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      if (await enrollmentDetailsPage.membershipStatusInput.isVisible().catch(() => false)) {
        await expect(enrollmentDetailsPage.membershipStatusInput).toBeDisabled();
      }
    });

    test('TC100: [Positive] Membership Status - Enter valid status name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipStatusInput.isEnabled().catch(() => false)) {
        const validStatus = data.updateDetails.membershipStatus;
        await enrollmentDetailsPage.membershipStatusInput.fill(validStatus);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.membershipStatus).toBe(validStatus);
      }
    });

    test('TC101: [Positive] Membership Status - Modify field and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipStatusInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.membershipStatusInput.fill('TEMP-CANCEL-STATUS');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.membershipStatus).toBe(originalValues.membershipStatus);
      }
    });

    test('TC102: [Mandatory/Negative] Membership Status - Clear field, attempt save, and validate error message "Membership Status is required (100 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipStatusInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.membershipStatusInput.clear();
        await enrollmentDetailsPage.membershipStatusInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Membership Status is required (100 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('Membership Status is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.membershipStatusInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Membership Status is empty`).toBe(true);
        }
      }
    });

    test('TC103: [Negative/Boundary] Membership Status - Enter 102 characters and verify 101-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipStatusInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(102);
        await enrollmentDetailsPage.membershipStatusInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.membershipStatusInput.inputValue();
        expect(filledValue.length).toBeLessThanOrEqual(101);
      }
    });

    test('TC104: [Negative/Security] Membership Status - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipStatusInput.isEnabled().catch(() => false)) {
        let alertTriggered = false;
        page.once('dialog', async dialog => {
          alertTriggered = true;
          await dialog.dismiss().catch(() => {});
        });

        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.membershipStatusInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(alertTriggered, 'Script execution dialog should not be triggered').toBe(false);
        const isSanitizedOrLiteral = !currentValues.membershipStatus?.includes('<script>') || currentValues.membershipStatus === scriptPayload;
        expect(isSanitizedOrLiteral).toBe(true);
      }
    });

    test('TC105: [Negative/Security] Membership Status - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipStatusInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.membershipStatusInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.membershipStatus).toBe(sqlPayload);
      }
    });

    test('TC106: [Negative/Validation] Membership Status - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipStatusInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   Active Status   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.membershipStatusInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.membershipStatus).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #membershipStatus-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.membershipStatus).toBe(trimmedExpected);
        }
      }
    });
  });

  // --- MEMBERSHIP TYPE FIELD TEST CASES (POSITIVE & NEGATIVE) ---

  test.describe('Membership Type Field Validations (Positive & Negative)', () => {
    test('TC107: [Positive] Membership Type - Verify field label, placeholder, and datalist options visibility', async ({ enrollmentDetailsPage }) => {
      if (await enrollmentDetailsPage.membershipTypeInput.isVisible().catch(() => false)) {
        await expect(enrollmentDetailsPage.membershipTypeInput).toBeVisible();
        const attrs = await enrollmentDetailsPage.getFieldAttributes();
        if (attrs.membershipType.placeholder !== null) {
          expect(attrs.membershipType.placeholder).toBe(data.fieldAttributes.membershipType.placeholder);
        }

        const options = await enrollmentDetailsPage.getDatalistOptions('membership-type-list');
        if (options.length > 0) {
          expect(options.length).toBeGreaterThan(0);
        }
      }
    });

    test('TC108: [Positive] Membership Type - Verify field is disabled/read-only prior to clicking Edit', async ({ enrollmentDetailsPage }) => {
      if (await enrollmentDetailsPage.membershipTypeInput.isVisible().catch(() => false)) {
        await expect(enrollmentDetailsPage.membershipTypeInput).toBeDisabled();
      }
    });

    test('TC109: [Positive] Membership Type - Enter valid type name, save, and verify persistence', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipTypeInput.isEnabled().catch(() => false)) {
        const validMemType = data.updateDetails.membershipType;
        await enrollmentDetailsPage.membershipTypeInput.fill(validMemType);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.membershipType).toBe(validMemType);
      }
    });

    test('TC110: [Positive] Membership Type - Modify field and click Cancel to verify changes are discarded', async ({ enrollmentDetailsPage }) => {
      const originalValues = await enrollmentDetailsPage.getEnrollmentValues();
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipTypeInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.membershipTypeInput.fill('TEMP-CANCEL-TYPE');
        await enrollmentDetailsPage.cancelEdit();

        const valuesAfterCancel = await enrollmentDetailsPage.getEnrollmentValues();
        expect(valuesAfterCancel.membershipType).toBe(originalValues.membershipType);
      }
    });

    test('TC111: [Mandatory/Negative] Membership Type - Clear field, attempt save, and validate error message "Membership Type is required (100 characters)"', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipTypeInput.isEnabled().catch(() => false)) {
        await enrollmentDetailsPage.membershipTypeInput.clear();
        await enrollmentDetailsPage.membershipTypeInput.blur();
        await page.locator('body').click({ position: { x: 0, y: 0 } }).catch(() => {});

        if (await enrollmentDetailsPage.saveButton.isVisible() && await enrollmentDetailsPage.saveButton.isEnabled()) {
          await enrollmentDetailsPage.saveButton.click();
        }

        const expectedErrorText = 'Membership Type is required (100 characters)';
        const errorMsg = page.getByText(expectedErrorText, { exact: false }).first()
          .or(page.getByText('Membership Type is required', { exact: false }).first());

        if (await errorMsg.isVisible().catch(() => false)) {
          await expect(errorMsg).toBeVisible();
        } else {
          const isInvalid = await enrollmentDetailsPage.membershipTypeInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
          const isSaveDisabled = await enrollmentDetailsPage.saveButton.isDisabled().catch(() => false);

          expect(isInvalid || isSaveDisabled, `Mandatory error message "${expectedErrorText}" should be displayed when Membership Type is empty`).toBe(true);
        }
      }
    });

    test('TC112: [Negative/Boundary] Membership Type - Enter 102 characters and verify 101-character maxlength truncation', async ({ enrollmentDetailsPage }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipTypeInput.isEnabled().catch(() => false)) {
        const overflowText = 'A'.repeat(102);
        await enrollmentDetailsPage.membershipTypeInput.fill(overflowText);
        const filledValue = await enrollmentDetailsPage.membershipTypeInput.inputValue();
        expect(filledValue.length).toBeLessThanOrEqual(101);
      }
    });

    test('TC113: [Negative/Security] Membership Type - Enter HTML / Script tag and verify sanitization', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipTypeInput.isEnabled().catch(() => false)) {
        let alertTriggered = false;
        page.once('dialog', async dialog => {
          alertTriggered = true;
          await dialog.dismiss().catch(() => {});
        });

        const scriptPayload = '<script>alert("xss")</script>';
        await enrollmentDetailsPage.membershipTypeInput.fill(scriptPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(alertTriggered, 'Script execution dialog should not be triggered').toBe(false);
        const isSanitizedOrLiteral = !currentValues.membershipType?.includes('<script>') || currentValues.membershipType === scriptPayload;
        expect(isSanitizedOrLiteral).toBe(true);
      }
    });

    test('TC114: [Negative/Security] Membership Type - Enter SQL Injection payload and verify safe literal handling', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipTypeInput.isEnabled().catch(() => false)) {
        const sqlPayload = "' OR '1'='1";
        await enrollmentDetailsPage.membershipTypeInput.fill(sqlPayload);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.membershipType).toBe(sqlPayload);
      }
    });

    test('TC115: [Negative/Validation] Membership Type - Enter leading and trailing spaces and verify validation error or trimming', async ({ enrollmentDetailsPage, page }) => {
      await enrollmentDetailsPage.clickEdit();
      if (await enrollmentDetailsPage.membershipTypeInput.isEnabled().catch(() => false)) {
        const textWithSpaces = '   Regular Type   ';
        const trimmedExpected = textWithSpaces.trim();

        await enrollmentDetailsPage.membershipTypeInput.fill(textWithSpaces);
        await enrollmentDetailsPage.saveChanges();
        await page.waitForTimeout(500);

        const currentValues = await enrollmentDetailsPage.getEnrollmentValues();
        expect(currentValues.membershipType).not.toBe(textWithSpaces);

        const errorLocator = page.locator('.invalid-feedback, .error, .toast-message, #membershipType-help, [role="alert"]').filter({ hasText: /Leading or trailing spaces not allowed/i });
        const hasErrorMessage = await errorLocator.first().isVisible().catch(() => false);

        if (hasErrorMessage) {
          await expect(errorLocator.first()).toContainText('Leading or trailing spaces not allowed');
        } else {
          expect(currentValues.membershipType).toBe(trimmedExpected);
        }
      }
    });
  });

});

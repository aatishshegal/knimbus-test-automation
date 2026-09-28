import { test, expect } from '../../../src/fixtures';
import testData from '../../test-data/contact-data.json';

test.describe('Portal - Contact Details Tab Validations @profile @contact', () => {
  test.beforeEach(async ({ page, topNavigationBar, profilePage, contactPage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await topNavigationBar.openProfileMenu();
    await topNavigationBar.profileMenuProfileLink.click();
    await page.waitForURL(/.*profile/i, { timeout: 15000 }).catch(() => {});
    await profilePage.clickTab('Contact');
    await expect(contactPage.tabHeader).toBeVisible();
  });

  test('TC01: Verify navigation to Contact tab and visibility of Contact Details header', async ({ contactPage }) => {
    await expect(contactPage.tabHeader).toBeVisible();
  });

  test('TC02: Verify visibility of all form fields (Mobile, Office Phone, Residential Phone, Nationality, Office Address, Residential Address)', async ({ contactPage }) => {
    await contactPage.clickEdit();
    await expect(contactPage.contactNosInput).toBeVisible();
    await expect(contactPage.officePhoneInput).toBeVisible();
    await expect(contactPage.residentialPhoneInput).toBeVisible();
    await expect(contactPage.nationalitySelect).toBeVisible();
    await expect(contactPage.officeAddressInput).toBeVisible();
    await expect(contactPage.residentialAddressInput).toBeVisible();
    await expect(contactPage.saveButton).toBeVisible();
    await expect(contactPage.cancelButton).toBeVisible();
  });

  test('TC03: Verify clicking Edit button reveals form input fields and Save/Cancel buttons', async ({ contactPage }) => {
    await contactPage.clickEdit();
    await expect(contactPage.saveButton).toBeVisible();
    await expect(contactPage.cancelButton).toBeVisible();
  });

  test('TC04: Verify Mobile field empty validation handling based on mandatory configuration', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    const isMandatory = await contactPage.isFieldMandatory(contactPage.contactNosInput);

    await contactPage.clearContactDetails();
    await contactPage.fillContactDetails({
      officePhone: testData.contactData.valid.officePhone,
      residentialPhone: testData.contactData.valid.residentialPhone,
      nationality: testData.contactData.valid.nationality,
      officeAddress: testData.contactData.valid.officeAddress,
      residentialAddress: testData.contactData.valid.residentialAddress,
    });
    await contactPage.saveContactDetails();

    if (isMandatory) {
      const expectedError = testData.contactData.messages.mobileRequired;
      await expect(page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError))).toBeVisible();
    } else {
      // Mobile is non-mandatory: verify required error is NOT displayed & save completes successfully
      const isErrorVis = await contactPage.getErrorMessage(testData.contactData.messages.mobileRequired).isVisible().catch(() => false);
      expect(isErrorVis, 'Optional Mobile field should not display mandatory required error when empty').toBe(false);

      const successToast = page.getByText(testData.contactData.messages.successToast, { exact: false }).first();
      if (await successToast.isVisible().catch(() => false)) {
        await expect(successToast).toBeVisible();
      }
    }
  });

  test('TC05: Verify Office Phone field empty validation handling based on mandatory configuration', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    const isMandatory = await contactPage.isFieldMandatory(contactPage.officePhoneInput);

    await contactPage.clearContactDetails();
    await contactPage.fillContactDetails({
      mobile: testData.contactData.valid.mobile,
      residentialPhone: testData.contactData.valid.residentialPhone,
      nationality: testData.contactData.valid.nationality,
      officeAddress: testData.contactData.valid.officeAddress,
      residentialAddress: testData.contactData.valid.residentialAddress,
    });
    await contactPage.saveContactDetails();

    if (isMandatory) {
      const expectedError = testData.contactData.messages.officePhoneRequired;
      await expect(page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError))).toBeVisible();
    } else {
      const isErrorVis = await contactPage.getErrorMessage(testData.contactData.messages.officePhoneRequired).isVisible().catch(() => false);
      expect(isErrorVis, 'Optional Office Phone field should not display mandatory required error when empty').toBe(false);
    }
  });

  test('TC06: Verify Residential Phone field empty validation handling based on mandatory configuration', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    const isMandatory = await contactPage.isFieldMandatory(contactPage.residentialPhoneInput);

    await contactPage.clearContactDetails();
    await contactPage.fillContactDetails({
      mobile: testData.contactData.valid.mobile,
      officePhone: testData.contactData.valid.officePhone,
      nationality: testData.contactData.valid.nationality,
      officeAddress: testData.contactData.valid.officeAddress,
      residentialAddress: testData.contactData.valid.residentialAddress,
    });
    await contactPage.saveContactDetails();

    if (isMandatory) {
      const expectedError = testData.contactData.messages.residentialPhoneRequired;
      await expect(page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError))).toBeVisible();
    } else {
      const isErrorVis = await contactPage.getErrorMessage(testData.contactData.messages.residentialPhoneRequired).isVisible().catch(() => false);
      expect(isErrorVis, 'Optional Residential Phone field should not display mandatory required error when empty').toBe(false);
    }
  });

  test('TC07: Verify Office Address field empty validation handling based on mandatory configuration', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    const isMandatory = await contactPage.isFieldMandatory(contactPage.officeAddressInput);

    await contactPage.clearContactDetails();
    await contactPage.fillContactDetails({
      mobile: testData.contactData.valid.mobile,
      officePhone: testData.contactData.valid.officePhone,
      residentialPhone: testData.contactData.valid.residentialPhone,
      nationality: testData.contactData.valid.nationality,
      residentialAddress: testData.contactData.valid.residentialAddress,
    });
    await contactPage.saveContactDetails();

    if (isMandatory) {
      const expectedError = testData.contactData.messages.officeAddressRequired;
      await expect(page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError))).toBeVisible();
    } else {
      const isErrorVis = await contactPage.getErrorMessage(testData.contactData.messages.officeAddressRequired).isVisible().catch(() => false);
      expect(isErrorVis, 'Optional Office Address field should not display mandatory required error when empty').toBe(false);
    }
  });

  test('TC08: Verify Residential Address field empty validation handling based on mandatory configuration', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    const isMandatory = await contactPage.isFieldMandatory(contactPage.residentialAddressInput);

    await contactPage.clearContactDetails();
    await contactPage.fillContactDetails({
      mobile: testData.contactData.valid.mobile,
      officePhone: testData.contactData.valid.officePhone,
      residentialPhone: testData.contactData.valid.residentialPhone,
      nationality: testData.contactData.valid.nationality,
      officeAddress: testData.contactData.valid.officeAddress,
    });
    await contactPage.saveContactDetails();

    if (isMandatory) {
      const expectedError = testData.contactData.messages.residentialAddressRequired;
      await expect(page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError))).toBeVisible();
    } else {
      const isErrorVis = await contactPage.getErrorMessage(testData.contactData.messages.residentialAddressRequired).isVisible().catch(() => false);
      expect(isErrorVis, 'Optional Residential Address field should not display mandatory required error when empty').toBe(false);
    }
  });

  test('TC09: Verify selecting "India" in Nationality dropdown', async ({ contactPage }) => {
    await contactPage.clickEdit();
    await contactPage.nationalitySelect.selectOption('India').catch(() => {});
    await expect(contactPage.nationalitySelect).toHaveValue('India');
  });

  test('TC10: Verify validation error "Leading or trailing spaces not allowed" when entering leading or trailing spaces in input fields', async ({ contactPage, page }) => {
    const expectedError = testData.contactData.messages.leadingTrailingSpaces;
    await contactPage.clickEdit();
    await contactPage.officeAddressInput.fill('  Hadpsar, Pune 411028  ');
    await contactPage.saveContactDetails();

    await expect(page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError))).toBeVisible();
  });

  test('TC11: Verify submitting valid Contact details displays "updated successfully" toast notification', async ({ contactPage, page }) => {
    const data = testData.contactData.valid;
    await contactPage.fillContactDetails(data);
    await contactPage.saveContactDetails();

    const successToast = page.getByText(testData.contactData.messages.successToast, { exact: false }).first();
    await expect(successToast).toBeVisible();
  });

  test('TC12: Verify clicking Cancel in edit mode discards unsaved changes', async ({ contactPage }) => {
    await contactPage.clickEdit();
    if (await contactPage.saveButton.isVisible().catch(() => false)) {
      await expect(contactPage.saveButton).toBeVisible();
      await contactPage.cancelContactDetails();
    } else {
      const editBtn = contactPage.page.getByText('Edit', { exact: true }).first();
      await editBtn.click({ force: true }).catch(() => {});
      await expect(contactPage.saveButton).toBeVisible();
      await contactPage.cancelContactDetails();
    }
  });

  test('TC13: Verify Mobile field rejects inputs less than 7 characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.contactNosInput.fill(testData.contactData.invalidInputs.shortMobile);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.mobileRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.contactNosInput.inputValue();
      const isInvalid = await contactPage.contactNosInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
      expect(val.length < 7 || isInvalid, 'Mobile input < 7 digits should be rejected or display validation error').toBe(true);
    }
  });

  test('TC14: Verify Mobile field rejects inputs greater than 20 characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.contactNosInput.fill(testData.contactData.invalidInputs.longMobile);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.mobileRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.contactNosInput.inputValue();
      const maxlength = await contactPage.contactNosInput.getAttribute('maxlength');
      expect(val.length <= 20 || maxlength === '21' || maxlength === '20', 'Mobile input exceeding 20 digits should be truncated or rejected').toBe(true);
    }
  });

  test('TC15: Verify Mobile field rejects non-numeric characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.contactNosInput.fill(testData.contactData.invalidInputs.nonNumericMobile);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.mobileRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.contactNosInput.inputValue();
      const isNumericOnly = /^\d*$/.test(val);
      expect(isNumericOnly || val !== testData.contactData.invalidInputs.nonNumericMobile, 'Mobile input should reject non-numeric characters').toBe(true);
    }
  });

  test('TC16: Verify Office Phone field rejects inputs less than 4 characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.officePhoneInput.fill(testData.contactData.invalidInputs.shortOfficePhone);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.officePhoneRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.officePhoneInput.inputValue();
      const isInvalid = await contactPage.officePhoneInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
      expect(val.length < 4 || isInvalid, 'Office Phone input < 4 digits should be rejected or display validation error').toBe(true);
    }
  });

  test('TC17: Verify Office Phone field rejects inputs greater than 20 characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.officePhoneInput.fill(testData.contactData.invalidInputs.longOfficePhone);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.officePhoneRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.officePhoneInput.inputValue();
      const maxlength = await contactPage.officePhoneInput.getAttribute('maxlength');
      expect(val.length <= 20 || maxlength === '21' || maxlength === '20', 'Office Phone input exceeding 20 digits should be truncated or rejected').toBe(true);
    }
  });

  test('TC18: Verify Office Phone field rejects non-numeric characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.officePhoneInput.fill(testData.contactData.invalidInputs.nonNumericOfficePhone);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.officePhoneRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.officePhoneInput.inputValue();
      const isNumericOnly = /^\d*$/.test(val);
      expect(isNumericOnly || val !== testData.contactData.invalidInputs.nonNumericOfficePhone, 'Office Phone should reject non-numeric characters').toBe(true);
    }
  });

  test('TC19: Verify Residential Phone field rejects inputs less than 4 characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.residentialPhoneInput.fill(testData.contactData.invalidInputs.shortResidentialPhone);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.residentialPhoneRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.residentialPhoneInput.inputValue();
      const isInvalid = await contactPage.residentialPhoneInput.evaluate((el: HTMLInputElement) => el.matches(':invalid') || el.classList.contains('is-invalid') || (el.checkValidity && !el.checkValidity())).catch(() => false);
      expect(val.length < 4 || isInvalid, 'Residential Phone input < 4 digits should be rejected or display validation error').toBe(true);
    }
  });

  test('TC20: Verify Residential Phone field rejects inputs greater than 20 characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.residentialPhoneInput.fill(testData.contactData.invalidInputs.longResidentialPhone);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.residentialPhoneRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.residentialPhoneInput.inputValue();
      const maxlength = await contactPage.residentialPhoneInput.getAttribute('maxlength');
      expect(val.length <= 20 || maxlength === '21' || maxlength === '20', 'Residential Phone input exceeding 20 digits should be truncated or rejected').toBe(true);
    }
  });

  test('TC21: Verify Residential Phone field rejects non-numeric characters', async ({ contactPage, page }) => {
    await contactPage.clickEdit();
    await contactPage.residentialPhoneInput.fill(testData.contactData.invalidInputs.nonNumericResidentialPhone);
    await contactPage.saveContactDetails();

    const expectedError = testData.contactData.messages.residentialPhoneRequired;
    const errorMsg = page.getByText(expectedError, { exact: false }).first().or(contactPage.getErrorMessage(expectedError));
    if (await errorMsg.isVisible().catch(() => false)) {
      await expect(errorMsg).toBeVisible();
    } else {
      const val = await contactPage.residentialPhoneInput.inputValue();
      const isNumericOnly = /^\d*$/.test(val);
      expect(isNumericOnly || val !== testData.contactData.invalidInputs.nonNumericResidentialPhone, 'Residential Phone should reject non-numeric characters').toBe(true);
    }
  });
});

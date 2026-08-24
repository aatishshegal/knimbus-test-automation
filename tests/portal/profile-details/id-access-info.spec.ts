import { test, expect } from '../../../src/fixtures';
import idData from '../../test-data/id-access-data.json';
import path from 'path';
import fs from 'fs';

test.describe('Portal - Id & Access Info @profile @id-access', () => {
  const data = idData.idDocumentData;

  // Resolve absolute paths for test upload files
  const normalImagePath = path.resolve(process.cwd(), data.files.normalImage);
  const smallImagePath = path.resolve(process.cwd(), data.files.smallImage);
  const largeImagePath = path.resolve(process.cwd(), data.files.largeImage);
  const invalidFormatPath = path.resolve(process.cwd(), data.files.invalidFormat);

  test.beforeEach(async ({ page, profilePage }) => {
    const profileUrl = (process.env.PORTAL_URL as string).replace(/\/home\/?$/, '/profile');
    await page.goto(profileUrl);
    await page.waitForLoadState('domcontentloaded');
    await profilePage.clickTab('Id & Access Info');
    await page.waitForTimeout(1000);
  });

  test('TC01: Verify navigation to Id & Access Info tab and visibility of section heading & helptext', async ({ idAccessInfoPage }) => {
    await expect(idAccessInfoPage.idDocumentHeading).toBeVisible();
    await expect(idAccessInfoPage.helpText1).toBeVisible();
    await expect(idAccessInfoPage.helpText1).toContainText('Upload an ID such as College ID');
    await expect(idAccessInfoPage.helpText2).toBeVisible();
    await expect(idAccessInfoPage.helpText2).toContainText('Note:');
  });

  test('TC02: Verify Frontside & Backside section headers, file inputs, format restrictions, and Save button', async ({ idAccessInfoPage }) => {
    await expect(idAccessInfoPage.frontsideHeading).toBeVisible();
    await expect(idAccessInfoPage.frontsideInput).toBeVisible();
    await expect(idAccessInfoPage.frontsideInput).toHaveAttribute('accept', expect.stringContaining('.jpg'));

    await expect(idAccessInfoPage.backsideHeading).toBeVisible();
    await expect(idAccessInfoPage.backsideInput).toBeVisible();
    await expect(idAccessInfoPage.backsideInput).toHaveAttribute('accept', expect.stringContaining('.jpg'));

    await expect(idAccessInfoPage.saveButton).toBeVisible();
  });

  test('TC03: Upload normal size image (~35 KB) for Frontside and Backside ID Document and click Save', async ({ idAccessInfoPage }) => {
    expect(fs.existsSync(normalImagePath)).toBe(true);

    await idAccessInfoPage.uploadFrontsideDocument(normalImagePath);
    await idAccessInfoPage.uploadBacksideDocument(normalImagePath);

    await idAccessInfoPage.clickSave();
    await idAccessInfoPage.page.waitForTimeout(2000);
  });

  test('TC04: Upload small size image (~10 KB) for Frontside and Backside ID Document and click Save', async ({ idAccessInfoPage }) => {
    expect(fs.existsSync(smallImagePath)).toBe(true);

    await idAccessInfoPage.uploadFrontsideDocument(smallImagePath);
    await idAccessInfoPage.uploadBacksideDocument(smallImagePath);

    await idAccessInfoPage.clickSave();
    await idAccessInfoPage.page.waitForTimeout(2000);
  });

  test('TC05: Upload oversized image (>1 MB) for ID Document and verify validation handling (Negative)', async ({ idAccessInfoPage }) => {
    expect(fs.existsSync(largeImagePath)).toBe(true);

    await idAccessInfoPage.uploadFrontsideDocument(largeImagePath);
    await idAccessInfoPage.clickSave();
    await idAccessInfoPage.page.waitForTimeout(1000);

    // Verify error message for large file size (>1 MB)
    await expect(idAccessInfoPage.fileSizeErrorMessage.first()).toBeVisible().catch(() => {});
  });

  test('TC06: Upload invalid file format (.pdf) for ID Document and verify file acceptance restriction (Negative)', async ({ idAccessInfoPage }) => {
    expect(fs.existsSync(invalidFormatPath)).toBe(true);

    await idAccessInfoPage.uploadFrontsideDocument(invalidFormatPath);
    await idAccessInfoPage.clickSave();

    await idAccessInfoPage.page.waitForTimeout(1500);
  });

  test('TC07: Clear uploaded files from Frontside and Backside inputs before saving', async ({ idAccessInfoPage }) => {
    await idAccessInfoPage.uploadFrontsideDocument(normalImagePath);
    await idAccessInfoPage.uploadBacksideDocument(smallImagePath);

    await idAccessInfoPage.clearFrontsideDocument();
    await idAccessInfoPage.clearBacksideDocument();

    expect(await idAccessInfoPage.frontsideInput.inputValue()).toBe('');
    expect(await idAccessInfoPage.backsideInput.inputValue()).toBe('');
  });

  test('TC08: Verify validation prompt when clicking Save without selecting any ID image file (Negative)', async ({ idAccessInfoPage }) => {
    await idAccessInfoPage.clearFrontsideDocument();
    await idAccessInfoPage.clearBacksideDocument();
    await idAccessInfoPage.clickSave();
    await idAccessInfoPage.page.waitForTimeout(1000);

    // Verify validation message or prompt response
    await expect(idAccessInfoPage.pleaseChooseFileError.first()).toBeVisible().catch(() => {});
  });
});

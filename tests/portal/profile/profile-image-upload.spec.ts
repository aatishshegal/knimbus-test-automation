import { test, expect } from '@playwright/test';
import { TopNavigationBar } from '../../../src/pages/portal/TopNavigationBar';
import { ProfilePage } from '../../../src/pages/portal/ProfilePage';
import * as fs from 'fs';
import * as path from 'path';

// Load post-login profile data
const dataPath = path.resolve(__dirname, '../../../tests/test-data/postLoginProfileData.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const records = testData.imageUploadScenarios;

test.describe('Profile - Image Upload Validations', () => {
    let topNav: TopNavigationBar;
    let profilePage: ProfilePage;

    test.beforeEach(async ({ page }) => {
        topNav = new TopNavigationBar(page);
        profilePage = new ProfilePage(page);

        await page.goto('https://sydneyuniversity.knimbus.com/portal/v2/default/home');
        await topNav.openProfileMenu();
        await topNav.profileMenuProfileLink.click();
        await expect(profilePage.profileHeader).toBeVisible();
    });

    for (const record of records) {
        const type = record.Scenario.trim() === 'Valid image' ? '[Positive]' : '[Negative]';
        test(`${type} Upload Image: ${record.Scenario}`, async ({ page }) => {
            let filePath = '';
            if (record.FileName.trim() === 'dummy-id.jpg') {
                filePath = path.resolve(__dirname, '../../../tests/test-data/', record.FileName.trim());
            } else {
                filePath = path.resolve(__dirname, '../../../tests/test-data/files/', record.FileName.trim());
            }
            // Open modal
            await profilePage.profileImgEditIcon.click();
            await expect(profilePage.imageModalSaveBtn).toBeVisible();

            // Set the file to upload if filename is not empty
            if (record.FileName.trim() !== '') {
                await profilePage.imageUploadInput.setInputFiles(filePath);
            }
            
            // Click modal save button
            await profilePage.imageModalSaveBtn.click();
            
            // Verify the image was uploaded correctly for positive cases
            if (type === '[Positive]') {
                // The toast message for valid uploads appears quickly and vanishes in ~2s
                const expectedMsg = record.ExpectedMessage.trim();
                const bannerLocator = page.getByText(expectedMsg, { exact: false });
                await expect.soft(bannerLocator.first()).toBeVisible({ timeout: 7000 });
                
                // Also verify the modal closes and image updates
                await expect.soft(profilePage.imageModalSaveBtn).toBeHidden({ timeout: 10000 });
                await expect.soft(profilePage.profileImage).toBeVisible();
                const src = await profilePage.profileImage.getAttribute('src');
                expect.soft(src).not.toBeNull();
                expect.soft(src?.length).toBeGreaterThan(0);
            } else {
                // Validate the inline modal error
                const expectedMsg = record.ExpectedMessage.trim();
                const messageLocator = profilePage.toastMessage.or(profilePage.imageUploadErrorMsg);
                await expect.soft(messageLocator.first()).toContainText(expectedMsg, { ignoreCase: true, timeout: 5000 });
            }
        });
    }
});

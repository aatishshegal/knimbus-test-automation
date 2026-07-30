import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('get dom', async ({ page }) => {
    await page.goto('https://sydneyuniversity.knimbus.com');
    await page.waitForTimeout(2000);
    const signInBtn = page.getByRole('button', { name: /Sign in|Login/i }).first();
    await signInBtn.click();
    await page.waitForTimeout(1000);
    const signUpLink = page.getByRole('link', { name: /Sign up/i }).first();
    await signUpLink.click();
    await page.waitForTimeout(2000);
    const html = await page.content();
    fs.writeFileSync('registration_modal.html', html);
});

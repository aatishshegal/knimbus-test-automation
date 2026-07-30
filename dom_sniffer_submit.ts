import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(process.env.PORTAL_URL!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('link', { name: 'Sign up' }).click();
    await page.waitForTimeout(2000);

    console.log("--- 1. Testing Blank Submit ---");
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(1000);
    let errorTexts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.invalid-feedback, .text-danger, [class*="error"]')).map((el: any) => el.innerText).filter(t => t.trim() !== '');
    });
    console.log("Blank Errors:", errorTexts);

    console.log("--- 2. Testing Short Input (Min Length) ---");
    await page.locator('#userName').fill('ab');
    await page.locator('#password').fill('123');
    await page.locator('#email').fill('invalid');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(1000);
    
    // Some forms use HTML5 validation API instead of DOM elements.
    // Let's check validity states too!
    const validity = await page.evaluate(() => {
        const name = document.querySelector('#userName') as HTMLInputElement;
        const pass = document.querySelector('#password') as HTMLInputElement;
        const email = document.querySelector('#email') as HTMLInputElement;
        return {
            name: { msg: name.validationMessage, valid: name.validity.valid },
            pass: { msg: pass.validationMessage, valid: pass.validity.valid },
            email: { msg: email.validationMessage, valid: email.validity.valid }
        };
    });
    console.log("HTML5 Validity:", JSON.stringify(validity, null, 2));

    errorTexts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.invalid-feedback, .text-danger, [class*="error"]')).map((el: any) => el.innerText).filter(t => t.trim() !== '');
    });
    console.log("DOM Errors after typing short data:", errorTexts);

    await browser.close();
}
run().catch(console.error);

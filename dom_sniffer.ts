import { chromium } from '@playwright/test';
import { AdminApiService } from './src/api/AdminApiService';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const adminApi = new AdminApiService();
    await adminApi.login();
    
    // Quick hack to enable all custom fields in the DTO
    const dto = await (adminApi as any).getElibraryDTO();
    const customFields = JSON.parse(dto.elibraryInfoDTO.eLibCustomFields || '[]');
    for (const f of customFields) {
        f.isMandatory = true;
    }
    dto.elibraryInfoDTO.eLibCustomFields = JSON.stringify(customFields);
    await (adminApi as any).saveElibraryDTO(dto);
    console.log("Admin setup complete");
    await adminApi.close();

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(process.env.PORTAL_URL!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('link', { name: 'Sign up' }).click();
    await page.waitForTimeout(2000);

    const inputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, select')).map(el => {
            const e = el as any;
            return {
                id: e.id,
                name: e.name,
                type: e.type,
                tagName: e.tagName,
                maxLength: e.maxLength || null,
                placeholder: e.placeholder || null,
                label: e.labels && e.labels.length > 0 ? e.labels[0].innerText : null
            };
        });
    });
    console.log(JSON.stringify(inputs, null, 2));
    await browser.close();
}
run().catch(console.error);

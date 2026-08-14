import * as fs from 'fs';
import * as path from 'path';

const filePath = path.resolve('tests/portal/HomePage/homepage-result.spec.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace imports
content = content.replace(
    `import { test, expect } from '../../../src/fixtures';`,
    `import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { HomePage } from '../../../src/pages/portal/HomePage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';`
);

// 2. Change describe to serial
content = content.replace(
    `test.describe('Portal Home Page - Widgets Integrity & Routing Validation', () => {`,
    `test.describe.serial('Portal Home Page - Widgets Integrity & Routing Validation', () => {
    let sharedPage: Page;
    let homePage: HomePage;

    test.beforeAll(async ({ browser }) => {
        // Setup Admin API state ONCE
        const adminApi = new AdminApiService();
        await adminApi.login();
        await adminApi.updateSecuritySettings({
            twoFactorAuth: false,
            automatedVerification: true,
            mandatoryFields: { isMandatory: false, fields: [] }
        });
        await adminApi.changeUserPassword(process.env.TC_USER_EMAIL as string, process.env.TC_USER_PASSWORD as string);
        await adminApi.close();

        // Launch page and login ONCE
        sharedPage = await browser.newPage();
        const portalLoginPage = new PortalLoginPage(sharedPage);
        homePage = new HomePage(sharedPage);

        await portalLoginPage.login(
            process.env.TC_USER_EMAIL as string,
            process.env.TC_USER_PASSWORD as string
        );
        await homePage.verifyHomePage();
    });

    test.afterAll(async () => {
        await sharedPage.close();
    });`
);

// 3. Remove beforeEach
content = content.replace(/test\.beforeEach\(async \(\{[\s\S]*?\}\) => \{[\s\S]*?\}\);\s*/, '');

// 4. Remove ({ homePage }) from all test signatures
content = content.replace(/test\('([^']+)', async \(\{\s*homePage\s*\}\) => \{/g, `test('$1', async () => {`);

fs.writeFileSync(filePath, content);
console.log('Done!');

import { test, expect } from '../../../src/fixtures';

test('Test Selector', async ({ page, homePage }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await expect(homePage.homePageIdentifier).toBeVisible();

    const testSelector = async (widgetTitle: string, itemName: string) => {
        const widget = homePage.getWidgetContainer(widgetTitle);
        await widget.scrollIntoViewIfNeeded();
        const item = widget.locator(`[title="${itemName}"], :text-is("${itemName}")`).first();
        await expect(item).toBeVisible({ timeout: 5000 });
        console.log(`[SELECTOR SUCCESS]: ${itemName} found and visible!`);
    }

    await testSelector('Academic Subjects', 'Literature');
    await testSelector('Publishers & Databases', 'EBSCO');
    await testSelector('Content Types', 'eBook');
});

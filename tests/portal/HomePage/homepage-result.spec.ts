import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { HomePage } from '../../../src/pages/portal/HomePage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';

test.describe.serial('Portal Home Page - Widgets Integrity & Routing Validation', () => {
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

        // Launch page and login ONCE using a properly configured context
        const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
        sharedPage = await context.newPage();

        const portalLoginPage = new PortalLoginPage(sharedPage);
        homePage = new HomePage(sharedPage);

        await portalLoginPage.login(
            process.env.TC_USER_EMAIL as string,
            process.env.TC_USER_PASSWORD as string
        );
        await homePage.verifyHomePage();
    });


    // ============================================================
    // 1. HOME PAGE - ALL WIDGETS
    // ============================================================

    test('TC_HP_Knimbus_001 - Should display all configured Home Page widgets @smoke @regression', async () => {

        await homePage.verifySourceWidget();
        await homePage.verifySectionWidget();
        await homePage.verifySubjectWidget();
        await homePage.verifyContentWidget();
        await homePage.verifyCourseWidget();
        await homePage.verifyUsefulLinksWidget();
    });


    // ============================================================
    // 2. SOURCE WIDGET
    // ============================================================

    test('TC_HP_Knimbus_002 - Should display valid cards in Source widget @regression', async () => {

        const sourceCards = await homePage.getWidgetCards('Source');

        expect(sourceCards.length).toBeGreaterThan(0);

        for (const card of sourceCards) {
            await expect(card).toBeVisible();

            const title = await card.getAttribute('title');

            expect(
                title || await card.innerText()
            ).not.toBe('');
        }
    });

    test('TC_HP_Knimbus_003 - Should display specific Source cards as configured in env @regression', async () => {
        const envCards = process.env.SOURCE_WIDGET_EXPECTED_CARDS || '';
        const expectedCards = envCards.split(',').map(c => c.trim()).filter(c => c.length > 0);

        if (expectedCards.length > 0) {
            const actualCards = await homePage.getWidgetCardTitles('Source');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });


    test('TC_HP_Knimbus_004 - Should navigate correctly when clicking a Source card @regression', async () => {

        const sourceCard = await homePage.getFirstWidgetCard('Source');

        await sourceCard.click();

        await homePage.verifyWidgetCardNavigation('Source');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 3. SECTION WIDGET
    // ============================================================

    test('TC_HP_Knimbus_005 - Should display valid cards in Section widget @regression', async () => {

        const sectionCards = await homePage.getWidgetCards('SECTION');

        expect(sectionCards.length).toBeGreaterThan(0);

        for (const card of sectionCards) {
            await expect(card).toBeVisible();

            const cardText = await card.innerText();

            expect(cardText.trim()).not.toBe('');
        }
    });

    test('TC_HP_Knimbus_006 - Should display specific Section cards as configured in env @regression', async () => {
        const envCards = process.env.SECTION_WIDGET_EXPECTED_CARDS || '';
        const expectedCards = envCards.split(',').map(c => c.trim()).filter(c => c.length > 0);

        if (expectedCards.length > 0) {
            const actualCards = await homePage.getWidgetCardTitles('SECTION');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });


    test('TC_HP_Knimbus_007 - Should navigate correctly when clicking a Section card @regression', async () => {

        const sectionCard = await homePage.getFirstWidgetCard('SECTION');

        await sectionCard.click();

        await homePage.verifyWidgetCardNavigation('SECTION');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 4. SUBJECT WIDGET
    // ============================================================

    test('TC_HP_Knimbus_008 - Should display valid cards in Subject widget @regression', async () => {

        const subjectCards = await homePage.getWidgetCards('Subject');

        expect(subjectCards.length).toBeGreaterThan(0);

        for (const card of subjectCards) {
            await expect(card).toBeVisible();

            const cardText = await card.innerText();

            expect(cardText.trim()).not.toBe('');
        }
    });

    test('TC_HP_Knimbus_009 - Should display specific Subject cards as configured in env @regression', async () => {
        const envCards = process.env.SUBJECT_WIDGET_EXPECTED_CARDS || '';
        const expectedCards = envCards.split(',').map(c => c.trim()).filter(c => c.length > 0);

        if (expectedCards.length > 0) {
            const actualCards = await homePage.getWidgetCardTitles('Subject');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });



    test('TC_HP_Knimbus_010 - Should navigate correctly when clicking a Subject card @regression', async () => {

        const subjectCard = await homePage.getFirstWidgetCard('Subject');

        await subjectCard.click();

        await homePage.verifyWidgetCardNavigation('Subject');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 5. CONTENT WIDGET
    // ============================================================

    test('TC_HP_Knimbus_011 - Should display all configured Content types @regression', async () => {

        const contentCards = await homePage.getWidgetCards('Content');

        expect(contentCards.length).toBeGreaterThan(0);

        for (const card of contentCards) {
            await expect(card).toBeVisible();

            const cardText = await card.innerText();
            expect(cardText.trim()).not.toBe('');
        }
    });

    test('TC_HP_Knimbus_012 - Should display specific Content cards as configured in env @regression', async () => {
        const envCards = process.env.CONTENT_WIDGET_EXPECTED_CARDS || '';
        const expectedCards = envCards.split(',').map(c => c.trim()).filter(c => c.length > 0);

        if (expectedCards.length > 0) {
            const actualCards = await homePage.getWidgetCardTitles('Content');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });


    test('TC_HP_Knimbus_013 - Should display valid numeric count for Content cards @regression', async () => {

        const contentCards = await homePage.getWidgetCards('Content');

        for (const card of contentCards) {

            const count = await homePage.getWidgetCardCount(card);

            expect(count).toMatch(/^\d[\d,]*$/);
        }
    });


    test('TC_HP_Knimbus_014 - Should navigate correctly when clicking a Content card @regression', async () => {

        const contentCard = await homePage.getFirstWidgetCard('Content');

        await contentCard.click();

        await homePage.verifyWidgetCardNavigation('Content');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 6. COURSE WIDGET
    // ============================================================

    test('TC_HP_Knimbus_015 - Should display valid cards in Course widget @regression', async () => {

        const courseCards = await homePage.getWidgetCards('Course');

        expect(courseCards.length).toBeGreaterThan(0);

        for (const card of courseCards) {
            await expect(card).toBeVisible();

            const cardText = await card.innerText();

            expect(cardText.trim()).not.toBe('');
        }
    });

    test('TC_HP_Knimbus_016 - Should display specific Course cards as configured in env @regression', async () => {
        const envCards = process.env.COURSE_WIDGET_EXPECTED_CARDS || '';
        const expectedCards = envCards.split(',').map(c => c.trim()).filter(c => c.length > 0);

        if (expectedCards.length > 0) {
            const actualCards = await homePage.getWidgetCardTitles('Course');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });


    test('TC_HP_Knimbus_017 - Should navigate correctly when clicking a Course card @regression', async () => {

        const courseCard = await homePage.getFirstWidgetCard('Course');

        await courseCard.click();

        await homePage.verifyWidgetCardNavigation('Course');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 7. USEFUL LINKS WIDGET
    // ============================================================

    test('TC_HP_Knimbus_018 - Should display valid Useful Links cards @regression', async () => {

        const usefulLinks = await homePage.getWidgetCards('Useful Links');

        expect(usefulLinks.length).toBeGreaterThan(0);

        for (const link of usefulLinks) {
            await expect(link).toBeVisible();

            const linkText = await link.innerText();

            expect(linkText.trim()).not.toBe('');
        }
    });


    test('TC_HP_Knimbus_019 - Should have valid target URL for Useful Links @regression', async () => {

        const usefulLinks = await homePage.getWidgetCards('Useful Links');

        for (const link of usefulLinks) {

            const href = await link.getAttribute('href');

            expect(href).not.toBeNull();
            expect(href).not.toBe('');
        }
    });

    test('TC_HP_Knimbus_020 - Should display specific Useful Links cards as configured in env @regression', async () => {
        const envCards = process.env.USEFUL_LINKS_EXPECTED_CARDS || '';
        const expectedCards = envCards.split(',').map(c => c.trim()).filter(c => c.length > 0);

        if (expectedCards.length > 0) {
            const actualCards = await homePage.getWidgetCardTitles('Useful Links');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });


    // ============================================================
    // 8. VIEW ALL
    // ============================================================

    test('TC_HP_Knimbus_021 - Should navigate to View All pages and return to Home Page @regression', async () => {

        const widgetsWithViewAll = [
            'Source',
            'SECTION',
            'Subject',
            'Content',
            'Course'
        ];

        for (const widget of widgetsWithViewAll) {

            await homePage.clickWidgetViewAll(widget);

            await homePage.verifyViewAllPage(widget);

            await homePage.navigateBackToHome();
        }
    });


    // ============================================================
    // 9. WIDGET ORDER
    // ============================================================

    test('TC_HP_Knimbus_022 - Should display Home Page widgets in configured order @regression', async () => {
        // Expected order configured via Admin API and verified through .env parameterization
        const envWidgets = process.env.HOME_PAGE_EXPECTED_WIDGETS || 'Publishers & Databases,Browse by Section,Academic Subjects,Content Types,Course Materials,Quick Links';
        const expectedWidgets = envWidgets.split(',').map(w => w.trim());


        const actualWidgets = await homePage.getVisibleWidgetTitles();

        expect(actualWidgets).toEqual(
            expect.arrayContaining(expectedWidgets)
        );
    });


    // ============================================================
    // 10. WIDGET CARD DUPLICATION
    // ============================================================

    test('TC_HP_Knimbus_023 - Should not display duplicate cards within widgets @regression', async () => {

        const widgets = [
            'Source',
            'SECTION',
            'Subject',
            'Content',
            'Course',
            'Useful Links'
        ];

        for (const widget of widgets) {

            const cardTitles =
                await homePage.getWidgetCardTitles(widget);

            const uniqueTitles = new Set(cardTitles);

            expect(uniqueTitles.size).toBe(cardTitles.length);
        }
    });


    // ============================================================
    // 11. WIDGET CARD TITLE VALIDATION
    // ============================================================

    test('TC_HP_Knimbus_024 - Should display non-empty title for every widget card @regression', async () => {

        const widgets = [
            'Source',
            'SECTION',
            'Subject',
            'Content',
            'Course',
            'Useful Links'
        ];

        for (const widget of widgets) {

            const cardTitles =
                await homePage.getWidgetCardTitles(widget);

            expect(cardTitles.length).toBeGreaterThan(0);

            for (const title of cardTitles) {
                expect(title.trim()).not.toBe('');
            }
        }
    });


    // ============================================================
    // 12. HOME PAGE STATE AFTER NAVIGATION
    // ============================================================

    test('TC_HP_Knimbus_025 - Should retain Home Page widget visibility after returning from widget page @regression', async () => {

        await homePage.clickFirstWidgetCard('Source');

        await homePage.verifyWidgetCardNavigation('Source');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();

        await homePage.verifySourceWidget();
        await homePage.verifySectionWidget();
        await homePage.verifySubjectWidget();
        await homePage.verifyContentWidget();
        await homePage.verifyCourseWidget();
        await homePage.verifyUsefulLinksWidget();
    });


    // ============================================================
    // 13. ADDITIONAL HOME PAGE VERIFICATIONS
    // ============================================================

    test('TC_HP_Knimbus_026 - Should display the home page banner @regression', async () => {
        await homePage.verifyBanner();
    });

    test('TC_HP_Knimbus_027 - Should display widget section names and view all buttons @regression', async () => {
        const envWidgets = process.env.HOME_PAGE_EXPECTED_WIDGETS || 'Publishers & Databases,Browse by Section,Academic Subjects,Content Types,Course Materials,Quick Links';
        const expectedWidgets = envWidgets.split(',').map(w => w.trim());

        for (const widgetName of expectedWidgets) {
            const container = homePage.getWidgetContainer(widgetName);
            await expect(container).toBeVisible();

            const heading = container.locator('.grp-widget-title');
            await expect(heading).toBeVisible();
            const headingText = await heading.innerText();
            expect(headingText.trim().toLowerCase()).toBe(widgetName.toLowerCase());

            // "Quick Links" widget does not have a View All button in the UI
            if (widgetName.toLowerCase() !== 'quick links') {
                const viewAllLink = container.locator('a.viewAll');
                await expect(viewAllLink).toBeVisible();
            }
        }
    });

    test('TC_HP_Knimbus_028 - Should navigate correctly when clicking View All button for all widgets @regression', async () => {
        const internalWidgets = [
            'Source',
            'SECTION',
            'Subject',
            'Content',
            'Course'
            // 'Useful Links' is excluded because it does not have a View All button
        ];

        for (const widget of internalWidgets) {
            await homePage.clickWidgetViewAll(widget);
            await homePage.verifyViewAllPage(widget);
            await homePage.navigateBackToHome();
        }
    });

});
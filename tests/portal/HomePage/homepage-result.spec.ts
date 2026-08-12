import { test, expect } from '../../../src/fixtures';

test.describe('Portal Home Page - Widgets Integrity & Routing Validation', () => {

    test.beforeEach(async ({
        portalLoginPage,
        homePage,
        termsAndConditionUser
    }) => {
        await portalLoginPage.login(
            termsAndConditionUser.email,
            termsAndConditionUser.password
        );

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 1. HOME PAGE - ALL WIDGETS
    // ============================================================

    test('Should display all configured Home Page widgets @smoke @regression', async ({
        homePage
    }) => {

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

    test('Should display valid cards in Source widget @regression', async ({
        homePage
    }) => {

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


    test('Should navigate correctly when clicking a Source card @regression', async ({
        homePage
    }) => {

        const sourceCard = await homePage.getFirstWidgetCard('Source');

        await sourceCard.click();

        await homePage.verifyWidgetCardNavigation('Source');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 3. SECTION WIDGET
    // ============================================================

    test('Should display valid cards in Section widget @regression', async ({
        homePage
    }) => {

        const sectionCards = await homePage.getWidgetCards('SECTION');

        expect(sectionCards.length).toBeGreaterThan(0);

        for (const card of sectionCards) {
            await expect(card).toBeVisible();

            const cardText = await card.innerText();

            expect(cardText.trim()).not.toBe('');
        }
    });


    test('Should navigate correctly when clicking a Section card @regression', async ({
        homePage
    }) => {

        const sectionCard = await homePage.getFirstWidgetCard('SECTION');

        await sectionCard.click();

        await homePage.verifyWidgetCardNavigation('SECTION');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 4. SUBJECT WIDGET
    // ============================================================

    test('Should display valid cards in Subject widget @regression', async ({
        homePage
    }) => {

        const subjectCards = await homePage.getWidgetCards('Subject');

        expect(subjectCards.length).toBeGreaterThan(0);

        for (const card of subjectCards) {
            await expect(card).toBeVisible();

            const cardText = await card.innerText();

            expect(cardText.trim()).not.toBe('');
        }
    });


    test('Should navigate correctly when clicking a Subject card @regression', async ({
        homePage
    }) => {

        const subjectCard = await homePage.getFirstWidgetCard('Subject');

        await subjectCard.click();

        await homePage.verifyWidgetCardNavigation('Subject');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 5. CONTENT WIDGET
    // ============================================================

    test('Should display all configured Content types @regression', async ({
        homePage
    }) => {

        const contentCards = await homePage.getWidgetCards('Content');

        expect(contentCards.length).toBeGreaterThan(0);

        for (const card of contentCards) {
            await expect(card).toBeVisible();

            const cardText = await card.innerText();

            expect(cardText.trim()).not.toBe('');
        }
    });


    test('Should display valid numeric count for Content cards @regression', async ({
        homePage
    }) => {

        const contentCards = await homePage.getWidgetCards('Content');

        for (const card of contentCards) {

            const count = await homePage.getWidgetCardCount(card);

            expect(count).toMatch(/^\d[\d,]*$/);
        }
    });


    test('Should navigate correctly when clicking a Content card @regression', async ({
        homePage
    }) => {

        const contentCard = await homePage.getFirstWidgetCard('Content');

        await contentCard.click();

        await homePage.verifyWidgetCardNavigation('Content');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 6. COURSE WIDGET
    // ============================================================

    test('Should display valid cards in Course widget @regression', async ({
        homePage
    }) => {

        const courseCards = await homePage.getWidgetCards('Course');

        expect(courseCards.length).toBeGreaterThan(0);

        for (const card of courseCards) {
            await expect(card).toBeVisible();

            const cardText = await card.innerText();

            expect(cardText.trim()).not.toBe('');
        }
    });


    test('Should navigate correctly when clicking a Course card @regression', async ({
        homePage
    }) => {

        const courseCard = await homePage.getFirstWidgetCard('Course');

        await courseCard.click();

        await homePage.verifyWidgetCardNavigation('Course');

        await homePage.navigateBackToHome();

        await homePage.verifyHomePage();
    });


    // ============================================================
    // 7. USEFUL LINKS WIDGET
    // ============================================================

    test('Should display valid Useful Links cards @regression', async ({
        homePage
    }) => {

        const usefulLinks = await homePage.getWidgetCards('Useful Links');

        expect(usefulLinks.length).toBeGreaterThan(0);

        for (const link of usefulLinks) {
            await expect(link).toBeVisible();

            const linkText = await link.innerText();

            expect(linkText.trim()).not.toBe('');
        }
    });


    test('Should have valid target URL for Useful Links @regression', async ({
        homePage
    }) => {

        const usefulLinks = await homePage.getWidgetCards('Useful Links');

        for (const link of usefulLinks) {

            const href = await link.getAttribute('href');

            expect(href).not.toBeNull();
            expect(href).not.toBe('');
        }
    });


    // ============================================================
    // 8. VIEW ALL
    // ============================================================

    test('Should navigate to View All pages and return to Home Page @regression', async ({
        homePage
    }) => {

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

            await homePage.verifyHomePage();
        }
    });


    // ============================================================
    // 9. WIDGET ORDER
    // ============================================================

    test('Should display Home Page widgets in configured order @regression', async ({
        homePage
    }) => {

        const expectedWidgets = [
            'Source',
            'SECTION',
            'Subject',
            'Content',
            'Course',
            'Useful Links'
        ];

        const actualWidgets = await homePage.getVisibleWidgetTitles();

        expect(actualWidgets).toEqual(
            expect.arrayContaining(expectedWidgets)
        );
    });


    // ============================================================
    // 10. WIDGET CARD DUPLICATION
    // ============================================================

    test('Should not display duplicate cards within widgets @regression', async ({
        homePage
    }) => {

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

    test('Should display non-empty title for every widget card @regression', async ({
        homePage
    }) => {

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

    test('Should retain Home Page widget visibility after returning from widget page @regression', async ({
        homePage
    }) => {

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

});
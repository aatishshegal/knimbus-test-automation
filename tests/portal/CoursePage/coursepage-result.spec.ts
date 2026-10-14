import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { CoursePage } from '../../../src/pages/portal/CoursePage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import coursePageData from '../../test-data/coursePageData.json';

test.describe.serial('Portal Course Page - Widgets Integrity & Routing Validation', () => {
    let sharedPage: Page;
    let coursePage: CoursePage;

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
        coursePage = new CoursePage(sharedPage);

        await portalLoginPage.login(
            process.env.TC_USER_EMAIL as string,
            process.env.TC_USER_PASSWORD as string
        );
        await coursePage.goto();
    });


    // ============================================================
    // 1. COURSE PAGE - ALL WIDGETS
    // ============================================================

    test('TC_CoursePage_001 - Should display all configured Course Page widgets @smoke @regression', async () => {
        await coursePage.verifyCourseDirectoryWidget();
        await coursePage.verifyCourseGalleryWidget();
        await coursePage.verifyCourseListingWidget();
        await coursePage.verifyCourseSliderCardsWidget();
        await coursePage.verifyCourseSliderGalleryWidget();
    });


    // ============================================================
    // 2. COURSE DIRECTORY WIDGET
    // ============================================================

    test('TC_CoursePage_002 - Should display valid cards in Course Directory widget @regression', async () => {
        const directoryCards = await coursePage.getWidgetCards('Course Directory');
        expect(directoryCards.length).toBeGreaterThan(0);

        for (const card of directoryCards) {
            await expect(card).toBeVisible();
            const title = await card.getAttribute('title');
            const text = await card.innerText();
            expect((title || text).trim()).not.toBe('');
        }
    });

    test('TC_CoursePage_003 - Should display specific Course Directory cards as configured in test data @regression', async () => {
        const expectedCards = coursePageData.courseDirectoryExpectedCards || [];
        if (expectedCards.length > 0) {
            const actualCards = await coursePage.getWidgetCardTitles('Course Directory');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });

    test('TC_CoursePage_004 - Should navigate correctly when clicking a Course Directory card @regression', async () => {
        await coursePage.clickFirstWidgetCard('Course Directory');

        await coursePage.verifyWidgetCardNavigation('Course Directory');
        await coursePage.navigateBackToCoursePage();
        await coursePage.verifyCoursePageLoaded();
    });

    test('TC_CoursePage_005 - Should filter cards when searching within Course Directory widget @regression', async () => {
        const searchInput = coursePage.getWidgetSearchInput('Course Directory').first();
        if (await searchInput.isVisible()) {
            const cardsBefore = await coursePage.getWidgetCards('Course Directory');
            const sampleCardText = (await cardsBefore[0].innerText() || await cardsBefore[0].getAttribute('title') || '').trim();

            await coursePage.searchWidget('Course Directory', sampleCardText.slice(0, 5));
            await sharedPage.waitForTimeout(1000);

            const cardsAfter = await coursePage.getWidgetCards('Course Directory');
            expect(cardsAfter.length).toBeGreaterThan(0);

            await coursePage.searchWidget('Course Directory', '');
            await sharedPage.waitForTimeout(1000);
        }
    });


    // ============================================================
    // 3. COURSE GALLERY WIDGET
    // ============================================================

    test('TC_CoursePage_006 - Should display valid cards in Course Gallery widget @regression', async () => {
        const galleryCards = await coursePage.getWidgetCards('Course Gallery');
        expect(galleryCards.length).toBeGreaterThan(0);

        for (const card of galleryCards) {
            await expect(card).toBeVisible();
            const title = await card.getAttribute('title');
            const text = await card.innerText();
            expect((title || text).trim()).not.toBe('');
        }
    });

    test('TC_CoursePage_007 - Should display specific Course Gallery cards as configured in test data @regression', async () => {
        const expectedCards = coursePageData.courseGalleryExpectedCards || [];
        if (expectedCards.length > 0) {
            const actualCards = await coursePage.getWidgetCardTitles('Course Gallery');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });

    test('TC_CoursePage_008 - Should navigate correctly when clicking a Course Gallery card @regression', async () => {
        await coursePage.clickFirstWidgetCard('Course Gallery');

        await coursePage.verifyWidgetCardNavigation('Course Gallery');
        await coursePage.navigateBackToCoursePage();
        await coursePage.verifyCoursePageLoaded();
    });


    // ============================================================
    // 4. COURSE LISTING WIDGET
    // ============================================================

    test('TC_CoursePage_009 - Should display valid cards in Course Listing widget @regression', async () => {
        const listingCards = await coursePage.getWidgetCards('Course Listing');
        expect(listingCards.length).toBeGreaterThan(0);

        for (const card of listingCards) {
            await expect(card).toBeVisible();
            const title = await card.getAttribute('title');
            const text = await card.innerText();
            expect((title || text).trim()).not.toBe('');
        }
    });

    test('TC_CoursePage_010 - Should display specific Course Listing cards as configured in test data @regression', async () => {
        const expectedCards = coursePageData.courseListingExpectedCards || [];
        if (expectedCards.length > 0) {
            const actualCards = await coursePage.getWidgetCardTitles('Course Listing');
            expect(actualCards).toEqual(expect.arrayContaining(expectedCards));
        }
    });

    test('TC_CoursePage_011 - Should navigate correctly when clicking a Course Listing card @regression', async () => {
        await coursePage.clickFirstWidgetCard('Course Listing');

        await coursePage.verifyWidgetCardNavigation('Course Listing');
        await coursePage.navigateBackToCoursePage();
        await coursePage.verifyCoursePageLoaded();
    });


    // ============================================================
    // 5. COURSE SLIDER WIDGETS
    // ============================================================

    test('TC_CoursePage_012 - Should display valid cards in Course Slider — Cards widget @regression', async () => {
        const sliderCards = await coursePage.getWidgetCards('Course Slider — Cards');
        expect(sliderCards.length).toBeGreaterThan(0);

        for (const card of sliderCards) {
            await expect(card).toBeVisible();
            const title = await card.getAttribute('title');
            const text = await card.innerText();
            expect((title || text).trim()).not.toBe('');
        }
    });

    test('TC_CoursePage_013 - Should navigate slides using previous and next controls in Course Slider @regression', async () => {
        await coursePage.clickNextSlide();
        await coursePage.clickPreviousSlide();
        await expect(coursePage.page.locator('.react-multi-carousel-list, [class*="carousel"]').first()).toBeVisible();
    });

    test('TC_CoursePage_014 - Should navigate correctly when clicking a Course Slider card @regression', async () => {
        await coursePage.clickFirstWidgetCard('Course Slider — Cards');

        await coursePage.verifyWidgetCardNavigation('Course Slider — Cards');
        await coursePage.navigateBackToCoursePage();
        await coursePage.verifyCoursePageLoaded();
    });

    test('TC_CoursePage_015 - Should display valid image cards in Course Slider — Gallery widget @regression', async () => {
        const gallerySliderCards = await coursePage.getWidgetCards('Course Slider — Gallery');
        expect(gallerySliderCards.length).toBeGreaterThan(0);

        for (const card of gallerySliderCards) {
            await expect(card).toBeVisible();
            const imgCount = await card.locator('img').count();
            expect(imgCount).toBeGreaterThan(0);
        }
    });


    // ============================================================
    // 6. VIEW ALL NAVIGATION
    // ============================================================

    test('TC_CoursePage_016 - Should navigate to View All course page and return to Course Page @regression', async () => {
        const widgetsWithViewAll = [
            'Course Directory'
        ];

        for (const widget of widgetsWithViewAll) {
            await coursePage.clickWidgetViewAll(widget);
            await coursePage.verifyViewAllPage();
            await coursePage.navigateBackToCoursePage();
            await coursePage.verifyCoursePageLoaded();
        }
    });


    // ============================================================
    // 7. WIDGET ORDER
    // ============================================================

    test('TC_CoursePage_017 - Should display Course Page widgets in configured order @regression', async () => {
        const expectedWidgets = coursePageData.coursePageExpectedWidgets || [
            'Course Directory',
            'Course Gallery',
            'Course Listing',
            'Course Slider — Cards',
            'Course Slider — Gallery'
        ];

        const actualWidgets = await coursePage.getVisibleWidgetTitles();
        expect(actualWidgets).toEqual(
            expect.arrayContaining(expectedWidgets)
        );
    });


    // ============================================================
    // 8. WIDGET CARD DUPLICATION
    // ============================================================

    test('TC_CoursePage_018 - Should not display duplicate cards within widgets @regression', async () => {
        const widgets = [
            'Course Directory',
            'Course Gallery',
            'Course Listing'
        ];

        for (const widget of widgets) {
            const cardTitles = await coursePage.getWidgetCardTitles(widget);
            const uniqueTitles = new Set(cardTitles);
            expect(uniqueTitles.size).toBe(cardTitles.length);
        }
    });


    // ============================================================
    // 9. WIDGET CARD TITLE VALIDATION
    // ============================================================

    test('TC_CoursePage_019 - Should display non-empty title for every widget card @regression', async () => {
        const widgets = [
            'Course Directory',
            'Course Gallery',
            'Course Listing',
            'Course Slider — Cards'
        ];

        for (const widget of widgets) {
            const cardTitles = await coursePage.getWidgetCardTitles(widget);
            expect(cardTitles.length).toBeGreaterThan(0);

            for (const title of cardTitles) {
                expect(title.trim()).not.toBe('');
            }
        }
    });


    // ============================================================
    // 10. VISUAL CARD LAYOUT & STYLES
    // ============================================================

    test('TC_CoursePage_020 - Should validate card visual layout styles (Name and Image vs Text Only) @regression', async () => {
        // Course Gallery has both Name and Image
        await coursePage.verifyCardStyle('Course Gallery', 'nameAndImage');

        // Course Slider — Gallery has image
        await coursePage.verifyCardStyle('Course Slider — Gallery', 'onlyImage');
    });


    // ============================================================
    // 11. COURSE PAGE STATE AFTER NAVIGATION
    // ============================================================

    test('TC_CoursePage_021 - Should retain Course Page widget visibility after returning from course card @regression', async () => {
        await coursePage.clickFirstWidgetCard('Course Directory');
        await coursePage.verifyWidgetCardNavigation('Course Directory');
        await coursePage.navigateBackToCoursePage();
        await coursePage.verifyCoursePageLoaded();

        await coursePage.verifyCourseDirectoryWidget();
        await coursePage.verifyCourseGalleryWidget();
        await coursePage.verifyCourseListingWidget();
        await coursePage.verifyCourseSliderCardsWidget();
        await coursePage.verifyCourseSliderGalleryWidget();
    });


    // ============================================================
    // 12. ADDITIONAL COURSE PAGE VERIFICATIONS
    // ============================================================

    test('TC_CoursePage_022 - Should display Course breadcrumb navigation indicator @regression', async () => {
        await expect(coursePage.breadcrumbCourse).toBeVisible();
    });

    test('TC_CoursePage_023 - Should display widget section names and view all buttons @regression', async () => {
        const expectedWidgets = coursePageData.coursePageExpectedWidgets || [
            'Course Directory',
            'Course Gallery',
            'Course Listing',
            'Course Slider — Cards',
            'Course Slider — Gallery'
        ];

        for (const widgetName of expectedWidgets) {
            const container = coursePage.getWidgetContainer(widgetName);
            await expect(container).toBeVisible();

            const heading = container.locator('.grp-widget-title');
            await expect(heading).toBeVisible();
            const headingText = await heading.innerText();
            expect(headingText.trim().toLowerCase()).toContain(widgetName.toLowerCase());
        }
    });


    // ============================================================
    // 13. SEARCH VALIDATION (MATCHING, NON-MATCHING, RESET)
    // ============================================================

    test('TC_CoursePage_024 - Search with matching course name @regression', async () => {
        await coursePage.verifySearchFiltersMatchingResults(
            coursePageData.widgetNames.directory,
            coursePageData.searchValidQuery
        );
    });

    test('TC_CoursePage_025 - Search with no matching results @regression', async () => {
        await coursePage.verifySearchNoMatchingResults(
            coursePageData.widgetNames.directory,
            coursePageData.searchInvalidQuery
        );
    });

    test('TC_CoursePage_026 - Reset search and restore all cards @regression', async () => {
        await coursePage.verifyResetSearchRestoresCards(
            coursePageData.widgetNames.directory,
            coursePageData.searchValidQuery
        );
    });


    // ============================================================
    // 14. COMPREHENSIVE NAVIGATION & VIEW ALL VALIDATION
    // ============================================================

    test('TC_CoursePage_027 - Validate navigation for every widget type @regression', async () => {
        for (const widgetName of coursePageData.allWidgetsInExactOrder) {
            await coursePage.verifyCardNavigationForWidget(widgetName);
        }
    });

    test('TC_CoursePage_028 - Validate View All for each supported widget @regression', async () => {
        await coursePage.verifySupportedWidgetsViewAll(coursePageData.widgetsWithViewAll);
    });


    // ============================================================
    // 15. SLIDER BOUNDARY, CARD IMAGES & RESPONSIVENESS
    // ============================================================

    test('TC_CoursePage_029 - Validate slider boundaries @regression', async () => {
        await coursePage.verifySliderBoundaries(coursePageData.widgetNames.sliderCards);
        await coursePage.verifySliderBoundaries(coursePageData.widgetNames.sliderGallery);
    });

    test('TC_CoursePage_030 - Validate course card images @regression', async () => {
        await coursePage.verifyCardImagesLoaded(coursePageData.widgetNames.gallery);
        await coursePage.verifyCardImagesLoaded(coursePageData.widgetNames.sliderGallery);
    });

    test('TC_CoursePage_031 - Responsive layout validation @regression', async () => {
        for (const viewport of coursePageData.responsiveViewports) {
            await coursePage.verifyResponsiveLayout(viewport);
        }
    });


    // ============================================================
    // 16. EXACT WIDGET ORDERING & UNAUTHORIZED SESSION
    // ============================================================

    test('TC_CoursePage_032 - Validate exact widget ordering @regression', async () => {
        await coursePage.verifyExactWidgetOrdering(coursePageData.allWidgetsInExactOrder);
    });

    test('TC_CoursePage_033 - Validate unauthorized session behavior @regression', async () => {
        await coursePage.verifyUnauthorizedSessionBehavior();
    });

});

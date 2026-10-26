import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { SubjectPage } from '../../../src/pages/portal/SubjectPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import subjectData from '../../test-data/subject-data.json';

test.describe('Portal Subject Page - Full Widgets Coverage & Positive/Negative Scenarios', () => {
    let sharedPage: Page;
    let subjectPage: SubjectPage;

    test.beforeAll(async ({ browser }) => {
        const email = process.env.SUBJECT_PAGE_USER_EMAIL || process.env.SECTION_USER_EMAIL || 'playwrighttest@yopmail.com';
        const password = process.env.SUBJECT_PAGE_USER_PASSWORD || process.env.SECTION_USER_PASSWORD || '12345';

        try {
            const adminApi = new AdminApiService();
            await adminApi.login();
            await adminApi.updateSecuritySettings({
                twoFactorAuth: false,
                automatedVerification: true,
                mandatoryFields: { isMandatory: false, fields: [] }
            });
            await adminApi.changeUserPassword(email, password);
            await adminApi.close();
        } catch (err) {
            console.log('[Setup Warning] Admin API setup skipped or failed:', (err as Error).message);
        }

        const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
        sharedPage = await context.newPage();

        const portalLoginPage = new PortalLoginPage(sharedPage);
        subjectPage = new SubjectPage(sharedPage);

        await sharedPage.goto(subjectData.targetUrl);
        await portalLoginPage.login(email, password);
        await subjectPage.goto(subjectData.subjectUrl);
    });

    test.beforeEach(async () => {
        await subjectPage.navigateToSubjectTab();
    });

    // ==========================================
    // SECTION 1: CORE PAGE LOAD & NAVIGATION
    // ==========================================

    /**
     * Objective: Verify that the Subject Page loads successfully with its primary heading.
     */
    test('TC_SubjectPage_001 - Should load Subject page successfully @regression', async () => {
        await subjectPage.verifySubjectPageLoaded();
    });

    /**
     * Objective: Verify header navigation link for Subject tab.
     */
    test('TC_SubjectPage_002 - Verify Subject navbar tab link visibility and navigation @regression', async () => {
        await subjectPage.navigateToSubjectTab();
        await expect(subjectPage.subjectTabLink).toBeVisible();
    });

    /**
     * Objective: Verify breadcrumb displays Home / Subject.
     */
    test('TC_SubjectPage_003 - Verify Breadcrumb navigation on Subject page @regression', async () => {
        await expect(subjectPage.breadcrumbSubject).toBeVisible();
    });

    // ==========================================
    // WIDGET 1: SUBJECTS — NAME & IMAGE
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_01 - "Subjects — Name & Image" - Heading visibility validation @regression', async () => {
        await subjectPage.verifyWidget(subjectData.widgetHeadings.nameAndImage);
    });

    /**
     * Objective: Verify exact description text for "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_02 - "Subjects — Name & Image" - Exact description text validation @regression', async () => {
        await subjectPage.verifyWidgetDescription(subjectData.widgetHeadings.nameAndImage, subjectData.expectedDescriptions.nameAndImage);
    });

    /**
     * Objective: Verify in-widget search input bar visibility and placeholder.
     */
    test('TC_SubjectPage_W01_03 - "Subjects — Name & Image" - Search bar visibility and placeholder @regression', async () => {
        await subjectPage.verifyWidgetSearchInput(subjectData.widgetHeadings.nameAndImage, subjectData.search.placeholder);
    });

    /**
     * Objective: Verify card list container structure and presence of cards.
     */
    test('TC_SubjectPage_W01_04 - "Subjects — Name & Image" - Card list container structure @regression', async () => {
        await subjectPage.verifyWidgetCardContainer(subjectData.widgetHeadings.nameAndImage);
    });

    /**
     * Objective: Verify cover image visibility on first card in "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_05 - "Subjects — Name & Image" - First card cover image visibility @regression', async () => {
        await subjectPage.verifyWidgetCoverImage(subjectData.widgetHeadings.nameAndImage);
    });

    /**
     * Objective: Verify title label visibility on cards in "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_06 - "Subjects — Name & Image" - Card title label visibility @regression', async () => {
        await subjectPage.verifyWidgetTitleLabel(subjectData.widgetHeadings.nameAndImage);
    });

    /**
     * Objective: Verify image hover and pointer cursor style for "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_07 - "Subjects — Name & Image" - Image hover display and pointer cursor @regression', async () => {
        await subjectPage.verifyWidgetCardHoverAndCursor(subjectData.widgetHeadings.nameAndImage);
    });

    /**
     * Objective: Verify card click interaction for "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_08 - "Subjects — Name & Image" - Card clickability interaction @regression', async () => {
        await subjectPage.clickCardInWidget(subjectData.widgetHeadings.nameAndImage);
    });

    /**
     * Objective: Verify positive search filtering for "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_09 - "Subjects — Name & Image" - Positive search filtering @regression', async () => {
        await subjectPage.verifyPositiveSearchQuery(subjectData.widgetHeadings.nameAndImage, subjectData.search.positiveQuery);
    });

    /**
     * Objective: Verify negative search returning 0 results for "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_10 - "Subjects — Name & Image" - Negative search returning 0 results @regression', async () => {
        await subjectPage.verifyNegativeSearchQuery(subjectData.widgetHeadings.nameAndImage, subjectData.search.invalidQuery);
    });

    /**
     * Objective: Verify search reset behavior on clearing search bar for "Subjects — Name & Image".
     */
    test('TC_SubjectPage_W01_11 - "Subjects — Name & Image" - Search reset behavior @regression', async () => {
        await subjectPage.verifySearchResetQuery(subjectData.widgetHeadings.nameAndImage);
    });

    // ==========================================
    // WIDGET 2: SUBJECTS — GALLERY
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_01 - "Subjects — Gallery" - Heading visibility validation @regression', async () => {
        await subjectPage.verifyWidget(subjectData.widgetHeadings.gallery);
    });

    /**
     * Objective: Verify exact description text for "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_02 - "Subjects — Gallery" - Exact description text validation @regression', async () => {
        await subjectPage.verifyWidgetDescription(subjectData.widgetHeadings.gallery, subjectData.expectedDescriptions.gallery);
    });

    /**
     * Objective: Verify in-widget search input bar visibility and placeholder.
     */
    test('TC_SubjectPage_W02_03 - "Subjects — Gallery" - Search bar visibility and placeholder @regression', async () => {
        await subjectPage.verifyWidgetSearchInput(subjectData.widgetHeadings.gallery, subjectData.search.placeholder);
    });

    /**
     * Objective: Verify gallery card list container structure and presence of cards.
     */
    test('TC_SubjectPage_W02_04 - "Subjects — Gallery" - Card list container structure @regression', async () => {
        await subjectPage.verifyWidgetCardContainer(subjectData.widgetHeadings.gallery);
    });

    /**
     * Objective: Verify cover image visibility on first card in "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_05 - "Subjects — Gallery" - First card cover image visibility @regression', async () => {
        await subjectPage.verifyWidgetCoverImage(subjectData.widgetHeadings.gallery);
    });

    /**
     * Objective: Verify title label visibility on cards in "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_06 - "Subjects — Gallery" - Card title label visibility @regression', async () => {
        await subjectPage.verifyWidgetTitleLabel(subjectData.widgetHeadings.gallery);
    });

    /**
     * Objective: Verify image hover and pointer cursor style for "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_07 - "Subjects — Gallery" - Image hover display and pointer cursor @regression', async () => {
        await subjectPage.verifyWidgetCardHoverAndCursor(subjectData.widgetHeadings.gallery);
    });

    /**
     * Objective: Verify card click interaction for "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_08 - "Subjects — Gallery" - Card clickability interaction @regression', async () => {
        await subjectPage.clickCardInWidget(subjectData.widgetHeadings.gallery);
    });

    /**
     * Objective: Verify positive search filtering for "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_09 - "Subjects — Gallery" - Positive search filtering @regression', async () => {
        await subjectPage.verifyPositiveSearchQuery(subjectData.widgetHeadings.gallery, 'Zoology');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_10 - "Subjects — Gallery" - Negative search returning 0 results @regression', async () => {
        await subjectPage.verifyNegativeSearchQuery(subjectData.widgetHeadings.gallery, subjectData.search.invalidQuery);
    });

    /**
     * Objective: Verify search reset behavior on clearing search bar for "Subjects — Gallery".
     */
    test('TC_SubjectPage_W02_11 - "Subjects — Gallery" - Search reset behavior @regression', async () => {
        await subjectPage.verifySearchResetQuery(subjectData.widgetHeadings.gallery);
    });

    // ==========================================
    // WIDGET 3: SUBJECT SLIDER — CARDS
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Subject Slider — Cards".
     */
    test('TC_SubjectPage_W03_01 - "Subject Slider — Cards" - Heading visibility validation @regression', async () => {
        await subjectPage.verifyWidget(subjectData.widgetHeadings.sliderCards);
    });

    /**
     * Objective: Verify exact description text for "Subject Slider — Cards".
     */
    test('TC_SubjectPage_W03_02 - "Subject Slider — Cards" - Exact description text validation @regression', async () => {
        await subjectPage.verifyWidgetDescription(subjectData.widgetHeadings.sliderCards, subjectData.expectedDescriptions.sliderCards);
    });

    /**
     * Objective: Verify slider container structure and presence of cards.
     */
    test('TC_SubjectPage_W03_03 - "Subject Slider — Cards" - Card list container structure @regression', async () => {
        await subjectPage.verifyWidgetCardContainer(subjectData.widgetHeadings.sliderCards);
    });

    /**
     * Objective: Verify cover image visibility on slider cards.
     */
    test('TC_SubjectPage_W03_04 - "Subject Slider — Cards" - First card cover image visibility @regression', async () => {
        await subjectPage.verifyWidgetCoverImage(subjectData.widgetHeadings.sliderCards);
    });

    /**
     * Objective: Verify card title label visibility in slider.
     */
    test('TC_SubjectPage_W03_05 - "Subject Slider — Cards" - Card title label visibility @regression', async () => {
        await subjectPage.verifyWidgetTitleLabel(subjectData.widgetHeadings.sliderCards);
    });

    /**
     * Objective: Verify slider navigation arrow buttons and click transition.
     */
    test('TC_SubjectPage_W03_06 - "Subject Slider — Cards" - Slider arrow navigation buttons @regression', async () => {
        await subjectPage.verifySliderNavigation(subjectData.widgetHeadings.sliderCards);
    });

    /**
     * Objective: Verify image hover display and pointer cursor style in slider cards.
     */
    test('TC_SubjectPage_W03_07 - "Subject Slider — Cards" - Image hover display and pointer cursor @regression', async () => {
        await subjectPage.verifyWidgetCardHoverAndCursor(subjectData.widgetHeadings.sliderCards);
    });

    /**
     * Objective: Verify slider card click interaction.
     */
    test('TC_SubjectPage_W03_08 - "Subject Slider — Cards" - Card clickability interaction @regression', async () => {
        await subjectPage.clickCardInWidget(subjectData.widgetHeadings.sliderCards);
    });

    // ==========================================
    // WIDGET 4: SUBJECT SLIDER — GALLERY
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_01 - "Subject Slider — Gallery" - Heading visibility validation @regression', async () => {
        await subjectPage.verifyWidget(subjectData.widgetHeadings.sliderGallery);
    });

    /**
     * Objective: Verify exact description text for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_02 - "Subject Slider — Gallery" - Exact description text validation @regression', async () => {
        await subjectPage.verifyWidgetDescription(subjectData.widgetHeadings.sliderGallery, subjectData.expectedDescriptions.sliderGallery);
    });

    /**
     * Objective: Verify in-widget search input bar visibility and placeholder.
     */
    test('TC_SubjectPage_W04_03 - "Subject Slider — Gallery" - Search bar visibility and placeholder @regression', async () => {
        await subjectPage.verifyWidgetSearchInput(subjectData.widgetHeadings.sliderGallery, subjectData.search.placeholder);
    });

    /**
     * Objective: Verify card list container structure for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_04 - "Subject Slider — Gallery" - Card list container structure @regression', async () => {
        await subjectPage.verifyWidgetCardContainer(subjectData.widgetHeadings.sliderGallery);
    });

    /**
     * Objective: Verify cover image visibility for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_05 - "Subject Slider — Gallery" - First card cover image visibility @regression', async () => {
        await subjectPage.verifyWidgetCoverImage(subjectData.widgetHeadings.sliderGallery);
    });

    /**
     * Objective: Verify card title label visibility for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_06 - "Subject Slider — Gallery" - Card title label visibility @regression', async () => {
        await subjectPage.verifyWidgetTitleLabel(subjectData.widgetHeadings.sliderGallery);
    });

    /**
     * Objective: Verify card hover display and pointer cursor style for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_07 - "Subject Slider — Gallery" - Image hover display and pointer cursor @regression', async () => {
        await subjectPage.verifyWidgetCardHoverAndCursor(subjectData.widgetHeadings.sliderGallery);
    });

    /**
     * Objective: Verify card click interaction for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_08 - "Subject Slider — Gallery" - Card clickability interaction @regression', async () => {
        await subjectPage.clickCardInWidget(subjectData.widgetHeadings.sliderGallery);
    });

    /**
     * Objective: Verify positive search filtering for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_09 - "Subject Slider — Gallery" - Positive search filtering @regression', async () => {
        await subjectPage.verifyPositiveSearchQuery(subjectData.widgetHeadings.sliderGallery, 'Analysis');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_10 - "Subject Slider — Gallery" - Negative search returning 0 results @regression', async () => {
        await subjectPage.verifyNegativeSearchQuery(subjectData.widgetHeadings.sliderGallery, subjectData.search.invalidQuery);
    });

    /**
     * Objective: Verify search reset behavior for "Subject Slider — Gallery".
     */
    test('TC_SubjectPage_W04_11 - "Subject Slider — Gallery" - Search reset behavior @regression', async () => {
        await subjectPage.verifySearchResetQuery(subjectData.widgetHeadings.sliderGallery);
    });

    // ==========================================
    // WIDGET 5: FEATURED SUBJECTS
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_01 - "Featured Subjects" - Heading visibility validation @regression', async () => {
        await subjectPage.verifyWidget(subjectData.widgetHeadings.featuredSubjects);
    });

    /**
     * Objective: Verify exact description text for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_02 - "Featured Subjects" - Exact description text validation @regression', async () => {
        await subjectPage.verifyWidgetDescription(subjectData.widgetHeadings.featuredSubjects, subjectData.expectedDescriptions.featuredSubjects);
    });

    /**
     * Objective: Verify in-widget search input bar visibility and placeholder for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_03 - "Featured Subjects" - Search bar visibility and placeholder @regression', async () => {
        await subjectPage.verifyWidgetSearchInput(subjectData.widgetHeadings.featuredSubjects, subjectData.search.placeholder);
    });

    /**
     * Objective: Verify card list container structure for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_04 - "Featured Subjects" - Card list container structure @regression', async () => {
        await subjectPage.verifyWidgetCardContainer(subjectData.widgetHeadings.featuredSubjects);
    });

    /**
     * Objective: Verify cover image visibility for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_05 - "Featured Subjects" - First card cover image visibility @regression', async () => {
        await subjectPage.verifyWidgetCoverImage(subjectData.widgetHeadings.featuredSubjects);
    });

    /**
     * Objective: Verify card title label visibility for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_06 - "Featured Subjects" - Card title label visibility @regression', async () => {
        await subjectPage.verifyWidgetTitleLabel(subjectData.widgetHeadings.featuredSubjects);
    });

    /**
     * Objective: Verify card hover display and pointer cursor style for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_07 - "Featured Subjects" - Image hover display and pointer cursor @regression', async () => {
        await subjectPage.verifyWidgetCardHoverAndCursor(subjectData.widgetHeadings.featuredSubjects);
    });

    /**
     * Objective: Verify card click interaction for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_08 - "Featured Subjects" - Card clickability interaction @regression', async () => {
        await subjectPage.clickCardInWidget(subjectData.widgetHeadings.featuredSubjects);
    });

    /**
     * Objective: Verify positive search filtering for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_09 - "Featured Subjects" - Positive search filtering @regression', async () => {
        await subjectPage.verifyPositiveSearchQuery(subjectData.widgetHeadings.featuredSubjects, 'Accounting');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_10 - "Featured Subjects" - Negative search returning 0 results @regression', async () => {
        await subjectPage.verifyNegativeSearchQuery(subjectData.widgetHeadings.featuredSubjects, subjectData.search.invalidQuery);
    });

    /**
     * Objective: Verify search reset behavior for "Featured Subjects".
     */
    test('TC_SubjectPage_W05_11 - "Featured Subjects" - Search reset behavior @regression', async () => {
        await subjectPage.verifySearchResetQuery(subjectData.widgetHeadings.featuredSubjects);
    });

    // ==========================================
    // SECTION 7: GENERAL CONTROLS & RESPONSIVENESS
    // ==========================================

    /**
     * Objective: Verify floating Go-to-Top button visibility after scrolling down and scroll interaction.
     */
    test('TC_SubjectPage_CTL_01 - Verify Go-to-Top button visibility and click scroll behavior @regression', async () => {
        await subjectPage.verifyGoToTopButton();
    });

    /**
     * Objective: Verify widget layout responsiveness across standard desktop viewport (1920x1080).
     */
    test('TC_SubjectPage_RSP_01 - Verify layout responsiveness on Desktop (1920x1080) @regression', async () => {
        await subjectPage.verifyViewportResponsiveness(1920, 1080);
    });

    /**
     * Objective: Verify widget layout responsiveness on Tablet Landscape (1024x768).
     */
    test('TC_SubjectPage_RSP_02 - Verify layout responsiveness on Tablet Landscape (1024x768) @regression', async () => {
        await subjectPage.verifyViewportResponsiveness(1024, 768);
    });

    /**
     * Objective: Verify widget layout responsiveness on Tablet Portrait (768x1024).
     */
    test('TC_SubjectPage_RSP_03 - Verify layout responsiveness on Tablet Portrait (768x1024) @regression', async () => {
        await subjectPage.verifyViewportResponsiveness(768, 1024);
    });
});

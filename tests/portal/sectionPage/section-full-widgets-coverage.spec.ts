import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { SectionPage } from '../../../src/pages/portal/SectionPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';

test.describe('Portal Section Page - Pure Section Widgets Coverage', () => {
    let sharedPage: Page;
    let sectionPage: SectionPage;

    test.beforeAll(async ({ browser }) => {
        const email = process.env.SECTION_PAGE_USER_EMAIL || process.env.SECTION_USER_EMAIL || 'playwrighttest@yopmail.com';
        const password = process.env.SECTION_PAGE_USER_PASSWORD || process.env.SECTION_USER_PASSWORD || '12345';

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
        sectionPage = new SectionPage(sharedPage);

        await sharedPage.goto('https://playwright.knimbus.com/portal/v2/default/home');
        await portalLoginPage.login(email, password);
        await sectionPage.goto();
    });

    // ==========================================
    // SECTION 1: PAGE LOAD VERIFICATION
    // ==========================================

    /**
     * Objective: Verify that the Section Page loads successfully with its primary section heading.
     */
    test('TC_SectionPage_001 - Should load Section page successfully @regression', async () => {
        await sectionPage.verifySectionPageLoaded();
    });

    // ==========================================
    // WIDGET 1: LIBRARY SECTIONS
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Library Sections".
     */
    test('TC_SectionPage_W01_01 - "Library Sections" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Library Sections');
    });

    /**
     * Objective: Verify exact description text for "Library Sections".
     */
    test('TC_SectionPage_W01_02 - "Library Sections" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Library Sections', 'Browse all sections and collections available through the library.');
    });

    /**
     * Objective: Verify Name and Image card list container structure and card count presence for "Library Sections".
     */
    test('TC_SectionPage_W01_03 - "Library Sections" - Name and Image card list container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Library Sections', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Library Sections".
     */
    test('TC_SectionPage_W01_04 - "Library Sections" - First card cover image visibility @regression', async () => {
        await sectionPage.verifyWidgetCoverImage('Library Sections', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify section title label visibility on first card in "Library Sections".
     */
    test('TC_SectionPage_W01_05 - "Library Sections" - First card section title label visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleLabel('Library Sections', '.widgetListNameWithImageCard ul li', '.widgetNwlCardTitle');
    });

    /**
     * Objective: Verify search input bar visibility for "Library Sections".
     */
    test('TC_SectionPage_W01_06 - "Library Sections" - Search input bar visibility @regression', async () => {
        await sectionPage.verifyWidgetSearchInput('Library Sections');
    });

    /**
     * Objective: Verify positive search filtering functionality ("Section 5") for "Library Sections".
     */
    test('TC_SectionPage_W01_07 - "Library Sections" - Positive search filtering @regression', async () => {
        await sectionPage.verifyWidgetPositiveSearchQuery('Library Sections', 'Section 5', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify negative search query returning 0 results for "Library Sections".
     */
    test('TC_SectionPage_W01_08 - "Library Sections" - Negative search returning 0 results @regression', async () => {
        await sectionPage.verifyWidgetNegativeSearchQuery('Library Sections', 'INVALID_SECTION_XYZ_999', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify search reset behavior on clearing search input for "Library Sections".
     */
    test('TC_SectionPage_W01_09 - "Library Sections" - Search reset behavior @regression', async () => {
        await sectionPage.verifyWidgetSearchResetQuery('Library Sections', '.widgetListNameWithImageCard ul li');
    });

    // ==========================================
    // WIDGET 2: SECTION GALLERY
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Section Gallery".
     */
    test('TC_SectionPage_W02_01 - "Section Gallery" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Section Gallery');
    });

    /**
     * Objective: Verify exact description text for "Section Gallery".
     */
    test('TC_SectionPage_W02_02 - "Section Gallery" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Section Gallery', 'Visual overview of library sections with cover images.');
    });

    /**
     * Objective: Verify Image Gallery card list container structure and card count presence for "Section Gallery".
     */
    test('TC_SectionPage_W02_03 - "Section Gallery" - Image Gallery card list container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Section Gallery', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Section Gallery".
     */
    test('TC_SectionPage_W02_04 - "Section Gallery" - First card cover image visibility @regression', async () => {
        await sectionPage.verifyWidgetCoverImage('Section Gallery', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify 0 title text labels assertion for image-only mode in "Section Gallery".
     */
    test('TC_SectionPage_W02_05 - "Section Gallery" - 0 title text labels assertion (image-only mode) @regression', async () => {
        await sectionPage.verifyWidgetNoTitleLabel('Section Gallery', '.widgetListOnlyImageCard ul li', '.widgetNwlCardTitle');
    });

    /**
     * Objective: Verify search input bar visibility for "Section Gallery".
     */
    test('TC_SectionPage_W02_06 - "Section Gallery" - Search input bar visibility @regression', async () => {
        await sectionPage.verifyWidgetSearchInput('Section Gallery');
    });

    /**
     * Objective: Verify positive search filtering by title attribute ("Section 1") for "Section Gallery".
     */
    test('TC_SectionPage_W02_07 - "Section Gallery" - Positive title attribute search filtering @regression', async () => {
        await sectionPage.verifyWidgetPositiveSearchQuery('Section Gallery', 'Section 1', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Section Gallery".
     */
    test('TC_SectionPage_W02_08 - "Section Gallery" - Negative search returning 0 results @regression', async () => {
        await sectionPage.verifyWidgetNegativeSearchQuery('Section Gallery', 'NON_EXISTENT_GALLERY_ITEM_999', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify search reset behavior on clearing search bar for "Section Gallery".
     */
    test('TC_SectionPage_W02_09 - "Section Gallery" - Search reset behavior @regression', async () => {
        await sectionPage.verifyWidgetSearchResetQuery('Section Gallery', '.widgetListOnlyImageCard ul li');
    });

    // ==========================================
    // WIDGET 3: SECTIONS WITH COVERS
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Sections with Covers".
     */
    test('TC_SectionPage_W03_01 - "Sections with Covers" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Sections with Covers');
    });

    /**
     * Objective: Verify exact description text for "Sections with Covers".
     */
    test('TC_SectionPage_W03_02 - "Sections with Covers" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Sections with Covers', 'Section names paired with representative images, sorted alphabetically.');
    });

    /**
     * Objective: Verify Name and Image card list container structure for "Sections with Covers".
     */
    test('TC_SectionPage_W03_03 - "Sections with Covers" - Name and Image card list container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Sections with Covers', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Sections with Covers".
     */
    test('TC_SectionPage_W03_04 - "Sections with Covers" - First card cover image visibility @regression', async () => {
        await sectionPage.verifyWidgetCoverImage('Sections with Covers', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify section title label visibility on first card in "Sections with Covers".
     */
    test('TC_SectionPage_W03_05 - "Sections with Covers" - First card section title label visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleLabel('Sections with Covers', '.widgetListNameWithImageCard ul li', '.widgetNwlCardTitle');
    });

    /**
     * Objective: Verify search input bar visibility for "Sections with Covers".
     */
    test('TC_SectionPage_W03_06 - "Sections with Covers" - Search input bar visibility @regression', async () => {
        await sectionPage.verifyWidgetSearchInput('Sections with Covers');
    });

    /**
     * Objective: Verify positive search filtering ("Section 2") for "Sections with Covers".
     */
    test('TC_SectionPage_W03_07 - "Sections with Covers" - Positive search filtering @regression', async () => {
        await sectionPage.verifyWidgetPositiveSearchQuery('Sections with Covers', 'Section 2', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify negative search query returning 0 results for "Sections with Covers".
     */
    test('TC_SectionPage_W03_08 - "Sections with Covers" - Negative search returning 0 results @regression', async () => {
        await sectionPage.verifyWidgetNegativeSearchQuery('Sections with Covers', 'NOT_FOUND_COVER_SECTION', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify search reset behavior on clearing search query for "Sections with Covers".
     */
    test('TC_SectionPage_W03_09 - "Sections with Covers" - Search reset behavior @regression', async () => {
        await sectionPage.verifyWidgetSearchResetQuery('Sections with Covers', '.widgetListNameWithImageCard ul li');
    });

    // ==========================================
    // WIDGET 4: SECTION DIRECTORY
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Section Directory".
     */
    test('TC_SectionPage_W04_01 - "Section Directory" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Section Directory');
    });

    /**
     * Objective: Verify exact description text for "Section Directory".
     */
    test('TC_SectionPage_W04_02 - "Section Directory" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Section Directory', 'Alphabetical listing of all library sections.');
    });

    /**
     * Objective: Verify text-only directory card list container structure for "Section Directory".
     */
    test('TC_SectionPage_W04_03 - "Section Directory" - Text-only directory card list container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Section Directory', '.widgetListOnlyNameCard ul li');
    });

    /**
     * Objective: Verify section name title label visibility on first card in "Section Directory".
     */
    test('TC_SectionPage_W04_04 - "Section Directory" - First card section name title label visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleLabel('Section Directory', '.widgetListOnlyNameCard ul li', '.widgetOnlyNameCardTitle');
    });

    /**
     * Objective: Verify 0 cover image elements assertion for text-only mode in "Section Directory".
     */
    test('TC_SectionPage_W04_05 - "Section Directory" - 0 cover image elements assertion (text-only mode) @regression', async () => {
        const container = sectionPage.getWidgetContainer('Section Directory');
        const imgCount = await container.locator('.widgetListOnlyNameCard ul li img').count();
        expect(imgCount).toBe(0);
    });

    /**
     * Objective: Verify search input bar visibility for "Section Directory".
     */
    test('TC_SectionPage_W04_06 - "Section Directory" - Search input bar visibility @regression', async () => {
        await sectionPage.verifyWidgetSearchInput('Section Directory');
    });

    /**
     * Objective: Verify positive directory search filtering ("Section 3") for "Section Directory".
     */
    test('TC_SectionPage_W04_07 - "Section Directory" - Positive directory search filtering @regression', async () => {
        await sectionPage.verifyWidgetPositiveSearchQuery('Section Directory', 'Section 3', '.widgetListOnlyNameCard ul li');
    });

    /**
     * Objective: Verify negative directory search returning 0 results for "Section Directory".
     */
    test('TC_SectionPage_W04_08 - "Section Directory" - Negative directory search returning 0 results @regression', async () => {
        await sectionPage.verifyWidgetNegativeSearchQuery('Section Directory', 'UNKNWN_DIR_ITEM_123', '.widgetListOnlyNameCard ul li');
    });

    /**
     * Objective: Verify search reset behavior on clearing input for "Section Directory".
     */
    test('TC_SectionPage_W04_09 - "Section Directory" - Search reset behavior @regression', async () => {
        await sectionPage.verifyWidgetSearchResetQuery('Section Directory', '.widgetListOnlyNameCard ul li');
    });

    // ==========================================
    // WIDGET 5: FEATURED SECTIONS
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Featured Sections".
     */
    test('TC_SectionPage_W05_01 - "Featured Sections" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Featured Sections');
    });

    /**
     * Objective: Verify exact description text for "Featured Sections".
     */
    test('TC_SectionPage_W05_02 - "Featured Sections" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Featured Sections', 'Highlighted sections presented in an interactive slider.');
    });

    /**
     * Objective: Verify multi-carousel slider track container structure for "Featured Sections".
     */
    test('TC_SectionPage_W05_03 - "Featured Sections" - Multi-carousel slider track container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Featured Sections', '.widgetNameWithImageSliderCard .react-multi-carousel-list');
    });

    /**
     * Objective: Verify cover image visibility on first slide card in "Featured Sections".
     */
    test('TC_SectionPage_W05_04 - "Featured Sections" - Cover image visibility on first slide card @regression', async () => {
        await sectionPage.verifyWidgetCoverImage('Featured Sections', '.widgetNameWithImageSliderCard .react-multi-carousel-list');
    });

    /**
     * Objective: Verify active slide title label visibility in "Featured Sections".
     */
    test('TC_SectionPage_W05_05 - "Featured Sections" - Active slide title label visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleLabel('Featured Sections', '.widgetNameWithImageSliderCard .react-multi-carousel-list', '.sliderCardItemTitle');
    });

    /**
     * Objective: Verify Next slide control navigation button for "Featured Sections".
     */
    test('TC_SectionPage_W05_06 - "Featured Sections" - Next slide control navigation @regression', async () => {
        await sectionPage.verifyWidgetNextSlideButton('Featured Sections');
    });

    /**
     * Objective: Verify Previous slide control navigation button for "Featured Sections".
     */
    test('TC_SectionPage_W05_07 - "Featured Sections" - Previous slide control navigation @regression', async () => {
        await sectionPage.verifyWidgetPrevSlideButton('Featured Sections');
    });

    // ==========================================
    // WIDGET 6: SECTION SPOTLIGHT
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Section Spotlight".
     */
    test('TC_SectionPage_W06_01 - "Section Spotlight" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Section Spotlight');
    });

    /**
     * Objective: Verify exact description text for "Section Spotlight".
     */
    test('TC_SectionPage_W06_02 - "Section Spotlight" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Section Spotlight', 'Cover-image slider showcasing key library sections.');
    });

    /**
     * Objective: Verify image-only slider deck container structure for "Section Spotlight".
     */
    test('TC_SectionPage_W06_03 - "Section Spotlight" - Image-only slider deck container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Section Spotlight', '.widgetOnlyImageSliderCard .react-multi-carousel-list');
    });

    /**
     * Objective: Verify cover image visibility on first slide card in "Section Spotlight".
     */
    test('TC_SectionPage_W06_04 - "Section Spotlight" - Cover image visibility on first slide card @regression', async () => {
        await sectionPage.verifyWidgetCoverImage('Section Spotlight', '.widgetOnlyImageSliderCard .react-multi-carousel-list');
    });

    /**
     * Objective: Verify Next slide control navigation button for "Section Spotlight".
     */
    test('TC_SectionPage_W06_05 - "Section Spotlight" - Next slide control navigation @regression', async () => {
        await sectionPage.verifyWidgetNextSlideButton('Section Spotlight');
    });

    /**
     * Objective: Verify Previous slide control navigation button for "Section Spotlight".
     */
    test('TC_SectionPage_W06_06 - "Section Spotlight" - Previous slide control navigation @regression', async () => {
        await sectionPage.verifyWidgetPrevSlideButton('Section Spotlight');
    });

    // ==========================================
    // WIDGET 7: SELECTED SECTIONS — GALLERY
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Selected Sections — Gallery".
     */
    test('TC_SectionPage_W07_01 - "Selected Sections — Gallery" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Selected Sections — Gallery');
    });

    /**
     * Objective: Verify exact description text for "Selected Sections — Gallery".
     */
    test('TC_SectionPage_W07_02 - "Selected Sections — Gallery" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Selected Sections — Gallery', 'Image gallery for designated institutional sections.');
    });

    /**
     * Objective: Verify image gallery card list container structure for "Selected Sections — Gallery".
     */
    test('TC_SectionPage_W07_03 - "Selected Sections — Gallery" - Image gallery card list container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Selected Sections — Gallery', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Selected Sections — Gallery".
     */
    test('TC_SectionPage_W07_04 - "Selected Sections — Gallery" - Cover image visibility on first card @regression', async () => {
        await sectionPage.verifyWidgetCoverImage('Selected Sections — Gallery', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify search input bar visibility for "Selected Sections — Gallery".
     */
    test('TC_SectionPage_W07_05 - "Selected Sections — Gallery" - Search input bar visibility @regression', async () => {
        await sectionPage.verifyWidgetSearchInput('Selected Sections — Gallery');
    });

    /**
     * Objective: Verify positive title attribute search filtering ("Section 7") for "Selected Sections — Gallery".
     */
    test('TC_SectionPage_W07_06 - "Selected Sections — Gallery" - Positive search filtering @regression', async () => {
        await sectionPage.verifyWidgetPositiveSearchQuery('Selected Sections — Gallery', 'Section 7', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Selected Sections — Gallery".
     */
    test('TC_SectionPage_W07_07 - "Selected Sections — Gallery" - Negative search returning 0 results @regression', async () => {
        await sectionPage.verifyWidgetNegativeSearchQuery('Selected Sections — Gallery', 'INVALID_SELECTED_GALLERY_999', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify search reset behavior on clearing search input for "Selected Sections — Gallery".
     */
    test('TC_SectionPage_W07_08 - "Selected Sections — Gallery" - Search reset behavior @regression', async () => {
        await sectionPage.verifyWidgetSearchResetQuery('Selected Sections — Gallery', '.widgetListOnlyImageCard ul li');
    });

    // ==========================================
    // WIDGET 8: SELECTED SECTIONS — DETAILS
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_01 - "Selected Sections — Details" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Selected Sections — Details');
    });

    /**
     * Objective: Verify exact description text for "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_02 - "Selected Sections — Details" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Selected Sections — Details', 'Detailed cards for designated institutional sections.');
    });

    /**
     * Objective: Verify Name and Image card list container structure for "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_03 - "Selected Sections — Details" - Name and Image card list container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Selected Sections — Details', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_04 - "Selected Sections — Details" - First card cover image visibility @regression', async () => {
        await sectionPage.verifyWidgetCoverImage('Selected Sections — Details', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify section title label visibility on first card in "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_05 - "Selected Sections — Details" - First card section title label visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleLabel('Selected Sections — Details', '.widgetListNameWithImageCard ul li', '.widgetNwlCardTitle');
    });

    /**
     * Objective: Verify search input bar visibility for "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_06 - "Selected Sections — Details" - Search input bar visibility @regression', async () => {
        await sectionPage.verifyWidgetSearchInput('Selected Sections — Details');
    });

    /**
     * Objective: Verify positive search filtering ("Section 4") for "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_07 - "Selected Sections — Details" - Positive search filtering @regression', async () => {
        await sectionPage.verifyWidgetPositiveSearchQuery('Selected Sections — Details', 'Section 4', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_08 - "Selected Sections — Details" - Negative search returning 0 results @regression', async () => {
        await sectionPage.verifyWidgetNegativeSearchQuery('Selected Sections — Details', 'UNMATCHED_DETAILS_SECTION_99', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify search reset behavior on clearing search input for "Selected Sections — Details".
     */
    test('TC_SectionPage_W08_09 - "Selected Sections — Details" - Search reset behavior @regression', async () => {
        await sectionPage.verifyWidgetSearchResetQuery('Selected Sections — Details', '.widgetListNameWithImageCard ul li');
    });

    // ==========================================
    // WIDGET 9: NEW ARRIVALS
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "New Arrivals".
     */
    test('TC_SectionPage_W09_01 - "New Arrivals" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('New Arrivals');
    });

    /**
     * Objective: Verify exact description text for "New Arrivals".
     */
    test('TC_SectionPage_W09_02 - "New Arrivals" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('New Arrivals', 'The latest journals, books, and resources recently added to the library.');
    });

    /**
     * Objective: Verify landscape card track title metadata visibility for "New Arrivals".
     */
    test('TC_SectionPage_W09_03 - "New Arrivals" - Card title metadata visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleMetadata('New Arrivals', '.sliderCardItemTitle');
    });

    /**
     * Objective: Verify card publisher description metadata visibility for "New Arrivals".
     */
    test('TC_SectionPage_W09_04 - "New Arrivals" - Card publisher description metadata visibility @regression', async () => {
        await sectionPage.verifyWidgetDescriptionMetadata('New Arrivals', '.sliderCardItemDescription');
    });

    /**
     * Objective: Verify category tabs buttons presence for "New Arrivals".
     */
    test('TC_SectionPage_W09_05 - "New Arrivals" - Category tabs buttons presence @regression', async () => {
        await sectionPage.verifyWidgetCategoryTabsPresence('New Arrivals');
    });

    /**
     * Objective: Verify category tab selection switching interaction (Pharmacy to Cybersecurity) for "New Arrivals".
     */
    test('TC_SectionPage_W09_06 - "New Arrivals" - Category tab selection switching interaction @regression', async () => {
        await sectionPage.verifyWidgetCategoryTabSwitchingInteraction('New Arrivals', 'Pharmacy', 'Cybersecurity');
    });

    /**
     * Objective: Verify Next slide control navigation button for "New Arrivals".
     */
    test('TC_SectionPage_W09_07 - "New Arrivals" - Next slide control navigation @regression', async () => {
        await sectionPage.verifyWidgetNextSlideButton('New Arrivals');
    });

    /**
     * Objective: Verify Previous slide control navigation button for "New Arrivals".
     */
    test('TC_SectionPage_W09_08 - "New Arrivals" - Previous slide control navigation @regression', async () => {
        await sectionPage.verifyWidgetPrevSlideButton('New Arrivals');
    });

    // ==========================================
    // WIDGET 10: RECENTLY ADDED
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Recently Added".
     */
    test('TC_SectionPage_W10_01 - "Recently Added" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Recently Added');
    });

    /**
     * Objective: Verify exact description text for "Recently Added".
     */
    test('TC_SectionPage_W10_02 - "Recently Added" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Recently Added', 'Fresh content across subscribed collections, grouped for easy browsing.');
    });

    /**
     * Objective: Verify content grid card layout title metadata visibility for "Recently Added".
     */
    test('TC_SectionPage_W10_03 - "Recently Added" - Card title metadata visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleMetadata('Recently Added', '.secGrpWidget2CardTitle');
    });

    /**
     * Objective: Verify card publisher description metadata visibility for "Recently Added".
     */
    test('TC_SectionPage_W10_04 - "Recently Added" - Card publisher description metadata visibility @regression', async () => {
        await sectionPage.verifyWidgetDescriptionMetadata('Recently Added', '.secGrpWidget2CardDesc');
    });

    /**
     * Objective: Verify category tab selection switching interaction for "Recently Added".
     */
    test('TC_SectionPage_W10_05 - "Recently Added" - Category tab selection switching interaction @regression', async () => {
        await sectionPage.verifyWidgetCategoryTabSwitchingInteraction('Recently Added', 'Pharmacy', 'Cybersecurity');
    });

    // ==========================================
    // WIDGET 11: POPULAR RESOURCES
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Popular Resources".
     */
    test('TC_SectionPage_W11_01 - "Popular Resources" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Popular Resources');
    });

    /**
     * Objective: Verify exact description text for "Popular Resources".
     */
    test('TC_SectionPage_W11_02 - "Popular Resources" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Popular Resources', 'Top-rated and frequently accessed materials across the library.');
    });

    /**
     * Objective: Verify 3D slider card title metadata visibility for "Popular Resources".
     */
    test('TC_SectionPage_W11_03 - "Popular Resources" - 3D slider card title metadata visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleMetadata('Popular Resources', '.sliderCardItemTitle');
    });

    /**
     * Objective: Verify 3D slider Next slide control rotation for "Popular Resources".
     */
    test('TC_SectionPage_W11_04 - "Popular Resources" - 3D slider Next slide control rotation @regression', async () => {
        await sectionPage.verifyWidgetNextSlideButton('Popular Resources');
    });

    /**
     * Objective: Verify 3D slider Previous slide control rotation for "Popular Resources".
     */
    test('TC_SectionPage_W11_05 - "Popular Resources" - 3D slider Previous slide control rotation @regression', async () => {
        await sectionPage.verifyWidgetPrevSlideButton('Popular Resources');
    });

    // ==========================================
    // WIDGET 12: LATEST BY FORMAT
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Latest by Format".
     */
    test('TC_SectionPage_W12_01 - "Latest by Format" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Latest by Format');
    });

    /**
     * Objective: Verify exact description text for "Latest by Format".
     */
    test('TC_SectionPage_W12_02 - "Latest by Format" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Latest by Format', 'New arrivals organised by content type and discipline.');
    });

    /**
     * Objective: Verify content grid card title metadata visibility for "Latest by Format".
     */
    test('TC_SectionPage_W12_03 - "Latest by Format" - Content grid card title metadata visibility @regression', async () => {
        await sectionPage.verifyWidgetTitleMetadata('Latest by Format', '.secGrpWidget2CardTitle');
    });

    /**
     * Objective: Verify category tab selection switching interaction for "Latest by Format".
     */
    test('TC_SectionPage_W12_04 - "Latest by Format" - Category tab selection switching interaction @regression', async () => {
        await sectionPage.verifyWidgetCategoryTabSwitchingInteraction('Latest by Format', 'Pharmacy', 'Cybersecurity');
    });

    // ==========================================
    // WIDGET 13: SECTION IMAGE GALLERY
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Section Image Gallery".
     */
    test('TC_SectionPage_W13_01 - "Section Image Gallery" - Heading visibility validation @regression', async () => {
        await sectionPage.verifyWidget('Section Image Gallery');
    });

    /**
     * Objective: Verify exact description text for "Section Image Gallery".
     */
    test('TC_SectionPage_W13_02 - "Section Image Gallery" - Exact description text validation @regression', async () => {
        await sectionPage.verifyWidgetDescription('Section Image Gallery', 'Image-only browse for selected library sections.');
    });

    /**
     * Objective: Verify image gallery card list container structure for "Section Image Gallery".
     */
    test('TC_SectionPage_W13_03 - "Section Image Gallery" - Image gallery card list container structure @regression', async () => {
        await sectionPage.verifyWidgetCardContainer('Section Image Gallery', '.widgetListOnlyImageCard ul li');
    });

    /**
     * Objective: Verify "View all" card link visibility and interaction for "Section Image Gallery".
     */
    test('TC_SectionPage_W13_04 - "Section Image Gallery" - "View all" card link visibility and interaction @regression', async () => {
        const container = sectionPage.getWidgetContainer('Section Image Gallery');
        await container.scrollIntoViewIfNeeded().catch(() => {});
        const viewAllCard = container.locator('a.viewAll').first();
        await expect(viewAllCard).toBeVisible();
    });

    // ==========================================
    // SECTION 14: INTERACTIVITY — HOVER & CURSOR STYLES
    // ==========================================

    /**
     * Objective: Verify image hover display name and cursor hand-icon style (TC_Section_017, TC_Section_018).
     */
    test('TC_SectionPage_INT_01 - Verify Image hover name and pointer cursor style @regression', async () => {
        await sectionPage.verifyWidgetImageHoverAndCursor('Library Sections', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify image hover cursor style in Section Gallery (TC_Section_018).
     */
    test('TC_SectionPage_INT_02 - Verify Section Gallery hover pointer cursor style @regression', async () => {
        await sectionPage.verifyWidgetImageHoverAndCursor('Section Gallery', '.widgetListOnlyImageCard ul li');
    });

    // ==========================================
    // SECTION 15: INTERACTIVITY — CARD CLICK & NAVIGATION
    // ==========================================

    /**
     * Objective: Verify card clickability and redirection interaction for Library Sections (TC_Section_016, TC_Section_019).
     */
    test('TC_SectionPage_INT_03 - Verify Library Sections card click interaction @regression', async () => {
        await sectionPage.verifyWidgetCardClickInteraction('Library Sections', '.widgetListNameWithImageCard ul li');
    });

    /**
     * Objective: Verify text-only section pill clickability for Section Directory (TC_Section_023).
     */
    test('TC_SectionPage_INT_04 - Verify Section Directory text pill click interaction @regression', async () => {
        await sectionPage.verifyWidgetCardClickInteraction('Section Directory', '.widgetListOnlyNameCard ul li');
    });

    /**
     * Objective: Verify card clickability for Sections with Covers (TC_Section_024).
     */
    test('TC_SectionPage_INT_05 - Verify Sections with Covers card click interaction @regression', async () => {
        await sectionPage.verifyWidgetCardClickInteraction('Sections with Covers', '.widgetListNameWithImageCard ul li');
    });

    // ==========================================
    // SECTION 16: SLIDER AUTO-PLAY BEHAVIOR
    // ==========================================

    /**
     * Objective: Verify slider auto-play movement timing (TC_Section_049).
     */
    test('TC_SectionPage_SLD_01 - Verify Featured Sections auto-play slider movement @regression', async () => {
        await sectionPage.verifyWidgetAutoPlaySliderMovement('Featured Sections');
    });

    /**
     * Objective: Verify Section Spotlight auto-play slider movement (TC_Section_054).
     */
    test('TC_SectionPage_SLD_02 - Verify Section Spotlight auto-play slider movement @regression', async () => {
        await sectionPage.verifyWidgetAutoPlaySliderMovement('Section Spotlight');
    });

    // ==========================================
    // SECTION 17: SUB-TAB SEQUENTIAL SWITCHING
    // ==========================================

    /**
     * Objective: Verify sequential sub-tab switching in New Arrivals widget (TC_SEC_017).
     */
    test('TC_SectionPage_TAB_01 - Verify New Arrivals sub-tabs sequential switching @regression', async () => {
        await sectionPage.verifyWidgetSubTabSwitchingSequence('New Arrivals', ['Pharmacy', 'Cybersecurity', 'Medical']);
    });

    /**
     * Objective: Verify sequential sub-tab switching in Recently Added widget (TC_SEC_013).
     */
    test('TC_SectionPage_TAB_02 - Verify Recently Added sub-tabs sequential switching @regression', async () => {
        await sectionPage.verifyWidgetSubTabSwitchingSequence('Recently Added', ['Pharmacy', 'Cybersecurity', 'Medical']);
    });

    // ==========================================
    // SECTION 18: ACCESS CONTROL & GLOBAL CONTROLS
    // ==========================================

    /**
     * Objective: Verify restricted section handling for logged-in end user (TC_Section_055, TC_Section_056).
     */
    test('TC_SectionPage_ACC_01 - Verify restricted section access control handling @regression', async () => {
        await sectionPage.verifyRestrictedSectionHandling();
    });

    /**
     * Objective: Verify Go-to-Top button visibility on scroll and click functionality (TC_Section_057, TC_Section_058).
     */
    test('TC_SectionPage_CTL_01 - Verify Go-to-Top button visibility and click scroll behavior @regression', async () => {
        await sectionPage.verifyGoToTopControl();
    });

    // ==========================================
    // SECTION 19: MULTI-ORIENTATION / RESPONSIVE VIEWPORT
    // ==========================================

    /**
     * Objective: Verify Section page layout across mobile, tablet, and desktop viewports (TC_Section_025 - TC_Section_044).
     */
    test('TC_SectionPage_RSP_01 - Verify widget layout responsiveness across portrait and landscape viewports @regression', async () => {
        const viewports = [
            { width: 375, height: 812, name: 'portrait' },
            { width: 812, height: 375, name: 'landscape' },
            { width: 768, height: 1024, name: 'landscape_md' },
            { width: 1920, height: 1080, name: 'landscape_lg' }
        ];

        for (const vp of viewports) {
            await sharedPage.setViewportSize({ width: vp.width, height: vp.height });
            await sharedPage.waitForTimeout(300);
            await sectionPage.verifyWidget('Library Sections');
        }

        // Reset to default viewport
        await sharedPage.setViewportSize({ width: 1920, height: 1080 });
    });

    // ==========================================
    // SECTION 20: SECTION DATA & DOCUMENT ACTIONS COVERAGE
    // ==========================================

    /**
     * Objective: Verify clicking on any section name displays section data and document results.
     */
    test('TC_SectionPage_SEC_01 - Verify clicking section name displays section data @regression', async () => {
        await sectionPage.clickSectionNameAndVerifyResults('Section 1');
    });

    /**
     * Objective: Verify clicking Read button opens document in a new tab.
     */
    test('TC_SectionPage_SEC_02 - Verify Read button opens document in new tab @regression', async () => {
        await sectionPage.verifyReadButtonOpensNewTab();
    });

    /**
     * Objective: Verify clicking Detail page button displays detail information.
     */
    test('TC_SectionPage_SEC_03 - Verify Detail page button displays detail information @regression', async () => {
        await sectionPage.verifyDetailPageInformationVisible();
    });

    /**
     * Objective: Verify clicking Add to Favourite button updates favourite state.
     */
    test('TC_SectionPage_SEC_04 - Verify Add to Favourite button interaction @regression', async () => {
        await sectionPage.verifyAddToFavouriteInteraction();
    });

    /**
     * Objective: Verify clicking Share button displays all share option buttons.
     */
    test('TC_SectionPage_SEC_05 - Verify Share button displays all share option buttons @regression', async () => {
        await sectionPage.verifyShareButtonAndAllOptionsVisible();
    });
});

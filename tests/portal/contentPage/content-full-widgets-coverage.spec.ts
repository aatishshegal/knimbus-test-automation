import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { ContentPage } from '../../../src/pages/portal/ContentPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import contentData from '../../test-data/content-data.json';

test.describe('Portal Content Page - Pure Content Widgets & Actions Coverage', () => {
    let sharedPage: Page;
    let contentPage: ContentPage;

    test.beforeAll(async ({ browser }) => {
        const email = process.env.CONTENT_PAGE_USER_EMAIL || process.env.SECTION_USER_EMAIL || 'playwrighttest@yopmail.com';
        const password = process.env.CONTENT_PAGE_USER_PASSWORD || process.env.SECTION_USER_PASSWORD || '12345';

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
        contentPage = new ContentPage(sharedPage);

        await sharedPage.goto(contentData.targetUrl);
        await portalLoginPage.login(email, password);
        await contentPage.goto();
    });

    test.beforeEach(async () => {
        await contentPage.navigateToContentTab();
    });

    // ==========================================
    // SECTION 1: CORE PAGE LOAD VERIFICATION
    // ==========================================

    /**
     * Objective: Verify that the Content Page loads successfully with its primary heading.
     */
    test('TC_ContentPage_001 - Should load Content page successfully @regression', async () => {
        await contentPage.verifyContentPageLoaded();
    });

    /**
     * Objective: Verify header navigation link for Content tab.
     */
    test('TC_ContentPage_002 - Verify Content navbar tab link visibility and navigation @regression', async () => {
        await contentPage.navigateToContentTab();
        await expect(contentPage.contentTabLink).toBeVisible();
    });

    // ==========================================
    // WIDGET 1: ALL CONTENT TYPES
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "All Content Types".
     */
    test('TC_ContentPage_W01_01 - "All Content Types" - Heading visibility validation @regression', async () => {
        await contentPage.verifyWidget('All Content Types');
    });

    /**
     * Objective: Verify exact description text for "All Content Types".
     */
    test('TC_ContentPage_W01_02 - "All Content Types" - Exact description text validation @regression', async () => {
        await contentPage.verifyWidgetDescription('All Content Types', contentData.expectedDescription);
    });

    /**
     * Objective: Verify card list container structure and card count presence for "All Content Types".
     */
    test('TC_ContentPage_W01_03 - "All Content Types" - Card list container structure @regression', async () => {
        await contentPage.verifyWidgetCardContainer('All Content Types', '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "All Content Types".
     */
    test('TC_ContentPage_W01_04 - "All Content Types" - First card cover image visibility @regression', async () => {
        await contentPage.verifyWidgetCoverImage('All Content Types', '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify content title label visibility on first card in "All Content Types".
     */
    test('TC_ContentPage_W01_05 - "All Content Types" - First card content title label visibility @regression', async () => {
        await contentPage.verifyWidgetTitleLabel('All Content Types', '.widgetListNameWithImageStyle1Card ul li', '.widgetNwlStyle1CardTitle');
    });

    /**
     * Objective: Verify count badge visibility on cards in "All Content Types".
     */
    test('TC_ContentPage_W01_06 - "All Content Types" - First card count badge visibility @regression', async () => {
        await contentPage.verifyWidgetCountBadge('All Content Types', '.widgetListNameWithImageStyle1Card ul li', 'span.css-xmhyag');
    });

    /**
     * Objective: Verify View All button visibility for "All Content Types".
     */
    test('TC_ContentPage_W01_07 - "All Content Types" - View All button visibility @regression', async () => {
        await contentPage.verifyWidgetViewAllButton('All Content Types');
    });

    /**
     * Objective: Verify image hover display name and cursor pointer style for "All Content Types".
     */
    test('TC_ContentPage_W01_08 - "All Content Types" - Image hover name and pointer cursor style @regression', async () => {
        await contentPage.verifyWidgetImageHoverAndCursor('All Content Types', '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify card click interaction for "All Content Types".
     */
    test('TC_ContentPage_W01_09 - "All Content Types" - Card clickability interaction @regression', async () => {
        await contentPage.verifyWidgetCardClickInteraction('All Content Types', '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify positive search filtering for "All Content Types".
     */
    test('TC_ContentPage_W01_10 - "All Content Types" - Positive search filtering @regression', async () => {
        await contentPage.verifyPositiveSearchQuery('All Content Types', contentData.searchQuery, '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify negative search returning 0 results for "All Content Types".
     */
    test('TC_ContentPage_W01_11 - "All Content Types" - Negative search returning 0 results @regression', async () => {
        await contentPage.verifyNegativeSearchQuery('All Content Types', contentData.invalidSearchQuery, '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify search reset behavior on clearing search bar for "All Content Types".
     */
    test('TC_ContentPage_W01_12 - "All Content Types" - Search reset behavior @regression', async () => {
        await contentPage.verifySearchResetQuery('All Content Types', '.widgetListNameWithImageStyle1Card ul li');
    });

    // ==========================================
    // WIDGET 2: CONTENT TYPES — STANDARD
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Content Types — Standard".
     */
    test('TC_ContentPage_W02_01 - "Content Types — Standard" - Heading visibility validation @regression', async () => {
        await contentPage.verifyWidget('Content Types — Standard');
    });

    /**
     * Objective: Verify exact description text for "Content Types — Standard".
     */
    test('TC_ContentPage_W02_02 - "Content Types — Standard" - Exact description text validation @regression', async () => {
        await contentPage.verifyWidgetDescription('Content Types — Standard', contentData.expectedDescriptionStandard);
    });

    /**
     * Objective: Verify card list container structure for "Content Types — Standard".
     */
    test('TC_ContentPage_W02_03 - "Content Types — Standard" - Card list container structure @regression', async () => {
        await contentPage.verifyWidgetCardContainer('Content Types — Standard', '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Content Types — Standard".
     */
    test('TC_ContentPage_W02_04 - "Content Types — Standard" - First card cover image visibility @regression', async () => {
        await contentPage.verifyWidgetCoverImage('Content Types — Standard', '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify content title label visibility on first card in "Content Types — Standard".
     */
    test('TC_ContentPage_W02_05 - "Content Types — Standard" - First card content title label visibility @regression', async () => {
        await contentPage.verifyWidgetTitleLabel('Content Types — Standard', '.widgetListNameWithImageStyle1Card ul li', '.widgetNwlStyle1CardTitle');
    });

    /**
     * Objective: Verify count badge visibility and count numbers on all content cards in "Content Types — Standard".
     */
    test('TC_ContentPage_W02_06 - "Content Types — Standard" - Count badge visibility and numeric presence @regression', async () => {
        await contentPage.verifyWidgetCountsVisible('Content Types — Standard', '.widgetListNameWithImageStyle1Card ul li', 'span.css-xmhyag');
    });

    /**
     * Objective: Verify View All button visibility for "Content Types — Standard".
     */
    test('TC_ContentPage_W02_07 - "Content Types — Standard" - View All button visibility @regression', async () => {
        await contentPage.verifyWidgetViewAllButton('Content Types — Standard');
    });

    /**
     * Objective: Verify clicking View All button displays all content items in "Content Types — Standard".
     */
    test('TC_ContentPage_W02_08 - "Content Types — Standard" - Click View All displays all content items @regression', async () => {
        await contentPage.clickViewAllInWidget('Content Types — Standard');
    });

    /**
     * Objective: Verify image hover display name and cursor pointer style for "Content Types — Standard".
     */
    test('TC_ContentPage_W02_09 - "Content Types — Standard" - Image hover name and pointer cursor style @regression', async () => {
        await contentPage.verifyWidgetImageHoverAndCursor('Content Types — Standard', '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify clicking a standard content type card (e.g. Journal) displays content data.
     */
    test('TC_ContentPage_W02_10 - "Content Types — Standard" - Click content type card displays content data @regression', async () => {
        await contentPage.clickSpecificCardInWidget('Content Types — Standard', 'Journal');
    });

    /**
     * Objective: Verify positive search filtering for "Content Types — Standard".
     */
    test('TC_ContentPage_W02_11 - "Content Types — Standard" - Positive search filtering @regression', async () => {
        await contentPage.verifyPositiveSearchQuery('Content Types — Standard', contentData.searchQuery, '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Content Types — Standard".
     */
    test('TC_ContentPage_W02_12 - "Content Types — Standard" - Negative search returning 0 results @regression', async () => {
        await contentPage.verifyNegativeSearchQuery('Content Types — Standard', contentData.invalidSearchQuery, '.widgetListNameWithImageStyle1Card ul li');
    });

    /**
     * Objective: Verify search reset behavior on clearing search bar for "Content Types — Standard".
     */
    test('TC_ContentPage_W02_13 - "Content Types — Standard" - Search reset behavior @regression', async () => {
        await contentPage.verifySearchResetQuery('Content Types — Standard', '.widgetListNameWithImageStyle1Card ul li');
    });

    // ==========================================
    // WIDGET 3: CONTENT TYPES — STYLE 1
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_01 - "Content Types — Style 1" - Heading visibility validation @regression', async () => {
        await contentPage.verifyWidget('Content Types — Style 1');
    });

    /**
     * Objective: Verify exact description text for "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_02 - "Content Types — Style 1" - Exact description text validation @regression', async () => {
        await contentPage.verifyWidgetDescription('Content Types — Style 1', contentData.expectedDescriptionStyle1);
    });

    /**
     * Objective: Verify card list container structure for "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_03 - "Content Types — Style 1" - Card list container structure @regression', async () => {
        await contentPage.verifyWidgetCardContainer('Content Types — Style 1', '.widgetListNameWithImageStyle1Card ul li, div');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_04 - "Content Types — Style 1" - First card cover image visibility @regression', async () => {
        await contentPage.verifyWidgetCoverImage('Content Types — Style 1', '.widgetListNameWithImageStyle1Card ul li, div');
    });

    /**
     * Objective: Verify content title label visibility on first card in "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_05 - "Content Types — Style 1" - First card content title label visibility @regression', async () => {
        await contentPage.verifyWidgetTitleLabel('Content Types — Style 1', '.widgetListNameWithImageStyle1Card ul li, div', '.widgetNwlStyle1CardTitle, span');
    });

    /**
     * Objective: Verify count badge visibility and numeric presence in "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_06 - "Content Types — Style 1" - Count badge visibility and numeric presence @regression', async () => {
        await contentPage.verifyWidgetCountsVisible('Content Types — Style 1', 'ul li, div', 'span');
    });

    /**
     * Objective: Verify View All button visibility for "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_07 - "Content Types — Style 1" - View All button visibility @regression', async () => {
        await contentPage.verifyWidgetViewAllButton('Content Types — Style 1');
    });

    /**
     * Objective: Verify clicking View All button displays all content items in "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_08 - "Content Types — Style 1" - Click View All displays all content items @regression', async () => {
        await contentPage.clickViewAllInWidget('Content Types — Style 1');
    });

    /**
     * Objective: Verify image hover display name and cursor pointer style for "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_09 - "Content Types — Style 1" - Image hover name and pointer cursor style @regression', async () => {
        await contentPage.verifyWidgetImageHoverAndCursor('Content Types — Style 1', 'ul li, div');
    });

    /**
     * Objective: Verify clicking a content type card (e.g. Course Material) displays content data in "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_10 - "Content Types — Style 1" - Click content type card displays content data @regression', async () => {
        await contentPage.clickSpecificCardInWidget('Content Types — Style 1', 'Course Material');
    });

    /**
     * Objective: Verify positive search filtering for "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_11 - "Content Types — Style 1" - Positive search filtering @regression', async () => {
        await contentPage.verifyPositiveSearchQuery('Content Types — Style 1', contentData.searchQuery, 'ul li, div');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_12 - "Content Types — Style 1" - Negative search returning 0 results @regression', async () => {
        await contentPage.verifyNegativeSearchQuery('Content Types — Style 1', contentData.invalidSearchQuery, 'ul li, div');
    });

    /**
     * Objective: Verify search reset behavior for "Content Types — Style 1".
     */
    test('TC_ContentPage_W03_13 - "Content Types — Style 1" - Search reset behavior @regression', async () => {
        await contentPage.verifySearchResetQuery('Content Types — Style 1', 'ul li, div');
    });

    // ==========================================
    // WIDGET 4: CONTENT TYPES — STYLE 2
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_01 - "Content Types — Style 2" - Heading visibility validation @regression', async () => {
        await contentPage.verifyWidget('Content Types — Style 2');
    });

    /**
     * Objective: Verify exact description text for "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_02 - "Content Types — Style 2" - Exact description text validation @regression', async () => {
        await contentPage.verifyWidgetDescription('Content Types — Style 2', contentData.expectedDescriptionStyle2);
    });

    /**
     * Objective: Verify card list container structure for "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_03 - "Content Types — Style 2" - Card list container structure @regression', async () => {
        await contentPage.verifyWidgetCardContainer('Content Types — Style 2', 'div, ul li');
    });

    /**
     * Objective: Verify in-widget search input bar visibility and placeholder for "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_04 - "Content Types — Style 2" - In-widget search input bar visibility @regression', async () => {
        const container = contentPage.getWidgetContainer('Content Types — Style 2');
        const searchInput = container.locator('input[placeholder*="Search"], .srch-wthn-input').first();
        await expect(searchInput).toBeVisible({ timeout: 5000 });
    });

    /**
     * Objective: Verify cover image visibility on first card in "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_05 - "Content Types — Style 2" - First card cover image visibility @regression', async () => {
        await contentPage.verifyWidgetCoverImage('Content Types — Style 2', 'div, ul li');
    });

    /**
     * Objective: Verify content title label visibility on first card in "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_06 - "Content Types — Style 2" - First card content title label visibility @regression', async () => {
        await contentPage.verifyWidgetTitleLabel('Content Types — Style 2', 'div, ul li', 'span, div');
    });

    /**
     * Objective: Verify count badge visibility and count numbers for all 14 format cards in "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_07 - "Content Types — Style 2" - Count badge visibility and numeric presence @regression', async () => {
        await contentPage.verifyWidgetCountsVisible('Content Types — Style 2', 'div, ul li', 'span');
    });

    /**
     * Objective: Verify image hover display name and cursor pointer style for "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_08 - "Content Types — Style 2" - Image hover name and pointer cursor style @regression', async () => {
        await contentPage.verifyWidgetImageHoverAndCursor('Content Types — Style 2', 'div, ul li');
    });

    /**
     * Objective: Verify clicking a content type card (e.g. Presentation) displays content data in "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_09 - "Content Types — Style 2" - Click content type card displays content data @regression', async () => {
        await contentPage.clickSpecificCardInWidget('Content Types — Style 2', 'Presentation');
    });

    /**
     * Objective: Verify in-widget positive search filtering for "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_10 - "Content Types — Style 2" - In-widget positive search filtering @regression', async () => {
        await contentPage.verifyPositiveSearchQuery('Content Types — Style 2', 'Journal', 'div, ul li');
    });

    /**
     * Objective: Verify in-widget negative search returning 0 results for "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_11 - "Content Types — Style 2" - In-widget negative search returning 0 results @regression', async () => {
        await contentPage.verifyNegativeSearchQuery('Content Types — Style 2', 'NON_EXISTENT_FORMAT_999', 'div, ul li');
    });

    /**
     * Objective: Verify in-widget search reset behavior for "Content Types — Style 2".
     */
    test('TC_ContentPage_W04_12 - "Content Types — Style 2" - In-widget search reset behavior @regression', async () => {
        await contentPage.verifySearchResetQuery('Content Types — Style 2', 'div, ul li');
    });

    // ==========================================
    // WIDGET 5: CONTENT TYPES — CARDS
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Content Types — Cards".
     */
    test('TC_ContentPage_W05_01 - "Content Types — Cards" - Heading visibility validation @regression', async () => {
        await contentPage.verifyWidget('Content Types — Cards');
    });

    /**
     * Objective: Verify exact description text for "Content Types — Cards".
     */
    test('TC_ContentPage_W05_02 - "Content Types — Cards" - Exact description text validation @regression', async () => {
        await contentPage.verifyWidgetDescription('Content Types — Cards', contentData.expectedDescriptionCards);
    });

    /**
     * Objective: Verify card list container structure for "Content Types — Cards".
     */
    test('TC_ContentPage_W05_03 - "Content Types — Cards" - Card list container structure @regression', async () => {
        await contentPage.verifyWidgetCardContainer('Content Types — Cards', 'div, ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Content Types — Cards".
     */
    test('TC_ContentPage_W05_04 - "Content Types — Cards" - First card cover image visibility @regression', async () => {
        await contentPage.verifyWidgetCoverImage('Content Types — Cards', 'div, ul li');
    });

    /**
     * Objective: Verify content title label visibility on first card in "Content Types — Cards".
     */
    test('TC_ContentPage_W05_05 - "Content Types — Cards" - First card content title label visibility @regression', async () => {
        await contentPage.verifyWidgetTitleLabel('Content Types — Cards', 'div, ul li', 'span, div');
    });

    /**
     * Objective: Verify View All button visibility for "Content Types — Cards".
     */
    test('TC_ContentPage_W05_06 - "Content Types — Cards" - View All button visibility @regression', async () => {
        await contentPage.verifyWidgetViewAllButton('Content Types — Cards');
    });

    /**
     * Objective: Verify clicking View All button displays all content items in "Content Types — Cards".
     */
    test('TC_ContentPage_W05_07 - "Content Types — Cards" - Click View All displays all content items @regression', async () => {
        await contentPage.clickViewAllInWidget('Content Types — Cards');
    });

    /**
     * Objective: Verify image hover display name and cursor pointer style for "Content Types — Cards".
     */
    test('TC_ContentPage_W05_08 - "Content Types — Cards" - Image hover name and pointer cursor style @regression', async () => {
        await contentPage.verifyWidgetImageHoverAndCursor('Content Types — Cards', 'div, ul li');
    });

    /**
     * Objective: Verify clicking a content type card (e.g. Magazine) displays content data in "Content Types — Cards".
     */
    test('TC_ContentPage_W05_09 - "Content Types — Cards" - Click content type card displays content data @regression', async () => {
        await contentPage.clickSpecificCardInWidget('Content Types — Cards', 'Magazine');
    });

    /**
     * Objective: Verify positive search filtering for "Content Types — Cards".
     */
    test('TC_ContentPage_W05_10 - "Content Types — Cards" - Positive search filtering @regression', async () => {
        await contentPage.verifyPositiveSearchQuery('Content Types — Cards', contentData.searchQuery, 'div, ul li');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Content Types — Cards".
     */
    test('TC_ContentPage_W05_11 - "Content Types — Cards" - Negative search returning 0 results @regression', async () => {
        await contentPage.verifyNegativeSearchQuery('Content Types — Cards', contentData.invalidSearchQuery, 'div, ul li');
    });

    /**
     * Objective: Verify search reset behavior for "Content Types — Cards".
     */
    test('TC_ContentPage_W05_12 - "Content Types — Cards" - Search reset behavior @regression', async () => {
        await contentPage.verifySearchResetQuery('Content Types — Cards', 'div, ul li');
    });

    // ==========================================
    // WIDGET 6: SELECTED CONTENT TYPES
    // ==========================================

    /**
     * Objective: Verify widget heading visibility for "Selected Content Types".
     */
    test('TC_ContentPage_W06_01 - "Selected Content Types" - Heading visibility validation @regression', async () => {
        await contentPage.verifyWidget('Selected Content Types');
    });

    /**
     * Objective: Verify exact description text for "Selected Content Types".
     */
    test('TC_ContentPage_W06_02 - "Selected Content Types" - Exact description text validation @regression', async () => {
        await contentPage.verifyWidgetDescription('Selected Content Types', contentData.expectedDescriptionSelected);
    });

    /**
     * Objective: Verify card list container structure for "Selected Content Types".
     */
    test('TC_ContentPage_W06_03 - "Selected Content Types" - Card list container structure @regression', async () => {
        await contentPage.verifyWidgetCardContainer('Selected Content Types', 'div, ul li');
    });

    /**
     * Objective: Verify cover image visibility on first card in "Selected Content Types".
     */
    test('TC_ContentPage_W06_04 - "Selected Content Types" - First card cover image visibility @regression', async () => {
        await contentPage.verifyWidgetCoverImage('Selected Content Types', 'div, ul li');
    });

    /**
     * Objective: Verify content title label visibility on first card in "Selected Content Types".
     */
    test('TC_ContentPage_W06_05 - "Selected Content Types" - First card content title label visibility @regression', async () => {
        await contentPage.verifyWidgetTitleLabel('Selected Content Types', 'div, ul li', 'span, div');
    });

    /**
     * Objective: Verify View All button visibility for "Selected Content Types".
     */
    test('TC_ContentPage_W06_06 - "Selected Content Types" - View All button visibility @regression', async () => {
        await contentPage.verifyWidgetViewAllButton('Selected Content Types');
    });

    /**
     * Objective: Verify clicking View All button displays all content items in "Selected Content Types".
     */
    test('TC_ContentPage_W06_07 - "Selected Content Types" - Click View All displays all content items @regression', async () => {
        await contentPage.clickViewAllInWidget('Selected Content Types');
    });

    /**
     * Objective: Verify image hover display name and cursor pointer style for "Selected Content Types".
     */
    test('TC_ContentPage_W06_08 - "Selected Content Types" - Image hover name and pointer cursor style @regression', async () => {
        await contentPage.verifyWidgetImageHoverAndCursor('Selected Content Types', 'div, ul li');
    });

    /**
     * Objective: Verify clicking a content type card (e.g. Video) displays content data in "Selected Content Types".
     */
    test('TC_ContentPage_W06_09 - "Selected Content Types" - Click content type card displays content data @regression', async () => {
        await contentPage.clickSpecificCardInWidget('Selected Content Types', 'Video');
    });

    /**
     * Objective: Verify positive search filtering for "Selected Content Types".
     */
    test('TC_ContentPage_W06_10 - "Selected Content Types" - Positive search filtering @regression', async () => {
        await contentPage.verifyPositiveSearchQuery('Selected Content Types', contentData.searchQuery, 'div, ul li');
    });

    /**
     * Objective: Verify negative search returning 0 results for "Selected Content Types".
     */
    test('TC_ContentPage_W06_11 - "Selected Content Types" - Negative search returning 0 results @regression', async () => {
        await contentPage.verifyNegativeSearchQuery('Selected Content Types', contentData.invalidSearchQuery, 'div, ul li');
    });

    /**
     * Objective: Verify search reset behavior for "Selected Content Types".
     */
    test('TC_ContentPage_W06_12 - "Selected Content Types" - Search reset behavior @regression', async () => {
        await contentPage.verifySearchResetQuery('Selected Content Types', 'div, ul li');
    });

    // ==========================================
    // SECTION 3: CONTENT RESULTS & DOCUMENT ACTIONS (READ, DETAIL, FAVOURITE, SHARE)
    // ==========================================

    /**
     * Objective: Verify clicking on any content type name displays content data & document results.
     */
    test('TC_ContentPage_SEC_01 - Verify clicking content type name displays content data @regression', async () => {
        const isVisible = await contentPage.clickContentTypeNameAndVerifyResults('Case Study');
        expect(isVisible).toBe(true);
    });

    /**
     * Objective: Verify clicking Read button opens document in a new tab.
     */
    test('TC_ContentPage_SEC_02 - Verify Read button opens document in new tab @regression', async () => {
        await contentPage.verifyReadButtonOpensNewTab();
    });

    /**
     * Objective: Verify clicking Detail page button displays detail information.
     */
    test('TC_ContentPage_SEC_03 - Verify Detail page button displays detail information @regression', async () => {
        await contentPage.verifyDetailPageInformationVisible();
    });

    /**
     * Objective: Verify clicking Add to Favourite button updates favourite state.
     */
    test('TC_ContentPage_SEC_04 - Verify Add to Favourite button interaction @regression', async () => {
        await contentPage.verifyAddToFavouriteInteraction();
    });

    /**
     * Objective: Verify clicking Share button displays all share option buttons.
     */
    test('TC_ContentPage_SEC_05 - Verify Share button displays all share option buttons @regression', async () => {
        await contentPage.verifyShareButtonAndAllOptionsVisible();
    });

    // ==========================================
    // SECTION 4: GLOBAL CONTROLS & RESPONSIVE VIEWPORTS
    // ==========================================

    /**
     * Objective: Verify Go-to-Top button visibility on scroll and click functionality.
     */
    test('TC_ContentPage_CTL_01 - Verify Go-to-Top button visibility and click scroll behavior @regression', async () => {
        await contentPage.verifyGoToTopControl();
    });

    /**
     * Objective: Verify Content page layout across mobile, tablet, and desktop viewports.
     */
    test('TC_ContentPage_RSP_01 - Verify widget layout responsiveness across portrait and landscape viewports @regression', async () => {
        const viewports = [
            { width: 375, height: 812, name: 'portrait' },
            { width: 812, height: 375, name: 'landscape' },
            { width: 768, height: 1024, name: 'landscape_md' },
            { width: 1920, height: 1080, name: 'landscape_lg' }
        ];

        for (const vp of viewports) {
            await sharedPage.setViewportSize({ width: vp.width, height: vp.height });
            await sharedPage.waitForTimeout(300);
            await contentPage.verifyWidget('All Content Types');
        }

        // Reset to default viewport
        await sharedPage.setViewportSize({ width: 1920, height: 1080 });
    });
});

import { Page } from '@playwright/test';
import { test } from '../../../src/fixtures';
import { AtoZResultPage } from '../../../src/pages/portal/AtoZResultPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import atozPageData from '../../test-data/atozPageData.json';

test.describe.serial('Portal A-Z Result Page - Comprehensive Functional & UI Validation', () => {
    let sharedPage: Page;
    let atozResultPage: AtoZResultPage;

    test.beforeAll(async ({ browser }) => {
        // Setup Admin API state ONCE to ensure clean precondition
        const adminApi = new AdminApiService();
        await adminApi.login();
        await adminApi.updateSecuritySettings({
            twoFactorAuth: false,
            automatedVerification: true,
            mandatoryFields: { isMandatory: false, fields: [] }
        });
        await adminApi.changeUserPassword(process.env.TC_USER_EMAIL as string, process.env.TC_USER_PASSWORD as string);
        await adminApi.close();

        // Launch browser context and login ONCE
        const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
        sharedPage = await context.newPage();

        const portalLoginPage = new PortalLoginPage(sharedPage);
        atozResultPage = new AtoZResultPage(sharedPage);

        await portalLoginPage.login(
            process.env.TC_USER_EMAIL as string,
            process.env.TC_USER_PASSWORD as string
        );
        await sharedPage.waitForURL(url => !url.href.includes('/login'), { timeout: 20000 }).catch(() => {});
        await sharedPage.waitForLoadState('domcontentloaded');
        await atozResultPage.goto();
    });

    test.beforeEach(async () => {
        // Redirect to A-Z Result Page freshly before each test case
        await atozResultPage.goto();
    });

    // ============================================================
    // 1. PAGE LOAD & HEADER NAVIGATION
    // ============================================================

    test('TC_AtoZ_001 - Should load A-Z Result Page and verify header elements & breadcrumbs @smoke @regression', async () => {
        await atozResultPage.verifyPageLoaded();
        await atozResultPage.verifyBreadcrumbs();
    });

    // ============================================================
    // 2. ALPHABET RIBBON FILTERING
    // ============================================================

    test('TC_AtoZ_002 - Should display complete Alphabet Ribbon A-Z with all 26 letters @regression', async () => {
        await atozResultPage.verifyAllAlphabetLetters(atozPageData.alphabetLetters);
    });

    test('TC_AtoZ_003 - Should filter catalog results when clicking an Alphabet letter @regression', async () => {
        await atozResultPage.clickAlphabetLetter(atozPageData.sampleFilterLetter);
        await atozResultPage.verifyResultsDisplayed();
    });

    // ============================================================
    // 3. CONTENT TABS (eCatalog / Multimedia)
    // ============================================================

    test('TC_AtoZ_004 - Should display and switch between eCatalog and Multimedia content tabs @regression', async () => {
        await atozResultPage.verifyTabsVisible();
        await atozResultPage.switchTab('Multimedia');
        await atozResultPage.switchTab('eCatalog');
        await atozResultPage.verifyResultsDisplayed();
    });

    // ============================================================
    // 4. SIDEBAR FILTERS (FACETS)
    // ============================================================

    test('TC_AtoZ_005 - Should display all primary filter facet accordions in sidebar @regression', async () => {
        await atozResultPage.verifyFilterFacets(atozPageData.filterFacets);
    });

    test('TC_AtoZ_006 - Should expand a filter facet accordion to view filter options @regression', async () => {
        await atozResultPage.expandFilterFacet(atozPageData.sampleFacetToExpand);
    });

    test('TC_AtoZ_007 - Should toggle filter sidebar visibility collapse and expand @regression', async () => {
        await atozResultPage.toggleFilterSidebar();
        await atozResultPage.toggleFilterSidebar();
    });

    // ============================================================
    // 5. SEARCH WITHIN RESULTS
    // ============================================================

    test('TC_AtoZ_008 - Should search within results with a valid query @regression', async () => {
        await atozResultPage.searchWithinResults(atozPageData.searchWithinValidQuery);
        await atozResultPage.verifyResultsDisplayed();
    });

    test('TC_AtoZ_009 - Should clear search within results and restore full catalog @regression', async () => {
        await atozResultPage.clearSearchWithin();
        await atozResultPage.verifyResultsDisplayed();
    });

    // ============================================================
    // 6. RESULT CARDS INTEGRITY & ACTION BUTTONS
    // ============================================================

    test('TC_AtoZ_010 - Should display result cards in grid with complete metadata @smoke @regression', async () => {
        await atozResultPage.verifyResultsDisplayed();
        await atozResultPage.verifyFirstCardMetadata();
    });

    test('TC_AtoZ_011 - Should display action buttons on result cards @regression', async () => {
        await atozResultPage.verifyFirstCardActionButtons();
    });

    test('TC_AtoZ_012 - Should handle Read button interaction on a result card @regression', async () => {
        await atozResultPage.clickFirstCardReadButton();
        await atozResultPage.verifyResultsDisplayed();
    });

    // ============================================================
    // 7. VIEW MODE & SORT SWITCHER
    // ============================================================

    test('TC_AtoZ_013 - Should verify View Mode switcher and Sort dropdown controls @regression', async () => {
        await atozResultPage.verifyViewAndSortControls();
    });

    // ============================================================
    // 8. PAGINATION
    // ============================================================

    test('TC_AtoZ_014 - Should navigate between pages using pagination controls @regression', async () => {
        await atozResultPage.verifyPaginationControls();
        await atozResultPage.goToNextPage();
        await atozResultPage.returnToFirstPage();
    });

    // ============================================================
    // 9. ACTIVE FILTER TAGS & RESET LIFECYCLE
    // ============================================================

    test('TC_AtoZ_015 - Should create drilldown filter tag when searching within results and reset with Clear All @regression', async () => {
        await atozResultPage.searchWithinResults(atozPageData.searchWithinInvalidQuery);
        await atozResultPage.verifyAppliedFilterTag(atozPageData.searchWithinInvalidQuery);
        await atozResultPage.clearAllFilters();
    });

    test('TC_AtoZ_016 - Should apply facet filter option and clear active filters @regression', async () => {
        await atozResultPage.expandFilterFacet(atozPageData.sampleFacetToExpand);
        await atozResultPage.selectFirstFacetOption(atozPageData.sampleFacetToExpand);
        await atozResultPage.clearAllFilters();
    });
});

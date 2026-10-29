import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures';
import { OcaPage } from '../../../src/pages/portal/OcaPage';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import { AdminApiService } from '../../../src/api/AdminApiService';
import ocaPageData from '../../test-data/ocaPageData.json';
import * as path from 'path';
import * as fs from 'fs';

test.describe.serial('Portal OCA Page - Off-Campus Access Widgets & Resource Routing Validation', () => {
  let sharedPage: Page;
  let ocaPage: OcaPage;

  test.beforeAll(async ({ browser }) => {
    // Persistent storage file path for portal login session
    const storagePath = path.resolve(__dirname, '../../../src/setup/.auth/portalUserStorageState.json');
    const authDir = path.dirname(storagePath);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Sanitize any existing storageState (remove googtrans translation cookies)
    if (fs.existsSync(storagePath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
        if (existingData.cookies) {
          existingData.cookies = existingData.cookies.filter((c: any) => !c.name.includes('googtrans'));
          fs.writeFileSync(storagePath, JSON.stringify(existingData, null, 2));
        }
      } catch (e) {}
    }

    const hasSavedSession = fs.existsSync(storagePath);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      storageState: hasSavedSession ? storagePath : undefined
    });
    sharedPage = await context.newPage();

    const portalLoginPage = new PortalLoginPage(sharedPage);
    ocaPage = new OcaPage(sharedPage);

    const portalUrl = process.env.PORTAL_URL || 'https://qa-psinstitude.knimbus.com';
    await sharedPage.goto(`${portalUrl}/portal/v2/default/home`, { waitUntil: 'domcontentloaded' });
    await sharedPage.locator('text=Loading').waitFor({ state: 'detached', timeout: 20000 }).catch(() => {});

    // Check if session is expired or signed out
    const signInButton = sharedPage.getByRole('button', { name: 'Sign in' });
    const isSessionExpired = sharedPage.url().includes('sessionExpired');
    const isSignedOut = isSessionExpired || (await signInButton.isVisible({ timeout: 3000 }).catch(() => false));

    if (isSignedOut || !hasSavedSession) {
      console.log('[Setup] Saved session missing or expired. Performing fresh login...');
      const adminApi = new AdminApiService();
      await adminApi.login();
      await adminApi.updateSecuritySettings({
        twoFactorAuth: false,
        automatedVerification: true,
        mandatoryFields: { isMandatory: false, fields: [] }
      });
      await adminApi.changeUserPassword(process.env.TC_USER_EMAIL as string, process.env.TC_USER_PASSWORD as string);
      await adminApi.close();

      if (isSessionExpired) {
        await sharedPage.goto(`${portalUrl}/portal/v2/default/home`, { waitUntil: 'domcontentloaded' });
      }

      await portalLoginPage.login(
        process.env.TC_USER_EMAIL as string,
        process.env.TC_USER_PASSWORD as string
      );
      await sharedPage.waitForResponse(res => res.url().includes('login') && res.status() === 200, { timeout: 15000 }).catch(() => {});
      await sharedPage.waitForLoadState('networkidle').catch(() => {});
      await expect(signInButton).toBeHidden({ timeout: 15000 }).catch(() => {});
      await sharedPage.locator('text=Loading').waitFor({ state: 'detached', timeout: 20000 }).catch(() => {});

      // Save valid session state
      await context.storageState({ path: storagePath });
      const savedState = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
      if (savedState.cookies) {
        savedState.cookies = savedState.cookies.filter((c: any) => !c.name.includes('googtrans'));
        fs.writeFileSync(storagePath, JSON.stringify(savedState, null, 2));
      }
      console.log(`[Setup] Session successfully saved to: ${storagePath}`);
    } else {
      console.log('[Setup] Reusing saved portal login session.');
    }

    // Navigate to Off-Campus Access page via navbar link
    await ocaPage.goto();
  });

  test.afterAll(async () => {
    await sharedPage?.close();
  });

  // ============================================================
  // 1. PAGE LEVEL NAVIGATION
  // ============================================================

  test('TC_OCAPage_001 - Should verify End-User Portal OCA Page loads successfully @smoke @regression', async () => {
    await ocaPage.verifyOcaPageLoaded();
  });

  // ============================================================
  // 2. WIDGET 1: REMOTE ACCESS — TOGGLE VIEW
  // ============================================================

  test('TC_OCAPage_002 - Should verify Remote Access — Toggle View header title and description sub-detail @regression', async () => {
    const { title, description } = ocaPageData.widgets.toggleView;
    await ocaPage.verifyWidgetHeaderAndDescription(title, description);
  });

  test('TC_OCAPage_003 - Should verify Remote Access — Toggle View categorization count, category view all buttons, and initial content data @regression', async () => {
    const { title, categoryCount, initialCategories, categoriesWithCounts } = ocaPageData.widgets.toggleView;
    await ocaPage.verifyCategorizationCount(title, categoryCount);
    await ocaPage.verifyWidgetCategories(title, initialCategories);
    await ocaPage.verifyCategoryCounts(title, categoriesWithCounts);
    await ocaPage.verifyViewAllDisplayedForAllCategories(title, categoryCount);

    const count = await ocaPage.getWidgetCardCount(title);
    expect(count).toBeGreaterThan(0);
  });

  test('TC_OCAPage_004 - Should perform search within Remote Access — Toggle View, verify filtered content, and restore upon clear @regression', async () => {
    const { title, searchQuery, expectedResource, postSearchCategories } = ocaPageData.widgets.toggleView;
    await ocaPage.searchWithinWidget(title, searchQuery);
    await ocaPage.verifyResourceInWidget(title, expectedResource);
    await ocaPage.verifyWidgetCategories(title, postSearchCategories);

    await ocaPage.clearSearchWithinWidget(title);
    const restoredCount = await ocaPage.getWidgetCardCount(title);
    expect(restoredCount).toBeGreaterThan(0);
  });

  // ============================================================
  // 3. WIDGET 2: REMOTE ACCESS — STANDARD
  // ============================================================

  test('TC_OCAPage_005 - Should verify Remote Access — Standard header title and description sub-detail @regression', async () => {
    const { title, description } = ocaPageData.widgets.standard;
    await ocaPage.verifyWidgetHeaderAndDescription(title, description);
  });

  test('TC_OCAPage_006 - Should verify Remote Access — Standard categorization count, category view all buttons, and initial content data @regression', async () => {
    const { title, categoryCount, initialCategories, categoriesWithCounts } = ocaPageData.widgets.standard;
    await ocaPage.verifyCategorizationCount(title, categoryCount);
    await ocaPage.verifyWidgetCategories(title, initialCategories);
    await ocaPage.verifyCategoryCounts(title, categoriesWithCounts);
    await ocaPage.verifyViewAllDisplayedForAllCategories(title, categoryCount);

    const count = await ocaPage.getWidgetCardCount(title);
    expect(count).toBeGreaterThan(0);
  });

  test('TC_OCAPage_007 - Should perform search within Remote Access — Standard, verify filtered content, and restore upon clear @regression', async () => {
    const { title, searchQuery, expectedResource } = ocaPageData.widgets.standard;
    await ocaPage.searchWithinWidget(title, searchQuery);
    await ocaPage.verifyResourceInWidget(title, expectedResource);

    await ocaPage.clearSearchWithinWidget(title);
    const restoredCount = await ocaPage.getWidgetCardCount(title);
    expect(restoredCount).toBeGreaterThan(0);
  });

  // ============================================================
  // 4. WIDGET 3: REMOTE ACCESS — GROUPED
  // ============================================================

  test('TC_OCAPage_008 - Should verify Remote Access — Grouped header title and description sub-detail @regression', async () => {
    const { title, description } = ocaPageData.widgets.grouped;
    await ocaPage.verifyWidgetHeaderAndDescription(title, description);
  });

  test('TC_OCAPage_009 - Should verify Remote Access — Grouped categorization count, category view all buttons, and initial content data @regression', async () => {
    const { title, categoryCount, initialCategories, categoriesWithCounts } = ocaPageData.widgets.grouped;
    await ocaPage.verifyCategorizationCount(title, categoryCount);
    await ocaPage.verifyWidgetCategories(title, initialCategories);
    await ocaPage.verifyCategoryCounts(title, categoriesWithCounts);
    await ocaPage.verifyViewAllDisplayedForAllCategories(title, categoryCount);

    const count = await ocaPage.getWidgetCardCount(title);
    expect(count).toBeGreaterThan(0);
  });

  test('TC_OCAPage_010 - Should perform search within Remote Access — Grouped, verify filtered content, and restore upon clear @regression', async () => {
    const { title, searchQuery, expectedResource } = ocaPageData.widgets.grouped;
    await ocaPage.searchWithinWidget(title, searchQuery);
    await ocaPage.verifyResourceInWidget(title, expectedResource);

    await ocaPage.clearSearchWithinWidget(title);
    const restoredCount = await ocaPage.getWidgetCardCount(title);
    expect(restoredCount).toBeGreaterThan(0);
  });

  // ============================================================
  // 5. WIDGET 4: REMOTE ACCESS — TABBED
  // ============================================================

  test('TC_OCAPage_011 - Should verify Remote Access — Tabbed header title and description sub-detail @regression', async () => {
    const { title, description } = ocaPageData.widgets.tabbed;
    await ocaPage.verifyWidgetHeaderAndDescription(title, description);
  });

  test('TC_OCAPage_012 - Should verify Remote Access — Tabbed category tabs, categorization count, tab view all buttons, and switch across tabs @regression', async () => {
    const { title, categoryCount, tabs, tabsWithCounts } = ocaPageData.widgets.tabbed;
    await ocaPage.verifyCategorizationCount(title, categoryCount);
    await ocaPage.verifyWidgetCategories(title, tabs);
    await ocaPage.verifyCategoryCounts(title, tabsWithCounts);
    await ocaPage.verifyViewAllDisplayedForAllCategories(title, categoryCount);

    for (const tab of tabs) {
      await ocaPage.clickTabInWidget(title, tab);
      const count = await ocaPage.getWidgetCardCount(title);
      expect(count).toBeGreaterThan(0);
    }
  });


  test('TC_OCAPage_013 - Should perform search within Remote Access — Tabbed, verify filtered content, and restore upon clear @regression', async () => {
    const { title, activeTabForSearch, searchQuery, expectedResource } = ocaPageData.widgets.tabbed;
    await ocaPage.clickTabInWidget(title, activeTabForSearch);
    await ocaPage.searchWithinWidget(title, searchQuery);
    await ocaPage.verifyResourceInWidget(title, expectedResource);

    await ocaPage.clearSearchWithinWidget(title);
    const restoredCount = await ocaPage.getWidgetCardCount(title);
    expect(restoredCount).toBeGreaterThan(0);
  });


  // ============================================================
  // 6. RESOURCE SOURCE NAVIGATION (NEW TAB & RETURN)
  // ============================================================

  test('TC_OCAPage_014 - Should click on an OCA source page, open in new tab, and redirect back to initial page @smoke @regression', async () => {
    const { title, expectedResource } = ocaPageData.widgets.toggleView;
    await ocaPage.clickResourceAndVerifyNewTab(title, expectedResource);
  });

  // ============================================================
  // 7. VIEW ALL NAVIGATION VALIDATION ACROSS ALL WIDGETS
  // ============================================================

  test('TC_OCAPage_015 - Should click "View all" in Remote Access — Toggle View, verify View All page, and return to OCA page @regression', async () => {
    const { title } = ocaPageData.widgets.toggleView;
    await ocaPage.clickViewAllAndVerifyNavigation(title);
  });

  test('TC_OCAPage_016 - Should click "View all" in Remote Access — Standard, verify View All page, and return to OCA page @regression', async () => {
    const { title } = ocaPageData.widgets.standard;
    await ocaPage.clickViewAllAndVerifyNavigation(title);
  });

  test('TC_OCAPage_017 - Should click "View all" in Remote Access — Grouped, verify View All page, and return to OCA page @regression', async () => {
    const { title } = ocaPageData.widgets.grouped;
    await ocaPage.clickViewAllAndVerifyNavigation(title);
  });

  test('TC_OCAPage_018 - Should click "View all" in Remote Access — Tabbed, verify View All page, and return to OCA page @regression', async () => {
    const { title } = ocaPageData.widgets.tabbed;
    await ocaPage.clickViewAllAndVerifyNavigation(title);
  });

  // ============================================================
  // 8. LAYOUT RESPONSIVENESS
  // ============================================================

  test('TC_OCAPage_019 - Should verify OCA Page layout responsiveness across viewports @regression', async () => {
    for (const viewport of ocaPageData.responsiveViewports) {
      await sharedPage.setViewportSize({ width: viewport.width, height: viewport.height });
      await sharedPage.waitForTimeout(500);

      await ocaPage.verifyOcaPageLoaded();
    }

    // Reset viewport back to desktop
    await sharedPage.setViewportSize({ width: 1920, height: 1080 });
  });
});
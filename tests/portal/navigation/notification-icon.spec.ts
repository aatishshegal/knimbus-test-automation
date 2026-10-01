import { test, expect } from '../../../src/fixtures';
import { AdminApiService } from '../../../src/api/AdminApiService';
import { PortalLoginPage } from '../../../src/pages/portal/PortalLoginPage';
import portalData from '../../test-data/portal-data.json';

const sampleTitle = portalData.notificationData.sampleNotification.title;
const sampleDesc = portalData.notificationData.sampleNotification.description;

test.describe('Global Navigation - Notification Icon & Modal Presence', () => {
  let adminApi: AdminApiService;
  const userEmail = process.env.HOME_PAGE_USER_EMAIL as string;

  test.beforeAll(async () => {
    adminApi = new AdminApiService();
    await adminApi.login();
  });

  test.afterAll(async () => {
    if (adminApi) await adminApi.close();
  });

  test.beforeEach(async ({ page, notificationModal }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await notificationModal.ensureMinimumUnreadNotifications(adminApi, userEmail, 1, sampleTitle, sampleDesc);
  });

  test('TC_Notification_Icon_Presence - Bell icon is visible in top navigation bar', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.notificationIcon).toBeVisible();
  });

  test('TC_Notification_BadgeCount_DisplaysUnreadCount - Notification icon displays unread count badge', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.notificationCountBadge).toBeVisible();
    const count = await topNavigationBar.getNotificationBadgeCount();
    expect(count).toBeGreaterThan(0);
  });

  test('TC_Notification_Modal_PresenceAndTabs - Clicking notification icon opens modal with Unread and Read tabs', async ({ topNavigationBar, notificationModal }) => {
    await topNavigationBar.openNotificationModal();
    await expect(notificationModal.modal).toBeVisible();
    await expect(notificationModal.modalHeaderTitle).toContainText(portalData.notificationData.modalTitle);
    await expect(notificationModal.unreadTab).toBeVisible();
    await expect(notificationModal.readTab).toBeVisible();
    await notificationModal.close();
  });
});

test.describe('Notification - View and Read Lifecycle', () => {
  let adminApi: AdminApiService;
  const userEmail = process.env.HOME_PAGE_USER_EMAIL as string;

  test.beforeAll(async () => {
    adminApi = new AdminApiService();
    await adminApi.login();
  });

  test.afterAll(async () => {
    if (adminApi) await adminApi.close();
  });

  test.beforeEach(async ({ page, notificationModal }) => {
    await page.goto(process.env.PORTAL_URL as string);
    await notificationModal.ensureMinimumUnreadNotifications(adminApi, userEmail, 2, sampleTitle, sampleDesc);
    await notificationModal.ensureMinimumReadNotifications(adminApi, userEmail, 1, sampleTitle, sampleDesc);
  });

  test('TC_Notification_Unread_ClickView_ExpandsContent - Clicking View on unread notification expands content and changes button to Hide', async ({ topNavigationBar, notificationModal }) => {
    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToUnreadTab();

    const isExpandedBefore = await notificationModal.isMessageExpanded(0);
    expect(isExpandedBefore).toBeFalsy();

    await notificationModal.clickMessageView(0);
    const isExpandedAfter = await notificationModal.isMessageExpanded(0);
    expect(isExpandedAfter).toBeTruthy();

    const description = await notificationModal.getMessageDescription(0);
    expect(description.length).toBeGreaterThan(0);

    await notificationModal.close();
  });

  test('TC_Notification_Unread_ClickSameViewAgain_MarksAsReadAndMovesToReadTab - Clicking Hide marks notification as read and moves it to Read tab', async ({ topNavigationBar, notificationModal }) => {
    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToUnreadTab();

    const unreadCountBefore = await notificationModal.getTabCount('unread');
    const readCountBefore = await notificationModal.getTabCount('read');

    // Click View to expand
    await notificationModal.clickMessageView(0);
    // Click Hide to collapse, which triggers readNotification API
    await notificationModal.clickMessageView(0);

    await expect(async () => {
      const unreadCountAfter = await notificationModal.getTabCount('unread');
      expect(unreadCountAfter).toBe(unreadCountBefore - 1);
    }).toPass({ timeout: 10000 });

    const readCountAfter = await notificationModal.getTabCount('read');
    expect(readCountAfter).toBe(readCountBefore + 1);

    await notificationModal.close();
  });

  test('TC_Notification_Unread_ClickAnotherView_DecreasesUnreadCount - Opening another notification view marks the previous one as read and decrements unread count', async ({ topNavigationBar, notificationModal }) => {
    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToUnreadTab();

    const unreadCountBefore = await notificationModal.getTabCount('unread');

    // Open first notification
    await notificationModal.clickMessageView(0);
    expect(await notificationModal.isMessageExpanded(0)).toBeTruthy();

    // Open second notification -> marks first as read and decrements unread count
    await notificationModal.clickMessageView(1);

    await expect(async () => {
      const unreadCountAfter = await notificationModal.getTabCount('unread');
      expect(unreadCountAfter).toBeLessThan(unreadCountBefore);
    }).toPass({ timeout: 10000 });

    await notificationModal.close();
  });

  test('TC_Notification_ReadTab_DisplaysReadCount - Read tab displays total read count and showing counter', async ({ topNavigationBar, notificationModal }) => {
    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToReadTab();

    const readTabCount = await notificationModal.getTabCount('read');
    expect(readTabCount).toBeGreaterThan(0);

    const counts = await notificationModal.getShowingCountNumbers();
    expect(counts.showing).toBeGreaterThan(0);
    expect(counts.total).toBe(readTabCount);

    await notificationModal.close();
  });

  test('TC_Notification_ReadTab_ClickView_ExpandsContent - Clicking View on read notification expands modal content to read it', async ({ topNavigationBar, notificationModal }) => {
    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToReadTab();

    await notificationModal.clickMessageView(0);
    expect(await notificationModal.isMessageExpanded(0)).toBeTruthy();

    await notificationModal.close();
  });
});

test.describe('Notification - Pagination & Show More', () => {
  let adminApi: AdminApiService;
  const userEmail = process.env.HOME_PAGE_USER_EMAIL as string;

  test.beforeAll(async () => {
    adminApi = new AdminApiService();
    await adminApi.login();
  });

  test.afterAll(async () => {
    if (adminApi) await adminApi.close();
  });

  test('TC_Notification_Unread_Over10Items_DisplaysShowMoreButton - Shows Show more button when unread list exceeds 10 items', async ({ page, topNavigationBar, notificationModal }) => {
    test.setTimeout(120000);
    await page.goto(process.env.PORTAL_URL as string);
    await notificationModal.ensureMinimumUnreadNotifications(adminApi, userEmail, 11, sampleTitle, sampleDesc);

    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToUnreadTab();

    const unreadCount = await notificationModal.getTabCount('unread');
    expect(unreadCount).toBeGreaterThan(10);

    await expect(notificationModal.showMoreBtn).toBeVisible({ timeout: 10000 });
    await notificationModal.close();
  });

  test('TC_Notification_Unread_ClickShowMore_LoadsMoreItems - Clicking Show more button loads additional items and increases visible count', async ({ page, topNavigationBar, notificationModal }) => {
    test.setTimeout(120000);
    await page.goto(process.env.PORTAL_URL as string);
    await notificationModal.ensureMinimumUnreadNotifications(adminApi, userEmail, 11, sampleTitle, sampleDesc);

    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToUnreadTab();

    const initialVisible = await notificationModal.getVisibleMessageCount();
    expect(initialVisible).toBe(10);

    await notificationModal.clickShowMore();

    const afterVisible = await notificationModal.getVisibleMessageCount();
    expect(afterVisible).toBeGreaterThan(initialVisible);

    await notificationModal.close();
  });

  test('TC_Notification_ReadTab_Over10Items_DisplaysShowMoreButton - Shows Show more button when read list exceeds 10 items', async ({ page, topNavigationBar, notificationModal }) => {
    test.setTimeout(120000);
    await page.goto(process.env.PORTAL_URL as string);
    await notificationModal.ensureMinimumReadNotifications(adminApi, userEmail, 11, sampleTitle, sampleDesc);

    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToReadTab();

    const readCount = await notificationModal.getTabCount('read');
    expect(readCount).toBeGreaterThan(10);

    await expect(notificationModal.showMoreBtn).toBeVisible({ timeout: 10000 });
    await notificationModal.close();
  });

  test('TC_Notification_ReadTab_ClickShowMore_LoadsMoreItems - Clicking Show more button loads additional items and increases visible count', async ({ page, topNavigationBar, notificationModal }) => {
    test.setTimeout(120000);
    await page.goto(process.env.PORTAL_URL as string);
    await notificationModal.ensureMinimumReadNotifications(adminApi, userEmail, 11, sampleTitle, sampleDesc);

    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToReadTab();

    const initialVisible = await notificationModal.getVisibleMessageCount();
    expect(initialVisible).toBe(10);

    await notificationModal.clickShowMore();

    const afterVisible = await notificationModal.getVisibleMessageCount();
    expect(afterVisible).toBeGreaterThan(initialVisible);

    await notificationModal.close();
  });
});

test.describe('Notification - Empty State (Fresh User)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let adminApi: AdminApiService;
  let freshEmail: string;
  const freshPassword = process.env.DEFAULT_PASSWORD || '12345';

  test.beforeAll(async () => {
    adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({
      mandatoryFields: { fields: [], isMandatory: false }
    });
    const uniqueId = Date.now().toString().slice(-6);
    freshEmail = `empty_notif_${uniqueId}@yopmail.com`;
    await adminApi.addSingleUser(`Fresh Notif User ${uniqueId}`, freshEmail);
    await adminApi.changeUserPassword(freshEmail, freshPassword);
  });

  test.afterAll(async () => {
    if (adminApi) {
      await adminApi.close();
    }
  });

  test.beforeEach(async ({ page, termsAndConditionsModal, topNavigationBar }) => {
    const loginPage = new PortalLoginPage(page);
    await loginPage.login(freshEmail, freshPassword);
    await termsAndConditionsModal.handleTermsAndConditionsIfVisible();
    await page.locator('.overlay, .overlay_inner').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    if (page.url().includes('mandatory') || await page.getByText(/Fill the mandatory detail/i).isVisible().catch(() => false)) {
      await page.goto(process.env.PORTAL_URL as string);
      await page.locator('.overlay, .overlay_inner').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }
    await expect(topNavigationBar.notificationIcon).toBeVisible({ timeout: 15000 });
  });

  test('TC_Notification_FreshUser_NoCountBadgeDisplayed - Fresh user with zero notifications displays no count badge on notification icon', async ({ topNavigationBar }) => {
    await expect(topNavigationBar.notificationIcon).toBeVisible({ timeout: 15000 });
    await expect(topNavigationBar.notificationCountBadge).not.toBeVisible();
  });

  test('TC_Notification_FreshUser_EmptyUnread_DisplaysNoNotificationFound - Modal displays No notification found message on Unread tab for fresh user', async ({ topNavigationBar, notificationModal }) => {
    await topNavigationBar.openNotificationModal();
    await notificationModal.verifyEmptyState(portalData.notificationData.emptyStateMessage);
    const unreadCount = await notificationModal.getTabCount('unread');
    expect(unreadCount).toBe(0);
    await notificationModal.close();
  });

  test('TC_Notification_FreshUser_EmptyRead_DisplaysNoNotificationFound - Modal displays No notification found message on Read tab for fresh user', async ({ topNavigationBar, notificationModal }) => {
    await topNavigationBar.openNotificationModal();
    await notificationModal.switchToReadTab();
    await notificationModal.verifyEmptyState(portalData.notificationData.emptyStateMessage);
    const readCount = await notificationModal.getTabCount('read');
    expect(readCount).toBe(0);
    await notificationModal.close();
  });
});

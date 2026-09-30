import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class NotificationModal extends BasePage {
  readonly modal: Locator;
  readonly modalHeaderTitle: Locator;
  readonly closeBtn: Locator;
  readonly unreadTab: Locator;
  readonly readTab: Locator;
  readonly activeTabPane: Locator;
  readonly messageBoxes: Locator;
  readonly emptyStateWrapper: Locator;
  readonly emptyStateHeading: Locator;
  readonly showingCountSpan: Locator;
  readonly showMoreBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.locator('.modal.show').filter({ has: page.locator('.notif-title') });
    this.modalHeaderTitle = this.modal.locator('.notif-title');
    this.closeBtn = this.modal.locator('button.filter-modal-close, button.btn-close');
    this.unreadTab = this.modal.locator('a[data-rr-ui-event-key="unread"]');
    this.readTab = this.modal.locator('a[data-rr-ui-event-key="read"]');
    this.activeTabPane = this.modal.locator('.tab-content .tab-pane.active');
    this.messageBoxes = this.modal.locator('.tab-content .tab-pane.active .message-box');
    this.emptyStateWrapper = this.modal.locator('.tab-content .tab-pane.active .empty-notif-wrapper');
    this.emptyStateHeading = this.modal.locator('.tab-content .tab-pane.active .empty-notif-heading');
    this.showingCountSpan = this.modal.locator('.tab-content .tab-pane.active .notif-show-more span');
    this.showMoreBtn = this.modal.locator('.tab-content .tab-pane.active .notif-show-more button').filter({ hasText: 'Show more' });
  }

  async waitForModalVisible() {
    await this.modal.waitFor({ state: 'visible', timeout: 10000 });
  }

  async close() {
    await this.closeBtn.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async switchToUnreadTab() {
    await this.unreadTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToReadTab() {
    await this.readTab.click();
    await this.page.waitForTimeout(500);
  }

  async getTabCount(tab: 'unread' | 'read'): Promise<number> {
    const tabLocator = tab === 'unread' ? this.unreadTab : this.readTab;
    const text = await tabLocator.innerText();
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getVisibleMessageCount(): Promise<number> {
    return await this.messageBoxes.count();
  }

  async getMessageTitle(index: number = 0): Promise<string> {
    return (await this.messageBoxes.nth(index).locator('.message-content .text-break').first().innerText()).trim();
  }

  async clickMessageView(index: number = 0) {
    const btn = this.messageBoxes.nth(index).locator('button.notif-read-btn, button.notif-read-btn-hide').first();
    await btn.click();
    await this.page.waitForTimeout(600);
  }

  async isMessageExpanded(index: number = 0): Promise<boolean> {
    const box = this.messageBoxes.nth(index);
    if ((await box.count()) === 0) return false;
    const collapsible = box.locator('#collapsible-text');
    if ((await collapsible.count()) === 0) return false;
    const classAttr = (await collapsible.getAttribute('class', { timeout: 3000 }).catch(() => '')) || '';
    return classAttr.includes('show');
  }

  async getMessageDescription(index: number = 0): Promise<string> {
    const desc = this.messageBoxes.nth(index).locator('#collapsible-text');
    return (await desc.innerText()).trim();
  }

  async clickShowMore() {
    await expect(this.showMoreBtn).toBeVisible({ timeout: 10000 });
    const initialCount = await this.getVisibleMessageCount();
    await this.showMoreBtn.click();
    await expect(async () => {
      const newCount = await this.getVisibleMessageCount();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 10000 });
  }

  async getShowingCountNumbers(): Promise<{ showing: number; total: number }> {
    await this.showingCountSpan.waitFor({ state: 'visible', timeout: 10000 });
    const text = await this.showingCountSpan.innerText();
    const match = text.match(/Showing\s+(\d+)\s+of\s+(\d+)/i);
    if (!match) return { showing: 0, total: 0 };
    return {
      showing: parseInt(match[1], 10),
      total: parseInt(match[2], 10)
    };
  }

  async verifyEmptyState(expectedText: string) {
    await expect(this.emptyStateWrapper).toBeVisible({ timeout: 10000 });
    await expect(this.emptyStateHeading).toContainText(expectedText);
  }

  async ensureMinimumUnreadNotifications(adminApi: any, targetEmail: string, requiredCount: number, sampleTitle: string = 'Test Notification', sampleDescription: string = 'Sample test content') {
    const res = await this.page.request.post(`${process.env.PORTAL_URL}/ws/endUserNotifications`, {
      data: { offset: 0, limit: 10, searchText: '', orderByField: 'CREATED_DATE', sortType: 'DESC', isRead: false }
    });
    const data = await res.json().catch(() => null);
    const currentCount = data?.totalCount ?? 0;
    
    if (currentCount < requiredCount) {
      const toSend = requiredCount - currentCount;
      for (let i = 0; i < toSend; i++) {
        await adminApi.sendNotification({
          title: `${sampleTitle} ${Date.now()}_${i}`,
          description: sampleDescription,
          email: targetEmail,
          platform: 'Web'
        });
      }

      await expect(async () => {
        const checkRes = await this.page.request.post(`${process.env.PORTAL_URL}/ws/endUserNotifications`, {
          data: { offset: 0, limit: 10, searchText: '', orderByField: 'CREATED_DATE', sortType: 'DESC', isRead: false }
        });
        const checkData = await checkRes.json().catch(() => null);
        expect(checkData?.totalCount ?? 0).toBeGreaterThanOrEqual(requiredCount);
      }).toPass({ timeout: 15000 });

      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async ensureMinimumReadNotifications(adminApi: any, targetEmail: string, requiredCount: number, sampleTitle: string = 'Test Notification', sampleDescription: string = 'Sample test content') {
    const res = await this.page.request.post(`${process.env.PORTAL_URL}/ws/endUserNotifications`, {
      data: { offset: 0, limit: 10, searchText: '', orderByField: 'CREATED_DATE', sortType: 'DESC', isRead: true }
    });
    const data = await res.json().catch(() => null);
    const currentCount = data?.totalCount ?? 0;

    if (currentCount < requiredCount) {
      const toSend = requiredCount - currentCount;
      for (let i = 0; i < toSend; i++) {
        await adminApi.sendNotification({
          title: `${sampleTitle} Read_${Date.now()}_${i}`,
          description: sampleDescription,
          email: targetEmail,
          platform: 'Web'
        });
      }

      await expect(async () => {
        const unreadRes = await this.page.request.post(`${process.env.PORTAL_URL}/ws/endUserNotifications`, {
          data: { offset: 0, limit: toSend + 10, searchText: '', orderByField: 'CREATED_DATE', sortType: 'DESC', isRead: false }
        });
        const unreadData = await unreadRes.json().catch(() => null);
        const items = unreadData?.data || [];
        expect(items.length).toBeGreaterThanOrEqual(toSend);
        for (const item of items.slice(0, toSend)) {
          await this.page.request.get(`${process.env.PORTAL_URL}/ws/readNotification?notificationId=${item.id}`);
        }
      }).toPass({ timeout: 15000 });

      await expect(async () => {
        const checkRes = await this.page.request.post(`${process.env.PORTAL_URL}/ws/endUserNotifications`, {
          data: { offset: 0, limit: 10, searchText: '', orderByField: 'CREATED_DATE', sortType: 'DESC', isRead: true }
        });
        const checkData = await checkRes.json().catch(() => null);
        expect(checkData?.totalCount ?? 0).toBeGreaterThanOrEqual(requiredCount);
      }).toPass({ timeout: 15000 });

      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }
}

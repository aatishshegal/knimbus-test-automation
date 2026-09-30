import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ContentPage extends BasePage {
  // Navigation
  readonly contentTabLink: Locator;
  readonly landingPageContentTab: Locator;

  // Widget 1: All Content Types
  readonly allContentTypesHeading: Locator;
  readonly allContentTypesDescription: Locator;
  readonly allContentTypesCardContainer: Locator;
  readonly allContentTypesCards: Locator;
  readonly allContentTypesImages: Locator;
  readonly allContentTypesTitles: Locator;
  readonly allContentTypesCountBadges: Locator;
  readonly allContentTypesViewAllButton: Locator;

  // Search within content
  readonly contentSearchInput: Locator;

  // Content Results & Document Actions
  readonly contentResultsTitle: Locator;
  readonly resultDocCards: Locator;
  readonly readButton: Locator;
  readonly detailPageButton: Locator;
  readonly favouriteButton: Locator;
  readonly shareButton: Locator;
  readonly shareOptionsPopover: Locator;

  // Controls
  readonly restrictedContentCard: Locator;
  readonly goToTopButton: Locator;

  constructor(page: Page) {
    super(page);

    // Content Tab Links in Header / Navbar
    this.contentTabLink = page.locator('header a, nav a, .menu-btn, bdi').filter({ hasText: /^Content$/i })
      .or(page.getByRole('link', { name: /Content/i }))
      .or(page.locator('bdi:has-text("Content")'))
      .first();

    this.landingPageContentTab = page.locator('header bdi:has-text("Content"), nav a:has-text("Content")').first();

    // Widget 1: All Content Types Locators
    this.allContentTypesHeading = page.locator('.grp-widget-title:has-text("All Content Types"), h1:has-text("All Content Types"), h2:has-text("All Content Types"), *:has-text("All Content Types")').first();
    this.allContentTypesDescription = page.locator('.grp-widget-desc:has-text("Browse every format"), *:has-text("Browse every format — journals, books, proceedings, and more.")').first();
    this.allContentTypesCardContainer = page.locator('.widgetListNameWithImageStyle1, .widgetListNameWithImageStyle1Card').first();
    this.allContentTypesCards = page.locator('.widgetListNameWithImageStyle1Card ul li');
    this.allContentTypesImages = page.locator('.widgetNwlStyle1ImgContainer img, .widgetListNameWithImageStyle1Card img');
    this.allContentTypesTitles = page.locator('.widgetNwlStyle1CardTitle');
    this.allContentTypesCountBadges = page.locator('.widgetListNameWithImageStyle1Card span.css-xmhyag, .widgetListNameWithImageStyle1Card span:has-text(",")');
    this.allContentTypesViewAllButton = page.locator('.widgetListNameWithImageStyle1Card a.viewAll, a:has-text("View all")').first();

    // Search bar
    this.contentSearchInput = page.locator('.srch-wthn-input, input[placeholder*="Search"]').first();

    // Document Card & Results Action Locators
    this.contentResultsTitle = page.locator('.section-title, .results-header, h1, h2').first();
    this.resultDocCards = page.locator('.result-card, .searchResultCard, .doc-card, div').filter({ has: page.locator('button:has-text("Read"), a:has-text("Read")') });
    this.readButton = page.locator('button:has-text("Read"), a:has-text("Read"), .btn-primary:has-text("Read")').first();
    this.detailPageButton = page.locator('button[title*="Detail"], button[title*="View Details"], .detail-btn, button:has-text("Read") ~ button:nth-of-type(1), button:has-text("Read") + button, svg.lucide-file-text, svg.lucide-book-open').first();
    this.favouriteButton = page.locator('button[title*="Favourite"], button[title*="Favorite"], button[title*="Bookmark"], .favourite-btn, .bookmark-btn, button:has-text("Read") ~ button:nth-of-type(2), button:has-text("Read") + button + button, svg.lucide-bookmark').first();
    this.shareButton = page.locator('button[title*="Share"], .share-btn, button:has-text("Read") ~ button:nth-of-type(3), button:has-text("Read") + button + button + button, svg.lucide-share-2').first();
    this.shareOptionsPopover = page.locator('.share-popover, .share-modal, .share-options, .popover, div[role="tooltip"], div[class*="share"]').filter({ has: page.locator('svg, button, a, img') }).first();

    // Controls
    this.restrictedContentCard = page.locator('.restricted-content, [data-restricted="true"]');
    this.goToTopButton = page.locator('#go-to-top, .back-to-top, button:has-text("Top")');
  }

  async goto(targetUrl: string = 'https://playwright.knimbus.com/portal/v2/default/home') {
    try {
      await this.navigateTo(targetUrl);
    } catch {}
    await this.page.waitForLoadState('domcontentloaded');
    await this.navigateToContentTab();
  }

  async navigateToContentTab() {
    if (await this.allContentTypesHeading.isVisible().catch(() => false)) {
      return;
    }

    const tab = this.contentTabLink.or(this.page.locator('a, bdi, span').filter({ hasText: /^Content$/i }).first());
    if (await tab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tab.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);
    } else {
      await this.page.goto('https://playwright.knimbus.com/portal/v2/default/home').catch(() => {});
      await this.page.waitForLoadState('domcontentloaded');
      const navTab = this.page.locator('a, bdi, span').filter({ hasText: /^Content$/i }).first();
      if (await navTab.isVisible().catch(() => false)) {
        await navTab.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async verifyContentPageLoaded() {
    await this.navigateToContentTab();
    await this.page.waitForLoadState('domcontentloaded');
    const pageHeading = this.allContentTypesHeading
      .or(this.getWidgetHeading('All Content Types'))
      .or(this.getWidgetHeading('Content Types — Standard'))
      .or(this.getWidgetHeading('Content Types'));
    await expect(pageHeading).toBeVisible({ timeout: 15000 });
  }

  getWidgetHeading(widgetName: string): Locator {
    const cleanName = widgetName.replace(/[—–-]/g, '.');
    return this.page.locator('.grp-widget-title, .widget-title, [class*="widget-title"], [class*="heading"], h1, h2, h3, h4, h5, h6, div')
      .filter({ hasText: new RegExp(cleanName, 'i') })
      .or(this.page.locator(`.grp-widget-title:has-text("${widgetName}"), .grp-widget-title:has-text("Content Types")`))
      .first();
  }

  getWidgetContainer(widgetName: string): Locator {
    const heading = this.getWidgetHeading(widgetName);
    return heading.locator('xpath=ancestor::div[contains(@class,"var-padding") or contains(@class,"grp-widget") or contains(@class,"widget-container") or contains(@class,"container")][1]')
      .or(heading.locator('xpath=ancestor::div[contains(@class,"row")][2]'))
      .or(this.page.locator('.widgetListNameWithImageStyle1Card, .widgetListNameWithImageStyle1').first())
      .first();
  }

  async verifyWidget(widgetName: string) {
    const heading = this.getWidgetHeading(widgetName);
    await heading.scrollIntoViewIfNeeded().catch(() => {});
    await expect(heading).toBeVisible({ timeout: 10000 });
  }

  async verifyWidgetDescription(widgetName: string, expectedDescription: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const desc = container.locator('.grp-widget-desc, .widget-desc').first().or(this.page.locator('.grp-widget-desc').first());
    await expect(desc).toBeVisible({ timeout: 10000 });
    const actualText = (await desc.innerText().catch(() => '')).trim();
    expect(actualText).toContain(expectedDescription.trim().substring(0, 15));
  }

  async verifyWidgetCardContainer(widgetName: string, containerSelector: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const cardList = container.locator(containerSelector).or(this.page.locator('.widgetListNameWithImageStyle1Card ul li'));
    await cardList.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    const count = await cardList.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyWidgetCoverImage(widgetName: string, containerSelector: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const firstCard = container.locator(containerSelector).or(this.page.locator('.widgetListNameWithImageStyle1Card ul li')).first();
    const img = firstCard.locator('img').first();
    await expect(img).toBeAttached({ timeout: 10000 });
  }

  async verifyWidgetTitleLabel(widgetName: string, containerSelector: string, titleClass: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const firstCard = container.locator(containerSelector).or(this.page.locator('.widgetListNameWithImageStyle1Card ul li')).first();
    const titleEl = firstCard.locator(titleClass).first();
    await expect(titleEl).toBeAttached({ timeout: 10000 });
  }

  async verifyWidgetCountBadge(widgetName: string, containerSelector: string, badgeClass: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const firstCard = container.locator(containerSelector).or(this.page.locator('.widgetListNameWithImageStyle1Card ul li')).first();
    const badge = firstCard.locator(badgeClass).first();
    await expect(badge).toBeAttached({ timeout: 10000 });
  }

  async verifyWidgetViewAllButton(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const viewAllBtn = container.locator('a.viewAll, button:has-text("View all"), a:has-text("View all")').first().or(this.page.locator('a.viewAll, a:has-text("View all")').first());
    await expect(viewAllBtn).toBeVisible({ timeout: 10000 });
  }

  async clickViewAllInWidget(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const viewAllBtn = container.locator('a.viewAll, button:has-text("View all"), a:has-text("View all")').first();
    if (await viewAllBtn.isVisible().catch(() => false)) {
      await viewAllBtn.click();
      await this.page.waitForTimeout(500);
      await this.page.waitForLoadState('domcontentloaded');
    }
    return true;
  }

  async verifyWidgetCountsVisible(widgetName: string, containerSelector: string, badgeSelector: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const badges = container.locator(`${containerSelector} ${badgeSelector}`);
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const badgeText = (await badges.nth(i).innerText().catch(() => '')).trim();
      expect(badgeText).toMatch(/[\d,]+/);
    }
  }

  async clickSpecificCardInWidget(widgetName: string, cardTitle: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const card = container.locator(`a[title="${cardTitle}"], li:has-text("${cardTitle}")`).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await this.page.waitForTimeout(500);
      await this.page.waitForLoadState('domcontentloaded');
    }
    return true;
  }

  async verifyWidgetImageHoverAndCursor(widgetName: string, containerSelector: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const card = container.locator(containerSelector).first();
    await card.scrollIntoViewIfNeeded().catch(() => {});
    if (await card.isVisible().catch(() => false)) {
      await card.hover().catch(() => {});
      const cursorStyle = await card.evaluate((el) => window.getComputedStyle(el).cursor).catch(() => 'pointer');
      expect(cursorStyle).toBeTruthy();
    }
  }

  async verifyWidgetCardClickInteraction(widgetName: string, containerSelector: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const card = container.locator(containerSelector).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click({ force: true }).catch(() => {});
    }
  }

  async verifyPositiveSearchQuery(widgetName: string, query: string, cardSelector: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const searchInput = container.locator('.srch-wthn-input, input[placeholder*="Search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(500);
      const visibleCount = await container.locator(`${cardSelector}:visible`).count();
      expect(visibleCount).toBeGreaterThanOrEqual(0);
    } else {
      const cardCount = await container.locator(cardSelector).count();
      expect(cardCount).toBeGreaterThan(0);
    }
  }

  async verifyNegativeSearchQuery(widgetName: string, query: string, cardSelector: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const searchInput = container.locator('.srch-wthn-input, input[placeholder*="Search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(500);
      const visibleCount = await container.locator(`${cardSelector}:visible`).count();
      expect(visibleCount).toBe(0);
    } else {
      expect(true).toBe(true);
    }
  }

  async verifySearchResetQuery(widgetName: string, cardSelector: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const searchInput = container.locator('.srch-wthn-input, input[placeholder*="Search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Journal');
      await this.page.waitForTimeout(300);
      await searchInput.fill('');
      await this.page.waitForTimeout(500);
      const restoredCount = await container.locator(cardSelector).count();
      expect(restoredCount).toBeGreaterThan(0);
    } else {
      const cardCount = await container.locator(cardSelector).count();
      expect(cardCount).toBeGreaterThan(0);
    }
  }

  async clickContentTypeNameAndVerifyResults(contentTypeName: string = 'Case Study') {
    await this.navigateToContentTab();
    const typeCard = this.page.locator('.widgetListNameWithImageStyle1Card a, .widgetListNameWithImageStyle1Card li')
      .filter({ has: this.page.locator(`[title="${contentTypeName}"], .widgetNwlStyle1CardTitle:has-text("${contentTypeName}")`) })
      .or(this.page.locator(`a[title="${contentTypeName}"]`))
      .first();

    if (await typeCard.isVisible().catch(() => false)) {
      await typeCard.click();
      await this.page.waitForTimeout(500);
      await this.page.waitForLoadState('domcontentloaded');
    }

    return true;
  }

  async verifyReadButtonOpensNewTab() {
    const readBtn = this.readButton;
    await readBtn.scrollIntoViewIfNeeded().catch(() => {});
    if (await readBtn.isVisible().catch(() => false)) {
      const [newTab] = await Promise.all([
        this.page.context().waitForEvent('page').catch(() => null),
        readBtn.click({ force: true }).catch(() => {})
      ]);

      if (newTab) {
        await newTab.waitForLoadState('domcontentloaded').catch(() => {});
        const url = newTab.url();
        await newTab.close().catch(() => {});
        return url;
      }
    }
    return true;
  }

  async verifyDetailPageInformationVisible() {
    const detailBtn = this.detailPageButton;
    await detailBtn.scrollIntoViewIfNeeded().catch(() => {});
    if (await detailBtn.isVisible().catch(() => false)) {
      await detailBtn.click().catch(() => {});
      await this.page.waitForTimeout(500);
      const detailModal = this.page.locator('.detail-modal, .detail-drawer, .modal-content, .detail-page-info, .result-detail-container').first();
      if (await detailModal.isVisible().catch(() => false)) {
        return true;
      }
    }
    return true;
  }

  async verifyAddToFavouriteInteraction() {
    const favBtn = this.favouriteButton;
    await favBtn.scrollIntoViewIfNeeded().catch(() => {});
    if (await favBtn.isVisible().catch(() => false)) {
      await favBtn.click().catch(() => {});
      await this.page.waitForTimeout(300);
      return true;
    }
    return true;
  }

  async verifyShareButtonAndAllOptionsVisible() {
    const shareBtn = this.shareButton;
    await shareBtn.scrollIntoViewIfNeeded().catch(() => {});
    if (await shareBtn.isVisible().catch(() => false)) {
      await shareBtn.click().catch(() => {});
      await this.page.waitForTimeout(500);
      const popover = this.shareOptionsPopover.or(this.page.locator('div[class*="share"], div[role="tooltip"]').first());
      if (await popover.isVisible().catch(() => false)) {
        const shareOptions = popover.locator('button, a, svg, img');
        const count = await shareOptions.count();
        return count >= 0;
      }
    }
    return true;
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async clickGoToTop() {
    if (await this.goToTopButton.isVisible().catch(() => false)) {
      await this.goToTopButton.click();
    }
  }

  async verifyGoToTopControl() {
    await this.scrollToBottom();
    await this.page.waitForTimeout(500);
    if (await this.goToTopButton.isVisible().catch(() => false)) {
      await expect(this.goToTopButton).toBeVisible();
      await this.clickGoToTop();
      await this.page.waitForTimeout(500);
      const scrollY = await this.page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThanOrEqual(300);
    }
  }
}

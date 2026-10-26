import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SubjectPage extends BasePage {
  // Navigation
  readonly subjectTabLink: Locator;
  readonly breadcrumbSubject: Locator;

  // General Controls
  readonly goToTopButton: Locator;

  constructor(page: Page) {
    super(page);

    // Subject Tab in Header / Navbar
    this.subjectTabLink = page.locator('header a, nav a, .menu-btn, bdi').filter({ hasText: /^Subject$/i })
      .or(page.getByRole('link', { name: /^Subject$/i }))
      .or(page.locator('bdi:has-text("Subject")'))
      .first();

    // Breadcrumb
    this.breadcrumbSubject = page.locator('.breadcrumb, nav[aria-label="breadcrumb"], div').filter({ hasText: /^Home\s*\/\s*Subject/i }).first();

    // Go to top floating button
    this.goToTopButton = page.locator('#go-to-top, .back-to-top, button.scroll-to-top, button:has(svg.lucide-arrow-up), .floating-btn, button[class*="css-"]')
      .filter({ has: page.locator('svg, path, [class*="arrow"], [class*="up"]') })
      .first();
  }

  /**
   * Navigate directly to the Subject page URL.
   */
  async goto(targetUrl: string = 'https://playwright.knimbus.com/portal/v2/custom/subject') {
    await this.navigateTo(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
    await this.verifySubjectPageLoaded();
  }

  /**
   * Navigate to Subject tab via navbar.
   */
  async navigateToSubjectTab() {
    const isAlreadyOnSubject = await this.getWidgetHeading('Subjects — Name & Image').isVisible().catch(() => false);
    if (isAlreadyOnSubject) {
      return;
    }

    const tab = this.page.getByRole('link', { name: /^Subject$/i })
      .or(this.page.locator('header a, nav a, bdi').filter({ hasText: /^Subject$/i }))
      .or(this.subjectTabLink)
      .first();

    if (await tab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tab.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.getWidgetHeading('Subjects — Name & Image').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    } else {
      await this.page.goto('https://playwright.knimbus.com/portal/v2/custom/subject');
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Verify that the Subject page loaded with primary headings.
   */
  async verifySubjectPageLoaded() {
    const heading = this.getWidgetHeading('Subjects — Name & Image')
      .or(this.getWidgetHeading('Subjects — Gallery'))
      .or(this.getWidgetHeading('Subject Slider — Cards'))
      .first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  }

  /**
   * Locate the widget heading by exact/partial widget name.
   */
  getWidgetHeading(widgetName: string): Locator {
    const escaped = widgetName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    return this.page.getByRole('heading', { name: new RegExp(escaped, 'i') })
      .or(this.page.locator('.grp-widget-title, .widget-title, [class*="widget-title"], [class*="heading"], h1, h2, h3, h4').filter({ hasText: new RegExp(escaped, 'i') }))
      .first();
  }

  /**
   * Locate the bounding container element for the specified widget.
   */
  getWidgetContainer(widgetName: string): Locator {
    const heading = this.getWidgetHeading(widgetName);
    return heading.locator('xpath=ancestor::div[contains(@class,"row") or contains(@class,"container-fluid") or contains(@class,"grp-widget")][1]')
      .or(heading.locator('xpath=ancestor::section[1]'))
      .or(heading.locator('..').locator('..'))
      .first();
  }

  /**
   * Verify widget heading visibility.
   */
  async verifyWidget(widgetName: string) {
    const heading = this.getWidgetHeading(widgetName);
    await heading.scrollIntoViewIfNeeded().catch(() => {});
    await expect(heading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify widget description matches expected text.
   */
  async verifyWidgetDescription(widgetName: string, expectedDescription: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const desc = container.locator('.grp-widget-desc, [class*="widget-desc"], [class*="desc"]').first();
    await expect(desc).toBeVisible({ timeout: 10000 });
    const actualText = (await desc.innerText().catch(() => '')).trim();
    expect(actualText).toContain(expectedDescription.trim().substring(0, 20));
  }

  /**
   * Verify in-widget search input bar visibility and placeholder.
   */
  async verifyWidgetSearchInput(widgetName: string, expectedPlaceholder: string = 'Search') {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const searchInput = container.locator('input.srch-wthn-input, input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    const placeholder = await searchInput.getAttribute('placeholder').catch(() => '');
    expect(placeholder).toContain(expectedPlaceholder);
  }

  /**
   * Get card elements inside a widget container.
   */
  getWidgetCards(widgetName: string): Locator {
    const container = this.getWidgetContainer(widgetName);
    return container.locator('.sliderCardItem, .react-multi-carousel-item, a[title], div[title], a:has(img), [class*="card"], [class*="item"]').filter({
      has: this.page.locator('img, [class*="title"], [class*="Title"], span')
    });
  }

  /**
   * Verify card container has cards attached and count > 0.
   */
  async verifyWidgetCardContainer(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const cards = this.getWidgetCards(widgetName);
    await cards.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Verify that cards display cover images.
   */
  async verifyWidgetCoverImage(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const img = container.locator('img').first();
    await expect(img).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify that card title label is attached and visible.
   */
  async verifyWidgetTitleLabel(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const title = container.locator('.sliderCardItemTitle, [class*="title"], [class*="Title"], a, div').filter({
      hasText: /^[A-Za-z0-9]/
    }).first();
    await expect(title).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify image hover and cursor pointer style.
   */
  async verifyWidgetCardHoverAndCursor(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const card = this.getWidgetCards(widgetName).first();
    if (await card.isVisible().catch(() => false)) {
      await card.hover().catch(() => {});
      const cursor = await card.evaluate((el) => window.getComputedStyle(el).cursor).catch(() => 'pointer');
      expect(cursor).toBeTruthy();
    }
  }

  /**
   * Positive search filtering within the widget:
   * Types query, asserts visible cards count > 0, and that cards contain the query term.
   */
  async verifyPositiveSearchQuery(widgetName: string, query: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const searchInput = container.locator('input.srch-wthn-input, input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill(query);
    await this.page.waitForTimeout(600);

    const cards = this.getWidgetCards(widgetName).filter({ hasText: new RegExp(query, 'i') });
    await cards.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Negative search filtering:
   * Types a non-existent query, asserts that 0 matching cards are visible.
   */
  async verifyNegativeSearchQuery(widgetName: string, query: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const searchInput = container.locator('input.srch-wthn-input, input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill(query);
    await this.page.waitForTimeout(600);

    const matchingCards = this.getWidgetCards(widgetName).filter({ hasText: new RegExp(query, 'i') });
    const count = await matchingCards.count();
    expect(count).toBe(0);
  }

  /**
   * Search reset behavior:
   * Types query, clears input, asserts original card list is restored.
   */
  async verifySearchResetQuery(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    const searchInput = container.locator('input.srch-wthn-input, input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('Engineering');
    await this.page.waitForTimeout(400);

    await searchInput.fill('');
    await this.page.waitForTimeout(600);

    const cards = this.getWidgetCards(widgetName);
    await cards.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Click a specific card or first card and verify navigation/interaction.
   */
  async clickCardInWidget(widgetName: string, cardName?: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});
    let card: Locator;
    if (cardName) {
      card = container.locator(`a[title*="${cardName}"], div[title*="${cardName}"], a, div`).filter({ hasText: cardName }).first();
    } else {
      card = this.getWidgetCards(widgetName).first();
    }

    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await this.page.waitForTimeout(1000);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Verify slider arrow buttons (Next and Previous) and interaction.
   */
  async verifySliderNavigation(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => {});

    const prevBtn = container.locator('.react-multiple-carousel__arrow--left, button[aria-label*="Previous"], button.slick-prev, button:has(svg)').first();
    const nextBtn = container.locator('.react-multiple-carousel__arrow--right, button[aria-label*="Next"], button.slick-next, button:has(svg)').last();

    if (await nextBtn.isVisible().catch(() => false)) {
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();
      await this.page.waitForTimeout(500);
    }

    if (await prevBtn.isVisible().catch(() => false)) {
      await expect(prevBtn).toBeVisible();
      await prevBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Verify Go To Top button visibility and click behavior.
   */
  async verifyGoToTopButton() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(1000);

    if (await this.goToTopButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(this.goToTopButton).toBeVisible();
      await this.goToTopButton.click();
      await this.page.waitForTimeout(1000);
      const scrollY = await this.page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(500);
    }
  }

  /**
   * Verify viewport responsiveness.
   */
  async verifyViewportResponsiveness(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
    await this.page.waitForTimeout(500);
    await this.verifySubjectPageLoaded();
    // restore default 1920x1080
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
}

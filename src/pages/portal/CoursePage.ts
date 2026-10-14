import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class CoursePage extends BasePage {
  readonly courseNavLink: Locator;
  readonly breadcrumbCourse: Locator;

  constructor(page: Page) {
    super(page);
    this.courseNavLink = page.getByRole('link', { name: 'Course', exact: true });
    this.breadcrumbCourse = page.getByRole('listitem', { name: 'Course' });
  }

  /**
   * Navigates to the Course page from navbar and waits for it to load.
   */
  async goto() {
    console.log('[POM] Navigating to Course Page...');
    await this.courseNavLink.click();
    await this.verifyCoursePageLoaded();
  }

  /**
   * Verifies that the Course page has loaded successfully.
   */
  async verifyCoursePageLoaded() {
    console.log('[POM] Verifying Course Page has loaded...');
    await this.page.waitForURL(/.*\/portal\/v2\/custom\/course.*/, { timeout: 15000 }).catch(() => { });
    await expect(this.page.locator('.grp-widget-title').first()).toBeVisible({ timeout: 20000 });
  }

  /**
   * Helper to retrieve a widget container by its heading text.
   */
  getWidgetContainer(headingName: string): Locator {
    const heading = this.page.locator('.grp-widget-title', { hasText: new RegExp(headingName, 'i') }).first();
    return heading.locator('xpath=ancestor::div[contains(@class, "col-")][2]');
  }

  /**
   * Helper to retrieve clickable card links within a widget container.
   */
  getWidgetCardLinks(headingName: string): Locator {
    const container = this.getWidgetContainer(headingName);
    return container.locator('li a, a.card, div > a')
      .filter({ hasNot: this.page.locator('img[alt="View All"]') })
      .filter({ hasNotText: /^View All$/i })
      .filter({ hasNotText: /^VIEW ALL$/i });
  }

  /**
   * Verifies a widget's visibility, container presence, and card count.
   */
  async verifyWidget(widgetName: string) {
    console.log(`[POM] Verifying Widget: ${widgetName}...`);
    const heading = this.page.locator('.grp-widget-title', { hasText: new RegExp(widgetName, 'i') }).first();
    await expect(heading).toBeVisible();

    const container = this.getWidgetContainer(widgetName);
    await expect(container).toBeVisible();

    const cardLinks = this.getWidgetCardLinks(widgetName);
    const cardCount = await cardLinks.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const card = cardLinks.nth(i);
      await expect(card).toBeVisible();
      const title = await card.getAttribute('title');
      const text = await card.innerText();
      expect((title || text || '').trim().length).toBeGreaterThan(0);
    }
  }

  /**
   * Verifies the Course Directory widget.
   */
  async verifyCourseDirectoryWidget() {
    console.log('[POM] Verifying Course Directory Widget...');
    await this.verifyWidget('Course Directory');
  }

  /**
   * Verifies the Course Gallery widget.
   */
  async verifyCourseGalleryWidget() {
    console.log('[POM] Verifying Course Gallery Widget...');
    await this.verifyWidget('Course Gallery');
  }

  /**
   * Verifies the Course Listing widget.
   */
  async verifyCourseListingWidget() {
    console.log('[POM] Verifying Course Listing Widget...');
    await this.verifyWidget('Course Listing');
  }

  /**
   * Verifies the Course Slider - Cards widget.
   */
  async verifyCourseSliderCardsWidget() {
    console.log('[POM] Verifying Course Slider — Cards Widget...');
    await this.verifyWidget('Course Slider — Cards');
  }

  /**
   * Verifies the Course Slider - Gallery widget.
   */
  async verifyCourseSliderGalleryWidget() {
    console.log('[POM] Verifying Course Slider — Gallery Widget...');
    await this.verifyWidget('Course Slider — Gallery');
  }

  /**
   * Returns an array of Locators representing the card links for a widget.
   */
  async getWidgetCards(headingName: string): Promise<Locator[]> {
    const links = this.getWidgetCardLinks(headingName);
    await links.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => { });
    const count = await links.count();
    const arr: Locator[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(links.nth(i));
    }
    return arr;
  }

  /**
   * Returns the first widget card Locator for a given widget.
   */
  async getFirstWidgetCard(headingName: string): Promise<Locator> {
    return this.getWidgetCardLinks(headingName).first();
  }

  /**
   * Clicks the first widget card.
   */
  async clickFirstWidgetCard(headingName: string) {
    const first = await this.getFirstWidgetCard(headingName);
    await first.scrollIntoViewIfNeeded().catch(() => { });
    try {
      await first.click({ timeout: 5000 });
    } catch {
      await first.evaluate((node: HTMLElement) => node.click());
    }
  }

  /**
   * Returns an array of title strings for cards in a widget.
   */
  async getWidgetCardTitles(widgetName: string): Promise<string[]> {
    const cards = await this.getWidgetCards(widgetName);
    const out: string[] = [];
    for (const card of cards) {
      const titleAttr = await card.getAttribute('title');
      const text = titleAttr || (await card.innerText());
      out.push((text || '').trim());
    }
    return out;
  }

  /**
   * Returns all visible widget titles on the Course page in order.
   */
  async getVisibleWidgetTitles(): Promise<string[]> {
    const titles = this.page.locator('.grp-widget-title');
    await expect.poll(async () => {
      const count = await titles.count();
      if (count === 0) return 0;
      let nonEmpty = 0;
      for (let i = 0; i < count; i++) {
        const raw = ((await titles.nth(i).textContent()) || (await titles.nth(i).innerText()) || '');
        const text = raw.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        if (text.length > 0) nonEmpty++;
      }
      return nonEmpty;
    }, {
      message: 'Waiting for widget titles to render text',
      timeout: 15000
    }).toBeGreaterThan(0);

    const count = await titles.count();
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      const raw = ((await titles.nth(i).textContent()) || (await titles.nth(i).innerText()) || '');
      const t = raw.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
      if (t) {
        out.push(t);
      }
    }
    return out;
  }

  /**
   * Clicks the View all link for a widget.
   */
  async clickWidgetViewAll(widgetName: string) {
    console.log(`[POM] Clicking View All for widget: ${widgetName}`);
    const container = this.getWidgetContainer(widgetName);
    const viewAllLink = container.locator('a.viewAll, a:has-text("View all"), a:has-text("VIEW ALL")').first();
    await expect(viewAllLink).toBeVisible();
    await this.clickElement(viewAllLink, `${widgetName} View All`);
  }

  /**
   * Verifies navigation to Course View All / Results page.
   */
  async verifyViewAllPage() {
    console.log('[POM] Verifying Course View All / Results page...');
    await this.page.waitForURL(/.*(custom\/course|results\/course|viewAll).*/, { timeout: 15000 });
    await expect(this.page.getByText(/Course.*Course Material|Course Material/i).first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Interacts with slider controls (Previous slide / Next slide).
   */
  async clickNextSlide(widgetName?: string) {
    console.log('[POM] Clicking Next Slide button...');
    const container = widgetName
      ? this.getWidgetContainer(widgetName)
      : this.page.locator('.react-multi-carousel-list, [class*="carousel"]').first();
    await container.scrollIntoViewIfNeeded().catch(() => { });
    await container.hover().catch(() => { });

    const nextBtn = container.getByRole('button', { name: /next slide/i })
      .or(this.page.getByRole('button', { name: /next slide/i }))
      .or(container.locator('.react-multiple-carousel__arrow--right'))
      .first();

    if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.click();
    }
  }

  async clickPreviousSlide(widgetName?: string) {
    console.log('[POM] Clicking Previous Slide button...');
    const container = widgetName
      ? this.getWidgetContainer(widgetName)
      : this.page.locator('.react-multi-carousel-list, [class*="carousel"]').first();
    await container.scrollIntoViewIfNeeded().catch(() => { });
    await container.hover().catch(() => { });

    const prevBtn = container.getByRole('button', { name: /previous slide/i })
      .or(this.page.getByRole('button', { name: /previous slide/i }))
      .or(container.locator('.react-multiple-carousel__arrow--left'))
      .first();

    if (await prevBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await prevBtn.click();
    }
  }

  /**
   * Generic verification that clicking a course card navigates or opens details (in tab or same page).
   */
  async verifyWidgetCardNavigation(widgetName: string) {
    const pattern = /results|search|document|detail|course|nptel|edx|coursera|swayam|learn/i;
    await this.page.waitForTimeout(3000);

    const pages = this.page.context().pages();
    let matchedUrl = '';

    for (const p of pages) {
      await p.waitForLoadState('networkidle').catch(() => { });
      const url = p.url();
      if (pattern.test(url)) {
        matchedUrl = url;
        break;
      }
    }

    if (!matchedUrl && pages.length > 0) {
      matchedUrl = pages[pages.length - 1].url();
    }

    expect(matchedUrl, `Expected at least one page URL to match pattern, but latest was: ${matchedUrl}`).toMatch(pattern);
  }

  /**
   * Returns search input locator within a widget container.
   */
  getWidgetSearchInput(widgetName: string): Locator {
    const container = this.getWidgetContainer(widgetName);
    return container.locator('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]');
  }

  /**
   * Searches within a widget container using the query string.
   */
  async searchWidget(widgetName: string, query: string) {
    console.log(`[POM] Searching "${query}" in widget: ${widgetName}...`);
    const searchInput = this.getWidgetSearchInput(widgetName).first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill(query);
  }

  /**
   * Verifies visual card structure (Image and/or text).
   */
  async verifyCardStyle(widgetName: string, style: 'nameAndImage' | 'onlyName' | 'onlyImage') {
    console.log(`[POM] Verifying card style "${style}" for widget: ${widgetName}...`);
    const cards = await this.getWidgetCards(widgetName);
    expect(cards.length).toBeGreaterThan(0);
    const sampleSize = Math.min(cards.length, 5);

    for (let i = 0; i < sampleSize; i++) {
      const card = cards[i];
      const imgCount = await card.locator('img').count();
      const titleAttr = await card.getAttribute('title');
      const textContent = (await card.textContent())?.trim();
      const imgAlt = imgCount > 0 ? await card.locator('img').first().getAttribute('alt') : null;
      const text = (titleAttr || imgAlt || textContent || '').trim();

      if (style === 'nameAndImage') {
        expect(imgCount).toBeGreaterThan(0);
        expect(text).not.toBe('');
      } else if (style === 'onlyName') {
        expect(imgCount).toBe(0);
        expect(text).not.toBe('');
      } else if (style === 'onlyImage') {
        expect(imgCount).toBeGreaterThan(0);
      }
    }
  }

  /**
   * Returns back to Course Page by closing any opened popup tabs or using browser navigation.
   */
  async navigateBackToCoursePage() {
    const pages = this.page.context().pages();
    if (pages.length > 1) {
      console.log(`[POM] Closing ${pages.length - 1} newly opened tab(s) to return to Course Page...`);
      for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
      }
      await this.page.bringToFront();
    }

    if (!this.page.url().includes('/custom/course')) {
      console.log('[POM] Page URL is not Course Page, re-navigating to Course Page...');
      const courseNav = this.page.getByRole('link', { name: 'Course', exact: true });
      if (await courseNav.isVisible().catch(() => false)) {
        await courseNav.click();
      } else {
        await this.page.goto((process.env.PORTAL_URL || 'https://qa-psinstitude.knimbus.com') + '/portal/v2/custom/course');
      }
      await this.page.waitForURL(/.*\/portal\/v2\/custom\/course.*/, { timeout: 15000 }).catch(() => { });
    }
    await this.verifyCoursePageLoaded();
  }

  /**
   * Verifies searching for a valid course title filters cards to matching results only.
   */
  async verifySearchFiltersMatchingResults(widgetName: string, query: string) {
    const searchInput = this.getWidgetSearchInput(widgetName).first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(1000);
      const cards = await this.getWidgetCards(widgetName);
      expect(cards.length).toBeGreaterThan(0);
      for (const card of cards) {
        const title = (await card.getAttribute('title')) || (await card.innerText()) || '';
        expect(title.toLowerCase()).toContain(query.toLowerCase());
      }
    } else {
      console.log(`[POM] Widget "${widgetName}" does not have an inline search input.`);
    }
  }

  /**
   * Verifies searching for a nonexistent term shows empty state or zero matching cards.
   */
  async verifySearchNoMatchingResults(widgetName: string, query: string) {
    const searchInput = this.getWidgetSearchInput(widgetName).first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(1000);
      const cards = await this.getWidgetCards(widgetName);
      const container = this.getWidgetContainer(widgetName);
      const hasEmptyState = await container.getByText(/no.*(record|course|data|found)/i).isVisible().catch(() => false);
      expect(cards.length === 0 || hasEmptyState).toBeTruthy();
    } else {
      console.log(`[POM] Widget "${widgetName}" does not have an inline search input.`);
    }
  }

  /**
   * Clears search and verifies the full card list is restored.
   */
  async verifyResetSearchRestoresCards(widgetName: string, query: string) {
    const searchInput = this.getWidgetSearchInput(widgetName).first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const initialCards = await this.getWidgetCards(widgetName);
      await searchInput.fill(query);
      await this.page.waitForTimeout(1000);
      await searchInput.fill('');
      await this.page.waitForTimeout(1000);
      const restoredCards = await this.getWidgetCards(widgetName);
      expect(restoredCards.length).toBe(initialCards.length);
    } else {
      console.log(`[POM] Widget "${widgetName}" does not have an inline search input.`);
    }
  }

  /**
   * Clicks a card in the specified widget and asserts valid navigation to details/results, then returns.
   */
  async verifyCardNavigationForWidget(widgetName: string) {
    await this.clickFirstWidgetCard(widgetName);
    await this.verifyWidgetCardNavigation(widgetName);
    await this.navigateBackToCoursePage();
    await this.verifyCoursePageLoaded();
  }

  /**
   * Verifies View All navigation and resulting list for supported widgets.
   */
  async verifySupportedWidgetsViewAll(supportedWidgets: string[]) {
    for (const widget of supportedWidgets) {
      await this.clickWidgetViewAll(widget);
      await this.verifyViewAllPage();
      await this.navigateBackToCoursePage();
      await this.verifyCoursePageLoaded();
    }
  }

  /**
   * Verifies slider boundary navigation (Next and Previous controls).
   */
  async verifySliderBoundaries(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    await container.scrollIntoViewIfNeeded().catch(() => { });
    await container.hover().catch(() => { });

    const prevBtn = container.getByRole('button', { name: /previous slide/i })
      .or(this.page.getByRole('button', { name: /previous slide/i }))
      .or(container.locator('.react-multiple-carousel__arrow--left'))
      .first();

    const nextBtn = container.getByRole('button', { name: /next slide/i })
      .or(this.page.getByRole('button', { name: /next slide/i }))
      .or(container.locator('.react-multiple-carousel__arrow--right'))
      .first();

    if (await prevBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await prevBtn.click().catch(() => { });
    }
    if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextBtn.click().catch(() => { });
    }
    await this.verifyWidget(widgetName);
  }

  /**
   * Verifies that course card images load without broken image placeholders.
   */
  async verifyCardImagesLoaded(widgetName: string) {
    const container = this.getWidgetContainer(widgetName);
    const images = container.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    const sample = Math.min(count, 5);
    for (let i = 0; i < sample; i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src!.trim().length).toBeGreaterThan(0);

      const isLoaded = await img.evaluate((el: HTMLImageElement) => {
        return el.complete && el.naturalWidth > 0;
      });
      expect(isLoaded).toBeTruthy();
    }
  }

  /**
   * Verifies responsive layout across desktop, tablet, and mobile viewport sizes.
   */
  async verifyResponsiveLayout(viewport: { width: number; height: number }) {
    console.log(`[POM] Verifying layout at viewport ${viewport.width}x${viewport.height}...`);
    await this.page.setViewportSize(viewport);
    await this.page.waitForTimeout(500);

    await expect(this.page.locator('.grp-widget-title').first()).toBeVisible();

    const hasHorizontalOverflow = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 5;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    // Restore standard desktop viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.page.waitForTimeout(300);
  }

  /**
   * Verifies exact widget ordering matches the expected array sequence.
   */
  async verifyExactWidgetOrdering(expectedOrder: string[]) {
    const actualWidgets = await this.getVisibleWidgetTitles();
    expect(actualWidgets).toEqual(expectedOrder);
  }

  /**
   * Verifies that an unauthenticated guest session displays guest UI with sign-in trigger.
   */
  async verifyUnauthorizedSessionBehavior() {
    const browser = this.page.context().browser();
    if (!browser) return;

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    try {
      await guestPage.goto((process.env.PORTAL_URL || 'https://qa-psinstitude.knimbus.com') + '/portal/v2/custom/course');
      await guestPage.waitForLoadState('networkidle').catch(() => { });
      const signInBtn = guestPage.getByRole('button', { name: 'Sign in' });
      await expect(signInBtn).toBeVisible({ timeout: 15000 });
    } finally {
      await guestContext.close();
    }
  }
}


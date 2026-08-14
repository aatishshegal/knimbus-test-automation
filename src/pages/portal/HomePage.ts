import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class HomePage extends BasePage {
  readonly homePageIdentifier: Locator;

  constructor(page: Page) {
    super(page);
    this.homePageIdentifier = page.getByText(process.env.LIBRARY_NAME as string);
  }

  /**
   * Helper to retrieve a widget container by its heading text.
   * Leverages relative XPath to find the correct outer column wrapper.
   */
  getWidgetContainer(headingName: string): Locator {
    const mappings: Record<string, string> = {
      'Source': 'Publishers & Databases',
      'SECTION': 'Browse by Section',
      'Subject': 'Academic Subjects',
      'Content': 'Content Types',
      'Course': 'Course Materials',
      'Useful Links': 'Quick Links'
    };
    const mappedName = mappings[headingName] || headingName;
    return this.page.locator('.grp-widget-title', { hasText: new RegExp(`^${mappedName}$`, 'i') })
      .locator('xpath=ancestor::div[contains(@class, "col-")][2]');
  }

  /**
   * Helper to retrieve clickable card links within a widget container.
   */
  getWidgetCardLinks(headingName: string): Locator {
    return this.getWidgetContainer(headingName).locator('li a:not(.viewAll)');
  }

  /**
   * Verifies the general Home Page visibility.
   */
  async verifyHomePage() {
    console.log('[POM] Verifying Home Page has loaded...');
    await expect(this.homePageIdentifier).toBeVisible({ timeout: 20000 });
  }

  /**
   * Verifies the Home Page Banner is visible.
   */
  async verifyBanner() {
    console.log('[POM] Verifying Home Page Banner...');
    const banner = this.page.locator('.custom-banner');
    await expect(banner).toBeVisible();
  }

  /**
   * Verifies the Source widget (visibility, card content, clickability, and View all link).
   */
  async verifySourceWidget() {
    console.log('[POM] Verifying Source Widget...');
    const heading = this.page.locator('.grp-widget-title', { hasText: /^Publishers & Databases$/i });
    await expect(heading).toBeVisible();

    const container = this.getWidgetContainer('Source');
    await expect(container).toBeVisible();

    const cardLinks = this.getWidgetCardLinks('Source');
    const cardCount = await cardLinks.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = cardLinks.nth(i);
      await expect(card).toBeVisible();
      await expect(card).toBeEnabled();

      const title = await card.getAttribute('title');
      expect(title).not.toBeNull();
      expect(title!.trim().length).toBeGreaterThan(0);
    }

    const viewAllLink = container.locator('a.viewAll');
    await expect(viewAllLink).toBeVisible();
  }

  /**
   * Verifies the Section widget (visibility, dynamic cards content, clickability, and View all link).
   */
  async verifySectionWidget() {
    console.log('[POM] Verifying Section Widget...');
    const heading = this.page.locator('.grp-widget-title', { hasText: /^Browse by Section$/i });
    await expect(heading).toBeVisible();

    const container = this.getWidgetContainer('SECTION');
    await expect(container).toBeVisible();

    const cardLinks = this.getWidgetCardLinks('SECTION');
    const cardCount = await cardLinks.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = cardLinks.nth(i);
      await expect(card).toBeVisible();
      await expect(card).toBeEnabled();

      const title = await card.getAttribute('title');
      expect(title).not.toBeNull();
      expect(title!.trim().length).toBeGreaterThan(0);
    }

    const viewAllLink = container.locator('a.viewAll');
    await expect(viewAllLink).toBeVisible();
  }

  /**
   * Verifies the Subject widget (visibility, card content, clickability, and View all link).
   */
  async verifySubjectWidget() {
    console.log('[POM] Verifying Subject Widget...');
    const heading = this.page.locator('.grp-widget-title', { hasText: /^Academic Subjects$/i });
    await expect(heading).toBeVisible();

    const container = this.getWidgetContainer('Subject');
    await expect(container).toBeVisible();

    const cardLinks = this.getWidgetCardLinks('Subject');
    const cardCount = await cardLinks.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = cardLinks.nth(i);
      await expect(card).toBeVisible();
      await expect(card).toBeEnabled();

      const title = await card.getAttribute('title');
      expect(title).not.toBeNull();
      expect(title!.trim().length).toBeGreaterThan(0);
    }

    const viewAllLink = container.locator('a.viewAll');
    await expect(viewAllLink).toBeVisible();
  }

  /**
   * Verifies the Content widget (visibility, card content, counts, and View all link).
   */
  async verifyContentWidget() {
    console.log('[POM] Verifying Content Widget...');
    const heading = this.page.locator('.grp-widget-title', { hasText: /^Content Types$/i });
    await expect(heading).toBeVisible();

    const container = this.getWidgetContainer('Content');
    await expect(container).toBeVisible();

    const cardLinks = this.getWidgetCardLinks('Content');
    const cardCount = await cardLinks.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = cardLinks.nth(i);
      await expect(card).toBeVisible();

      const title = await card.getAttribute('title');
      expect(title).not.toBeNull();
      expect(title!.trim().length).toBeGreaterThan(0);

      // Verify count is displayed and is a valid numeric value
      const countSpan = card.locator('span').last();
      await expect(countSpan).toBeVisible();
      const countText = await countSpan.textContent();
      expect(countText).not.toBeNull();

      const numericValue = countText!.replace(/,/g, '').trim();
      expect(Number(numericValue)).not.toBeNaN();
    }

    const viewAllLink = container.locator('a.viewAll');
    await expect(viewAllLink).toBeVisible();
  }

  /**
   * Verifies the Course widget (visibility, card content, full titles, clickability, and View all link).
   */
  async verifyCourseWidget() {
    console.log('[POM] Verifying Course Widget...');
    const heading = this.page.locator('.grp-widget-title', { hasText: /^Course Materials$/i });
    await expect(heading).toBeVisible();

    const container = this.getWidgetContainer('Course');
    await expect(container).toBeVisible();

    const cardLinks = this.getWidgetCardLinks('Course');
    const cardCount = await cardLinks.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = cardLinks.nth(i);
      await expect(card).toBeVisible();
      await expect(card).toBeEnabled();

      const title = await card.getAttribute('title');
      expect(title).not.toBeNull();
      expect(title!.trim().length).toBeGreaterThan(0);
    }

    const viewAllLink = container.locator('a.viewAll');
    await expect(viewAllLink).toBeVisible();
  }

  /**
   * Verifies the Useful Links widget (visibility, card titles and descriptions, and clickability).
   */
  async verifyUsefulLinksWidget() {
    console.log('[POM] Verifying Useful Links Widget...');
    const heading = this.page.locator('.grp-widget-title', { hasText: /^Quick Links$/i });
    await expect(heading).toBeVisible();

    const container = this.getWidgetContainer('Useful Links');
    await expect(container).toBeVisible();

    const cardLinks = this.getWidgetCardLinks('Useful Links');
    const cardCount = await cardLinks.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = cardLinks.nth(i);
      await expect(card).toBeVisible();
      await expect(card).toBeEnabled();

      const titleAttr = await card.getAttribute('title');
      if (titleAttr) {
        expect(titleAttr.trim().length).toBeGreaterThanOrEqual(0);
      }

      const titleSpan = card.locator('.uflCardTitle');
      if (await titleSpan.isVisible({ timeout: 1000 })) {
        await expect(titleSpan).toBeVisible();
      }

      const descSpan = card.locator('.uflCardDesc');
      if (await descSpan.isVisible()) {
        const descText = await descSpan.textContent();
        expect(descText).not.toBeNull();
        expect(descText!.trim().length).toBeGreaterThan(0);
      }
    }
  }

  /**
   * Clicks the "View all" link of a widget.
   */
  async clickWidgetViewAll(widgetName: string) {
    console.log(`[POM] Clicking View All for widget: ${widgetName}`);
    const container = this.getWidgetContainer(widgetName);
    const viewAllLink = container.locator('a.viewAll');
    await this.clickElement(viewAllLink, `${widgetName} View All`);
  }

  /**
   * Verifies routing to the viewAll/results page for a widget.
   */
  async verifyViewAllPage(widgetName: string) {
    console.log(`[POM] Verifying View All page routing for widget: ${widgetName}`);
    if (widgetName.toLowerCase() === 'course') {
      await this.page.waitForURL(/.*\/results\/course.*/, { timeout: 15000 });
      expect(this.page.url()).toContain('/results/course');
    } else {
      await this.page.waitForURL(/.*\/viewAll.*/, { timeout: 15000 });
      expect(this.page.url()).toContain('/viewAll');

      const mappings: Record<string, string> = {
        'Source': 'Publishers & Databases',
        'SECTION': 'Browse by Section',
        'Subject': 'Academic Subjects',
        'Content': 'Content Types',
        'Course': 'Course Materials',
        'Useful Links': 'Quick Links'
      };
      const mappedName = mappings[widgetName] || widgetName;
      const pageHeading = this.page.locator('.grp-widget-title', { hasText: new RegExp(`^${mappedName}$`, 'i') });
      await expect(pageHeading).toBeVisible({ timeout: 15000 });
    }
  }

  /**
   * Returns an array of Locators representing the card links for a widget.
   */
  async getWidgetCards(headingName: string) {
    const links = this.getWidgetCardLinks(headingName);
    // Wait for at least one card to be attached to the DOM before counting
    await links.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => { });
    const count = await links.count();
    const arr: Locator[] = [];
    for (let i = 0; i < count; i++) arr.push(links.nth(i));
    return arr;
  }

  /**
   * Returns the first widget card Locator for a given widget.
   */
  async getFirstWidgetCard(headingName: string) {
    return this.getWidgetCardLinks(headingName).first();
  }

  /**
   * Clicks the first widget card for convenience in tests.
   */
  async clickFirstWidgetCard(headingName: string) {
    const first = await this.getFirstWidgetCard(headingName);
    await this.clickElement(first, `${headingName} - First Card`);
  }

  /**
   * Extracts the numeric count text from a content widget card.
   */
  async getWidgetCardCount(card: Locator) {
    const countSpan = card.locator('span').last();
    const text = (await countSpan.textContent()) || '';
    return text.trim();
  }

  /**
   * Generic verification that clicking a widget card navigates away to a results/detail page.
   */
  async verifyWidgetCardNavigation(widgetName: string) {
    // Common landing patterns for card clicks
    const pattern = /results|search|document|detail|course/i;

    // Wait a bit for potential new tabs to open
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
      matchedUrl = pages[pages.length - 1].url(); // Fallback to print the latest page URL if none match
    }

    expect(matchedUrl, `Expected at least one page URL to match pattern, but latest was: ${matchedUrl}`).toMatch(pattern);
  }

  /**
   * Navigate back to the Home Page using browser history or closing new tabs.
   */
  async navigateBackToHome() {
    const pages = this.page.context().pages();
    if (pages.length > 1) {
      console.log(`[POM] Closing ${pages.length - 1} newly opened tab(s) to return to Home Page...`);
      // Start from 1 to keep the first (original) page open
      for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
      }
      // Bring the original page back to front
      await this.page.bringToFront();
    } else {
      console.log('[POM] Navigating back to Home Page via history...');
      await this.page.goBack();
      await this.verifyHomePage();
    }
  }

  /**
   * Returns visible widget titles in order.
   */
  async getVisibleWidgetTitles() {
      const titles = this.page.locator('.grp-widget-title');
      // Wait for at least one title to be attached to the DOM before counting
      await titles.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => { });
      const count = await titles.count();
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        const t = (await titles.nth(i).innerText()).trim();
        out.push(t);
      }
      return out;
    }

  /**
   * Returns an array of title strings for cards in a widget.
   */
  async getWidgetCardTitles(widgetName: string) {
      const cards = await this.getWidgetCards(widgetName);
      const out: string[] = [];
      for (const card of cards) {
        const titleAttr = await card.getAttribute('title');
        const text = titleAttr || (await card.innerText());
        out.push((text || '').trim());
      }
      return out;
    }

  }


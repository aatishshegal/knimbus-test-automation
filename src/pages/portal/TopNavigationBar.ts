import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TopNavigationBar extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchDropdown: Locator;
  readonly notificationIcon: Locator;
  readonly languageSelector: Locator;
  readonly profileDropdown: Locator;
  
  // Menu items
  readonly menuSource: Locator;
  readonly menuSection: Locator;
  readonly menuSubject: Locator;
  readonly menuContent: Locator;
  readonly menuCourse: Locator;
  readonly menuAZList: Locator;
  readonly menuResearch: Locator;
  readonly menuSubAdmin: Locator;
  readonly menuArticleRequest: Locator;
  readonly menuFeedback: Locator;
  readonly menuPersonalList: Locator;

  constructor(page: Page) {
    super(page);
    // General top bar elements
    this.searchInput = page.locator('input[name="globalSerchItem"]');
    // The search button loses its class when active, but the SVG id remains constant
    this.searchButton = page.locator('button').filter({ has: page.locator('#srcIcon') });
    this.searchDropdown = page.locator('select.css-fwy7yy').or(page.locator('select').filter({ has: page.locator('option[value="doc_title"]') })).first();
    // The actual notification bell icon locator based on the provided HTML
    this.notificationIcon = page.locator('.notification-badge').first();
    this.languageSelector = page.locator('#google_translate_element select');
    this.profileDropdown = page.locator('.profile-dropdwn-toggle');

    // Menu bar
    this.menuSource = page.locator('a.menu-btn').filter({ hasText: 'Source' });
    this.menuSection = page.locator('a.menu-btn').filter({ hasText: 'Section' });
    this.menuSubject = page.locator('a.menu-btn').filter({ hasText: 'Subject' });
    this.menuContent = page.locator('a.menu-btn').filter({ hasText: 'Content' });
    this.menuCourse = page.getByText('Course', { exact: true });
    this.menuAZList = page.locator('a.menu-btn').filter({ hasText: 'A-Z List' });
    this.menuResearch = page.getByText('Research+', { exact: true });
    this.menuSubAdmin = page.getByText('Sub Admin+', { exact: true });
    this.menuArticleRequest = page.getByText('Article Request Form', { exact: true });
    this.menuFeedback = page.getByText('Feedback Form', { exact: true });
    this.menuPersonalList = page.getByText('Personal List', { exact: true });
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async openProfileMenu() {
    await this.profileDropdown.click();
  }
}

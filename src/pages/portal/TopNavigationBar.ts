import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TopNavigationBar extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchDropdown: Locator;
  readonly notificationIcon: Locator;
  readonly languageSelector: Locator;
  readonly profileDropdown: Locator;
  
  // Profile Dropdown items
  readonly profileName: Locator;
  readonly profileEmail: Locator;
  readonly profileMenuProfileLink: Locator;
  readonly profileMenuMyLibraryLink: Locator;
  readonly profileMenuLibrarianDashboardLink: Locator;
  readonly profileMenuLogoutLink: Locator;
  
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
    this.searchButton = page.locator('button').filter({ has: page.locator('#srcIcon') }).filter({ visible: true });
    this.searchDropdown = page.locator('select.css-fwy7yy').or(page.locator('select').filter({ has: page.locator('option[value="doc_title"]') })).filter({ visible: true }).first();
    // The actual notification bell icon locator based on the provided HTML
    this.notificationIcon = page.locator('.notification-badge').filter({ visible: true }).first();
    this.languageSelector = page.locator('#google_translate_element select').filter({ visible: true });
    this.profileDropdown = page.locator('.profile-dropdwn-toggle').filter({ visible: true }).first();
    
    // Profile Dropdown Locators
    this.profileName = page.locator('.profile-info-name');
    this.profileEmail = page.locator('.profile-info-email');
    this.profileMenuProfileLink = page.locator('.profile-item').filter({ hasText: 'Profile' }).first();
    this.profileMenuMyLibraryLink = page.locator('.profile-item').filter({ hasText: 'My Library' }).first();
    this.profileMenuLibrarianDashboardLink = page.locator('.profile-item').filter({ hasText: 'Librarian Dashboard' }).first();
    this.profileMenuLogoutLink = page.locator('.profile-item').filter({ hasText: 'Logout' }).first();

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
    
    // Wait for the search results page to begin loading
    await this.page.waitForURL(/search/i, { timeout: 15000 }).catch(() => {});
    
    // Workaround: Aggressively dismiss the auto-suggestion dropdown.
    // Ensure the input has focus so it catches the Escape key event.
    await this.searchInput.focus().catch(() => {});
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Escape');
    
    // Finally, remove focus
    await this.searchInput.blur().catch(() => {});
    
    // Click a neutral spot to ensure any overlay is gone
    await this.page.mouse.click(10, 10);
  }

  async openProfileMenu() {
    await this.profileDropdown.click();
  }

  async navigateToMyLibrary() {
    await this.openProfileMenu();
    await this.profileMenuMyLibraryLink.click();
    // Removed networkidle wait because it causes flaky timeouts when background requests linger
    await this.page.waitForURL(/my-library/i, { timeout: 15000 }).catch(() => {});
  }
}

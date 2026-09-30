import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TopNavigationBar extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchDropdown: Locator;
  readonly notificationIcon: Locator;
  readonly notificationCountBadge: Locator;
  readonly languageSelector: Locator;
  readonly profileDropdown: Locator;
  
  readonly autoSuggestionBox: Locator;
  readonly autoSuggestionItems: Locator;
  
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
    this.searchDropdown = page.locator('select').filter({ has: page.locator('option[value="doc_title"]') }).first();
    // The actual notification bell icon locator based on the provided HTML
    this.notificationIcon = page.locator('.notification-badge').filter({ visible: true }).first();
    this.notificationCountBadge = page.locator('.notification-badge .notification-count');
    this.languageSelector = page.locator('#google_translate_element select');
    this.profileDropdown = page.locator('.profile-dropdwn-toggle, #basic-nav-dropdown, .profile-dropdown').first();
    this.autoSuggestionBox = page.locator('div.suggested-result').first();
    this.autoSuggestionItems = page.locator('div.suggested-result li.list-group-item');
    
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

  async typeSearchWithSuggestions(term: string) {
    await this.searchInput.click();
    await this.searchInput.clear();
    const suggestResponsePromise = this.page.waitForResponse(
      response => response.url().includes('/getAutoSuggestSearch') && response.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);
    await this.searchInput.pressSequentially(term, { delay: 100 });
    await suggestResponsePromise;
    await this.autoSuggestionBox.waitFor({ state: 'visible', timeout: 15000 });
  }

  async openProfileMenu() {
    await this.page.locator('.overlay').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // Auto-dismiss T&C popup if it rendered asynchronously
    const tcCheckbox = this.page.locator('#termsAccepted, .term-and-condition-check-box').first();
    if (await tcCheckbox.isVisible().catch(() => false)) {
      const label = this.page.locator('label[for="termsAccepted"], .term-and-condition-check-box-label').first();
      if (await label.count() > 0 && await label.isVisible().catch(() => false)) {
        await label.click({ force: true });
      } else {
        await tcCheckbox.check({ force: true }).catch(() => {});
      }
      const acceptBtn = this.page.getByRole('button', { name: /Accept|I Agree|Continue|Next/i }).last();
      if (await acceptBtn.isVisible().catch(() => false)) {
        await acceptBtn.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(500);
      }
    }

    await this.profileDropdown.waitFor({ state: 'visible', timeout: 15000 });
    await this.profileDropdown.click({ force: true });
    try {
      await this.profileMenuProfileLink.waitFor({ state: 'visible', timeout: 2000 });
    } catch {
      await this.profileDropdown.click({ force: true });
      await this.profileMenuProfileLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }
  }

  async navigateToProfile() {
    await this.openProfileMenu();
    await this.profileMenuProfileLink.click({ force: true });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToMyLibrary() {
    await this.openProfileMenu();
    await this.profileMenuMyLibraryLink.click();
    await this.page.waitForURL(/myLibrary|my-library/i, { timeout: 15000 }).catch(() => {});
  }

  async verifyLibrarianDashboardVisibility(shouldBeVisible: boolean) {
    if (shouldBeVisible) {
      await expect(this.profileMenuLibrarianDashboardLink).toBeVisible();
    } else {
      await expect(this.profileMenuLibrarianDashboardLink).toBeHidden();
    }
  }

  async selectLanguage(value: string) {
    await this.languageSelector.click();
    await this.languageSelector.locator(`option[value="${value}"]`).waitFor({ state: 'attached', timeout: 20000 });
    await this.languageSelector.selectOption({ value });
  }

  async resetLanguageToDefault(defaultLabel: string) {
    const optionsText = await this.languageSelector.locator('option').allInnerTexts();
    const hasDefault = optionsText.some(t => t.trim() === defaultLabel);
    await this.languageSelector.selectOption({ label: hasDefault ? defaultLabel : 'Select Language' });
  }

  async openNotificationModal() {
    await this.page.locator('.overlay').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // Auto-dismiss T&C popup if it rendered asynchronously
    const tcCheckbox = this.page.locator('#termsAccepted, .term-and-condition-check-box').first();
    if (await tcCheckbox.isVisible().catch(() => false)) {
      await tcCheckbox.check({ force: true }).catch(() => {});
      const acceptBtn = this.page.getByRole('button', { name: /Accept|I Agree|Continue|Next/i }).last();
      if (await acceptBtn.isVisible().catch(() => false)) {
        await acceptBtn.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(500);
      }
    }

    await this.notificationIcon.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.evaluate(() => {
      const gTranslate = document.getElementById('google_translate_element');
      if (gTranslate) gTranslate.style.display = 'none';
      const skiptranslate = document.querySelector('.skiptranslate');
      if (skiptranslate) (skiptranslate as HTMLElement).style.display = 'none';
    }).catch(() => {});
    await this.notificationIcon.click({ force: true });
    await this.page.locator('.modal.show').filter({ has: this.page.locator('.notif-title') }).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async getNotificationBadgeCount(): Promise<number> {
    if (await this.notificationCountBadge.isVisible()) {
      const text = (await this.notificationCountBadge.innerText()).trim();
      return parseInt(text, 10) || 0;
    }
    return 0;
  }
}

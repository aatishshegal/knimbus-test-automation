import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DetailPage extends BasePage {
  readonly documentTitle: Locator;
  readonly readButton: Locator;
  readonly favoriteButton: Locator;
  readonly shareIcon: Locator;
  readonly shareMenuContainer: Locator;
  readonly toastNotification: Locator;

  constructor(page: Page) {
    super(page);
    
    // Locators based on the live DOM
    this.documentTitle = page.locator('h5.card-title').first();
    this.readButton = page.locator('button[title="Read"]').first();
    this.favoriteButton = page.locator('button[title*="favourite"]').first();
    this.shareIcon = page.locator('a.share-circle-icon[title="Share"]').first();
    
    // Share menu popover/modal that appears after clicking share
    this.shareMenuContainer = page.locator('.share-menu, .dropdown-menu.show, .social-share, .popover, [role="menu"], [role="dialog"], .MuiPopover-root, .share-box, .share-container').first();
    
    // Standard toast notification for favorites
    this.toastNotification = page.getByRole('alert').first();
  }

  /**
   * Retrieves the document title text
   */
  async getDocumentTitle(): Promise<string> {
    await this.documentTitle.waitFor({ state: 'visible', timeout: 10000 });
    return (await this.documentTitle.innerText()).trim();
  }

  /**
   * Checks if Read button is visible and clickable
   */
  async isReadButtonReady(): Promise<boolean> {
    return await this.readButton.isVisible() && await this.readButton.isEnabled();
  }

  /**
   * Clicks the favorite button
   */
  async toggleFavorite() {
    await this.favoriteButton.click();
  }

  /**
   * Clicks the share icon
   */
  async clickShare() {
    await this.shareIcon.click();
  }
}

import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SectionPage extends BasePage {
  // Navigation
  readonly sectionTabLink: Locator;
  readonly landingPageSectionTab: Locator;

  // Widget 1: Section Only Image
  readonly onlyImageStandardWidgetHeading: Locator;
  readonly sectionOnlyImageHeading: Locator;
  readonly onlyImageCards: Locator;
  readonly sectionOnlyImageCards: Locator;
  readonly sectionOnlyImageSearchInput: Locator;
  readonly onlyImageHoverNames: Locator;
  readonly onlyImageViewAllButton: Locator;

  // Widget 2: Section Name & Image
  readonly nameWithImageStandardWidgetHeading: Locator;
  readonly sectionNameAndImageHeading: Locator;
  readonly nameWithImageCards: Locator;
  readonly sectionNameAndImageCards: Locator;
  readonly sectionNameAndImageViewAll: Locator;

  // Widget 3: Section (Only Name)
  readonly onlyNameStandardWidgetHeading: Locator;
  readonly sectionOnlyNameHeading: Locator;
  readonly onlyNamePills: Locator;
  readonly sectionOnlyNamePills: Locator;
  readonly sectionOnlyNameViewAll: Locator;

  // Widget 4: Grouping Widget 1 & Section Grouping (grouping widget 3)
  readonly groupingWidget1Heading: Locator;
  readonly sectionGroupingHeading: Locator;
  readonly sectionGroupingSubTabs: Locator;
  readonly groupingWidget1PrevBtn: Locator;
  readonly groupingWidget1NextBtn: Locator;
  readonly carouselPrevButton: Locator;
  readonly carouselNextButton: Locator;
  readonly sectionGroupingCards: Locator;
  readonly groupingWidget1ViewAllBtn: Locator;
  readonly sectionGroupingViewAll: Locator;

  // Widget 5: Grouping Widget 2 & New Arrivals (grouping widget 2)
  readonly groupingWidget2Heading: Locator;
  readonly newArrivalsHeading: Locator;
  readonly newArrivalsSubtitle: Locator;
  readonly newArrivalsSubTabs: Locator;
  readonly newArrivalsCards: Locator;
  readonly groupingWidget2ViewAllBtn: Locator;
  readonly newArrivalsViewAll: Locator;

  // Widget 6: Name With Image Slider Widget
  readonly nameWithImageSliderHeading: Locator;
  readonly nameWithImageSliderPrevBtn: Locator;
  readonly nameWithImageSliderNextBtn: Locator;
  readonly nameWithImageSliderViewAllBtn: Locator;

  // Widget 7: Only Image Slider Widget
  readonly onlyImageSliderHeading: Locator;
  readonly onlyImageSliderPrevBtn: Locator;
  readonly onlyImageSliderNextBtn: Locator;
  readonly onlyImageSliderViewAllBtn: Locator;

  // Section Access & Controls
  readonly restrictedSectionCard: Locator;
  readonly goToTopButton: Locator;

  constructor(page: Page) {
    super(page);

    // Section Tab
    this.sectionTabLink = page.locator('header a, nav a, .menu-btn, bdi').filter({ hasText: /^Section$/i })
      .or(page.getByRole('link', { name: /Section/i }))
      .or(page.locator('bdi:has-text("Section")'))
      .first();

    this.landingPageSectionTab = page.locator('header bdi:has-text("Section"), nav a:has-text("Section")').first();

    // 1. Only Image Standard Widget
    this.onlyImageStandardWidgetHeading = page.locator('*:has-text("Section Only image")').first();
    this.sectionOnlyImageHeading = this.onlyImageStandardWidgetHeading;
    this.onlyImageCards = page.locator('img[alt*="Section"], .only-image-card, div:has(img)').filter({ has: page.locator('img') });
    this.sectionOnlyImageCards = this.onlyImageCards;
    this.sectionOnlyImageSearchInput = page.locator('input[placeholder*="Search"]').first()
      .or(page.locator('.section-only-image-container input, input[name="search"]')).first();
    this.onlyImageHoverNames = page.locator('.image-hover-title, .tooltip, [data-title]');
    this.onlyImageViewAllButton = page.getByText('View all', { exact: true }).first();

    // 2. Section Name & Image Widget
    this.nameWithImageStandardWidgetHeading = page.locator('*:has-text("Section Name & Image")').first();
    this.sectionNameAndImageHeading = this.nameWithImageStandardWidgetHeading;
    this.nameWithImageCards = page.locator('div').filter({ hasText: /^IR PDF$|^pdf$|^Section 11$|^Section 12$|^Section 2$/ });
    this.sectionNameAndImageCards = this.nameWithImageCards;
    this.sectionNameAndImageViewAll = page.getByText('View all', { exact: true }).first();

    // 3. Section (Only Name) Widget
    this.onlyNameStandardWidgetHeading = page.locator('*:has-text("Section (Only Name)")').first();
    this.sectionOnlyNameHeading = this.onlyNameStandardWidgetHeading;
    this.onlyNamePills = page.locator('button, a, div').filter({ hasText: /^IR PDF$|^pdf$|^Section 11$|^Section 12$|^Section 2$/ });
    this.sectionOnlyNamePills = this.onlyNamePills;
    this.sectionOnlyNameViewAll = page.getByText('View all', { exact: true }).nth(1).or(page.getByText('View all', { exact: true }).first());

    // 4. Grouping Widget 1 & Section Grouping
    this.groupingWidget1Heading = page.locator('*:has-text("Grouping 1"), *:has-text("grouping_widget_1.json")').first();
    this.sectionGroupingHeading = page.getByRole('heading', { name: /Section Grouping/i })
      .or(page.locator('*:has-text("Section Grouping : grouping widget 3 json")')).first();
    this.sectionGroupingSubTabs = page.locator('button, a').filter({ hasText: /^Section 2$|^pdf$|^IR\+PDF$/ });
    this.groupingWidget1PrevBtn = page.locator('.grouping1-prev, button:has-text("<")').first();
    this.carouselPrevButton = this.groupingWidget1PrevBtn;
    this.groupingWidget1NextBtn = page.locator('.grouping1-next, button:has-text(">")').first();
    this.carouselNextButton = this.groupingWidget1NextBtn;
    this.sectionGroupingCards = page.locator('.carousel-item, .slick-slide, .card').filter({ hasText: /Journal|News|Proquest/i });
    this.groupingWidget1ViewAllBtn = page.locator('*:has-text("Grouping 1") ~ div').getByText('View All').first();
    this.sectionGroupingViewAll = page.locator('a, button').filter({ hasText: 'View All' }).first();

    // 5. Grouping Widget 2 & New Arrivals
    this.groupingWidget2Heading = page.locator('*:has-text("Grouping 2"), *:has-text("grouping_widget_2.json")').first();
    this.newArrivalsHeading = page.getByRole('heading', { name: /New Arrivals/i })
      .or(page.locator('*:has-text("New Arrivals: grouping_widget_2.json")')).first();
    this.newArrivalsSubtitle = page.getByText('Access the latest content');
    this.newArrivalsSubTabs = page.locator('button, a').filter({ hasText: /^Section 2$|^Section 3$|^Section 4$|^Section 5$|^Section 6$|^Section 7$|^pdf$/ });
    this.newArrivalsCards = page.locator('.item-card, .grid-card, div').filter({ hasText: /British Review|Boğaziçi|Banca Nazionale|Aestimatio|Academia Economic/i });
    this.groupingWidget2ViewAllBtn = page.locator('*:has-text("Grouping 2") ~ div').getByText('View All').last();
    this.newArrivalsViewAll = page.locator('a, button').filter({ hasText: 'View All' }).last();

    // 6. Name With Image Slider Widget
    this.nameWithImageSliderHeading = page.locator('*:has-text("name_with_image_slider_item_widget.json")').first();
    this.nameWithImageSliderPrevBtn = page.locator('.slider-prev, button.slick-prev').first();
    this.nameWithImageSliderNextBtn = page.locator('.slider-next, button.slick-next').first();
    this.nameWithImageSliderViewAllBtn = page.locator('*:has-text("name_with_image_slider_item_widget") ~ div').getByText('View All').first();

    // 7. Only Image Slider Widget
    this.onlyImageSliderHeading = page.locator('*:has-text("only_image_slider_item_widget.json")').first();
    this.onlyImageSliderPrevBtn = page.locator('.only-img-slider-prev, button.slick-prev').last();
    this.onlyImageSliderNextBtn = page.locator('.only-img-slider-next, button.slick-next').last();
    this.onlyImageSliderViewAllBtn = page.locator('*:has-text("only_image_slider_item_widget") ~ div').getByText('View All').last();

    // Controls
    this.restrictedSectionCard = page.locator('.restricted-section, [data-restricted="true"]');
    this.goToTopButton = page.locator('#go-to-top, .back-to-top, button:has-text("Top")');
  }

  async navigateToSectionTab() {
    if (await this.sectionOnlyImageHeading.isVisible().catch(() => false)) {
      return;
    }
    
    // Click the Section tab in navbar
    const sectionTab = this.page.locator('bdi').filter({ hasText: /^Section$/i })
      .or(this.page.locator('a.menu-btn').filter({ hasText: /^Section$/i }))
      .or(this.page.getByRole('link', { name: /Section/i }))
      .or(this.page.locator('a, span, bdi').filter({ hasText: 'Section' }))
      .first();

    if (await sectionTab.isVisible({ timeout: 10000 }).catch(() => false)) {
      await sectionTab.click();
    } else {
      await this.sectionTabLink.click().catch(() => {});
    }
    await this.page.waitForTimeout(1000);
  }

  async searchInSectionOnlyImage(query: string) {
    if (await this.sectionOnlyImageSearchInput.isVisible().catch(() => false)) {
      await this.fillText(this.sectionOnlyImageSearchInput, query, 'Section Only Image Search Bar');
    }
  }

  async selectGroupingSubTab(tabName: string) {
    const tab = this.page.locator('button, a').filter({ hasText: new RegExp(`^${tabName}$`, 'i') }).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
    }
  }

  async selectNewArrivalsSubTab(tabName: string) {
    const tab = this.page.locator('button, a').filter({ hasText: new RegExp(`^${tabName}$`, 'i') }).last();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
    }
  }

  async hoverOverImage(index: number = 0) {
    const card = this.onlyImageCards.nth(index);
    if (await card.isVisible().catch(() => false)) {
      await card.hover();
    }
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async clickGoToTop() {
    if (await this.goToTopButton.isVisible().catch(() => false)) {
      await this.goToTopButton.click();
    }
  }

  async takeScreenshot(filePath: string) {
    await this.page.screenshot({ path: filePath, fullPage: true });
  }
}

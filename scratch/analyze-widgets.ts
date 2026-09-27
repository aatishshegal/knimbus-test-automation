import { chromium, Locator } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const WIDGETS = [
  'Publishers — Name & Logo',
  'Publisher Directory',
  'All Publishers',
  'Featured Publishers',
  'Publisher Logos',
  'Publisher Names',
  'Publisher Slider — Images',
  'Publisher Slider — Cards',
  'Publisher Collections',
  'Publisher Groups',
  'All Publishers — Expanded',
  'Publisher Gallery — Grouped',
  'Publisher Tabs — Images',
  'Publisher Toggle — Images',
  'Publisher Tabs — Names',
  'Publisher Toggle — Names',
  'Publisher Names — Grouped',
  'Top Publishers',
  'Publisher Overview'
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: './src/setup/.auth/adminStorageState.json'
  });
  const page = await context.newPage();
  
  await page.goto(`${process.env.PORTAL_URL}/portal/v2/default/home`);
  
  const sourceNavLink = page.getByRole('link', { name: /^source$/i });
  await sourceNavLink.click();
  
  await page.waitForTimeout(8000); 

  const results: any = {};
  
  for (const widgetName of WIDGETS) {
    const heading = page.getByText(widgetName, { exact: true }).first();
    const isVisible = await heading.isVisible().catch(() => false);
    
    if (isVisible) {
      // Find container that has this heading and a list (ul or ol) or slider track
      const container = page.locator('div').filter({ has: heading }).filter({ has: page.locator('ul, ol, .swiper-wrapper, .slick-track, .slider, .nav-tabs, .btn-group-toggle') }).last();
      const hasContainer = await container.isVisible().catch(() => false);
      
      let html = "";
      if (hasContainer) {
          html = await container.innerHTML().catch(() => "");
      }

      const cardsCountLiA = await container.locator('li a').count().catch(() => 0);
      const cardsCountSlider = await container.locator('.swiper-slide a, .slick-slide a, .slider-item a').count().catch(() => 0);
      const cardsCountDivA = await container.locator('div > a.card, div > a.publisher-card').count().catch(() => 0);

      const hasViewAll = await container.locator('a.viewAll, a[title="View All"], a:has-text("View All"), a:has-text("VIEW ALL")').isVisible().catch(() => false);
      const hasSearch = await container.locator('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]').isVisible().catch(() => false);
      const hasTabs = await container.locator('.nav-tabs, [role="tablist"], ul.tabs').isVisible().catch(() => false);
      const hasToggle = await container.locator('.switch, input[type="checkbox"], .btn-group-toggle, .toggle-container').isVisible().catch(() => false); 
      const hasSubscribedGroup = await container.locator(':text-matches("SUBSCRIBED", "i"), :text-matches("OPEN ACCESS", "i")').isVisible().catch(() => false);
      
      // Let's get the first generic card
      const cards = container.locator('a').filter({ has: page.locator('img') }).or(container.locator('li a'));
      let hasImage = false;
      let hasText = false;
      
      if (await cards.count() > 0) {
         hasImage = await cards.first().locator('img').isVisible().catch(() => false);
         const cardText = await cards.first().innerText().catch(() => '');
         hasText = cardText.trim().length > 0;
      }
      
      results[widgetName] = {
        isVisible,
        hasContainer,
        cardsCountLiA,
        cardsCountSlider,
        cardsCountDivA,
        hasViewAll,
        hasSearch,
        hasTabs,
        hasToggle,
        hasSubscribedGroup,
        cardHasImage: hasImage,
        cardHasText: hasText,
        htmlSnippet: html.substring(0, 500) // first 500 chars to understand structure
      };
    } else {
      results[widgetName] = { isVisible: false };
    }
  }
  
  fs.writeFileSync('scratch/widgets-analysis.json', JSON.stringify(results, null, 2));
  console.log("Analysis saved to scratch/widgets-analysis.json");

  await browser.close();
})();

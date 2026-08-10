import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Test different locators', async ({ page }) => {
  await page.goto(process.env.PORTAL_URL as string);
  await page.waitForTimeout(5000);
  
  const searchDropdowns = page.locator('select.css-fwy7yy');
  const count = await searchDropdowns.count();
  console.log('Total search dropdowns found:', count);
  
  for (let i = 0; i < count; i++) {
    const isVisible = await searchDropdowns.nth(i).isVisible();
    const textsInner = await searchDropdowns.nth(i).locator('option').allInnerTexts();
    const textsContent = await searchDropdowns.nth(i).locator('option').allTextContents();
    console.log(`Dropdown ${i} - isVisible: ${isVisible}, innerTexts: ${textsInner.length}, textContents: ${textsContent.length}`);
    console.log(textsContent);
  }
});

import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Extract search dropdown DOM', async ({ page }) => {
  await page.goto(process.env.PORTAL_URL as string);
  // Wait for the dropdown to be visible
  await page.waitForTimeout(5000);
  
  const html = await page.evaluate(() => {
    // Find all selects or elements looking like the search dropdown
    const els = document.querySelectorAll('select, .css-fwy7yy, [class*="search"]');
    let out = '';
    els.forEach(e => out += e.outerHTML + '\n\n');
    return out;
  });
  
  fs.writeFileSync('dropdown-dom.html', html);
});

import { chromium } from 'playwright';

async function testUI() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://sydneyuniversity.knimbus.com/');
  await page.click('text=Sign in');
  await page.click('text=Sign up');
  
  const nameInput = page.locator('#userName');
  await nameInput.waitFor({ state: 'visible' });
  
  // Test 1: 2 characters
  await nameInput.type('ab', { delay: 100 });
  await page.locator('text=Sign up Create your account here!').click(); // click away
  
  await page.waitForTimeout(1000);
  let errorMsg = await page.evaluate(() => {
    const err = document.querySelector('#userName + .invalid-feedback, #userName ~ .text-danger, #userName ~ span');
    return err ? err.textContent : 'No error';
  });
  console.log("Error for 'ab':", errorMsg?.trim());
  
  // Test 2: 102 chars
  await nameInput.fill('');
  await nameInput.evaluate(el => el.value = 'A'.repeat(102));
  await nameInput.dispatchEvent('input');
  await page.locator('text=Sign up Create your account here!').click(); // click away
  
  await page.waitForTimeout(1000);
  errorMsg = await page.evaluate(() => {
    const err = document.querySelector('#userName + .invalid-feedback, #userName ~ .text-danger, #userName ~ span');
    return err ? err.textContent : 'No error';
  });
  console.log("Error for 102 chars:", errorMsg?.trim());

  await browser.close();
}

testUI().catch(console.error);

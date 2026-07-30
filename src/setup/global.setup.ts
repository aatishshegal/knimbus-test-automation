import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

async function globalSetup(config: FullConfig) {
  console.log('Starting Global Setup: Authenticating Admin User...');
  
  if (!process.env.DASHBOARD_URL || !process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
    throw new Error('MISSING ENV VARIABLES: Please check your .env file for DASHBOARD_URL, ADMIN_USER, and ADMIN_PASSWORD');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(`${process.env.DASHBOARD_URL}/#/signIn`);
    
    await page.getByRole('textbox', { name: 'Email address*' }).fill(process.env.ADMIN_USER);
    await page.getByRole('textbox', { name: 'Password*' }).fill(process.env.ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Next' }).click();
    
    await page.getByTitle('User Management').waitFor({ state: 'visible', timeout: 30000 }).catch(() => console.log('Did not hit dashboard, checking state...')); 
    
    await page.context().storageState({ path: './src/setup/.auth/adminStorageState.json' });
    console.log('Global Setup Complete: Admin Session Saved.');
    
  } catch (error) {
    console.error('Global Setup Failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;

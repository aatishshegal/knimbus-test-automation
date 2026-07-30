import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Standard viewport for reliable rendering across headed/headless
const defaultViewport = { width: 1280, height: 720 };

export default defineConfig({
  testDir: './tests',
  // Increased timeout to 60s to account for slow WebKit/Firefox startup
  timeout: 60 * 1000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // Added 1 retry even locally. WebKit often fails first run but succeeds second.
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['line']],

  use: {
    // Increased default action timeout to 15 seconds to wait for elements to become visible
    actionTimeout: 15 * 1000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Video on retry is highly recommended to debug why WebKit/Firefox failed
    video: 'on-first-retry',
    viewport: defaultViewport,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: defaultViewport, deviceScaleFactor: undefined } },
    //{ name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 }, deviceScaleFactor: undefined } },
    //{ name: 'webkit', use: { ...devices['Desktop Safari'], viewport: null, deviceScaleFactor: undefined } },
  ],
});

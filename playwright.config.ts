import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Determine if we have a saved auth state
const authFile = '.auth/user.json';
const storageState = authFile;

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
  reporter: [['html', { open: 'never' }], ['./src/utils/CleanConsoleReporter.ts'], ['./src/utils/CsvReporter.ts']],

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
    // --- GLOBAL API SETUP ---
    // Runs exactly ONCE globally before anything else to configure backend preconditions
    { name: 'global-setup', testMatch: /global\.setup\.ts/ },

    // --- ADMIN DASHBOARD SETUP ---
    { 
      name: 'admin-setup', 
      testMatch: /admin\.setup\.ts/,
      dependencies: ['global-setup'],
    },

    // --- PORTAL SETUP ---
    { 
      name: 'portal-setup', 
      testMatch: /portal\.setup\.ts/,
      dependencies: ['global-setup'],
    },
    
    // --- PORTAL UI TESTS ---
    // Pre-login tests (Authentication, Registration) start completely logged out
    { 
      name: 'Portal - pre-login',
      testMatch: /portal\/.*(authentication|registration).*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: defaultViewport, deviceScaleFactor: undefined },
      dependencies: ['portal-setup'],
    },

    // Post-login tests (Navigation, Home, etc.) inherit the cached session and wait for setup
    { 
      name: 'Portal - post-login',
      testMatch: /portal\/.*\.spec\.ts/,
      testIgnore: /.*(authentication|registration).*\.ts/,
      use: { 
        ...devices['Desktop Chrome'], 
        viewport: defaultViewport, 
        deviceScaleFactor: undefined,
        storageState: storageState 
      },
      dependencies: ['portal-setup'],
    },

    // --- ADMIN DASHBOARD UI TESTS ---
    {
      name: 'Admin Dashboard',
      testMatch: /admin\/.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'], 
        viewport: defaultViewport, 
        deviceScaleFactor: undefined,
        storageState: '.auth/admin.json'
      },
      dependencies: ['admin-setup'],
    }
  ],
});

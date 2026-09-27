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
  // Increased timeout to 90s to account for federated external publisher queries
  timeout: 90 * 1000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // Added 1 retry even locally. WebKit often fails first run but succeeds second.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
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
    // 1. Read-Only fast suites: Search, Navigation, Home (61 tests)
    // Run concurrently with 4 workers using the cached authenticated session
    { 
      name: 'Portal - Read-Only',
      testMatch: /portal\/(search|navigation|home)\/.*\.spec\.ts/,
      fullyParallel: true,
      workers: 4,
      use: { 
        ...devices['Desktop Chrome'], 
        viewport: defaultViewport, 
        deviceScaleFactor: undefined,
        storageState: storageState 
      },
      dependencies: ['portal-setup'],
    },

    // 2. Federated Search suite: Research+ (54 tests)
    // Run sequentially with 1 worker to avoid proxy bottlenecking on external publisher APIs (IEEE, ProQuest)
    { 
      name: 'Portal - Research Plus',
      testMatch: /portal\/research-plus\/.*\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      timeout: 120 * 1000,
      use: { 
        ...devices['Desktop Chrome'], 
        viewport: defaultViewport, 
        deviceScaleFactor: undefined,
        storageState: storageState 
      },
      dependencies: ['portal-setup'],
    },

    // 2. Pre-login mutating suites: Authentication & Registration (43 tests)
    // Run sequentially with 1 worker to protect tenant admin security state
    { 
      name: 'Portal - Pre-Login',
      testMatch: /portal\/(authentication|registration)\/.*\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      use: { 
        ...devices['Desktop Chrome'], 
        viewport: defaultViewport, 
        deviceScaleFactor: undefined 
      },
      dependencies: ['portal-setup'],
    },

    // 3. Post-login mutating suites: Profile details, contact, enrollment, password
    // Run sequentially with 1 worker to prevent race conditions during editability/field toggling
    { 
      name: 'Portal - Profile',
      testMatch: /portal\/profile\/.*\.spec\.ts/,
      testIgnore: /work-and-education\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      use: { 
        ...devices['Desktop Chrome'], 
        viewport: defaultViewport, 
        deviceScaleFactor: undefined,
        storageState: storageState 
      },
      dependencies: ['Portal - Pre-Login'],
    },

    // --- ADMIN DASHBOARD UI TESTS ---
    {
      name: 'Admin Dashboard',
      testMatch: /admin\/.*\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
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

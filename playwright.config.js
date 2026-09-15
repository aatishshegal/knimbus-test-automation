"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables from .env file
dotenv.config();
// Determine if we have a saved auth state
const authFile = '.auth/user.json';
const storageState = fs_1.default.existsSync(authFile) ? authFile : undefined;
// Standard viewport for reliable rendering across headed/headless
const defaultViewport = { width: 1280, height: 720 };
exports.default = (0, test_1.defineConfig)({
    testDir: './tests',
    // Increased timeout to 60s to account for slow WebKit/Firefox startup
    timeout: 60 * 1000,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    // Added 1 retry even locally. WebKit often fails first run but succeeds second.
    retries: process.env.CI ? 2 : 1,
    workers: 1,
    reporter: [['html', { open: 'never' }], ['line'], ['./src/utils/CsvReporter.ts']],
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
        // Setup project runs exactly ONCE globally before the test suite
        { name: 'setup', testMatch: /.*\.setup\.ts/ },
        // Pre-login tests (Authentication, Registration) start completely logged out
        {
            name: 'pre-login',
            testMatch: /.*(authentication|registration).*\.spec\.ts/,
            use: { ...test_1.devices['Desktop Chrome'], viewport: defaultViewport, deviceScaleFactor: undefined },
        },
        // Post-login tests (Navigation, Home, etc.) inherit the cached session and wait for setup
        {
            name: 'post-login',
            testIgnore: /.*(authentication|registration|setup).*\.ts/,
            use: {
                ...test_1.devices['Desktop Chrome'],
                viewport: defaultViewport,
                deviceScaleFactor: undefined,
                storageState: storageState
            },
            dependencies: ['setup'],
        },
    ],
});

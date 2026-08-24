# Knimbus Test Automation Framework

This repository contains the end-to-end (E2E) automated test suite for the Knimbus application. The framework is built using **Playwright** with **TypeScript**, following strict architectural patterns to ensure fast, reliable, and maintainable test execution.

## 🚀 Architecture

The framework is structured using the **Page Object Model (POM)** pattern combined with a robust **Two-Tiered Playwright Project Architecture** to optimize authentication and session management.

### Project Isolation
The `playwright.config.ts` is divided into specific projects to handle the application's state efficiently:
1. **`setup`**: A global setup project that runs exactly once before any test. It uses the `AdminApiService` to instantly configure the backend database state (e.g., turning off Two-Factor Authentication) and caches a valid logged-in session into `.auth/user.json`.
2. **`pre-login`**: Tests that require a clean, unauthenticated state (e.g., Login workflows, Registration, OTP validations). These tests strictly bypass the global setup session to prevent automated redirects.
3. **`post-login`**: The vast majority of the tests (Home Page, Search, Profile). These tests inherit the cached `.auth/user.json` session. They start completely authenticated, saving massive amounts of time by skipping the UI login screens.

### Preconditions via API
We strictly **do not** use UI automation to set up Admin Dashboard preconditions (like modifying security settings or resetting passwords). Instead, the framework relies on `src/api/AdminApiService.ts` to execute lightning-fast REST API calls during the `beforeAll` hooks or Global Setup.

## 📁 Directory Structure

```
Knimbus Test Automation/
├── src/
│   ├── api/            # Admin API Services (Preconditions)
│   ├── fixtures/       # Playwright Custom Fixtures
│   └── pages/          # Page Object Models (POMs)
├── tests/
│   ├── global.setup.ts # Global setup for session & API configuration
│   ├── login/          # Pre-login tests (Authentication flows)
│   ├── portal/         # Post-login tests (Home, Search, Navigation)
│   └── test-data/      # JSON files for data-driven testing
├── playwright.config.ts# Playwright configuration
└── .env                # Environment variables (Credentials & URLs)
```

## 🛠 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd "Knimbus Test Automation"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```
4. Create a `.env` file in the root directory and configure your credentials (use `.env.example` as a template).

## 🧪 Executing Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Projects
Run only unauthenticated login tests:
```bash
npx playwright test --project=pre-login
```
Run only authenticated portal tests:
```bash
npx playwright test --project=post-login
```

### Run Specific Test Files
```bash
npx playwright test tests/portal/home/widgets-visibility.spec.ts
```

### Run a Specific Test by Name (Grep)
```bash
npx playwright test -g "Verify search dropdown contains Title, Author, Everything"
```

### Run Tests in Headed Mode (Visual)
Append the `--headed` flag to any command to watch the browser execute the tests live:
```bash
npx playwright test --headed
```

## 📝 Rules and Best Practices

1. **Strict SRP for POMs**: Create dedicated Page Object files for every distinct page/modal. "God Classes" are prohibited.
2. **Data-Driven Testing**: Never hardcode test data inside `.spec.ts` files. Always read test data from JSON files in the `tests/test-data/` directory.
3. **No Dynamic Routing**: Page Objects must never use `locator.or()` to guess the landing page. Tests must be deterministic.
4. **Locators**: Rely on robust DOM-based Playwright locators (e.g., `getByRole`, `getByText`). Do not use fragile CSS selectors unless absolutely necessary.
5. **No Logic in Tests**: Avoid complex control flow (`for` loops, `if/else`) inside test specifications. Encapsulate complex interactions in Utilities or Page Objects.

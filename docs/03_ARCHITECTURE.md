# Framework Architecture

## High-Level Architecture
We will use a highly modular **Page Object Model (POM)** enhanced by **Playwright Fixtures**. This architecture separates the test assertions (what we are testing) from the page interactions (how we interact with the UI), making the framework robust against UI changes.

## Folder Structure

```text
├── docs/                     # Framework documentation (ADRs, contexts, setup guides)
├── src/
│   ├── pages/                # Page Object Models (DOM locators and interaction methods)
│   │   ├── portal/           # Pages specific to Library Portal
│   │   └── dashboard/        # Pages specific to Librarian Dashboard
│   ├── fixtures/             # Playwright fixtures to inject pages and states into tests
│   ├── setup/                # Global setup scripts (UI-based configuration & session generation)
│   ├── utils/                # Helper functions (e.g., sessionStorage manipulators, generators)
│   └── types/                # TypeScript interfaces and types
├── tests/
│   ├── e2e/                  # End-to-end tests spanning multiple modules
│   ├── portal/               # Tests exclusively for Library Portal
│   └── dashboard/            # Tests exclusively for Librarian Dashboard
├── test-data/                # Static JSON/CSV files if needed
├── playwright.config.ts      # Main Playwright configuration (environments, parallelization, retries)
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript compiler options
```

## Design Patterns Chosen
### 1. Page Object Model (POM)
- **Why**: Standard industry practice for UI automation. Encapsulates locators.
- **Advantage**: If a UI element changes, we update the locator in exactly one place.
- **Disadvantage**: Can become bloated if pages are large (we will mitigate this via component objects if necessary).

### 2. Playwright Fixtures
- **Why**: Playwright’s native dependency injection mechanism.
- **Advantage**: Automatically instantiates Page Objects and sets up prerequisites (like injecting session tokens) before tests run, removing boilerplate `beforeEach` hooks.

### 3. API-First Test Data & Global Setup
- **Why**: While backend APIs were initially unavailable, we reverse-engineered the internal API endpoints used by the Librarian Dashboard. We use these APIs via `AdminApiService` to prepare the environment for tests.
- **Advantage**: Bypasses the UI entirely, resulting in blazingly fast and highly robust setup phases.
- **Disadvantage (Trade-off)**: Requires maintenance if internal API contracts change.
- **Mitigation**: We abstract all API calls behind `AdminApiService` and Playwright Fixtures. If an endpoint changes, we only need to update the service layer. **Note:** We will use the MySQL MCP (SELECT queries only) to quickly verify application state and debug failures without needing the UI.

### 4. Tagging for Parallelism
- **Why**: Due to the constraint that admin settings affect the portal globally, we cannot blindly run all tests in parallel.
- **Advantage**: We will tag tests (e.g., `@serial`, `@parallel`) to ensure tests that mutate global settings do not interfere with standard user flow tests.

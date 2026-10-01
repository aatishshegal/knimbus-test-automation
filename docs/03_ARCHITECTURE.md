# Framework Architecture

## High-Level Architecture
The framework employs a **Single-Responsibility Page Object Model (POM)** enhanced by **Playwright Fixtures** and **API-First Preconditions**. Test specifications remain clean, linear, and assertion-focused, while UI selectors and interaction logic are strictly encapsulated in dedicated page and component classes.

## Folder Structure

```text
├── .agents/                  # AI agent workflow rules & MCP configuration
│   ├── AGENTS.md             # Strict agent rules (Plan, Generate, Heal, Checklist)
│   └── mcp_config.json       # MCP server definitions (Puppeteer, etc.)
├── docs/                     # Living project documentation
│   ├── 01_PROJECT_OVERVIEW.md
│   ├── 02_REQUIREMENTS.md
│   ├── 03_ARCHITECTURE.md
│   ├── 04_DECISIONS_LOG.md
│   ├── 08_TEST_STRATEGY.md
│   └── 10_AI_CONTEXT.md      # Project progress, active focus, and hand-off context
├── src/
│   ├── api/
│   │   └── AdminApiService.ts# Reverse-engineered backend API service for admin preconditions
│   ├── components/           # Shared reusable UI components
│   │   └── admin/            # AdminHeader.ts, AdminSidebar.ts
│   ├── fixtures/
│   │   └── index.ts          # Playwright test fixtures injecting POMs and preconditions
│   ├── pages/
│   │   ├── BasePage.ts       # Portal base page with resilient Playwright wrappers
│   │   ├── admin/            # Admin pages (AdminBasePage, AdminDashboardLoginPage, user-management/)
│   │   └── portal/           # Portal pages (HomePage, PortalLoginPage, SearchResultPage, Profile, etc.)
│   ├── setup/
│   │   ├── global.setup.ts   # Global test environment initialization
│   │   └── .auth/            # Cached storage states (adminStorageState.json)
│   └── utils/                # Custom reporters (CsvReporter, CleanConsoleReporter), validators, auth helpers
├── tests/
│   ├── admin.setup.ts        # Admin authentication setup project
│   ├── portal.setup.ts       # Portal authentication setup project
│   ├── admin/                # Admin test suites (auth/, navigation/, user-management/)
│   ├── portal/               # Portal test suites (authentication/, registration/, home/, navigation/, search/, research-plus/, profile/)
│   └── test-data/            # Centralized test data repositories
│       ├── admin-data.json   # Admin user management & settings test data
│       ├── portal-data.json  # Portal search queries, expected labels, navigation items
│       ├── portal/           # Modular data (profile-data.json)
│       └── files/            # Mock upload assets (dummy images, PDFs)
├── playwright.config.ts      # Multi-project Playwright configuration (setup, admin, portal)
├── package.json              # Dependencies and test runner scripts
└── tsconfig.json             # TypeScript strict configuration and path aliases
```

## Core Design Principles

### 1. Strict SRP for Page Objects (No God Classes)
- Every distinct page, tab, or modal has its own dedicated class (e.g., `ManageUsersPage.ts`, `SelectUsersModal.ts`, `AddSingleUserModal.ts`, `EnrollmentDetailsPage.ts`).
- Pages inherit from `BasePage` (Portal) or `AdminBasePage` (Admin) to leverage resilient interaction methods.
- No `locator.or()` fallbacks; routing and locators must be deterministic.

### 2. Pure POM Encapsulation in Specs
- `.spec.ts` files contain **zero** conditionals (`if/else`) and **zero** UI loops (`for/while`).
- Iterative operations (verifying table rows, list items, facet counts) must be encapsulated in POM helper methods.
- Iterations in `.spec.ts` are only permitted inside `test.describe()` to dynamically generate independent, granular `test()` blocks.

### 3. API-First Preconditions (`AdminApiService`)
- Test data and tenant configurations (e.g., OTP toggles, field editability, mandatory details) are set up via direct API calls before UI tests run.
- Completely avoids slow, flaky UI setup in the Admin Dashboard.
- Clean teardown in `afterAll` / `finally` blocks ensures test state does not leak across runs.

### 4. Zero Hardcoded Test Data
- Test specifications **must never** contain hardcoded strings, expected array lists, search terms, or credentials.
- All test inputs, regex patterns, expected titles, and options are imported from `tests/test-data/portal-data.json` or `tests/test-data/admin-data.json`.
- Dynamic values are attached to the test run using Playwright annotations (`test.info().annotations.push({ type: 'testData', description: ... })`) for reporting.

### 5. Multi-Project Storage State Architecture
- Authenticated state is generated once during the `setup` project (`portal.setup.ts`, `admin.setup.ts`) and saved to `.auth/`.
- Dependent test projects reuse the cached storage state, eliminating repetitive UI logins and dramatically speeding up test execution.

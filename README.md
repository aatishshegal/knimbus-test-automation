# Knimbus Test Automation Framework

This repository contains the end-to-end (E2E) automated test suite (720+ scenarios) for the Knimbus application covering both the **Library Portal** (End User) and the **Librarian Dashboard** (Admin). The framework is built using **Playwright** with **TypeScript**, following strict architectural patterns to ensure fast, deterministic, and maintainable test execution.

## 🚀 Architecture

The framework is structured using the **Page Object Model (POM)** pattern combined with an **Isolated Multi-Project Pipeline** in `playwright.config.ts`:

### Project Isolation & Lifecycle
1. **Setup Projects (`global-setup`, `admin-setup`, `portal-setup`)**:
   - Run once before UI tests to verify database preconditions via MySQL MCP and configure tenant settings using `AdminApiService`.
   - Persist authenticated browser states to `.auth/user.json` and `.auth/admin.json`.
2. **`Portal - Read-Only`**:
   - Concurrently executes high-speed, non-mutating portal suites (`search`, `navigation`, `home`) using 4 workers.
3. **`Portal - Research Plus`**:
   - Federated search queries and external publisher aggregations (IEEE, ProQuest).
4. **`Portal - Notification`**:
   - Validates notification bell, popover, inbox mutation, and unread counts.
5. **`Portal - Profile`**:
   - Validates user profile sections (Basic Details, Contact, Enrollment Details, Work & Education, ID Card, Password Change).
6. **`Portal - Pre-Login`**:
   - Tests unauthenticated flows (Authentication, Registration, OTP, Forgot Password) without saved storage state.
7. **`Admin Dashboard`**:
   - Tests administrative modules: User Management (Overview, Manage Users, Add Single User, Profile Overview, Service Groups), Header, and Sidebar.

### Preconditions via API
We strictly **do not** use UI automation to set up Admin Dashboard preconditions (like modifying security settings, toggling field editability, or resetting passwords). Instead, the framework relies on `src/api/AdminApiService.ts` to execute REST API calls during `test.beforeAll()` hooks or Global Setup.

## 📁 Directory Structure

```text
Knimbus Test Automation/
├── src/
│   ├── api/            # Admin API Services for precondition automation
│   ├── components/     # Shared Admin & Portal components (Header, Sidebar)
│   ├── fixtures/       # Custom Playwright fixtures (auth, pages)
│   ├── pages/          # Page Object Models (POMs)
│   │   ├── admin/      # Admin Dashboard POMs (User Management, Service Groups)
│   │   └── portal/     # Portal POMs (Search, Profile, Registration, Navigation)
│   └── utils/          # Reporters, CSV logger, sorting validators
├── tests/
│   ├── admin/          # Admin Dashboard test suites (auth, navigation, user-management)
│   ├── portal/         # Portal test suites (authentication, registration, profile, search, home)
│   ├── test-data/      # JSON datasets (portal-data.json, admin-data.json, profile-data.json)
│   ├── global.setup.ts # Global backend preconditions setup
│   ├── admin.setup.ts  # Admin session caching (.auth/admin.json)
│   └── portal.setup.ts # Portal session caching (.auth/user.json)
├── playwright.config.ts# Multi-project test pipeline configuration
└── .env                # Environment variables & test credentials
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
Run only Admin Dashboard tests:
```bash
npx playwright test --project="Admin Dashboard"
```
Run only Read-Only Portal tests (fast concurrent):
```bash
npx playwright test --project="Portal - Read-Only"
```
Run only Profile tests:
```bash
npx playwright test --project="Portal - Profile"
```

### Run Specific Test Files
```bash
npx playwright test tests/admin/user-management/service-groups.spec.ts
```

### Run a Specific Test by Name (Grep)
```bash
npx playwright test -g "Global Navigation - Notification Bell"
```

### Run Tests in Headed Mode (Visual)
Always provide execution commands with `--headed` for interactive inspection:
```bash
npx playwright test --project="Admin Dashboard" --headed
```

## 📝 Rules and Best Practices

1. **Standard Test Naming (Natural Hierarchy)**: Every test name MUST strictly follow:
   `[Page / Module] - [Component / Feature] - [Action and Expected Outcome]`
   *Never use `TC_`, test ID numbers (`01`, `02`), or snake_case slugs in test titles.*
2. **Strict SRP for POMs**: Create dedicated Page Object files for every distinct page/modal. "God Classes" are prohibited.
3. **Data-Driven Testing**: Never hardcode test data or literal strings inside `.spec.ts` files. Always read inputs dynamically from `tests/test-data/`.
4. **Pure POM Encapsulation**: Spec files must remain linear and logicless. Do NOT use `for` loops or `if/else` inside `test()` blocks.
5. **No Dynamic Routing**: Page Objects must never use `locator.or()` to guess the landing page. Tests must be deterministic.
6. **Locators**: Rely on resilient DOM-based Playwright locators (`getByRole`, `getByText`). Do not use fragile CSS selectors.
7. **Performance & Soft Resets**: In suites with repetitive modals, dismiss popups in `beforeEach` instead of triggering full page reloads.

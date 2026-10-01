# AI Context

## Current Project Status
- **Phase 1 (Requirement Collection):** Completed.
- **Phase 2 (Architecture Design):** Completed. Defined POM + Fixtures architecture, sequential execution policy, and Admin API precondition design.
- **Phase 3 (Core Test Suites & Framework Expansion):** Completed. 720+ automated scenarios covering all primary Portal and Admin Dashboard workflows are active, deterministic, and passing at >99.4%.
- **Phase 4 (Continuous Regression, Performance Tuning & Coverage Expansion):** Active. Optimizing project execution concurrency, reducing suite runtime, and maintaining zero-flakiness across external federated search providers.

## Important Architectural Decisions & Rules
- **Stack:** Playwright + TypeScript (Strict typing, no `any`, configured path aliases).
- **Selectors:** DOM-based locators (`getByRole`, `getByText`, CSS where needed) due to Angular SSR limitations (no `data-testid`). Never guess locators—verify using Puppeteer MCP or live DOM.
- **Standard Test Naming (Natural Hierarchy):** All test titles strictly adhere to:
  `[Page / Module] - [Component / Feature] - [Action and Expected Outcome]`
  *Legacy `TC_` prefixes, test ID numbers (`01`, `02`, `85`), and snake_case slugs are strictly prohibited across all `.spec.ts` files.*
- **Preconditions:** Test data and tenant settings setup is strictly automated via **API (`AdminApiService`)**. Never configure settings via Admin UI during test preconditions.
- **Database Verification:** MySQL MCP is strictly for `SELECT` verification queries and DB-state assertions. Never execute `UPDATE`, `INSERT`, or `DELETE`.
- **Determinism:** No dynamic routing or `.or()` locators in POMs. Each test scenario must be deterministic and linear.
- **Data-Driven & Pure POM:** All test strings and inputs reside in `tests/test-data/` (`portal-data.json`, `admin-data.json`, `profile-data.json`, etc.). No hardcoded strings, no `for` loops or `if/else` inside `.spec.ts` files. Loops are only permitted in `test.describe()` to generate independent Playwright test blocks.
- **Execution & Storage State:** Monorepo architecture with distinct Playwright projects (`portal.setup.ts`, `admin.setup.ts`). Tests consume saved storage states (`.auth/`) to avoid redundant login cycles.
- **Performance & Soft Resets:** In suites with repetitive modal interactions, dismiss dialogs via Escape/Cancel rather than triggering full browser page reloads and networkidle waits.

## Completed Implementation

### 1. Framework Infrastructure & Utilities
- Configured [playwright.config.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/playwright.config.ts) with isolated multi-project pipeline (`setup`, `portal`, `admin`).
- Established base pages: [BasePage.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/pages/BasePage.ts) and [AdminBasePage.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/pages/admin/AdminBasePage.ts).
- Shared Admin Components: [AdminHeader.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/components/admin/AdminHeader.ts), [AdminSidebar.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/components/admin/AdminSidebar.ts).
- Precondition API layer: [AdminApiService.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/api/AdminApiService.ts) handling security settings, tenant configs, and user provisioning.
- Custom Reporters & Utilities: [CleanConsoleReporter.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/utils/CleanConsoleReporter.ts), [CsvReporter.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/utils/CsvReporter.ts), [SortingValidator.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/utils/SortingValidator.ts), [AuthHelpers.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/utils/AuthHelpers.ts).
- Test data files: `admin-data.json`, `portal-data.json`, `field-validation-data.json`, `portal/profile-data.json`, and sample mock upload files in `tests/test-data/files/`.

### 2. Portal Test Suites (`tests/portal/` - ~360 Scenarios)
- **Authentication (`tests/portal/authentication/`):**
  - Standard login (positive & negative flows)
  - OTP authentication flows & resend handling
  - Forgot password & reset password workflows
  - Mandatory details routing & submission
  - Welcome page verification & chained new-user flows
- **Registration (`tests/portal/registration/`):**
  - Self-registration with domain validation
  - Unverified user registration
  - Granular field validation (regex, length limits, mandatory constraints)
- **Home & Landing (`tests/portal/home/`):**
  - Widget visibility & dynamic carousels
  - Subject browsing, content types, and publishers showcase
- **Navigation (`tests/portal/navigation/`):**
  - Main menu drawer/navigation, global search bar, profile dropdown, language switcher, notification icon & popover
- **Search & Discovery (`tests/portal/search/`):**
  - Global search results & pagination, sorting, faceted filter panel, inner-search persistence, saved searches, detail page metadata
- **Research Plus (`tests/portal/research-plus/`):**
  - Federated search query inputs, query types, resource selection, federated provider refresh, and aggregation
- **User Profile (`tests/portal/profile/`):**
  - Basic profile details & avatar, contact information, enrollment details, work & education, ID & access info, in-app password change

### 3. Admin Dashboard Test Suites (`tests/admin/` - ~360 Scenarios)
- **Admin Auth & Navigation (`tests/admin/auth/`, `tests/admin/navigation/`):**
  - Admin login session persistence, header controls (email limit, profile, tenant switcher), sidebar expand/collapse & routing
- **User Management (`tests/admin/user-management/`):**
  - User management overview & metric cards
  - Manage users table (search, role filters, sorting, bulk actions)
  - Add single user modal & field validations
  - Modular User Profile Overview:
    - User Details tab (Basic Details, Content Groups, Service Group allocation)
    - Password tab (Validation, matching, visibility toggle, error handling)
    - ID Document tab (Verification, zoom/rotate viewer, status handling)
  - Service Groups management (117 scenarios: Create modal, access options, date picker, user associations via All/Selected/Unselected/CSV tabs, deletion, table search)

## Active & Immediate Focus
- **Pre-execution Verification:** Strictly verify the 5 mandatory rules in `.agents/AGENTS.md` before making edits to any `.spec.ts` files.
- **Execution Concurrency Optimization:** Decoupling independent Admin suites (Service Groups) from Portal dependency chains to reduce total suite execution time from ~51m to ~20m.

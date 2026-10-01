# AI Context

## Current Project Status
- **Phase 1 (Requirement Collection):** Completed.
- **Phase 2 (Architecture Design):** Completed. Defined POM + Fixtures architecture, sequential execution policy, and Admin API precondition design.
- **Phase 3 (Core Test Suites & Framework Expansion):** Active & Substantially Complete. Core Portal and Admin UI modules have been automated and stabilized.
- **Phase 4 (Continuous Regression & Coverage Expansion):** In Progress.

## Important Architectural Decisions & Rules
- **Stack:** Playwright + TypeScript (Strict typing, no `any`, configured path aliases).
- **Selectors:** DOM-based locators (`getByRole`, `getByText`, CSS where needed) due to Angular SSR limitations (no `data-testid`). Never guess locators—verify using Puppeteer MCP or live DOM.
- **Preconditions:** Test data and tenant settings setup is strictly automated via **API (`AdminApiService`)**. Never configure settings via Admin UI during test preconditions.
- **Database Verification:** MySQL MCP is strictly for `SELECT` verification queries and DB-state assertions. Never execute `UPDATE`, `INSERT`, or `DELETE`.
- **Determinism:** No dynamic routing or `.or()` locators in POMs. Each test scenario must be deterministic and linear.
- **Data-Driven & Pure POM:** All test strings and inputs reside in `tests/test-data/` (`portal-data.json`, `admin-data.json`, `profile-data.json`, etc.). No hardcoded strings, no `for` loops or `if/else` inside `.spec.ts` files. Loops are only permitted in `test.describe()` to generate independent Playwright test blocks.
- **Execution & Storage State:** Monorepo architecture with distinct Playwright projects (`portal.setup.ts`, `admin.setup.ts`). Tests consume saved storage states (`.auth/`) to avoid redundant login cycles.

## Completed Implementation

### 1. Framework Infrastructure & Utilities
- Configured [playwright.config.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/playwright.config.ts) with isolated projects (`setup`, `portal`, `admin`).
- Established base pages: [BasePage.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/pages/BasePage.ts) and [AdminBasePage.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/pages/admin/AdminBasePage.ts).
- Shared Admin Components: [AdminHeader.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/components/admin/AdminHeader.ts), [AdminSidebar.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/components/admin/AdminSidebar.ts).
- Precondition API layer: [AdminApiService.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/api/AdminApiService.ts) handling security settings, tenant configs, and user provisioning.
- Custom Reporters & Utilities: [CleanConsoleReporter.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/utils/CleanConsoleReporter.ts), [CsvReporter.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/utils/CsvReporter.ts), [SortingValidator.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/utils/SortingValidator.ts), [AuthHelpers.ts](file:///Users/ks/Documents/Knimbus%20Test%20Automation/src/utils/AuthHelpers.ts).
- Test data files: `admin-data.json`, `portal-data.json`, `field-validation-data.json`, `portal/profile-data.json`, and sample mock upload files in `tests/test-data/files/`.

### 2. Portal Test Suites (`tests/portal/`)
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
  - Subject browsing
  - Content types browsing
  - Publishers showcase
- **Navigation (`tests/portal/navigation/`):**
  - Main menu drawer/navigation
  - Global search bar interactions
  - Profile dropdown options
  - Language translation switcher
  - Notification icon & popover
- **Search & Discovery (`tests/portal/search/`):**
  - Global search results & pagination
  - Sorting (relevance, date, title)
  - Faceted filter panel (content types, publishers, subjects, access types)
  - Search result item content verification
  - Inner-search query persistence
  - Saved searches functionality
  - Detail page viewing & metadata verification
- **Research Plus (`tests/portal/research-plus/`):**
  - Research Plus landing page
  - Form field validation & reset behavior
  - Query types (All Words, Exact Phrase, Boolean)
  - Resource selection & federated search execution
  - Federated result refresh & provider aggregation
- **User Profile (`tests/portal/profile/`):**
  - Basic profile details & avatar
  - Contact information
  - Enrollment details
  - Work & education
  - ID & access information (upload, review status)
  - Password change

### 3. Admin Dashboard Test Suites (`tests/admin/`)
- **Admin Auth (`tests/admin/auth/`):**
  - Admin login flows & session management
- **Admin Navigation (`tests/admin/navigation/`):**
  - Admin header controls (notifications, profile, tenant switcher)
  - Admin sidebar expand/collapse & module routing
- **User Management (`tests/admin/user-management/`):**
  - User management overview & metrics
  - Manage users table (search, filter, pagination, user actions)
  - Add single user modal & validation
  - Manage users profile overview (User details, Password reset, ID Document verification)
  - Service groups (assignment, filtering, bulk actions)

## Active & Immediate Focus
- **Admin User Management:** Finalizing edge cases and modal interactions in `manage-users.spec.ts`, `service-groups.spec.ts`, and `manage-users-profile-overview_id-document.spec.ts`.
- **Pre-execution Verification:** Maintain strict adherence to the 4 rules in `.agents/AGENTS.md` before making edits to any `.spec.ts` files.

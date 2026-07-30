# AI Context

## Current Project Status
- **Phase 1 (Requirement Collection):** Completed.
- **Phase 2 (Architecture Design):** Completed. We have defined the POM + Fixtures architecture and addressed the parallel execution constraint.
- **Phase 3 (Framework Development):** Pending.

## Important Architectural Decisions
- Using Playwright + TypeScript (Greenfield).
- Relying on DOM selectors due to Angular SSR limitations (no `data-testid`).
- Test data is generated via **API Automation (`AdminApiService`)** (as we successfully reverse-engineered the internal admin endpoints). We use **MySQL MCP (SELECT only)** strictly for assertions and verifying state.
- Tests mutating global dashboard settings must be tagged or executed carefully to avoid parallel execution race conditions against portal tests.

## Completed Implementation
- Created initial documentation structure (`docs/` directory).
- Initialized NPM project and installed Playwright, TypeScript, and Browser binaries.
- Configured TypeScript (`tsconfig.json`) with strict typing and path aliases.
- Configured `playwright.config.ts` (Forced sequential execution, added dotenv, removed global baseURL).
- Built base folder structure (`src/pages`, `src/setup`, `src/fixtures`, `tests/`).
- Implemented `global.setup.ts` skeleton using environment variables.
- Created `BasePage.ts` with custom resilient wrapper methods.
- Created `DashboardLoginPage.ts` and `PortalLoginPage.ts` concrete page objects using process.env.
- Configured Custom Fixtures (`src/fixtures/index.ts`) encapsulating complex Admin Setup steps.
- Set up Prettier and ESLint for code quality gates.
- Created `.env` and `.env.example` files to abstract credentials (removed hardcoded credentials).
- Reverse-engineered backend User Management and Security APIs and built `AdminApiService.ts` to fully replace slow UI-based setup operations.
- Cleaned up deprecated `AdminSetup.ts` and all related UI-based setup scripts.
- Implemented and verified full suite of authentication and registration test scenarios (`tests/portal/authentication/*.spec.ts`, `tests/portal/registration/*.spec.ts`).

## Remaining Work
- Implement negative test scenarios as defined in the Test Strategy (e.g., Invalid credentials, OTP abuse).
- Implement complex chained scenario tests (OTP + Mandatory Details + Welcome Page).
- Expand test coverage into other modules beyond authentication.

## Immediate Next Task
- Select the next testing priority (e.g., chained login flows, negative scenarios) and build the required fixtures or page objects.

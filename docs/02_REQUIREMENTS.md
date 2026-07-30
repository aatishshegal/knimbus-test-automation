# Requirements & Constraints

## Functional Requirements
- **Authentication Flows**: Must support dynamic authentication for the Library Portal based on settings controlled in the Librarian Dashboard (e.g., Mandatory fields upon first login, OTP enabled/disabled).
- **Session Management**: Needs to interact with `sessionStorage` to inject and maintain session states where possible, avoiding UI login for every test to save time.
- **Test Data Strategy**: We have reverse-engineered the backend User Management and Security Settings APIs. We rely on **API Automation (`AdminApiService`)** to set up preconditions (e.g., changing settings, creating users) before tests execute. This ensures tests are highly reliable, blazingly fast, and devoid of UI flakiness during setup.
- **Cross-Browser**: Ensure compatibility across Chromium, Firefox, and WebKit engines.

## Non-Functional Requirements
- **Language**: TypeScript (straightforward object-oriented approach initially; advanced typing to be adopted progressively as the team scales).
- **Selectors**: Will rely on robust DOM selectors (roles, text, CSS) since `data-testid` cannot be guaranteed by the dev team (mostly Angular SSR).
- **Execution Speed**: Must support parallel execution to keep feedback loops fast.

## Constraints & Challenges
- **Parallel Execution vs. Global Admin Settings**: 
  - *The Problem*: Since Librarian Dashboard settings globally affect the Library Portal (like enabling OTP), running tests in parallel can cause race conditions. If Test A enables OTP on the Dashboard, and Test B is currently logging into the Portal expecting standard login, Test B will fail.
  - *Mitigation*: We will need to design our parallel execution strategy carefully. This could involve tagging tests so that configuration-mutating tests run serially, or using isolated test tenants/users if the system supports it.

## Open Questions
- CI/CD platform choice is deferred.

## Decisions Made
- Use DOM-based locators over `data-testid` due to framework limitations.
- Build fresh (Greenfield), no legacy migration needed.
- Prioritize API-based test data generation to ensure tests remain independent and reliable.

# Test Strategy

## 1. Test Pyramid & Scope
This framework focuses on the **UI / End-to-End (E2E)** layer of the Knimbus platform, covering both the Librarian Dashboard (Admin) and the Library Portal (End User). 

## 2. Risk-Based Testing Strategy
Because the Library Portal login is highly dynamic and dependent on Admin settings, authentication routing is considered a **High-Risk Area**. A failure here prevents all users from accessing the platform.

### Core Login Scenarios (Positive)
1. Standard Login → Home Page
2. Login → OTP → Home
3. Login → Mandatory Details → Home
4. Login → Welcome Page → Home
5. Chained: Login → OTP → Mandatory Details → Welcome → Home

### Negative Scenarios
1. **Access Denied**: Valid credentials but restricted by Domain Enforcement.
2. **Invalid User / Password**: Standard authentication failures.
3. **OTP Failures**: Invalid OTP, Expired OTP, Resend Abuse.
4. **Mandatory Details Failures**: Empty submissions, invalid data types.
5. **Security/Routing**: Bypassing OTP via URL manipulation, SQL Injection attempts, Concurrent Logins.

## 3. Automation Execution Approach
- **State Preparation (Admin Setup)**: Tests requiring specific tenant configurations (like OTP enabled) must utilize the Admin API (`AdminApiService`) to set the state *before* the user attempts to log in. This is handled via Playwright Fixtures to completely bypass UI flakiness during setup.
- **Dynamic Routing**: Portal login relies on `Promise.race()` to intelligently wait for the correct post-login landing page, ensuring tests do not flake due to hardcoded page transitions.

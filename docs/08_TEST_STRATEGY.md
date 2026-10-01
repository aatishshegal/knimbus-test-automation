# Test Strategy

## 1. Test Pyramid & Scope
This framework focuses on the **UI / End-to-End (E2E)** and **Integration Precondition** layers of the Knimbus platform, covering both the **Librarian Dashboard (Admin)** and the **Library Portal (End User)**.

## 2. Test Suites & Coverage Scope

### A. Library Portal (`tests/portal/`)
1. **Authentication & Password Recovery (`authentication/`)**:
   - Standard login (positive & negative flows, invalid credentials, domain enforcement).
   - OTP authentication flows, resend logic, and verification errors.
   - Forgot password with recovery email workflows.
   - Mandatory details routing, validation, and submission.
   - New-user chained flows (Login → OTP → Mandatory Details → Welcome Page → Home).
2. **User Registration (`registration/`)**:
   - Self-registration with valid domain enforcement.
   - Unverified user registration.
   - Granular field validation (mandatory fields, character limits, invalid formats).
3. **Home & Landing Page (`home/`)**:
   - Widget visibility, dynamic banners, and carousels.
   - Subjects browsing, Content types showcase, and Publishers section.
4. **Navigation & Top Bar (`navigation/`)**:
   - Main menu drawer navigation and links.
   - Global search bar trigger and persistence.
   - Profile dropdown (My Profile, My Library, Logout).
   - Language translation dropdown and notification popovers.
5. **Search & Discovery (`search/`)**:
   - Basic search, inner search query persistence, and pagination.
   - Sorting by relevance, date, and title.
   - Faceted filtering (content types, publishers, subjects, access types).
   - Detail page inspection and saved search queries.
6. **Research Plus (`research-plus/`)**:
   - Federated search query inputs (All Words, Exact Phrase, Boolean queries).
   - Resource selection modal, federated provider refresh, and aggregated search results.
   - Form field validation and reset behavior.
7. **User Profile (`profile/`)**:
   - Profile basic details, contact info, enrollment details, work and education.
   - ID document upload and access information.
   - In-app password change validation.

### B. Librarian Dashboard (`tests/admin/`)
1. **Authentication & Navigation (`auth/`, `navigation/`)**:
   - Secure admin credentials verification and session persistence.
   - Admin header controls (notifications, profile, tenant switcher).
   - Admin sidebar expandable navigation.
2. **User Management (`user-management/`)**:
   - Metrics overview cards and user counts.
   - Manage users table (search, role filters, sorting, bulk actions).
   - Add Single User modal validation and creation.
   - User profile overview (editing details, password reset, ID document approval/rejection).
   - Service groups assignment, filtering, and user allocation.

## 3. Automation Execution Approach
- **Precondition Automation (`AdminApiService`)**:
  - All test prerequisites (e.g., toggling OTP, configuring required profile fields, enabling registration) are set up via API *before* test execution.
  - Admin state is strictly restored in `afterAll` or `finally` blocks to avoid cross-test contamination.
- **Deterministic Routing**:
  - Spec files test discrete, predictable routes without dynamic guessing or `.or()` locators.
- **Granular Data-Driven Architecture**:
  - Dynamic test cases are generated via `test.describe()` using datasets from `portal-data.json` or `admin-data.json`.
  - Every rule/field check runs as an independent `test()` block for transparent HTML/CSV reporting.
  - Inputs are recorded via `test.info().annotations.push({ type: 'testData', description: ... })`.
- **Pre-Authenticated Projects**:
  - Tests utilize cached browser states from `tests/portal.setup.ts` and `tests/admin.setup.ts` to avoid redundant UI logins.

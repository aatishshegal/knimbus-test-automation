import { test as base, Browser } from '@playwright/test';
// REFACTOR: Using our path alias instead of relative import
import { DashboardLoginPage } from '@pages/dashboard/DashboardLoginPage';
import { PortalLoginPage } from '@pages/portal/PortalLoginPage';
import { MandatoryDetailsPage } from '@pages/portal/MandatoryDetailsPage';
import { WelcomePage } from '@pages/portal/WelcomePage';
import { OtpPage } from '@pages/portal/OtpPage';
import { HomePage } from '@pages/portal/HomePage';
import { TopNavigationBar } from '@pages/portal/TopNavigationBar';
import { TermsAndConditionsModal } from '@pages/portal/TermsAndConditionsModal';
import { RegistrationPage } from '@pages/portal/RegistrationPage';
import { SearchResultPage } from '@pages/portal/SearchResultPage';
import { ProfilePage } from '@pages/portal/ProfilePage';
import { MyLibraryPage } from '@pages/portal/MyLibraryPage';
import { DetailPage } from '@pages/portal/DetailPage';
import { ResearchPlusPage } from '@pages/portal/ResearchPlusPage';
import { AdminApiService } from '../api/AdminApiService';

// New API-based helper function to handle Admin Session instantly
async function withApiAdminSetup(setupLogic: (adminApi: AdminApiService) => Promise<void>) {
  const adminApi = new AdminApiService();
  await adminApi.login();
  await setupLogic(adminApi);
  await adminApi.close();
}

type MyFixtures = {
  dashboardLoginPage: DashboardLoginPage;
  portalLoginPage: PortalLoginPage;
  mandatoryDetailsPage: MandatoryDetailsPage;
  welcomePage: WelcomePage;
  otpPage: OtpPage;
  homePage: HomePage;
  topNavigationBar: TopNavigationBar;
  termsAndConditionsModal: TermsAndConditionsModal;
  registrationPage: RegistrationPage;
  searchResultPage: SearchResultPage;
  profilePage: ProfilePage;
  myLibraryPage: MyLibraryPage;
  detailPage: DetailPage;
  researchPlusPage: ResearchPlusPage;
  standardUser: { email: string, password: string };
  homePageUser: { email: string, password: string };
  otpUser: { email: string, password: string };
  mandatoryDetailsUser: { email: string, password: string };
  welcomePageUser: { email: string, password: string };
  dynamicMandatoryDetailsUser: { email: string, password: string };
  termsAndConditionUser: { email: string, password: string };
  fullMandatoryDetailsUser: { email: string, password: string };
  otpAndMandatoryUser: { email: string, password: string };
  registrationTestContext: { fullName: string, email: string, password: string };
  registrationWithMandatoryContext: { fullName: string, email: string, password: string };
  registrationOtpWelcomeContext: { fullName: string, email: string, password: string };
};

export const test = base.extend<MyFixtures>({
  dashboardLoginPage: async ({ page }, use) => {
    const dashboardLoginPage = new DashboardLoginPage(page);
    await use(dashboardLoginPage);
  },
  portalLoginPage: async ({ page }, use) => {
    const portalLoginPage = new PortalLoginPage(page);
    await use(portalLoginPage);
  },
  mandatoryDetailsPage: async ({ page }, use) => {
    const mandatoryDetailsPage = new MandatoryDetailsPage(page);
    await use(mandatoryDetailsPage);
  },
  welcomePage: async ({ page }, use) => {
    const welcomePage = new WelcomePage(page);
    await use(welcomePage);
  },
  otpPage: async ({ page }, use) => {
    const otpPage = new OtpPage(page);
    await use(otpPage);
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  topNavigationBar: async ({ page }, use) => {
    const topNavigationBar = new TopNavigationBar(page);
    await use(topNavigationBar);
  },
  termsAndConditionsModal: async ({ page }, use) => {
    const termsAndConditionsModal = new TermsAndConditionsModal(page);
    await use(termsAndConditionsModal);
  },
  registrationPage: async ({ page }, use) => {
    const registrationPage = new RegistrationPage(page);
    await use(registrationPage);
  },
  searchResultPage: async ({ page }, use) => {
    const searchResultPage = new SearchResultPage(page);
    await use(searchResultPage);
  },
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await use(profilePage);
  },
  myLibraryPage: async ({ page }, use) => {
    const myLibraryPage = new MyLibraryPage(page);
    await use(myLibraryPage);
  },
  detailPage: async ({ page }, use) => {
    const detailPage = new DetailPage(page);
    await use(detailPage);
  },
  researchPlusPage: async ({ page }, use) => {
    const researchPlusPage = new ResearchPlusPage(page);
    await use(researchPlusPage);
  },
  standardUser: async ({}, use) => {
    await withApiAdminSetup(async (adminApi) => {
      await adminApi.updateSecuritySettings({
        twoFactorAuth: false,
        automatedVerification: true,
        mandatoryFields: { isMandatory: false, fields: [] }
      });
      await adminApi.changeUserPassword(process.env.STANDARD_USER_EMAIL as string, process.env.STANDARD_USER_PASSWORD as string);
    });

    await use({
      email: process.env.STANDARD_USER_EMAIL as string,
      password: process.env.STANDARD_USER_PASSWORD as string
    });
  },
  homePageUser: async ({}, use) => {
    // The favorable backend conditions (disabling OTP/mandatory fields) and 
    // the password update for this user are now managed strictly ONCE globally 
    // by tests/global.setup.ts, rather than executing before every atomic test.

    await use({
      email: process.env.HOME_PAGE_USER_EMAIL as string,
      password: process.env.HOME_PAGE_USER_PASSWORD as string
    });
  },
  otpUser: async ({}, use) => {
    await withApiAdminSetup(async (adminApi) => {
      await adminApi.updateSecuritySettings({
        twoFactorAuth: true,
        automatedVerification: true,
        mandatoryFields: { isMandatory: false, fields: [] }
      });
      await adminApi.changeUserPassword(process.env.OTP_USER_EMAIL as string, process.env.OTP_USER_PASSWORD as string);
    });
    
    await use({ email: process.env.OTP_USER_EMAIL as string, password: process.env.OTP_USER_PASSWORD as string });
  },
  mandatoryDetailsUser: async ({}, use) => {
    const testUserEmail = process.env.MANDATORY_USER_EMAIL as string;
    const testUserPassword = process.env.MANDATORY_USER_PASSWORD as string;

    await withApiAdminSetup(async (adminApi) => {
      // Ensure the user exists and has the correct password before testing
      await adminApi.changeUserPassword(testUserEmail, testUserPassword).catch(async () => {
         await adminApi.addSingleUser("Mandatory Test User", testUserEmail);
         await adminApi.changeUserPassword(testUserEmail, testUserPassword);
      });

      await adminApi.updateSecuritySettings({
        mandatoryFields: { isMandatory: false, fields: [] }
      });
      await adminApi.updateSecuritySettings({
        twoFactorAuth: false,
        mandatoryFields: { isMandatory: true, fields: ['Gender', 'Designation', 'Degree/Program'] }
      });
      await adminApi.clearUserProfileFields(testUserEmail, "Mandatory Test User");
    });

    await use({ 
      email: testUserEmail, 
      password: testUserPassword 

    });
  },
  welcomePageUser: async ({}, use) => {
    const timestamp = Date.now();
    const testUserEmail = `welcomeuser_${timestamp}@yopmail.com`;
    const username = `Welcome User ${timestamp}`;

    await withApiAdminSetup(async (adminApi) => {
      await adminApi.addSingleUser(username, testUserEmail);
      await adminApi.changeUserPassword(testUserEmail, process.env.STANDARD_USER_PASSWORD as string);
      await adminApi.updateSecuritySettings({
        twoFactorAuth: false,
        automatedVerification: true,
        mandatoryFields: { isMandatory: false, fields: [] }
      });
    });

    await use({ 
      email: testUserEmail, 
      password: process.env.STANDARD_USER_PASSWORD as string 
    });
  },
  dynamicMandatoryDetailsUser: async ({}, use) => {
    const timestamp = Date.now();
    const testUserEmail = `mandatoryuser_${timestamp}@yopmail.com`;
    const username = `Mandatory User ${timestamp}`;

    await withApiAdminSetup(async (adminApi) => {
      await adminApi.addSingleUser(username, testUserEmail);
      await adminApi.changeUserPassword(testUserEmail, process.env.STANDARD_USER_PASSWORD as string);
      await adminApi.updateSecuritySettings({
        mandatoryFields: { isMandatory: false, fields: [] }
      });
      await adminApi.updateSecuritySettings({
        twoFactorAuth: false,
        automatedVerification: true,
        mandatoryFields: { isMandatory: true, fields: ['Gender', 'Department'] }
      });
    });

    await use({ 
      email: testUserEmail, 
      password: process.env.STANDARD_USER_PASSWORD as string 
    });
  },
  termsAndConditionUser: async ({}, use) => {
    await withApiAdminSetup(async (adminApi) => {
      await adminApi.updateSecuritySettings({
        twoFactorAuth: false,
        automatedVerification: true,
        mandatoryFields: { isMandatory: false, fields: [] }
      });
      await adminApi.changeUserPassword(process.env.TC_USER_EMAIL as string, process.env.TC_USER_PASSWORD as string);
    });

    await use({
      email: process.env.TC_USER_EMAIL as string,
      password: process.env.TC_USER_PASSWORD as string
    });
  },
  fullMandatoryDetailsUser: async ({}, use) => {
    const timestamp = Date.now();
    const testUserEmail = `fullmandatory_${timestamp}@yopmail.com`;
    const username = `Full Mandatory ${timestamp}`;

    await withApiAdminSetup(async (adminApi) => {
      await adminApi.addSingleUser(username, testUserEmail);
      await adminApi.changeUserPassword(testUserEmail, process.env.STANDARD_USER_PASSWORD as string);
      
      await adminApi.updateSecuritySettings({
        mandatoryFields: { isMandatory: false, fields: [] }
      });
      await adminApi.updateSecuritySettings({
        twoFactorAuth: false,
        automatedVerification: true,
        mandatoryFields: { isMandatory: true, fields: ['Gender', 'Department', 'Degree/Program', 'Designation', 'Batch', 'Nationality', 'ID Document'] }
      });
    });

    await use({ 
      email: testUserEmail, 
      password: process.env.STANDARD_USER_PASSWORD as string 
    });
  },
  otpAndMandatoryUser: async ({}, use) => {
    const timestamp = Date.now();
    const testUserEmail = `otpandmandatory_${timestamp}@yopmail.com`;
    const username = `OTP Mandatory ${timestamp}`;

    await withApiAdminSetup(async (adminApi) => {
      await adminApi.addSingleUser(username, testUserEmail);
      await adminApi.changeUserPassword(testUserEmail, process.env.STANDARD_USER_PASSWORD as string);
      
      await adminApi.updateSecuritySettings({
        mandatoryFields: { isMandatory: false, fields: [] }
      });
      await adminApi.updateSecuritySettings({
        twoFactorAuth: true,
        automatedVerification: true,
        mandatoryFields: { isMandatory: true, fields: ['Gender', 'Department', 'Degree/Program', 'Designation', 'Batch', 'Nationality', 'ID Document'] }
      });
    });

    await use({ 
      email: testUserEmail, 
      password: process.env.STANDARD_USER_PASSWORD as string 
    });
  },
  registrationTestContext: async ({}, use) => {
    await withApiAdminSetup(async (adminApi) => {
      await adminApi.updateSecuritySettings({
        mandatoryFields: { fields: [], isMandatory: false }
      });
      await adminApi.updateSecuritySettings({
        selfRegistration: true,
        twoFactorAuth: false,
        automatedVerification: true
      });
    });
    
    const timestamp = Date.now();
    await use({ 
      fullName: `Sign Up User ${timestamp}`,
      email: `signup_${timestamp}@yopmail.com`, 
      password: process.env.STANDARD_USER_PASSWORD as string 
    });
  },
  registrationWithMandatoryContext: async ({ browser }, use) => {
    const timestamp = Date.now();
    const testUserEmail = `signup_${timestamp}@yopmail.com`;
    const fields = ['Gender', 'Department', 'Degree/Program', 'Designation', 'Batch', 'Nationality', 'ID Document'];

    await withApiAdminSetup(async (adminApi) => {
      // First, disable all fields to ensure a clean state
      await adminApi.updateSecuritySettings({
        mandatoryFields: { fields: [], isMandatory: false }
      });

      // Then, enable only the required ones
      await adminApi.updateSecuritySettings({
        selfRegistration: true,
        twoFactorAuth: false,
        automatedVerification: true,
        mandatoryFields: { fields, isMandatory: true }
      });
    });
    
    
    await use({ 
      fullName: `Sign Up User ${timestamp}`,
      email: testUserEmail, 
      password: process.env.STANDARD_USER_PASSWORD as string 
    });
  },
  registrationOtpWelcomeContext: async ({}, use) => {
    const timestamp = Date.now();
    const testUserEmail = `syd011use${timestamp}@yopmail.com`; // Using a unique yopmail for each run
    const allFields = ['Gender', 'Department', 'Degree/Program', 'Designation', 'Batch', 'Nationality', 'ID Document'];

    await withApiAdminSetup(async (adminApi) => {
      await adminApi.updateSecuritySettings({
        mandatoryFields: { fields: [], isMandatory: false }
      });
      await adminApi.updateSecuritySettings({
        selfRegistration: true,
        twoFactorAuth: true,
        automatedVerification: true
      });
    });

    await use({ 
      fullName: `Test User ${timestamp}`,
      email: testUserEmail, 
      password: process.env.STANDARD_USER_PASSWORD as string 
    });
  },
});

export { expect } from '@playwright/test';

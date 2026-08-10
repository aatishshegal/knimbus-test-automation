import { test as setup } from '@playwright/test';
import { AdminApiService } from '../src/api/AdminApiService';

setup('Global Admin API Setup for Post-Login Automation', async ({}) => {
  const adminApi = new AdminApiService();
  await adminApi.login();

  console.log('[Global Setup] Updating Tenant Security Settings (Favorable Preconditions)...');
  await adminApi.updateSecuritySettings({
    twoFactorAuth: false,
    automatedVerification: true,
    mandatoryFields: { isMandatory: false, fields: [] },
    domainRestriction: []
  });

  const email = process.env.HOME_PAGE_USER_EMAIL as string;
  const password = process.env.HOME_PAGE_USER_PASSWORD as string;

  console.log(`[Global Setup] Ensuring correct password for ${email}...`);
  await adminApi.changeUserPassword(email, password).catch(async () => {
    // If the user doesn't exist, create it first
    await adminApi.addSingleUser("Home Automation", email);
    await adminApi.changeUserPassword(email, password);
  });

  await adminApi.close();
  console.log('[Global Setup] Backend configuration complete.');
});

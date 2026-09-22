import { test as setup, expect } from '../src/fixtures';
import { AdminDashboardLoginPage } from '../src/pages/admin/AdminDashboardLoginPage';

// Force an empty storage state so setup always gets a fresh browser
setup.use({ storageState: { cookies: [], origins: [] } });

setup('Admin UI Setup - Cache Admin Session', async ({ browser }) => {
  console.log('[Admin Setup] Caching Admin Session...');
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const adminDashboard = new AdminDashboardLoginPage(adminPage);
  
  const adminEmail = process.env.ADMIN_TEST_EMAIL as string;
  const adminPassword = process.env.ADMIN_TEST_PASSWORD as string;
  if (!adminEmail || !adminPassword) throw new Error("Admin credentials not defined in .env");
  
  await adminDashboard.navigate();
  await adminDashboard.login(adminEmail, adminPassword);
  await expect(adminPage).toHaveTitle(/.*Codec Network.*/i, { timeout: 15000 });
  await adminContext.storageState({ path: '.auth/admin.json' });
  await adminContext.close();
  console.log('[Admin Setup] Admin session cached successfully!');
});

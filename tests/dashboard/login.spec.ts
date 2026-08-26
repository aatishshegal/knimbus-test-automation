import { test, expect } from '../../src/fixtures';

test.describe('Librarian Dashboard Authentication', () => {

  test('Verify Admin can log in successfully', async ({ dashboardLoginPage, page }) => {
    // 1. Arrange & Act
    // We grab the credentials securely from our .env file
    const username = process.env.ADMIN_USER as string;
    const password = process.env.ADMIN_PASSWORD as string;

    // dashboardLoginPage is magically injected by our fixtures!
    await dashboardLoginPage.login(username, password);

    // 2. Assert
    // Verify that we land on the dashboard after logging in
    await expect(page).toHaveURL(/.*dashboard/);
  });

});

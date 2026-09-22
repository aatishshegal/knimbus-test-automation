import re

with open('tests/admin/user-management/manage-users.spec.ts', 'r') as f:
    content = f.read()

# 1. Add testEmail8 and testEmail9 declarations
content = re.sub(
    r"(const testEmail7 = adminData\.userManagement\.newUserData\.email\.replace\('@', `\$\{baseTimestamp\}7@`\);)",
    r"\1\n  const testEmail8 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}8@`);\n  const testEmail9 = adminData.userManagement.newUserData.email.replace('@', `${baseTimestamp}9@`);",
    content
)

# 2. Append the two tests before the first Delete test
new_tests = """
  test('TC_UserMgmt_ManageUsers_Table_SendNotification_UnassignedUser_EmailOnly', async ({ page }) => {
    const dashboard = new AdminDashboardLoginPage(page);
    await dashboard.sidebar.navigateToAddSingleUser();
    const addUserPage = new AddSingleUserPage(page);
    const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail8 };
    delete userToCreate.serviceGroup;
    await addUserPage.fillRegistrationForm(userToCreate);
    await addUserPage.submitForm();

    const toastLocator = page.locator('.swal2-toast, .swal2-popup');
    await expect(toastLocator).toBeVisible({ timeout: 15000 });
    await expect(toastLocator).not.toBeVisible();

    await dashboard.sidebar.navigateToManageUsers();
    const manageUsersPage = new ManageUsersPage(page);
    if (await manageUsersPage.clearSearchBtn.isVisible()) {
      await manageUsersPage.clearSearchBtn.click();
    }
    await manageUsersPage.searchForUser(testEmail8);
    await manageUsersPage.clickSendNotification(testEmail8);

    const modal = page.locator('.modal.show, .modal').filter({ hasText: 'Send Notification' });
    await expect(modal).toBeVisible();

    const emailOption = modal.getByText('Email (On email & web portal)');
    await expect(emailOption).toBeVisible();

    const pushOption = modal.getByText('Push (On mobile app & in-app)');
    await expect(pushOption).not.toBeVisible();

    const bothOption = modal.getByText('Both (On email, web portal, mobile app & in-app)');
    await expect(bothOption).not.toBeVisible();
    
    const cancelBtn = modal.getByRole('button', { name: 'Cancel' });
    if (await cancelBtn.isVisible()) await cancelBtn.click();
  });

  test('TC_UserMgmt_ManageUsers_Table_SendNotification_AssignedUser_MultipleOptions', async ({ page }) => {
    const dashboard = new AdminDashboardLoginPage(page);
    await dashboard.sidebar.navigateToAddSingleUser();
    const addUserPage = new AddSingleUserPage(page);
    const userToCreate = { ...adminData.userManagement.newUserData, email: testEmail9 };
    await addUserPage.fillRegistrationForm(userToCreate);
    await addUserPage.submitForm();

    const toastLocator = page.locator('.swal2-toast, .swal2-popup');
    await expect(toastLocator).toBeVisible({ timeout: 15000 });
    await expect(toastLocator).not.toBeVisible();

    await dashboard.sidebar.navigateToManageUsers();
    const manageUsersPage = new ManageUsersPage(page);
    if (await manageUsersPage.clearSearchBtn.isVisible()) {
      await manageUsersPage.clearSearchBtn.click();
    }
    await manageUsersPage.searchForUser(testEmail9);
    await manageUsersPage.verifyAssignedServiceGroup(testEmail9, userToCreate.serviceGroup as string);
    await manageUsersPage.clickSendNotification(testEmail9);

    const modal = page.locator('.modal.show, .modal').filter({ hasText: 'Send Notification' });
    await expect(modal).toBeVisible();

    const emailOption = modal.getByText('Email (On email & web portal)');
    await expect(emailOption).toBeVisible();

    const pushOption = modal.getByText('Push (On mobile app & in-app)');
    await expect(pushOption).toBeVisible();

    const bothOption = modal.getByText('Both (On email, web portal, mobile app & in-app)');
    await expect(bothOption).toBeVisible();

    const cancelBtn = modal.getByRole('button', { name: 'Cancel' });
    if (await cancelBtn.isVisible()) await cancelBtn.click();
  });
"""

content = re.sub(
    r"(\s+test\('TC_UserMgmt_ManageUsers_DeleteSingleUser_Cancel', async \(\{ page \}\) => \{)",
    new_tests + r"\n\1",
    content
)

with open('tests/admin/user-management/manage-users.spec.ts', 'w') as f:
    f.write(content)

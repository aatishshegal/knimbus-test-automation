import re

with open('tests/admin/user-management/manage-users.spec.ts', 'r') as f:
    content = f.read()

# 1. Remove beforeAll and afterAll completely
content = re.sub(r'test\.beforeAll\(async \(\) => \{.*?\n  \}\);', '', content, flags=re.DOTALL)
content = re.sub(r'/\*\s*test\.afterAll\(async \(\{ browser \}\) => \{.*?\n  \}\);\s*\*/', '', content, flags=re.DOTALL)
content = re.sub(r'test\.afterAll\(async \(\{ browser \}\) => \{.*?\n  \}\);', '', content, flags=re.DOTALL)

# 2. Add a helper function at the top for API setup
helper = """
  async function createApiUser(email: string) {
    const adminApi = new AdminApiService();
    await adminApi.initFromState();
    await adminApi.addSingleUser(adminData.userManagement.newUserData.userName, email);
    await adminApi.close();
  }
"""
content = content.replace("test.beforeEach(async ({ page }) => {", helper + "\n  test.beforeEach(async ({ page }) => {")

# 3. Inject API creation into tests that need testEmail1
content = re.sub(
    r"(test\('.*?', async \(\{ page \}\) => \{\n)(\s+const manageUsersPage = new ManageUsersPage\(page\);\n)(\s+await manageUsersPage\.searchForUser\(testEmail1\);)",
    r"\1\2\n    // Precondition: Create user via API\n    await createApiUser(testEmail1);\n\3",
    content
)
# Special case for Cancel Selection (needs testEmail2 and testEmail3)
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_Table_CancelSelection', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1\n    await createApiUser(testEmail2);\n    await createApiUser(testEmail3);\n",
    content
)
# Special case for Delete Bulk (needs testEmail2 and testEmail3)
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk_Cancel', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1\n    await createApiUser(testEmail2);\n    await createApiUser(testEmail3);\n",
    content
)
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1\n    await createApiUser(testEmail2);\n    await createApiUser(testEmail3);\n",
    content
)
# Special case for Search (needs testEmail1)
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_Search', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1\n    await createApiUser(testEmail1);\n",
    content
)

# 4. Inject cleanup at the end of tests that don't delete their users
cleanup_1 = "\n    // Cleanup\n    if (await manageUsersPage.clearSearchBtn.isVisible()) await manageUsersPage.clearSearchBtn.click();\n    await manageUsersPage.searchForUser(testEmail1);\n    await manageUsersPage.deleteUser(testEmail1);\n  });"
content = re.sub(r"  \}\);\n(?=  test\('TC_UserMgmt_ManageUsers_BulkExportAllToast')", cleanup_1 + "\n", content) # Search test

with open('tests/admin/user-management/manage-users.spec.ts', 'w') as f:
    f.write(content)

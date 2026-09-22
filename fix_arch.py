import re

with open('tests/admin/user-management/manage-users.spec.ts', 'r') as f:
    content = f.read()

# 1. Remove beforeAll and afterAll completely
content = re.sub(r'test\.beforeAll\(async \(\) => \{.*?\n    \}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'/\*\s*test\.afterAll\(async \(\{ browser \}\) => \{.*?\n    \}\);\s*\*/\n', '', content, flags=re.DOTALL)
content = re.sub(r'test\.afterAll\(async \(\{ browser \}\) => \{.*?\n    \}\);\n', '', content, flags=re.DOTALL)

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

# 3. Inject API creation into tests
# TC_UserMgmt_ManageUsers_Search
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_Search', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail1);\n",
    content
)
# TC_UserMgmt_ManageUsers_BulkExportAllToast
# No user needed

# TC_UserMgmt_ManageUsers_Table_CancelSelection
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_Table_CancelSelection', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail2);\n        await createApiUser(testEmail3);\n",
    content
)
# TC_UserMgmt_ManageUsers_Table_UserDetailsOverview
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_Table_UserDetailsOverview', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail1);\n",
    content
)
# TC_UserMgmt_ManageUsers_Table_SendNotification_Cancel
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_Table_SendNotification_Cancel', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail1);\n",
    content
)
# TC_UserMgmt_ManageUsers_Table_ExportUsageLog
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_Table_ExportUsageLog', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail1);\n",
    content
)
# TC_UserMgmt_ManageUsers_DeleteSingleUser_Cancel
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_DeleteSingleUser_Cancel', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail1);\n",
    content
)
# TC_UserMgmt_ManageUsers_DeleteSingleUser
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_DeleteSingleUser', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail1);\n",
    content
)
# TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk_Cancel
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk_Cancel', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail2);\n        await createApiUser(testEmail3);\n",
    content
)
# TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk
content = re.sub(
    r"(test\('TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk', async \(\{ page \}\) => \{\n\s+const manageUsersPage = new ManageUsersPage\(page\);\n)",
    r"\1        await createApiUser(testEmail2);\n        await createApiUser(testEmail3);\n",
    content
)

with open('tests/admin/user-management/manage-users.spec.ts', 'w') as f:
    f.write(content)

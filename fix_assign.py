import re

with open('tests/admin/user-management/manage-users.spec.ts', 'r') as f:
    content = f.read()

# Fix tests 4, 5, 6, 7 to delete serviceGroup
content = re.sub(
    r"(const userToCreate = \{ \.\.\.adminData\.userManagement\.newUserData, email: (testEmail[4567]) \};)",
    r"\1\n        delete userToCreate.serviceGroup;",
    content
)

with open('tests/admin/user-management/manage-users.spec.ts', 'w') as f:
    f.write(content)

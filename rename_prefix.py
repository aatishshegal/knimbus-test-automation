import re

with open('tests/admin/user-management/manage-users.spec.ts', 'r') as f:
    content = f.read()

# Replace the specific prefix
content = content.replace("TC_Manage Users ", "TC_Manage_Users ")

with open('tests/admin/user-management/manage-users.spec.ts', 'w') as f:
    f.write(content)

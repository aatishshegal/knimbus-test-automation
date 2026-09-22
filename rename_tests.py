import re

replacements = {
    "TC_UserMgmt_ManageUsers_Search": "TC_Manage Users Search for user by email",
    "TC_UserMgmt_ManageUsers_BulkExportAllToast": "TC_Manage Users Bulk export all users shows success toast",
    "TC_UserMgmt_ManageUsers_Table_SearchNoResults": "TC_Manage Users Search with invalid term shows no results",
    "TC_UserMgmt_ManageUsers_Table_CancelSelection": "TC_Manage Users Cancel bulk selection unchecks all boxes",
    "TC_UserMgmt_ManageUsers_Table_UserDetailsOverview": "TC_Manage Users Click on user row opens user profile overview",
    "TC_UserMgmt_ManageUsers_Table_AssignGroup": "TC_Manage Users Assign service group updates the user table",
    "TC_UserMgmt_ManageUsers_Table_AssignGroupWithDate": "TC_Manage Users Assign service group with future date updates the user table",
    "TC_UserMgmt_ManageUsers_Table_AssignGroup_ExpiredValidation": "TC_Manage Users Assign service group without future date shows expired validation",
    "TC_UserMgmt_ManageUsers_Table_AssignGroup_Cancel": "TC_Manage Users Cancel service group assignment discards changes",
    "TC_UserMgmt_ManageUsers_Table_SendNotification_Cancel": "TC_Manage Users Cancel send notification discards modal",
    "TC_UserMgmt_ManageUsers_Table_ExportUsageLog": "TC_Manage Users Export usage log opens export modal",
    "TC_UserMgmt_ManageUsers_Table_SendNotification_UnassignedUser_EmailOnly": "TC_Manage Users Send notification pop up shows only Email option for unassigned user",
    "TC_UserMgmt_ManageUsers_Table_SendNotification_AssignedUser_MultipleOptions": "TC_Manage Users Send notification pop up shows multiple options for user assigned to service group",
    "TC_UserMgmt_ManageUsers_DeleteSingleUser_Cancel": "TC_Manage Users Cancel single user deletion discards changes",
    "TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk_Cancel": "TC_Manage Users Cancel bulk user deletion discards changes",
    "TC_UserMgmt_ManageUsers_DeleteSingleUser": "TC_Manage Users Delete single user removes them from table",
    "TC_UserMgmt_ManageUsers_DeleteMultipleUsersBulk": "TC_Manage Users Delete multiple selected users removes them from table"
}

with open('tests/admin/user-management/manage-users.spec.ts', 'r') as f:
    content = f.read()

for old_name, new_name in replacements.items():
    content = content.replace(old_name, new_name)

with open('tests/admin/user-management/manage-users.spec.ts', 'w') as f:
    f.write(content)

import { APIRequestContext, request } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export class AdminApiService {
  private apiContext: APIRequestContext | null = null;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DASHBOARD_URL || 'https://qa.knimbus.com';
    // We assume the API is at the same base domain. Adjust if API is on a different subdomain.
    // In our capture, login was at https://qa.knimbus.com/login
  }

  /**
   * Initializes the API context and authenticates the user.
   * This MUST be called before any other methods.
   */
  async login(username = process.env.ADMIN_USER as string, password = process.env.ADMIN_PASSWORD as string) {
    console.log(`[AdminApiService] Authenticating ${username} via API...`);
    this.apiContext = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });

    const loginRes = await this.apiContext.post('/login', {
      data: { username, password }
    });

    if (!loginRes.ok()) {
      throw new Error(`API Login failed with status: ${loginRes.status()}`);
    }
    
    // Also add logging just like the UI does (optional, but good for parity)
    await this.apiContext.post('/ws/addLogging', {
      data: { action: "Login", actionValue: "Login Success" }
    });
    
    console.log(`[AdminApiService] API Authentication successful.`);
  }

  /**
   * Helper to ensure the API context is initialized.
   */
  private getContext(): APIRequestContext {
    if (!this.apiContext) {
      throw new Error('AdminApiService is not authenticated. Call login() first.');
    }
    return this.apiContext;
  }

  /**
   * Fetches the current library configuration (DTO) from the server.
   */
  private async getElibraryDTO() {
    const context = this.getContext();
    const res = await context.get('/ws/getElibraryDTO');
    if (!res.ok()) throw new Error(`Failed to fetch Elibrary DTO: ${res.status()}`);
    return await res.json();
  }

  /**
   * Saves the modified library configuration (DTO) back to the server.
   */
  private async saveElibraryDTO(dto: any) {
    const context = this.getContext();
    // Send the exact same DTO to the distinct API endpoints for each setting
    // The backend extracts the relevant field based on the endpoint called.
    const endpoints = [
      '/ws/updateRegistrationDomain',
      '/ws/updateSelfRegnStatus',
      '/ws/updateAutomatedUserApprovalStatus',
      '/ws/updateTwoFactorAuthStatus',
      '/ws/updateLibraryCustomFields',
      '/ws/updateLibraryAuthDenials'
    ];

    for (const endpoint of endpoints) {
      console.log(`[API Admin] Sending update to ${endpoint}...`);
      const res = await context.post(endpoint, {
        data: dto
      });
      
      if (!res.ok()) {
        const text = await res.text();
        throw new Error(`Failed to update admin settings at ${endpoint}: ${res.status()} ${text}`);
      }
    }
    
    console.log('[API Admin] Successfully updated all security settings via distinct endpoints.');
  }

  /**
   * Batch updates multiple security settings in a single API call for maximum performance.
   * Only the provided properties in `settings` will be updated.
   */
  async updateSecuritySettings(settings: {
    selfRegistration?: boolean;
    automatedVerification?: boolean;
    twoFactorAuth?: boolean;
    domainRestriction?: string[];
    authDenyPatterns?: { denialPatterns: string[], allowedPatterns: string[] | null };
    mandatoryFields?: { fields: string[], isMandatory: boolean };
  }) {
    console.log('[AdminApiService] Fetching current security settings...');
    const dto = await this.getElibraryDTO();
    let needsSave = false;
    
    const info = dto.elibraryInfoDTO;

    if (settings.selfRegistration !== undefined && info.isSelfRegnAllowed !== settings.selfRegistration) {
      console.log(`[AdminApiService] Updating Self Registration -> ${settings.selfRegistration}`);
      info.isSelfRegnAllowed = settings.selfRegistration;
      needsSave = true;
    }

    if (settings.automatedVerification !== undefined && info.isAutomatedApprovalEnabled !== settings.automatedVerification) {
      console.log(`[AdminApiService] Updating Automated Verification -> ${settings.automatedVerification}`);
      info.isAutomatedApprovalEnabled = settings.automatedVerification;
      needsSave = true;
    }

    if (settings.twoFactorAuth !== undefined && info.is2FAEnabled !== settings.twoFactorAuth) {
      console.log(`[AdminApiService] Updating Two-Factor Auth -> ${settings.twoFactorAuth}`);
      info.is2FAEnabled = settings.twoFactorAuth;
      needsSave = true;
    }

    if (settings.domainRestriction !== undefined) {
      // The API expects a comma-separated string (e.g. "yopmail.com, test.com" or just "yopmail.com")
      // An empty array means no restriction (empty string)
      const domainString = settings.domainRestriction.join(', ');
      // The API might store it as null if empty, or just empty string. Let's use empty string.
      const currentDomainString = info.eLibRegistrationDomain || '';
      if (currentDomainString !== domainString) {
         console.log(`[AdminApiService] Updating Domain Restriction -> [${domainString}]`);
         info.eLibRegistrationDomain = domainString;
         needsSave = true;
      }
    }

    if (settings.authDenyPatterns !== undefined) {
      console.log(`[AdminApiService] Updating Auth Denial Patterns -> ${JSON.stringify(settings.authDenyPatterns)}`);
      info.authDenyPatterns = settings.authDenyPatterns;
      needsSave = true;
    }

    if (settings.mandatoryFields) {
      const customFields = JSON.parse(info.eLibCustomFields || '[]');
      let fieldsChanged = false;
      
      for (const field of customFields) {
        if (settings.mandatoryFields.isMandatory) {
          // If fields array is empty, enable ALL fields. Otherwise, only enable the specific ones in the array.
          const shouldBeMandatory = settings.mandatoryFields.fields.length === 0 ? true : settings.mandatoryFields.fields.includes(field.fieldName);
          if (field.isMandatory !== shouldBeMandatory) {
            field.isMandatory = shouldBeMandatory;
            fieldsChanged = true;
          }
        } else {
          // If isMandatory is false and fields array is empty, disable ALL mandatory fields.
          // Otherwise, only disable the specific fields in the array.
          if (settings.mandatoryFields.fields.length === 0) {
            if (field.isMandatory) {
              field.isMandatory = false;
              fieldsChanged = true;
            }
          } else {
            if (settings.mandatoryFields.fields.includes(field.fieldName) && field.isMandatory) {
              field.isMandatory = false;
              fieldsChanged = true;
            }
          }
        }
      }
      
      if (fieldsChanged) {
        console.log(`[AdminApiService] Updating Mandatory Fields -> ${settings.mandatoryFields.fields.join(', ')} to ${settings.mandatoryFields.isMandatory}`);
        info.eLibCustomFields = JSON.stringify(customFields);
        needsSave = true;
      }
    }

    if (needsSave) {
      console.log('[AdminApiService] Saving updated security settings...');
      await this.saveElibraryDTO(dto);
      console.log('[AdminApiService] Security settings saved successfully.');
    } else {
      console.log('[AdminApiService] Security settings already match desired state. No update needed.');
    }
  }

  /**
   * Adds a new single user via the User Management API.
   */
  async addSingleUser(username: string, email: string) {
    console.log(`[AdminApiService] Creating new user: ${username} (${email})...`);
    const context = this.getContext();
    const dto = await this.getElibraryDTO();
    
    if (!dto.organizationDTO?.orgId || !dto.elibraryInfoDTO?.libraryId) {
       throw new Error("Unable to extract orgId or libraryId from DTO");
    }

    const payload = {
      orgId: dto.organizationDTO.orgId,
      libraryId: dto.elibraryInfoDTO.libraryId,
      role: "STUDENT",
      userName: username,
      email: email,
      isVerified: true,
      contentGroupIds: []
    };

    const res = await context.post('/ws/addNewUser', { data: payload });
    if (!res.ok()) throw new Error(`Failed to add user via API: ${res.status()}`);
    console.log(`[AdminApiService] User ${email} created successfully.`);
  }

  /**
   * Changes the password for a given user via API.
   */
  async changeUserPassword(email: string, newPassword: string) {
    console.log(`[AdminApiService] Changing password for ${email}...`);
    const context = this.getContext();
    const userId = email.replace('@', '_');

    const payload = {
      userId: userId,
      email: email,
      password: newPassword,
      confirmPassword: newPassword
    };

    const res = await context.post('/ws/resetUserPassword', { data: payload });
    if (!res.ok()) throw new Error(`Failed to change password via API: ${res.status()}`);
    
    await context.post('/ws/addLogging', {
      data: { action: "Update Password", actionValue: userId, version: "4.0" }
    });
    console.log(`[AdminApiService] Password for ${email} updated successfully.`);
  }

  /**
   * Clears specific profile fields for a user, forcing the mandatory details form.
   */
  async clearUserProfileFields(email: string, username: string) {
    console.log(`[AdminApiService] Clearing profile fields for ${email}...`);
    const context = this.getContext();
    const dto = await this.getElibraryDTO();
    const userId = email.replace('@', '_');
    
    const payload = {
      loginId: userId,
      libraryId: dto.elibraryInfoDTO.libraryId,
      userName: username,
      raExpiryDate: null,
      isExpiryDateModified: "",
      alternateEmail: "",
      contactNos: "",
      userType: "",
      gender: "",
      isVerified: true,
      staffId: "",
      affiliation: "",
      department: "",
      degree: "",
      designation: "",
      speciality: "",
      rank: "",
      batch: "",
      cadre: "",
      year: "",
      contentGroupIds: [],
      groupId: "",
      membershipStatus: "",
      membershipType: ""
    };

    const res = await context.post('/ws/updateRAUser', { data: payload });
    if (!res.ok()) throw new Error(`Failed to clear user fields via API: ${res.status()}`);
    console.log(`[AdminApiService] User profile fields cleared successfully.`);
  }

  /**
   * Disposes the underlying API context to free resources.
   */
  async close() {
    if (this.apiContext) {
      await this.apiContext.dispose();
      this.apiContext = null;
    }
  }
}

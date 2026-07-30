import { AdminApiService } from './src/api/AdminApiService';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const adminApi = new AdminApiService();
    await adminApi.login();
    await adminApi.updateSecuritySettings({
        selfRegistration: true,
        automatedVerification: false,
        twoFactorAuth: false,
        domainRestriction: [], 
        authDenyPatterns: { denialPatterns: [], allowedPatterns: null },
        mandatoryFields: { 
            fields: ['Gender', 'Department', 'Degree/Program', 'Designation', 'Batch', 'Nationality', 'ID Document'], 
            isMandatory: true 
        }
    });
    console.log("Admin setup complete");
    await adminApi.close();
}
run().catch(console.error);

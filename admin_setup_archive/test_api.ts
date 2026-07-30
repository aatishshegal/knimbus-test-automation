import { AdminApiService } from './src/api/AdminApiService';

async function run() {
  const adminApi = new AdminApiService();
  await adminApi.login();
  const context = adminApi['getContext']();
  const dto = await adminApi['getElibraryDTO']();
  
  const payload = {
      libraryId: dto.elibraryInfoDTO.libraryId,
      authDenyPatterns: { denialPatterns: ["gmail.com"], allowedPatterns: null }
  };
  
  // Let's try some common update endpoints
  const endpoints = [
      '/ws/updateAuthDenyPatterns',
      '/ws/updateAuthDenySettings',
      '/ws/updateRegistrationDomain',
      '/ws/updateElibraryInfo'
  ];
  
  for (const ep of endpoints) {
      console.log(`Trying ${ep}...`);
      const res = await context.post(ep, { data: payload });
      console.log(`Status: ${res.status()}`);
      if (res.ok()) {
          console.log(`Success on ${ep}!`);
      }
  }
}
run();

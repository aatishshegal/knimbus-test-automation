import { AdminApiService } from './src/api/AdminApiService';

async function run() {
  const adminApi = new AdminApiService();
  await adminApi.login();
  const context = adminApi['getContext']();
  const dto = await adminApi['getElibraryDTO']();
  
  dto.elibraryInfoDTO.authDenyPatterns = {
      denialPatterns: ["gmail.com"],
      allowedPatterns: null
  };
  
  const endpoints = [
      '/ws/updateAuthDenyPattern',
      '/ws/updateAuthDenyPatterns',
      '/ws/updateAuthDenySettings',
      '/ws/updateAuthDenialSettings',
      '/ws/updateAuthDeny',
      '/ws/updateDenialPatterns',
      '/ws/updateAuthDenialPattern',
      '/ws/addAuthDenyPattern'
  ];
  
  for (const ep of endpoints) {
      const res = await context.post(ep, { data: dto });
      console.log(`${ep}: ${res.status()}`);
  }
}
run();

import { AdminApiService } from './src/api/AdminApiService';

async function run() {
  const adminApi = new AdminApiService();
  await adminApi.login();
  const context = adminApi['getContext']();
  const dto = await adminApi['getElibraryDTO']();
  
  // Set authDenyPatterns
  dto.elibraryInfoDTO.authDenyPatterns = {
      denialPatterns: ["gmail.com"],
      allowedPatterns: null
  };
  
  const payload = {
      libraryId: dto.elibraryInfoDTO.libraryId,
      authDenyPatterns: dto.elibraryInfoDTO.authDenyPatterns
  };

  const res = await context.post('/ws/updateAuthDenyPatterns', { data: payload });
  console.log('updateAuthDenyPatterns status:', res.status());
  
  const payload2 = {
      libraryId: dto.elibraryInfoDTO.libraryId,
      ...dto.elibraryInfoDTO
  };
  const res2 = await context.post('/ws/updateLibraryInfo', { data: payload2 });
  console.log('updateLibraryInfo status:', res2.status());
  
  // Also try /ws/saveElibraryDTO
  const res3 = await context.post('/ws/saveElibraryDTO', { data: dto });
  console.log('saveElibraryDTO status:', res3.status());
}
run();

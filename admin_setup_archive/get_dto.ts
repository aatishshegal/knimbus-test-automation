import { AdminApiService } from './src/api/AdminApiService';

async function run() {
  const adminApi = new AdminApiService();
  await adminApi.login();
  const dto = await adminApi['getElibraryDTO']();
  console.log(JSON.stringify(dto.elibraryInfoDTO.authDenyPatterns, null, 2));
}
run();

import { AdminApiService } from './src/api/AdminApiService';

async function check() {
    const api = new AdminApiService();
    await api.login();
    const dto = await (api as any).getElibraryDTO();
    const fields = JSON.parse(dto.elibraryInfoDTO.eLibCustomFields);
    console.log(JSON.stringify(fields, null, 2));
    await api.close();
}
check();

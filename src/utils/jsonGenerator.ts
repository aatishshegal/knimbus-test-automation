import * as fs from 'fs';
import * as path from 'path';

export class JsonGenerator {
  static generateJson(filePath: string, data: any) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

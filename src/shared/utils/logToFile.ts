import fs from 'fs';

export function logToFile(data: any, filePath = './log.txt') {
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonString, 'utf8');
  console.log(`Data has been logged to ${filePath}`);
}
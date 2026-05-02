import fs from 'fs';
const base64 = fs.readFileSync('src/assets/logo.png', 'base64');
console.log(base64.substring(0, 100)); // just to see
fs.writeFileSync('src/assets/logoBase64.ts', `export const logoBase64 = "data:image/png;base64,${base64}";`);
console.log('done!');

import fs from 'fs';
import path from 'path';

const src = path.join(process.cwd(), 'public', 'ghar-ka-swaad-logo.png');
const destDir = path.join(process.cwd(), 'src', 'assets');
const dest = path.join(destDir, 'logo.png');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Logo copied successfully to src/assets/logo.png');
} else {
  console.log('Source logo not found');
}

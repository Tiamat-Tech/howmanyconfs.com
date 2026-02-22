const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'cryptocurrency-icons', 'svg', 'color');
const dest = path.join(__dirname, '..', 'public', 'crypto-icons');

if (!fs.existsSync(src)) {
	console.log('cryptocurrency-icons not installed, skipping icon copy');
	process.exit(0);
}

fs.mkdirSync(dest, { recursive: true });

const files = fs.readdirSync(src).filter(f => f.endsWith('.svg'));
for (const file of files) {
	fs.copyFileSync(path.join(src, file), path.join(dest, file));
}

console.log(`Copied ${files.length} crypto icons to public/crypto-icons/`);

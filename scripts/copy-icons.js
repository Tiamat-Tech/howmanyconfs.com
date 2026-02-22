const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'crypto-icons-plus-128', 'src');
const dest = path.join(__dirname, '..', 'public', 'crypto-icons');

if (!fs.existsSync(src)) {
	console.log('crypto-icons-plus-128 not installed, skipping icon copy');
	process.exit(0);
}

fs.mkdirSync(dest, { recursive: true });

const files = fs.readdirSync(src).filter(f => f.endsWith('.png'));
for (const file of files) {
	fs.copyFileSync(path.join(src, file), path.join(dest, file));
}

console.log(`Copied ${files.length} crypto icons to public/crypto-icons/`);

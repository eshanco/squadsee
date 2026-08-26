import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(__dirname, 'icon-source.svg');
const outDir = path.join(root, 'public', 'icons');

mkdirSync(outDir, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

// Maskable icon needs safe-zone padding (~20%) since the OS may crop to a shape.
const maskablePadding = 0.2;

for (const { file, size } of targets) {
  await sharp(src).resize(size, size).png().toFile(path.join(outDir, file));
  console.log(`Wrote ${file}`);
}

const maskableSize = 512;
const innerSize = Math.round(maskableSize * (1 - maskablePadding * 2));
await sharp(src)
  .resize(innerSize, innerSize)
  .extend({
    top: Math.round((maskableSize - innerSize) / 2),
    bottom: Math.round((maskableSize - innerSize) / 2),
    left: Math.round((maskableSize - innerSize) / 2),
    right: Math.round((maskableSize - innerSize) / 2),
    background: '#166534',
  })
  .png()
  .toFile(path.join(outDir, 'icon-512-maskable.png'));
console.log('Wrote icon-512-maskable.png');

await sharp(src).resize(32, 32).png().toFile(path.join(root, 'public', 'favicon.png'));
console.log('Wrote favicon.png');

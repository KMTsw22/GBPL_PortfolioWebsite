import sharp from 'sharp';
import { readFileSync } from 'fs';

const SRC = 'app/apple-icon-Photoroom.png';

const buf = readFileSync(SRC);
const meta = await sharp(buf).metadata();
console.log(`source: ${meta.width}x${meta.height}`);

const trimmed = await sharp(buf).trim({ threshold: 5 }).toBuffer();
const tMeta = await sharp(trimmed).metadata();
console.log(`trimmed: ${tMeta.width}x${tMeta.height}`);

const side = Math.max(tMeta.width, tMeta.height);
const padX = Math.floor((side - tMeta.width) / 2);
const padY = Math.floor((side - tMeta.height) / 2);

async function makeSquare(size, outPath) {
  await sharp(trimmed)
    .extend({
      top: padY,
      bottom: side - tMeta.height - padY,
      left: padX,
      right: side - tMeta.width - padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`wrote ${outPath} (${size}x${size})`);
}

await makeSquare(256, 'app/icon.png');
await makeSquare(512, 'app/apple-icon.png');
await makeSquare(1024, 'public/gpbl-logo.png');

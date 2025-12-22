#!/usr/bin/env node

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgBuffer = readFileSync(join(__dirname, '../public/icon.svg'));

const sizes = [192, 512];

async function generateIcons() {
  console.log('Generating app icons...');

  for (const size of sizes) {
    const outputPath = join(__dirname, `../public/icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  console.log('Done! All icons generated successfully.');
}

generateIcons().catch(console.error);

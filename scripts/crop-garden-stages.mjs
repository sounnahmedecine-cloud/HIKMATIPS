// One-time script: crop the 7-stage plant sprite sheet into individual transparent PNGs.
// Source: public/assets/ChatGPT Image 23 juil. 2026, 12_03_58.png (1254x1254, magenta chroma-key bg)
// The plants are laid out in a loose 4x2 grid but are NOT perfectly aligned to fixed cell
// boundaries (taller trees bleed slightly across row lines), so instead of cropping fixed
// rectangles we chroma-key the whole canvas first, then find the 7 connected components.
// Run: node scripts/crop-garden-stages.mjs

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const SRC = path.resolve('public/assets/ChatGPT Image 23 juil. 2026, 12_03_58.png');
const OUT_DIR = path.resolve('public/assets/garden');

// Soft chroma-key with spill suppression: pixels are scored by how "magenta" they are
// (min(r,b) - g). Below LOW = fully transparent background. Above HIGH = fully opaque,
// unchanged. In between, alpha ramps linearly and the magenta tint is desaturated
// proportionally to alpha, so anti-aliased edges don't leave a pink fringe.
const LOW = 60;
const HIGH = 150;

function keyPixel(r, g, b) {
  // diff large => strongly magenta (background). diff small => foreground.
  const diff = Math.min(r, b) - g;
  if (diff >= HIGH) return { alpha: 0, r, g, b };
  if (diff <= LOW) return { alpha: 255, r, g, b };
  const t = (HIGH - diff) / (HIGH - LOW); // 1 at LOW (foreground), 0 at HIGH (background)
  const alpha = Math.round(t * 255);
  const newR = Math.round(g + (r - g) * t);
  const newB = Math.round(g + (b - g) * t);
  return { alpha, r: newR, g, b: newB };
}

function isMagenta(r, g, b) {
  return keyPixel(r, g, b).alpha === 0;
}

function findComponents(data, width, height) {
  const visited = new Uint8Array(width * height);
  const components = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;
      const alpha = data[idx * 4 + 3];
      if (alpha === 0) {
        visited[idx] = 1;
        continue;
      }
      // BFS flood fill
      let minX = x, maxX = x, minY = y, maxY = y, size = 0;
      const stack = [idx];
      visited[idx] = 1;
      while (stack.length) {
        const cur = stack.pop();
        const cx = cur % width;
        const cy = (cur - cx) / width;
        size++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        const neighbors = [
          [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nIdx = ny * width + nx;
          if (visited[nIdx]) continue;
          if (data[nIdx * 4 + 3] === 0) {
            visited[nIdx] = 1;
            continue;
          }
          visited[nIdx] = 1;
          stack.push(nIdx);
        }
      }
      if (size > 800) {
        components.push({ minX, maxX, minY, maxY, size });
      }
    }
  }
  return components;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const img = sharp(SRC).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  for (let p = 0; p < data.length; p += 4) {
    const { alpha, r, g, b } = keyPixel(data[p], data[p + 1], data[p + 2]);
    data[p] = r;
    data[p + 1] = g;
    data[p + 2] = b;
    data[p + 3] = alpha;
  }

  const components = findComponents(data, width, height);
  console.log(`Found ${components.length} components`);

  // Reading order: row band first (top half vs bottom half of canvas), then left-to-right.
  const midY = height / 2;
  components.sort((a, b) => {
    const aRow = (a.minY + a.maxY) / 2 < midY ? 0 : 1;
    const bRow = (b.minY + b.maxY) / 2 < midY ? 0 : 1;
    if (aRow !== bRow) return aRow - bRow;
    return (a.minX + a.maxX) / 2 - (b.minX + b.maxX) / 2;
  });

  const flat = sharp(data, { raw: { width, height, channels: 4 } });

  for (let i = 0; i < components.length; i++) {
    const c = components[i];
    const pad = 4;
    const left = Math.max(0, c.minX - pad);
    const top = Math.max(0, c.minY - pad);
    const w = Math.min(width, c.maxX + pad) - left;
    const h = Math.min(height, c.maxY + pad) - top;

    const outPath = path.join(OUT_DIR, `stage-${i}.png`);
    await sharp(data, { raw: { width, height, channels: 4 } })
      .extract({ left, top, width: w, height: h })
      .png()
      .toFile(outPath);

    console.log(`stage-${i}.png <- bbox [${left},${top},${w}x${h}], size=${c.size}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// One-time script: trim the 3 book cover renders to their content bounds.
// The sources already have a proper transparent background (checked via sharp metadata:
// hasAlpha true, real alpha=0 background pixels) — the "white" seen in image previews was
// just the preview tool compositing transparency onto white. So no color-keying needed,
// just trim the transparent margin and copy into public/bibilio/covers/.
// Run: node scripts/crop-library-covers.mjs

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public/bibilio/covers');

const SOURCES = [
  { src: 'public/bibilio/50-qr-aquida.png', out: 'book-1-preuves-unicite.png' },
  { src: 'public/bibilio/Lecon-importante.png', out: 'book-2-lecons-importantes.png' },
  { src: 'public/bibilio/explictaion-lecon-importante.png', out: 'book-3-commentaire-lecons.png' },
  { src: 'public/bibilio/40-nawawi.png', out: 'book-4-nawawi.png' },
  { src: 'public/bibilio/Coran-fr.png', out: 'book-5-coran-fr.png' },
  { src: 'public/bibilio/Kitab-tawhid.png', out: 'book-6-kitab-tawhid.png' },
  { src: 'public/bibilio/1702628153.png', out: 'book-7-riyad-salihin.png' },
  { src: 'public/bibilio/1711639217.png', out: 'book-8-veritable-confiance.png' },
  { src: 'public/bibilio/2.png', out: 'book-9-ainsi-etaient.png' },
  { src: 'public/bibilio/Repentir-sincere.png', out: 'book-10-repentir.png' },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const { src, out } of SOURCES) {
    const outPath = path.join(OUT_DIR, out);
    const image = sharp(path.resolve(src)).trim();
    const { width, height } = await image.metadata();
    await image.toFile(outPath);
    console.log(`${out} <- trimmed to ${width}x${height}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Copies the pdf.js worker from node_modules into public/ so the PDF reader can load it
// as a same-origin static asset (required for the static export + Capacitor Android
// WebView, which has no network-independent way to fetch a CDN-hosted worker offline).
// Run automatically via the postinstall script; re-run manually after bumping react-pdf.

import { copyFileSync, existsSync } from 'fs';
import path from 'path';

const SRC = path.resolve('node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const DEST = path.resolve('public/pdf.worker.min.mjs');

if (!existsSync(SRC)) {
  console.warn('pdf.worker.min.mjs not found in node_modules/pdfjs-dist — skipping copy.');
  process.exit(0);
}

copyFileSync(SRC, DEST);
console.log('Copied pdf.worker.min.mjs to public/.');

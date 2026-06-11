// Build-Skript für Vercel:
// 1. Kopiert alle statischen Dateien in den .vercel/output Ordner.
// 2. Bereinigt CSS-Dateien im Output-Ordner mit PurgeCSS.
// 3. Erstellt die API-Funktionen.
// WICHTIG: Dieses Skript verändert NIE die Originaldateien in /js oder /css.

import { PurgeCSS } from 'purgecss';
import fs from 'fs';
import { cp, rm, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT = path.join(__dirname, '.vercel/output');
const STATIC = path.join(OUTPUT, 'static');
const FUNCS = path.join(OUTPUT, 'functions');

// Hauptfunktion, die den gesamten Build-Prozess steuert
async function buildAll() {
  // 1. Output-Verzeichnis säubern und neu erstellen
  await setupOutputDirectory();

  // 2. Alle statischen Dateien kopieren (HTML, CSS, JS, Bilder, etc.)
  await copyStaticFiles();

  // 3. PurgeCSS auf die kopierten CSS-Dateien im Output-Verzeichnis anwenden
  await runPurgeCSS();

  // 4. Serverless-Funktionsdateien erstellen
  await createApiFunctions();

  console.log('\n✅ Build-Prozess erfolgreich abgeschlossen!\n');
}

async function setupOutputDirectory() {
  console.log('Erstelle .vercel/output/ (Build Output API v3)...\n');
  await rm(OUTPUT, { recursive: true, force: true });
  await mkdir(STATIC, { recursive: true });
  await mkdir(FUNCS, { recursive: true });
  await writeFile(path.join(OUTPUT, 'config.json'), JSON.stringify({ version: 3 }, null, 2));
}

async function copyStaticFiles() {
  console.log('Kopiere statische Dateien...\n');
  const staticItems = [
    'index.html', '404.html', 'SafeNet-Security-Dokumentation.html',
    'googlefae0c7a5792e2ee4.html', 'manifest.json', 'sw.js',
    'robots.txt', 'sitemap.xml', 'de', 'en', 'css', 'js', 'images',
  ];
  for (const item of staticItems) {
    if (fs.existsSync(item)) {
      await cp(item, path.join(STATIC, item), { recursive: true });
      console.log(`  ✓ static/${item}`);
    }
  }
}

async function runPurgeCSS() {
  console.log('\nBereinige ungenutztes CSS mit PurgeCSS...');
  try {
    const purgeCSSResults = await new PurgeCSS().purge({
      content: [path.join(STATIC, '**/*.html'), path.join(STATIC, 'js/**/*.js')],
      css: [path.join(STATIC, 'css/**/*.css')],
      safelist: [/^se-/, /^ph-/, 'hidden', 'active', 'correct', 'wrong', 'show', /^fz-/, /^bb-/, /^rd-/, /^rw-/, /^kl-/, /^kl2-/, 'mobile-sichtbar', 'swal2-container', 'swal2-popup', 'swal2-title', 'swal2-html-container', 'swal2-actions', 'swal2-confirm', 'swal2-deny', 'swal2-cancel', 'swal2-icon', 'swal2-success', 'swal2-error', 'swal2-warning', 'swal2-info', 'swal2-question']
    });
    for (const result of purgeCSSResults) {
      await writeFile(result.file, result.css, 'utf-8');
      console.log(`  ✓ CSS optimiert: ${path.basename(result.file)}`);
    }
  } catch (err) {
    console.error(`  ✗ Fehler bei PurgeCSS: ${err.message}`);
  }
}

async function createApiFunctions() {
  console.log('\nErstelle API-Funktionen...\n');
  const apiFunctions = [
    'chat', 'news', 'vault', 'delete-account', 'login-benachrichtigung',
  ];

  for (const name of apiFunctions) {
    const funcDir = `${FUNCS}/api/${name}.func`;
    await mkdir(funcDir, { recursive: true });
    await cp(`api/${name}.js`, `${funcDir}/index.js`);
    await writeFile(`${funcDir}/.vc-config.json`, JSON.stringify({ runtime: 'edge', entrypoint: 'index.js' }, null, 2));
    console.log(`  ✓ function: /api/${name}`);
  }

  console.log('\n  .vercel/output/ erfolgreich erstellt!\n');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

// Starte den Build-Prozess
buildAll().catch(err => {
  console.error('\nEin unerwarteter Fehler ist im Build-Prozess aufgetreten:');
  console.error(err);
  process.exit(1);
});

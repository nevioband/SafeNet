// Build-Skript für Vercel:
// 1. Kopiert alle statischen Dateien in den .vercel/output Ordner.
// 2. Bereinigt CSS-Dateien im Output-Ordner mit PurgeCSS.
// 3. Minifiziert JS-Dateien im Output-Ordner mit Terser.
// 4. Erstellt die API-Funktionen.
// WICHTIG: Dieses Skript verändert NIE die Originaldateien in /js oder /css.

import { minify } from 'terser';
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

  // 4. Terser auf die kopierten JS-Dateien im Output-Verzeichnis anwenden
  await runMinifyJS();

  // 5. Serverless-Funktionsdateien erstellen
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

async function runMinifyJS() {
  const targetJsDir = path.join(STATIC, 'js');
  const files = fs.readdirSync(targetJsDir).filter(f => f.endsWith('.js'));
  let ok = 0;
  let fail = 0;

  console.log(`\nMinifiziere ${files.length} JS-Dateien im Output-Verzeichnis...\n`);

  for (const file of files) {
    const filePath = path.join(targetJsDir, file);
    const source = fs.readFileSync(filePath, 'utf-8');
    const isModule = /^\s*(import[\s{*"'`]|export\s)/m.test(source);

    try {
      const result = await minify(source, {
        module: isModule,
        compress: { drop_console: false, passes: 2 },
        mangle: true,
        format: { comments: false },
      });

      if (result.code) {
        const vorher = source.length;
        const nachher = result.code.length;
        const ersparnis = Math.round((1 - nachher / vorher) * 100);
        await writeFile(filePath, result.code, 'utf-8');
        console.log(`  ✓ ${file.padEnd(40)} ${formatBytes(vorher)} → ${formatBytes(nachher)} (-${ersparnis}%)`);
        ok++;
      }
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nFertig: ${ok} Dateien minifiziert${fail > 0 ? `, ${fail} Fehler` : ''}`);
  if (fail > 0) {
    console.error('\nBuild fehlgeschlagen wegen Minifizierungs-Fehlern.');
    process.exit(1);
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

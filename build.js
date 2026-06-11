// Build-Script: Minifiziert alle JS-Dateien in /js/ mit Terser
// Wird von Vercel vor dem Deployment ausgeführt: "buildCommand": "node build.js"

import { minify } from 'terser';
import fs from 'fs';
import { cp, rm, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JS_DIR = path.join(__dirname, 'js');

async function buildAll() {
  const files = fs.readdirSync(JS_DIR).filter(f => f.endsWith('.js'));
  let ok = 0;
  let fail = 0;

  console.log(`\nMinifiziere ${files.length} JS-Dateien...\n`);

  for (const file of files) {
    const filePath = path.join(JS_DIR, file);
    const source = fs.readFileSync(filePath, 'utf-8');

    // ES-Module erkennen (haben import/export-Statements)
    // Auch minifizierte Formen wie import{...} oder import* abdecken
    const isModule = /^\s*(import[\s{*"'`]|export\s)/m.test(source);

    try {
      const result = await minify(source, {
        module: isModule,
        compress: {
          drop_console: false,   // console.log beibehalten (für Debugging im Prod)
          passes: 2,
        },
        mangle: true,
        format: {
          comments: false,       // Alle Kommentare entfernen
        },
      });

      if (result.code) {
        const vorher = source.length;
        const nachher = result.code.length;
        const ersparnis = Math.round((1 - nachher / vorher) * 100);
        fs.writeFileSync(filePath, result.code, 'utf-8');
        console.log(`  ✓ ${file.padEnd(40)} ${formatBytes(vorher)} → ${formatBytes(nachher)} (-${ersparnis}%)`);
        ok++;
      }
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nFertig: ${ok} Dateien minifiziert${fail > 0 ? `, ${fail} Fehler` : ''}\n`);

  if (fail > 0) process.exit(1);

  // Schritt 2: Vercel Build Output API-Format erstellen
  await buildVercelOutput();
}

async function buildVercelOutput() {
  const OUTPUT = '.vercel/output';
  const STATIC  = `${OUTPUT}/static`;
  const FUNCS   = `${OUTPUT}/functions`;

  console.log('Erstelle .vercel/output/ (Build Output API v3)...\n');

  await rm(OUTPUT, { recursive: true, force: true });
  await mkdir(STATIC,  { recursive: true });
  await mkdir(FUNCS,   { recursive: true });

  // config.json – minimale v3-Konfiguration
  await writeFile(`${OUTPUT}/config.json`, JSON.stringify({ version: 3 }, null, 2));

  // Statische Dateien → .vercel/output/static/
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

  // API-Funktionen → .vercel/output/functions/api/<name>.func/
  const apiFunctions = [
    'chat', 'news', 'vault', 'delete-account', 'login-benachrichtigung',
  ];

  for (const name of apiFunctions) {
    const funcDir = `${FUNCS}/api/${name}.func`;
    await mkdir(funcDir, { recursive: true });
    await cp(`api/${name}.js`, `${funcDir}/index.js`);
    await writeFile(
      `${funcDir}/.vc-config.json`,
      JSON.stringify({ runtime: 'edge', entrypoint: 'index.js' }, null, 2)
    );
    console.log(`  ✓ function: /api/${name}`);
  }

  console.log('\n  .vercel/output/ erfolgreich erstellt!\n');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

buildAll();

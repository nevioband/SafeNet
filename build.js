// Build-Script: Minifiziert alle JS-Dateien in /js/ mit Terser
// Wird von Vercel vor dem Deployment ausgeführt: "buildCommand": "node build.js"

import { minify } from 'terser';
import fs from 'fs';
import { cp, rm, mkdir } from 'fs/promises';
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

  // Schritt 2: public/ Verzeichnis für Vercel erstellen
  await buildPublic();
}

async function buildPublic() {
  console.log('Erstelle public/ Verzeichnis...\n');

  await rm('public', { recursive: true, force: true });
  await mkdir('public', { recursive: true });

  const items = [
    'index.html',
    '404.html',
    'SafeNet-Security-Dokumentation.html',
    'googlefae0c7a5792e2ee4.html',
    'manifest.json',
    'sw.js',
    'robots.txt',
    'sitemap.xml',
    'de',
    'en',
    'css',
    'js',
    'images',
  ];

  for (const item of items) {
    if (fs.existsSync(item)) {
      await cp(item, path.join('public', item), { recursive: true });
      console.log(`  ✓ ${item}`);
    }
  }

  console.log('\n  public/ erfolgreich erstellt!\n');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

buildAll();

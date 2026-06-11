import { PurgeCSS } from 'purgecss';
import fs from 'fs';
import path from 'path';

async function cleanupSourceCSS() {
  console.log('\nStarte Bereinigung der originalen CSS-Dateien...\n');

  try {
    const purgeCSSResults = await new PurgeCSS().purge({
      // Sucht nach verwendeten Klassen in allen HTML- und JS-Dateien
      content: [
        '**/*.html',
        'js/**/*.js'
      ],
      // Zielt direkt auf deine originalen CSS-Dateien ab
      css: ['css/**/*.css'],
      // Schützt Klassen, die dein JavaScript dynamisch einfügt
      safelist: [/^se-/, /^ph-/, 'hidden', 'active', 'correct', 'wrong', 'show']
    });

    let savedTotal = 0;

    for (const result of purgeCSSResults) {
      if (fs.existsSync(result.file)) {
        const vorher = fs.statSync(result.file).size;
        const nachher = Buffer.byteLength(result.css, 'utf8');
        savedTotal += (vorher - nachher);

        // Überschreibt die Originaldatei mit der bereinigten Version
        fs.writeFileSync(result.file, result.css, 'utf-8');
        console.log(`  ✓ ${path.basename(result.file)} bereinigt`);
      }
    }
    console.log(`\nFertig! Insgesamt wurden ${Math.round(savedTotal / 1024)} KB an ungenutztem CSS aus deinem Quellcode gelöscht.\n`);
  } catch (err) {
    console.error(`  ✗ Fehler bei der Bereinigung: ${err.message}`);
  }
}

cleanupSourceCSS();
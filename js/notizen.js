import { supabase } from './supabase.js';

const istEnglisch = /^\/en(\/|$)/.test(window.location.pathname) || document.documentElement.lang === 'en';

const texte = istEnglisch
  ? {
      neueNotiz: 'New note',
      titelNeu: 'Untitled note',
      leereListe: 'No notes match your filter yet.',
      ordnerPrompt: 'Name for the new folder:',
      ordnerLeer: 'Please enter a folder name.',
      ordnerExistiert: 'This folder already exists.',
      ordnerLoeschenAuswahl: 'Select a folder first (not "All notes").',
      ordnerLoeschenLetzter: 'You cannot delete the last folder.',
      ordnerLoeschenFrage: 'Delete this folder including all contained notes?',
      loeschenFrage: 'Delete this note permanently?',
      gespeichert: 'Saved',
      geradeJetzt: 'Just now',
      standardInhalt: '## Summary\nWrite your key points here.\n\n## Checklist\n- [ ] First step\n- [ ] Second step\n\n## Important\n> Add an important detail here.',
      standardNotiz: 'Welcome note',
      vorlageTitel: '\n## Heading\n',
      vorlageCheck: '\n- [ ] Task\n',
      vorlageInfo: '\n> Info: ...\n',
      ordnerStandard: 'General',
      cloudSync: 'Cloud sync',
      cloudNichtEingeloggt: 'Cloud: local only (not signed in)',
      cloudLade: 'Cloud: syncing ...',
      cloudFertig: 'Cloud: up to date',
      cloudFehler: 'Cloud: unavailable (local storage remains active)',
      cloudKonfliktLokal: 'Cloud: local version uploaded',
      cloudKonfliktRemote: 'Cloud: newer version loaded',
      cloudManuellStart: 'Cloud: manual sync running ...',
      cloudManuellFertig: 'Cloud: manual sync completed',
      cloudOffline: 'Cloud: offline mode',
      cloudTimeout: 'Cloud: timeout (please try manual sync)',
      importieren: 'Import',
      exportieren: 'Export',
      schriftgroesseOhneAuswahl: 'Please select text first.',
      textFormatOhneAuswahl: 'Please select text in the note first.',
      importFehlerDatei: 'Import failed: file could not be read.',
      importFehlerFormat: 'Import failed: invalid format.',
      importErfolg: 'Import successful.',
      exportDateiname: 'safenet-notes',
      groesseSehrKlein: 'Very small',
      groesseKlein: 'Small',
      groesseMittel: 'Medium',
      groesseGross: 'Large',
      groesseSehrGross: 'Very large',
      groesseGemischt: 'Mixed',
      angepinntStatus: 'Pinned',
      nichtAngepinntStatus: 'Not pinned',
      exportFormatTxt: 'Text (.txt)',
      exportFormatHtml: 'HTML (.html)',
      exportFormatDoc: 'Word (.doc)',
      exportErstelltAm: 'Created on',
      exportOrdner: 'Folder',
      exportTitel: 'Title',
      exportAngepinnt: 'Pinned',
      exportGeaendert: 'Updated',
      exportInhalt: 'Content',
      exportJa: 'Yes',
      exportNein: 'No',
      exportDokumentTitel: 'SafeNet Notes Export'
    }
  : {
      neueNotiz: 'Neue Notiz',
      titelNeu: 'Unbenannte Notiz',
      leereListe: 'Es gibt noch keine Notiz für diesen Filter.',
      ordnerPrompt: 'Name für den neuen Ordner:',
      ordnerLeer: 'Bitte gib einen Ordnernamen ein.',
      ordnerExistiert: 'Dieser Ordner existiert bereits.',
      ordnerLoeschenAuswahl: 'Wähle zuerst einen Ordner aus (nicht "Alle Notizen").',
      ordnerLoeschenLetzter: 'Der letzte Ordner kann nicht gelöscht werden.',
      ordnerLoeschenFrage: 'Diesen Ordner inklusive aller enthaltenen Notizen löschen?',
      loeschenFrage: 'Diese Notiz wirklich dauerhaft löschen?',
      gespeichert: 'Gespeichert',
      geradeJetzt: 'Gerade eben',
      standardInhalt: '## Zusammenfassung\nSchreibe hier die wichtigsten Punkte.\n\n## Checkliste\n- [ ] Erster Schritt\n- [ ] Zweiter Schritt\n\n## Wichtig\n> Ergänze hier wichtige Details.',
      standardNotiz: 'Willkommensnotiz',
      vorlageTitel: '\n## Überschrift\n',
      vorlageCheck: '\n- [ ] Aufgabe\n',
      vorlageInfo: '\n> Info: ...\n',
      ordnerStandard: 'Allgemein',
      cloudSync: 'Cloud-Sync',
      cloudNichtEingeloggt: 'Cloud: nur lokal (nicht eingeloggt)',
      cloudLade: 'Cloud: synchronisiere ...',
      cloudFertig: 'Cloud: aktuell',
      cloudFehler: 'Cloud: nicht verfügbar (lokaler Speicher bleibt aktiv)',
      cloudKonfliktLokal: 'Cloud: lokale Version hochgeladen',
      cloudKonfliktRemote: 'Cloud: neuere Version geladen',
      cloudManuellStart: 'Cloud: manueller Sync läuft ...',
      cloudManuellFertig: 'Cloud: manueller Sync abgeschlossen',
      cloudOffline: 'Cloud: Offline-Modus',
      cloudTimeout: 'Cloud: Zeitüberschreitung (bitte manuell syncen)',
      importieren: 'Import',
      exportieren: 'Export',
      schriftgroesseOhneAuswahl: 'Bitte markiere zuerst einen Text.',
      textFormatOhneAuswahl: 'Bitte markiere zuerst einen Text in der Notiz.',
      importFehlerDatei: 'Import fehlgeschlagen: Datei konnte nicht gelesen werden.',
      importFehlerFormat: 'Import fehlgeschlagen: Ungültiges Format.',
      importErfolg: 'Import erfolgreich.',
      exportDateiname: 'safenet-notizen',
      groesseSehrKlein: 'Sehr klein',
      groesseKlein: 'Klein',
      groesseMittel: 'Mittel',
      groesseGross: 'Gross',
      groesseSehrGross: 'Sehr gross',
      groesseGemischt: 'Gemischt',
      angepinntStatus: 'Angepinnt',
      nichtAngepinntStatus: 'Nicht angepinnt',
      exportFormatTxt: 'Text (.txt)',
      exportFormatHtml: 'HTML (.html)',
      exportFormatDoc: 'Word (.doc)',
      exportErstelltAm: 'Erstellt am',
      exportOrdner: 'Ordner',
      exportTitel: 'Titel',
      exportAngepinnt: 'Angepinnt',
      exportGeaendert: 'Geändert',
      exportInhalt: 'Inhalt',
      exportJa: 'Ja',
      exportNein: 'Nein',
      exportDokumentTitel: 'SafeNet Notizen Export'
    };

const speicherSchluessel = 'safenet_notizen_v1';
const supabaseTokenKey = 'sb-dygrabyaiyessqmjdprc-auth-token';
const cloudSyncIntervallMs = 20000;
const cloudTabellen = {
  ordner: 'notiz_ordner',
  notizen: 'notiz_notizen',
  titel: 'notiz_titel',
  inhalt: 'notiz_inhalt'
};

const elemente = {
  ordnerListe: document.getElementById('ordnerListe'),
  notizenListe: document.getElementById('notizenListe'),
  suche: document.getElementById('notizenSuche'),
  nurAngepinnt: document.getElementById('nurAngepinnt'),
  notizAnlegen: document.getElementById('notizAnlegen'),
  ordnerAnlegen: document.getElementById('ordnerAnlegen'),
  ordnerLoeschen: document.getElementById('ordnerLoeschen'),
  titel: document.getElementById('notizTitel'),
  inhalt: document.getElementById('notizInhalt'),
  angepinnt: document.getElementById('notizAngepinnt'),
  loeschen: document.getElementById('notizLoeschen'),
  status: document.getElementById('speicherStatus'),
  cloudStatus: document.getElementById('cloudStatus'),
  cloudSyncBtn: document.getElementById('cloudSyncBtn'),
  importBtn: document.getElementById('notizenImportBtn'),
  exportBtn: document.getElementById('notizenExportBtn'),
  exportDropdown: document.getElementById('exportDropdown'),
  exportMenue: document.getElementById('exportMenue'),
  importDatei: document.getElementById('notizenImportDatei'),
  textFett: document.getElementById('textFett'),
  textKursiv: document.getElementById('textKursiv'),
  textUnterstrichen: document.getElementById('textUnterstrichen'),
  schriftgroesseDropdown: document.getElementById('schriftgroesseDropdown'),
  schriftgroesseToggle: document.getElementById('schriftgroesseToggle'),
  schriftgroesseMenue: document.getElementById('schriftgroesseMenue'),
  schriftgroesseLabel: document.getElementById('schriftgroesseLabel'),
  zurueckZuOrdnern: document.getElementById('zurueckZuOrdnern'),
  zurueckZuNotizen: document.getElementById('zurueckZuNotizen'),
  vorlageTitel: document.getElementById('vorlageTitel'),
  vorlageCheck: document.getElementById('vorlageCheckliste'),
  vorlageInfo: document.getElementById('vorlageInfo')
};

const zustand = {
  ordner: [],
  notizen: [],
  aktiverOrdner: 'alle',
  aktiveNotizId: null,
  suchbegriff: '',
  nurAngepinnt: false,
  autoSpeichernTimer: null,
  cloudTimer: null,
  cloudIntervall: null,
  cloudVerfuegbar: true,
  userId: null,
  laufenderCloudSync: false,
  mobileSchritt: 'ordner',
  zuletztGeaendertGlobal: Date.now(),
  letzteEditorAuswahl: null
};

const schriftgroessenStufen = [12, 14, 18, 24, 32];

function istMobilAnsicht() { return window.innerWidth <= 768; }
function setzeCloudStatus(text) { if (elemente.cloudStatus) elemente.cloudStatus.textContent = text; }
function istOffline() { return !navigator.onLine; }
function markiereAenderung() { zustand.zuletztGeaendertGlobal = Date.now(); }
function erstelleId() { return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function jetztIso() { return new Date().toISOString(); }

function setzeMobilSchritt(schritt) {
  zustand.mobileSchritt = schritt;
  aktualisiereMobileAnsicht();
}

function aktualisiereMobileAnsicht() {
  const panels = {
    ordner: document.querySelector('.ordner-panel'),
    notizen: document.querySelector('.liste-panel'),
    editor: document.querySelector('.editor-panel')
  };

  if (!istMobilAnsicht()) {
    Object.values(panels).forEach((panel) => panel?.classList.add('mobile-sichtbar'));
    return;
  }

  Object.entries(panels).forEach(([schritt, panel]) => {
    if (!panel) return;
    panel.classList.toggle('mobile-sichtbar', schritt === zustand.mobileSchritt);
  });
}

async function mitTimeout(promise, timeoutMs = 10000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

function gibLetzteAenderung(notizen) {
  if (!Array.isArray(notizen) || notizen.length === 0) return 0;
  return notizen.reduce((max, notiz) => {
    const zeit = new Date(notiz.geaendertAm || notiz.erstelltAm || 0).getTime();
    return Math.max(max, Number.isFinite(zeit) ? zeit : 0);
  }, 0);
}

function datenAusPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (!Array.isArray(payload.ordner) || !Array.isArray(payload.notizen) || payload.ordner.length === 0) return null;
  return { ordner: payload.ordner, notizen: payload.notizen };
}

function inhaltAlsHtml(inhalt) {
  const text = String(inhalt || '');
  if (/<[^>]+>/.test(text)) return text;
  return entitaetenSichern(text).replace(/\n/g, '<br>');
}

function htmlAlsText(html) {
  const container = document.createElement('div');
  container.innerHTML = String(html || '');
  return container.textContent || container.innerText || '';
}

function speichereEditorAuswahl() {
  const feld = elemente.inhalt;
  const auswahl = window.getSelection();
  if (!feld || !auswahl || auswahl.rangeCount === 0) return;
  const range = auswahl.getRangeAt(0);
  if (!feld.contains(range.commonAncestorContainer)) return;
  zustand.letzteEditorAuswahl = range.cloneRange();
}

function stelleEditorAuswahlWiederHer() {
  const feld = elemente.inhalt;
  if (!feld || !zustand.letzteEditorAuswahl) return false;
  const auswahl = window.getSelection();
  feld.focus();
  auswahl.removeAllRanges();
  auswahl.addRange(zustand.letzteEditorAuswahl);
  return true;
}

function bereiteEditorFormatierungVor() {
  if (!stelleEditorAuswahlWiederHer()) {
    window.alert(texte.textFormatOhneAuswahl);
    return null;
  }

  const feld = elemente.inhalt;
  const auswahl = window.getSelection();
  if (!feld || !auswahl || auswahl.rangeCount === 0 || auswahl.isCollapsed) {
    window.alert(texte.textFormatOhneAuswahl);
    return null;
  }

  const range = auswahl.getRangeAt(0);
  if (!feld.contains(range.commonAncestorContainer)) {
    window.alert(texte.textFormatOhneAuswahl);
    return null;
  }

  return { feld, auswahl, range };
}

function formatiereText(befehl) {
  const vorbereitet = bereiteEditorFormatierungVor();
  if (!vorbereitet) return;
  document.execCommand(befehl, false, null);
  speichereEditorAuswahl();
  planeAutospeichern();
}

function normalisiereImportDaten(rohdaten) {
  if (!rohdaten || typeof rohdaten !== 'object') return null;
  const quelle = rohdaten?.daten && typeof rohdaten.daten === 'object' ? rohdaten.daten : rohdaten;
  const daten = datenAusPayload(quelle);
  if (!daten) return null;

  const ordner = daten.ordner
    .map((eintrag) => ({
      id: String(eintrag?.id || erstelleId()),
      name: String(eintrag?.name || texte.ordnerStandard).trim() || texte.ordnerStandard
    }))
    .filter((eintrag, index, arr) => eintrag.id && arr.findIndex((x) => x.id === eintrag.id) === index);

  if (ordner.length === 0) return null;
  const ordnerIds = new Set(ordner.map((eintrag) => eintrag.id));
  const fallbackOrdnerId = ordner[0].id;

  const notizen = daten.notizen
    .map((eintrag) => {
      const notizId = String(eintrag?.id || erstelleId());
      const ordnerId = ordnerIds.has(String(eintrag?.ordnerId || '')) ? String(eintrag.ordnerId) : fallbackOrdnerId;
      const zeit = jetztIso();
      return {
        id: notizId,
        ordnerId,
        titel: String(eintrag?.titel || texte.titelNeu).trim() || texte.titelNeu,
        inhalt: String(eintrag?.inhalt || ''),
        angepinnt: Boolean(eintrag?.angepinnt),
        erstelltAm: eintrag?.erstelltAm || zeit,
        geaendertAm: eintrag?.geaendertAm || zeit
      };
    })
    .filter((eintrag, index, arr) => eintrag.id && arr.findIndex((x) => x.id === eintrag.id) === index);

  return { ordner, notizen };
}

function ladeDateiHerunter(dateiname, dateiendung, mimeType, inhalt) {
  const blob = new Blob([inhalt], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${dateiname}.${dateiendung}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function erstelleExportText() {
  const ordnerMap = new Map(zustand.ordner.map((ordner) => [ordner.id, ordner.name]));
  const zeilen = [];

  zeilen.push(texte.exportDokumentTitel);
  zeilen.push(`${texte.exportErstelltAm}: ${jetztIso()}`);
  zeilen.push('');

  zustand.notizen.forEach((notiz, index) => {
    const ordnerName = ordnerMap.get(notiz.ordnerId) || texte.ordnerStandard;
    zeilen.push(`Notiz ${index + 1}`);
    zeilen.push(`${texte.exportOrdner}: ${ordnerName}`);
    zeilen.push(`${texte.exportTitel}: ${notiz.titel || texte.titelNeu}`);
    zeilen.push(`${texte.exportAngepinnt}: ${notiz.angepinnt ? texte.exportJa : texte.exportNein}`);
    zeilen.push(`${texte.exportGeaendert}: ${notiz.geaendertAm || jetztIso()}`);
    zeilen.push(`${texte.exportInhalt}:`);
    zeilen.push(htmlAlsText(notiz.inhalt || ''));
    zeilen.push('');
    zeilen.push('----------------------------------------');
    zeilen.push('');
  });

  return zeilen.join('\n');
}

function erstelleExportDokument() {
  const ordnerMap = new Map(zustand.ordner.map((ordner) => [ordner.id, ordner.name]));
  const notizBloecke = zustand.notizen.map((notiz, index) => {
    const ordnerName = ordnerMap.get(notiz.ordnerId) || texte.ordnerStandard;
    return `
      <section class="export-notiz">
        <div class="export-inhalt">${inhaltAlsHtml(notiz.inhalt || '')}</div>
        <div class="export-meta-block">
          <div class="export-notiz-kopf">
            <span class="export-index">Notiz ${index + 1}</span>
            ${notiz.angepinnt ? `<span class="export-pin">${entitaetenSichern(texte.angepinntStatus)}</span>` : ''}
          </div>
          <div class="export-meta">
            <span><strong>${entitaetenSichern(texte.exportTitel)}:</strong> ${entitaetenSichern(notiz.titel || texte.titelNeu)}</span>
            <span><strong>${entitaetenSichern(texte.exportOrdner)}:</strong> ${entitaetenSichern(ordnerName)}</span>
            <span><strong>${entitaetenSichern(texte.exportGeaendert)}:</strong> ${entitaetenSichern(formatZeit(notiz.geaendertAm || jetztIso()))}</span>
          </div>
        </div>
      </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${istEnglisch ? 'en' : 'de'}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${entitaetenSichern(texte.exportDokumentTitel)}</title>
    <style>
      body {
        font-family: Inter, Arial, sans-serif;
        color: #0f172a;
        background: #f8fbff;
        margin: 0;
        padding: 40px 28px;
      }
      .export-wrap {
        max-width: 960px;
        margin: 0 auto;
      }
      .export-notiz {
        margin-bottom: 20px;
        padding: 22px;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        background: #ffffff;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        break-inside: avoid;
      }
      .export-notiz-kopf {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        margin-bottom: 6px;
      }
      .export-index {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #475569;
      }
      .export-pin {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        color: #7f1d1d;
        background: rgba(248, 113, 113, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.28);
      }
      .export-meta-block {
        margin-top: 18px;
        padding-top: 12px;
        border-top: 1px solid rgba(148, 163, 184, 0.22);
      }
      .export-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 14px;
        margin-bottom: 0;
        color: #475569;
        font-size: 12px;
      }
      .export-dokument-meta {
        margin-top: 20px;
        padding-top: 12px;
        border-top: 1px solid rgba(148, 163, 184, 0.22);
        color: #64748b;
        font-size: 11px;
      }
      .export-inhalt {
        color: #0f172a;
        line-height: 1.6;
      }
      .export-inhalt * {
        max-width: 100%;
      }
      .export-inhalt p:first-child,
      .export-inhalt h1:first-child,
      .export-inhalt h2:first-child,
      .export-inhalt h3:first-child {
        margin-top: 0;
      }
    </style>
  </head>
  <body>
    <div class="export-wrap">
      ${notizBloecke}
      <div class="export-dokument-meta">
        <div><strong>${entitaetenSichern(texte.exportDokumentTitel)}</strong></div>
        <div>${entitaetenSichern(texte.exportErstelltAm)}: ${entitaetenSichern(formatZeit(jetztIso()))}</div>
      </div>
    </div>
  </body>
</html>`;
}

function exportiereNotizen(format = 'txt') {
  const datum = new Date().toISOString().slice(0, 10);
  const basisDateiname = `${texte.exportDateiname}-${datum}`;

  if (format === 'html') {
    ladeDateiHerunter(basisDateiname, 'html', 'text/html;charset=utf-8', erstelleExportDokument());
    return;
  }

  if (format === 'doc') {
    ladeDateiHerunter(basisDateiname, 'doc', 'application/msword;charset=utf-8', erstelleExportDokument());
    return;
  }

  ladeDateiHerunter(basisDateiname, 'txt', 'text/plain;charset=utf-8', erstelleExportText());
}

async function importiereNotizenDatei(event) {
  const datei = event?.target?.files?.[0];
  if (!datei) return;

  try {
    const text = await datei.text();
    let daten = null;

    try {
      daten = normalisiereImportDaten(JSON.parse(text));
    } catch {
      const ordnerId = erstelleId();
      const zeit = jetztIso();
      daten = {
        ordner: [{ id: ordnerId, name: texte.ordnerStandard }],
        notizen: [{
          id: erstelleId(),
          ordnerId,
          titel: (datei.name || texte.titelNeu).replace(/\.[^.]+$/, '') || texte.titelNeu,
          inhalt: inhaltAlsHtml(text),
          angepinnt: false,
          erstelltAm: zeit,
          geaendertAm: zeit
        }]
      };
    }

    if (!daten) {
      window.alert(texte.importFehlerFormat);
      return;
    }

    zustand.ordner = daten.ordner;
    zustand.notizen = daten.notizen;
    zustand.aktiverOrdner = 'alle';
    zustand.aktiveNotizId = zustand.notizen[0]?.id || null;
    markiereAenderung();
    speichereDaten(false);
    renderAlles();
    window.alert(texte.importErfolg);
  } catch {
    window.alert(texte.importFehlerDatei);
  } finally {
    if (elemente.importDatei) elemente.importDatei.value = '';
  }
}

function labelFuerGroesse(groesse) {
  switch (Number(groesse)) {
    case 12: return texte.groesseSehrKlein;
    case 14: return texte.groesseKlein;
    case 24: return texte.groesseGross;
    case 32: return texte.groesseSehrGross;
    default: return texte.groesseMittel;
  }
}

function rundeAufBekannteGroesse(pxWert) {
  if (!Number.isFinite(pxWert)) return 18;
  return schriftgroessenStufen.reduce((naechste, groesse) => (
    Math.abs(groesse - pxWert) < Math.abs(naechste - pxWert) ? groesse : naechste
  ), 18);
}

function ermittleKnotenGroesse(node) {
  if (!node) return null;
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!element) return null;
  const px = Number.parseFloat(window.getComputedStyle(element).fontSize);
  return Number.isFinite(px) ? rundeAufBekannteGroesse(px) : null;
}

function setzeAktiveGroessenTaste(groesse, istGemischt = false) {
  elemente.schriftgroesseMenue?.querySelectorAll('.schriftgroesse-option').forEach((taste) => {
    const aktiv = !istGemischt && Number(taste.dataset.groesse) === Number(groesse);
    taste.classList.toggle('aktiv', aktiv);
    taste.setAttribute('aria-selected', aktiv ? 'true' : 'false');
  });

  if (elemente.schriftgroesseLabel) {
    elemente.schriftgroesseLabel.textContent = istGemischt ? texte.groesseGemischt : labelFuerGroesse(groesse);
  }
}

function oeffneSchriftgroessenMenue() {
  if (!elemente.schriftgroesseDropdown || !elemente.schriftgroesseMenue || !elemente.schriftgroesseToggle) return;
  elemente.schriftgroesseDropdown.classList.add('offen');
  elemente.schriftgroesseMenue.hidden = false;
  elemente.schriftgroesseToggle.setAttribute('aria-expanded', 'true');
}

function schliesseSchriftgroessenMenue() {
  if (!elemente.schriftgroesseDropdown || !elemente.schriftgroesseMenue || !elemente.schriftgroesseToggle) return;
  elemente.schriftgroesseDropdown.classList.remove('offen');
  elemente.schriftgroesseMenue.hidden = true;
  elemente.schriftgroesseToggle.setAttribute('aria-expanded', 'false');
}

function oeffneExportMenue() {
  if (!elemente.exportDropdown || !elemente.exportMenue || !elemente.exportBtn) return;
  elemente.exportDropdown.classList.add('offen');
  elemente.exportMenue.hidden = false;
  elemente.exportBtn.setAttribute('aria-expanded', 'true');
}

function schliesseExportMenue() {
  if (!elemente.exportDropdown || !elemente.exportMenue || !elemente.exportBtn) return;
  elemente.exportDropdown.classList.remove('offen');
  elemente.exportMenue.hidden = true;
  elemente.exportBtn.setAttribute('aria-expanded', 'false');
}

function ermittleGroesseAusAuswahl() {
  const feld = elemente.inhalt;
  const auswahl = window.getSelection();
  if (!feld || !auswahl || auswahl.rangeCount === 0) return null;

  const range = auswahl.getRangeAt(0);
  if (!feld.contains(range.commonAncestorContainer)) return null;

  if (range.collapsed) {
    return { groesse: ermittleKnotenGroesse(range.startContainer) || 18, gemischt: false };
  }

  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        if (!feld.contains(node.parentElement)) return NodeFilter.FILTER_REJECT;
        if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const groessen = [];
  while (walker.nextNode()) {
    const groesse = ermittleKnotenGroesse(walker.currentNode);
    if (groesse) groessen.push(groesse);
  }

  if (groessen.length === 0) {
    return { groesse: ermittleKnotenGroesse(range.startContainer) || 18, gemischt: false };
  }

  const eindeutig = [...new Set(groessen)];
  if (eindeutig.length > 1) return { groesse: 18, gemischt: true };
  return { groesse: eindeutig[0], gemischt: false };
}

function aktualisiereSchriftgroessenAnzeigeAusAuswahl() {
  const erkannt = ermittleGroesseAusAuswahl();
  if (!erkannt) {
    setzeAktiveGroessenTaste(18, false);
    return;
  }
  setzeAktiveGroessenTaste(erkannt.groesse, erkannt.gemischt);
}

function wendeSchriftgroesseAn(groesse) {
  const vorbereitet = bereiteEditorFormatierungVor();
  if (!vorbereitet) return;

  const zielGroesse = Number(groesse || 18);
  const { auswahl, range } = vorbereitet;

  const fragment = range.extractContents();
  const span = document.createElement('span');
  span.style.fontSize = `${zielGroesse}px`;
  span.appendChild(fragment);
  range.insertNode(span);

  auswahl.removeAllRanges();
  const neuerRange = document.createRange();
  neuerRange.selectNodeContents(span);
  auswahl.addRange(neuerRange);
  setzeAktiveGroessenTaste(zielGroesse);
  schliesseSchriftgroessenMenue();
  speichereEditorAuswahl();
  planeAutospeichern();
}

async function ladeUserSession() {
  try {
    const roh = localStorage.getItem(supabaseTokenKey);
    const token = roh ? JSON.parse(roh) : null;
    const id = token?.user?.id || null;
    if (id) {
      zustand.userId = id;
      return id;
    }
  } catch {}

  try {
    const { data: { session } } = await mitTimeout(supabase.auth.getSession(), 8000);
    zustand.userId = session?.user?.id || null;
    return zustand.userId;
  } catch {
    zustand.userId = null;
    return null;
  }
}

async function ladeCloudDaten() {
  if (!zustand.userId || !zustand.cloudVerfuegbar) return null;

  try {
    const [{ data: ordnerRows, error: ordnerErr }, { data: notizRows, error: notizErr }] = await Promise.all([
      mitTimeout(
        supabase
          .from(cloudTabellen.ordner)
          .select('id, name')
          .eq('user_id', zustand.userId),
        10000
      ),
      mitTimeout(
        supabase
          .from(cloudTabellen.notizen)
          .select('id, ordner_id, titel_id, inhalt_id, angepinnt, erstellt_am, geaendert_am')
          .eq('user_id', zustand.userId),
        10000
      )
    ]);

    if (ordnerErr || notizErr) throw new Error('cloud-load-error');
    if (!ordnerRows || ordnerRows.length === 0) return null;

    const titelIds = [...new Set((notizRows || []).map((n) => n.titel_id).filter(Boolean))];
    const inhaltIds = [...new Set((notizRows || []).map((n) => n.inhalt_id).filter(Boolean))];

    const titelMap = new Map();
    const inhaltMap = new Map();

    if (titelIds.length > 0) {
      const { data: titelRows, error: titelErr } = await mitTimeout(
        supabase.from(cloudTabellen.titel).select('id, text').in('id', titelIds),
        10000
      );
      if (titelErr) throw new Error('cloud-load-error');
      (titelRows || []).forEach((row) => titelMap.set(row.id, row.text || ''));
    }

    if (inhaltIds.length > 0) {
      const { data: inhaltRows, error: inhaltErr } = await mitTimeout(
        supabase.from(cloudTabellen.inhalt).select('id, text').in('id', inhaltIds),
        10000
      );
      if (inhaltErr) throw new Error('cloud-load-error');
      (inhaltRows || []).forEach((row) => inhaltMap.set(row.id, row.text || ''));
    }

    const ordner = ordnerRows.map((row) => ({ id: row.id, name: row.name }));
    const notizen = (notizRows || []).map((row) => ({
      id: row.id,
      ordnerId: row.ordner_id,
      titel: titelMap.get(row.titel_id) || texte.titelNeu,
      inhalt: inhaltMap.get(row.inhalt_id) || '',
      angepinnt: Boolean(row.angepinnt),
      erstelltAm: row.erstellt_am || jetztIso(),
      geaendertAm: row.geaendert_am || jetztIso()
    }));

    return {
      daten: {
        version: 1,
        ordner,
        notizen,
        zuletztGeaendert: Math.max(gibLetzteAenderung(notizen), 0)
      }
    };
  } catch (error) {
    if (error?.message === 'timeout') {
      setzeCloudStatus(texte.cloudTimeout);
      return null;
    }
    zustand.cloudVerfuegbar = false;
    setzeCloudStatus(texte.cloudFehler);
    return null;
  }
}

async function speichereCloudDaten() {
  if (!zustand.userId || !zustand.cloudVerfuegbar || istOffline()) return false;

  try {
    const ordnerRows = zustand.ordner.map((ordner) => ({
      id: ordner.id,
      user_id: zustand.userId,
      name: ordner.name
    }));

    const titelRows = zustand.notizen.map((notiz) => ({
      id: `${notiz.id}_titel`,
      user_id: zustand.userId,
      text: notiz.titel || texte.titelNeu,
      geaendert_am: notiz.geaendertAm || jetztIso()
    }));

    const inhaltRows = zustand.notizen.map((notiz) => ({
      id: `${notiz.id}_inhalt`,
      user_id: zustand.userId,
      text: notiz.inhalt || '',
      geaendert_am: notiz.geaendertAm || jetztIso()
    }));

    const notizRows = zustand.notizen.map((notiz) => ({
      id: notiz.id,
      user_id: zustand.userId,
      ordner_id: notiz.ordnerId,
      titel_id: `${notiz.id}_titel`,
      inhalt_id: `${notiz.id}_inhalt`,
      angepinnt: Boolean(notiz.angepinnt),
      erstellt_am: notiz.erstelltAm || jetztIso(),
      geaendert_am: notiz.geaendertAm || jetztIso()
    }));

    const { error: delNotizErr } = await mitTimeout(
      supabase.from(cloudTabellen.notizen).delete().eq('user_id', zustand.userId),
      10000
    );
    if (delNotizErr) throw new Error('cloud-save-error');

    const { error: delTitelErr } = await mitTimeout(
      supabase.from(cloudTabellen.titel).delete().eq('user_id', zustand.userId),
      10000
    );
    if (delTitelErr) throw new Error('cloud-save-error');

    const { error: delInhaltErr } = await mitTimeout(
      supabase.from(cloudTabellen.inhalt).delete().eq('user_id', zustand.userId),
      10000
    );
    if (delInhaltErr) throw new Error('cloud-save-error');

    const { error: delOrdnerErr } = await mitTimeout(
      supabase.from(cloudTabellen.ordner).delete().eq('user_id', zustand.userId),
      10000
    );
    if (delOrdnerErr) throw new Error('cloud-save-error');

    if (ordnerRows.length > 0) {
      const { error: insOrdnerErr } = await mitTimeout(
        supabase.from(cloudTabellen.ordner).insert(ordnerRows),
        10000
      );
      if (insOrdnerErr) throw new Error('cloud-save-error');
    }

    if (titelRows.length > 0) {
      const { error: insTitelErr } = await mitTimeout(
        supabase.from(cloudTabellen.titel).insert(titelRows),
        10000
      );
      if (insTitelErr) throw new Error('cloud-save-error');
    }

    if (inhaltRows.length > 0) {
      const { error: insInhaltErr } = await mitTimeout(
        supabase.from(cloudTabellen.inhalt).insert(inhaltRows),
        10000
      );
      if (insInhaltErr) throw new Error('cloud-save-error');
    }

    if (notizRows.length > 0) {
      const { error: insNotizErr } = await mitTimeout(
        supabase.from(cloudTabellen.notizen).insert(notizRows),
        10000
      );
      if (insNotizErr) throw new Error('cloud-save-error');
    }
  } catch (error) {
    if (error?.message === 'timeout') {
      setzeCloudStatus(texte.cloudTimeout);
      return false;
    }
    zustand.cloudVerfuegbar = false;
    setzeCloudStatus(texte.cloudFehler);
    return false;
  }

  return true;
}

function planeCloudSync() {
  clearTimeout(zustand.cloudTimer);
  zustand.cloudTimer = setTimeout(() => {
    fuehreCloudSyncAus(false);
  }, 1400);
}

function stoppeAutoCloudSync() {
  if (zustand.cloudIntervall) {
    clearInterval(zustand.cloudIntervall);
    zustand.cloudIntervall = null;
  }
}

function starteAutoCloudSync() {
  if (zustand.cloudIntervall || !zustand.userId || !zustand.cloudVerfuegbar) return;
  zustand.cloudIntervall = setInterval(() => {
    if (document.visibilityState === 'visible') fuehreCloudSyncAus(false);
  }, cloudSyncIntervallMs);
}

async function fuehreCloudSyncAus(manuell) {
  if (zustand.laufenderCloudSync || !zustand.userId || !zustand.cloudVerfuegbar || istOffline()) {
    if (istOffline()) setzeCloudStatus(texte.cloudOffline);
    return;
  }

  zustand.laufenderCloudSync = true;
  if (manuell) setzeCloudStatus(texte.cloudManuellStart);

  try {
    const cloudDatensatz = await ladeCloudDaten();
    if (!zustand.cloudVerfuegbar) return;

    if (!cloudDatensatz) {
      const ok = await speichereCloudDaten();
      if (ok) setzeCloudStatus(manuell ? texte.cloudManuellFertig : texte.cloudFertig);
      return;
    }

    const remotePayload = cloudDatensatz.daten;
    const remote = datenAusPayload(remotePayload);
    const remoteZeit = Number(remotePayload?.zuletztGeaendert || 0);
    const lokalZeit = Math.max(Number(zustand.zuletztGeaendertGlobal || 0), Number(gibLetzteAenderung(zustand.notizen) || 0));

    if (remote && remoteZeit > lokalZeit) {
      zustand.ordner = remote.ordner;
      zustand.notizen = remote.notizen;
      zustand.zuletztGeaendertGlobal = remoteZeit || Date.now();
      zustand.aktiveNotizId = zustand.notizen[0]?.id || null;
      speichereDaten(false);
      renderAlles();
      setzeCloudStatus(texte.cloudKonfliktRemote);
      return;
    }

    if (lokalZeit >= remoteZeit) {
      const ok = await speichereCloudDaten();
      if (ok) setzeCloudStatus(lokalZeit > remoteZeit ? texte.cloudKonfliktLokal : (manuell ? texte.cloudManuellFertig : texte.cloudFertig));
    }
  } catch {
    setzeCloudStatus(texte.cloudFehler);
  } finally {
    zustand.laufenderCloudSync = false;
  }
}

async function initialisiereCloudSync() {
  const userId = await ladeUserSession();
  if (!userId) {
    stoppeAutoCloudSync();
    setzeCloudStatus(texte.cloudNichtEingeloggt);
    return;
  }

  if (istOffline()) {
    starteAutoCloudSync();
    setzeCloudStatus(texte.cloudOffline);
    return;
  }

  setzeCloudStatus(texte.cloudLade);
  await fuehreCloudSyncAus(false);
  starteAutoCloudSync();
}

function standardDaten() {
  const ordnerId = erstelleId();
  const notizId = erstelleId();
  const zeit = jetztIso();

  return {
    ordner: [{ id: ordnerId, name: texte.ordnerStandard }],
    notizen: [{
      id: notizId,
      ordnerId,
      titel: texte.standardNotiz,
      inhalt: texte.standardInhalt,
      angepinnt: true,
      erstelltAm: zeit,
      geaendertAm: zeit
    }],
    zuletztGeaendertGlobal: Date.now()
  };
}

function ladeDaten() {
  try {
    const roh = localStorage.getItem(speicherSchluessel);
    if (!roh) {
      const daten = standardDaten();
      zustand.ordner = daten.ordner;
      zustand.notizen = daten.notizen;
      zustand.zuletztGeaendertGlobal = Number(daten.zuletztGeaendertGlobal || Date.now());
      zustand.aktiveNotizId = daten.notizen[0].id;
      speichereDaten(false);
      return;
    }

    const daten = JSON.parse(roh);
    if (!Array.isArray(daten.ordner) || !Array.isArray(daten.notizen) || daten.ordner.length === 0) {
      throw new Error('ungueltig');
    }

    zustand.ordner = daten.ordner;
    zustand.notizen = daten.notizen;
    zustand.zuletztGeaendertGlobal = Number(daten.zuletztGeaendertGlobal || Date.now());
    zustand.aktiveNotizId = zustand.notizen[0]?.id || null;
  } catch {
    const daten = standardDaten();
    zustand.ordner = daten.ordner;
    zustand.notizen = daten.notizen;
    zustand.zuletztGeaendertGlobal = Number(daten.zuletztGeaendertGlobal || Date.now());
    zustand.aktiveNotizId = daten.notizen[0].id;
    speichereDaten(false);
  }
}

function speichereDaten(mitStatus = true) {
  localStorage.setItem(speicherSchluessel, JSON.stringify({
    ordner: zustand.ordner,
    notizen: zustand.notizen,
    zuletztGeaendertGlobal: zustand.zuletztGeaendertGlobal
  }));

  if (mitStatus && elemente.status) {
    elemente.status.textContent = `${texte.gespeichert}: ${formatZeit(new Date().toISOString())}`;
  }

  planeCloudSync();
}

function formatZeit(isoWert) {
  if (!isoWert) return texte.geradeJetzt;
  const datum = new Date(isoWert);
  return datum.toLocaleString(istEnglisch ? 'en-US' : 'de-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function holeGefilterteNotizen() {
  return zustand.notizen
    .filter((notiz) => {
      if (zustand.aktiverOrdner !== 'alle' && notiz.ordnerId !== zustand.aktiverOrdner) return false;
      if (zustand.nurAngepinnt && !notiz.angepinnt) return false;
      if (!zustand.suchbegriff) return true;
      const begriff = zustand.suchbegriff.toLowerCase();
      return `${notiz.titel} ${notiz.inhalt}`.toLowerCase().includes(begriff);
    })
    .sort((a, b) => (a.angepinnt === b.angepinnt ? new Date(b.geaendertAm) - new Date(a.geaendertAm) : (a.angepinnt ? -1 : 1)));
}

function setzeAktiveNotiz(notizId) {
  zustand.aktiveNotizId = notizId;
  renderAlles();
  if (istMobilAnsicht()) setzeMobilSchritt('editor');
}

function gibAktiveNotiz() {
  return zustand.notizen.find((notiz) => notiz.id === zustand.aktiveNotizId) || null;
}

function renderOrdner() {
  if (!elemente.ordnerListe) return;

  const anzahlProOrdner = new Map();
  zustand.notizen.forEach((n) => anzahlProOrdner.set(n.ordnerId, (anzahlProOrdner.get(n.ordnerId) || 0) + 1));

  const html = [
    `<li data-ordner-id="alle" class="${zustand.aktiverOrdner === 'alle' ? 'aktiv' : ''}"><span class="ordner-name">${istEnglisch ? 'All notes' : 'Alle Notizen'}</span><span class="ordner-zaehler">${zustand.notizen.length}</span></li>`
  ];

  zustand.ordner.forEach((ordner) => {
    html.push(`<li data-ordner-id="${ordner.id}" class="${zustand.aktiverOrdner === ordner.id ? 'aktiv' : ''}"><span class="ordner-name">${ordner.name}</span><span class="ordner-zaehler">${anzahlProOrdner.get(ordner.id) || 0}</span></li>`);
  });

  elemente.ordnerListe.innerHTML = html.join('');
  elemente.ordnerListe.querySelectorAll('li').forEach((eintrag) => {
    eintrag.addEventListener('click', () => {
      zustand.aktiverOrdner = eintrag.dataset.ordnerId;
      const gefiltert = holeGefilterteNotizen();
      if (!gefiltert.some((n) => n.id === zustand.aktiveNotizId)) zustand.aktiveNotizId = gefiltert[0]?.id || null;
      renderAlles();
      if (istMobilAnsicht()) setzeMobilSchritt('notizen');
    });
  });
}

function entitaetenSichern(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function renderNotizenListe() {
  if (!elemente.notizenListe) return;
  const gefiltert = holeGefilterteNotizen();

  if (gefiltert.length === 0) {
    elemente.notizenListe.innerHTML = `<p class="keine-notiz">${texte.leereListe}</p>`;
    return;
  }

  elemente.notizenListe.innerHTML = gefiltert.map((notiz) => {
    const vorschau = htmlAlsText(notiz.inhalt || '').replace(/\s+/g, ' ').trim().slice(0, 95);
    const pinHinweis = notiz.angepinnt
      ? `<span class="pin-symbol" aria-label="${entitaetenSichern(texte.angepinntStatus)}" title="${entitaetenSichern(texte.angepinntStatus)}"></span>`
      : '';
    return `
      <li data-notiz-id="${notiz.id}" class="${notiz.id === zustand.aktiveNotizId ? 'aktiv' : ''}">
        <p class="notiz-listen-titel"><span>${entitaetenSichern(notiz.titel || texte.titelNeu)}</span>${pinHinweis}</p>
        <p class="notiz-listen-vorschau">${entitaetenSichern(vorschau || '...')}</p>
        <p class="notiz-listen-meta">${entitaetenSichern(formatZeit(notiz.geaendertAm))}</p>
      </li>`;
  }).join('');

  elemente.notizenListe.querySelectorAll('li[data-notiz-id]').forEach((eintrag) => {
    eintrag.addEventListener('click', () => setzeAktiveNotiz(eintrag.dataset.notizId));
  });
}

function renderEditor() {
  if (!elemente.titel || !elemente.inhalt || !elemente.angepinnt) return;

  const notiz = gibAktiveNotiz();
  const aktiv = Boolean(notiz);
  [elemente.titel, elemente.inhalt, elemente.angepinnt, elemente.loeschen].forEach((feld) => { if (feld) feld.disabled = !aktiv; });

  if (!notiz) {
    elemente.titel.value = '';
    elemente.inhalt.innerHTML = '';
    elemente.angepinnt.checked = false;
    setzeAktiveGroessenTaste(18, false);
    if (elemente.status) elemente.status.textContent = texte.geradeJetzt;
    return;
  }

  elemente.titel.value = notiz.titel || '';
  elemente.inhalt.innerHTML = inhaltAlsHtml(notiz.inhalt || '');
  elemente.angepinnt.checked = Boolean(notiz.angepinnt);
  schliesseSchriftgroessenMenue();
  setzeAktiveGroessenTaste(18, false);
  if (elemente.status) elemente.status.textContent = `${texte.gespeichert}: ${formatZeit(notiz.geaendertAm)}`;
}

function renderAlles() {
  renderOrdner();
  renderNotizenListe();
  renderEditor();
}

function aktualisiereAktiveNotizAusEditor() {
  if (!elemente.titel || !elemente.inhalt || !elemente.angepinnt) return;
  const notiz = gibAktiveNotiz();
  if (!notiz) return;

  notiz.titel = (elemente.titel.value || '').trim() || texte.titelNeu;
  notiz.inhalt = elemente.inhalt.innerHTML || '';
  notiz.angepinnt = Boolean(elemente.angepinnt.checked);
  notiz.geaendertAm = jetztIso();

  markiereAenderung();
  speichereDaten();
  renderNotizenListe();
}

function planeAutospeichern() {
  clearTimeout(zustand.autoSpeichernTimer);
  zustand.autoSpeichernTimer = setTimeout(aktualisiereAktiveNotizAusEditor, 260);
}

function notizErstellen() {
  const ordnerId = zustand.aktiverOrdner !== 'alle' ? zustand.aktiverOrdner : (zustand.ordner[0]?.id || erstelleId());
  if (!zustand.ordner.find((o) => o.id === ordnerId)) zustand.ordner.unshift({ id: ordnerId, name: texte.ordnerStandard });

  const zeit = jetztIso();
  const notiz = { id: erstelleId(), ordnerId, titel: texte.titelNeu, inhalt: '', angepinnt: false, erstelltAm: zeit, geaendertAm: zeit };
  zustand.notizen.unshift(notiz);
  zustand.aktiveNotizId = notiz.id;

  markiereAenderung();
  speichereDaten(false);
  renderAlles();
  if (istMobilAnsicht()) setzeMobilSchritt('editor');
  elemente.titel?.focus();
}

function ordnerErstellen() {
  const name = window.prompt(texte.ordnerPrompt, '');
  if (name === null) return;
  const bereinigt = name.trim();
  if (!bereinigt) return window.alert(texte.ordnerLeer);
  if (zustand.ordner.some((o) => o.name.toLowerCase() === bereinigt.toLowerCase())) return window.alert(texte.ordnerExistiert);

  const ordner = { id: erstelleId(), name: bereinigt };
  zustand.ordner.push(ordner);
  zustand.aktiverOrdner = ordner.id;

  markiereAenderung();
  speichereDaten(false);
  renderAlles();
}

function aktivenOrdnerLoeschen() {
  if (zustand.aktiverOrdner === 'alle') return window.alert(texte.ordnerLoeschenAuswahl);
  if (zustand.ordner.length <= 1) return window.alert(texte.ordnerLoeschenLetzter);
  if (!window.confirm(texte.ordnerLoeschenFrage)) return;

  const ordnerId = zustand.aktiverOrdner;
  zustand.ordner = zustand.ordner.filter((o) => o.id !== ordnerId);
  zustand.notizen = zustand.notizen.filter((n) => n.ordnerId !== ordnerId);
  zustand.aktiverOrdner = 'alle';

  const gefiltert = holeGefilterteNotizen();
  zustand.aktiveNotizId = gefiltert[0]?.id || null;

  markiereAenderung();
  speichereDaten(false);
  renderAlles();
  if (istMobilAnsicht()) setzeMobilSchritt('ordner');
}

function aktiveNotizLoeschen() {
  if (!zustand.aktiveNotizId) return;
  if (!window.confirm(texte.loeschenFrage)) return;

  zustand.notizen = zustand.notizen.filter((n) => n.id !== zustand.aktiveNotizId);
  zustand.aktiveNotizId = null;

  markiereAenderung();
  speichereDaten(false);
  renderAlles();
  if (istMobilAnsicht()) setzeMobilSchritt('notizen');
}

function fuegeTextEin(vorlageText) {
  const feld = elemente.inhalt;
  if (!feld) return;
  const start = feld.selectionStart;
  const ende = feld.selectionEnd;
  feld.value = `${feld.value.slice(0, start)}${vorlageText}${feld.value.slice(ende)}`;
  const pos = start + vorlageText.length;
  feld.focus();
  feld.setSelectionRange(pos, pos);
  planeAutospeichern();
}

function registriereEvents() {
  aktualisiereMobileAnsicht();

  elemente.zurueckZuOrdnern?.addEventListener('click', () => setzeMobilSchritt('ordner'));
  elemente.zurueckZuNotizen?.addEventListener('click', () => setzeMobilSchritt('notizen'));

  elemente.notizAnlegen?.addEventListener('click', notizErstellen);
  elemente.ordnerAnlegen?.addEventListener('click', ordnerErstellen);
  elemente.ordnerLoeschen?.addEventListener('click', aktivenOrdnerLoeschen);
  elemente.loeschen?.addEventListener('click', aktiveNotizLoeschen);

  elemente.suche?.addEventListener('input', (e) => {
    zustand.suchbegriff = e.target.value || '';
    const gefiltert = holeGefilterteNotizen();
    if (!gefiltert.some((n) => n.id === zustand.aktiveNotizId)) zustand.aktiveNotizId = gefiltert[0]?.id || null;
    renderAlles();
  });

  elemente.nurAngepinnt?.addEventListener('change', (e) => {
    zustand.nurAngepinnt = Boolean(e.target.checked);
    const gefiltert = holeGefilterteNotizen();
    if (!gefiltert.some((n) => n.id === zustand.aktiveNotizId)) zustand.aktiveNotizId = gefiltert[0]?.id || null;
    renderAlles();
  });

  elemente.titel?.addEventListener('input', planeAutospeichern);
  elemente.inhalt?.addEventListener('input', planeAutospeichern);
  elemente.inhalt?.addEventListener('keyup', () => {
    speichereEditorAuswahl();
    aktualisiereSchriftgroessenAnzeigeAusAuswahl();
  });
  elemente.inhalt?.addEventListener('mouseup', () => {
    speichereEditorAuswahl();
    aktualisiereSchriftgroessenAnzeigeAusAuswahl();
  });
  elemente.inhalt?.addEventListener('focus', () => {
    speichereEditorAuswahl();
    aktualisiereSchriftgroessenAnzeigeAusAuswahl();
  });

  elemente.angepinnt?.addEventListener('change', () => {
    aktualisiereAktiveNotizAusEditor();
    renderAlles();
  });

  elemente.cloudSyncBtn?.addEventListener('click', () => fuehreCloudSyncAus(true));
  elemente.importBtn?.addEventListener('click', () => elemente.importDatei?.click());
  elemente.exportBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    if (elemente.exportDropdown?.classList.contains('offen')) {
      schliesseExportMenue();
    } else {
      oeffneExportMenue();
    }
  });
  elemente.importDatei?.addEventListener('change', importiereNotizenDatei);
  elemente.exportMenue?.querySelectorAll('.export-option').forEach((option) => {
    option.addEventListener('click', () => {
      exportiereNotizen(option.dataset.exportFormat || 'txt');
      schliesseExportMenue();
    });
  });
  elemente.textFett?.addEventListener('click', () => formatiereText('bold'));
  elemente.textKursiv?.addEventListener('click', () => formatiereText('italic'));
  elemente.textUnterstrichen?.addEventListener('click', () => formatiereText('underline'));
  elemente.schriftgroesseToggle?.addEventListener('click', (event) => {
    event.preventDefault();
    if (elemente.schriftgroesseDropdown?.classList.contains('offen')) {
      schliesseSchriftgroessenMenue();
    } else {
      oeffneSchriftgroessenMenue();
    }
  });

  elemente.schriftgroesseMenue?.querySelectorAll('.schriftgroesse-option').forEach((taste) => {
    taste.addEventListener('click', () => wendeSchriftgroesseAn(taste.dataset.groesse));
  });

  document.addEventListener('selectionchange', () => {
    if (!elemente.inhalt) return;
    const auswahl = window.getSelection();
    if (!auswahl || auswahl.rangeCount === 0) return;
    const range = auswahl.getRangeAt(0);
    if (!elemente.inhalt.contains(range.commonAncestorContainer)) return;
    aktualisiereSchriftgroessenAnzeigeAusAuswahl();
  });

  document.addEventListener('click', (event) => {
    if (!elemente.schriftgroesseDropdown) return;
    if (elemente.schriftgroesseDropdown.contains(event.target)) return;
    schliesseSchriftgroessenMenue();
  });

  document.addEventListener('click', (event) => {
    if (!elemente.exportDropdown) return;
    if (elemente.exportDropdown.contains(event.target)) return;
    schliesseExportMenue();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      schliesseSchriftgroessenMenue();
      schliesseExportMenue();
    }
  });

  schliesseSchriftgroessenMenue();
  schliesseExportMenue();
  setzeAktiveGroessenTaste(18, false);

  window.addEventListener('online', () => {
    if (zustand.userId) {
      setzeCloudStatus(texte.cloudLade);
      fuehreCloudSyncAus(false);
    }
  });

  window.addEventListener('offline', () => setzeCloudStatus(texte.cloudOffline));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && zustand.userId) fuehreCloudSyncAus(false);
  });
  window.addEventListener('focus', () => {
    if (zustand.userId) fuehreCloudSyncAus(false);
  });
  window.addEventListener('beforeunload', stoppeAutoCloudSync);
  window.addEventListener('resize', aktualisiereMobileAnsicht);

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'INITIAL_SESSION' && !session?.user?.id && zustand.userId) return;

    const neueUserId = session?.user?.id || null;
    if (neueUserId === zustand.userId) return;

    zustand.userId = neueUserId;
    if (!neueUserId) {
      stoppeAutoCloudSync();
      setzeCloudStatus(texte.cloudNichtEingeloggt);
      return;
    }

    setzeCloudStatus(texte.cloudLade);
    await fuehreCloudSyncAus(false);
    starteAutoCloudSync();
  });
}

async function init() {
  ladeDaten();
  registriereEvents();
  renderAlles();

  if (elemente.cloudSyncBtn) elemente.cloudSyncBtn.textContent = texte.cloudSync;
  if (elemente.importBtn) elemente.importBtn.textContent = texte.importieren;
  if (elemente.exportBtn) elemente.exportBtn.textContent = texte.exportieren;
  await initialisiereCloudSync();
}

init();

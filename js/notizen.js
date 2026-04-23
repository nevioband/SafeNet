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
      cloudTimeout: 'Cloud: timeout (please try manual sync)'
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
      cloudTimeout: 'Cloud: Zeitüberschreitung (bitte manuell syncen)'
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
  zuletztGeaendertGlobal: Date.now()
};

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
    const vorschau = (notiz.inhalt || '').replace(/\s+/g, ' ').trim().slice(0, 95);
    return `
      <li data-notiz-id="${notiz.id}" class="${notiz.id === zustand.aktiveNotizId ? 'aktiv' : ''}">
        <p class="notiz-listen-titel"><span>${entitaetenSichern(notiz.titel || texte.titelNeu)}</span>${notiz.angepinnt ? '<span class="pin-symbol">📌</span>' : ''}</p>
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
    elemente.inhalt.value = '';
    elemente.angepinnt.checked = false;
    if (elemente.status) elemente.status.textContent = texte.geradeJetzt;
    return;
  }

  elemente.titel.value = notiz.titel || '';
  elemente.inhalt.value = notiz.inhalt || '';
  elemente.angepinnt.checked = Boolean(notiz.angepinnt);
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
  notiz.inhalt = elemente.inhalt.value || '';
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

  [elemente.titel, elemente.inhalt].forEach((feld) => feld?.addEventListener('input', planeAutospeichern));

  elemente.angepinnt?.addEventListener('change', () => {
    aktualisiereAktiveNotizAusEditor();
    renderAlles();
  });

  elemente.vorlageTitel?.addEventListener('click', () => fuegeTextEin(texte.vorlageTitel));
  elemente.vorlageCheck?.addEventListener('click', () => fuegeTextEin(texte.vorlageCheck));
  elemente.vorlageInfo?.addEventListener('click', () => fuegeTextEin(texte.vorlageInfo));
  elemente.cloudSyncBtn?.addEventListener('click', () => fuehreCloudSyncAus(true));

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
  await initialisiereCloudSync();
}

init();

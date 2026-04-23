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
      loeschenFrage: 'Delete this note permanently?',
      gespeichert: 'Saved',
      geradeJetzt: 'Just now',
      standardInhalt: '## Summary\nWrite your key points here.\n\n## Checklist\n- [ ] First step\n- [ ] Second step\n\n## Important\n> Add an important detail here.',
      standardNotiz: 'Welcome note',
      vorlageTitel: '\n## Heading\n',
      vorlageCheck: '\n- [ ] Task\n',
      vorlageInfo: '\n> Info: ...\n',
      tagHinweis: 'Tags are separated with commas.',
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
      loeschenFrage: 'Diese Notiz wirklich dauerhaft löschen?',
      gespeichert: 'Gespeichert',
      geradeJetzt: 'Gerade eben',
      standardInhalt: '## Zusammenfassung\nSchreibe hier die wichtigsten Punkte.\n\n## Checkliste\n- [ ] Erster Schritt\n- [ ] Zweiter Schritt\n\n## Wichtig\n> Ergänze hier wichtige Details.',
      standardNotiz: 'Willkommensnotiz',
      vorlageTitel: '\n## Überschrift\n',
      vorlageCheck: '\n- [ ] Aufgabe\n',
      vorlageInfo: '\n> Info: ...\n',
      tagHinweis: 'Tags werden mit Kommas getrennt.',
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
const cloudTabelle = 'notizen_sync';
const supabaseTokenKey = 'sb-dygrabyaiyessqmjdprc-auth-token';
const cloudSyncIntervallMs = 20000;

const elemente = {
  ordnerListe: document.getElementById('ordnerListe'),
  notizenListe: document.getElementById('notizenListe'),
  suche: document.getElementById('notizenSuche'),
  nurAngepinnt: document.getElementById('nurAngepinnt'),
  notizAnlegen: document.getElementById('notizAnlegen'),
  ordnerAnlegen: document.getElementById('ordnerAnlegen'),
  titel: document.getElementById('notizTitel'),
  tags: document.getElementById('notizTags'),
  inhalt: document.getElementById('notizInhalt'),
  angepinnt: document.getElementById('notizAngepinnt'),
  loeschen: document.getElementById('notizLoeschen'),
  status: document.getElementById('speicherStatus'),
  cloudStatus: document.getElementById('cloudStatus'),
  cloudSyncBtn: document.getElementById('cloudSyncBtn'),
  vorlageTitel: document.getElementById('vorlageTitel'),
  vorlageCheck: document.getElementById('vorlageCheckliste'),
  vorlageInfo: document.getElementById('vorlageInfo'),
  tagHinweis: document.getElementById('tagHinweis')
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
  laufenderCloudSync: false
};

function setzeCloudStatus(text) {
  if (elemente.cloudStatus) elemente.cloudStatus.textContent = text;
}

function istOffline() {
  return !navigator.onLine;
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
  if (!Array.isArray(notizen) || notizen.length === 0) return null;
  return notizen.reduce((max, notiz) => {
    const zeit = new Date(notiz.geaendertAm || notiz.erstelltAm || 0).getTime();
    return Math.max(max, Number.isFinite(zeit) ? zeit : 0);
  }, 0);
}

function baueCloudPayload() {
  return {
    version: 1,
    ordner: zustand.ordner,
    notizen: zustand.notizen,
    zuletztGeaendert: gibLetzteAenderung(zustand.notizen)
  };
}

function datenAusPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (!Array.isArray(payload.ordner) || !Array.isArray(payload.notizen) || payload.ordner.length === 0) return null;
  return {
    ordner: payload.ordner,
    notizen: payload.notizen
  };
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
  } catch {
    // Fallback unten
  }

  try {
    const {
      data: { session }
    } = await mitTimeout(supabase.auth.getSession(), 8000);
    zustand.userId = session?.user?.id || null;
    return zustand.userId;
  } catch {
    zustand.userId = null;
    return null;
  }
}

async function ladeCloudDaten() {
  if (!zustand.userId || !zustand.cloudVerfuegbar) return null;

  let antwort;
  try {
    antwort = await mitTimeout(
      supabase
        .from(cloudTabelle)
        .select('daten, updated_at')
        .eq('user_id', zustand.userId)
        .maybeSingle(),
      10000
    );
  } catch (error) {
    if (error?.message === 'timeout') {
      setzeCloudStatus(texte.cloudTimeout);
      return null;
    }
    zustand.cloudVerfuegbar = false;
    setzeCloudStatus(texte.cloudFehler);
    return null;
  }

  const { data, error } = antwort;

  if (error) {
    zustand.cloudVerfuegbar = false;
    setzeCloudStatus(texte.cloudFehler);
    return null;
  }

  return data || null;
}

async function speichereCloudDaten() {
  if (!zustand.userId || !zustand.cloudVerfuegbar || istOffline()) return false;

  const payload = baueCloudPayload();
  let antwort;
  try {
    antwort = await mitTimeout(
      supabase.from(cloudTabelle).upsert(
        {
          user_id: zustand.userId,
          daten: payload
        },
        { onConflict: 'user_id' }
      ),
      10000
    );
  } catch (error) {
    if (error?.message === 'timeout') {
      setzeCloudStatus(texte.cloudTimeout);
      return false;
    }
    zustand.cloudVerfuegbar = false;
    setzeCloudStatus(texte.cloudFehler);
    return false;
  }

  const { error } = antwort;

  if (error) {
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
    if (document.visibilityState === 'visible') {
      fuehreCloudSyncAus(false);
    }
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
    const lokalZeit = Number(gibLetzteAenderung(zustand.notizen) || 0);

    if (remote && remoteZeit > lokalZeit) {
      zustand.ordner = remote.ordner;
      zustand.notizen = remote.notizen;
      zustand.aktiveNotizId = zustand.notizen[0]?.id || null;
      speichereDaten(false);
      renderAlles();
      setzeCloudStatus(texte.cloudKonfliktRemote);
      return;
    }

    if (lokalZeit >= remoteZeit) {
      const ok = await speichereCloudDaten();
      if (ok) {
        setzeCloudStatus(lokalZeit > remoteZeit ? texte.cloudKonfliktLokal : (manuell ? texte.cloudManuellFertig : texte.cloudFertig));
      }
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

function erstelleId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function jetztIso() {
  return new Date().toISOString();
}

function standardDaten() {
  const ordnerId = erstelleId();
  const notizId = erstelleId();
  const zeit = jetztIso();

  return {
    ordner: [{ id: ordnerId, name: texte.ordnerStandard }],
    notizen: [
      {
        id: notizId,
        ordnerId,
        titel: texte.standardNotiz,
        inhalt: texte.standardInhalt,
        tags: ['start'],
        angepinnt: true,
        erstelltAm: zeit,
        geaendertAm: zeit
      }
    ]
  };
}

function ladeDaten() {
  try {
    const roh = localStorage.getItem(speicherSchluessel);
    if (!roh) {
      const daten = standardDaten();
      zustand.ordner = daten.ordner;
      zustand.notizen = daten.notizen;
      zustand.aktiveNotizId = daten.notizen[0].id;
      speichereDaten(false);
      return;
    }

    const daten = JSON.parse(roh);
    if (!Array.isArray(daten.ordner) || !Array.isArray(daten.notizen) || daten.ordner.length === 0) {
      throw new Error('Ungültige Datenstruktur');
    }

    zustand.ordner = daten.ordner;
    zustand.notizen = daten.notizen;
    zustand.aktiveNotizId = zustand.notizen[0]?.id || null;
  } catch {
    const daten = standardDaten();
    zustand.ordner = daten.ordner;
    zustand.notizen = daten.notizen;
    zustand.aktiveNotizId = daten.notizen[0].id;
    speichereDaten(false);
  }
}

function speichereDaten(mitStatus = true) {
  localStorage.setItem(
    speicherSchluessel,
    JSON.stringify({ ordner: zustand.ordner, notizen: zustand.notizen })
  );

  if (mitStatus && elemente.status) {
    elemente.status.textContent = `${texte.gespeichert}: ${formatZeit(new Date().toISOString())}`;
  }

  planeCloudSync();
}

function formatZeit(isoWert) {
  if (!isoWert) return texte.geradeJetzt;
  const datum = new Date(isoWert);
  return datum.toLocaleString(istEnglisch ? 'en-US' : 'de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function holeGefilterteNotizen() {
  return zustand.notizen
    .filter((notiz) => {
      if (zustand.aktiverOrdner !== 'alle' && notiz.ordnerId !== zustand.aktiverOrdner) {
        return false;
      }

      if (zustand.nurAngepinnt && !notiz.angepinnt) {
        return false;
      }

      if (!zustand.suchbegriff) {
        return true;
      }

      const begriff = zustand.suchbegriff.toLowerCase();
      const quelle = `${notiz.titel} ${notiz.inhalt} ${(notiz.tags || []).join(' ')}`.toLowerCase();
      return quelle.includes(begriff);
    })
    .sort((a, b) => {
      if (a.angepinnt !== b.angepinnt) {
        return a.angepinnt ? -1 : 1;
      }
      return new Date(b.geaendertAm) - new Date(a.geaendertAm);
    });
}

function setzeAktiveNotiz(notizId) {
  zustand.aktiveNotizId = notizId;
  renderAlles();
}

function gibAktiveNotiz() {
  return zustand.notizen.find((notiz) => notiz.id === zustand.aktiveNotizId) || null;
}

function renderOrdner() {
  if (!elemente.ordnerListe) return;

  const anzahlProOrdner = new Map();
  zustand.notizen.forEach((notiz) => {
    anzahlProOrdner.set(notiz.ordnerId, (anzahlProOrdner.get(notiz.ordnerId) || 0) + 1);
  });

  const gesamt = zustand.notizen.length;
  const ordnerHtml = [
    `<li data-ordner-id="alle" class="${zustand.aktiverOrdner === 'alle' ? 'aktiv' : ''}"><span class="ordner-name">${istEnglisch ? 'All notes' : 'Alle Notizen'}</span><span class="ordner-zaehler">${gesamt}</span></li>`
  ];

  zustand.ordner.forEach((ordner) => {
    ordnerHtml.push(
      `<li data-ordner-id="${ordner.id}" class="${zustand.aktiverOrdner === ordner.id ? 'aktiv' : ''}"><span class="ordner-name">${ordner.name}</span><span class="ordner-zaehler">${anzahlProOrdner.get(ordner.id) || 0}</span></li>`
    );
  });

  elemente.ordnerListe.innerHTML = ordnerHtml.join('');

  elemente.ordnerListe.querySelectorAll('li').forEach((eintrag) => {
    eintrag.addEventListener('click', () => {
      zustand.aktiverOrdner = eintrag.dataset.ordnerId;
      const gefiltert = holeGefilterteNotizen();
      if (!gefiltert.some((notiz) => notiz.id === zustand.aktiveNotizId)) {
        zustand.aktiveNotizId = gefiltert[0]?.id || null;
      }
      renderAlles();
    });
  });
}

function renderNotizenListe() {
  if (!elemente.notizenListe) return;

  const gefiltert = holeGefilterteNotizen();
  if (gefiltert.length === 0) {
    elemente.notizenListe.innerHTML = `<p class="keine-notiz">${texte.leereListe}</p>`;
    return;
  }

  elemente.notizenListe.innerHTML = gefiltert
    .map((notiz) => {
      const vorschau = (notiz.inhalt || '').replace(/\s+/g, ' ').trim().slice(0, 95);
      const meta = `${formatZeit(notiz.geaendertAm)} · ${(notiz.tags || []).join(', ') || '-'}`;
      return `
        <li data-notiz-id="${notiz.id}" class="${notiz.id === zustand.aktiveNotizId ? 'aktiv' : ''}">
          <p class="notiz-listen-titel">
            <span>${entitaetenSichern(notiz.titel || texte.titelNeu)}</span>
            ${notiz.angepinnt ? '<span class="pin-symbol">📌</span>' : ''}
          </p>
          <p class="notiz-listen-vorschau">${entitaetenSichern(vorschau || '...')}</p>
          <p class="notiz-listen-meta">${entitaetenSichern(meta)}</p>
        </li>
      `;
    })
    .join('');

  elemente.notizenListe.querySelectorAll('li[data-notiz-id]').forEach((eintrag) => {
    eintrag.addEventListener('click', () => setzeAktiveNotiz(eintrag.dataset.notizId));
  });
}

function entitaetenSichern(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderEditor() {
  const notiz = gibAktiveNotiz();
  const istBearbeitbar = Boolean(notiz);

  [elemente.titel, elemente.tags, elemente.inhalt, elemente.angepinnt, elemente.loeschen].forEach((feld) => {
    if (feld) feld.disabled = !istBearbeitbar;
  });

  if (!notiz) {
    if (elemente.titel) elemente.titel.value = '';
    if (elemente.tags) elemente.tags.value = '';
    if (elemente.inhalt) elemente.inhalt.value = '';
    if (elemente.angepinnt) elemente.angepinnt.checked = false;
    if (elemente.status) elemente.status.textContent = texte.geradeJetzt;
    return;
  }

  elemente.titel.value = notiz.titel || '';
  elemente.tags.value = (notiz.tags || []).join(', ');
  elemente.inhalt.value = notiz.inhalt || '';
  elemente.angepinnt.checked = Boolean(notiz.angepinnt);
  elemente.status.textContent = `${texte.gespeichert}: ${formatZeit(notiz.geaendertAm)}`;
}

function renderAlles() {
  renderOrdner();
  renderNotizenListe();
  renderEditor();
}

function planeAutospeichern() {
  clearTimeout(zustand.autoSpeichernTimer);
  zustand.autoSpeichernTimer = setTimeout(() => {
    aktualisiereAktiveNotizAusEditor();
  }, 260);
}

function aktualisiereAktiveNotizAusEditor() {
  const notiz = gibAktiveNotiz();
  if (!notiz) return;

  notiz.titel = (elemente.titel.value || '').trim() || texte.titelNeu;
  notiz.tags = (elemente.tags.value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
  notiz.inhalt = elemente.inhalt.value || '';
  notiz.angepinnt = Boolean(elemente.angepinnt.checked);
  notiz.geaendertAm = jetztIso();

  speichereDaten();
  renderNotizenListe();
}

function notizErstellen() {
  const zielOrdnerId =
    zustand.aktiverOrdner !== 'alle'
      ? zustand.aktiverOrdner
      : zustand.ordner[0]?.id || erstelleId();

  if (!zustand.ordner.find((ordner) => ordner.id === zielOrdnerId)) {
    zustand.ordner.unshift({ id: zielOrdnerId, name: texte.ordnerStandard });
  }

  const zeit = jetztIso();
  const notiz = {
    id: erstelleId(),
    ordnerId: zielOrdnerId,
    titel: texte.titelNeu,
    inhalt: '',
    tags: [],
    angepinnt: false,
    erstelltAm: zeit,
    geaendertAm: zeit
  };

  zustand.notizen.unshift(notiz);
  zustand.aktiveNotizId = notiz.id;
  speichereDaten(false);
  renderAlles();
  elemente.titel.focus();
}

function ordnerErstellen() {
  const name = window.prompt(texte.ordnerPrompt, '');
  if (name === null) return;

  const bereinigt = name.trim();
  if (!bereinigt) {
    window.alert(texte.ordnerLeer);
    return;
  }

  const existiert = zustand.ordner.some((ordner) => ordner.name.toLowerCase() === bereinigt.toLowerCase());
  if (existiert) {
    window.alert(texte.ordnerExistiert);
    return;
  }

  const ordner = { id: erstelleId(), name: bereinigt };
  zustand.ordner.push(ordner);
  zustand.aktiverOrdner = ordner.id;
  speichereDaten(false);
  renderAlles();
}

function aktiveNotizLoeschen() {
  if (!zustand.aktiveNotizId) return;
  if (!window.confirm(texte.loeschenFrage)) return;

  zustand.notizen = zustand.notizen.filter((notiz) => notiz.id !== zustand.aktiveNotizId);

  const gefiltert = holeGefilterteNotizen();
  zustand.aktiveNotizId = gefiltert[0]?.id || zustand.notizen[0]?.id || null;

  speichereDaten(false);
  renderAlles();
}

function fuegeTextEin(vorlageText) {
  const feld = elemente.inhalt;
  if (!feld) return;

  const start = feld.selectionStart;
  const ende = feld.selectionEnd;
  const vorher = feld.value.slice(0, start);
  const nachher = feld.value.slice(ende);
  feld.value = `${vorher}${vorlageText}${nachher}`;

  const neuePosition = start + vorlageText.length;
  feld.focus();
  feld.setSelectionRange(neuePosition, neuePosition);
  planeAutospeichern();
}

function setupMobilePanels() {
  const panels = Array.from(document.querySelectorAll('[data-mobile-panel]'));
  if (panels.length === 0) return;

  const istMobil = window.innerWidth <= 768;

  if (!istMobil) {
    panels.forEach((panel) => {
      panel.classList.remove('mobile-offen');
      const toggle = panel.querySelector('[data-mobile-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
    return;
  }

  let offenPanel = panels.find((panel) => panel.classList.contains('mobile-offen'));
  if (!offenPanel) {
    offenPanel = panels.find((panel) => panel.classList.contains('mobile-standard-offen')) || panels[0];
  }

  panels.forEach((panel) => {
    const istOffen = panel === offenPanel;
    panel.classList.toggle('mobile-offen', istOffen);
    const toggle = panel.querySelector('[data-mobile-toggle]');
    if (toggle) toggle.setAttribute('aria-expanded', istOffen ? 'true' : 'false');
  });

  panels.forEach((panel) => {
    const toggle = panel.querySelector('[data-mobile-toggle]');
    if (!toggle) return;

    if (toggle._mobilePanelHandler) {
      toggle.removeEventListener('click', toggle._mobilePanelHandler);
    }

    const handler = () => {
      if (window.innerWidth > 768) return;

      const istAktuellOffen = panel.classList.contains('mobile-offen');
      panels.forEach((anderesPanel) => {
        anderesPanel.classList.remove('mobile-offen');
        const andererToggle = anderesPanel.querySelector('[data-mobile-toggle]');
        if (andererToggle) andererToggle.setAttribute('aria-expanded', 'false');
      });

      if (!istAktuellOffen) {
        panel.classList.add('mobile-offen');
        toggle.setAttribute('aria-expanded', 'true');
      }
    };

    toggle.addEventListener('click', handler);
    toggle._mobilePanelHandler = handler;
  });
}

function registriereEvents() {
  setupMobilePanels();

  elemente.notizAnlegen?.addEventListener('click', notizErstellen);
  elemente.ordnerAnlegen?.addEventListener('click', ordnerErstellen);
  elemente.loeschen?.addEventListener('click', aktiveNotizLoeschen);

  elemente.suche?.addEventListener('input', (ereignis) => {
    zustand.suchbegriff = ereignis.target.value || '';
    const gefiltert = holeGefilterteNotizen();
    if (!gefiltert.some((notiz) => notiz.id === zustand.aktiveNotizId)) {
      zustand.aktiveNotizId = gefiltert[0]?.id || null;
    }
    renderAlles();
  });

  elemente.nurAngepinnt?.addEventListener('change', (ereignis) => {
    zustand.nurAngepinnt = Boolean(ereignis.target.checked);
    const gefiltert = holeGefilterteNotizen();
    if (!gefiltert.some((notiz) => notiz.id === zustand.aktiveNotizId)) {
      zustand.aktiveNotizId = gefiltert[0]?.id || null;
    }
    renderAlles();
  });

  [elemente.titel, elemente.tags, elemente.inhalt].forEach((feld) => {
    feld?.addEventListener('input', planeAutospeichern);
  });

  elemente.angepinnt?.addEventListener('change', () => {
    aktualisiereAktiveNotizAusEditor();
    renderAlles();
  });

  elemente.vorlageTitel?.addEventListener('click', () => fuegeTextEin(texte.vorlageTitel));
  elemente.vorlageCheck?.addEventListener('click', () => fuegeTextEin(texte.vorlageCheck));
  elemente.vorlageInfo?.addEventListener('click', () => fuegeTextEin(texte.vorlageInfo));

  elemente.cloudSyncBtn?.addEventListener('click', () => {
    fuehreCloudSyncAus(true);
  });

  window.addEventListener('online', () => {
    if (zustand.userId) {
      setzeCloudStatus(texte.cloudLade);
      fuehreCloudSyncAus(false);
    }
  });

  window.addEventListener('offline', () => {
    setzeCloudStatus(texte.cloudOffline);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && zustand.userId) {
      fuehreCloudSyncAus(false);
    }
  });

  window.addEventListener('focus', () => {
    if (zustand.userId) {
      fuehreCloudSyncAus(false);
    }
  });

  window.addEventListener('beforeunload', () => {
    stoppeAutoCloudSync();
  });

  window.addEventListener('resize', setupMobilePanels);

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (_event === 'INITIAL_SESSION' && !session?.user?.id && zustand.userId) {
      return;
    }

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
  if (elemente.tagHinweis) {
    elemente.tagHinweis.textContent = texte.tagHinweis;
  }

  if (elemente.cloudSyncBtn) {
    elemente.cloudSyncBtn.textContent = texte.cloudSync;
  }

  await initialisiereCloudSync();
}

init();

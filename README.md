# SafeNet Security

**SafeNet Security** ist eine deutschsprachige Lernplattform rund um Passwortsicherheit und digitale Angriffe. Die Plattform läuft komplett im Browser und bietet Tools, Wissen und praktische Übungen für mehr digitale Sicherheit.

## Funktionen
- **Passwort-Analyse:** Stärke von Passwörtern prüfen und verbessern
- **Passwort-Generator:** Sichere Passwörter nach eigenen Vorgaben erstellen
- **Verschlüsselter Tresor:** Passwörter und Notizen sicher speichern (clientseitig verschlüsselt)
- **Angriffs-Infos:** Erklärungen zu Phishing, Bruteforce, Social Engineering, Keyloggern und Wörterbuchangriffen
- **Tutorials & News:** Aktuelle Sicherheitstipps und Schritt-für-Schritt-Anleitungen

## Technik
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ohne Frameworks)
- **Backend:** Supabase (Auth, Datenbank, Storage)
- **Hosting:** Vercel
- **Design:** Responsive, Dark-Theme, moderne UI

## Projektstruktur (Auszug)
- `index.html` – Startseite
- `pages/` – Unterseiten (z. B. analysator.html, bruteforce.html)
- `css/` – Modulare Styles pro Seite
- `js/` – JavaScript-Module (z. B. analyse.js, tresor.js)
- `partials/` – Navbar und Footer (per JS geladen)
- `images/` – Logos und Illustrationen

## Mitmachen & Entwicklung
1. Projekt lokal klonen
2. Node.js installieren (für Build-Skripte)
3. Im Projektordner `node build.js` ausführen, um statische Assets zu generieren
4. Änderungen per Pull Request vorschlagen

## Datenschutz & Sicherheit
- Keine sensiblen Daten im Frontend-Code
- Alle Benutzereingaben werden validiert
- Keine Speicherung von Passwörtern im Klartext

## Lizenz
MIT License

---
Mehr Infos und die Live-Version findest du auf der offiziellen Website.

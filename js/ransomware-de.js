!(function () {
  const e = Array.from(document.querySelectorAll("#rw-files .rw-file")),
    t = document.getElementById("rw-log"),
    n = document.getElementById("rw-ransom-note"),
    r = document.getElementById("rw-start"),
    l = document.getElementById("rw-reset");
  let s = !1,
    a = null;
  function o(e) {
    const n = new Date().toLocaleTimeString("de-CH", { hour12: !1 });
    ((t.textContent += "[" + n + "] " + e + "\n"),
      (t.scrollTop = t.scrollHeight));
  }
  function c(e) {
    return new Promise((t) => setTimeout(t, e));
  }
  (r.addEventListener("click", () => {
    s ||
      (async function () {
        ((s = !0),
          (r.disabled = !0),
          (l.disabled = !0),
          (t.textContent = ""),
          (n.style.display = "none"),
          o("Verbindung hergestellt..."),
          await c(600),
          o("Netzwerk wird gescannt..."),
          await c(700),
          o("Backup-Verzeichnisse gefunden – werden deaktiviert..."),
          await c(800),
          o("Verschlüsselungs-Schlüssel generiert: AES-256 + RSA-2048"),
          await c(500),
          o("Starte Verschlüsselung...\n"));
        for (const t of e) {
          const e = t.dataset.name,
            n = e + ".locked";
          (o("Verschlüssle: " + e + " → " + n),
            (t.querySelector(".rw-file-name").textContent = n),
            (t.querySelector(".rw-file-icon").textContent = "🔒"),
            (t.querySelector(".rw-file-status").textContent = "✗ Gesperrt"),
            t.classList.remove("normal"),
            t.classList.add("encrypted"),
            await c(550));
        }
        (await c(400),
          o(
            "\nVerschlüsselung abgeschlossen. Lösegeldforderung wird angezeigt.",
          ),
          (n.style.display = "block"),
          (l.disabled = !1),
          (function () {
            let e = 259200;
            const t = document.getElementById("rw-countdown");
            a = setInterval(() => {
              if ((e--, e < 0))
                return (clearInterval(a), void (t.textContent = "00:00:00"));
              const n = String(Math.floor(e / 3600)).padStart(2, "0"),
                r = String(Math.floor((e % 3600) / 60)).padStart(2, "0"),
                l = String(e % 60).padStart(2, "0");
              t.textContent = n + ":" + r + ":" + l;
            }, 1e3);
          })());
      })();
  }),
    l.addEventListener("click", function () {
      a && (clearInterval(a), (a = null));
      const o = [
        ["🖼️", "urlaub_2024.jpg"],
        ["📊", "buchhaltung.xlsx"],
        ["📝", "passwörter.txt"],
        ["📄", "diplom.pdf"],
        ["🗃️", "kundendaten.db"],
      ];
      (e.forEach((e, t) => {
        ((e.querySelector(".rw-file-icon").textContent = o[t][0]),
          (e.querySelector(".rw-file-name").textContent = o[t][1]),
          (e.querySelector(".rw-file-status").textContent = "✓ Lesbar"),
          e.classList.remove("encrypted"),
          e.classList.add("normal"),
          (e.dataset.name = o[t][1]));
      }),
        (t.textContent = "Warte auf Start…"),
        (n.style.display = "none"),
        (r.disabled = !1),
        (l.disabled = !0),
        (s = !1));
    }));
})();

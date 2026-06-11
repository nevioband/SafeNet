!(function () {
  const e = document.getElementById("fz-scan-btn"),
    t = document.getElementById("fz-clone-btn"),
    n = document.getElementById("fz-use-btn"),
    s = document.getElementById("fz-reset-btn"),
    a = document.getElementById("fz-screen"),
    d = document.getElementById("fz-door"),
    l = document.getElementById("fz-door-status"),
    o = document.getElementById("fz-result"),
    r = document.querySelectorAll(".fz-step");
  let c = 0,
    i = [];
  function u(e) {
    r.forEach((t, n) => {
      (t.classList.remove("active", "done"),
        n < e ? t.classList.add("done") : n === e && t.classList.add("active"));
    });
  }
  (e.addEventListener("click", () => {
    0 === c &&
      ((e.disabled = !0),
      u(0),
      (a.textContent = "RFID lesen...\n\n📡 Suche nach Signal..."),
      i.push(
        setTimeout(() => {
          ((a.textContent =
            "RFID lesen...\n\n✓ Karte erkannt\nTyp: Mifare Classic 1K\nUID: A3:4F:8C:21"),
            (c = 1),
            u(1),
            (t.disabled = !1));
        }, 2200),
      ));
  }),
    t.addEventListener("click", () => {
      1 === c &&
        ((t.disabled = !0),
        (a.textContent = "Karte klonen...\n\n⏳ Schreibe Daten..."),
        i.push(
          setTimeout(() => {
            ((a.textContent =
              "Karte klonen...\n\n✓ Klon erstellt!\nUID A3:4F:8C:21\ngespeichert."),
              (c = 2),
              u(2),
              (n.disabled = !1));
          }, 1800),
        ));
    }),
    n.addEventListener("click", () => {
      2 === c &&
        ((n.disabled = !0),
        (a.textContent = "Emuliere Karte...\n\n📲 Halte ans Lesegerät..."),
        i.push(
          setTimeout(() => {
            ((a.textContent = "Emuliere Karte...\n\n✓ Zugriff gewährt!"),
              d.classList.add("unlocked"),
              (d.textContent = "🔓"),
              (l.textContent = "✓ Tür geöffnet – Zugriff gewährt"),
              (l.className = "fz-door-status unlocked"),
              u(3),
              (o.className = "fz-result-banner danger"),
              (o.textContent =
                "⚠️ Zugangskarte erfolgreich geklont – der Angreifer hat physischen Zugang ohne das Original."),
              (o.style.display = "block"));
          }, 1500),
        ));
    }),
    s.addEventListener("click", () => {
      (i.forEach(clearTimeout),
        (i = []),
        (c = 0),
        (e.disabled = !1),
        (t.disabled = !0),
        (n.disabled = !0),
        (a.textContent = "Bereit.\n\nDrücke «Karte scannen»\num zu beginnen."),
        d.classList.remove("unlocked"),
        (d.textContent = "🔒"),
        (l.textContent = "Türe gesperrt"),
        (l.className = "fz-door-status"),
        (o.style.display = "none"),
        (o.className = "fz-result-banner"),
        u(-1));
    }));
})();

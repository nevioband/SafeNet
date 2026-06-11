!(function () {
  const e = document.getElementById("fz-scan-btn"),
    t = document.getElementById("fz-clone-btn"),
    n = document.getElementById("fz-use-btn"),
    d = document.getElementById("fz-reset-btn"),
    s = document.getElementById("fz-screen"),
    a = document.getElementById("fz-door"),
    c = document.getElementById("fz-door-status"),
    o = document.getElementById("fz-result"),
    l = document.querySelectorAll(".fz-step");
  let r = 0,
    i = [];
  function u(e) {
    l.forEach((t, n) => {
      (t.classList.remove("active", "done"),
        n < e ? t.classList.add("done") : n === e && t.classList.add("active"));
    });
  }
  (e.addEventListener("click", () => {
    0 === r &&
      ((e.disabled = !0),
      u(0),
      (s.textContent = "Read RFID...\n\n📡 Searching for signal..."),
      i.push(
        setTimeout(() => {
          ((s.textContent =
            "Read RFID...\n\n✓ Card detected\nType: Mifare Classic 1K\nUID: A3:4F:8C:21"),
            (r = 1),
            u(1),
            (t.disabled = !1));
        }, 2200),
      ));
  }),
    t.addEventListener("click", () => {
      1 === r &&
        ((t.disabled = !0),
        (s.textContent = "Clone card...\n\n⏳ Writing data..."),
        i.push(
          setTimeout(() => {
            ((s.textContent =
              "Clone card...\n\n✓ Clone created!\nUID A3:4F:8C:21\nsaved."),
              (r = 2),
              u(2),
              (n.disabled = !1));
          }, 1800),
        ));
    }),
    n.addEventListener("click", () => {
      2 === r &&
        ((n.disabled = !0),
        (s.textContent = "Emulate card...\n\n📲 Hold to reader..."),
        i.push(
          setTimeout(() => {
            ((s.textContent = "Emulate card...\n\n✓ Access granted!"),
              a.classList.add("unlocked"),
              (a.textContent = "🔓"),
              (c.textContent = "✓ Door opened – Access granted"),
              (c.className = "fz-door-status unlocked"),
              u(3),
              (o.className = "fz-result-banner danger"),
              (o.textContent =
                "⚠️ Access card successfully cloned – the attacker gains physical entry without the original card."),
              (o.style.display = "block"));
          }, 1500),
        ));
    }),
    d.addEventListener("click", () => {
      (i.forEach(clearTimeout),
        (i = []),
        (r = 0),
        (e.disabled = !1),
        (t.disabled = !0),
        (n.disabled = !0),
        (s.textContent = "Ready.\n\nPress «Scan Card»\nto begin."),
        a.classList.remove("unlocked"),
        (a.textContent = "🔒"),
        (c.textContent = "Door locked"),
        (c.className = "fz-door-status"),
        (o.style.display = "none"),
        (o.className = "fz-result-banner"),
        u(-1));
    }));
})();

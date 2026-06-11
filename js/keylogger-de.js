(!(function () {
  const e = document.getElementById("eingabe"),
    t = document.getElementById("ausgabe"),
    n = document.getElementById("key-count"),
    o = document.getElementById("key-clear"),
    l = [];
  (e.addEventListener("keydown", (e) => {
    let o;
    (" " === e.key
      ? (o = "[␣]")
      : "Backspace" === e.key
        ? (o = "[←]")
        : "Enter" === e.key
          ? (o = "[Enter]")
          : "Tab" === e.key
            ? (e.preventDefault(), (o = "[Tab]"))
            : (o = 1 === e.key.length ? e.key : "[" + e.key + "]"),
      l.push(o),
      (t.textContent = l.join(" ")),
      (t.scrollTop = t.scrollHeight),
      (n.textContent = l.length + " Tasten aufgezeichnet"));
  }),
    o.addEventListener("click", () => {
      ((l.length = 0),
        (t.textContent = "Noch keine Taste erkannt."),
        (n.textContent = ""),
        (e.value = ""),
        e.focus());
    }));
})(),
  (function () {
    const e = document.getElementById("kl2-user"),
      t = document.getElementById("kl2-pass"),
      n = document.getElementById("kl2-log"),
      o = document.getElementById("kl2-live-dot"),
      l = document.getElementById("kl2-count"),
      c = document.getElementById("kl2-clear"),
      u = [];
    function a(e, t) {
      const c = (function (e) {
        return " " === e
          ? "[LEERTASTE]"
          : "Backspace" === e
            ? "[LÖSCHEN]"
            : "Enter" === e
              ? "[ENTER]"
              : "Tab" === e
                ? "[TAB]"
                : 1 === e.length
                  ? e
                  : null;
      })(t);
      if (null === c) return;
      const a = new Date().toLocaleTimeString("de-CH", { hour12: !1 }),
        d = "user" === e ? "Benutzer" : "Passwort";
      (0 === u.length && (n.textContent = ""),
        u.push("[" + a + "] " + d + " → " + c),
        (n.textContent = u.join("\n")),
        (n.scrollTop = n.scrollHeight),
        (l.textContent = u.length + " Ereignisse übermittelt"),
        (o.style.opacity = "0.15"),
        setTimeout(() => {
          o.style.opacity = "1";
        }, 150));
    }
    (e.addEventListener("keydown", (e) => a("user", e.key)),
      t.addEventListener("keydown", (e) => a("pass", e.key)),
      c.addEventListener("click", () => {
        ((u.length = 0),
          (n.textContent = "Warte auf Eingabe…"),
          (l.textContent = ""),
          (e.value = ""),
          (t.value = ""));
      }));
  })());

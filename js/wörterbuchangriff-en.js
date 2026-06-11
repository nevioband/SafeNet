import { WOERTERBUCH as e } from "/js/passwortliste.js";
!(function () {
  let t = !1;
  (document.getElementById("wb-toggle").addEventListener("click", () => {
    const e = document.getElementById("wb-target"),
      t = document.getElementById("wb-toggle");
    "password" === e.type
      ? ((e.type = "text"), (t.innerHTML = "&#128584;"))
      : ((e.type = "password"), (t.innerHTML = "&#128065;"));
  }),
    document.getElementById("wb-target").addEventListener("keydown", (e) => {
      "Enter" === e.key && document.getElementById("wb-start").click();
    }),
    document.getElementById("wb-start").addEventListener("click", () => {
      if (t) return;
      const n = document.getElementById("wb-target").value;
      if (!n)
        return void (document.getElementById("wb-status").textContent =
          "Please enter a password.");
      const s = e.length;
      ((t = !0),
        (document.getElementById("wb-start").disabled = !0),
        (document.getElementById("wb-result").textContent = ""),
        (document.getElementById("wb-result").className = "bf-result"),
        (document.getElementById("wb-progress-bar").style.width = "0%"),
        (document.getElementById("wb-info-row").style.display = "flex"));
      let o = 0;
      const d = performance.now(),
        r = e.indexOf(n);
      ((document.getElementById("wb-status").textContent =
        "Searching " + s + " passwords…"),
        requestAnimationFrame(function a() {
          const l = Math.min(o + 30, r >= 0 ? r + 1 : s);
          o = l;
          const m = ((o / s) * 100).toFixed(0),
            c = ((performance.now() - d) / 1e3).toFixed(2);
          if (
            ((document.getElementById("wb-current").textContent =
              e[o - 1] || "—"),
            (document.getElementById("wb-count").textContent = o + " of " + s),
            (document.getElementById("wb-progress-bar").style.width = m + "%"),
            (document.getElementById("wb-status").textContent =
              'Testing: "' + (e[o - 1] || "") + '"'),
            r >= 0 && o >= r + 1)
          ) {
            ((t = !1),
              (document.getElementById("wb-start").disabled = !1),
              (document.getElementById("wb-status").textContent =
                "⚠ Found in dictionary! Cracked after " + c + "s."));
            const e = document.getElementById("wb-result");
            ((e.className = "bf-result bf-danger"),
              (e.innerHTML =
                "<strong>Found at position " +
                (r + 1) +
                " of " +
                s +
                '!</strong> This password appears in every attack list. Change it immediately using the <a href="/en/pages/generator.html" style="color:#66d9ff">Password Generator</a>.'));
          } else if (o >= s) {
            ((t = !1),
              (document.getElementById("wb-start").disabled = !1),
              (document.getElementById("wb-current").textContent = n),
              (document.getElementById("wb-status").textContent =
                "✓ All " + s + " entries searched – not found."));
            const e = document.getElementById("wb-result");
            ((e.className = "bf-result bf-safe"),
              (e.innerHTML =
                "<strong>Good!</strong> Your password was not in this demo list (" +
                s +
                " entries). Real protection requires at least 12 characters, uppercase/lowercase letters, numbers and special characters."));
          } else requestAnimationFrame(a);
        }));
    }));
})();

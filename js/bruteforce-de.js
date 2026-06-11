!(function () {
  const e = "abcdefghijklmnopqrstuvwxyz";
  let t = !1;
  (document.getElementById("bf-target").addEventListener("keydown", (e) => {
    "Enter" === e.key && document.getElementById("bf-start").click();
  }),
    document.getElementById("bf-start").addEventListener("click", () => {
      if (t) return;
      const n = document.getElementById("bf-target").value;
      if (!n)
        return void (document.getElementById("bf-status").textContent =
          "Bitte ein Passwort eingeben.");
      const r = n.length,
        {
          chars: s,
          size: o,
          parts: i,
        } = (function (t) {
          let n = "",
            r = 0;
          const s = [];
          return (
            /[a-z]/.test(t) &&
              ((n += e), (r += 26), s.push("Kleinbuchstaben (26)")),
            /[A-Z]/.test(t) &&
              ((n += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
              (r += 26),
              s.push("Grossbuchstaben (26)")),
            /[0-9]/.test(t) &&
              ((n += "0123456789"), (r += 10), s.push("Ziffern (10)")),
            /[^a-zA-Z0-9]/.test(t) &&
              ((n += "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"),
              (r += 32),
              s.push("Sonderzeichen (32)")),
            n || ((n = e), (r = 26), s.push("Kleinbuchstaben (26)")),
            { chars: n, size: r, parts: s }
          );
        })(n),
        c = BigInt(o) ** BigInt(r),
        u = c / 1000000000n;
      ((t = !0),
        (document.getElementById("bf-start").disabled = !0),
        (document.getElementById("bf-result").textContent = ""),
        (document.getElementById("bf-result").className = "bf-result"),
        (document.getElementById("bf-progress-bar").style.width = "0%"),
        (document.getElementById("bf-charset-size").textContent =
          o + " Zeichen"));
      const d = performance.now();
      requestAnimationFrame(function e() {
        const a = performance.now() - d,
          l = Math.min((a / 2500) * 100, 99.9);
        if (
          ((document.getElementById("bf-current").textContent = (function (
            e,
            t,
          ) {
            let n = "";
            for (let r = 0; r < t; r++)
              n += e[Math.floor(Math.random() * e.length)];
            return n;
          })(s, r)),
          (document.getElementById("bf-progress-bar").style.width =
            l.toFixed(1) + "%"),
          (document.getElementById("bf-status").textContent =
            "Angriff läuft… (" + i.join(", ") + ")"),
          a < 2500)
        )
          requestAnimationFrame(e);
        else {
          ((t = !1),
            (document.getElementById("bf-start").disabled = !1),
            (document.getElementById("bf-progress-bar").style.width = "100%"),
            (document.getElementById("bf-current").textContent = n));
          const e = (function (e) {
              if (e <= 0n) return "sofort";
              if (e < 60n) return e + " Sekunden";
              if (e < 3600n) return e / 60n + " Minuten";
              if (e < 86400n) return e / 3600n + " Stunden";
              const t = e / 86400n;
              if (t < 365n) return t + " Tage";
              const n = t / 365n;
              return n < 1000000n
                ? n.toLocaleString("de-CH") + " Jahre"
                : n < 1000000000n
                  ? (n / 1000000n).toLocaleString("de-CH") + " Millionen Jahre"
                  : (n / 1000000000n).toLocaleString("de-CH") +
                    " Milliarden Jahre";
            })(u),
            s = u > 3153600000n;
          document.getElementById("bf-status").textContent = s
            ? "✓ Sehr sicher – dieser Angriff würde extrem lange dauern."
            : "⚠ Unsicher – dieser Angriff ist in überschaubarer Zeit möglich.";
          const d = document.getElementById("bf-result");
          ((d.className = "bf-result " + (s ? "bf-safe" : "bf-danger")),
            (d.innerHTML =
              "<strong>Zeichensatz:</strong> " +
              i.join(" + ") +
              " = " +
              o +
              " mögliche Zeichen<br><strong>Kombinationen:</strong> " +
              o +
              "<sup>" +
              r +
              "</sup> = " +
              c.toLocaleString("de-CH") +
              "<br><strong>Geschätzte Knackzeit</strong> (10<sup>9</sup> Versuche/Sek.): <strong>" +
              e +
              "</strong>"));
        }
      });
    }));
})();

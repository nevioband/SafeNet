!(function () {
  const t = "abcdefghijklmnopqrstuvwxyz";
  let e = !1;
  (document.getElementById("bf-target").addEventListener("keydown", (t) => {
    "Enter" === t.key && document.getElementById("bf-start").click();
  }),
    document.getElementById("bf-start").addEventListener("click", () => {
      if (e) return;
      const n = document.getElementById("bf-target").value;
      if (!n)
        return void (document.getElementById("bf-status").textContent =
          "Please enter a password.");
      const s = n.length,
        {
          chars: r,
          size: o,
          parts: a,
        } = (function (e) {
          let n = "",
            s = 0;
          const r = [];
          return (
            /[a-z]/.test(e) && ((n += t), (s += 26), r.push("Lowercase (26)")),
            /[A-Z]/.test(e) &&
              ((n += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
              (s += 26),
              r.push("Uppercase (26)")),
            /[0-9]/.test(e) &&
              ((n += "0123456789"), (s += 10), r.push("Digits (10)")),
            /[^a-zA-Z0-9]/.test(e) &&
              ((n += "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"),
              (s += 32),
              r.push("Special chars (32)")),
            n || ((n = t), (s = 26), r.push("Lowercase (26)")),
            { chars: n, size: s, parts: r }
          );
        })(n),
        c = BigInt(o) ** BigInt(s),
        i = c / 1000000000n;
      ((e = !0),
        (document.getElementById("bf-start").disabled = !0),
        (document.getElementById("bf-result").textContent = ""),
        (document.getElementById("bf-result").className = "bf-result"),
        (document.getElementById("bf-progress-bar").style.width = "0%"),
        (document.getElementById("bf-charset-size").textContent =
          o + " characters"));
      const u = performance.now();
      requestAnimationFrame(function t() {
        const l = performance.now() - u,
          d = Math.min((l / 2500) * 100, 99.9);
        if (
          ((document.getElementById("bf-current").textContent = (function (
            t,
            e,
          ) {
            let n = "";
            for (let s = 0; s < e; s++)
              n += t[Math.floor(Math.random() * t.length)];
            return n;
          })(r, s)),
          (document.getElementById("bf-progress-bar").style.width =
            d.toFixed(1) + "%"),
          (document.getElementById("bf-status").textContent =
            "Attack running… (" + a.join(", ") + ")"),
          l < 2500)
        )
          requestAnimationFrame(t);
        else {
          ((e = !1),
            (document.getElementById("bf-start").disabled = !1),
            (document.getElementById("bf-progress-bar").style.width = "100%"),
            (document.getElementById("bf-current").textContent = n));
          const t = (function (t) {
              if (t <= 0n) return "instantly";
              if (t < 60n) return t + " seconds";
              if (t < 3600n) return t / 60n + " minutes";
              if (t < 86400n) return t / 3600n + " hours";
              const e = t / 86400n;
              if (e < 365n) return e + " days";
              const n = e / 365n;
              return n < 1000000n
                ? n.toLocaleString("en") + " years"
                : n < 1000000000n
                  ? (n / 1000000n).toLocaleString("en") + " million years"
                  : (n / 1000000000n).toLocaleString("en") + " billion years";
            })(i),
            r = i > 3153600000n;
          document.getElementById("bf-status").textContent = r
            ? "✓ Very secure – this attack would take an extremely long time."
            : "⚠ Insecure – this attack is feasible within a manageable timeframe.";
          const u = document.getElementById("bf-result");
          ((u.className = "bf-result " + (r ? "bf-safe" : "bf-danger")),
            (u.innerHTML =
              "<strong>Character set:</strong> " +
              a.join(" + ") +
              " = " +
              o +
              " possible characters<br><strong>Combinations:</strong> " +
              o +
              "<sup>" +
              s +
              "</sup> = " +
              c.toLocaleString("en") +
              "<br><strong>Estimated crack time</strong> (10<sup>9</sup> attempts/sec): <strong>" +
              t +
              "</strong>"));
        }
      });
    }));
})();

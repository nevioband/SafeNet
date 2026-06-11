!(function () {
  const e = [
      "paypal",
      "amazon",
      "google",
      "microsoft",
      "apple",
      "netflix",
      "spotify",
      "facebook",
      "instagram",
      "twitter",
      "linkedin",
      "dropbox",
      "onedrive",
      "icloud",
      "ebay",
      "dhl",
      "fedex",
      "ups",
      "postfinance",
      "ubs",
      "raiffeisen",
      "zkb",
      "swisscom",
      "twint",
      "sbb",
      "migros",
      "coop",
      "galaxus",
    ],
    t = [
      "bit.ly",
      "tinyurl.com",
      "t.co",
      "goo.gl",
      "ow.ly",
      "is.gd",
      "buff.ly",
      "adf.ly",
      "tiny.cc",
      "rb.gy",
      "cutt.ly",
      "shorte.st",
    ],
    n = [
      ".tk",
      ".ml",
      ".ga",
      ".cf",
      ".gq",
      ".xyz",
      ".top",
      ".click",
      ".work",
      ".loan",
      ".download",
      ".win",
      ".racing",
      ".date",
      ".review",
      ".stream",
      ".zip",
    ];
  function s(e, t) {
    if (Math.abs(e.length - t.length) > 3) return 99;
    const n = e.length,
      s = t.length,
      i = Array.from({ length: n + 1 }, (e, t) =>
        Array.from({ length: s + 1 }, (e, n) =>
          0 === t ? n : 0 === n ? t : 0,
        ),
      );
    for (let o = 1; o <= n; o++)
      for (let n = 1; n <= s; n++)
        i[o][n] =
          e[o - 1] === t[n - 1]
            ? i[o - 1][n - 1]
            : 1 + Math.min(i[o - 1][n], i[o][n - 1], i[o - 1][n - 1]);
    return i[n][s];
  }
  function i() {
    const i = document.getElementById("ph-input").value;
    if (!i.trim()) return;
    const o = (function (i) {
      const o = [];
      let a = 0;
      const r = i.trim();
      if (!r) return null;
      const c = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(r);
      let l = "";
      if (c) {
        const e = r.split("@");
        if (2 !== e.length)
          return (
            o.push({
              text: "Invalid email format (multiple @ characters)",
              score: 3,
            }),
            { score: 3, warnings: o, type: "email" }
          );
        l = e[1].toLowerCase();
      } else {
        if (/^data:/i.test(r))
          return (
            o.push({
              text: "Data URI – may contain hidden malicious content",
              score: 3,
            }),
            { score: 3, warnings: o, type: "url" }
          );
        const t = /^https?:\/\//i.test(r) ? r : "https://" + r;
        try {
          const n = new URL(t);
          l = n.hostname.toLowerCase();
          const s = l.split(".").slice(-2)[0],
            i = e.includes(s);
          ("http:" === n.protocol &&
            (o.push({ text: "No HTTPS – connection is unencrypted", score: 1 }),
            (a += 1)),
            (n.username || n.password) &&
              (o.push({
                text: "Credentials in URL (user:password@host) – classic obfuscation technique",
                score: 3,
              }),
              (a += 3)),
            n.port &&
              "80" !== n.port &&
              "443" !== n.port &&
              (o.push({
                text: "Unusual port " + n.port + " in the URL",
                score: 1,
              }),
              (a += 1)),
            r.length > 250 &&
              (o.push({
                text:
                  "Very long URL (" +
                  r.length +
                  " characters) – phishing URLs are often unnecessarily long",
                score: 1,
              }),
              (a += 1)));
          const c = (n.pathname + n.search).toLowerCase();
          if (
            ([
              "redirect=",
              "url=http",
              "goto=",
              "return=http",
              "next=http",
              "continue=http",
            ].some((e) => c.includes(e)) &&
              (o.push({
                text: "Redirect parameter in URL – possible redirect to phishing site",
                score: 2,
              }),
              (a += 2)),
            !i)
          ) {
            const e = [
              "login",
              "signin",
              "verify",
              "account",
              "update",
              "confirm",
              "secure",
              "password",
              "credential",
              "banking",
              "webscr",
              "session",
              "locked",
              "suspended",
            ].filter((e) => c.includes(e));
            e.length >= 2 &&
              (o.push({
                text:
                  "Multiple suspicious keywords in URL path: " +
                  e.slice(0, 3).join(", "),
                score: 2,
              }),
              (a += 2));
          }
        } catch {
          return (
            o.push({
              text: "URL could not be analysed – invalid format",
              score: 1,
            }),
            (a += 1),
            { score: a, warnings: o, type: "url" }
          );
        }
      }
      if (l) {
        (/^\d{1,3}(\.\d{1,3}){3}$/.test(l) &&
          (o.push({
            text: "IP address instead of domain name – legitimate services always use a real domain name",
            score: 3,
          }),
          (a += 3)),
          l.includes("xn--") &&
            (o.push({
              text: "Internationalised domain name (Punycode) – possible homograph attack with deceptively similar characters",
              score: 2,
            }),
            (a += 2)));
        const i = n.find((e) => l.endsWith(e));
        (i &&
          (o.push({
            text:
              "Suspicious top-level domain (" +
              i +
              ") – frequently used by phishers",
            score: 2,
          }),
          (a += 2)),
          t.some((e) => l === e) &&
            (o.push({
              text:
                "URL shortening service (" +
                l +
                ") – the real destination is hidden",
              score: 2,
            }),
            (a += 2)));
        const r = l.split("."),
          c = r.slice(-2).join("."),
          p = r.slice(0, -2).join(".").toLowerCase();
        r.length > 4 &&
          (o.push({
            text:
              r.length -
              2 +
              " subdomains in the URL – typical phishing pattern",
            score: 1,
          }),
          (a += 1));
        const d = e.find((e) => p.includes(e) && !c.includes(e));
        if (
          (d &&
            (o.push({
              text:
                'Brand name "' +
                d +
                '" in subdomain, real domain is foreign – classic phishing technique (e.g. paypal.fake-site.com)',
              score: 3,
            }),
            (a += 3)),
          !d && p)
        )
          for (const t of p.split(".")) {
            const n = t
                .replace(/0/g, "o")
                .replace(/1/g, "l")
                .replace(/3/g, "e")
                .replace(/4/g, "a")
                .replace(/5/g, "s")
                .replace(/8/g, "b")
                .replace(/-/g, ""),
              i = e.find((e) => n === e.replace(/-/g, ""));
            if (i) {
              (o.push({
                text:
                  'Subdomain "' +
                  t +
                  '" imitates brand "' +
                  i +
                  '" using character substitution (e.g. 1→l, 0→o) – phishing technique',
                score: 3,
              }),
                (a += 3));
              break;
            }
            const r = e.find((e) => {
              const t = e.replace(/-/g, "");
              return n !== t && s(n, t) <= 1;
            });
            if (r) {
              (o.push({
                text:
                  'Subdomain "' +
                  t +
                  '" closely resembles brand "' +
                  r +
                  '" – possible phishing technique',
                score: 3,
              }),
                (a += 3));
              break;
            }
          }
        const h = c
            .split(".")[0]
            .replace(/0/g, "o")
            .replace(/1/g, "l")
            .replace(/3/g, "e")
            .replace(/4/g, "a")
            .replace(/5/g, "s")
            .replace(/8/g, "b")
            .replace(/-/g, ""),
          u = e.find((e) => {
            const t = e.replace(/-/g, "");
            return h !== t && s(h, t) <= 1;
          });
        if (
          (u &&
            !d &&
            (o.push({
              text:
                'Domain closely resembles well-known brand "' +
                u +
                '" – possible typosquatting domain',
              score: 3,
            }),
            (a += 3)),
          !d && !u)
        ) {
          const t = c.split(".")[0].toLowerCase().replace(/-/g, "");
          if (t !== h) {
            const n = e.find((e) => h.includes(e) && !t.includes(e));
            if (
              (n &&
                (o.push({
                  text:
                    'Domain contains brand name "' +
                    n +
                    '" with character substitution (e.g. 0→o, 1→l) – classic deception technique',
                  score: 3,
                }),
                (a += 3)),
              !n)
            ) {
              const n = e.find((e) => t.includes(e) && t !== e);
              n &&
                (o.push({
                  text:
                    'Domain contains brand name "' +
                    n +
                    '" with manipulated extra words (character substitution) – classic deception technique',
                  score: 3,
                }),
                (a += 3));
            }
          }
        }
        const g = c.split(".")[0];
        if (
          ((g.match(/-/g) || []).length >= 2 &&
            (o.push({
              text: "Many hyphens in the domain name – common pattern in phishing domains",
              score: 1,
            }),
            (a += 1)),
          !d && !u)
        ) {
          const t = new Set([
              "support",
              "service",
              "help",
              "login",
              "secure",
              "online",
              "mail",
              "web",
              "portal",
              "account",
              "info",
              "news",
              "shop",
              "store",
              "center",
              "centre",
              "update",
              "verify",
              "auth",
              "team",
              "group",
              "official",
              "admin",
            ]),
            n = g.split("-").filter((e) => e.length >= 5 && !t.has(e));
          for (const t of n) {
            const n = t
              .replace(/0/g, "o")
              .replace(/1/g, "l")
              .replace(/3/g, "e")
              .replace(/4/g, "a")
              .replace(/5/g, "s")
              .replace(/8/g, "b");
            let i = null;
            for (const o of e) {
              const e = o.replace(/-/g, "");
              if (n === e) break;
              const a = s(n, e),
                r = Math.max(1, Math.floor(0.3 * Math.max(n.length, e.length)));
              if (a > 0 && a <= r) {
                i = { part: t, brand: o };
                break;
              }
            }
            if (i) {
              (o.push({
                text:
                  '"' +
                  i.part +
                  '" resembles brand name "' +
                  i.brand +
                  '" – possible typosquatting domain',
                score: 3,
              }),
                (a += 3));
              break;
            }
          }
        }
      }
      return { score: a, warnings: o, type: c ? "email" : "url" };
    })(i);
    o &&
      (function (e) {
        const t = document.getElementById("ph-result"),
          n = document.getElementById("ph-badge"),
          s = document.getElementById("ph-flags"),
          i = document.getElementById("ph-tip");
        for (t.classList.remove("hidden"); s.firstChild; )
          s.removeChild(s.firstChild);
        let o, a, r;
        if (
          (0 === e.score
            ? ((o = "✓ No warning signs found"),
              (a = "ph-safe"),
              (r =
                "No known phishing indicators were detected. Stay vigilant – no automated check is 100% reliable."))
            : e.score <= 2
              ? ((o = "⚠ Slightly suspicious"),
                (a = "ph-warn"),
                (r =
                  "Weak warning signs detected. Check the URL or sender manually before clicking or entering data."))
              : e.score <= 4
                ? ((o = "⚠ Suspicious"),
                  (a = "ph-suspicious"),
                  (r =
                    "Typical phishing indicators detected. Be very careful and do not enter any personal data."))
                : ((o = "✗ Likely phishing"),
                  (a = "ph-danger"),
                  (r =
                    "Strong phishing indicators detected. Do not open this link and do not enter any data!")),
          (n.textContent = o),
          (n.className = "ph-badge " + a),
          0 === e.warnings.length)
        ) {
          const e = document.createElement("li");
          ((e.textContent = "No suspicious feature found."), s.appendChild(e));
        } else
          e.warnings.forEach((e) => {
            const t = document.createElement("li");
            ((t.textContent = e.text), s.appendChild(t));
          });
        i.textContent = r;
      })(o);
  }
  (document.getElementById("ph-btn").addEventListener("click", i),
    document.getElementById("ph-input").addEventListener("keydown", (e) => {
      "Enter" === e.key && i();
    }));
})();

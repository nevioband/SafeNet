!(function () {
  const e = [
    {
      text: 'Ein Angreifer hat sich offline Zugriff auf eine verschlüsselte Passwortdatenbank verschafft. Mit 5 leistungsstarken GPUs probiert er systematisch jede erdenkliche Zeichenkombination – auch völlig zufällige wie "Kj#2!xZq". Welche Methode nutzt er?',
      optionen: [
        "Phishing",
        "Bruteforce-Angriff",
        "Wörterbuchangriff",
        "Keylogger",
        "Social Engineering",
      ],
      richtig: 1,
      erklaerung:
        "Bruteforce: Alle möglichen Kombinationen werden durchprobiert – keine Wortliste, keine Tricks. Bei zufälligen Passwörtern ist das die einzige Option. Schutz: lange Passwörter (jedes Zeichen mehr multipliziert die Zeit exponentiell).",
    },
    {
      text: "Dein Kollege nutzt für mehrere Dienste dasselbe Passwort „Sommer2021“. Ein kleinerer Online-Shop wird gehackt und die Passwortliste veröffentlicht. Wenig später wird auch sein E-Mail-Konto übernommen – ohne dass dort ein Angriff stattfand. Welche Methode?",
      optionen: [
        "Phishing",
        "Bruteforce-Angriff",
        "Wörterbuchangriff",
        "Keylogger",
        "Social Engineering",
      ],
      richtig: 2,
      erklaerung:
        "Credential Stuffing – eine Form des Wörterbuchangriffs: Angreifer testen geleakte Passwortlisten automatisch bei hunderten anderen Plattformen. Das Passwort muss nicht erraten werden – es ist bereits bekannt. Schutz: einzigartiges Passwort pro Dienst.",
    },
    {
      text: "Du bekommst eine E-Mail von „service@paypal-sicherheit.com“: „Ungewöhnliche Aktivität festgestellt – Konto temporär eingeschränkt.“ Der Link führt zu einer Seite, die exakt wie PayPal aussieht, dort wirst du nach Login und Kreditkarte gefragt. Welcher Angriff?",
      optionen: [
        "Phishing",
        "Bruteforce-Angriff",
        "Wörterbuchangriff",
        "Keylogger",
        "Social Engineering",
      ],
      richtig: 0,
      erklaerung:
        "Phishing: Gefälschte Domain (paypal-sicherheit.com statt paypal.com), künstliche Dringlichkeit und täuschend echtes Design. Social Engineering ist der Oberbegriff – Phishing ist die spezifische technische Umsetzung per E-Mail/Link.",
    },
    {
      text: "Dein Antivirusprogramm meldet: Eine installierte Software hat im Hintergrund alle Tastenanschläge der letzten 30 Tage protokolliert und an einen externen Server gesendet – inklusive deiner Passwörter, die du niemals in einem Browser gespeichert hattest. Welche Angriffsmethode wurde eingesetzt?",
      optionen: [
        "Phishing",
        "Bruteforce-Angriff",
        "Wörterbuchangriff",
        "Keylogger",
        "Social Engineering",
      ],
      richtig: 3,
      erklaerung:
        "Keylogger: Die Software zeichnete direkt jeden Tastendruck auf – unabhängig davon, ob Passwörter im Browser gespeichert sind oder ob du auf Links klickst. Das ist das typische Merkmal eines Keyloggers. Phishing würde eine gefälschte Seite erfordern; hier wurden die Daten lokal abgegriffen.",
    },
    {
      text: "Ein Anrufer nennt den Namen deines Vorgesetzten, erwähnt euer aktuelles Projekt und behauptet, vom externen IT-Dienstleister zu sein. Er bittet dich, kurz eine Remote-Desktop-Verbindung zu erlauben, „um ein dringendes Sicherheitsproblem zu beheben“. Welcher Angriff?",
      optionen: [
        "Phishing",
        "Bruteforce-Angriff",
        "Wörterbuchangriff",
        "Keylogger",
        "Social Engineering",
      ],
      richtig: 4,
      erklaerung:
        "Social Engineering: Der Angreifer nutzt vorab recherchierte Details (Namen, Projekttitel) um Vertrauen aufzubauen – kein technischer Passwortangriff. Remote-Zugang würde vollständigen Systemzugriff geben. Schutz: Identität immer über offizielle Kanäle verifizieren.",
    },
  ];
  let t = 0,
    n = 0;
  function i() {
    const i = e[t];
    ((document.getElementById("aq-nr").textContent =
      "Frage " + (t + 1) + " von " + e.length),
      (document.getElementById("aq-text").textContent = i.text),
      (document.getElementById("aq-feedback").className =
        "se-feedback se-hidden"),
      (document.getElementById("aq-weiter").className = "se-btn se-hidden"));
    const r = document.getElementById("aq-optionen");
    ((r.innerHTML = ""),
      i.optionen.forEach((i, s) => {
        const a = document.createElement("button");
        ((a.className = "se-option"),
          (a.textContent = i),
          a.addEventListener("click", () =>
            (function (i) {
              const r = e[t],
                s = i === r.richtig;
              (s && n++,
                document
                  .querySelectorAll("#aq-optionen .se-option")
                  .forEach((e, t) => {
                    ((e.disabled = !0),
                      t === r.richtig
                        ? e.classList.add("se-richtig")
                        : t !== i || s || e.classList.add("se-falsch"));
                  }));
              const a = document.getElementById("aq-feedback");
              ((a.className =
                "se-feedback " + (s ? "se-fb-gut" : "se-fb-schlecht")),
                (a.textContent =
                  (s ? "✓ Richtig! " : "✗ Falsch. ") + r.erklaerung),
                (document.getElementById("aq-weiter").className = "se-btn"));
            })(s),
          ),
          r.appendChild(a));
      }));
  }
  (document.getElementById("aq-weiter").addEventListener("click", () => {
    if ((t++, t >= e.length)) {
      ((document.getElementById("aq-quiz").style.display = "none"),
        (document.getElementById("aq-ende").className = "se-ende"));
      const t = Math.round((n / e.length) * 100),
        i =
          n === e.length
            ? "🏆 Perfekt!"
            : n >= 3
              ? "👍 Gut!"
              : "⚠ Noch Luft nach oben.";
      document.getElementById("aq-score").innerHTML =
        "<strong>" +
        i +
        "</strong><br>" +
        n +
        " von " +
        e.length +
        " richtig (" +
        t +
        "%)";
    } else i();
  }),
    document.getElementById("aq-neustart").addEventListener("click", () => {
      ((t = 0),
        (n = 0),
        (document.getElementById("aq-ende").className = "se-ende se-hidden"),
        (document.getElementById("aq-quiz").style.display = ""),
        i());
    }),
    i());
})();

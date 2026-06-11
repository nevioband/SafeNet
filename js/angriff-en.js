!(function () {
  const e = [
    {
      text: 'An attacker has gained offline access to an encrypted password database. Using 5 powerful GPUs they systematically try every conceivable character combination – including completely random ones like "Kj#2!xZq". Which method are they using?',
      optionen: [
        "Phishing",
        "Bruteforce attack",
        "Dictionary attack",
        "Keylogger",
        "Social engineering",
      ],
      richtig: 1,
      erklaerung:
        "Bruteforce: Every possible combination is tried – no word list, no tricks. For random passwords this is the only option. Protection: longer passwords (each additional character multiplies the time exponentially).",
    },
    {
      text: 'Your colleague uses the same password "Summer2021" for multiple services. A small online shop is hacked and the password list is published. Shortly afterwards their email account is taken over – without any attack on that account. Which method?',
      optionen: [
        "Phishing",
        "Bruteforce attack",
        "Dictionary attack",
        "Keylogger",
        "Social engineering",
      ],
      richtig: 2,
      erklaerung:
        "Credential stuffing – a form of dictionary attack: attackers automatically test leaked password lists against hundreds of other platforms. The password doesn't need to be guessed – it's already known. Protection: a unique password for each service.",
    },
    {
      text: 'You receive an email from "service@paypal-security-check.com": "Unusual activity detected – account temporarily restricted." The link leads to a page that looks exactly like PayPal, asking for your login and credit card. Which attack?',
      optionen: [
        "Phishing",
        "Bruteforce attack",
        "Dictionary attack",
        "Keylogger",
        "Social engineering",
      ],
      richtig: 0,
      erklaerung:
        "Phishing: Fake domain (paypal-security-check.com instead of paypal.com), artificial urgency and convincingly authentic design. Social engineering is the umbrella term – phishing is the specific technical implementation by email/link.",
    },
    {
      text: "Your antivirus reports: an installed application has secretly logged every keystroke over the last 30 days and sent them to an external server – including passwords you never stored in a browser. Which attack method was used?",
      optionen: [
        "Phishing",
        "Bruteforce attack",
        "Dictionary attack",
        "Keylogger",
        "Social engineering",
      ],
      richtig: 3,
      erklaerung:
        "Keylogger: The software recorded every keystroke directly – regardless of whether passwords are saved in the browser or whether you clicked any links. This is the defining characteristic of a keylogger. Phishing would require a fake site; here data was captured locally.",
    },
    {
      text: 'A caller names your manager, mentions your current project and claims to be from an external IT provider. They ask you to briefly allow a remote desktop connection to "fix an urgent security issue". Which attack?',
      optionen: [
        "Phishing",
        "Bruteforce attack",
        "Dictionary attack",
        "Keylogger",
        "Social engineering",
      ],
      richtig: 4,
      erklaerung:
        "Social engineering: The attacker uses pre-researched details (names, project titles) to build trust – no technical password attack. Remote access would give full system control. Protection: always verify identity through official channels.",
    },
  ];
  let t = 0,
    n = 0;
  function a() {
    const a = e[t];
    ((document.getElementById("aq-nr").textContent =
      "Question " + (t + 1) + " of " + e.length),
      (document.getElementById("aq-text").textContent = a.text),
      (document.getElementById("aq-feedback").className =
        "se-feedback se-hidden"),
      (document.getElementById("aq-weiter").className = "se-btn se-hidden"));
    const i = document.getElementById("aq-optionen");
    ((i.innerHTML = ""),
      a.optionen.forEach((a, o) => {
        const r = document.createElement("button");
        ((r.className = "se-option"),
          (r.textContent = a),
          r.addEventListener("click", () =>
            (function (a) {
              const i = e[t],
                o = a === i.richtig;
              (o && n++,
                document
                  .querySelectorAll("#aq-optionen .se-option")
                  .forEach((e, t) => {
                    ((e.disabled = !0),
                      t === i.richtig
                        ? e.classList.add("se-richtig")
                        : t !== a || o || e.classList.add("se-falsch"));
                  }));
              const r = document.getElementById("aq-feedback");
              ((r.className =
                "se-feedback " + (o ? "se-fb-gut" : "se-fb-schlecht")),
                (r.textContent =
                  (o ? "✓ Correct! " : "✗ Wrong. ") + i.erklaerung),
                (document.getElementById("aq-weiter").className = "se-btn"));
            })(o),
          ),
          i.appendChild(r));
      }));
  }
  (document.getElementById("aq-weiter").addEventListener("click", () => {
    if ((t++, t >= e.length)) {
      ((document.getElementById("aq-quiz").style.display = "none"),
        (document.getElementById("aq-ende").className = "se-ende"));
      const t = Math.round((n / e.length) * 100),
        a =
          n === e.length
            ? "🏆 Perfect!"
            : n >= 3
              ? "👍 Well done!"
              : "⚠ Room for improvement.";
      document.getElementById("aq-score").innerHTML =
        "<strong>" +
        a +
        "</strong><br>" +
        n +
        " of " +
        e.length +
        " correct (" +
        t +
        "%)";
    } else a();
  }),
    document.getElementById("aq-neustart").addEventListener("click", () => {
      ((t = 0),
        (n = 0),
        (document.getElementById("aq-ende").className = "se-ende se-hidden"),
        (document.getElementById("aq-quiz").style.display = ""),
        a());
    }),
    a());
})();

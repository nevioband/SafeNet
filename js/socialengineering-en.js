!(function () {
  const e = [
    {
      text: 'A caller says: "Hello, this is Marco Smith from the IT department. I can see in our system that your laptop was unreachable several times last night. I need to quickly check your credentials, otherwise your account will be automatically locked tonight." What do you do?',
      optionen: [
        {
          text: "I give the details – he knows my laptop status, it sounds genuine.",
          richtig: !1,
        },
        {
          text: "I ask for his extension, hang up and call the IT hotline from the intranet.",
          richtig: !0,
        },
        { text: "I only give my username, not my password.", richtig: !1 },
        {
          text: "I ask him to send me an official email and then wait.",
          richtig: !1,
        },
      ],
      erklaerung:
        "Attackers research details in advance (e.g. system status, company names) to sound credible. The threat of account suspension creates artificial pressure. Correct: hang up, call back yourself via the known official number. An email from the attacker would be equally fake.",
    },
    {
      text: 'You receive a LinkedIn message from a recruiter with 600+ connections and a real profile picture: "I have an interesting offer for you – details as a PDF." The link leads to a Google Drive document. What do you do?',
      optionen: [
        {
          text: "I open it – Google Drive is safe and the profile looks real.",
          richtig: !1,
        },
        {
          text: "I download the PDF and open it in an online viewer instead of locally.",
          richtig: !1,
        },
        {
          text: "I verify the recruiter independently first (e.g. company website, direct call) before opening anything.",
          richtig: !0,
        },
        { text: "I send the link to a colleague to test it.", richtig: !1 },
      ],
      erklaerung:
        "Spear phishing via LinkedIn is real. Fake profiles can have many connections. Google Drive does not protect against malicious content in PDFs (e.g. embedded links, macros). A colleague would be equally at risk.",
    },
    {
      text: 'Your known supplier writes by email – from their usual address: "Our bank details have changed. Please use the following new IBAN for the next payment." What do you do?',
      optionen: [
        {
          text: "I update the IBAN – the sender address is the familiar one.",
          richtig: !1,
        },
        { text: "I reply to the email and ask for confirmation.", richtig: !1 },
        {
          text: "I call the supplier on the number I already know – not the one in the email.",
          richtig: !0,
        },
        {
          text: "I wait for the next invoice to see if it contains the new IBAN.",
          richtig: !1,
        },
      ],
      erklaerung:
        "IBAN fraud: attackers spoof or compromise real email addresses. A reply goes back to the attacker. The next invoice could also be manipulated. The only safe option: phone confirmation via an already known number.",
    },
    {
      text: 'You called the IT helpline yourself because your VPN is not working. The technician resolves the issue. At the end they say: "I just need your current password for documentation in the ticket system." What do you do?',
      optionen: [
        {
          text: "I give it – I called myself so the connection is secure.",
          richtig: !1,
        },
        {
          text: "I give it and immediately change it afterwards.",
          richtig: !1,
        },
        {
          text: "I refuse – no ticketing system requires your plaintext password.",
          richtig: !0,
        },
        {
          text: "I give a variation of my password, not the real one.",
          richtig: !1,
        },
      ],
      erklaerung:
        "Even if you called, an attacker could have compromised the line or operated a fake number. No legitimate system stores plaintext passwords. IT staff can reset passwords – they do not need to know them.",
    },
    {
      text: 'You post on LinkedIn: "First day at my new job – I\'m now on the IT Security team at the National Bank!" Two days later someone calls: "Hello, this is Alex from Procurement. I saw your post – welcome! I need your employee ID quickly for vendor portal access, it\'s normal during onboarding." What do you do?',
      optionen: [
        {
          text: "I give the ID – they knew my post, it seems legitimate.",
          richtig: !1,
        },
        {
          text: "I ask for their last name and google whether they exist.",
          richtig: !1,
        },
        {
          text: "I give nothing and verify the request through my manager or the internal contact list.",
          richtig: !0,
        },
        {
          text: "I give the ID but not a password – the ID alone isn't critical.",
          richtig: !1,
        },
      ],
      erklaerung:
        "Pretexting with public info: your post gave the attacker enough context for a credible story. Employee IDs often enable password resets or access escalations. Googling a name is insufficient – fake profiles are easy to create.",
    },
    {
      text: "An email from your colleague Anna's verified address reads: \"Hey, I'm in a client meeting without my laptop. Can you quickly send me the password for our shared tool? Urgent!\" What do you do?",
      optionen: [
        {
          text: "I send it – the email comes from her real address.",
          richtig: !1,
        },
        { text: "I only send the username, not the password.", richtig: !1 },
        {
          text: "I call Anna on her mobile number before sending anything.",
          richtig: !0,
        },
        { text: 'I reply by email asking: "Is that really you?"', richtig: !1 },
      ],
      erklaerung:
        'If Anna\'s email account was compromised, everything goes to the attacker. Asking by email whether someone is "really themselves" is useless – the attacker will simply reply yes. Only safe verification: calling the known mobile number.',
    },
  ];
  let t = 0,
    n = 0;
  function o() {
    const o = e[t];
    ((document.getElementById("se-nr").textContent =
      "Scenario " + (t + 1) + " of " + e.length),
      (document.getElementById("se-text").textContent = o.text),
      (document.getElementById("se-feedback").className =
        "se-feedback se-hidden"),
      (document.getElementById("se-weiter").className = "se-btn se-hidden"));
    const i = document.getElementById("se-optionen");
    ((i.innerHTML = ""),
      o.optionen.forEach((o, a) => {
        const s = document.createElement("button");
        ((s.className = "se-option"),
          (s.textContent = o.text),
          s.addEventListener("click", () =>
            (function (o) {
              const i = e[t],
                a = i.optionen[o].richtig;
              (a && n++,
                document.querySelectorAll(".se-option").forEach((e, t) => {
                  ((e.disabled = !0),
                    i.optionen[t].richtig
                      ? e.classList.add("se-richtig")
                      : t !== o || a || e.classList.add("se-falsch"));
                }));
              const s = document.getElementById("se-feedback");
              ((s.className =
                "se-feedback " + (a ? "se-fb-gut" : "se-fb-schlecht")),
                (s.textContent =
                  (a ? "✓ Correct! " : "✗ Wrong. ") + i.erklaerung),
                (document.getElementById("se-weiter").className = "se-btn"));
            })(a),
          ),
          i.appendChild(s));
      }));
  }
  (document.getElementById("se-weiter").addEventListener("click", () => {
    if ((t++, t >= e.length)) {
      ((document.getElementById("se-quiz").style.display = "none"),
        (document.getElementById("se-ende").className = "se-ende"));
      const t = Math.round((n / e.length) * 100),
        o =
          n === e.length
            ? "🏆 Perfect!"
            : n >= 3
              ? "👍 Well done!"
              : "⚠ Room for improvement.";
      document.getElementById("se-score").innerHTML =
        "<strong>" +
        o +
        "</strong><br>" +
        n +
        " of " +
        e.length +
        " correct (" +
        t +
        "%)";
    } else o();
  }),
    document.getElementById("se-neustart").addEventListener("click", () => {
      ((t = 0),
        (n = 0),
        (document.getElementById("se-ende").className = "se-ende se-hidden"),
        (document.getElementById("se-quiz").style.display = ""),
        o());
    }),
    o());
})();

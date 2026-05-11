// --- Mobile Navbar Dropdown- und Menü-Handling ---
// (wird wieder im jeweiligen Seiten-Script nach dem Laden der Navbar gesetzt)
import { supabase } from './supabase.js'

async function applyNavbarUser() {
    const userMenu = document.querySelector('.user-menu')
    if (!userMenu) return

    try {
        const { data: { session } } = await supabase.auth.getSession()
        const dropdown = userMenu.querySelector('.user-dropdown')
        const userBtn  = userMenu.querySelector('.user-btn')
        if (!dropdown) return

        if (session && session.user) {
            // 2FA-Bypass verhindern: Wenn 2FA aktiviert aber noch nicht abgeschlossen, abmelden
            // Ausnahme: Einstellungen-Seite und direkt nach MFA-Login (Race Condition mit Token-Refresh)
            const isEnglish = /^\/en(\/|$)/.test(window.location.pathname)
            const isEinstellungen = window.location.pathname.includes('/de/pages/einstellungen.html') || window.location.pathname.includes('/en/pages/einstellungen.html')
            const justLoggedIn = sessionStorage.getItem('loginSuccess') === '1'
            if (justLoggedIn) sessionStorage.removeItem('loginSuccess')
            // AAL-Check nur einmal pro Tab-Session (nicht bei jedem Seitenwechsel).
            // Verhindert falsche Logouts durch Mobile Token-Refresh (aal1-Glitch).
            const aalOk = sessionStorage.getItem('safenet_aal_ok') === session.user.id
            if (!isEinstellungen && !justLoggedIn && !aalOk) {
                try {
                    const [{ data: aal }, { data: factors }] = await Promise.all([
                        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
                        supabase.auth.mfa.listFactors()
                    ])
                    const hasVerifiedTotp = factors?.totp?.some(f => f.status === 'verified')
                    if (hasVerifiedTotp && aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
                        await supabase.auth.signOut()
                        sessionStorage.removeItem('safenet_aal_ok')
                        const isLoginPage = window.location.pathname.includes('login.html')
                        if (!isLoginPage) {
                            window.location.href = isEnglish ? '/en/pages/login.html' : '/de/pages/login.html'
                        }
                        return
                    }
                } catch (_) {
                    // Netzwerkfehler → Session beibehalten
                }
            }
            // AAL-Check bestanden oder übersprungen → für restliche Tab-Session merken
            if (!aalOk) sessionStorage.setItem('safenet_aal_ok', session.user.id)

            const email       = session.user.email
            const displayName = session.user.user_metadata?.display_name
            const initial     = (displayName || email).charAt(0).toUpperCase()
            const shownName   = displayName || email

            const settingsUrl   = isEnglish ? '/en/pages/einstellungen.html' : '/de/pages/einstellungen.html'
            const settingsLabel = isEnglish ? 'Settings' : 'Einstellungen'
            const signOutLabel  = isEnglish ? 'Sign out' : 'Abmelden'
            const statsUrl      = isEnglish ? '/en/pages/meine-stats.html'    : '/de/pages/meine-stats.html'
            const statsLabel    = isEnglish ? 'My Statistics'                  : 'Meine Statistiken'
            const tutorialsUrl  = isEnglish ? '/en/pages/tutorials.html'       : '/de/pages/tutorials.html'
            const tutorialsLabel = isEnglish ? 'Tutorials'                     : 'Tutorials'
            const newsUrl       = isEnglish ? '/en/pages/news.html'            : '/de/pages/news.html'
            const newsLabel     = isEnglish ? 'Security News'                  : 'Security-News'

            // Dropdown: Anzeigename oder E-Mail + Einstellungen-Link (sprachabhängig)
            dropdown.innerHTML = `
                <li class="user-dropdown-name">${shownName}</li>
                <li><a href="${settingsUrl}">${settingsLabel}</a></li>
                <li><a href="${statsUrl}">${statsLabel}</a></li>
                <li class="user-dropdown-divider"></li>
                <li><a href="${tutorialsUrl}">${tutorialsLabel}</a></li>
                <li><a href="${newsUrl}">${newsLabel}</a></li>
                <li class="user-dropdown-divider"></li>
                <li><a href="#" id="logoutBtn">${signOutLabel}</a></li>
            `
            dropdown.querySelector('#logoutBtn').addEventListener('click', async (e) => {
                e.preventDefault()
                // Lokale Session sofort löschen (funktioniert auch ohne Netzwerk)
                try {
                    localStorage.removeItem('sb-dygrabyaiyessqmjdprc-auth-token')
                    sessionStorage.clear()
                } catch {}
                // Supabase signOut mit 5s Timeout – wartet nicht ewig auf Mobile
                try {
                    await Promise.race([
                        supabase.auth.signOut(),
                        new Promise(resolve => setTimeout(resolve, 5000))
                    ])
                } catch {}
                const isEnglish = /^\/en(\/|$)/.test(window.location.pathname)
                window.location.href = isEnglish ? '/en/pages/login.html' : '/de/pages/login.html'
            })

            // Button: Initialbuchstabe oder gespeichertes Profilbild
            if (userBtn) {
                const avatarB64 = session.user.user_metadata?.avatar_b64
                if (avatarB64) {
                    userBtn.innerHTML = `<img class="user-avatar-img" src="${avatarB64}" alt="${initial}">`
                } else {
                    userBtn.innerHTML = `<span class="user-initials">${initial}</span>`
                }
            }
        }
        // Wenn nicht eingeloggt: Standard-HTML aus navbar.html bleibt
    } catch (e) {
        // Supabase-Fehler ignorieren, Standard-HTML bleibt sichtbar
    }
}

function setActiveNavLink() {
    const path = window.location.pathname
    const links = document.querySelectorAll('.nav-links a')
    links.forEach(a => a.classList.remove('active'))

    // Exakter Match oder Präfix-Match für Unterseiten
    let best = null
    let bestLen = 0
    links.forEach(a => {
        const href = new URL(a.href).pathname
        if (path === href || (href !== '/' && path.startsWith(href))) {
            if (href.length > bestLen) {
                best = a
                bestLen = href.length
            }
        }
    })
    // Fallback: Startseite aktiv wenn kein Match
    if (!best && path === '/') {
        best = document.querySelector('.nav-links a[href="/"]')
    }
    if (best) best.classList.add('active')
}


// Dropdown-Handling für alle .dropdown-link (Mobile)
function setupMobileNavbarEvents() {
    const toggles = document.querySelectorAll('.dropdown-link');
    toggles.forEach((toggle) => {
        toggle.removeEventListener('click', toggle._dropdownHandler || (() => {}));
        const handler = function (e) {
            if (window.innerWidth <= 1600) {
                const parent = toggle.closest('.dropdown');
                if (!parent) return;
                const isOpen = parent.classList.contains('open');
                // Nur andere Dropdowns schließen
                document.querySelectorAll('.dropdown.open').forEach(d => {
                    if (d !== parent) d.classList.remove('open');
                });
                if (!isOpen) {
                    e.preventDefault();
                    parent.classList.add('open');
                } // else: einfach schließen durch oben
            }
        };
        toggle.addEventListener('click', handler);
        toggle._dropdownHandler = handler;
    });
    // Schließe Dropdowns beim Klick außerhalb
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        }
    });
}


// Automatisch ausführen sobald die Navbar in den DOM injiziert wird
const observer = new MutationObserver(() => {
    if (document.querySelector('.user-menu')) {
        observer.disconnect();
        applyNavbarUser();
        setActiveNavLink();
        setupMobileNavbarEvents();
    }
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// Auch direkt versuchen falls Navbar schon da ist
applyNavbarUser();
setActiveNavLink();
setupMobileNavbarEvents();

// Für rückwärts-kompatibilität (alte Seiten die updateNavbarUser() aufrufen)
window.updateNavbarUser = applyNavbarUser;


function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark'
    document.documentElement.setAttribute('data-theme', saved)

    function updateBtns() {
        const darkBtn  = document.getElementById('themeDarkBtn')
        const lightBtn = document.getElementById('themeLightBtn')
        if (!darkBtn || !lightBtn) return
        const current = document.documentElement.getAttribute('data-theme')
        darkBtn.style.background  = current === 'dark'  ? 'linear-gradient(135deg,#3399ff,#66d9ff)' : ''
        darkBtn.style.color       = current === 'dark'  ? '#0f172a' : ''
        darkBtn.style.borderColor = current === 'dark'  ? 'transparent' : ''
        lightBtn.style.background = current === 'light' ? 'linear-gradient(135deg,#3399ff,#66d9ff)' : ''
        lightBtn.style.color      = current === 'light' ? '#0f172a' : ''
        lightBtn.style.borderColor= current === 'light' ? 'transparent' : ''
    }

    function setTheme(next) {
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('theme', next)
        updateBtns()
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateBtns()
        document.getElementById('themeDarkBtn') ?.addEventListener('click', () => setTheme('dark'))
        document.getElementById('themeLightBtn')?.addEventListener('click', () => setTheme('light'))
    })
}

initTheme()

function initCookieBanner() {
    if (localStorage.getItem('cookieConsent') || sessionStorage.getItem('cookieBannerClosed')) return

    const isDE = !/^\/en(\/|$)/.test(window.location.pathname)
    const datenschutzUrl = isDE
        ? '/de/pages/datenschutzerklärung.html'
        : '/en/pages/datenschutzerklärung.html'

    const banner = document.createElement('div')
    banner.id = 'cookie-banner'

    const p = document.createElement('p')
    const textNode = document.createTextNode(
        isDE
            ? 'Diese Website verwendet lokalen Browserspeicher, um dein Farbschema und deine Einstellungen zu speichern. Es werden keine Tracking- oder Werbe-Cookies eingesetzt. '
            : 'This website uses local browser storage to save your colour scheme and settings. No tracking or advertising cookies are used. '
    )
    const link = document.createElement('a')
    link.href = datenschutzUrl
    link.textContent = isDE ? 'Datenschutzerklärung' : 'Privacy Policy'
    p.appendChild(textNode)
    p.appendChild(link)

    const btns = document.createElement('div')
    btns.className = 'cookie-btns'

    const declineBtn = document.createElement('button')
    declineBtn.id = 'cookie-decline'
    declineBtn.textContent = isDE ? 'Schließen' : 'Close'

    const acceptBtn = document.createElement('button')
    acceptBtn.id = 'cookie-accept'
    acceptBtn.textContent = isDE ? 'Verstanden' : 'Got it'

    btns.appendChild(declineBtn)
    btns.appendChild(acceptBtn)
    banner.appendChild(p)
    banner.appendChild(btns)

    function hideBanner() {
        banner.classList.add('cookie-hide')
        banner.addEventListener('animationend', () => banner.remove(), { once: true })
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted')
        hideBanner()
    })
    declineBtn.addEventListener('click', () => {
        sessionStorage.setItem('cookieBannerClosed', '1')
        hideBanner()
    })

    if (document.body) {
        document.body.appendChild(banner)
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(banner))
    }
}

initCookieBanner()

function initScrollToTop() {
    const btn = document.createElement('button')
    btn.id = 'scrollTopBtn'
    btn.title = /^\/en(\/|$)/.test(window.location.pathname) ? 'Back to top' : 'Nach oben'
    btn.setAttribute('aria-label', btn.title)
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'

    if (document.body) {
        document.body.appendChild(btn)
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(btn))
    }

    window.addEventListener('scroll', () => {
        btn.classList.toggle('scroll-top-visible', window.scrollY > 300)
    }, { passive: true })

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    })
}

initScrollToTop()

// ─── PWA ─────────────────────────────────────────────────
function initPWA() {
    if (!document.querySelector('link[rel="manifest"]')) {
        const link = document.createElement('link')
        link.rel = 'manifest'
        link.href = '/manifest.json'
        document.head.appendChild(link)
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
}
initPWA()

// ─── Suche ───────────────────────────────────────────────
const isEN = /^\/en(\/|$)/.test(window.location.pathname)

const SUCHINDEX = isEN ? [
    { titel: 'Home',               pfad: '/en/index.html',                      desc: 'SafeNet Security – Password security and cyber protection.' },
    { titel: 'Password Generator', pfad: '/en/pages/generator.html',            desc: 'Generate secure random passwords.' },
    { titel: 'Password Analysis',  pfad: '/en/pages/analysator.html',           desc: 'Analyse the strength of your password.' },
    { titel: 'Vault',              pfad: '/en/pages/tresor.html',               desc: 'Encrypted password vault.' },
    { titel: 'Notes',              pfad: '/en/pages/notizen.html',              desc: 'Encrypted secure notes.' },
    { titel: 'Attack Methods',     pfad: '/en/pages/angriff.html',              desc: 'Overview of common cyber attack methods.' },
    { titel: 'Phishing',           pfad: '/en/pages/phishing.html',             desc: 'How phishing attacks work and how to protect yourself.' },
    { titel: 'Brute Force',        pfad: '/en/pages/bruteforce.html',           desc: 'Automated password guessing attacks.' },
    { titel: 'Social Engineering', pfad: '/en/pages/socialengineering.html',    desc: 'Psychological manipulation in cyber attacks.' },
    { titel: 'Keylogger',          pfad: '/en/pages/keylogger.html',            desc: 'Software that secretly records keystrokes.' },
    { titel: 'Dictionary Attack',  pfad: '/en/pages/wörterbuchangriff.html',    desc: 'Attacks using lists of common passwords.' },
    { titel: 'Ransomware',         pfad: '/en/pages/ransomware.html',           desc: 'Malware that encrypts your files for ransom.' },
    { titel: 'MFA Bypass',         pfad: '/en/pages/mfa-bypass.html',           desc: 'How attackers bypass multi-factor authentication.' },
    { titel: 'Man-in-the-Middle',  pfad: '/en/pages/mitm.html',                desc: 'Intercepting communication between two parties.' },
    { titel: 'Quishing',           pfad: '/en/pages/quishing.html',             desc: 'QR code phishing attacks.' },
    { titel: 'About SafeNet',      pfad: '/en/pages/übersns.html',              desc: 'About the SafeNet Security platform.' },
    { titel: 'Security News',      pfad: '/en/pages/news.html',                 desc: 'Current cybersecurity news.' },
    { titel: 'Tutorials',          pfad: '/en/pages/tutorials.html',            desc: 'Step-by-step security tutorials.' },
    { titel: 'My Statistics',      pfad: '/en/pages/meine-stats.html',          desc: 'Your personal security statistics.' },
    { titel: 'Settings',           pfad: '/en/pages/einstellungen.html',        desc: 'Account and appearance settings.' },
    { titel: 'Contact',            pfad: '/en/pages/kontakt.html',              desc: 'Contact the SafeNet Security team.' },
    { titel: 'Feedback',           pfad: '/en/pages/feedback.html',             desc: 'Send us your feedback.' },
    { titel: '2FA Guide',          pfad: '/en/pages/2fa.html',                  desc: 'Two-factor authentication explained.' },
] : [
    { titel: 'Startseite',         pfad: '/de/index.html',                      desc: 'SafeNet Security – Passwortsicherheit und Cyberschutz.' },
    { titel: 'Passwort-Generator', pfad: '/de/pages/generator.html',            desc: 'Sichere zufällige Passwörter generieren.' },
    { titel: 'Passwort-Analyse',   pfad: '/de/pages/analysator.html',           desc: 'Stärke deines Passworts analysieren.' },
    { titel: 'Tresor',             pfad: '/de/pages/tresor.html',               desc: 'Verschlüsselter Passwort-Tresor.' },
    { titel: 'Notizen',            pfad: '/de/pages/notizen.html',              desc: 'Verschlüsselte sichere Notizen.' },
    { titel: 'Angriffsmethoden',   pfad: '/de/pages/angriff.html',              desc: 'Übersicht gängiger Cyberangriffsmethoden.' },
    { titel: 'Phishing',           pfad: '/de/pages/phishing.html',             desc: 'Wie Phishing-Angriffe funktionieren.' },
    { titel: 'Bruteforce',         pfad: '/de/pages/bruteforce.html',           desc: 'Automatisiertes Erraten von Passwörtern.' },
    { titel: 'Social Engineering', pfad: '/de/pages/socialengineering.html',    desc: 'Psychologische Manipulation bei Cyberangriffen.' },
    { titel: 'Keylogger',          pfad: '/de/pages/keylogger.html',            desc: 'Software, die Tastatureingaben heimlich aufzeichnet.' },
    { titel: 'Wörterbuchangriff',  pfad: '/de/pages/wörterbuchangriff.html',    desc: 'Angriffe mit Listen häufiger Passwörter.' },
    { titel: 'Ransomware',         pfad: '/de/pages/ransomware.html',           desc: 'Schadsoftware, die Dateien für Lösegeld verschlüsselt.' },
    { titel: 'MFA-Bypass',         pfad: '/de/pages/mfa-bypass.html',           desc: 'Wie Angreifer die Zwei-Faktor-Auth umgehen.' },
    { titel: 'Man-in-the-Middle',  pfad: '/de/pages/mitm.html',                desc: 'Kommunikation zwischen zwei Parteien abfangen.' },
    { titel: 'Quishing',           pfad: '/de/pages/quishing.html',             desc: 'QR-Code-Phishing-Angriffe.' },
    { titel: 'Über SafeNet',       pfad: '/de/pages/übersns.html',              desc: 'Über die SafeNet Security Plattform.' },
    { titel: 'Security-News',      pfad: '/de/pages/news.html',                 desc: 'Aktuelle Cybersicherheits-News.' },
    { titel: 'Tutorials',          pfad: '/de/pages/tutorials.html',            desc: 'Schritt-für-Schritt Sicherheits-Tutorials.' },
    { titel: 'Meine Statistiken',  pfad: '/de/pages/meine-stats.html',          desc: 'Deine persönlichen Sicherheitsstatistiken.' },
    { titel: 'Einstellungen',      pfad: '/de/pages/einstellungen.html',        desc: 'Konto- und Darstellungseinstellungen.' },
    { titel: 'Kontakt',            pfad: '/de/pages/kontakt.html',              desc: 'Das SafeNet Security Team kontaktieren.' },
    { titel: 'Feedback',           pfad: '/de/pages/feedback.html',             desc: 'Feedback senden.' },
    { titel: '2FA-Guide',          pfad: '/de/pages/2fa.html',                  desc: 'Zwei-Faktor-Authentifizierung erklärt.' },
]

function initSearch() {
    const placeholder = isEN ? 'Search pages…' : 'Seiten durchsuchen…'
    const noResult    = isEN ? 'No results found.' : 'Keine Ergebnisse gefunden.'

    const overlay = document.createElement('div')
    overlay.id = 'search-overlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.innerHTML = `
      <div class="search-box">
        <div class="search-input-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="search-input" type="search" placeholder="${placeholder}" autocomplete="off">
          <button id="search-close" aria-label="Schließen">✕</button>
        </div>
        <ul id="search-results" role="listbox"></ul>
      </div>`
    document.body.appendChild(overlay)

    const input    = overlay.querySelector('#search-input')
    const closeBtn = overlay.querySelector('#search-close')
    const results  = overlay.querySelector('#search-results')

    function suche(q) {
        results.innerHTML = ''
        if (!q.trim()) return
        const hits = SUCHINDEX.filter(p =>
            p.titel.toLowerCase().includes(q.toLowerCase()) ||
            p.desc.toLowerCase().includes(q.toLowerCase())
        )
        if (!hits.length) {
            results.innerHTML = `<li class="search-no-results">${noResult}</li>`
            return
        }
        hits.forEach(p => {
            const li = document.createElement('li')
            li.setAttribute('role', 'option')
            li.innerHTML = `<a href="${p.pfad}"><span class="search-result-title">${p.titel}</span><span class="search-result-desc">${p.desc}</span></a>`
            results.appendChild(li)
        })
    }

    function oeffnen() {
        overlay.classList.add('open')
        input.value = ''
        results.innerHTML = ''
        requestAnimationFrame(() => input.focus())
    }
    function schliessen() { overlay.classList.remove('open') }

    input.addEventListener('input', () => suche(input.value))
    input.addEventListener('keydown', ev => {
        if (ev.key === 'Escape') schliessen()
        if (ev.key === 'ArrowDown') results.children[0]?.querySelector('a')?.focus()
    })
    closeBtn.addEventListener('click', schliessen)
    overlay.addEventListener('click', e => { if (e.target === overlay) schliessen() })
    document.addEventListener('keydown', e => { if (e.key === 'Escape') schliessen() })

    // Button binden – Navbar wird per fetch injiziert
    function bindBtn() {
        const btn = document.getElementById('searchBtn')
        if (btn && !btn._searchBound) {
            btn.addEventListener('click', oeffnen)
            btn._searchBound = true
        }
    }
    bindBtn()
    const obs = new MutationObserver(bindBtn)
    obs.observe(document.body, { childList: true, subtree: true })
}
initSearch()
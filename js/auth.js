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
            const isEnglish = window.location.pathname.startsWith('/en/')
            const isEinstellungen = window.location.pathname.includes('/de/pages/einstellungen.html') || window.location.pathname.includes('/en/pages/einstellungen.html')
            const justLoggedIn = sessionStorage.getItem('loginSuccess') === '1'
            if (justLoggedIn) sessionStorage.removeItem('loginSuccess')
            if (!isEinstellungen && !justLoggedIn) {
                const [{ data: aal }, { data: factors }] = await Promise.all([
                    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
                    supabase.auth.mfa.listFactors()
                ])
                const hasVerifiedTotp = factors?.totp?.some(f => f.status === 'verified')
                if (hasVerifiedTotp && aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
                    await supabase.auth.signOut()
                    const isLoginPage = window.location.pathname.includes('login.html')
                    if (!isLoginPage) {
                        window.location.href = isEnglish ? '/en/pages/login.html' : '/de/pages/login.html'
                    }
                    return
                }
            }

            const email       = session.user.email
            const displayName = session.user.user_metadata?.display_name
            const initial     = (displayName || email).charAt(0).toUpperCase()
            const shownName   = displayName || email

            const settingsUrl   = isEnglish ? '/en/pages/einstellungen.html' : '/de/pages/einstellungen.html'
            const settingsLabel = isEnglish ? 'Settings' : 'Einstellungen'
            const signOutLabel  = isEnglish ? 'Sign out' : 'Abmelden'

            // Dropdown: Anzeigename oder E-Mail + Einstellungen-Link (sprachabhängig)
            dropdown.innerHTML = `
                <li class="user-dropdown-name">${shownName}</li>
                <li><a href="${settingsUrl}">${settingsLabel}</a></li>
                <li><a href="#" id="logoutBtn">${signOutLabel}</a></li>
            `
            dropdown.querySelector('#logoutBtn').addEventListener('click', async (e) => {
                e.preventDefault()
                await supabase.auth.signOut()
                window.location.reload()
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
            if (window.innerWidth <= 768) {
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

    const isDE = !window.location.pathname.startsWith('/en/')
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
    btn.title = window.location.pathname.startsWith('/en/') ? 'Back to top' : 'Nach oben'
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
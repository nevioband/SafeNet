// --- Mobile Navbar Dropdown- und Menü-Handling ---
document.addEventListener('DOMContentLoaded', () => {
    // Menü-Icon für mobile Ansicht
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Dropdown-Menü für mobile Ansicht
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(drop => {
        const link = drop.querySelector('.dropdown-link');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    drop.classList.toggle('open');
                }
            });
        }
    });
});
import { supabase } from './supabase.js?v=3'

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
            const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
            if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
                await supabase.auth.signOut()
                const isLoginPage = window.location.pathname.includes('login.html')
                if (!isLoginPage) {
                    window.location.href = '/pages/login.html'
                }
                return
            }

            const email       = session.user.email
            const displayName = session.user.user_metadata?.display_name
            const initial     = (displayName || email).charAt(0).toUpperCase()
            const shownName   = displayName || email

            // Dropdown: Anzeigename oder E-Mail + Einstellungen-Link
            dropdown.innerHTML = `
                <li class="user-dropdown-name">${shownName}</li>
                <li><a href="/pages/einstellungen.html">Einstellungen</a></li>
                <li><a href="#" id="logoutBtn">Abmelden</a></li>
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

// Automatisch ausführen sobald die Navbar in den DOM injiziert wird
const observer = new MutationObserver(() => {
    if (document.querySelector('.user-menu')) {
        observer.disconnect()
        applyNavbarUser()
        setActiveNavLink()
    }
})
observer.observe(document.documentElement, { childList: true, subtree: true })

// Auch direkt versuchen falls Navbar schon da ist
applyNavbarUser()
setActiveNavLink()

// Für rückwärts-kompatibilität (alte Seiten die updateNavbarUser() aufrufen)
window.updateNavbarUser = applyNavbarUser

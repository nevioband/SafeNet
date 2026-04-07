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

// Automatisch ausführen sobald die Navbar in den DOM injiziert wird
const observer = new MutationObserver(() => {
    if (document.querySelector('.user-menu')) {
        observer.disconnect()
        applyNavbarUser()
    }
})
observer.observe(document.documentElement, { childList: true, subtree: true })

// Auch direkt versuchen falls Navbar schon da ist
applyNavbarUser()

// Für rückwärts-kompatibilität (alte Seiten die updateNavbarUser() aufrufen)
window.updateNavbarUser = applyNavbarUser

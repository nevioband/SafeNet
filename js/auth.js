import { supabase } from './supabase.js?v=3'

async function applyNavbarUser() {
    const userMenu = document.querySelector('.user-menu')
    if (!userMenu) return

    try {
        const { data: { session } } = await supabase.auth.getSession()
        const dropdown = userMenu.querySelector('.user-dropdown')
        if (!dropdown) return

        if (session && session.user) {
            const email = session.user.email
            dropdown.innerHTML = `
                <li class="user-dropdown-name">${email}</li>
                <li><a href="/pages/2fa.html">Zwei-Faktor-Auth</a></li>
                <li><a href="#" id="logoutBtn">Abmelden</a></li>
            `
            dropdown.querySelector('#logoutBtn').addEventListener('click', async (e) => {
                e.preventDefault()
                await supabase.auth.signOut()
                window.location.reload()
            })
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

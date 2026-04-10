// Kontaktformular-Handling für SafeNet Security
// Validierung und Speicherung in Supabase (Tabelle: kontaktanfragen)
import { supabase } from './supabase.js';


const formular = document.getElementById('kontakt-form');
const feedback = document.getElementById('kontakt-feedback');



if (formular) {
  formular.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.textContent = '';
    feedback.style.color = '#fff';

    // Felder auslesen
    const name = formular.name.value.trim();
    const email = formular.email.value.trim();
    const nachricht = formular.nachricht.value.trim();

    // Validierung
    if (!email || !nachricht) {
      feedback.textContent = 'Bitte fülle alle Pflichtfelder aus.';
      feedback.style.color = '#ffb300';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      feedback.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.';
      feedback.style.color = '#ffb300';
      return;
    }
    if (nachricht.length < 10) {
      feedback.textContent = 'Die Nachricht ist zu kurz.';
      feedback.style.color = '#ffb300';
      return;
    }

    // Anfrage an Supabase senden
    try {
      const { error } = await supabase.from('kontaktanfragen').insert({
        name: name || null,
        email,
        nachricht,
        erstellt_am: new Date().toISOString(),
      });
      if (error) throw error;
      feedback.textContent = 'Vielen Dank! Deine Nachricht wurde übermittelt.';
      feedback.style.color = '#4ade80';
      formular.reset();
    } catch (err) {
        feedback.textContent = 'Fehler beim Senden: ' + (err.message || err);
      feedback.style.color = '#ef4444';
    }
  });
}

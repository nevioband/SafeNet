// Feedback-Formular – SafeNet Security (Deutsch)
// Tabelle: feedback  →  CREATE TABLE feedback (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, bewertung smallint NOT NULL CHECK (bewertung BETWEEN 1 AND 5), kategorie text NOT NULL, nachricht text, erstellt_am timestamptz DEFAULT now());
import { supabase } from './supabase.js';

const form     = document.getElementById('feedback-form');
const statusEl = document.getElementById('feedback-status');
const sternText = document.getElementById('stern-text');
const sternLabels = ['', 'Schlecht', 'Ausbaufähig', 'In Ordnung', 'Gut', 'Ausgezeichnet'];

document.querySelectorAll('.star-group input[type="radio"]').forEach(input => {
  input.addEventListener('change', () => {
    if (sternText) sternText.textContent = sternLabels[parseInt(input.value)] ?? '';
  });
});

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';

    const bewertungEl = form.querySelector('.star-group input[type="radio"]:checked');
    const kategorieEl = form.querySelector('.kategorie-group input[type="radio"]:checked');
    const nachricht   = form.nachricht.value.trim();

    if (!bewertungEl) {
      statusEl.textContent = 'Bitte wähle eine Bewertung (1–5 Sterne).';
      statusEl.style.color = '#ffb300';
      return;
    }
    if (!kategorieEl) {
      statusEl.textContent = 'Bitte wähle eine Kategorie.';
      statusEl.style.color = '#ffb300';
      return;
    }

    try {
      const { error } = await supabase.from('feedback').insert({
        bewertung:   parseInt(bewertungEl.value),
        kategorie:   kategorieEl.value,
        nachricht:   nachricht || null,
        erstellt_am: new Date().toISOString(),
      });
      if (error) throw error;
      statusEl.textContent = 'Vielen Dank für dein Feedback! 🎉';
      statusEl.style.color = '#4ade80';
      form.reset();
      if (sternText) sternText.textContent = '';
    } catch (err) {
      statusEl.textContent = 'Fehler beim Senden: ' + (err.message || err);
      statusEl.style.color = '#ef4444';
    }
  });
}

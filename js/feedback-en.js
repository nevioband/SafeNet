// Feedback form – SafeNet Security (English)
// Table: feedback  →  CREATE TABLE feedback (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, bewertung smallint NOT NULL CHECK (bewertung BETWEEN 1 AND 5), kategorie text NOT NULL, nachricht text, erstellt_am timestamptz DEFAULT now());
import { supabase } from './supabase.js';

const form     = document.getElementById('feedback-form');
const statusEl = document.getElementById('feedback-status');
const starText = document.getElementById('stern-text');
const starLabels = ['', 'Poor', 'Needs improvement', 'Okay', 'Good', 'Excellent'];

document.querySelectorAll('.star-group input[type="radio"]').forEach(input => {
  input.addEventListener('change', () => {
    if (starText) starText.textContent = starLabels[parseInt(input.value)] ?? '';
  });
});

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';

    const ratingEl   = form.querySelector('.star-group input[type="radio"]:checked');
    const categoryEl = form.querySelector('.kategorie-group input[type="radio"]:checked');
    const message    = form.nachricht.value.trim();

    if (!ratingEl) {
      statusEl.textContent = 'Please select a rating (1–5 stars).';
      statusEl.style.color = '#ffb300';
      return;
    }
    if (!categoryEl) {
      statusEl.textContent = 'Please select a category.';
      statusEl.style.color = '#ffb300';
      return;
    }

    try {
      const { error } = await supabase.from('feedback').insert({
        bewertung:   parseInt(ratingEl.value),
        kategorie:   categoryEl.value,
        nachricht:   message || null,
        erstellt_am: new Date().toISOString(),
      });
      if (error) throw error;
      statusEl.textContent = 'Thank you for your feedback! 🎉';
      statusEl.style.color = '#4ade80';
      form.reset();
      if (starText) starText.textContent = '';
    } catch (err) {
      statusEl.textContent = 'Error sending: ' + (err.message || err);
      statusEl.style.color = '#ef4444';
    }
  });
}

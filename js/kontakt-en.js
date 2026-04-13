// Contact form handler for SafeNet Security (English)
// Validation and storage in Supabase (table: kontaktanfragen)
import { supabase } from './supabase.js';

const form = document.getElementById('kontakt-form');
const feedback = document.getElementById('kontakt-feedback');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.textContent = '';
    feedback.style.color = '#fff';

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.nachricht.value.trim();

    if (!email || !message) {
      feedback.textContent = 'Please fill in all required fields.';
      feedback.style.color = '#ffb300';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      feedback.textContent = 'Please enter a valid email address.';
      feedback.style.color = '#ffb300';
      return;
    }
    if (message.length < 10) {
      feedback.textContent = 'Your message is too short.';
      feedback.style.color = '#ffb300';
      return;
    }

    try {
      const { error } = await supabase.from('kontaktanfragen').insert({
        name: name || null,
        email,
        nachricht: message,
        erstellt_am: new Date().toISOString(),
      });
      if (error) throw error;
      feedback.textContent = 'Thank you! Your message has been sent.';
      feedback.style.color = '#4ade80';
      form.reset();
    } catch (err) {
      feedback.textContent = 'Error sending message: ' + (err.message || err);
      feedback.style.color = '#ef4444';
    }
  });
}

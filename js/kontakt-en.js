import { supabase as e } from "./supabase.js";
const t = document.getElementById("kontakt-form"),
  n = document.getElementById("kontakt-feedback");
t &&
  t.addEventListener("submit", async (o) => {
    (o.preventDefault(), (n.textContent = ""), (n.style.color = "#fff"));
    const r = t.name.value.trim(),
      a = t.email.value.trim(),
      s = t.nachricht.value.trim();
    if (!a || !s)
      return (
        (n.textContent = "Please fill in all required fields."),
        void (n.style.color = "#ffb300")
      );
    if (!/^\S+@\S+\.\S+$/.test(a))
      return (
        (n.textContent = "Please enter a valid email address."),
        void (n.style.color = "#ffb300")
      );
    if (s.length < 10)
      return (
        (n.textContent = "Your message is too short."),
        void (n.style.color = "#ffb300")
      );
    try {
      const { error: o } = await e
        .from("kontaktanfragen")
        .insert({
          name: r || null,
          email: a,
          nachricht: s,
          erstellt_am: new Date().toISOString(),
        });
      if (o) throw o;
      ((n.textContent = "Thank you! Your message has been sent."),
        (n.style.color = "#4ade80"),
        t.reset());
    } catch (e) {
      ((n.textContent = "Error sending message: " + (e.message || e)),
        (n.style.color = "#ef4444"));
    }
  });

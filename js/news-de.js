function formatDate(e) {
  if (!e) return "";
  const r = new Date(e);
  return isNaN(r)
    ? e
    : r.toLocaleDateString("de-CH", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
}
function escHtml(e) {
  return String(e ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function safeUrl(e) {
  return /^https?:\/\//.test(e ?? "") ? e : "#";
}
const SRC_CLASS = {
  "The Hacker News": "src-thn",
  "Bleeping Computer": "src-bc",
  "Krebs on Security": "src-krebs",
  "Ars Technica": "src-ars",
  SecurityWeek: "src-sw",
};
function badge(e) {
  return `<span class="np-source ${SRC_CLASS[e] || "src-other"}">${escHtml(e)}</span>`;
}
function metaRow(e) {
  return `<div class="np-meta">\n    <time class="np-date">${escHtml(formatDate(e.date))}</time>\n    <a href="${safeUrl(e.link)}" class="np-readmore" target="_blank" rel="noopener noreferrer">Weiterlesen →</a>\n  </div>`;
}
function renderFeatured(e) {
  const r = e.description || "";
  return `<article class="np-featured">\n    ${badge(e.source)}\n    <h2 class="np-featured-title">${escHtml(e.title)}</h2>\n    ${r ? `<p class="np-featured-desc">${escHtml(r)}${r.length >= 260 ? "…" : ""}</p>` : ""}\n    ${metaRow(e)}\n  </article>`;
}
function renderArticle(e) {
  const r = e.description || "",
    n = r.slice(0, 200);
  return `<article class="np-article">\n    ${badge(e.source)}\n    <h3 class="np-title">${escHtml(e.title)}</h3>\n    ${n ? `<p class="np-desc">${escHtml(n)}${r.length > 200 ? "…" : ""}</p>` : ""}\n    ${metaRow(e)}\n  </article>`;
}
function renderCard(e) {
  const r = e.description || "",
    n = r.slice(0, 130);
  return `<article class="np-card">\n    ${badge(e.source)}\n    <h3 class="np-title">${escHtml(e.title)}</h3>\n    ${n ? `<p class="np-desc">${escHtml(n)}${r.length > 130 ? "…" : ""}</p>` : ""}\n    ${metaRow(e)}\n  </article>`;
}
async function loadNews() {
  const e = document.getElementById("news-root");
  try {
    const r = await fetch("/api/news");
    if (!r.ok) throw new Error(`Server-Fehler ${r.status}`);
    const n = await r.json();
    if (n.error) throw new Error(n.error);
    const t = n.items ?? [];
    if (!t.length) throw new Error("Keine Nachrichten erhalten");
    const [s, ...c] = t,
      a = c.slice(0, 2),
      l = c.slice(2);
    let i = renderFeatured(s);
    (a.length &&
      ((i += '<hr class="np-rule-thin" />'),
      (i += `<div class="np-secondary">${a.map(renderArticle).join("")}</div>`)),
      l.length &&
        ((i += '<hr class="np-rule-thin" />'),
        (i += `<div class="np-grid">${l.map(renderCard).join("")}</div>`)),
      (e.innerHTML = i));
  } catch (r) {
    e.innerHTML = `<p class="np-error">Fehler beim Laden der News: ${escHtml(r.message)}</p>`;
  }
}
loadNews();

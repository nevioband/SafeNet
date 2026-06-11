(document.querySelectorAll(".custom-select-wrapper").forEach((e) => {
  const t = e.querySelector(".custom-select-btn"),
    c = e.querySelector(".custom-select-list"),
    s = e.querySelector('input[type="hidden"]'),
    o = e.querySelector(".cs-text");
  (t.addEventListener("click", (t) => {
    (t.stopPropagation(),
      document.querySelectorAll(".custom-select-wrapper.open").forEach((t) => {
        t !== e && t.classList.remove("open");
      }),
      e.classList.toggle("open"));
  }),
    c.querySelectorAll("li").forEach((t) => {
      t.addEventListener("click", () => {
        ((s.value = t.dataset.value),
          (o.textContent = t.textContent),
          c
            .querySelectorAll("li")
            .forEach((e) => e.classList.remove("cs-active")),
          t.classList.add("cs-active"),
          e.classList.remove("open"));
        const l = document.getElementById(s.id + "-custom");
        l &&
          ((l.style.display =
            "sonstiges" === t.dataset.value ? "block" : "none"),
          "sonstiges" === t.dataset.value && l.focus());
      });
    }));
}),
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".custom-select-wrapper.open")
      .forEach((e) => e.classList.remove("open"));
  }));

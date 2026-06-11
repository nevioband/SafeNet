import "/js/tresor.js?v=9";
const e = document.getElementById("password-output"),
  t = document.getElementById("length-slider"),
  n = document.getElementById("length-val"),
  d = document.getElementById("include-lowercase"),
  c = document.getElementById("include-uppercase"),
  l = document.getElementById("include-numbers"),
  o = document.getElementById("include-symbols"),
  u = document.getElementById("generate-btn");
t.addEventListener("input", () => {
  n.innerText = t.value;
});
const a = "abcdefghijklmnopqrstuvwxyz",
  r = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  s = "0123456789",
  i = "!@#$%^&*()_+~`|}{[]:;?><,./-=",
  m = [d, c, l, o];
function g(e) {
  const t = new Uint32Array(1);
  return (window.crypto.getRandomValues(t), e[t[0] % e.length]);
}
(m.forEach((e) => {
  e.addEventListener("change", () => {
    0 === m.filter((e) => e.checked).length &&
      ((e.checked = !0), alert("At least one option must be active!"));
  });
}),
  u.addEventListener("click", function () {
    const n = parseInt(t.value);
    let u = "",
      m = [];
    (d.checked && ((u += a), m.push(g(a))),
      c.checked && ((u += r), m.push(g(r))),
      l.checked && ((u += s), m.push(g(s))),
      o.checked && ((u += i), m.push(g(i))));
    const h = n - m.length;
    for (let e = 0; e < h; e++) m.push(g(u));
    for (let e = m.length - 1; e > 0; e--) {
      const t = window.crypto.getRandomValues(new Uint32Array(1))[0] % (e + 1);
      [m[e], m[t]] = [m[t], m[e]];
    }
    e.value = m.join("");
  }),
  document.getElementById("copy-btn").addEventListener("click", () => {
    e.value && (navigator.clipboard.writeText(e.value), alert("Copied!"));
  }),
  document.getElementById("vault-save-btn").addEventListener("click", () => {
    window.transferToVault && window.transferToVault();
  }));

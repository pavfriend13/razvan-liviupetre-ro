/* Răzvan-Liviu Petre: interacțiuni */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navigație ---------- */
  const nav = $("#nav");
  if (nav && !nav.classList.contains("nav--solid")) {
    const onScroll = () => nav.classList.toggle("is-solid", scrollY > 40);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  const toggle = $(".nav__toggle");
  const menu = $("#meniu");
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Închide meniul" : "Deschide meniul");
      menu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      if (open) $("a", menu)?.focus();
    };
    toggle.addEventListener("click", () => setOpen(menu.hidden));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- Apariție discretă la scroll ---------- */
  const reveal = $$("[data-reveal]");
  if (reveal.length && "IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Lightbox ---------- */
  const box = $(".lightbox");
  if (box && typeof box.showModal === "function") {
    const img = $("img", box);
    const cap = $("figcaption", box);
    let list = [];
    let idx = 0;
    let opener = null;
    const visible = () => $$(".ggrid__btn").filter((b) => !b.closest("li")?.hidden);
    const show = (i) => {
      idx = (i + list.length) % list.length;
      const b = list[idx];
      img.src = b.dataset.full;
      img.alt = b.dataset.alt || "";
      cap.textContent = b.dataset.alt || "";
      $$(".lightbox__nav", box).forEach((n) => (n.hidden = list.length < 2));
    };
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".ggrid__btn");
      if (!b) return;
      opener = b;
      list = visible();
      show(list.indexOf(b));
      box.showModal();
      $(".lightbox__close", box).focus();
    });
    $(".lightbox__close", box).addEventListener("click", () => box.close());
    $$(".lightbox__nav", box).forEach((n) => n.addEventListener("click", () => show(idx + Number(n.dataset.dir))));
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
    box.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
    box.addEventListener("close", () => opener?.focus());
  }

  /* ---------- Filtre (galerie) ---------- */
  const setPressed = (group, btn) => $$(".chip", group).forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));

  const gGroup = $('[data-filter-group="galerie"]');
  if (gGroup) {
    const items = $$("#galerie-grid > li");
    const status = $("#galerie-status");
    gGroup.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      setPressed(gGroup, btn);
      const f = btn.dataset.filter;
      let n = 0;
      items.forEach((li) => { const on = !f || li.dataset.categorie === f; li.hidden = !on; if (on) n++; });
      $("#galerie-gol").hidden = n > 0;
      status.textContent = `${n} ${n === 1 ? "fotografie afișată" : "fotografii afișate"}`;
    });
  }

  /* ---------- Articole: căutare + categorie ---------- */
  const aGroup = $('[data-filter-group="articole"]');
  if (aGroup) {
    const cards = $$("#articole-grid > .card");
    const input = $("#cauta");
    const status = $("#articole-status");
    const params = new URLSearchParams(location.search);
    let cat = params.get("categorie") || "";
    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const apply = () => {
      const q = norm(input.value.trim());
      let n = 0;
      cards.forEach((c) => {
        const on = (!cat || c.dataset.categorie === cat) && (!q || norm(c.dataset.text).includes(q));
        c.hidden = !on; if (on) n++;
      });
      const gol = $("#articole-gol");
      if (gol) gol.hidden = n > 0;
      status.textContent = (q || cat) ? `${n} ${n === 1 ? "articol găsit" : "articole găsite"}${cat ? ` în categoria „${cat}”` : ""}.` : "";
    };
    const btn = $$(".chip", aGroup).find((b) => b.dataset.filter === cat);
    if (btn) setPressed(aGroup, btn); else cat = "";
    aGroup.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      cat = b.dataset.filter;
      setPressed(aGroup, b);
      const u = new URL(location.href);
      cat ? u.searchParams.set("categorie", cat) : u.searchParams.delete("categorie");
      history.replaceState(null, "", u);
      apply();
    });
    let t;
    input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(apply, 150); });
    apply();
  }

  /* ---------- Evenimente: împarte viitoare / trecute după data de azi ---------- */
  const up = $('[data-ev-list="viitoare"]');
  const past = $('[data-ev-list="trecute"]');
  if (up && past) {
    const today = new Date().toISOString().slice(0, 10);
    $$(".ecard", up).forEach((c) => { if (c.dataset.date < today) past.prepend(c); });
    $$(".ecard", past).forEach((c) => { if (c.dataset.date >= today) up.append(c); });
    $('[data-ev-empty="viitoare"]').hidden = !!$(".ecard", up);
    $('[data-ev-empty="trecute"]').hidden = !!$(".ecard", past);
  }

  /* ---------- Copiere link articol ---------- */
  $$(".share__copy").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.url); b.textContent = "Link copiat"; }
    catch { b.textContent = "Copiați din bara de adrese"; }
    setTimeout(() => (b.textContent = "Copiați linkul"), 2500);
  }));

  /* ---------- Hartă (se încarcă doar la cerere) ---------- */
  const mapBtn = $("#harta-btn");
  if (mapBtn) {
    mapBtn.addEventListener("click", () => {
      const box = $("#harta");
      const q = encodeURIComponent(box.dataset.q);
      box.innerHTML = `<iframe title="Hartă: ${box.dataset.q.replace(/"/g, "")}" src="https://www.google.com/maps?q=${q}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
      box.classList.add("is-loaded");
    });
  }

  /* ---------- Formular de contact ---------- */
  const form = $("#formular");
  if (form) {
    const sel = $("#f-program");
    const pre = new URLSearchParams(location.search).get("program");
    if (sel && pre && [...sel.options].some((o) => o.value === pre)) sel.value = pre;

    const status = $(".form__status", form);
    const summary = $("#form-rezumat");
    const rules = [
      { el: $("#f-nume"), err: $("#e-nume"), test: (v) => v.trim().length >= 2, msg: "Introduceți numele (cel puțin 2 caractere)." },
      { el: $("#f-email"), err: $("#e-email"), test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: "Introduceți o adresă de e-mail validă, de exemplu nume@exemplu.ro." },
      { el: $("#f-mesaj"), err: $("#e-mesaj"), test: (v) => v.trim().length >= 10, msg: "Scrieți un mesaj (cel puțin 10 caractere)." },
      { el: $("#f-gdpr"), err: $("#e-gdpr"), test: (_, el) => el.checked, msg: "Pentru a trimite mesajul, este necesar acordul privind prelucrarea datelor." },
    ];
    const check = (r) => {
      const ok = r.test(r.el.value, r.el);
      r.el.setAttribute("aria-invalid", String(!ok));
      r.err.textContent = ok ? "" : r.msg;
      return ok;
    };
    rules.forEach((r) => r.el.addEventListener(r.el.type === "checkbox" ? "change" : "blur", () => { if (r.el.getAttribute("aria-invalid")) check(r); }));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = ""; status.className = "form__status";
      const bad = rules.filter((r) => !check(r));
      if (bad.length) {
        $("ul", summary).innerHTML = bad.map((r) => `<li><a href="#${r.el.id}">${r.msg}</a></li>`).join("");
        summary.hidden = false;
        summary.focus();
        return;
      }
      summary.hidden = true;
      // Formularul este procesat de Netlify Forms. Pe calculatorul local nu există serviciu de trimitere,
      // așa că nu afișăm o confirmare falsă.
      if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
        status.textContent = "Previzualizare locală: mesajul NU a fost trimis. Formularul funcționează după publicarea website-ului pe Netlify.";
        status.classList.add("is-err");
        return;
      }
      const btn = $('button[type="submit"]', form);
      btn.disabled = true; btn.textContent = "Se trimite…";
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        status.textContent = status.dataset.ok;
        status.classList.add("is-ok");
      } catch {
        status.textContent = status.dataset.err;
        status.classList.add("is-err");
      } finally {
        btn.disabled = false; btn.textContent = "Trimiteți mesajul";
      }
    });
  }
})();

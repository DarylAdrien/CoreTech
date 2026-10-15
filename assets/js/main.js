/* CoreTech — site interactions */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Theme (light / dark) ---------- */
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() {
    var t = root.getAttribute("data-theme");
    return t ? t === "dark" : darkQuery.matches;
  }
  function syncTheme() {
    root.classList.toggle("is-dark", isDark());
    document.querySelectorAll(".theme-toggle").forEach(function (b) {
      b.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
    });
  }
  syncTheme();
  if (darkQuery.addEventListener) darkQuery.addEventListener("change", syncTheme);
  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("ct-theme", next); } catch (e) { /* storage unavailable */ }
      syncTheme();
    });
  });

  /* ---------- Header + mobile CTA on scroll ---------- */
  var header = document.querySelector("[data-header]");
  var mobileCta = document.querySelector(".mobile-cta");
  if (mobileCta) document.body.classList.add("has-mobile-cta");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (mobileCta) mobileCta.classList.toggle("is-shown", y > 520);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { closeMenu(); toggle.focus(); }
    });
  }

  /* ---------- Reveal on scroll, bars, counters, go-live ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    var start = null, duration = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function activate(el) {
    el.classList.add("is-visible");
    el.querySelectorAll("[data-width]").forEach(function (bar) { bar.style.width = bar.getAttribute("data-width"); });
    el.querySelectorAll("[data-count]").forEach(animateCount);
    if (el.hasAttribute("data-golive")) {
      setTimeout(function () { el.classList.add("is-live"); }, reduceMotion ? 0 : 1800);
    }
  }

  var targets = document.querySelectorAll(".reveal, [data-animate]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { activate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(activate);
  }

  /* ---------- Rotating headline word ---------- */
  document.querySelectorAll("[data-rotator]").forEach(function (rot) {
    var words = rot.querySelectorAll("span");
    if (words.length < 2 || reduceMotion) return;
    var i = 0;
    setInterval(function () {
      var current = words[i];
      i = (i + 1) % words.length;
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      words[i].classList.remove("is-leaving");
      words[i].classList.add("is-active");
      setTimeout(function () { current.classList.remove("is-leaving"); }, 600);
    }, 2800);
  });

  /* ---------- 3D tilt on hero panel ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (wrap) {
      var inner = wrap.querySelector(".panel-tilt");
      if (!inner) return;
      wrap.addEventListener("mousemove", function (e) {
        var r = wrap.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
        inner.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
      });
      wrap.addEventListener("mouseleave", function () {
        inner.style.setProperty("--ry", "0deg");
        inner.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- Approach: scroll-driven progress ---------- */
  var stepsEl = document.querySelector("[data-steps]");
  if (stepsEl) {
    var steps = stepsEl.querySelectorAll(".step");
    var ticking = false;
    function updateSteps() {
      ticking = false;
      var r = stepsEl.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.8 - r.top) / (r.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      if (reduceMotion) p = 1;
      stepsEl.style.setProperty("--progress", p.toFixed(3));
      steps.forEach(function (s, i) {
        var threshold = steps.length > 1 ? i / (steps.length - 1) : 0;
        s.classList.toggle("is-active", p >= threshold * 0.96);
      });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateSteps); }
    }, { passive: true });
    window.addEventListener("resize", updateSteps);
    updateSteps();
  }

  /* ---------- Capability tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (tabsRoot) {
    var buttons = Array.prototype.slice.call(tabsRoot.querySelectorAll('[role="tab"]'));
    function select(btn) {
      buttons.forEach(function (b) {
        var selected = b === btn;
        b.setAttribute("aria-selected", String(selected));
        b.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(b.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
    }
    buttons.forEach(function (btn, i) {
      btn.addEventListener("click", function () { select(btn); });
      btn.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = buttons[(i + 1) % buttons.length];
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = buttons[(i - 1 + buttons.length) % buttons.length];
        if (next) { e.preventDefault(); select(next); next.focus(); }
      });
    });
  });

  /* ---------- Testimonials ---------- */
  document.querySelectorAll("[data-quotes]").forEach(function (q) {
    var slides = q.querySelectorAll(".quote-slide");
    var dots = q.querySelectorAll(".quote-dots button");
    var i = 0, timer = null;
    function show(n) {
      i = n;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === n); s.setAttribute("aria-hidden", String(k !== n)); });
      dots.forEach(function (d, k) { d.setAttribute("aria-current", String(k === n)); });
    }
    function start() { if (!reduceMotion) timer = setInterval(function () { show((i + 1) % slides.length); }, 6500); }
    function stop() { clearInterval(timer); }
    dots.forEach(function (d, k) { d.addEventListener("click", function () { stop(); show(k); start(); }); });
    q.addEventListener("mouseenter", stop);
    q.addEventListener("mouseleave", start);
    show(0); start();
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      q.setAttribute("aria-expanded", String(q.getAttribute("aria-expanded") !== "true"));
    });
  });

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".btn--magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x * 0.25).toFixed(1) + "px," + (y * 0.35).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- Page transitions (fallback where view transitions are unsupported) ---------- */
  if (!("onpagereveal" in window) && !reduceMotion) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:)/i.test(href)) return;
      var url = new URL(a.href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(function () { location.href = a.href; }, 170);
    });
    window.addEventListener("pageshow", function () { document.body.classList.remove("is-leaving"); });
  }

  /* ---------- Follow-the-sun clocks ---------- */
  var clocks = document.querySelectorAll("[data-tz]");
  function tick() {
    clocks.forEach(function (c) {
      try {
        c.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: c.getAttribute("data-tz"), hour: "2-digit", minute: "2-digit" });
      } catch (e) { /* unsupported zone */ }
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 30000); }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var card = form.closest(".form-card");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // Prefill from the readiness check (?topic=…&score=…&band=…)
    var params = new URLSearchParams(location.search);
    var topic = params.get("topic");
    if (topic) {
      var sel = form.querySelector("#topic");
      Array.prototype.forEach.call(sel.options, function (o) { if (o.value === topic || o.text === topic) sel.value = o.value; });
    }
    var score = params.get("score");
    if (score && /^\d{1,3}$/.test(score)) {
      var band = (params.get("band") || "").replace(/[^A-Za-z ]/g, "");
      var note = document.querySelector(".score-note");
      if (note) {
        note.textContent = "Your ERP Readiness score: " + score + "/100" + (band ? " (" + band + ")" : "") + ". We've added it to your message.";
        note.classList.add("is-shown");
      }
      var msg = form.querySelector("#message");
      if (msg && !msg.value) msg.value = "I took the ERP Readiness Check and scored " + score + "/100" + (band ? " (" + band + ")" : "") + ". I'd like to discuss the results.\n\n";
    }

    function validateField(field) {
      var input = field.querySelector("input, select, textarea");
      if (!input || !input.hasAttribute("required")) return true;
      var val = input.value.trim();
      var ok = val.length > 0 && (input.type !== "email" || emailRe.test(val));
      field.classList.toggle("is-invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      return ok;
    }
    form.querySelectorAll(".field").forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input) return;
      input.addEventListener("blur", function () { validateField(field); });
      input.addEventListener("input", function () { if (field.classList.contains("is-invalid")) validateField(field); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll(".field").forEach(function (field) {
        if (!validateField(field) && !firstBad) firstBad = field.querySelector("input, select, textarea");
      });
      if (firstBad) { firstBad.focus(); return; }
      card.classList.add("is-sent");
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

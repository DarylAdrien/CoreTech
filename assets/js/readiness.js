/* CoreTech — ERP Readiness Check */
(function () {
  "use strict";

  var quiz = document.getElementById("quiz");
  if (!quiz) return;

  var QUESTIONS = [
    {
      area: "Systems",
      q: "How many systems hold your financial and HR data today?",
      options: ["Five or more, mostly disconnected", "Three or four, linked by manual exports", "Two, with some integration", "One unified ERP"],
      rec: { title: "Consolidate your core systems", text: "A roadmap to bring finance and HR onto one platform removes re-keying and gives everyone the same numbers.", href: "services.html#strategy" }
    },
    {
      area: "Finance",
      q: "How long does your month-end close take?",
      options: ["More than 10 working days", "6–10 working days", "3–5 working days", "Under 3 working days"],
      rec: { title: "Shorten the close", text: "One ledger with automated intercompany and reconciliations typically cuts close time by half or more.", href: "services.html#implementation" }
    },
    {
      area: "Payroll",
      q: "How is payroll reconciled with finance?",
      options: ["Manually, in spreadsheets", "Partly automated, with lots of checks", "Automated, with manual review", "Fully automated GL posting"],
      rec: { title: "Automate payroll-to-GL", text: "Bidirectional payroll integrations post results and journals back automatically, with a full audit trail.", href: "services.html#integrations" }
    },
    {
      area: "Reporting",
      q: "How do leaders get the numbers they need?",
      options: ["They ask analysts for exports", "Static monthly reports", "Some live dashboards", "Self-service, in real time"],
      rec: { title: "Move from exports to dashboards", text: "Governed dashboards that blend ERP and operational data put answers in front of leaders in weeks.", href: "services.html#analytics" }
    },
    {
      area: "Data",
      q: "How confident are you in your master data — employees, suppliers and customers?",
      options: ["Low — duplicates everywhere", "Patchy, depends on the team", "Mostly clean", "Governed, with clear owners"],
      rec: { title: "Fix data before it moves", text: "Profiling, cleansing and ownership rules ahead of migration prevent most go-live surprises.", href: "services.html#migration" }
    },
    {
      area: "Support",
      q: "How are ERP changes and vendor releases handled?",
      options: ["Ad hoc, when something breaks", "Mostly left to the vendor", "Internal team, some testing", "Governed process with regression tests"],
      rec: { title: "Put releases on rails", text: "Managed services with release reviews and regression testing keep your ERP stable and current.", href: "services.html#support" }
    }
  ];

  var BANDS = [
    { min: 85, name: "Optimised", title: "A genuinely strong core.", text: "Your ERP is well integrated and well governed. The next gains come from advanced analytics, automation and keeping pace with every release." },
    { min: 65, name: "Advanced", title: "Strong foundations, a few gaps to close.", text: "Most of your core is working well. Targeted improvements in the areas below would turn a good setup into a great one." },
    { min: 40, name: "Developing", title: "Solid foundations, clear room to grow.", text: "Parts of your ERP are working, but manual effort and disconnected data are holding the business back. The recommendations below are where you'll see the fastest return." },
    { min: 0, name: "Foundational", title: "Significant gains are within reach.", text: "Disconnected systems and manual processes are costing time and confidence. A structured roadmap would deliver quick wins and a clear path to a stronger core." }
  ];

  var answers = new Array(QUESTIONS.length).fill(null);
  var index = 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var qWrap = document.getElementById("quiz-questions");
  var countEl = document.getElementById("quiz-count");
  var areaEl = document.getElementById("quiz-area");
  var barEl = document.getElementById("quiz-bar");
  var backBtn = document.getElementById("quiz-back");
  var nextBtn = document.getElementById("quiz-next");
  var run = quiz.querySelector(".quiz-run");
  var result = document.getElementById("quiz-result");

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // Build question panels
  qWrap.innerHTML = QUESTIONS.map(function (item, qi) {
    var opts = item.options.map(function (o, oi) {
      return '<button type="button" class="q-option" aria-pressed="false" data-q="' + qi + '" data-v="' + oi + '"><span class="q-key">' + (oi + 1) + "</span>" + esc(o) + "</button>";
    }).join("");
    return '<div class="q" data-index="' + qi + '"' + (qi ? " hidden" : "") + ' role="group" aria-labelledby="q-' + qi + '"><h2 id="q-' + qi + '">' + esc(item.q) + '</h2><div class="q-options">' + opts + "</div></div>";
  }).join("");
  var panels = qWrap.querySelectorAll(".q");

  function render() {
    panels.forEach(function (p, i) { p.hidden = i !== index; });
    countEl.textContent = "Question " + (index + 1) + " of " + QUESTIONS.length;
    areaEl.textContent = QUESTIONS[index].area;
    barEl.style.width = ((index + (answers[index] !== null ? 1 : 0)) / QUESTIONS.length * 100) + "%";
    backBtn.style.visibility = index === 0 ? "hidden" : "visible";
    nextBtn.disabled = answers[index] === null;
    nextBtn.innerHTML = (index === QUESTIONS.length - 1 ? "See my results " : "Next ") + arrowSvg;
  }

  function choose(qi, v) {
    answers[qi] = v;
    panels[qi].querySelectorAll(".q-option").forEach(function (b) {
      b.setAttribute("aria-pressed", String(+b.getAttribute("data-v") === v));
    });
    render();
    if (qi < QUESTIONS.length - 1) {
      setTimeout(function () { if (index === qi) { index++; render(); focusFirst(); } }, reduceMotion ? 0 : 380);
    } else {
      nextBtn.focus();
    }
  }

  function focusFirst() {
    var pressed = panels[index].querySelector('[aria-pressed="true"]') || panels[index].querySelector(".q-option");
    if (pressed) pressed.focus({ preventScroll: true });
  }

  qWrap.addEventListener("click", function (e) {
    var b = e.target.closest(".q-option");
    if (b) choose(+b.getAttribute("data-q"), +b.getAttribute("data-v"));
  });

  quiz.addEventListener("keydown", function (e) {
    if (!result.hidden) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) { e.preventDefault(); choose(index, n - 1); }
  });

  backBtn.addEventListener("click", function () { if (index > 0) { index--; render(); focusFirst(); } });
  nextBtn.addEventListener("click", function () {
    if (answers[index] === null) return;
    if (index < QUESTIONS.length - 1) { index++; render(); focusFirst(); }
    else showResult();
  });

  document.getElementById("quiz-restart").addEventListener("click", function () {
    answers.fill(null);
    index = 0;
    qWrap.querySelectorAll(".q-option").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    result.hidden = true;
    run.hidden = false;
    render();
    quiz.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });

  function showResult() {
    var total = answers.reduce(function (a, b) { return a + b; }, 0);
    var score = Math.round(total / (QUESTIONS.length * 3) * 100);
    var band = BANDS.filter(function (b) { return score >= b.min; })[0];

    document.getElementById("result-band").textContent = band.name;
    document.getElementById("result-title").textContent = band.title;
    document.getElementById("result-text").textContent = band.text;

    // Area breakdown
    document.getElementById("area-bars").innerHTML = QUESTIONS.map(function (item, i) {
      var pct = Math.round(answers[i] / 3 * 100);
      return '<div class="area-bar' + (answers[i] <= 1 ? " is-low" : "") + '"><div>' + esc(item.area) + "<span>" + pct + '%</span></div><i style="--w:0%" data-w="' + pct + '%"></i></div>';
    }).join("");

    // Recommendations: weakest areas first
    var order = QUESTIONS.map(function (q, i) { return i; }).sort(function (a, b) { return answers[a] - answers[b]; });
    var weak = order.filter(function (i) { return answers[i] <= 1; });
    if (!weak.length) weak = order.filter(function (i) { return answers[i] <= 2; });
    var recs = weak.slice(0, 4).map(function (i) { return QUESTIONS[i].rec; });
    if (!recs.length) {
      recs = [
        { title: "Keep pace with every release", text: "Managed services with proactive release reviews protect what you've built.", href: "services.html#support" },
        { title: "Push further with analytics", text: "Forecasting and anomaly detection on top of a clean core turn data into foresight.", href: "services.html#analytics" }
      ];
    }
    document.getElementById("recs").innerHTML = recs.map(function (r) {
      return '<div class="rec"><h3>' + esc(r.title) + "</h3><p>" + esc(r.text) + '</p><a class="link-arrow" href="' + r.href + '">Explore ' + arrowSvg + "</a></div>";
    }).join("");

    document.getElementById("result-cta").href = "contact.html?topic=readiness&score=" + score + "&band=" + encodeURIComponent(band.name);

    run.hidden = true;
    result.hidden = false;
    barEl.style.width = "100%";
    quiz.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

    // Animate gauge, number and bars
    var gauge = document.getElementById("gauge-val");
    var C = 565.49;
    var num = document.getElementById("score-num");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        gauge.style.strokeDashoffset = String(C * (1 - score / 100));
        document.querySelectorAll("#area-bars i").forEach(function (b) { b.style.setProperty("--w", b.getAttribute("data-w")); });
      });
    });
    if (reduceMotion) { num.textContent = score; return; }
    var start = null;
    (function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1500, 1);
      num.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  render();
})();

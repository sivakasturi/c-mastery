/* C Mastery — swipeable card app (no dependencies) */
(function () {
  "use strict";

  const COURSE = window.COURSE || [];
  const $ = (s) => document.querySelector(s);
  const stage = $("#stage");

  /* ---------------- storage (best-effort) ---------------- */
  const KEY = "c-mastery:v1";
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        idx: state.idx, learned: [...state.learned], quiz: state.quiz, theme: state.theme
      }));
    } catch (e) { /* storage unavailable: progress lives in memory only */ }
  }
  const saved = load();
  const state = {
    idx: 0,
    learned: new Set(saved.learned || []),
    quiz: saved.quiz || {},
    theme: saved.theme || null,
    busy: false
  };

  /* ---------------- build the deck ---------------- */
  const deck = [{ type: "welcome" }];
  COURSE.forEach((m, mi) => {
    deck.push({ type: "intro", mi, key: `m${mi}i` });
    m.cards.forEach((c, ci) => deck.push({ type: "concept", mi, ci, key: `m${mi}c${ci}` }));
    if (m.quiz && m.quiz.length) deck.push({ type: "quiz", mi, key: `m${mi}q` });
  });
  deck.push({ type: "finish" });
  const moduleStart = COURSE.map((_, mi) => deck.findIndex((d) => d.type === "intro" && d.mi === mi));
  const conceptTotal = deck.filter((d) => d.type === "concept").length;

  /* ---------------- syntax highlighting ---------------- */
  const KW = new Set("if else for while do switch case default break continue return goto sizeof typedef struct union enum static extern const volatile restrict inline register auto _Generic _Static_assert static_assert _Alignof alignof nullptr constexpr typeof true false".split(" "));
  const TY = new Set("void char short int long float double signed unsigned bool _Bool size_t ssize_t ptrdiff_t FILE va_list int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t uintptr_t intptr_t pthread_t pthread_mutex_t atomic_long atomic_int time_t NULL EOF".split(" "));
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fmt = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  const C_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(#[ \t]*include[ \t]*<[^>\n]+>|#[ \t]*[a-z]+)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])+')|(\b(?:0[xX][\da-fA-F]+|0[bB][01]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)[uUlLfF]*\b)|([A-Za-z_]\w*)(?=(\s*\())?/g;
  const SH_RE = /((?:^|[ \t])#[^\n]*)|("(?:\\.|[^"\\\n])*"|'[^'\n]*')|(\$\([^)]*\)|\$\w+|\$\?)/gm;

  function highlight(code, lang) {
    let out = "", last = 0, m;
    if (lang === "sh" || lang === "make") {
      SH_RE.lastIndex = 0;
      while ((m = SH_RE.exec(code))) {
        out += esc(code.slice(last, m.index));
        if (m[1]) {
          const lead = m[1].match(/^[ \t]*/)[0];
          out += esc(lead) + `<span class="tok-com">${esc(m[1].slice(lead.length))}</span>`;
        } else if (m[2]) out += `<span class="tok-str">${esc(m[2])}</span>`;
        else out += `<span class="tok-pre">${esc(m[3])}</span>`;
        last = SH_RE.lastIndex;
      }
      return out + esc(code.slice(last));
    }
    C_RE.lastIndex = 0;
    while ((m = C_RE.exec(code))) {
      out += esc(code.slice(last, m.index));
      const t = m[0];
      let cls = "";
      if (m[1]) cls = "com";
      else if (m[2]) cls = "pre";
      else if (m[3]) cls = "str";
      else if (m[4]) cls = "num";
      else if (m[5]) cls = KW.has(t) ? "kw" : TY.has(t) ? "type" : m[6] !== undefined ? "fn" : "";
      out += cls ? `<span class="tok-${cls}">${esc(t)}</span>` : esc(t);
      last = C_RE.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  /* ---------------- card rendering ---------------- */
  function headHTML(d, label) {
    const m = d.mi != null ? COURSE[d.mi] : null;
    const lvl = m ? m.level : "Start";
    return `<div class="card-head">
      <span class="level-chip">${lvl}</span>
      <span class="module-name">${label || (m ? m.title : "")}</span>
      <span class="card-num"><span class="learned-dot">✓ </span>${deck.indexOf(d) + 1}/${deck.length}</span>
    </div>`;
  }

  function codeHTML(c) {
    const lang = c.lang || "c";
    const label = lang === "sh" ? "terminal" : lang === "make" ? "Makefile" : "main.c";
    let html = `<div class="code">
      <div class="code-head"><span><span class="dots"><i></i><i></i><i></i></span>${label}</span>
      <button class="copy-btn" data-copy>Copy</button></div>
      <pre><code>${highlight(c.code, lang)}</code></pre></div>`;
    if (c.out !== undefined || c.outNote) {
      html += `<div class="output"><div class="output-head">Output ${c.outNote ? `<span>· ${c.outNote}</span>` : ""}</div>`;
      if (c.out !== undefined) html += `<pre>${esc(c.out.replace(/\n$/, ""))}</pre>`;
      html += `</div>`;
    }
    return html;
  }

  function wrapTables(html) {
    return html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
  }

  function conceptHTML(d) {
    const c = COURSE[d.mi].cards[d.ci];
    let h = headHTML(d) + `<div class="card-body"><h1>${c.title}</h1>${wrapTables(c.body || "")}`;
    if (c.code) h += codeHTML(c);
    if (c.tip) h += `<div class="callout"><span class="ico">💡</span><div><strong class="label">Pro tip</strong>${c.tip}</div></div>`;
    if (c.warn) h += `<div class="callout warn"><span class="ico">⚠️</span><div><strong class="label">Watch out</strong>${c.warn}</div></div>`;
    return h + `</div>`;
  }

  function introHTML(d) {
    const m = COURSE[d.mi];
    const topics = m.cards.map((c, ci) =>
      `<li class="${state.learned.has(`m${d.mi}c${ci}`) ? "done" : ""}">${c.title}</li>`).join("");
    return headHTML(d, `Module ${d.mi + 1} of ${COURSE.length}`) + `<div class="card-body">
      <div class="intro-hero"><div class="intro-icon">${m.icon}</div>
      <div class="intro-kicker">MODULE ${String(d.mi + 1).padStart(2, "0")} · ${m.cards.length} CARDS + CHECKPOINT</div>
      <h1>${m.title}</h1></div>
      <ol class="intro-topics">${topics}<li>Checkpoint quiz · ${m.quiz.length} questions</li></ol>
    </div>`;
  }

  function quizHTML(d) {
    const m = COURSE[d.mi];
    const ans = state.quiz[d.mi] || [];
    const qs = m.quiz.map((q, qi) => {
      const chosen = ans[qi];
      const opts = q.opts.map((o, oi) => {
        let cls = "";
        if (chosen != null) {
          if (oi === q.a) cls = "correct";
          else if (oi === chosen) cls = "wrong";
        }
        return `<button class="opt ${cls}" data-q="${qi}" data-o="${oi}" ${chosen != null ? "disabled" : ""}>${fmt(o)}</button>`;
      }).join("");
      const verdict = chosen == null ? "" : chosen === q.a ? `<b class="ok">Correct.</b> ` : `<b class="no">Not quite.</b> `;
      return `<div class="quiz-q"><h3><span class="qn">Q${qi + 1}</span>${fmt(q.q)}</h3>
        <div class="opts">${opts}</div>
        <div class="why ${chosen != null ? "show" : ""}">${verdict}${fmt(q.why)}</div></div>`;
    }).join("");
    return headHTML(d, `${m.title} · Checkpoint`) + `<div class="card-body">
      <h1>Checkpoint: ${m.title}</h1>
      <p>Test yourself before moving on. Tap an answer to see the explanation.</p>
      ${qs}
      <div class="score" data-score></div>
    </div>`;
  }

  function welcomeHTML(d) {
    const lv = ["Beginner", "Intermediate", "Advanced", "Pro"].map((l) => {
      const mods = COURSE.filter((m) => m.level === l);
      const n = mods.reduce((s, m) => s + m.cards.length, 0);
      return `<div data-lvl="${l}"><b>${l}</b><span>${mods.length} module${mods.length === 1 ? "" : "s"} · ${n} cards</span></div>`;
    }).join("");
    const resume = saved.idx > 0 && saved.idx < deck.length - 1;
    return headHTML(d, "Welcome") + `<div class="card-body welcome">
      <div class="big-c">{C}</div>
      <h1>Learn C, from zero to pro.</h1>
      <p>${conceptTotal} bite-sized cards across ${COURSE.length} modules. Each card covers one concept, with a real program you can compile, its exact output, and the pitfalls professionals watch for.</p>
      <div class="roadmap">${lv}</div>
      <p><b>How it works:</b> swipe left for the next card and right to go back (or use the arrow keys). Mark cards as learned, take the checkpoint at the end of each module, and open the ☰ course map to jump anywhere. Your progress is saved in this browser.</p>
      <button class="start-btn" data-start>${resume ? "Continue where you left off →" : "Start learning →"}</button>
    </div>`;
  }

  function finishHTML(d) {
    let correct = 0, total = 0;
    COURSE.forEach((m, mi) => {
      const a = state.quiz[mi] || [];
      m.quiz.forEach((q, qi) => { if (a[qi] != null) { total++; if (a[qi] === q.a) correct++; } });
    });
    const learned = deck.filter((x) => x.type === "concept" && state.learned.has(x.key)).length;
    return headHTML(d, "The end") + `<div class="card-body welcome">
      <div class="big-c">🏆</div>
      <h1>You made it through the deck.</h1>
      <p>Concepts marked learned: <b>${learned} / ${conceptTotal}</b><br>
      Checkpoint answers correct: <b>${correct} / ${total || 0}</b></p>
      <p>Reading gets you started, but writing code is what makes you a pro. Pick a project from the “road to pro” card, compile with <code>-Wall -Wextra -fsanitize=address,undefined</code>, and build something real.</p>
      <button class="start-btn" data-restart>Back to the beginning</button>
    </div>`;
  }

  function buildCard(i, depth) {
    const d = deck[i];
    const el = document.createElement("article");
    el.className = "card" + (depth ? ` behind depth-${depth}` : "") + (d.type === "intro" ? " intro" : "");
    if (d.key && state.learned.has(d.key)) el.classList.add("is-learned");
    const lvl = d.mi != null ? COURSE[d.mi].level : "Intermediate";
    el.dataset.lvl = lvl;
    el.style.zIndex = String(10 - depth);
    el.setAttribute("aria-hidden", depth ? "true" : "false");
    const fn = { welcome: welcomeHTML, intro: introHTML, concept: conceptHTML, quiz: quizHTML, finish: finishHTML }[d.type];
    el.innerHTML = fn(d);
    if (depth === 0) wireCard(el, d);
    return el;
  }

  function render(enterFrom) {
    stage.innerHTML = "";
    for (let depth = 2; depth >= 0; depth--) {
      const i = state.idx + depth;
      if (i < deck.length) stage.appendChild(buildCard(i, depth));
    }
    const top = stage.lastElementChild;
    if (enterFrom) {
      top.style.transform = enterFrom === "left"
        ? "translateX(-115%) rotate(-10deg)" : "translateY(16px) scale(.97)";
      top.style.opacity = enterFrom === "left" ? "1" : "0";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        top.classList.add("anim");
        top.style.transform = "";
        top.style.opacity = "";
      }));
    }
    updateChrome();
  }

  /* ---------------- chrome (progress, buttons, hash) ---------------- */
  function updateChrome() {
    const d = deck[state.idx];
    $("#counter").textContent = `${state.idx + 1} / ${deck.length}`;
    $("#progressBar").style.width = `${(state.idx / (deck.length - 1)) * 100}%`;
    $("#prevBtn").disabled = state.idx === 0;
    $("#nextBtn").disabled = state.idx === deck.length - 1;
    const lb = $("#learnBtn");
    const txt = lb.querySelector(".learn-text");
    if (d.type === "concept") {
      const on = state.learned.has(d.key);
      lb.disabled = false;
      lb.setAttribute("aria-pressed", String(on));
      txt.textContent = on ? "Learned" : "Mark as learned";
    } else if (d.type === "quiz") {
      const done = state.learned.has(d.key);
      lb.disabled = true;
      lb.setAttribute("aria-pressed", String(done));
      txt.textContent = done ? "Checkpoint done" : "Answer every question";
    } else {
      lb.disabled = true;
      lb.setAttribute("aria-pressed", "false");
      txt.textContent = d.type === "finish" ? "Course complete" : "Swipe to begin";
    }
    const h = `#${state.idx + 1}`;
    if (location.hash !== h) history.replaceState(null, "", h);
    save();
  }

  function go(delta) {
    const next = state.idx + delta;
    if (state.busy || next < 0 || next >= deck.length) {
      if (!state.busy) nudge(delta);
      return;
    }
    $("#hint").style.visibility = "hidden";
    if (delta > 0) {
      state.busy = true;
      const top = stage.lastElementChild;
      const behind = top.previousElementSibling;
      top.classList.add("anim");
      top.style.transform = "translateX(-125%) rotate(-12deg)";
      top.style.opacity = "0";
      if (behind) { behind.classList.add("anim"); behind.classList.remove("depth-1"); behind.style.opacity = "1"; }
      setTimeout(() => { state.idx = next; render(); state.busy = false; }, 260);
    } else {
      state.idx = next;
      render(delta === -1 ? "left" : "fade");
    }
  }

  function jump(i) {
    if (i === state.idx) return;
    state.idx = Math.max(0, Math.min(deck.length - 1, i));
    render("fade");
  }

  function nudge(delta) {
    const top = stage.lastElementChild;
    if (!top) return;
    top.classList.add("anim");
    top.style.transform = `translateX(${delta > 0 ? -18 : 18}px)`;
    setTimeout(() => { top.style.transform = ""; }, 140);
  }

  /* ---------------- card interactions ---------------- */
  function wireCard(el, d) {
    el.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.closest(".code").querySelector("pre").innerText;
        copyText(code).then(() => { btn.textContent = "Copied ✓"; setTimeout(() => (btn.textContent = "Copy"), 1400); });
      });
    });
    const start = el.querySelector("[data-start]");
    if (start) start.addEventListener("click", () => {
      const s = saved.idx > 0 && saved.idx < deck.length - 1 ? saved.idx : 1;
      jump(s);
    });
    const restart = el.querySelector("[data-restart]");
    if (restart) restart.addEventListener("click", () => jump(0));

    if (d.type === "quiz") {
      el.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
        const qi = +b.dataset.q, oi = +b.dataset.o;
        const arr = state.quiz[d.mi] || (state.quiz[d.mi] = []);
        if (arr[qi] != null) return;
        arr[qi] = oi;
        const q = COURSE[d.mi].quiz[qi];
        const box = b.closest(".quiz-q");
        box.querySelectorAll(".opt").forEach((o, k) => {
          o.disabled = true;
          if (k === q.a) o.classList.add("correct");
          else if (k === oi) o.classList.add("wrong");
        });
        const why = box.querySelector(".why");
        why.innerHTML = (oi === q.a ? `<b class="ok">Correct.</b> ` : `<b class="no">Not quite.</b> `) + fmt(q.why);
        why.classList.add("show");
        updateScore(el, d);
        save();
      }));
      updateScore(el, d);
    }
    attachSwipe(el);
  }

  function updateScore(el, d) {
    const m = COURSE[d.mi];
    const arr = state.quiz[d.mi] || [];
    const answered = m.quiz.filter((_, i) => arr[i] != null).length;
    const box = el.querySelector("[data-score]");
    if (answered < m.quiz.length) { box.classList.remove("show"); return; }
    const right = m.quiz.filter((q, i) => arr[i] === q.a).length;
    const pct = Math.round((right / m.quiz.length) * 100);
    const msg = pct === 100 ? "Perfect! 🎯" : pct >= 60 ? "Nice work 👍" : "Worth revisiting this module 🔁";
    box.innerHTML = `Score: ${right} / ${m.quiz.length} · ${msg} <button class="retry">Retry</button>`;
    box.classList.add("show");
    box.querySelector(".retry").addEventListener("click", () => {
      delete state.quiz[d.mi];
      state.learned.delete(d.key);
      render();
    });
    if (!state.learned.has(d.key)) { state.learned.add(d.key); el.classList.add("is-learned"); updateChrome(); }
  }

  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).catch(() => fallback());
    return Promise.resolve(fallback());
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      ta.remove();
    }
  }

  /* ---------------- swipe gesture ---------------- */
  function attachSwipe(el) {
    let sx = 0, sy = 0, dx = 0, t0 = 0, mode = null, pid = null;
    el.addEventListener("pointerdown", (e) => {
      if (state.busy || (e.pointerType === "mouse" && e.button !== 0)) return;
      if (e.target.closest("button, a, .opt")) return;
      const pre = e.target.closest("pre");
      if (pre && pre.scrollWidth > pre.clientWidth + 2) return;   // let code scroll sideways
      sx = e.clientX; sy = e.clientY; dx = 0; t0 = performance.now(); mode = "pending"; pid = e.pointerId;
    });
    el.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pid || !mode) return;
      const mx = e.clientX - sx, my = e.clientY - sy;
      if (mode === "pending") {
        if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
        if (Math.abs(mx) > Math.abs(my) * 1.2) {
          if (e.pointerType === "mouse" && window.getSelection().toString()) { mode = null; return; }
          mode = "drag";
          el.setPointerCapture(pid);
          el.classList.remove("anim");
          el.classList.add("dragging");
        } else { mode = null; return; }
      }
      dx = mx;
      const edge = (dx > 0 && state.idx === 0) || (dx < 0 && state.idx === deck.length - 1);
      const x = edge ? dx * 0.25 : dx;
      el.style.transform = `translateX(${x}px) rotate(${x / 22}deg)`;
      e.preventDefault();
    });
    const end = (e) => {
      if (e.pointerId !== pid) return;
      if (mode === "drag") {
        el.classList.remove("dragging");
        const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
        const passed = Math.abs(dx) > Math.min(110, el.offsetWidth * 0.25) || v > 0.6;
        if (passed && dx < 0 && state.idx < deck.length - 1) go(1);
        else {
          el.classList.add("anim");
          el.style.transform = "";
          if (passed && dx > 0 && state.idx > 0) go(-1);
        }
      }
      mode = null; pid = null;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  /* ---------------- drawer / course map ---------------- */
  const drawer = $("#drawer"), scrim = $("#scrim");
  function openDrawer() {
    buildToc();
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add("show"));
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    const cur = drawer.querySelector(".toc-item.current");
    if (cur) cur.scrollIntoView({ block: "center" });
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.classList.remove("show");
    setTimeout(() => (scrim.hidden = true), 250);
  }
  function buildToc() {
    const curMi = deck[state.idx].mi;
    let doneAll = 0;
    $("#toc").innerHTML = COURSE.map((m, mi) => {
      const keys = m.cards.map((_, ci) => `m${mi}c${ci}`).concat(`m${mi}q`);
      const done = keys.filter((k) => state.learned.has(k)).length;
      doneAll += done;
      return `<li><button class="toc-item ${curMi === mi ? "current" : ""}" data-lvl="${m.level}" data-jump="${moduleStart[mi]}">
        <span class="toc-icon">${m.icon}</span>
        <span><span class="toc-title">${mi + 1}. ${m.title}</span><span class="toc-sub">${m.level}</span></span>
        <span class="toc-count ${done === keys.length ? "full" : ""}">${done}/${keys.length}</span>
      </button></li>`;
    }).join("");
    const total = COURSE.reduce((s, m) => s + m.cards.length + 1, 0);
    $("#overall").innerHTML = `${doneAll} of ${total} cards &amp; checkpoints complete
      <div class="bar"><i style="width:${(doneAll / total) * 100}%"></i></div>`;
    $("#toc").querySelectorAll("[data-jump]").forEach((b) =>
      b.addEventListener("click", () => { closeDrawer(); jump(+b.dataset.jump); }));
  }

  /* ---------------- toast ---------------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 1600);
  }

  /* ---------------- theme ---------------- */
  function applyTheme() {
    if (state.theme) document.documentElement.dataset.theme = state.theme;
    else delete document.documentElement.dataset.theme;
  }
  function toggleTheme() {
    const isDark = state.theme ? state.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    state.theme = isDark ? "light" : "dark";
    applyTheme();
    save();
  }

  function toggleLearned() {
    const d = deck[state.idx];
    if (d.type !== "concept") return;
    if (state.learned.has(d.key)) state.learned.delete(d.key);
    else { state.learned.add(d.key); toast("Marked as learned ✓"); }
    const top = stage.lastElementChild;
    if (top) top.classList.toggle("is-learned", state.learned.has(d.key));
    updateChrome();
  }

  /* ---------------- events ---------------- */
  $("#prevBtn").addEventListener("click", () => go(-1));
  $("#nextBtn").addEventListener("click", () => go(1));
  $("#learnBtn").addEventListener("click", toggleLearned);
  $("#menuBtn").addEventListener("click", openDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  $("#themeBtn").addEventListener("click", toggleTheme);
  $("#resetBtn").addEventListener("click", () => {
    if (!$("#resetBtn").dataset.armed) {
      $("#resetBtn").dataset.armed = "1";
      $("#resetBtn").textContent = "Tap again to confirm reset";
      setTimeout(() => { delete $("#resetBtn").dataset.armed; $("#resetBtn").textContent = "Reset all progress"; }, 3000);
      return;
    }
    state.learned.clear(); state.quiz = {}; saved.idx = 0;
    delete $("#resetBtn").dataset.armed;
    $("#resetBtn").textContent = "Reset all progress";
    closeDrawer(); state.idx = 0; render("fade"); toast("Progress reset");
  });

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape" && drawer.classList.contains("open")) return closeDrawer();
    if (drawer.classList.contains("open")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
    else if (e.key === "l" || e.key === "L") toggleLearned();
    else if (e.key === "m" || e.key === "M") openDrawer();
    else if (e.key === "Home") jump(0);
    else if (e.key === "End") jump(deck.length - 1);
  });

  window.addEventListener("hashchange", () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (n >= 1 && n <= deck.length && n - 1 !== state.idx) jump(n - 1);
  });

  /* ---------------- boot ---------------- */
  applyTheme();
  const fromHash = parseInt(location.hash.slice(1), 10);
  if (fromHash >= 1 && fromHash <= deck.length) state.idx = fromHash - 1;
  else if (saved.idx > 0 && saved.idx < deck.length) state.idx = 0; // show welcome with "continue"
  state.idx = Math.max(0, Math.min(deck.length - 1, state.idx));
  if (state.idx === 0) $("#hint").style.visibility = "visible";
  render();
})();

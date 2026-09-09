/* Gravity 1650 — Terrasse edition. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Opening hours. Season dates follow the official Chamrousse listing
     (hiver 29/11 -> 12/04, été 28/06 -> 24/08). Update here each year.
     Days: 0 = dimanche ... 6 = samedi. null = fermé / se renseigner.
  ------------------------------------------------------------------ */
  var SEASONS = [
    { key: 'hiver', label: "Saison d'hiver", from: [11, 29], to: [4, 12],
      days: { 1: ['08:00', '19:00'], 2: ['08:00', '19:00'], 3: ['08:00', '19:00'], 4: ['08:00', '19:00'], 5: ['08:00', '19:00'], 6: ['08:00', '19:00'], 0: null },
      sundayNote: 'Dimanche : appelez-nous pour les horaires du jour.' },
    { key: 'ete', label: "Saison d'été", from: [6, 28], to: [8, 24], daily: true,
      dailyNote: 'Ouvert tous les jours en été. Horaires du jour par téléphone ou sur Instagram.' },
    { key: 'hors', label: 'Hors saison', fallback: true,
      days: { 1: ['10:00', '18:00'], 2: ['10:00', '18:00'], 3: ['10:00', '18:00'], 4: ['10:00', '22:00'], 5: ['10:00', '22:00'], 6: ['10:00', '22:00'], 0: null },
      sundayNote: 'Dimanche : appelez-nous pour les horaires du jour.',
      eveningNote: 'Le soir (jeudi au samedi) uniquement sur réservation.' }
  ];

  function inRange(d, from, to) {
    var m = d.getMonth() + 1, day = d.getDate();
    var afterFrom = (m > from[0]) || (m === from[0] && day >= from[1]);
    var beforeTo = (m < to[0]) || (m === to[0] && day <= to[1]);
    if (from[0] <= to[0]) return afterFrom && beforeTo;   // same calendar year
    return afterFrom || beforeTo;                          // wraps over new year
  }

  function currentSeason(d) {
    for (var i = 0; i < SEASONS.length; i++) {
      var s = SEASONS[i];
      if (s.fallback) continue;
      if (inRange(d, s.from, s.to)) return s;
    }
    return SEASONS.filter(function (s) { return s.fallback; })[0];
  }

  function fmt(t) { // '08:00' -> '8h', '19:30' -> '19h30'
    var p = t.split(':');
    return String(parseInt(p[0], 10)) + 'h' + (p[1] === '00' ? '' : p[1]);
  }

  function todayStatus(now) {
    var s = currentSeason(now);
    var out = { season: s, open: null, text: '' };
    if (s.daily) { out.text = s.dailyNote; out.open = null; return out; }
    var h = s.days[now.getDay()];
    if (!h) { out.text = s.sundayNote; out.open = null; return out; }
    var mins = now.getHours() * 60 + now.getMinutes();
    var o = h[0].split(':'), c = h[1].split(':');
    var om = +o[0] * 60 + +o[1], cm = +c[0] * 60 + +c[1];
    out.open = mins >= om && mins < cm;
    var range = fmt(h[0]) + ' à ' + fmt(h[1]);
    if (out.open) out.text = 'Ouvert aujourd’hui, ' + range;
    else if (mins < om) out.text = 'Fermé pour le moment. Ouvre à ' + fmt(h[0]) + ' (' + range + ')';
    else out.text = 'Fermé pour aujourd’hui. Horaires : ' + range;
    if (s.eveningNote && now.getDay() >= 4 && now.getDay() <= 6) out.text += '. ' + s.eveningNote;
    return out;
  }

  function renderHours() {
    var now = new Date();
    var st = todayStatus(now);
    document.querySelectorAll('[data-hours-line]').forEach(function (el) {
      el.textContent = st.text;
    });
    var badge = document.querySelector('[data-hours-badge]');
    if (badge) {
      badge.querySelector('[data-hours-text]').textContent = st.text;
      badge.classList.toggle('is-open', st.open === true);
      badge.classList.toggle('is-closed', st.open === false);
    }
    document.querySelectorAll('[data-season]').forEach(function (el) {
      el.classList.toggle('is-current', el.getAttribute('data-season') === st.season.key);
      var tag = el.querySelector('[data-season-tag]');
      if (tag) tag.hidden = el.getAttribute('data-season') !== st.season.key;
    });
  }

  /* ------------------------------------------------------------------ Nav */
  function initNav() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    var label = document.querySelector('[data-nav-label]');
    if (!header) return;

    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var path = location.pathname.replace(/index\.html$/, '');
    if (path === '') path = '/';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === path) a.setAttribute('aria-current', 'page');
    });

    if (!toggle || !panel) return;
    var open = false;
    function setOpen(v) {
      open = v;
      toggle.setAttribute('aria-expanded', String(v));
      panel.hidden = !v;
      header.classList.toggle('is-open', v);
      document.body.style.overflow = v ? 'hidden' : '';
      if (label) label.textContent = v ? 'Fermer' : 'Menu';
      if (v) { var first = panel.querySelector('a'); if (first) first.focus(); }
    }
    toggle.addEventListener('click', function () { setOpen(!open); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { setOpen(false); toggle.focus(); } });
    panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900 && open) setOpen(false); });
  }

  /* ------------------------------------------------------------ Reveals */
  function initReveals() {
    var els = document.querySelectorAll('.reveal, .reveal-lines, .reveal-scale');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------- Scroll-driven layers */
  function initScrollScene() {
    var layers = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
    var cabin = document.querySelector('[data-cabin]');
    var cable = document.querySelector('[data-cable]');
    var words = Array.prototype.slice.call(document.querySelectorAll('.words'));
    var stacks = Array.prototype.slice.call(document.querySelectorAll('.stack'));
    var dayLine = document.querySelector('.day-line i');
    var blobs = Array.prototype.slice.call(document.querySelectorAll('.depth i'));
    var hero = document.querySelector('.hero');

    words.forEach(function (p) {
      if (p.dataset.split) return;
      var frag = document.createDocumentFragment();
      Array.prototype.slice.call(p.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var s = document.createElement('span'); s.textContent = t; frag.appendChild(s);
          });
        } else if (node.nodeType === 1) {
          var wrap = node.cloneNode(false);
          node.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { wrap.appendChild(document.createTextNode(t)); return; }
            var s = document.createElement('span'); s.textContent = t; wrap.appendChild(s);
          });
          frag.appendChild(wrap);
        }
      });
      p.innerHTML = '';
      p.appendChild(frag);
      p.dataset.split = '1';
    });

    if (reduceMotion) {
      words.forEach(function (p) { p.querySelectorAll('span').forEach(function (s) { s.classList.add('on'); }); });
      if (dayLine) dayLine.style.setProperty('--p', '100%');
      return;
    }

    var ticking = false;
    var vh = window.innerHeight;
    window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });

    function cabinAt(t) {
      // cable endpoints in the front layer's SVG coordinate space
      if (!cabin || !cable) return;
      var x1 = +cable.getAttribute('x1'), y1 = +cable.getAttribute('y1');
      var x2 = +cable.getAttribute('x2'), y2 = +cable.getAttribute('y2');
      var x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      cabin.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    }

    function update() {
      ticking = false;
      var y = window.scrollY;

      if (hero) {
        var hh = hero.offsetHeight;
        var p = Math.min(1, Math.max(0, y / hh));
        layers.forEach(function (l) {
          var d = parseFloat(l.getAttribute('data-depth')) || 0;
          l.style.transform = 'translate3d(0,' + (y * d).toFixed(1) + 'px,0)';
        });
        cabinAt(0.12 + p * 0.78);
      }

      words.forEach(function (p) {
        var r = p.getBoundingClientRect();
        var start = vh * 0.85, end = vh * 0.35;
        var t = (start - r.top) / (start - end + r.height);
        t = Math.min(1, Math.max(0, t));
        var spans = p.querySelectorAll('span');
        var n = Math.round(t * spans.length);
        spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
      });

      stacks.forEach(function (st) {
        var cards = st.querySelectorAll('.stack-card');
        cards.forEach(function (c, i) {
          var next = cards[i + 1];
          if (!next) { c.style.transform = ''; return; }
          var r = c.getBoundingClientRect(), nr = next.getBoundingClientRect();
          var overlap = Math.min(1, Math.max(0, (r.bottom - nr.top) / r.height));
          var scale = 1 - overlap * 0.06;
          c.style.transform = 'scale(' + scale.toFixed(3) + ')';
          c.style.filter = overlap > 0 ? 'brightness(' + (1 - overlap * 0.12).toFixed(3) + ')' : '';
        });
      });

      if (dayLine) {
        var day = dayLine.parentNode.parentNode;
        var dr = day.getBoundingClientRect();
        var horizontal = window.innerWidth >= 900;
        var t2 = (vh * 0.8 - dr.top) / (horizontal ? vh * 0.35 : dr.height);
        t2 = Math.min(1, Math.max(0, t2));
        dayLine.style.setProperty('--p', (t2 * 100).toFixed(1) + '%');
      }

      blobs.forEach(function (b, i) {
        var sec = b.closest('section') || b.parentNode;
        var sr = sec.getBoundingClientRect();
        var m = (sr.top / vh) * (i % 2 ? -40 : 40);
        b.style.transform = 'translate3d(0,' + m.toFixed(1) + 'px,0)';
      });
    }

    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ------------------------------------------------------- Consent + GA */
  function initConsent() {
    var cfg = window.SITE_CONFIG || {};
    var box = document.querySelector('[data-consent]');
    var KEY = 'g1650-consent';
    var choice = null;
    try { choice = localStorage.getItem(KEY); } catch (e) { choice = null; }

    // Cookies page: show and reset the stored choice
    var status = document.querySelector('[data-consent-status]');
    var reset = document.querySelector('[data-consent-reset]');
    function showStatus() {
      if (!status) return;
      status.textContent = choice === 'yes' ? 'Choix enregistré : mesure d’audience acceptée.'
        : choice === 'no' ? 'Choix enregistré : mesure d’audience refusée.'
        : 'Aucun choix enregistré pour le moment.';
    }
    showStatus();
    if (reset) reset.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      choice = null; showStatus();
    });

    if (!box) return;
    if (!cfg.gaId) return; // no analytics configured: nothing to ask, nothing loaded

    function loadGA() {
      var s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.gaId);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', cfg.gaId, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    }
    if (choice === 'yes') { loadGA(); return; }
    if (choice === 'no') return;
    box.hidden = false;
    box.querySelector('[data-consent-accept]').addEventListener('click', function () {
      try { localStorage.setItem(KEY, 'yes'); } catch (e) {}
      box.hidden = true; loadGA();
    });
    box.querySelector('[data-consent-refuse]').addEventListener('click', function () {
      try { localStorage.setItem(KEY, 'no'); } catch (e) {}
      box.hidden = true;
    });
  }

  /* -------------------------------------------------------------- Form */
  function initForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      var hp = form.querySelector('input[name="site-web"]');
      if (hp && hp.value) { e.preventDefault(); return; } // bot filled the honeypot
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours'; }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHours();
    initNav();
    initReveals();
    initScrollScene();
    initConsent();
    initForm();
  });
})();

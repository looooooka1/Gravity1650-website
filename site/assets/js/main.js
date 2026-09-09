/* Gravity 1650 — interactions. JavaScript sans dépendance,
   hors Leaflet (carte) et Lenis (défilement fluide), tous deux auto-hébergés. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CFG = window.SITE_CONFIG || {};

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------------------------------------------------------------- thème */
  function initTheme() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    function cur() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
    function apply(t) {
      document.documentElement.setAttribute('data-theme', t);
      btn.setAttribute('aria-label', t === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre');
      btn.setAttribute('aria-pressed', String(t === 'light'));
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute('content', t === 'dark' ? '#131110' : '#F4F0E9');
    }
    apply(cur());
    btn.addEventListener('click', function () {
      var n = cur() === 'dark' ? 'light' : 'dark';
      apply(n);
      try { localStorage.setItem('g1650-theme', n); } catch (e) {}
    });
  }

  /* ------------------------------------------------------------- horaires
     Dates de saison reprises de la fiche officielle de la station
     (hiver 29/11 au 12/04, été 28/06 au 24/08). À mettre à jour chaque année.
     Jours : 0 = dimanche … 6 = samedi.                                      */
  var SEASONS = [
    { key: 'hiver', from: [11, 29], to: [4, 12],
      days: { 1: ['08:00', '19:00'], 2: ['08:00', '19:00'], 3: ['08:00', '19:00'],
              4: ['08:00', '19:00'], 5: ['08:00', '19:00'], 6: ['08:00', '19:00'], 0: null },
      closedNote: 'Dimanche : appelez-nous pour les horaires du jour.' },
    { key: 'ete', from: [6, 28], to: [8, 24], daily: true,
      dailyNote: 'Ouvert tous les jours. Horaires du jour par téléphone ou sur Instagram.' },
    { key: 'hors', fallback: true,
      days: { 1: ['10:00', '18:00'], 2: ['10:00', '18:00'], 3: ['10:00', '18:00'],
              4: ['10:00', '22:00'], 5: ['10:00', '22:00'], 6: ['10:00', '22:00'], 0: null },
      closedNote: 'Dimanche : appelez-nous pour les horaires du jour.',
      eveningNote: 'soir sur réservation' }
  ];

  function inRange(d, from, to) {
    var m = d.getMonth() + 1, day = d.getDate();
    var after = m > from[0] || (m === from[0] && day >= from[1]);
    var before = m < to[0] || (m === to[0] && day <= to[1]);
    return from[0] <= to[0] ? (after && before) : (after || before);
  }
  function season(d) {
    for (var i = 0; i < SEASONS.length; i++) {
      var s = SEASONS[i];
      if (!s.fallback && inRange(d, s.from, s.to)) return s;
    }
    return SEASONS[SEASONS.length - 1];
  }
  function fmt(t) { var p = t.split(':'); return String(+p[0]) + 'h' + (p[1] === '00' ? '' : p[1]); }

  function status(now) {
    var s = season(now), out = { season: s, open: null, text: '' };
    if (s.daily) { out.text = s.dailyNote; return out; }
    var h = s.days[now.getDay()];
    if (!h) { out.text = s.closedNote; return out; }
    var mins = now.getHours() * 60 + now.getMinutes();
    var o = h[0].split(':'), c = h[1].split(':');
    var om = +o[0] * 60 + +o[1], cm = +c[0] * 60 + +c[1];
    out.open = mins >= om && mins < cm;
    var range = fmt(h[0]) + ' à ' + fmt(h[1]);
    if (out.open) out.text = 'Ouvert maintenant · ' + range;
    else if (mins < om) out.text = 'Ouvre à ' + fmt(h[0]) + ' · ' + range;
    else out.text = 'Fermé pour aujourd’hui · ' + range;
    if (s.eveningNote && now.getDay() >= 4 && now.getDay() <= 6) out.text += ' · ' + s.eveningNote;
    return out;
  }

  function renderHours() {
    var st = status(new Date());
    document.querySelectorAll('[data-hours-text]').forEach(function (el) { el.textContent = st.text; });
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.classList.toggle('is-open', st.open === true);
      el.classList.toggle('is-closed', st.open === false);
    });
    document.querySelectorAll('[data-season]').forEach(function (el) {
      var is = el.getAttribute('data-season') === st.season.key;
      el.classList.toggle('is-current', is);
      var tag = el.querySelector('[data-season-now]');
      if (tag) tag.hidden = !is;
    });
  }

  /* ----------------------------------------------------------- navigation */
  function initNav() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 16); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    if (!toggle || !panel) return;
    var open = false;
    function set(v) {
      open = v;
      toggle.setAttribute('aria-expanded', String(v));
      panel.hidden = !v;
      if (header) header.classList.toggle('is-open', v);
      document.body.style.overflow = v ? 'hidden' : '';
      var lbl = toggle.querySelector('[data-nav-label]');
      if (lbl) lbl.textContent = v ? 'Fermer' : 'Menu';
      if (v) { var a = panel.querySelector('a'); if (a) a.focus(); }
    }
    toggle.addEventListener('click', function () { set(!open); });
    panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { set(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960 && open) set(false); });
  }

  function initSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href*="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute('href') || '').split('#')[1];
      var el = id && document.getElementById(id);
      if (el) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        if (map[en.target.id]) map[en.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ------------------------------------------------------------ révélations */
  function initReveals() {
    var els = document.querySelectorAll('.rv, .rv-lines');
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------- boucles infinies : duplication DOM */
  function initLoops() {
    document.querySelectorAll('[data-loop]').forEach(function (row) {
      row.innerHTML += row.innerHTML;               // deux copies : translate -50% boucle
      row.setAttribute('aria-hidden', 'false');
      Array.prototype.slice.call(row.children).slice(row.children.length / 2)
        .forEach(function (n) { n.setAttribute('aria-hidden', 'true'); });
    });
  }

  /* ------------------------------------------- effets liés au défilement */
  function initScroll() {
    var hero = document.querySelector('[data-hero]');
    var track = document.querySelector('[data-hero-track]');
    var heroUi = document.querySelector('[data-hero-ui]');
    var cue = document.querySelector('[data-cue]');
    var readers = Array.prototype.slice.call(document.querySelectorAll('.reader'));
    var kb = Array.prototype.slice.call(document.querySelectorAll('[data-kenburns]'));

    readers.forEach(function (p) {
      if (p.dataset.split) return;
      var walk = function (node) {
        var frag = document.createDocumentFragment();
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            n.textContent.split(/(\s+)/).forEach(function (t) {
              if (!t) return;
              if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
              var w = document.createElement('w');
              w.textContent = t;
              frag.appendChild(w);
            });
          } else if (n.nodeType === 1) {
            var c = n.cloneNode(false);
            c.appendChild(walk(n));
            frag.appendChild(c);
          }
        });
        return frag;
      };
      var f = walk(p);
      p.innerHTML = '';
      p.appendChild(f);
      p.dataset.split = '1';
    });

    if (reduce) {
      readers.forEach(function (p) {
        p.querySelectorAll('w').forEach(function (w) { w.classList.add('on'); });
      });
      return;
    }

    var vh = window.innerHeight, ticking = false;
    window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });

    function frame() {
      ticking = false;

      if (hero && track) {
        var r = track.getBoundingClientRect();
        var span = Math.max(1, track.offsetHeight - vh);
        var p = clamp(-r.top / span, 0, 1);
        hero.style.setProperty('--p', p.toFixed(4));
        // l'interface du hero s'efface tôt, la scène continue seule
        if (heroUi) {
          var u = clamp(p / 0.34, 0, 1);
          heroUi.style.opacity = String(1 - u);
          heroUi.style.transform = 'translate3d(0,' + (-u * 40).toFixed(1) + 'px,0)';
        }
        if (cue) cue.style.opacity = String(clamp(1 - p / 0.14, 0, 1));
      }

      readers.forEach(function (el) {
        var b = el.getBoundingClientRect();
        var t = clamp((vh * 0.86 - b.top) / (vh * 0.5 + b.height * 0.5), 0, 1);
        var ws = el.querySelectorAll('w');
        var n = Math.round(t * ws.length);
        for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('on', i < n);
      });

      kb.forEach(function (el) {
        var b = el.getBoundingClientRect();
        if (b.bottom < 0 || b.top > vh) return;
        var t = (vh - b.top) / (vh + b.height);
        el.style.transform = 'scale(1.08) translate3d(0,' + ((t - 0.5) * -34).toFixed(1) + 'px,0)';
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();
    return frame;
  }

  /* --------------------------------------------------------- carte / menu */
  function initMenu() {
    var list = document.querySelector('[data-menu-tabs]');
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (panels[j]) { panels[j].classList.toggle('is-active', on); panels[j].hidden = !on; }
      });
      if (focus) {
        tabs[i].focus();
        tabs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
    select(0);
  }

  /* ------------------------------------------------------------------ FAQ */
  function initFaq() {
    document.querySelectorAll('[data-faq] .faq-q').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        // referme les autres
        btn.closest('[data-faq]').querySelectorAll('.faq-q').forEach(function (o) {
          if (o === btn) return;
          var op = document.getElementById(o.getAttribute('aria-controls'));
          o.setAttribute('aria-expanded', 'false');
          if (op) { op.style.height = '0px'; op.style.opacity = '0'; }
        });
        btn.setAttribute('aria-expanded', String(!open));
        if (open) { panel.style.height = '0px'; panel.style.opacity = '0'; }
        else {
          panel.style.height = panel.scrollHeight + 'px';
          panel.style.opacity = '1';
        }
      });
    });
    window.addEventListener('resize', function () {
      document.querySelectorAll('[data-faq] .faq-q[aria-expanded="true"]').forEach(function (b) {
        var p = document.getElementById(b.getAttribute('aria-controls'));
        if (p) p.style.height = p.scrollHeight + 'px';
      });
    });
  }

  /* ----------------------------------------------------------------- carte */
  function initMap() {
    var el = document.getElementById('carte-acces');
    if (!el || typeof window.L === 'undefined') return;
    var lat = parseFloat(el.dataset.lat), lng = parseFloat(el.dataset.lng);
    var map = L.map(el, { center: [lat, lng], zoom: 16, scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var icon = L.divIcon({
      className: '', html: '<div class="map-pin"></div>',
      iconSize: [34, 34], iconAnchor: [17, 32], popupAnchor: [0, -30]
    });
    L.marker([lat, lng], { icon: icon, title: 'Gravity 1650' }).addTo(map)
      .bindPopup('<b>Gravity 1650</b><br>128 place de Belledonne<br>38410 Chamrousse')
      .openPopup();
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });
  }

  /* ------------------------------------------------- défilement adouci */
  function initLenis(frame) {
    if (reduce || typeof window.Lenis === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    function raf(t) { lenis.raf(t); if (frame) frame(); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    renderHours();
    initNav();
    initSpy();
    initLoops();
    initReveals();
    var frame = initScroll();
    initMenu();
    initFaq();
    initMap();
    initLenis(frame);
  });
})();

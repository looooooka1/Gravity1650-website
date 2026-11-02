/* Gravity 1650 — page test « Une journée au 1650 ».
   S'ajoute à main.js (thème, horaires, hero, révélations, Lenis), sans dépendance. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var desk = window.matchMedia('(min-width: 900px) and (min-height: 560px)');
  var vel = 0; // vitesse de défilement lissée, en px par image

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function $all(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function toMin(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function hhmm(m) { m = Math.round(m); var h = Math.floor(m / 60), n = m % 60; return (h < 10 ? '0' : '') + h + ':' + (n < 10 ? '0' : '') + n; }
  function fmt(t) { var p = t.split(':'); return +p[0] + 'h' + (p[1] === '00' ? '' : p[1]); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
  function onView(els, fn, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } });
    }, opts || { threshold: 0.3 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------- intro : l'altitude monte */
  function initIntro() {
    var intro = document.querySelector('[data-intro]');
    var out = document.querySelector('[data-intro-count]');
    if (!intro || reduce) { root.classList.add('is-ready'); if (intro) intro.remove(); return; }
    var t0 = performance.now();
    (function tick(t) {
      var k = clamp((t - t0) / 1250, 0, 1);
      out.textContent = String(Math.round(easeOut(k) * 1650));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
    setTimeout(function () { root.classList.add('is-ready'); }, 1750);
    setTimeout(function () { intro.remove(); }, 2700);
  }

  /* ------------------------------------- logo : une lettre, un élément */
  function splitWordmark() {
    $all('[data-split] .w-main').forEach(function (el) {
      var txt = el.textContent;
      el.textContent = '';
      txt.split('').forEach(function (c, i) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', i);
        s.textContent = c;
        el.appendChild(s);
      });
    });
  }

  /* --------------------------------------------- neige dans le hero */
  function initSnow() {
    var c = document.querySelector('[data-snow]');
    var track = document.querySelector('[data-hero-track]');
    if (!c || reduce || !c.getContext) return;
    var ctx = c.getContext('2d'), flakes = [], w = 0, h = 0, wind = 0, on = true, raf = 0, last = 0;

    function size() {
      var dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(160, w * h / 8000));
      flakes = [];
      for (var i = 0; i < n; i++) {
        var d = Math.random();                         // profondeur : gros flocons proches, rapides
        flakes.push({ x: Math.random() * w, y: Math.random() * h, r: 0.6 + d * d * 2.6,
                      s: 0.25 + d * 0.9, ph: Math.random() * 6.28, a: 0.3 + d * 0.55 });
      }
    }
    function tick(t) {
      raf = 0;
      if (!on || document.hidden) return;
      var dt = last ? Math.min(3, (t - last) / 16.7) : 1;
      last = t;
      wind += (clamp(vel, -40, 40) * 0.05 - wind) * 0.06;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.ph += 0.012 * dt;
        f.y += (f.s - vel * 0.06 * f.s) * dt;
        f.x += (Math.sin(f.ph) * 0.35 + wind) * f.s * dt;
        if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
        else if (f.y < -6) f.y = h + 4;
        if (f.x > w + 4) f.x = -4; else if (f.x < -4) f.x = w + 4;
        ctx.globalAlpha = f.a;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!raf && on && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } }
    size(); start();
    window.addEventListener('resize', size, { passive: true });
    document.addEventListener('visibilitychange', start);
    if ('IntersectionObserver' in window && track) {
      new IntersectionObserver(function (e) { on = e[0].isIntersecting; start(); }).observe(track);
    }
  }

  /* ------------------------------- heures en compteur à rouleaux */
  function initOdometers() {
    var els = $all('[data-odo]');
    els.forEach(function (el) {
      var txt = el.textContent, k = 0;
      el.textContent = '';
      txt.split('').forEach(function (ch) {
        if (!/\d/.test(ch)) { var s = document.createElement('span'); s.className = 'odo-sep'; s.textContent = ch; el.appendChild(s); return; }
        var d = document.createElement('span'), col = document.createElement('span');
        d.className = 'odo-d'; col.className = 'odo-col';
        col.style.setProperty('--i', k++);
        col.dataset.d = ch;
        for (var n = 0; n < 10; n++) { var sp = document.createElement('span'); sp.textContent = n; col.appendChild(sp); }
        col.style.transform = 'translate3d(0,' + (reduce ? -ch * 10 : -90) + '%,0)';
        d.appendChild(col); el.appendChild(d);
      });
    });
    if (reduce) return;
    onView(els, function (el) {
      $all('.odo-col', el).forEach(function (col) { col.style.transform = 'translate3d(0,' + (-col.dataset.d * 10) + '%,0)'; });
    }, { threshold: 0.4 });
  }

  /* ----------------------------------------------- chiffres qui comptent */
  function initCounters() {
    var els = $all('[data-count]');
    if (reduce) return;
    els.forEach(function (el) { el.textContent = '0'; });
    onView(els, function (el) {
      var to = +el.dataset.count, t0 = performance.now();
      (function tick(t) {
        var k = clamp((t - t0) / 1500, 0, 1);
        el.textContent = String(Math.round(easeOut(k) * to));
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
  }

  /* ----------------------------- la carte : ardoises à l'horizontale */
  var hs = { on: false, maxX: 0, offs: [], idx: -1 };
  function initCarte() {
    var sect = document.querySelector('[data-hs]');
    if (!sect) return null;
    var track = sect.querySelector('[data-hs-track]');
    var ghost = sect.querySelector('[data-hs-ghost]');
    var prog = sect.querySelector('[data-hs-prog]');
    var outIdx = sect.querySelector('[data-hs-index]');
    var outName = sect.querySelector('[data-hs-name]');
    var slates = $all('[data-slate]', sect);
    var names = slates.map(function (s) { var h = s.querySelector('h3'); return h ? h.textContent : ''; });
    sect.querySelector('[data-hs-total]').textContent = String(slates.length);

    var bars = names.map(function (n, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Aller à : ' + n);
      b.addEventListener('click', function () { go(i); });
      prog.appendChild(b);
      return b;
    });
    slates.forEach(function (s) { $all('.mi', s).forEach(function (mi, n) { mi.style.setProperty('--n', n); }); });
    if (reduce) slates.forEach(function (s) { s.classList.add('is-in'); });
    else onView(slates, function (s) { s.classList.add('is-in'); }, { threshold: 0.2 });

    function setIdx(i) {
      if (i === hs.idx) return;
      hs.idx = i;
      outIdx.textContent = (i < 9 ? '0' : '') + (i + 1);
      outName.textContent = names[i];
      bars.forEach(function (b, j) { b.classList.toggle('is-on', j <= i); });
    }
    function idxAt(x) {
      var i = 0;
      for (var j = 0; j < hs.offs.length; j++) if (hs.offs[j] <= x + track.clientWidth * 0.3) i = j;
      return i;
    }
    function go(i) {
      i = clamp(i, 0, slates.length - 1);
      var behavior = reduce ? 'auto' : 'smooth';
      if (hs.on) {
        var top = sect.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + Math.min(hs.offs[i], hs.maxX) + 2, behavior: behavior });
      } else track.scrollTo({ left: hs.offs[i], behavior: behavior });
    }
    track.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); go(hs.idx + d); }
    });
    track.addEventListener('scroll', function () { if (!hs.on) setIdx(idxAt(track.scrollLeft)); }, { passive: true });

    function layout() {
      hs.on = !reduce && desk.matches;
      root.classList.toggle('hs-on', hs.on);
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      hs.offs = slates.map(function (s) { return s.offsetLeft - pad; });
      if (!hs.on) {
        sect.style.height = ''; track.style.transform = ''; ghost.style.transform = '';
        setIdx(idxAt(track.scrollLeft));
        return;
      }
      var last = slates[slates.length - 1];
      hs.maxX = Math.max(0, last.offsetLeft + last.offsetWidth + pad - track.clientWidth);
      sect.style.height = (hs.maxX + window.innerHeight) + 'px';
    }
    setIdx(0);
    layout();
    window.addEventListener('resize', layout, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    // appelé par la boucle de défilement : lecture puis écriture
    return {
      read: function () { return sect.getBoundingClientRect(); },
      write: function (r, vh) {
        if (!hs.on) return;
        var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1), x = p * hs.maxX;
        track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
        ghost.style.transform = 'translate3d(' + (-x * 0.35).toFixed(1) + 'px,-50%,0)';
        setIdx(idxAt(x));
      }
    };
  }

  /* --------------------------- boucle de défilement : la journée avance */
  function initDay(carte) {
    var chapters = $all('.chapter');
    var rail = document.querySelector('.dayrail');
    var clock = document.querySelector('[data-clock]');
    var clockLabel = document.querySelector('[data-clock-label]');
    var heroTrack = document.querySelector('[data-hero-track]');
    var ridges = $all('[data-draw]');
    var clips = $all('[data-clip]');
    var marquees = $all('.marquee');
    var lastY = window.scrollY, ticking = false, tod = '', shown = '', label = '';

    root.setAttribute('data-tod', 'matin');

    function frame() {
      ticking = false;
      var vh = window.innerHeight, y = window.scrollY;

      // lectures
      var cr = chapters.map(function (c) { return c.getBoundingClientRect(); });
      var hr = heroTrack ? heroTrack.getBoundingClientRect() : null;
      var rr = ridges.map(function (el) { return el.getBoundingClientRect(); });
      var kr = clips.map(function (el) { return el.getBoundingClientRect(); });
      var sr = carte ? carte.read() : null;

      vel += ((y - lastY) - vel) * 0.18;
      lastY = y;
      if (Math.abs(vel) < 0.02) vel = 0;

      // écritures
      var mid = vh * 0.5, at = 0;
      for (var i = 0; i < cr.length; i++) if (cr[i].top <= mid) at = i;
      var ch = chapters[at], b = cr[at];
      if (ch) {
        var t = clamp((mid - b.top) / Math.max(1, b.height), 0, 1);
        var m = toMin(ch.dataset.from) + t * (toMin(ch.dataset.to) - toMin(ch.dataset.from));
        if (ch.dataset.tod !== tod) { tod = ch.dataset.tod; root.setAttribute('data-tod', tod); }
        if (rail) {
          rail.style.setProperty('--k', clamp((m - 450) / 870, 0, 1).toFixed(4));
          rail.classList.toggle('on-hero', !!hr && hr.bottom > mid);
          rail.classList.toggle('is-off', hs.on && !!sr && sr.top < vh * 0.6 && sr.bottom > vh * 0.4); // les ardoises passent dessous
          var s = hhmm(m);
          if (s !== shown) { shown = s; clock.textContent = s; }
          if (ch.dataset.label !== label) { label = ch.dataset.label; clockLabel.textContent = label; }
        }
      }

      ridges.forEach(function (el, k) {
        var p = el.firstElementChild;
        if (p) p.style.strokeDashoffset = String(1 - clamp((vh * 0.95 - rr[k].top) / (vh * 0.55), 0, 1));
      });
      if (!reduce) {
        clips.forEach(function (el, k) {
          el.style.setProperty('--c', (1 - easeOut(clamp((vh - kr[k].top) / (vh * 0.75), 0, 1))).toFixed(3));
        });
        var sk = clamp(-vel * 0.12, -6, 6).toFixed(2);
        marquees.forEach(function (el) { el.style.transform = sk === '0.00' ? '' : 'skewX(' + sk + 'deg)'; });
      }
      if (carte) carte.write(sr, vh);

      if (vel !== 0) schedule(); // la vitesse retombe doucement après l'arrêt
    }
    function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    frame();
  }

  /* ------------------------------------------------ le cadran des horaires */
  function initDial() {
    var dial = document.querySelector('[data-dial]');
    if (!dial) return;
    var arcEl = dial.querySelector('[data-dial-arc]');
    var prev = dial.querySelector('[data-dial-preview]');
    var needle = dial.querySelector('[data-dial-needle]');
    var state = dial.querySelector('[data-dial-state]');
    var sub = dial.querySelector('[data-dial-sub]');
    var ticks = dial.querySelector('[data-dial-ticks]');
    var NS = 'http://www.w3.org/2000/svg', seen = reduce;

    function pt(min, r) { var a = min / 1440 * 6.2832; return [100 + r * Math.sin(a), 100 - r * Math.cos(a)]; }
    function arc(a, b, r) {
      var p0 = pt(a, r), p1 = pt(b, r);
      return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + (b - a > 720 ? 1 : 0) + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
    }
    function dur(m) { var h = Math.floor(m / 60), n = m % 60; return h ? h + ' h' + (n ? ' ' + (n < 10 ? '0' : '') + n : '') : n + ' min'; }

    for (var h = 0; h < 24; h++) {
      var l = document.createElementNS(NS, 'line'), p0 = pt(h * 60, 79), p1 = pt(h * 60, h % 6 ? 75 : 71);
      l.setAttribute('x1', p0[0]); l.setAttribute('y1', p0[1]); l.setAttribute('x2', p1[0]); l.setAttribute('y2', p1[1]);
      if (!(h % 6)) l.setAttribute('class', 'major');
      ticks.appendChild(l);
    }

    function render() {
      var cur = document.querySelector('[data-season].is-current'); // posé par main.js
      var now = new Date(), m = now.getHours() * 60 + now.getMinutes();
      if (seen) needle.style.transform = 'rotate(' + (m / 4) + 'deg)';
      if (!cur || !cur.dataset.open) {
        arcEl.setAttribute('d', '');
        state.textContent = 'Fermé';
        sub.textContent = 'Hors saison, réouverture au début de la prochaine saison.';
        return;
      }
      var o = toMin(cur.dataset.open), c = toMin(cur.dataset.close);
      arcEl.setAttribute('d', arc(o, c, 86));
      if (m >= o && m < c) { state.textContent = 'Ouvert'; sub.textContent = 'Ferme dans ' + dur(c - m); }
      else if (m < o) { state.textContent = 'Fermé'; sub.textContent = 'Ouvre à ' + fmt(cur.dataset.open); }
      else { state.textContent = 'Fermé'; sub.textContent = 'Réouvre demain à ' + fmt(cur.dataset.open); }
    }
    render();
    setInterval(render, 60000);
    onView([dial], function () { seen = true; render(); }, { threshold: 0.4 });

    $all('[data-season]').forEach(function (s) {
      function show() { prev.setAttribute('d', s.dataset.open ? arc(toMin(s.dataset.open), toMin(s.dataset.close), 72) : ''); }
      function hide() { prev.setAttribute('d', ''); }
      s.addEventListener('mouseenter', show); s.addEventListener('focus', show);
      s.addEventListener('mouseleave', hide); s.addEventListener('blur', hide);
    });
  }

  /* -------------------------------- micro-interactions au pointeur fin */
  function initPointer() {
    if (!fine || reduce) return;
    $all('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.22, dy = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    $all('[data-spot]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--x', (e.clientX - r.left) + 'px');
        el.style.setProperty('--y', (e.clientY - r.top) + 'px');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    splitWordmark();
    initIntro();
    initSnow();
    initOdometers();
    initCounters();
    initDay(initCarte());
    initDial();
    initPointer();
  });
})();

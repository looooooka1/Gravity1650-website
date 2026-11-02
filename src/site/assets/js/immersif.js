/* Gravity 1650 — page test « Une journée au 1650 ».
   S'ajoute à main.js (thème, horaires, hero, révélations, Lenis), sans dépendance. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
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

  /* ------------- après-ski : les forfaits pendus se balancent au défilement */
  /* épingle fixée au site + élastique jusqu'au trou du forfait (pivot à 56 px au-dessus, trou à 16 px sous le haut) */
  function initPins(els) {
    var NS = 'http://www.w3.org/2000/svg', box = els[0].parentNode, svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'pass-strings'); svg.setAttribute('aria-hidden', 'true');
    box.insertBefore(svg, box.firstChild);
    var items = els.map(function (el) {
      var pin = document.createElement('i'), line = document.createElementNS(NS, 'line');
      pin.className = 'pass-pin'; pin.setAttribute('aria-hidden', 'true');
      box.appendChild(pin); svg.appendChild(line);
      return { el: el, pin: pin, line: line, r: parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0 };
    });
    return function draw(st) {
      items.forEach(function (o, i) {
        var s = st ? st[i] : { x: 0, y: 0, a: 0 };
        var px = o.el.offsetLeft + o.el.offsetWidth / 2, py = o.el.offsetTop - 56;
        var th = (o.r + s.a) * Math.PI / 180;
        var hx = px + s.x - 72 * Math.sin(th), hy = py + s.y + 72 * Math.cos(th);
        var len = Math.hypot(hx - px, hy - py);
        o.pin.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
        o.line.setAttribute('x1', px.toFixed(1)); o.line.setAttribute('y1', py.toFixed(1));
        o.line.setAttribute('x2', hx.toFixed(1)); o.line.setAttribute('y2', hy.toFixed(1));
        o.line.style.strokeWidth = clamp(2.6 * 72 / Math.max(1, len), 0.9, 2.6).toFixed(2); // l'élastique s'affine en s'étirant
      });
    };
  }

  function initPasses() {
    var els = $all('[data-pass]');
    if (!els.length) return null;
    var draw = initPins(els);
    draw();
    addEventListener('resize', function () { draw(); });
    if (reduce) return null;
    var st = els.map(function (el, i) { return { el: el, a: 0, w: 0, f: [1, -0.8, 0.65][i % 3], x: 0, y: 0, vx: 0, vy: 0, held: null }; });
    var raf = 0, live = false;
    function step() {
      raf = 0;
      var moving = vel !== 0;
      st.forEach(function (o) {
        if (!o.held) { // élastique : rappel vers le crochet, avec un léger dépassement
          o.vx = (o.vx - o.x * 0.08) * 0.82; o.vy = (o.vy - o.y * 0.08) * 0.82;
          o.x += o.vx; o.y += o.vy;
        }
        o.w += clamp(vel, -60, 60) * 0.012 * o.f - o.a * 0.05 + clamp(o.vx, -40, 40) * 0.02; // ressort : la vitesse pousse, le cordon rappelle
        o.w *= 0.9;
        o.a = clamp(o.a + o.w, -20, 20);
        if (o.held || Math.abs(o.a) > 0.02 || Math.abs(o.w) > 0.02 || Math.abs(o.x) + Math.abs(o.y) > 0.3 || Math.abs(o.vx) + Math.abs(o.vy) > 0.3) moving = true;
        o.el.style.setProperty('--s', o.a.toFixed(2) + 'deg');
        o.el.style.setProperty('--x', o.x.toFixed(1) + 'px');
        o.el.style.setProperty('--y', o.y.toFixed(1) + 'px');
      });
      draw(st);
      if (moving && (live || st.some(function (o) { return o.held; }))) raf = requestAnimationFrame(step);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(step); }
    function rubber(d) { return d / (1 + Math.abs(d) / 900); } // plus on tire, plus ça résiste
    st.forEach(function (o) {
      o.el.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        o.held = { id: e.pointerId, sx: e.clientX - o.x * 1.6, sy: e.clientY - o.y * 1.6 };
        try { o.el.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
        o.el.classList.add('is-held');
        kick();
      });
      o.el.addEventListener('pointermove', function (e) {
        if (!o.held || o.held.id !== e.pointerId) return;
        var nx = rubber(e.clientX - o.held.sx), ny = rubber(e.clientY - o.held.sy);
        o.vx = nx - o.x; o.vy = ny - o.y; o.x = nx; o.y = ny;
      });
      function drop(e) {
        if (!o.held || o.held.id !== e.pointerId) return;
        o.held = null;
        o.el.classList.remove('is-held');
        kick();
      }
      o.el.addEventListener('pointerup', drop);
      o.el.addEventListener('pointercancel', drop);
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { live = e[0].isIntersecting; }).observe(els[0].parentNode);
    else live = true;
    return function () { if (live) kick(); };
  }

  /* ------------------------ le soir : guirlande dessinée, ampoules posées */
  function initGarland() {
    var g = document.querySelector('[data-garland]');
    if (!g) return;
    var NS = 'http://www.w3.org/2000/svg', n = 21, pts = [];
    function y(x) { var f = (x * 2) % 1; return 10 + 64 * Math.sin(Math.PI * f); } // deux festons entre trois poteaux
    for (var k = 0; k <= 100; k++) pts.push(k * 10 + ',' + y(k / 100).toFixed(1));
    var svg = document.createElementNS(NS, 'svg'), pl = document.createElementNS(NS, 'polyline');
    svg.setAttribute('viewBox', '0 0 1000 120'); svg.setAttribute('preserveAspectRatio', 'none');
    pl.setAttribute('points', pts.join(' '));
    svg.appendChild(pl); g.appendChild(svg);
    for (var i = 0; i < n; i++) {
      var x = (i + 0.5) / n, b = document.createElement('i');
      b.style.left = (x * 100).toFixed(2) + '%';
      b.style.top = y(x).toFixed(1) + 'px';
      b.style.setProperty('--i', i);
      b.style.setProperty('--d', (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1); // décalage pseudo-aléatoire du scintillement
      g.appendChild(b);
    }
  }

  /* --------------------------- boucle de défilement : la journée avance */
  function initDay(kick) {
    var chapters = $all('.chapter');
    var rail = document.querySelector('.dayrail');
    var clock = document.querySelector('[data-clock]');
    var clockLabel = document.querySelector('[data-clock-label]');
    var heroTrack = document.querySelector('[data-hero-track]');
    var clips = $all('[data-clip]');
    var marquees = $all('.marquee');
    var cable = document.querySelector('[data-cable]');
    var gondola = document.querySelector('[data-gondola]');
    var fog = document.querySelector('[data-fog]');
    var dawn = document.querySelector('.chap-matin');
    var sunSect = document.querySelector('[data-sun]');
    var sun = document.querySelector('[data-sun-disc]');
    var aprIdx = chapters.findIndex(function (c) { return c.dataset.tod === 'apres'; });
    var aprSun = document.querySelector('.l-apres');
    var lastY = window.scrollY, ticking = false, tod = '', shown = '', label = '';

    root.setAttribute('data-tod', 'matin');

    function frame() {
      ticking = false;
      var vh = window.innerHeight, y = window.scrollY;

      // lectures
      var cr = chapters.map(function (c) { return c.getBoundingClientRect(); });
      var hr = heroTrack ? heroTrack.getBoundingClientRect() : null;
      var kr = clips.map(function (el) { return el.getBoundingClientRect(); });
      var gr = cable ? cable.getBoundingClientRect() : null;
      var gw = gondola ? gondola.offsetWidth : 0;
      var fr = fog ? fog.getBoundingClientRect() : null;
      var dr = dawn ? dawn.getBoundingClientRect() : null;
      var ur = sunSect ? sunSect.getBoundingClientRect() : null;

      vel += ((y - lastY) - vel) * 0.18;
      lastY = y;
      if (Math.abs(vel) < 0.02) vel = 0;

      // écritures
      var mid = vh * 0.5, at = 0;
      for (var i = 0; i < cr.length; i++) if (cr[i].top <= mid) at = i;
      var ch = chapters[at], b = cr[at];
      if (ch) {
        // l'heure de fin est atteinte un peu avant que le bas du chapitre entre à l'écran
        var t = clamp((mid - b.top) / Math.max(1, b.height - vh * 0.6), 0, 1);
        var m = toMin(ch.dataset.from) + t * (toMin(ch.dataset.to) - toMin(ch.dataset.from));
        if (ch.dataset.tod !== tod) { tod = ch.dataset.tod; root.setAttribute('data-tod', tod); }
        if (rail) {
          var done = cr[cr.length - 1].bottom < vh * 0.8; // les avis arrivent : la journée est finie
          rail.style.setProperty('--k', clamp((m - 450) / 870, 0, 1).toFixed(4));
          rail.classList.toggle('on-hero', !!hr && hr.bottom > mid);
          rail.classList.toggle('is-done', done);
          var s = hhmm(m), lb = t === 1 && at === cr.length - 1 ? 'Bonne soirée' : ch.dataset.label;
          if (s !== shown) { shown = s; clock.textContent = s; }
          if (lb !== label) { label = lb; clockLabel.textContent = lb; }
        }
      }

      if (!reduce) {
        clips.forEach(function (el, k) {
          el.style.setProperty('--c', (1 - easeOut(clamp((vh - kr[k].top) / (vh * 0.75), 0, 1))).toFixed(3));
        });
        var sk = clamp(-vel * 0.12, -6, 6).toFixed(2);
        marquees.forEach(function (el) { el.style.transform = sk === '0.00' ? '' : 'skewX(' + sk + 'deg)'; });

        if (dr && dr.bottom > 0 && dr.top < vh) dawn.style.setProperty('--dawn', clamp((vh - dr.top) / (vh + dr.height * 0.6), 0, 1).toFixed(3));

        // matin : la cabine monte le long du câble, la brume se lève sur le titre
        if (gr && gr.bottom > 0 && gr.top < vh) {
          var g = clamp((vh - gr.top) / (vh + gr.height), 0, 1);
          var gx = (-0.02 + 1.04 * g) * gr.width - gw / 2, gy = (0.04 + 0.42 * g) * gr.height;
          gondola.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0) rotate(' + clamp(vel * 0.35, -9, 9).toFixed(2) + 'deg)';
        }
        if (fr) {
          var q = easeOut(clamp((vh * 0.95 - fr.top) / (vh * 0.5), 0, 1));
          fog.style.setProperty('--q', q.toFixed(3));
        }
        // après-ski : la lueur descend et sort par le bas juste avant la guirlande du soir
        if (aprSun && aprIdx > -1) {
          var ar = cr[aprIdx];
          aprSun.style.setProperty('--sy', clamp((vh * 0.5 - ar.top) / Math.max(1, ar.height - vh * 0.5), 0, 1).toFixed(3));
        }
        // midi : le soleil monte au zénith derrière le titre
        if (ur && ur.bottom > 0 && ur.top < vh) sun.style.setProperty('--sp', clamp((vh - ur.top) / (vh + ur.height * 0.5), 0, 1).toFixed(3));
      }
      if (kick && vel !== 0) kick();

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
    initCounters();
    initGarland();
    initDay(initPasses());
    onView($all('[data-stamp]'), function (el) { el.classList.add('is-in'); }, { threshold: 0.6 });
    onView($all('[data-lights]'), function (el) { el.classList.add('is-on'); }, { threshold: 0.25 });
    initDial();
    initPointer();
  });
})();

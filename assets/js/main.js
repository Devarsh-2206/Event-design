/* ==========================================================================
   ONE CITY. ONE STAGE. ONE RECORD.
   --------------------------------------------------------------------------
   GSAP + ScrollTrigger drive the cinematic passages. Every one of them has a
   vanilla fallback, so if the CDN is blocked (school networks often are) the
   page still reveals, still counts, still works. Nothing here animates for
   decoration: motion either reveals scale, marks progress, or shows state.
   ========================================================================== */
(function () {
  'use strict';

  var RM  = window.matchMedia('(prefers-reduced-motion: reduce)');
  var GS  = window.gsap;
  var ST  = window.ScrollTrigger;
  var HAS = !!(GS && ST);
  if (HAS) GS.registerPlugin(ST);

  // Weighted toward the mid-tones: a crowd under one key light is
  // tonally close, not a spread of five different values.
  // Copper ages to patina: the crowd is mostly weathered, with a copper
  // minority catching the key light. Same material, two ages.
  var CROWD = ['#59635C', '#59635C', '#879187', '#879187', '#879187',
               '#B5B9AE', '#9E4829', '#D8753D'];

  /* ======================================================================
     Config — one file the client edits, applied over the HTML placeholders
     ====================================================================== */

  function applyConfig() {
    var c = window.EVENT_CONFIG || {};
    var d = {
      telLink:    c.phone ? 'tel:' + c.phone.replace(/[^\d+]/g, '') : '',
      mailtoLink: c.email ? 'mailto:' + c.email + '?subject=' +
                  encodeURIComponent('School participation — 31 October record attempt') : '',
      phoneDisplay: c.phone, emailDisplay: c.email, paymentLink: c.paymentLink,
      upiLink: c.upiId ? 'upi://pay?pa=' + encodeURIComponent(c.upiId) +
               '&pn=' + encodeURIComponent(c.upiName || 'SNK Dance Company') + '&cu=INR' : ''
    };
    function val(k) {
      if (d[k]) return d[k];
      if (c[k]) return c[k];
      return null;
    }
    document.querySelectorAll('[data-cfg]').forEach(function (el) {
      var v = val(el.getAttribute('data-cfg'));
      if (v === null) return;
      var small = el.querySelector('small');
      el.textContent = v;
      if (small) el.appendChild(small);
    });
    document.querySelectorAll('[data-cfg-href]').forEach(function (el) {
      var v = val(el.getAttribute('data-cfg-href'));
      if (v === null) return;
      el.setAttribute('href', v);
      if (/^https?:/i.test(v)) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    });
    var upi = document.getElementById('upibtn');
    if (upi && !c.upiId) upi.hidden = true;
    var yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ======================================================================
     Film grain — generated once, tiled by CSS. Cheaper than an animated
     canvas overlay and it survives on low-end phones.
     ====================================================================== */

  function grain() {
    var s = 180, cv = document.createElement('canvas');
    cv.width = cv.height = s;
    var ctx = cv.getContext('2d');
    var img = ctx.createImageData(s, s), px = img.data;
    for (var i = 0; i < px.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      px[i] = px[i + 1] = px[i + 2] = v;
      px[i + 3] = 26;
    }
    ctx.putImageData(img, 0, 0);
    document.documentElement.style.setProperty('--grain-src', 'url(' + cv.toDataURL('image/png') + ')');
  }

  /* ======================================================================
     Header
     ====================================================================== */

  function header() {
    var hdr = document.getElementById('hdr'),
        nav = document.getElementById('nav'),
        bg  = document.getElementById('burger');
    if (!hdr) return;
    var t = false;
    function onScroll() {
      if (t) return;
      t = true;
      requestAnimationFrame(function () { hdr.classList.toggle('stuck', window.scrollY > 40); t = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!bg || !nav) return;
    function open(o) {
      nav.classList.toggle('open', o);
      bg.setAttribute('aria-expanded', String(o));
      bg.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    }
    bg.addEventListener('click', function () { open(bg.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) open(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bg.getAttribute('aria-expanded') === 'true') { open(false); bg.focus(); }
    });
  }

  /* ======================================================================
     1 · Hero — title card. Lines rise out of their own overflow, then the
     specular band sweeps the metal once the type has landed.
     ====================================================================== */

  function heroIn() {
    var lines = document.querySelectorAll('.hero h1 .l > span');
    var rest  = ['.slate', '.hero__sub', '.hero__cta', '.vitals'].map(function (s) {
      return document.querySelector(s);
    }).filter(Boolean);

    if (!HAS || RM.matches) {
      lines.forEach(function (l) { l.style.transform = 'none'; });
      return;
    }
    var tl = GS.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(lines, { yPercent: 112, duration: 1.15, stagger: .11 })
      .from(rest,  { y: 18, opacity: 0, duration: .8, stagger: .09 }, '-=.62');
  }

  /* ======================================================================
     2 · Scale — the signature. A pinned frame where the crowd multiplies
     from one silhouette to five thousand as you scrub through it. This is
     the only honest way to show "5,000" on a screen: make the reader watch
     it fill up.
     ====================================================================== */

  var STEPS = [
    { n: 1,    l: 'Student',  c: 'It starts with one.' },
    { n: 30,   l: 'A class',  c: 'One class learns the routine.' },
    { n: 250,  l: 'A school', c: 'One school fills its zone.' },
    { n: 1200, l: 'Students', c: 'Four schools, four zones.' },
    { n: 5000, l: 'Students', c: 'Every zone. One count. One take.' }
  ];

  function crowd() {
    var cv = document.getElementById('crowd');
    var pin = document.getElementById('scalePin');
    var nEl = document.getElementById('scaleN');
    var lEl = document.getElementById('scaleL');
    var cEl = document.getElementById('scaleC');
    if (!cv || !cv.getContext || !pin) return;

    var ctx = cv.getContext('2d'), W = 0, H = 0, people = [], shown = 0;

    // Build the full 5,000 once; the scroll only changes how many are drawn.
    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      people = [];
      var horizon = H * 0.46, floor = H * 1.04;
      for (var i = 0; i < 5000; i++) {
        // Bias toward the viewer so the near rows crowd and the far rows thin.
        var t = Math.pow(Math.random(), 0.55);
        var y = horizon + (floor - horizon) * t;
        var scale = 0.16 + t * 0.95;
        people.push({
          x: Math.random() * (W + 80) - 40,
          y: y,
          s: scale,
          // Raised arms on roughly a third of them — it reads as dance, not a queue.
          up: Math.random() < 0.34,
          lean: (Math.random() - 0.5) * 0.5,
          c: CROWD[(Math.random() * CROWD.length) | 0],
          a: 0.14 + t * 0.6
        });
      }
      // Far figures first so near ones overlap them correctly.
      people.sort(function (a, b) { return a.y - b.y; });
    }

    // A filled silhouette with real mass — head, torso, limbs. Stroked
    // stick figures read as clip-art pictograms at any size, which is the
    // fastest way to make a premium page look amateur.
    function figure(p) {
      var h = 34 * p.s, w = h * 0.185, x = p.x, y = p.y;
      ctx.save();
      ctx.translate(x, y);
      if (p.lean) ctx.rotate(p.lean * 0.07);
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.c;
      ctx.strokeStyle = p.c;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Legs — thicker than the arms, as a body is
      ctx.lineWidth = Math.max(h * 0.085, .8);
      ctx.beginPath();
      ctx.moveTo(-w * 0.22, -h * 0.46); ctx.lineTo(-w * 0.70, -h * 0.02);
      ctx.moveTo( w * 0.22, -h * 0.46); ctx.lineTo( w * 0.70, -h * 0.02);
      ctx.stroke();

      // Torso — a filled taper from shoulders to hips is what gives it mass
      ctx.beginPath();
      ctx.moveTo(-w * 0.62, -h * 0.76);
      ctx.lineTo( w * 0.62, -h * 0.76);
      ctx.lineTo( w * 0.36, -h * 0.42);
      ctx.lineTo(-w * 0.36, -h * 0.42);
      ctx.closePath();
      ctx.fill();

      // Arms
      ctx.lineWidth = Math.max(h * 0.068, .7);
      ctx.beginPath();
      if (p.up) {
        ctx.moveTo(-w * 0.52, -h * 0.73); ctx.lineTo(-w * 1.05, -h * 1.12);
        ctx.moveTo( w * 0.52, -h * 0.73); ctx.lineTo( w * 1.05, -h * 1.12);
      } else {
        ctx.moveTo(-w * 0.52, -h * 0.72); ctx.lineTo(-w * 1.35, -h * 0.52);
        ctx.moveTo( w * 0.52, -h * 0.72); ctx.lineTo( w * 1.35, -h * 0.52);
      }
      ctx.stroke();

      // Head last, so it sits over the shoulders
      ctx.beginPath();
      ctx.arc(0, -h * 0.87, h * 0.105, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    }

    function draw(count) {
      ctx.clearRect(0, 0, W, H);
      // Key light on the ground behind them.
      var g = ctx.createRadialGradient(W / 2, H * 0.28, 0, W / 2, H * 0.28, Math.max(W, H) * 0.72);
      g.addColorStop(0, 'rgba(216,117,61,.13)');
      g.addColorStop(1, 'rgba(216,117,61,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      var scrim = ctx.createRadialGradient(W / 2, H * 0.33, 0, W / 2, H * 0.33, Math.max(W, H) * 0.42);
      scrim.addColorStop(0, 'rgba(16,12,22,.82)');
      scrim.addColorStop(1, 'rgba(16,12,22,0)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      var step = count <= 1 ? 1 : Math.max(1, Math.floor(people.length / count));
      var drawn = 0;
      for (var i = 0; i < people.length && drawn < count; i += step) {
        // One figure, centre stage, when the count is 1.
        if (count === 1) {
          figure({ x: W / 2, y: H * 0.88, s: 3.4, up: true, lean: 0, c: '#D8753D', a: .95 });
          drawn = 1; break;
        }
        figure(people[i]); drawn++;
      }
      ctx.globalAlpha = 1;
    }

    function fmt(n) { return n.toLocaleString('en-IN'); }

    function render(p) {                                 // p = 0..1 scroll progress
      var seg = Math.min(Math.floor(p * STEPS.length), STEPS.length - 1);
      var prev = seg === 0 ? { n: 1 } : STEPS[seg - 1];
      var local = (p * STEPS.length) - seg;
      var target = STEPS[seg];
      var n = Math.round(prev.n + (target.n - prev.n) * Math.min(local * 1.35, 1));
      n = Math.max(1, Math.min(n, 5000));

      if (n !== shown) { shown = n; draw(n); nEl.textContent = fmt(n); }
      if (lEl.textContent !== target.l) lEl.textContent = target.l;
      if (cEl.textContent !== target.c) cEl.textContent = target.c;
    }

    build();

    if (RM.matches) {                                    // final state, no scrubbing
      draw(5000); nEl.textContent = '5,000'; lEl.textContent = 'Students';
      cEl.textContent = STEPS[STEPS.length - 1].c;
      return;
    }

    if (HAS) {
      ST.create({
        trigger: '.scale', start: 'top top', end: '+=320%',
        pin: pin, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: function (self) { render(self.progress); },
        onRefreshInit: build
      });
      // Give the section the scroll length the pin needs.
      document.querySelector('.scale').style.height = '420svh';
    } else {
      // No GSAP: same story, driven by the section's own scroll position.
      document.querySelector('.scale').style.height = '420svh';
      pin.style.position = 'sticky'; pin.style.top = '0';
      var sec = document.querySelector('.scale'), tick = false;
      function upd() {
        if (tick) return; tick = true;
        requestAnimationFrame(function () {
          var r = sec.getBoundingClientRect();
          var p = -r.top / Math.max(1, r.height - window.innerHeight);
          render(Math.max(0, Math.min(1, p))); tick = false;
        });
      }
      window.addEventListener('scroll', upd, { passive: true });
      upd();
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { build(); draw(shown || 1); if (HAS) ST.refresh(); }, 200);
    });
  }

  /* ======================================================================
     1b · Hero stage lighting — beams and haze behind the title card
     ====================================================================== */

  function stage() {
    var cv = document.getElementById('stage');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), W, H, raf = null, vis = true, t0 = null;

    // Angle is what sells a stage light. Each shaft leaves a point above the
    // frame and lands somewhere else along the floor.
    var beams = [
      { x: .58, land: .46, w: .018, c: '216,117,61',  ph: 0.0, k: 0.72 },
      { x: .62, land: .64, w: .013, c: '181,185,174', ph: 1.7, k: 0.40 },
      { x: .60, land: .80, w: .020, c: '240,154,91',  ph: 3.1, k: 0.62 },
      { x: .64, land: .96, w: .014, c: '135,145,135', ph: 4.6, k: 0.36 }
    ];

    var heroRow = [];
    function buildRow() {
      heroRow = [];
      var n = Math.max(22, Math.round(W / 30));
      for (var i = 0; i < n; i++) {
        var t = Math.pow(Math.random(), 0.7);
        heroRow.push({
          // Overlap, rather than a evenly spaced rank of clip-art.
          x: (i + (Math.random() - .5) * 1.5) * (W / n) + W / (n * 2),
          y: H * (0.865 + t * 0.115),    // the nearest are cropped by the frame
          s: 0.95 + t * 2.1,
          up: Math.random() < 0.38,
          ph: Math.random() * 6.283,
          a: 0.70 + t * 0.30
        });
      }
      heroRow.sort(function (a, b) { return a.s - b.s; });
    }

    // Same proportions as the scale silhouettes, drawn as one flat mass.
    function heroFigure(p, bob) {
      var h = 36 * p.s, w = h * 0.185;
      ctx.save();
      ctx.translate(p.x, p.y + bob);
      ctx.globalAlpha = p.a;
      ctx.fillStyle = '#241D30';
      ctx.strokeStyle = '#241D30';
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(h * 0.085, .8);
      ctx.beginPath();
      ctx.moveTo(-w * .22, -h * .46); ctx.lineTo(-w * .70, -h * .02);
      ctx.moveTo( w * .22, -h * .46); ctx.lineTo( w * .70, -h * .02);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-w * .62, -h * .76); ctx.lineTo(w * .62, -h * .76);
      ctx.lineTo(w * .36, -h * .42); ctx.lineTo(-w * .36, -h * .42);
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = Math.max(h * 0.068, .7);
      ctx.beginPath();
      if (p.up) {
        ctx.moveTo(-w * .52, -h * .73); ctx.lineTo(-w * 1.05, -h * 1.12);
        ctx.moveTo( w * .52, -h * .73); ctx.lineTo( w * 1.05, -h * 1.12);
      } else {
        ctx.moveTo(-w * .52, -h * .72); ctx.lineTo(-w * 1.35, -h * .52);
        ctx.moveTo( w * .52, -h * .72); ctx.lineTo( w * 1.35, -h * .52);
      }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -h * .87, h * .105, 0, 6.2832); ctx.fill();
      ctx.restore();
    }

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      heroRow = [];
    }

    function paint(el) {
      ctx.clearRect(0, 0, W, H);

      // Haze only near the source. Spread across the whole frame it stops
      // being atmosphere and just turns the blacks brown.
      var haze = ctx.createRadialGradient(W * .56, -H * .06, 0, W * .56, -H * .06, H * .40);
      haze.addColorStop(0, 'rgba(216,117,61,.11)');
      haze.addColorStop(.55, 'rgba(135,145,135,.018)');
      haze.addColorStop(1, 'rgba(216,117,61,0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W, H);

      var canBlur = 'filter' in ctx;
      if (canBlur) ctx.filter = 'blur(' + Math.round(Math.max(W, H) * 0.011) + 'px)';
      ctx.globalCompositeOperation = 'lighter';

      for (var i = 0; i < beams.length; i++) {
        var b = beams[i];
        var sway = Math.sin(el * 0.22 + b.ph) * W * 0.035;
        var ox = W * b.x, oy = -H * 0.12;
        var lx = W * b.land + sway;            // where it lands on the floor
        var src = W * b.w * 0.5;
        var foot = W * b.w * 1.9;
        var peak = (0.46 + 0.16 * (0.5 + 0.5 * Math.sin(el * 0.36 + b.ph))) * b.k * (canBlur ? 1 : .5);

        var g = ctx.createLinearGradient(ox, oy, lx, H);
        g.addColorStop(0,   'rgba(' + b.c + ',' + peak.toFixed(3) + ')');
        g.addColorStop(.22, 'rgba(' + b.c + ',' + (peak * .52).toFixed(3) + ')');
        g.addColorStop(.60, 'rgba(' + b.c + ',' + (peak * .17).toFixed(3) + ')');
        g.addColorStop(1,   'rgba(' + b.c + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ox - src, oy);
        ctx.lineTo(ox + src, oy);
        ctx.lineTo(lx + foot, H);
        ctx.lineTo(lx - foot, H);
        ctx.closePath();
        ctx.fill();
      }

      if (canBlur) ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';

      // A rank of silhouettes along the foot of the frame — the crowd is the
      // subject of this page, so it belongs in the opening image.
      if (!heroRow.length) buildRow();
      for (var k = 0; k < heroRow.length; k++) {
        var f = heroRow[k];
        heroFigure(f, Math.sin(el * 1.25 + f.ph) * (2.0 * f.s));
      }
    }

    function loop(now) {
      if (t0 === null) t0 = now;
      paint((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (raf === null) { t0 = null; raf = requestAnimationFrame(loop); } }
    function stop()  { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    size();
    if (RM.matches) { paint(0); }
    else { start(); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        vis = e[0].isIntersecting;
        if (RM.matches) return;
        vis ? start() : stop();
      }, { threshold: 0 }).observe(cv);
    }
    document.addEventListener('visibilitychange', function () {
      if (RM.matches) return;
      (document.hidden || !vis) ? stop() : start();
    });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); if (RM.matches) paint(0); }, 200);
    });
  }

  /* ======================================================================
     Reveals, stage bars, timeline spine
     ====================================================================== */

  // Active navigation state — copper marks where you actually are.
  function activeNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    var targets = links.map(function (a) {
      return { a: a, el: document.querySelector(a.getAttribute('href')) };
    }).filter(function (t) { return t.el; });
    if (!targets.length) return;
    var tick = false;
    function upd() {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        var mid = window.innerHeight * 0.4, best = null;
        targets.forEach(function (t) {
          var r = t.el.getBoundingClientRect();
          if (r.top <= mid && r.bottom > mid) best = t;
        });
        targets.forEach(function (t) { t.a.classList.toggle('here', t === best); });
        tick = false;
      });
    }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  function reveals() {
    var items = document.querySelectorAll('.rv');

    // Safety net. A .rv element sits at opacity 0 until something reveals it,
    // so a missed observer callback is not a lost animation — it is lost
    // content. This sweep force-reveals anything at or above the fold on
    // scroll and on load, whichever path is driving the nice staggered
    // version, and costs nothing once everything is shown.
    var pending = Array.prototype.slice.call(items);
    function sweep() {
      if (!pending.length) return;
      var limit = window.innerHeight * 0.96;
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        if (el.getBoundingClientRect().top > limit) return true;
        el.classList.add('in');
        return false;
      });
    }
    var swept = false;
    window.addEventListener('scroll', function () {
      if (swept) return;
      swept = true;
      requestAnimationFrame(function () { sweep(); swept = false; });
    }, { passive: true });
    window.addEventListener('resize', sweep);
    window.addEventListener('load', sweep);
    setTimeout(sweep, 400);

    var bars  = document.querySelectorAll('.stg');
    var evs   = document.querySelectorAll('.ev');

    if (RM.matches) {
      items.forEach(function (el) { el.classList.add('in'); });
      evs.forEach(function (el) { el.classList.add('lit'); });
      bars.forEach(function (el) { el.classList.add('lit'); });
      var runRM = document.getElementById('stagesRun');
      if (runRM) runRM.style.width = '100%';
      return;
    }

    if (HAS) {
      items.forEach(function (el) {
        ST.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: function () { el.classList.add('in'); }
        });
      });
      var run = document.getElementById('stagesRun');
      var stagesEl = document.querySelector('.stages');
      if (run && stagesEl) {
        ST.create({
          trigger: stagesEl, start: 'top 78%', end: 'bottom 62%', scrub: .5,
          onUpdate: function (self) { run.style.width = (self.progress * 100) + '%'; }
        });
      }
      bars.forEach(function (el) {
        ST.create({ trigger: el, start: 'top 76%', once: true,
          onEnter: function () { el.classList.add('lit'); } });
      });
      evs.forEach(function (el) {
        ST.create({ trigger: el, start: 'top 78%', end: 'bottom 40%',
          onToggle: function (s) { el.classList.toggle('lit', s.isActive); } });
      });
      var fill = document.getElementById('tlFill'), tl = document.getElementById('tl');
      if (fill && tl) {
        ST.create({ trigger: tl, start: 'top 62%', end: 'bottom 72%', scrub: .4,
          onUpdate: function (s) { fill.style.height = (s.progress * 100) + '%'; } });
      }
      return;
    }

    // ---- Fallback: IntersectionObserver + rAF, same choreography ----------
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      evs.forEach(function (el) { el.classList.add('lit'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        var b = e.target.querySelector('.stg__bar');
        if (b) b.style.width = '100%';
        io.unobserve(e.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });

    var litStages = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); litStages.unobserve(e.target); } });
    }, { threshold: .3 });
    bars.forEach(function (el) { litStages.observe(el); });

    var run2 = document.getElementById('stagesRun');
    var stages2 = document.querySelector('.stages');
    if (run2 && stages2) {
      var rt2 = false;
      window.addEventListener('scroll', function () {
        if (rt2) return; rt2 = true;
        requestAnimationFrame(function () {
          var r = stages2.getBoundingClientRect();
          var p = (window.innerHeight * .78 - r.top) / Math.max(r.height, 1);
          run2.style.width = Math.max(0, Math.min(1, p)) * 100 + '%';
          rt2 = false;
        });
      }, { passive: true });
    }

    var lit = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('lit', e.isIntersecting); });
    }, { threshold: .35 });
    evs.forEach(function (el) { lit.observe(el); });

    var fill2 = document.getElementById('tlFill'), tl2 = document.getElementById('tl'), tk = false;
    if (fill2 && tl2) {
      window.addEventListener('scroll', function () {
        if (tk) return; tk = true;
        requestAnimationFrame(function () {
          var r = tl2.getBoundingClientRect();
          var p = (window.innerHeight * .58 - r.top) / r.height;
          fill2.style.height = Math.max(0, Math.min(1, p)) * 100 + '%';
          tk = false;
        });
      }, { passive: true });
    }
  }

  /* ======================================================================
     6 · Venue map
     ====================================================================== */

  var ZONES = [
    { id: 'A1', n: 'Front left',   rows: '1–8',   cap: 420, near: 'First aid · Water point 1' },
    { id: 'A2', n: 'Front centre', rows: '1–8',   cap: 480, near: 'Ambulance bay · Water point 2' },
    { id: 'A3', n: 'Front right',  rows: '1–8',   cap: 420, near: 'First aid · Water point 3' },
    { id: 'A4', n: 'Front wing',   rows: '1–8',   cap: 380, near: 'Exit route A · Washrooms' },
    { id: 'B1', n: 'Mid left',     rows: '9–16',  cap: 440, near: 'Water point 4 · Exit route B' },
    { id: 'B2', n: 'Mid centre',   rows: '9–16',  cap: 500, near: 'Sub-stage 2 · First aid' },
    { id: 'B3', n: 'Mid right',    rows: '9–16',  cap: 440, near: 'Sub-stage 3 · Water point 5' },
    { id: 'B4', n: 'Mid wing',     rows: '9–16',  cap: 380, near: 'Exit route C · Washrooms' },
    { id: 'C1', n: 'Rear left',    rows: '17–24', cap: 400, near: 'Bus parking 1 · Water point 6' },
    { id: 'C2', n: 'Rear centre',  rows: '17–24', cap: 460, near: 'Coordination point · First aid' },
    { id: 'C3', n: 'Rear right',   rows: '17–24', cap: 400, near: 'Bus parking 2 · Water point 7' },
    { id: 'C4', n: 'Rear wing',    rows: '17–24', cap: 360, near: 'Exit route D · Washrooms' }
  ];

  function venue() {
    var host = document.getElementById('zones'), card = document.getElementById('zinfo');
    if (!host || !card) return;

    ZONES.forEach(function (z, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'zone';
      b.setAttribute('aria-label', 'Zone ' + z.id + ', ' + z.n + ', about ' + z.cap + ' students');
      var dots = '';
      for (var d = 0; d < 27; d++) dots += '<i></i>';
      b.innerHTML = '<b>' + z.id + '</b><span>' + z.n + '</span>' +
                    '<span class="dots" aria-hidden="true">' + dots + '</span>';
      ['click', 'mouseenter', 'focus'].forEach(function (ev) {
        b.addEventListener(ev, function () { pick(i); });
      });
      host.appendChild(b);
    });

    function pick(i) {
      var z = ZONES[i];
      Array.prototype.forEach.call(host.children, function (el, n) { el.classList.toggle('on', n === i); });
      card.innerHTML =
        '<div class="zinfo__h"><span class="zinfo__chip">' + z.id + '</span>' +
        '<span><h3>' + z.n + '</h3><span class="zinfo__s">Rows ' + z.rows + ' · facing main stage</span></span></div>' +
        '<p>Schools in this zone stand together behind their own flag marker. Teachers stay inside ' +
        'the block, and a trainer is assigned per row group so the counts reach the back rows.</p>' +
        '<dl><dt>Approx. capacity</dt><dt>Nearest points</dt>' +
        '<dd class="big">' + z.cap + '</dd><dd>' + z.near + '</dd></dl>';
    }
    pick(1);
  }

  /* ======================================================================
     12 · Enquiry form — WhatsApp handoff, email fallback
     ====================================================================== */

  function form() {
    var f = document.getElementById('regform');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var c = window.EVENT_CONFIG || {};
      var g = function (n) { return (f.elements[n] && f.elements[n].value || '').trim(); };
      var body = [
        'School participation — 31 October record attempt', '',
        'School: ' + g('school'),
        'Contact: ' + g('person'),
        'Phone: ' + g('phone'),
        'Email: ' + (g('email') || '—'),
        'Approx. students: ' + g('count'),
        'Area: ' + (g('area') || '—'), '',
        'Notes: ' + (g('note') || '—')
      ].join('\n');

      if (c.whatsapp) {
        window.open('https://wa.me/' + c.whatsapp.replace(/\D/g, '') + '?text=' +
                    encodeURIComponent(body), '_blank', 'noopener');
      } else if (c.email) {
        window.location.href = 'mailto:' + c.email + '?subject=' +
          encodeURIComponent('School participation enquiry') + '&body=' + encodeURIComponent(body);
      } else {
        alert('The coordinator contact has not been added to this site yet.\n\n' +
              'Add a WhatsApp number or an email address in assets/js/config.js to make this form send.');
      }
    });
  }

  /* ====================================================================== */

  function boot() {
    grain();
    applyConfig();
    header();
    activeNav();
    stage();
    heroIn();
    crowd();
    reveals();
    venue();
    form();
    if (HAS) ST.refresh();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

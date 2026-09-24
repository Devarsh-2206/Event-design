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
  var GOLD = ['#6B4F18', '#8A6620', '#8A6620', '#B08A36', '#B08A36', '#D4A94F', '#E8C87A'];


  // Viewport height, clamped. Used anywhere a length is derived from the
  // viewport, because an embedded page can report an enormous one.
  function vh() { return Math.max(360, Math.min(window.innerHeight, 1000)); }

  // True when the page has no scroll of its own — embedded in a full-height
  // iframe, for example. Scroll-driven effects cannot work in that case.
  function cannotScroll() {
    return document.documentElement.scrollHeight <= window.innerHeight + 4;
  }

  /* ======================================================================
     Config — one file the client edits, applied over the HTML placeholders
     ====================================================================== */

  function applyConfig() {
    var c = window.EVENT_CONFIG || {};
    var wa = (c.whatsapp || '').replace(/\D/g, '');
    function waUrl(msg) {
      return wa ? 'https://wa.me/' + wa + (msg ? '?text=' + encodeURIComponent(msg) : '') : '';
    }
    var d = {
      telLink:    c.phone ? 'tel:' + c.phone.replace(/[^\d+]/g, '') : '',
      mailtoLink: c.email ? 'mailto:' + c.email + '?subject=' +
                  encodeURIComponent('School participation — 31 October record attempt') : '',
      phoneDisplay: c.phone, emailDisplay: c.email,
      telAltLink: c.phoneAlt ? 'tel:' + c.phoneAlt.replace(/[^\d+]/g, '') : '',
      phoneAltDisplay: c.phoneAlt,
      instagramLink: c.instagram ? 'https://instagram.com/' + c.instagram.replace(/^@/, '') : '',
      instagramDisplay: c.instagram ? '@' + c.instagram.replace(/^@/, '') : '',
      officeAddress: c.officeAddress,
      registrationLink: c.registrationLink,
      // General enquiry.
      waLink: waUrl('Hi, I would like to ask about the 31 October record attempt for our school.'),
      // Step 3: the message already names what is attached, so a coordinator
      // can match a receipt to a school without asking.
      waReceiptLink: waUrl(
        'Hi, sending our payment receipt for the 31 October record attempt.\n\n' +
        'School: \nNumber of students: \n\n(Please attach the receipt or screenshot to this message.)')
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
          c: GOLD[(Math.random() * GOLD.length) | 0],
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
      g.addColorStop(0, 'rgba(212,169,79,.14)');
      g.addColorStop(1, 'rgba(212,169,79,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      var scrim = ctx.createRadialGradient(W / 2, H * 0.33, 0, W / 2, H * 0.33, Math.max(W, H) * 0.42);
      scrim.addColorStop(0, 'rgba(7,6,10,.80)');
      scrim.addColorStop(1, 'rgba(7,6,10,0)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      var step = count <= 1 ? 1 : Math.max(1, Math.floor(people.length / count));
      var drawn = 0;
      for (var i = 0; i < people.length && drawn < count; i += step) {
        // One figure, centre stage, when the count is 1.
        if (count === 1) {
          figure({ x: W / 2, y: H * 0.88, s: 3.4, up: true, lean: 0, c: '#E8C87A', a: .95 });
          drawn = 1; break;
        }
        figure(people[i]); drawn++;
      }
      ctx.globalAlpha = 1;
    }

    function fmt(n) { return n.toLocaleString('en-IN'); }

    // Count reaches 5,000 by COUNT_DONE, holds just long enough to register,
    // then the frame dissolves. Push this much past 0.9 and 5,000 flashes by
    // unread; pull it much below 0.85 and the pin feels stuck, because every
    // remaining scroll of the pin happens with nothing on screen changing.
    var COUNT_DONE = 0.88;

    function render(p) {                                 // p = 0..1 scroll progress
      p = Math.min(p / COUNT_DONE, 1);
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

    var sec = document.querySelector('.scale');

    // No scroll of our own means no scrubbing is possible: show the finished
    // formation rather than an empty pinned frame.
    if (cannotScroll()) {
      sec.style.height = '';
      pin.style.height = vh() + 'px';
      draw(5000); nEl.textContent = '5,000'; lEl.textContent = 'Students';
      cEl.textContent = STEPS[STEPS.length - 1].c;
      return;
    }

    // How far you scroll while the frame is pinned. This is the whole feel of
    // the section: too short and the count is a blur, too long and the page
    // stops answering the wheel. Just over two screens, with the count filling
    // the first 88% of it, is the most scrolling this earns.
    function pinLen() { return Math.round(vh() * 2.2); }

    // The frame fades in as it arrives and dissolves as it leaves. Without the
    // first, the readout rides up over the section above while that section is
    // still on screen; without the second, 5,000 slides away as a solid block
    // instead of handing off to what follows.
    var fadeIn = 0, fadeOut = 1;
    function applyFade() {
      pin.style.opacity = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));
    }
    // Exit: the frame dissolves as it scrolls away, over exactly its own
    // height, so 5,000 hands off to the next section instead of sliding off
    // as a solid block. Driven by geometry rather than pin progress, because
    // the fade has to happen AFTER the pin releases.
    function exitFromRect() {
      var r = sec.getBoundingClientRect();
      var view = window.innerHeight;
      return Math.max(0, Math.min(1, r.bottom / view));
    }

    // Entry progress from geometry, so the frame is correct on first paint and
    // any time a trigger has not fired yet.
    function entryFromRect() {
      var r = sec.getBoundingClientRect();
      var gate = window.innerHeight * 0.40;
      return Math.max(0, Math.min(1, (gate - r.top) / gate));
    }

    if (HAS) {
      // Entry: stays invisible until the section has the screen to itself.
      ST.create({
        trigger: sec, start: 'top 40%', end: 'top top', scrub: true,
        onUpdate: function (self) { fadeIn = self.progress; applyFade(); }
      });

      ST.create({
        trigger: sec, start: 'top top', end: '+=' + pinLen(),
        pin: pin, scrub: 0.35, invalidateOnRefresh: true,
        onUpdate: function (self) { render(self.progress); },
        onRefreshInit: build
      });

      // pinSpacing inserts the scroll length itself; the trailing stretch it
      // adds is exactly where the exit fade happens.
      sec.style.height = '';
      pin.style.height = vh() + 'px';

      function sync() { fadeIn = entryFromRect(); fadeOut = exitFromRect(); applyFade(); }
      sync();
      var ft = false;
      window.addEventListener('scroll', function () {
        if (ft) return; ft = true;
        requestAnimationFrame(function () { sync(); ft = false; });
      }, { passive: true });
      window.addEventListener('resize', sync);
    } else {
      // No GSAP: same story, driven by the section's own scroll position.
      sec.style.height = (pinLen() + vh()) + 'px';
      pin.style.height = vh() + 'px';
      pin.style.position = 'sticky'; pin.style.top = '0';
      var tick = false;
      function upd() {
        if (tick) return; tick = true;
        requestAnimationFrame(function () {
          var r = sec.getBoundingClientRect();
          var view = window.innerHeight;
          var p = Math.max(0, Math.min(1, -r.top / Math.max(1, sec.offsetHeight - view)));
          render(p);
          fadeIn = entryFromRect();
          fadeOut = exitFromRect();
          applyFade();
          tick = false;
        });
      }
      window.addEventListener('scroll', upd, { passive: true });
      upd();
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (!cannotScroll()) {
          if (!HAS) sec.style.height = (pinLen() + vh()) + 'px';
          pin.style.height = vh() + 'px';
        }
        build(); draw(shown || 1); if (HAS) ST.refresh();
      }, 200);
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
      { x: .46, land: .06, w: .030, c: '212,169,79',  ph: 0.0, k: 1.00 },
      { x: .50, land: .27, w: .022, c: '246,227,172', ph: 1.7, k: 0.80 },
      { x: .53, land: .52, w: .034, c: '232,200,122', ph: 3.1, k: 0.95 },
      { x: .49, land: .78, w: .026, c: '212,169,79',  ph: 4.6, k: 0.85 },
      { x: .52, land: .98, w: .020, c: '176,138,54',  ph: 5.4, k: 0.70 }
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
          a: 0.62 + t * 0.36
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
      ctx.fillStyle = '#000105';
      ctx.strokeStyle = '#000105';
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
      var haze = ctx.createRadialGradient(W * .5, -H * .08, 0, W * .5, -H * .08, H * .62);
      haze.addColorStop(0, 'rgba(212,169,79,.16)');
      haze.addColorStop(.6, 'rgba(212,169,79,.035)');
      haze.addColorStop(1, 'rgba(212,169,79,0)');
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
        var foot = W * b.w * 2.3;
        var peak = (0.40 + 0.16 * (0.5 + 0.5 * Math.sin(el * 0.36 + b.ph))) * b.k * (canBlur ? 1 : .5);

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
      return;
    }

    // Base layer: always on, independent of any scrolling.
    if ('IntersectionObserver' in window) {
      var base = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          base.unobserve(e.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
      items.forEach(function (el) { base.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('in'); });
    }

    if (HAS) {
      bars.forEach(function (el, i) {
        var bar = el.querySelector('.stg__bar');
        if (!bar) return;
        ST.create({
          trigger: el, start: 'top 82%', once: true,
          onEnter: function () {
            GS.to(bar, { width: '100%', duration: 1.1, ease: 'expo.out', delay: i * 0.09 });
          }
        });
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
    bars.forEach(function (el) { io.observe(el); });

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
    stage();
    heroIn();
    crowd();
    reveals();
    form();
    if (HAS) ST.refresh();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

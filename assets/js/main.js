/* ==========================================================================
   TYSUN — record attempt landing page
   No dependencies. No build step. Everything degrades to a readable page
   if JavaScript is unavailable.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ======================================================================
     1. Apply config.js over the placeholder copy already in the HTML
     ====================================================================== */

  function applyConfig() {
    var c = window.EVENT_CONFIG || {};

    // Derived links, built once so the markup stays free of logic.
    var derived = {
      venueCity: c.venueCity,
      telLink:   c.phone ? 'tel:' + c.phone.replace(/[^\d+]/g, '') : '',
      mailtoLink: c.email
        ? 'mailto:' + c.email + '?subject=' + encodeURIComponent('School participation — record attempt')
        : '',
      phoneDisplay: c.phone,
      emailDisplay: c.email,
      paymentLink:  c.paymentLink,
      upiLink: (c.upiId && c.price)
        ? 'upi://pay?pa=' + encodeURIComponent(c.upiId) +
          '&pn=' + encodeURIComponent(c.upiName || 'SNK Dance Company') +
          '&cu=INR'
        : (c.upiId ? 'upi://pay?pa=' + encodeURIComponent(c.upiId) +
                     '&pn=' + encodeURIComponent(c.upiName || 'SNK Dance Company') + '&cu=INR' : '')
    };

    function value(key) {
      if (derived[key] !== undefined && derived[key] !== null && derived[key] !== '') return derived[key];
      if (c[key] !== undefined && c[key] !== null && c[key] !== '') return c[key];
      return null;
    }

    // Text slots
    Array.prototype.forEach.call(document.querySelectorAll('[data-cfg]'), function (el) {
      var v = value(el.getAttribute('data-cfg'));
      if (v === null) return;
      // Preserve a nested <small> (used in the hero fact strip).
      var small = el.querySelector('small');
      el.textContent = v;
      if (small) el.appendChild(small);
    });

    // Href slots — if there is no real link, leave the button pointing at
    // the contact section rather than showing a dead control.
    Array.prototype.forEach.call(document.querySelectorAll('[data-cfg-href]'), function (el) {
      var v = value(el.getAttribute('data-cfg-href'));
      if (v === null) return;
      el.setAttribute('href', v);
      if (/^https?:/i.test(v)) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    });

    // Hide the UPI button entirely when no UPI ID is configured.
    var upi = document.getElementById('upibtn');
    if (upi && !c.upiId) upi.hidden = true;

    var yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ======================================================================
     2. Header — solid background once the hero is behind us
     ====================================================================== */

  function header() {
    var hdr = document.getElementById('hdr');
    var nav = document.getElementById('nav');
    var burger = document.getElementById('burger');
    if (!hdr) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        hdr.classList.toggle('is-stuck', window.scrollY > 40);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!burger || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        burger.focus();
      }
    });
  }

  /* ======================================================================
     3. Scroll reveal + counters
     ====================================================================== */

  function reveals() {
    var items = document.querySelectorAll('.rv, .stat, .step, .ev');
    if (!('IntersectionObserver' in window) || REDUCED.matches) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); });
      Array.prototype.forEach.call(document.querySelectorAll('.count'), function (el) {
        el.textContent = format(+el.dataset.to, el.dataset.fmt);
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        var counters = entry.target.querySelectorAll('.count');
        Array.prototype.forEach.call(counters, countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  function format(n, fmt) {
    return fmt === 'in' ? n.toLocaleString('en-IN') : String(n);
  }

  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var to = +el.dataset.to || 0;
    var fmt = el.dataset.fmt;
    var dur = 1400;
    var t0 = null;

    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      // easeOutExpo — fast start, long settle, reads as a tally landing
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = format(Math.round(to * e), fmt);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ======================================================================
     4. Timeline progress line — fills as you read the run of show
     ====================================================================== */

  function timeline() {
    var tl = document.querySelector('.tl');
    var bar = document.getElementById('tlprog');
    if (!tl || !bar || REDUCED.matches) {
      if (bar) bar.style.height = '100%';
      return;
    }
    var ticking = false;
    function update() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var r = tl.getBoundingClientRect();
        var mid = window.innerHeight * 0.55;
        var p = (mid - r.top) / r.height;
        bar.style.height = Math.max(0, Math.min(1, p)) * 100 + '%';
        ticking = false;
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ======================================================================
     5. Ticker — duplicate the group so the loop is seamless
     ====================================================================== */

  function ticker() {
    var track = document.getElementById('ticker');
    if (!track) return;
    var grp = track.firstElementChild;
    if (grp) track.appendChild(grp.cloneNode(true));
  }

  /* ======================================================================
     6. Formation ground plan — the signature element
     ====================================================================== */

  var ZONE_COLOURS = ['#FFB01F', '#FF3D5A', '#17C3B2', '#A874FF'];

  var ZONES = [
    { id: 'A1', name: 'Front left',   rows: '1–8',   cap: '420', near: 'First aid · Water point 1' },
    { id: 'A2', name: 'Front centre', rows: '1–8',   cap: '480', near: 'Ambulance bay · Water point 2' },
    { id: 'A3', name: 'Front right',  rows: '1–8',   cap: '420', near: 'First aid · Water point 3' },
    { id: 'A4', name: 'Front wing',   rows: '1–8',   cap: '380', near: 'Exit route A · Washrooms' },
    { id: 'B1', name: 'Mid left',     rows: '9–16',  cap: '440', near: 'Water point 4 · Exit route B' },
    { id: 'B2', name: 'Mid centre',   rows: '9–16',  cap: '500', near: 'Sub-stage 2 · First aid' },
    { id: 'B3', name: 'Mid right',    rows: '9–16',  cap: '440', near: 'Sub-stage 3 · Water point 5' },
    { id: 'B4', name: 'Mid wing',     rows: '9–16',  cap: '380', near: 'Exit route C · Washrooms' },
    { id: 'C1', name: 'Rear left',    rows: '17–24', cap: '400', near: 'Bus parking 1 · Water point 6' },
    { id: 'C2', name: 'Rear centre',  rows: '17–24', cap: '460', near: 'Coordination point · First aid' },
    { id: 'C3', name: 'Rear right',   rows: '17–24', cap: '400', near: 'Bus parking 2 · Water point 7' },
    { id: 'C4', name: 'Rear wing',    rows: '17–24', cap: '360', near: 'Exit route D · Washrooms' }
  ];

  function formation() {
    var host = document.getElementById('zones');
    var card = document.getElementById('zonecard');
    if (!host || !card) return;

    ZONES.forEach(function (z, i) {
      var colour = ZONE_COLOURS[i % ZONE_COLOURS.length];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'zone';
      b.style.setProperty('--zc', colour);
      b.setAttribute('aria-label', 'Zone ' + z.id + ', ' + z.name + ', about ' + z.cap + ' students');

      var dots = '';
      for (var d = 0; d < 27; d++) dots += "<i></i>";

      b.innerHTML =
        '<span class="zone__id">' + z.id + '</span>' +
        '<span class="zone__n">' + z.name + '</span>' +
        '<span class="zone__dots" aria-hidden="true">' + dots + '</span>';

      b.addEventListener('click', function () { select(i); });
      b.addEventListener('mouseenter', function () { select(i); });
      b.addEventListener('focus', function () { select(i); });
      host.appendChild(b);
    });

    function select(i) {
      var z = ZONES[i];
      var colour = ZONE_COLOURS[i % ZONE_COLOURS.length];

      Array.prototype.forEach.call(host.children, function (el, n) {
        el.classList.toggle('is-on', n === i);
      });

      card.style.setProperty('--zc', colour);
      card.innerHTML =
        '<div class="zonecard__hd">' +
          '<span class="zonecard__chip">' + z.id + '</span>' +
          '<span><h3>' + z.name + '</h3>' +
          '<span class="zonecard__sub">Rows ' + z.rows + ' · facing main stage</span></span>' +
        '</div>' +
        '<p>Schools allocated to this zone stand together behind their own flag marker. ' +
        'Teachers stay inside the block, and a trainer is assigned per row group so the ' +
        'counts reach the back rows.</p>' +
        '<dl>' +
          '<dt>Approx. capacity</dt><dt>Nearest points</dt>' +
          '<dd>' + z.cap + '</dd>' +
          '<dd style="font-family:var(--body);font-size:.88rem;letter-spacing:0;line-height:1.5;color:var(--fg-dim)">' + z.near + '</dd>' +
        '</dl>';
    }

    select(1); // open on the front-centre zone
  }

  /* ======================================================================
     7. Hero formation field — ~1,100 dots standing in for the ground
     ====================================================================== */

  function field() {
    var cv = document.getElementById('field');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');

    var dots = [];
    var w = 0, h = 0, dpr = 1;
    var t0 = null;
    var raf = null;
    var visible = true;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Grid sized so the field reads as a crowd, not a pattern, at any width.
      var gap = w < 640 ? 20 : w < 1100 ? 22 : 25;
      var cols = Math.ceil(w / gap) + 2;
      var rows = Math.ceil(h / gap) + 2;

      dots = [];
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          // Stagger alternate rows — people don't stand in a perfect lattice.
          var px = x * gap + (y % 2 ? gap / 2 : 0) - gap;
          var py = y * gap - gap;

          // Each dot belongs to a school block; blocks are irregular so the
          // colour clusters read as separate schools, not as a checkerboard.
          var block = Math.floor(x / (4 + (y % 3))) + Math.floor(y / 5) * 3;
          var colour = ZONE_COLOURS[Math.abs(block) % ZONE_COLOURS.length];

          // Distance from the stage (top centre) drives the wave and the fade.
          var dx = (px - w / 2) / w;
          var dy = py / h;
          var dist = Math.sqrt(dx * dx * 1.6 + dy * dy);

          dots.push({
            x: px, y: py,
            c: colour,
            dist: dist,
            // Depth cue: the far rows are smaller and dimmer.
            r: 1.15 + (1 - dy) * 1.15,
            a: 0.16 + (1 - dy) * 0.34,
            seed: Math.random() * 6.283
          });
        }
      }
    }

    function draw(now) {
      if (t0 === null) t0 = now;
      var el = (now - t0) / 1000;

      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];

        // Entrance: blocks light up outward from the stage.
        var app = Math.min(Math.max((el - d.dist * 1.15) / 0.9, 0), 1);
        if (app <= 0) continue;

        // A slow pulse travelling from the stage outward — the ground
        // breathing in unison, which is what 5,000 people in time look like.
        var wave = Math.sin(el * 1.5 - d.dist * 5.5 + d.seed * 0.25);
        var lift = 0.5 + 0.5 * wave;

        ctx.globalAlpha = d.a * app * (0.55 + lift * 0.65);
        ctx.fillStyle = d.c;
        ctx.beginPath();
        ctx.arc(d.x, d.y - lift * 1.6, d.r * (0.82 + lift * 0.3), 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }

    function still() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        ctx.globalAlpha = d.a;
        ctx.fillStyle = d.c;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function start() {
      if (raf !== null) return;
      t0 = null;
      raf = requestAnimationFrame(draw);
    }
    function stop() {
      if (raf === null) return;
      cancelAnimationFrame(raf);
      raf = null;
    }

    function init() {
      build();
      if (REDUCED.matches) { stop(); still(); return; }
      start();
    }

    // Don't burn frames on a hero that has scrolled away.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (REDUCED.matches) return;
        visible ? start() : stop();
      }, { threshold: 0 }).observe(cv);
    }
    document.addEventListener('visibilitychange', function () {
      if (REDUCED.matches) return;
      (document.hidden || !visible) ? stop() : start();
    });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var was = raf !== null;
        stop();
        build();
        if (REDUCED.matches) still();
        else if (was || visible) start();
      }, 180);
    });

    REDUCED.addEventListener
      ? REDUCED.addEventListener('change', init)
      : REDUCED.addListener && REDUCED.addListener(init);

    init();
  }

  /* ======================================================================
     8. Enquiry form — hands off to WhatsApp, falls back to email
     ====================================================================== */

  function form() {
    var f = document.getElementById('regform');
    if (!f) return;

    f.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!f.reportValidity()) return;

      var c = window.EVENT_CONFIG || {};
      var get = function (n) { return (f.elements[n] && f.elements[n].value || '').trim(); };

      var lines = [
        'School participation enquiry — record attempt',
        '',
        'School: ' + get('school'),
        'Contact: ' + get('person'),
        'Phone: ' + get('phone'),
        'Email: ' + (get('email') || '—'),
        'Approx. students: ' + get('count'),
        'Area: ' + (get('area') || '—'),
        '',
        'Notes: ' + (get('note') || '—')
      ];
      var body = lines.join('\n');

      if (c.whatsapp) {
        window.open(
          'https://wa.me/' + c.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(body),
          '_blank',
          'noopener'
        );
      } else if (c.email) {
        window.location.href =
          'mailto:' + c.email +
          '?subject=' + encodeURIComponent('School participation enquiry') +
          '&body=' + encodeURIComponent(body);
      } else {
        // Nothing configured yet — say so plainly rather than failing silently.
        alert(
          'The coordinator contact has not been added to this site yet.\n\n' +
          'Add a WhatsApp number or an email address in assets/js/config.js ' +
          'to make this form send.'
        );
      }
    });
  }

  /* ====================================================================== */

  function boot() {
    applyConfig();
    header();
    ticker();
    reveals();
    timeline();
    formation();
    field();
    form();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

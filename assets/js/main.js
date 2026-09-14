/* ==========================================================================
   5,000 Students · One Dance
   --------------------------------------------------------------------------
   No dependencies, no build step. Everything degrades to a fully readable
   page without JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------------- config */

  function applyConfig() {
    var c = window.EVENT_CONFIG || {};
    var d = {
      telLink:    c.phone ? 'tel:' + c.phone.replace(/[^\d+]/g, '') : '',
      mailtoLink: c.email ? 'mailto:' + c.email + '?subject=' +
                  encodeURIComponent('School participation — 31 October') : '',
      phoneDisplay: c.phone, emailDisplay: c.email
    };
    function val(k) { return d[k] || c[k] || null; }

    document.querySelectorAll('[data-cfg]').forEach(function (el) {
      var v = val(el.getAttribute('data-cfg'));
      if (!v) return;
      var small = el.querySelector('small');
      el.textContent = v;
      if (small) el.appendChild(small);
    });
    document.querySelectorAll('[data-cfg-href]').forEach(function (el) {
      var v = val(el.getAttribute('data-cfg-href'));
      if (!v) return;
      el.setAttribute('href', v);
      if (/^https?:/i.test(v)) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    });

    // Real guest photographs, once the client has licensed them and has
    // written permission. Until then the designed placeholder stands.
    document.querySelectorAll('img[data-photo]').forEach(function (img) {
      var src = c.photos && c.photos[img.getAttribute('data-photo')];
      if (src) { img.src = src; img.alt = ''; }
    });

    var yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------- header */

  function header() {
    var hdr = document.getElementById('hdr'),
        nav = document.getElementById('nav'),
        bg  = document.getElementById('burger');
    if (!hdr) return;
    var t = false;
    function onScroll() {
      if (t) return;
      t = true;
      requestAnimationFrame(function () { hdr.classList.toggle('stuck', window.scrollY > 20); t = false; });
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
        var mid = window.innerHeight * 0.35, best = null;
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

  /* ------------------------------------------------- audience switcher ----
     Three readers with three different worries. Proper tab semantics, so a
     screen reader and a keyboard both get the same thing a mouse does.      */

  function audience() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.who__tab'));
    if (!tabs.length) return;
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    function select(i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (panels[n]) panels[n].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') n = 0;
        else if (k === 'End') n = tabs.length - 1;
        if (n === null) return;
        e.preventDefault();
        select(n, true);
      });
    });
    select(0);

    // Deep link: /#who?as=parent lets a school send the right view to a parent.
    var m = /[?&]as=(parent|school|student)/.exec(location.search + location.hash);
    if (m) {
      var idx = ['parent', 'school', 'student'].indexOf(m[1]);
      if (idx > -1) select(idx);
    }
  }

  /* ----------------------------------------------------------- venue map */

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
      b.innerHTML = '<b>' + z.id + '</b><span>' + z.n + '</span>';
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
        '<span><h3>' + z.n + '</h3><p class="zinfo__s">Rows ' + z.rows + ' · facing the main stage</p></span></div>' +
        '<p>Schools in this zone stand together behind their own flag marker. Teachers stay inside ' +
        'the block, and a trainer is assigned per row group so the counts reach the back rows.</p>' +
        '<dl><dt>Holds about</dt><dt>Nearest points</dt>' +
        '<dd class="big">' + z.cap + '</dd><dd>' + z.near + '</dd></dl>';
    }
    pick(1);
  }

  /* -------------------------------------------------------------- counters */

  function counters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    function fmt(n, suffix) { return n.toLocaleString('en-IN') + (suffix || ''); }

    function run(el) {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      var to = +el.dataset.count || 0, suffix = el.dataset.suffix || '';
      if (to === 0) return;                       // "₹0" is literal, not a tally
      var t0 = null, dur = 1200;
      function frame(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = fmt(Math.round(to * e), suffix);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (RM.matches || !('IntersectionObserver' in window)) return;   // final text already in HTML
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: .5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------- reveals */

  function reveals() {
    var items = document.querySelectorAll('.rv');
    if (!items.length) return;

    // Safety net: .rv sits at opacity 0, so a missed callback is lost content,
    // not a lost animation. Anything at or above the fold is force-revealed.
    var pending = Array.prototype.slice.call(items);
    function sweep() {
      if (!pending.length) return;
      var limit = window.innerHeight * 0.95;
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        if (el.getBoundingClientRect().top > limit) return true;
        el.classList.add('in');
        return false;
      });
    }

    if (RM.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });

    var t = false;
    window.addEventListener('scroll', function () {
      if (t) return;
      t = true;
      requestAnimationFrame(function () { sweep(); t = false; });
    }, { passive: true });
    window.addEventListener('resize', sweep);
    window.addEventListener('load', sweep);
    setTimeout(sweep, 400);
  }


  /* ----------------------------------------------------------- motion ---- */

  /* The hero plays its load sequence once fonts have settled, so nothing
     re-flows mid-animation. If the font promise never resolves we start
     anyway rather than leaving the page blank. */
  function heroSequence() {
    var start = function () { document.body.classList.add('ready'); };
    if (RM.matches) { start(); return; }
    var fired = false;
    var go = function () { if (!fired) { fired = true; requestAnimationFrame(start); } };
    // Whichever comes first. The hero is at opacity 0 until this runs, so the
    // window has to stay short — a thumbnail or a link preview grabbed early
    // would otherwise catch an empty hero.
    if (document.fonts && document.fonts.status === 'loaded') go();
    else if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 300);
  }

  /* Reveal order. Each item gets its index within its own group, so a row of
     cards comes in one after another instead of as a slab. Capped so a long
     list never ends with a noticeable wait. */
  function stagger() {
    var groups = document.querySelectorAll('.who__grid, .what__grid, .count, .safe__grid, .steps, .guests, .plan');
    Array.prototype.forEach.call(groups, function (g) {
      var kids = g.querySelectorAll(':scope > .rv');
      Array.prototype.forEach.call(kids, function (el, i) {
        el.style.setProperty('--i', Math.min(i, 6));
      });
    });
  }

  /* FAQ. <details> cannot animate its own height, so drive it: opening sets
     the attribute then grows from zero, closing shrinks first and only then
     removes it, which keeps the element keyboard- and screen-reader correct
     the whole way through. */
  function accordion() {
    var items = document.querySelectorAll('.qa details');
    if (!items.length || RM.matches) return;

    Array.prototype.forEach.call(items, function (d) {
      var summary = d.querySelector('summary');
      var panel = d.querySelector('.a');
      if (!summary || !panel) return;
      var busy = false;

      function size() { return panel.scrollHeight + 'px'; }

      function animate(to, then) {
        busy = true;
        var a = panel.animate(
          { height: to === 'open' ? ['0px', size()] : [size(), '0px'],
            opacity: to === 'open' ? [0, 1] : [1, 0] },
          { duration: to === 'open' ? 320 : 240, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
        a.onfinish = a.oncancel = function () {
          panel.style.height = '';
          busy = false;
          if (then) then();
        };
      }

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (busy) return;
        if (d.open) {
          animate('close', function () { d.open = false; });
        } else {
          d.open = true;
          animate('open');
        }
      });
    });
  }

  /* The sticky bar stays out of the way until the hero's own button has
     scrolled past — showing it immediately would just duplicate the CTA
     already on screen. */
  function stickyBar() {
    var bar = document.querySelector('.sticky');
    var anchor = document.querySelector('.hero__cta');
    if (!bar || !anchor) return;
    if (!('IntersectionObserver' in window)) { bar.classList.add('up'); return; }
    new IntersectionObserver(function (es) {
      bar.classList.toggle('up', !es[0].isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(anchor);
  }

  /* ------------------------------------------------------------------ form */

  function form() {
    var f = document.getElementById('regform');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var c = window.EVENT_CONFIG || {};
      var g = function (n) { return (f.elements[n] && f.elements[n].value || '').trim(); };
      var body = [
        'School registration — 5,000 Students, One Dance (31 October)', '',
        'School: ' + g('school'),
        'Contact: ' + g('person'),
        'Phone: ' + g('phone'),
        'Approx. students: ' + g('count'), '',
        'Please call back to confirm details.'
      ].join('\n');

      if (c.whatsapp) {
        window.open('https://wa.me/' + c.whatsapp.replace(/\D/g, '') + '?text=' +
                    encodeURIComponent(body), '_blank', 'noopener');
      } else if (c.email) {
        window.location.href = 'mailto:' + c.email + '?subject=' +
          encodeURIComponent('School registration — 31 October') + '&body=' + encodeURIComponent(body);
      } else {
        alert('The coordinator contact has not been added to this site yet.\n\n' +
              'Add a WhatsApp number or email in assets/js/config.js to make this form send.');
      }
    });
  }

  /* ----------------------------------------------------------------- boot */

  function boot() {
    applyConfig();
    header();
    activeNav();
    audience();
    venue();
    stagger();          // before reveals, so delays are set when they fire
    counters();
    reveals();
    accordion();
    stickyBar();
    form();
    heroSequence();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

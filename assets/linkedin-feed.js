/* SCM Signpost — LinkedIn carousel
   Načte assets/linkedin-latest.json a vykreslí karty do scroll-snap tracku.
   Když soubor chybí, je prázdný nebo se nepodaří načíst, sekce zůstane skrytá. */

(function () {
  'use strict';

  var section = document.getElementById('linkedin');
  if (!section) return;

  var track    = section.querySelector('[data-li-track]');
  var controls = section.querySelector('[data-li-controls]');
  var prevBtn  = section.querySelector('[data-li-prev]');
  var nextBtn  = section.querySelector('[data-li-next]');
  var counter  = section.querySelector('[data-li-counter]');

  var src   = section.getAttribute('data-src') || 'assets/linkedin-latest.json';
  var limit = parseInt(section.getAttribute('data-limit'), 10) || 5;

  /* ---------- vykreslení karet ---------- */

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    try {
      return new Intl.DateTimeFormat('cs-CZ', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(d);
    } catch (e) {
      return iso;
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function buildCard(post, i, count) {
    var card = el('article', 'li-card');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'snímek');
    card.setAttribute('aria-label', (i + 1) + ' z ' + count);

    var date = formatDate(post.datum);
    if (date) card.appendChild(el('div', 'li-date', date));
    if (post.titulek) card.appendChild(el('h3', 'li-title', post.titulek));
    if (post.text) card.appendChild(el('p', 'li-text', post.text));

    var actions = el('div', 'li-actions');

    if (post.url) {
      var a = el('a', null, 'Na LinkedInu →');
      a.href = post.url;
      a.target = '_blank';
      a.rel = 'noopener';
      actions.appendChild(a);
    }
    if (post.link && post.link.url) {
      var b = el('a', 'secondary', (post.link.label || 'Číst na webu') + ' →');
      b.href = post.link.url;
      actions.appendChild(b);
    }

    if (actions.childNodes.length) card.appendChild(actions);
    return card;
  }

  /* ---------- ovládání carouselu ---------- */

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function stepWidth() {
    var first = track.firstElementChild;
    if (!first) return track.clientWidth;
    var cs = getComputedStyle(track);
    var gap = parseFloat(cs.columnGap || cs.gap) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function maxScroll() {
    return track.scrollWidth - track.clientWidth;
  }

  function activeIndex() {
    var i = Math.round(track.scrollLeft / stepWidth());
    return Math.max(0, Math.min(i, track.children.length - 1));
  }

  function refresh() {
    var overflows = maxScroll() > 1;
    controls.hidden = !overflows;
    if (!overflows) return;

    counter.textContent = pad(activeIndex() + 1) + ' / ' + pad(track.children.length);
    prevBtn.disabled = track.scrollLeft <= 1;
    nextBtn.disabled = track.scrollLeft >= maxScroll() - 1;
  }

  function slide(dir) {
    track.scrollBy({ left: dir * stepWidth(), behavior: 'smooth' });
  }

  function wire() {
    prevBtn.addEventListener('click', function () { slide(-1); });
    nextBtn.addEventListener('click', function () { slide(1); });

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { refresh(); ticking = false; });
    }, { passive: true });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refresh, 150);
    });
  }

  /* ---------- start ---------- */

  fetch(src, { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var posts = (data && data.prispevky) || [];
      if (!posts.length) return;

      posts = posts.slice(0, limit);

      var frag = document.createDocumentFragment();
      posts.forEach(function (post, i) {
        frag.appendChild(buildCard(post, i, posts.length));
      });
      track.appendChild(frag);

      var follow = section.querySelector('[data-li-profile]');
      if (follow && data.profil) follow.href = data.profil;

      section.hidden = false;
      wire();
      refresh();
    })
    .catch(function (err) {
      if (window.console) console.warn('LinkedIn karty se nenačetly:', err.message);
    });
})();

(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatCount(value, el) {
    var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    var decimalSep = el.getAttribute('data-count-decimal-sep') || '.';
    var thousandsSep = el.getAttribute('data-count-thousands-sep') || '';
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';

    var fixed = value.toFixed(decimals);
    var parts = fixed.split('.');
    var intPart = parts[0];
    var decPart = parts[1] || '';

    if (thousandsSep) {
      intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    }

    var out = intPart;
    if (decimals > 0) {
      out += decimalSep + decPart;
    }
    return prefix + out + suffix;
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(target)) return;
    var duration = parseInt(el.getAttribute('data-count-duration') || '1200', 10);
    var start = target > 20 ? target * 0.3 : 0;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = start + (target - start) * eased;
      el.textContent = formatCount(current, el);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatCount(target, el);
      }
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(counters, function (el) {
        el.textContent = formatCount(parseFloat(el.getAttribute('data-count-to')), el);
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    Array.prototype.forEach.call(counters, function (el) { observer.observe(el); });
  }

  function initReveal() {
    var revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    Array.prototype.forEach.call(revealEls, function (el) { observer.observe(el); });
  }

  function markRevealTargets() {
    var selectors = [
      '#positioning .pos-body',
      '.pos-values .pos-value',
      '.creds',
      '.pillar-card',
      'blockquote.pillar-quote',
      '.pillar-stats .pillar-stat',
      '#linkedin .linkedin-grid > div',
      '.hero-visual'
    ];
    var els = document.querySelectorAll(selectors.join(','));
    Array.prototype.forEach.call(els, function (el) { el.classList.add('reveal'); });
  }

  function initNavShadow() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    function update() {
      if (window.scrollY > 20) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function init() {
    markRevealTargets();
    initReveal();
    initCounters();
    initNavShadow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

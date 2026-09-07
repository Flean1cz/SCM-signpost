(function () {
  'use strict';
  var ID = 'G-S618X2BG1H';
  var KEY = 'scm_analytics_consent_v1';
  var DAYS = 180;
  var enabled = false;
  var loaded = false;
  var chosen = null;
  var expiresAt = 0;
  var production = /^(www\.)?scmsignpost\.com$/.test(location.hostname);
  var services = {
    'pilir-3pl-tendry.html': '3pl_tenders',
    'pilir-skladova-efektivita.html': 'warehouse',
    'pilir-transport.html': 'transport',
    'pilir-technologie.html': 'wms_tms',
    'pilir-krizovy-management.html': 'crisis_management'
  };
  var service = services[location.pathname.split('/').pop()] || 'general';

  function readChoice() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && (saved.choice === 'granted' || saved.choice === 'denied') && saved.expires > Date.now()) {
        expiresAt = saved.expires;
        return saved.choice;
      }
    } catch (_) {}
    return null;
  }

  function saveChoice(choice) {
    expiresAt = Date.now() + DAYS * 86400000;
    try { localStorage.setItem(KEY, JSON.stringify({choice: choice, expires: expiresAt})); } catch (_) {}
  }

  function cleanLocation() {
    var url = new URL(location.origin + location.pathname);
    var query = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
      var value = query.get(key);
      if (value && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) url.searchParams.set(key, value);
    });
    return url.href;
  }

  function referrerOrigin() {
    try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; } catch (_) { return ''; }
  }

  function gtag() { window.dataLayer.push(arguments); }

  function track(name, parameters) {
    if (!enabled || !production || expiresAt <= Date.now()) return false;
    gtag('event', name, Object.assign({service: service}, parameters || {}));
    return true;
  }
  window.scmTrack = track;

  function startAnalytics() {
    if (loaded || !production) return;
    loaded = true;
    enabled = true;
    window['ga-disable-' + ID] = false;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    gtag('consent', 'update', {analytics_storage: 'granted'});
    gtag('js', new Date());
    gtag('config', ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: DAYS * 86400,
      cookie_update: false,
      page_location: cleanLocation(),
      page_referrer: referrerOrigin()
    });
    track('page_view', {page_title: document.title});
    if (service !== 'general') track('service_view');
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
  }

  function removeAnalyticsCookies() {
    var domains = ['', location.hostname, '.scmsignpost.com', 'scmsignpost.com'];
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
      });
    });
  }

  var banner = document.createElement('section');
  banner.className = 'consent-banner';
  banner.setAttribute('aria-label', 'Nastavení analytických cookies');
  banner.innerHTML = '<div><strong>Pomůžete nám zlepšit web?</strong><p>Se souhlasem používáme Google Analytics pro měření návštěvnosti a zájmu o služby. Volba platí 180 dní a můžete ji změnit v patičce. Formulář funguje i bez analytiky. <a href="cookies.html">Podrobnosti o měření</a></p></div><div class="consent-actions"><button type="button" data-consent="granted">Povolit analytiku</button><button type="button" data-consent="denied">Odmítnout analytiku</button><button type="button" data-consent="close" aria-label="Zavřít nastavení bez změny">Zavřít</button></div>';
  document.body.appendChild(banner);
  chosen = readChoice();
  banner.hidden = chosen !== null;
  if (chosen === 'granted') startAnalytics();
  else removeAnalyticsCookies();

  var previousFocus = null;
  function closeBanner() {
    banner.hidden = true;
    if (previousFocus) previousFocus.focus();
  }
  banner.addEventListener('click', function (event) {
    var button = event.target.closest('[data-consent]');
    if (!button) return;
    var choice = button.getAttribute('data-consent');
    if (choice === 'close') { closeBanner(); return; }
    chosen = choice;
    saveChoice(choice);
    closeBanner();
    if (choice === 'granted') startAnalytics();
    else {
      enabled = false;
      window['ga-disable-' + ID] = true;
      if (loaded) gtag('consent', 'update', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
      removeAnalyticsCookies();
      // Reload unloads the Google library after revocation. Subsequent pages stay blocked.
      if (loaded) location.reload();
    }
  });

  var settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'consent-settings';
  settings.textContent = 'Nastavení cookies';
  settings.addEventListener('click', function () {
    previousFocus = settings;
    banner.hidden = false;
    banner.querySelector('button').focus();
  });
  (document.querySelector('footer') || document.body).appendChild(settings);
  // A choice changed in another tab must also stop measurement in this tab.
  window.addEventListener('storage', function (event) {
    if (event.key === KEY && readChoice() !== chosen) location.reload();
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (/^mailto:/i.test(href)) track('email_click');
    else if (/^tel:/i.test(href)) track('phone_click');
    else {
      var target;
      try { target = new URL(href, location.href); } catch (_) { return; }
      if (target.origin === location.origin && target.hash === '#contact') {
        var place = link.closest('#hero, nav, .seo-service-summary, .pillar-cta, footer');
        var locationName = place && place.id === 'hero' ? 'hero' : place && place.tagName === 'NAV' ? 'navigation' : link.closest('.seo-service-summary') ? 'service_summary' : 'page_content';
        track('cta_click', {cta_location: locationName});
      }
    }
  });

  var form = document.getElementById('contactForm');
  if (form) {
    var started = false;
    form.addEventListener('input', function (event) {
      if (!started && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) && event.target.name !== '_honey') {
        started = track('form_start', {form_id: 'contact'});
      }
    });
    form.addEventListener('invalid', function () { track('form_error', {form_id: 'contact', error_type: 'validation'}); }, true);
  }
})();

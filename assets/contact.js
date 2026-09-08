(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form || !window.fetch || !window.FormData) return;
  var button = form.querySelector('button[type="submit"]');
  var success = document.getElementById('formSuccess');
  var error = document.createElement('p');
  error.className = 'form-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  form.insertBefore(error, button);
  var busy = false;
  var completed = false;
  var label = button.textContent;

  function track(name, params) { if (window.scmTrack) window.scmTrack(name, params); }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (busy || completed) return;
    if (!form.reportValidity()) return;
    if (form.elements._honey && form.elements._honey.value) return;
    busy = true;
    button.disabled = true;
    button.textContent = 'Odesílání…';
    error.hidden = true;
    success.hidden = true;
    var payload = new FormData(form);
    payload.delete('_next');
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;
    var options = {method: 'POST', body: payload, headers: {Accept: 'application/json'}};
    if (controller) options.signal = controller.signal;
    fetch('https://formsubmit.co/ajax/info@scmsignpost.com', options)
      .then(function (response) {
        if (!response.ok) throw new Error('server');
        return response.json();
      })
      .then(function (data) {
        if (!data || (data.success !== true && data.success !== 'true')) throw new Error('rejected');
        completed = true;
        success.textContent = 'Poptávka byla přijata k odeslání. Ozvu se vám co nejdříve.';
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.focus();
        track('generate_lead', {form_id: 'contact', lead_channel: 'web_form'});
        form.reset();
        button.textContent = 'Poptávka přijata';
      })
      .catch(function () {
        error.textContent = 'Přijetí poptávky se nepodařilo potvrdit. Zpráva mohla být odeslána. Kontaktujte nás prosím na info@scmsignpost.com; údaje zůstaly ve formuláři.';
        error.hidden = false;
        track('form_error', {form_id: 'contact', error_type: 'submission_unconfirmed'});
        button.textContent = label;
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        busy = false;
        button.disabled = completed;
      });
  });
})();

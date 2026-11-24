// Sends the Contact Us enquiry form to Karan's Gmail through FormSubmit
// (https://formsubmit.co). The site is static now, so Elementor's own
// WordPress submit handler has no server to post to; this takes over.
(function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/karan.arcstudio@gmail.com';

  function showMessage(form, text, ok) {
    var old = form.querySelector('.elementor-message');
    if (old) old.remove();
    var div = document.createElement('div');
    div.className = 'elementor-message ' + (ok ? 'elementor-message-success' : 'elementor-message-danger');
    div.setAttribute('role', 'alert');
    div.textContent = text;
    form.appendChild(div);
  }

  function value(form, name) {
    var el = form.querySelector('[name="form_fields[' + name + ']"]');
    return el ? el.value.trim() : '';
  }

  // Capture phase on window runs before Elementor's jQuery submit handler on the form.
  window.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('form.elementor-form')) return;
    e.preventDefault();
    e.stopImmediatePropagation();

    var service = value(form, 'field_5867f6d');
    if (!service || service === 'Select Service') {
      showMessage(form, 'Please select a service.', false);
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    var label = button && button.querySelector('.elementor-button-text');
    var original = label ? label.textContent : '';
    if (button) button.disabled = true;
    if (label) label.textContent = 'Sending...';

    var data = {
      Name: value(form, 'name'),
      Email: value(form, 'email'),
      Phone: value(form, 'message'),
      Service: service,
      Message: value(form, 'field_ca588c5'),
      _replyto: value(form, 'email'),
      _subject: 'New website enquiry - Arc Studio',
      _template: 'table',
      _captcha: 'false'
    };

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (res.ok && String(res.body.success) === 'true') {
          form.reset();
          showMessage(form, 'Thank you! Your enquiry has been sent. We will get back to you soon.', true);
        } else {
          showMessage(form, 'Sorry, your enquiry could not be sent. Please call us on +91 9619232928.', false);
        }
      })
      .catch(function () {
        showMessage(form, 'Sorry, your enquiry could not be sent. Please call us on +91 9619232928.', false);
      })
      .then(function () {
        if (button) button.disabled = false;
        if (label) label.textContent = original;
      });
  }, true);
})();

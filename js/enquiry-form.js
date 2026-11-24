// Sends the Contact Us enquiry form to Karan's Gmail through Web3Forms
// (https://web3forms.com). The site is static now, so Elementor's own
// WordPress submit handler has no server to post to; this takes over.
// The access key is public by design: Web3Forms only ever mails the address
// the key was created for (karan.arcstudio@gmail.com).
(function () {
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var ACCESS_KEY = 'c36ac248-fba4-43d0-bb1a-f21917d82d79';

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
      access_key: ACCESS_KEY,
      subject: 'New website enquiry - Arc Studio',
      from_name: 'Arc Studio Website',
      replyto: value(form, 'email'),
      Name: value(form, 'name'),
      Email: value(form, 'email'),
      Phone: value(form, 'message'),
      Service: service,
      Message: value(form, 'field_ca588c5')
    };

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success) {
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

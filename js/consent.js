/* Cookie bar.
   The Google tag (index.html) always loads with cookies off, so Google gets
   anonymous, cookieless visit pings. "Accept" turns analytics cookies on;
   "Accept only essential cookies" keeps them off.
   The choice is kept in localStorage ('bdb-analytics': 'granted' | 'denied');
   "Cookie settings" in the footer opens the bar again. */
(function () {
  var KEY = 'bdb-analytics';
  var root = document.documentElement;
  var bar = null;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  // Remove Google Analytics cookies (_ga, _ga_XXXX) when cookies are turned off again.
  function clearGaCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function choose(value) {
    save(value);
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: value });
    if (value === 'denied') clearGaCookies();
    close();
  }

  function setHeight() {
    if (bar) root.style.setProperty('--consent-h', bar.offsetHeight + 'px');
  }

  function close() {
    if (!bar) return;
    bar.remove();
    bar = null;
    root.classList.remove('consent-open');
    window.removeEventListener('resize', setHeight);
  }

  function open(focus) {
    if (bar) return;
    bar = document.createElement('section');
    bar.className = 'consent';
    bar.setAttribute('aria-label', 'Cookies');
    bar.innerHTML =
      '<p class="consent__kicker">Cookies</p>' +
      '<p class="consent__text">This site uses Google Analytics to count visits. Accept to allow its cookies, or keep only the essential ones. Nothing is used for ads. ' +
      '<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">How Google uses this</a></p>' +
      '<div class="consent__actions">' +
      '<button type="button" data-choice="granted">Accept</button>' +
      '<button type="button" data-choice="denied">Accept only essential cookies</button>' +
      '</div>';
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-choice]');
      if (btn) choose(btn.getAttribute('data-choice'));
    });
    document.body.appendChild(bar);
    root.classList.add('consent-open');
    setHeight();
    window.addEventListener('resize', setHeight);
    if (focus) bar.querySelector('button').focus();
  }

  document.querySelectorAll('[data-consent-open]').forEach(function (btn) {
    btn.addEventListener('click', function () { open(true); });
  });

  if (!read()) open(false);
})();

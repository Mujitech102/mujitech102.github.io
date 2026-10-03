
/* NAVIGATION */

document.querySelectorAll('.dropbtn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    btn.closest('.dropdown').classList.toggle('open');
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown').forEach(d => {
    d.classList.remove('open');
  });
});

const mb = document.querySelector('.mobilebtn');

if (mb) {
  mb.addEventListener('click', () => {
    document.querySelector('.navlinks')?.classList.toggle('mobileopen');
  });
}

document.querySelectorAll('form[data-demo]').forEach(form => {
  form.addEventListener('submit', e => {
    const action = form.getAttribute('action') || '';

    if (action.includes('FORM_ACTION_HIER_EINTRAGEN')) {
      e.preventDefault();
      alert('Vielen Dank. Das Online-Formular wird derzeit eingerichtet. Bitte kontaktieren Sie uns vorübergehend per E-Mail oder WhatsApp.');
    }
  });
});


/* GOOGLE ANALYTICS */

const GA_MEASUREMENT_ID = 'G-C2WKE7YV33';
const COOKIE_STORAGE_KEY = 'mujitech-cookie-consent';

let analyticsLoaded = false;

function activateGoogleAnalytics() {
  if (analyticsLoaded) return;

  analyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];

  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src =
    'https://www.googletagmanager.com/gtag/js?id=' +
    encodeURIComponent(GA_MEASUREMENT_ID);

  document.head.appendChild(script);
}


/* COOKIE-BANNER */

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookieBanner');
  const necessaryButton = document.getElementById('cookieNecessary');
  const acceptButton = document.getElementById('cookieAccept');

  let savedConsent = null;

  try {
    savedConsent = localStorage.getItem(COOKIE_STORAGE_KEY);
  } catch (error) {
    console.log('Cookie-Einstellung konnte nicht gelesen werden.');
  }

  if (savedConsent === 'all') {
    activateGoogleAnalytics();
  }

  if (banner && (savedConsent === 'all' || savedConsent === 'necessary')) {
    banner.classList.add('is-hidden');
  }

  if (necessaryButton) {
    necessaryButton.addEventListener('click', () => {
      try {
        localStorage.setItem(COOKIE_STORAGE_KEY, 'necessary');
      } catch (error) {
        console.log('Cookie-Einstellung konnte nicht gespeichert werden.');
      }

      banner?.classList.add('is-hidden');
    });
  }

  if (acceptButton) {
    acceptButton.addEventListener('click', () => {
      try {
        localStorage.setItem(COOKIE_STORAGE_KEY, 'all');
      } catch (error) {
        console.log('Cookie-Einstellung konnte nicht gespeichert werden.');
      }

      activateGoogleAnalytics();
      banner?.classList.add('is-hidden');
    });
  }
});

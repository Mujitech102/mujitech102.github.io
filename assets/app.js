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


/* COOKIE-BANNER */

document.addEventListener('DOMContentLoaded', () => {

  const banner = document.getElementById('cookieBanner');
  const necessaryButton = document.getElementById('cookieNecessary');
  const acceptButton = document.getElementById('cookieAccept');

  if (!banner) {
    return;
  }

  const STORAGE_KEY = 'mujitech-cookie-consent';

  try {
    const savedConsent = localStorage.getItem(STORAGE_KEY);

    if (savedConsent) {
      banner.classList.add('is-hidden');
      return;
    }
  } catch (error) {
    console.log('Cookie-Einstellung konnte nicht gelesen werden.');
  }

  function closeCookieBanner(choice) {

    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch (error) {
      console.log('Cookie-Einstellung konnte nicht gespeichert werden.');
    }

    banner.classList.add('is-hidden');
  }

  if (necessaryButton) {
    necessaryButton.addEventListener('click', () => {
      closeCookieBanner('necessary');
    });
  }

  if (acceptButton) {
    acceptButton.addEventListener('click', () => {
      closeCookieBanner('all');
    });
  }

});

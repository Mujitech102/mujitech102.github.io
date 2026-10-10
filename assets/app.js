
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
      const messages={de:'Das Formular wird eingerichtet. Bitte kontaktieren Sie uns per E-Mail oder WhatsApp.',fr:'Ce formulaire est en cours de configuration. Contactez-nous par e-mail ou WhatsApp.',it:'Il modulo è in fase di configurazione. Contattaci per e-mail o WhatsApp.',en:'This form is being configured. Please contact us by email or WhatsApp.'};
      alert(messages[(document.documentElement.lang||'de').slice(0,2)]||messages.en);
    }
  });
});

document.querySelectorAll('.dropbtn').forEach(btn=>{
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    btn.closest('.dropdown').classList.toggle('open');
  });
});

document.addEventListener('click',()=>{
  document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open'));
});

const mb=document.querySelector('.mobilebtn');

if(mb){
  mb.addEventListener('click',()=>{
    document.querySelector('.navlinks')?.classList.toggle('mobileopen');
  });
}

document.querySelectorAll('form[data-demo]').forEach(form=>{
  form.addEventListener('submit',e=>{
    const action=form.getAttribute('action')||'';

    if(action.includes('FORM_ACTION_HIER_EINTRAGEN')){
      e.preventDefault();

      alert(
        'Vielen Dank. Das Online-Formular wird derzeit eingerichtet. ' +
        'Bitte kontaktieren Sie uns vorübergehend per E-Mail oder WhatsApp.'
      );
    }
  });
});


/* =========================================================
   COOKIE-BANNER
   ========================================================= */

(()=>{
  const banner=document.getElementById('cookieBanner');

  if(!banner) return;

  const STORAGE_KEY='mujitech-cookie-consent';

  let savedConsent=null;

  try{
    savedConsent=localStorage.getItem(STORAGE_KEY);
  }catch(e){}

  if(savedConsent){
    banner.classList.add('is-hidden');
    document.documentElement.dataset.cookieConsent=savedConsent;
    return;
  }

  const saveConsent=value=>{

    try{
      localStorage.setItem(STORAGE_KEY,value);
    }catch(e){}

    document.documentElement.dataset.cookieConsent=value;

    banner.classList.add('is-hidden');

    window.dispatchEvent(
      new CustomEvent('mujitechCookieConsent',{
        detail:{
          consent:value
        }
      })
    );
  };

  document
    .getElementById('cookieNecessary')
    ?.addEventListener('click',()=>{
      saveConsent('necessary');
    });

  document
    .getElementById('cookieAccept')
    ?.addEventListener('click',()=>{
      saveConsent('all');
    });

})();

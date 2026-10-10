(() => {
  'use strict';
  const ready = () => {
    // A restrained lift replaces pointer-driven tilting; controls never rotate.
    document.querySelectorAll('.panel,.card,.m-service-card,.m-final-card,.w-card,.trust-item,.service-card,.review-card,.product-card,.process-step').forEach(card => {
      if (!card.matches('form,aside') && !card.querySelector('form')) card.classList.add('ch-depth');
    });
    document.querySelectorAll('.cta,.btn,.m-button,.w-btn,.private-btn,.repair-btn,.contact-btn,.hero-mini-btn,.w-nav-cta,.button,button[type=submit]').forEach(button => button.classList.add('ui-action'));
    document.querySelectorAll('.language-options a').forEach(link => {
      if (location.hash) link.href += location.hash;
    });
    // Keep existing navigation handlers; sync accessibility across variants.
    const nav=document.querySelector('.navlinks');
    const btn=document.querySelector('.mobilebtn');
    const sync=()=>{
      if (nav && btn) {
        nav.id ||= 'hauptnavigation';
        btn.setAttribute('aria-controls',nav.id);
        const open=nav.classList.contains('mobileopen');
        btn.setAttribute('aria-expanded',String(open));
        const labels={de:['Menü öffnen','Menü schliessen'],en:['Open menu','Close menu'],fr:['Ouvrir le menu','Fermer le menu'],it:['Apri il menu','Chiudi il menu']};
        btn.setAttribute('aria-label',(labels[(document.documentElement.lang||'de').slice(0,2)]||labels.en)[open?1:0]);
      }
      document.querySelectorAll('.dropdown').forEach(d=>d.querySelector('.dropbtn')?.setAttribute('aria-expanded',String(d.classList.contains('open'))));
    };
    sync();
    if(nav)new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready); else ready();
})();

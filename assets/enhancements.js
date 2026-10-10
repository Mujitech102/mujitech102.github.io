(() => {
  'use strict';
  const ready = () => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    document.querySelectorAll('.panel,.card,.m-service-card,.m-final-card,.w-card,.trust-item').forEach(card => {
      if (card.matches('form,aside') || card.querySelector('form')) return;
      card.classList.add('ch-depth');
      card.addEventListener('pointermove', e => {
        if (reduced.matches || !fine.matches) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--tilt-x', `${((e.clientY-r.top)/r.height-.5)*-5}deg`);
        card.style.setProperty('--tilt-y', `${((e.clientX-r.left)/r.width-.5)*5}deg`);
      }, {passive:true});
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y');
      });
    });
    // Keep existing navigation handlers; sync accessibility across variants.
    const nav=document.querySelector('.navlinks');
    const btn=document.querySelector('.mobilebtn');
    const sync=()=>{
      if (nav && btn) {
        nav.id ||= 'hauptnavigation';
        btn.setAttribute('aria-controls',nav.id);
        btn.setAttribute('aria-expanded',String(nav.classList.contains('mobileopen')));
      }
      document.querySelectorAll('.dropdown').forEach(d=>d.querySelector('.dropbtn')?.setAttribute('aria-expanded',String(d.classList.contains('open'))));
    };
    sync();
    if(nav)new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready); else ready();
})();

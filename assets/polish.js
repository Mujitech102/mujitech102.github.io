/* Preview refinement: no change to recipient, CAPTCHA or delivery confirmation. */
(() => {
 'use strict';
 const lang=(document.documentElement.lang||'de').slice(0,2);
 const translations={
 de:{contact:'Kontakt',close:'Schliessen'},
 en:{contact:'Contact',close:'Close'},
 fr:{contact:'Contact',close:'Fermer'},
 it:{contact:'Contatti',close:'Chiudi'}}
 const t=translations[lang]||translations.en;
 function ready(){
  const toggle=document.querySelector('.muji-menu-toggle'),nav=document.querySelector('.muji-site-nav');
  const closeNav=()=>{nav?.classList.remove('muji-nav-open');toggle?.setAttribute('aria-expanded','false');};
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('muji-nav-open',open);toggle.setAttribute('aria-expanded',String(open));});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(nav?.classList.contains('muji-nav-open')){closeNav();toggle.focus();}document.querySelectorAll('.muji-shop-menu[open]').forEach(d=>d.open=false);}});
  document.addEventListener('click',e=>{document.querySelectorAll('.muji-shop-menu[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;});if(nav?.classList.contains('muji-nav-open')&&!e.target.closest('.muji-unified-header'))closeNav();});
  const dock=document.querySelector('.fixed-contact-actions');
  if(dock){const button=document.createElement('button');button.type='button';button.className='muji-contact-toggle';button.textContent='✉ '+t.contact;button.setAttribute('aria-expanded','false');
   const links=Array.from(dock.querySelectorAll('a'));links.forEach((a,i)=>{a.id='muji-contact-'+i;});button.setAttribute('aria-controls',links.map(a=>a.id).join(' '));dock.prepend(button);
   const set=open=>{dock.classList.toggle('muji-contact-open',open);button.setAttribute('aria-expanded',String(open));button.textContent=open?'× '+t.close:'✉ '+t.contact;};
   button.addEventListener('click',()=>set(!dock.classList.contains('muji-contact-open')));
   document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dock.classList.contains('muji-contact-open')){set(false);button.focus();}});
   document.addEventListener('click',e=>{if(!dock.contains(e.target))set(false);});
  }

 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

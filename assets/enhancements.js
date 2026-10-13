(() => {
  'use strict';
  const ready = () => {
    // A restrained lift replaces pointer-driven tilting; controls never rotate.
    document.querySelectorAll('.panel,.card,.m-service-card,.m-final-card,.w-card,.trust-item,.service-card,.review-card,.product-card,.process-step').forEach(card => {
      if (!card.matches('form,aside') && !card.querySelector('form')) card.classList.add('ch-depth');
    });
    document.querySelectorAll('.cta,.btn,.m-button,.w-btn,.private-btn,.repair-btn,.contact-btn,.hero-mini-btn,.w-nav-cta,.button,button[type=submit]').forEach(button => button.classList.add('ui-action'));
    document.querySelectorAll('.language-options a').forEach(link => {
      const requested=new URLSearchParams(location.search).get('service');
      const services=['IT-Support KMU','IT-Betreuung','Hardware-Beschaffung','Firmenhandys','Telekom-Anfrage','Microsoft 365 / Google Workspace'];
      if(services.includes(requested)){const target=new URL(link.href,location.href);target.searchParams.set('service',requested);link.href=target.href;}
      if (location.hash) link.href += location.hash;
    });
    const lang=(document.documentElement.lang||'de').slice(0,2);
    const submitCopy={de:'Weiter zur Übermittlung. Bitte die Bestätigung auf der nächsten Seite prüfen. Falls es nicht klappt, kontaktiere uns per E-Mail oder WhatsApp.',fr:'Poursuite de l’envoi. Vérifiez la confirmation sur la page suivante. En cas de problème, contactez-nous par e-mail ou WhatsApp.',it:'Passaggio all’invio. Verifica la conferma nella pagina successiva. In caso di problemi, contattaci via e-mail o WhatsApp.',en:'Continuing to submission. Check the confirmation on the next page. If it fails, contact us by email or WhatsApp.'};
    document.querySelectorAll('form[action="https://formsubmit.co/info@mujitech.ch"]').forEach(form=>{
      const status=document.createElement('p');status.className='form-progress';status.hidden=true;status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent=submitCopy[lang]||submitCopy.en;form.append(status);
      form.addEventListener('submit',()=>{status.hidden=false;});
      window.addEventListener('pageshow',()=>{status.hidden=true;});
    });
    document.querySelectorAll('.w-pick,.w-care-pick').forEach(link=>link.addEventListener('click',()=>{
      const options=document.getElementById('website-options');if(options)options.open=true;
    }));
    // Shop categories are reachable from every shared header.
    const shopCopy={de:['Shop','Alle Produkte','Gaming-PCs'],en:['Shop','All products','Gaming PCs'],fr:['Boutique','Tous les produits','PC gaming'],it:['Shop','Tutti i prodotti','PC gaming']};
    const copy=shopCopy[lang]||shopCopy.de;
    document.querySelectorAll('.navlinks > a').forEach(link=>{
      if(!new URL(link.href,location.href).pathname.endsWith('/shop.html'))return;
      const base=new URL(link.href,location.href);
      const group=document.createElement('div');group.className='dropdown shop-dropdown';
      const button=document.createElement('button');button.className='dropbtn';button.type='button';button.textContent=copy[0]+' ▾';button.setAttribute('aria-expanded','false');
      const menu=document.createElement('div');menu.className='menu';
      const targets=[[base.pathname,copy[1]],[base.pathname+'#smartphones','iPhones'],[base.pathname.replace('shop.html','gaming-pcs.html'),copy[2]]];
      targets.forEach(([href,label])=>{const a=document.createElement('a');a.href=href;a.textContent=label;menu.append(a);});
      group.append(button,menu);link.replaceWith(group);
      button.addEventListener('click',event=>{event.stopPropagation();const open=!group.classList.contains('open');document.querySelectorAll('.dropdown.open').forEach(d=>d.classList.remove('open'));group.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));});
      group.addEventListener('keydown',event=>{if(event.key==='Escape'){group.classList.remove('open');button.setAttribute('aria-expanded','false');button.focus();}});
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

/* Match the preferred reply channel to an actual contact number. */
(() => {
  const lang=(document.documentElement.lang||'de').slice(0,2);
  const copy={de:'Für einen Rückruf oder eine WhatsApp-Antwort brauchen wir deine Telefonnummer. Alternativ wähle E-Mail.',en:'We need your phone number for a call or WhatsApp reply. Alternatively, choose email.',fr:'Pour un appel ou une réponse WhatsApp, indiquez votre numéro. Vous pouvez aussi choisir e-mail.',it:'Per una chiamata o una risposta WhatsApp serve il tuo numero. In alternativa scegli e-mail.'};
  const ready=()=>{
    document.querySelectorAll('form').forEach(form=>{
      const channel=form.querySelector('[name="kontaktart"]');
      const phone=form.querySelector('input[type="tel"]');
      if(!channel||!phone)return;
      let note=form.querySelector('.contact-phone-note');
      if(!note){note=document.createElement('p');note.className='form-note contact-phone-note';note.id='contact-phone-note';channel.after(note);phone.setAttribute('aria-describedby',note.id);}
      note.textContent=copy[lang]||copy.en;
      const sync=()=>{const needsPhone=channel.value==='Telefon'||channel.value==='WhatsApp';phone.required=needsPhone;note.hidden=!needsPhone;phone.setAttribute('aria-required',String(needsPhone));};
      channel.addEventListener('change',sync);window.addEventListener('pageshow',sync);sync();
      phone.addEventListener('invalid',()=>{const details=phone.closest('details');if(details)details.open=true;});
    });
    const area=document.querySelector('select[name="bereich"]');
    const requested=new URLSearchParams(location.search).get('service');
    if(area&&requested&&Array.from(area.options).some(option=>option.value===requested))area.value=requested;
    else if(area&&location.hash==='#business'&&!area.value)area.value='IT-Support KMU';
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

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
      const problem = new URLSearchParams(location.search).get('problem');
      if (['display','battery','computer'].includes(problem)) { const target = new URL(link.href,location.href); target.searchParams.set('problem',problem); link.href=target.href; }
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
      const targets=[[base.pathname,copy[1]],[base.pathname.replace('shop.html','iphones.html'),'iPhones'],[base.pathname.replace('shop.html','gaming-pcs.html'),copy[2]]];
      targets.forEach(([href,label])=>{const a=document.createElement('a');a.href=href;a.textContent=label;menu.append(a);});
      group.append(button,menu);link.replaceWith(group);
      button.addEventListener('click',event=>{event.stopImmediatePropagation();const open=!group.classList.contains('open');document.querySelectorAll('.dropdown.open').forEach(d=>d.classList.remove('open'));group.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));});
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

/* Direct problem links keep the enquiry form short and preserve visitor input. */
(() => {
  const ready = () => {
    const problem = new URLSearchParams(location.search).get('problem');
    const choices = {display: 'Display', battery: 'Akku'};
    const lang = (document.documentElement.lang || 'de').slice(0,2);
    const descriptions = {de:{display:'Display kaputt',battery:'Akku schwach',computer:'Computer langsam'},en:{display:'Broken screen',battery:'Weak battery',computer:'Slow computer'},fr:{display:'Écran cassé',battery:'Batterie faible',computer:'Ordinateur lent'},it:{display:'Schermo rotto',battery:'Batteria debole',computer:'Computer lento'}};
    const description = document.querySelector('textarea[name="beschreibung"]');
    if (description && !description.value && descriptions[lang]?.[problem]) description.value = descriptions[lang][problem];
    const fault = document.querySelector('select[name="defekt"]');

    if (fault && choices[problem] && !fault.value && Array.from(fault.options).some(o => o.value === choices[problem])) fault.value = choices[problem];
    const service = document.querySelector('select[name="service"]');
    const requested = new URLSearchParams(location.search).get('service');
    if (service && !service.value && Array.from(service.options).some(o => o.value === requested)) service.value = requested;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();

/* The same three contact actions remain available throughout the website. */
(() => {
  const ready = () => {
    if (document.querySelector('.fixed-contact-actions')) return;
    const lang = (document.documentElement.lang || 'de').slice(0, 2);
    const labels = {
      de: ['Mujitech kontaktieren', 'Mujitech über WhatsApp kontaktieren', 'Mujitech anrufen', 'E-Mail an Mujitech schreiben'],
      en: ['Contact Mujitech', 'Contact Mujitech on WhatsApp', 'Call Mujitech', 'Email Mujitech'],
      fr: ['Contacter Mujitech', 'Contacter Mujitech sur WhatsApp', 'Appeler Mujitech', 'Envoyer un e-mail à Mujitech'],
      it: ['Contatta Mujitech', 'Contatta Mujitech su WhatsApp', 'Chiama Mujitech', 'Invia un’e-mail a Mujitech']
    };
    const text = labels[lang] || labels.en;
    const nav = document.createElement('nav');
    nav.className = 'fixed-contact-actions';
    nav.setAttribute('aria-label', text[0]);
    const whatsapp = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.26-1.64a11.94 11.94 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.36 11.94-11.94a11.87 11.87 0 0 0-3.46-8.41ZM12.04 21.82a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.88 9.88 0 0 1-1.52-5.27c0-5.47 4.45-9.92 9.93-9.92a9.84 9.84 0 0 1 7.01 2.9 9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.88-9.94 9.88Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.61.71.23 1.36.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>';
    const phone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8.2 3.8 5.8 3a1.4 1.4 0 0 0-1.7.8c-2.3 5.2 5.9 13.4 11.1 16.1a3.6 3.6 0 0 0 4.4-.5l1.1-1.2a1.4 1.4 0 0 0-.3-2.1l-3.1-1.9a1.4 1.4 0 0 0-1.7.2L14 16c-2.6-1.4-4.6-3.4-6-6l1.5-1.6a1.4 1.4 0 0 0 .2-1.7L8.2 3.8Z"/></svg>';
    const mail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>';
    [['https://wa.me/41768444673', whatsapp, 'whatsapp'], ['tel:+41768444673', phone, 'phone'], ['mailto:info@mujitech.ch', mail, 'email']].forEach(([href, icon, kind], i) => {
      const a = document.createElement('a');
      a.href = href;
      a.className = 'fixed-contact-button ' + kind;
      a.setAttribute('aria-label', text[i + 1]);
      a.title = text[i + 1];
      a.innerHTML = icon;
      if (kind === 'whatsapp') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      nav.append(a);
    });
    document.body.append(nav);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();

// Shared MujiBot and repair-price loader for every content page.
(() => {
  const lang=(document.documentElement.lang||'de').slice(0,2);
  const base=lang==='de'?'/':'/'+lang+'/';
  const ready=()=>{document.querySelectorAll('.navlinks,.w-links').forEach(nav=>{if(nav.querySelector('a[href$="preise.html"]'))return;const link=document.createElement('a');link.href=base+'preise.html';link.textContent=({de:'Preisliste',en:'Repair prices',fr:'Tarifs',it:'Prezzi'})[lang]||'Preisliste';const cta=nav.querySelector('.cta,.w-nav-cta');if(cta)cta.before(link);else nav.append(link);});
    const params=new URLSearchParams(location.search);const model=params.get('model'),repair=params.get('repair');if(!model||!repair)return;document.querySelectorAll('form').forEach(form=>{const field=form.querySelector('textarea[name="beschreibung"]');if(field&&!field.value){field.value=model+' – '+repair;}const device=form.querySelector('input[name="modell"],input[name="model"]');if(device&&!device.value)device.value=model;});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
  if (!document.querySelector('link[href*="/assets/mujibot.css"]')) {const style=document.createElement('link');style.rel='stylesheet';style.href='/assets/mujibot.css?v=20261014-3';document.head.append(style);}
  const load=src=>new Promise((resolve,reject)=>{if(document.querySelector('script[src*="'+src.split('?')[0]+'"]')){resolve();return;}const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script);});
  const data=window.MujiPriceBook?Promise.resolve():load('/assets/repair-prices-data.js?v=20261015-cost-safe-9');
  data.then(()=>window.MujiRepairLabel?null:load('/assets/repair-prices.js?v=20261014-2')).catch(()=>{}).then(()=>load('/assets/mujibot.js?v=20261014-total-7')).catch(()=>{});
})();

/* Keep only the site's main header fixed; never MujiBot's header. */
(() => {
 const ready=()=>{
  const header=document.body.querySelector(':scope > header');
  if(!header||header.classList.contains('muji-fixed-site-header'))return;
  const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/fixed-header.css?v=20261014-1';document.head.append(css);
  const spacer=document.createElement('div');spacer.className='muji-header-spacer';spacer.setAttribute('aria-hidden','true');header.before(spacer);header.classList.add('muji-fixed-site-header');
  const sync=()=>document.documentElement.style.setProperty('--muji-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');
  css.addEventListener('load',sync);sync();if(window.ResizeObserver)new ResizeObserver(sync).observe(header);else window.addEventListener('resize',sync);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();


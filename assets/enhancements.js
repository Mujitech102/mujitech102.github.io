(() => {
  'use strict';
  const ready = () => {
    // A restrained lift replaces pointer-driven tilting; controls never rotate.
    document.querySelectorAll('.panel,.card,.m-service-card,.m-final-card,.w-card,.trust-item,.service-card,.review-card,.product-card,.process-step').forEach(card => {
      if (!card.matches('form,aside') && !card.querySelector('form')) card.classList.add('ch-depth');
    });
    document.querySelectorAll('.cta,.btn,.m-button,.w-btn,.private-btn,.repair-btn,.contact-btn,.hero-mini-btn,.w-nav-cta,.button,button[type=submit]').forEach(button => button.classList.add('ui-action'));
    document.querySelectorAll('.language-options a').forEach(link => {
      const target=new URL(link.href,location.href);
      if(target.origin!==location.origin)return;
      const requested=new URLSearchParams(location.search).get('service');
      const services=['Reparatur','Privatkunden-Service','Geräteankauf','Produktanfrage','IT-Support KMU','IT-Betreuung','Hardware-Beschaffung','Firmenhandys','Telekom-Anfrage','Website','Microsoft 365 / Google Workspace','Sonstiges','Datenübertragung','PC-/Laptop-Optimierung','Handy-Einrichtung','Sonstige Technik-Hilfe'];
      if(services.includes(requested))target.searchParams.set('service',requested);
      const problem = new URLSearchParams(location.search).get('problem');
      if (['display','battery','computer'].includes(problem))target.searchParams.set('problem',problem);
      if (location.hash)target.hash=location.hash;
      link.href=target.href;
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
  if (!document.querySelector('link[href*="/assets/mujibot.css"]')) {const style=document.createElement('link');style.rel='stylesheet';style.href='/assets/mujibot.css?v=20261015-quality-19';document.head.append(style);}
  const load=src=>new Promise((resolve,reject)=>{if(document.querySelector('script[src*="'+src.split('?')[0]+'"]')){resolve();return;}const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script);});
  const data=window.MujiPriceBook?Promise.resolve():load('/assets/repair-prices-data.js?v=20261023-usability-1');
  data.then(()=>window.MujiRepairLabel?null:load('/assets/repair-prices.js?v=20261023-usability-1')).catch(()=>{}).then(()=>{document.dispatchEvent(new Event('mujitech-prices-ready'));return load('/assets/repair-guides.js?v=20261015-quality-19');}).then(()=>load('/assets/mujibot.js?v=20261030-quality-1')).catch(()=>{});
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



/* Preserve repair context across languages and recover safely after a submission. */
(() => {
  'use strict';
  const supported = ['repair','gaming_pc','webdesign','device_purchase','private_support','contact'];
  const pendingKey = 'mujitech-pending-enquiry';
  const applyContext = () => {
    const params = new URLSearchParams(location.search);
    const model = params.get('model');
    const repair = params.get('repair');
    const safe = value => value && value.length <= 180 && !/[\u0000-\u001f]/.test(value);
    document.querySelectorAll('.language-options a,.price-language a,.ch-languages a').forEach(link => {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (supported.includes(params.get('form'))) url.searchParams.set('form',params.get('form'));
      if (safe(model)) url.searchParams.set('model', model);
      if (safe(repair)) url.searchParams.set('repair', repair);
      if (location.hash) url.hash = location.hash;
      link.href = url.href;
    });
    if (!safe(model)) return;
    document.querySelectorAll('form').forEach(form => {
      const device = form.querySelector('input[name="modell"],input[name="model"],input[name="Geraet_Modell"]');
      if (device && !device.value) device.value = model;
      const description = form.querySelector('textarea[name="beschreibung"],textarea[name="Fehlerbeschreibung"]');
      if (!description || !safe(repair)) return;
      const original = model + ' – ' + repair;
      const lang = (document.documentElement.lang || 'de').slice(0,2);
      const translated = model + ' – ' + (window.MujiRepairLabel ? window.MujiRepairLabel(repair,lang) : repair);
      if (!description.value || description.value === original) description.value = translated;
    });
  };
  const ready = () => {
    applyContext();
    document.querySelectorAll('form[action="https://formsubmit.co/info@mujitech.ch"]').forEach(form => {
      const button = form.querySelector('[type="submit"]');
      let recovery;
      const reset = () => { if (button) {button.disabled = false; button.removeAttribute('aria-busy');} clearTimeout(recovery); };
      form.addEventListener('invalid',event => {
        const field = event.target;
        let details = field.closest('details');
        while(details) {details.open = true; details = details.parentElement.closest('details');}
      },true);
      form.addEventListener('submit',event => {
        // This event only fires after native field validation. Do not claim email receipt.
        queueMicrotask(() => {
          if (event.defaultPrevented) return;
          const kind = form.querySelector('[name="Anfragebereich"]')?.value;
          try {
            if (supported.includes(kind) && ['all','measurement'].includes(localStorage.getItem('mujitech-cookie-consent'))) {
              const area = window.MujiEnquiryArea?.(form);
              const knownAreas = ['repair','gaming_pc','webdesign','device_purchase','private_support','business_it','shop','contact','general'];
              sessionStorage.setItem(pendingKey,JSON.stringify({kind,time:Date.now(),...(knownAreas.includes(area)?{area}: {})}));
            }
          } catch {}
          if (button) {button.disabled = true; button.setAttribute('aria-busy','true');}
          recovery = setTimeout(reset,15000);
        });
      });
      window.addEventListener('pageshow',reset);
    });
    const openTarget = () => {
      let id;
      try {id = decodeURIComponent(location.hash.slice(1));} catch {return;}
      const target = id ? document.getElementById(id) : null;
      if (target?.matches('details.catalog-model')) target.open = true;
    };
    openTarget(); window.addEventListener('hashchange',openTarget);
  };
  document.addEventListener('mujitech-prices-ready',applyContext);
  window.addEventListener('load',applyContext,{once:true});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();

/* Prevent oversized image uploads before the form provider rejects the request. */
(() => {
  'use strict';
  const ready=()=>{
    const form=document.querySelector('#ankaufsformular');if(!form)return;
    const inputs=[...form.querySelectorAll('input[type="file"]')];
    const lang=(document.documentElement.lang||'de').slice(0,2);
    const text={de:['Bitte wähle insgesamt höchstens 10 MB an Bildern aus. Du kannst die Bilder auch später per WhatsApp oder E-Mail senden.','Bitte wähle ein Bild im Format JPEG, PNG, WebP, HEIC oder HEIF.'],en:['Please select no more than 10 MB of photos in total. You can also send photos later by WhatsApp or email.','Please choose a JPEG, PNG, WebP, HEIC or HEIF image.'],fr:['Choisissez au maximum 10 Mo de photos au total. Vous pouvez aussi les envoyer plus tard par WhatsApp ou e-mail.','Choisissez une image JPEG, PNG, WebP, HEIC ou HEIF.'],it:['Scegli al massimo 10 MB di foto in totale. Puoi inviarle anche in seguito via WhatsApp o e-mail.','Scegli un’immagine JPEG, PNG, WebP, HEIC o HEIF.']}[lang]||[];
    const validate=()=>{
      inputs.forEach(input=>input.setCustomValidity(''));
      let size=0,last;
      inputs.forEach(input=>{for(const file of input.files){size+=file.size;last=input;if(!/\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name))input.setCustomValidity(text[1]);}});
      if(size>10000000&&last)last.setCustomValidity(text[0]);
    };
    inputs.forEach(input=>input.addEventListener('change',validate));
    window.addEventListener('pageshow',validate);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

/* Optional enquiry guidance follows the selected service; never edits entered text. */
(() => {
  'use strict';
  const ready=()=>{
    const form=document.querySelector('#kontaktformular');if(!form)return;
    const area=form.querySelector('[name="bereich"]'),note=form.querySelector('#enquiry-guidance');if(!area||!note)return;
    const lang=(document.documentElement.lang||'de').slice(0,2);
    const copy={
      de:{general:'Freiwillige Details helfen bei der ersten Einschätzung.',repair:'Hilfreich sind Gerätemodell, genauer Fehler und seit wann er auftritt.',private:'Hilfreich sind dein bisheriges und gegebenenfalls neues Gerät sowie die gewünschte Unterstützung oder Datenübertragung.',buyback:'Hilfreich sind Modell, Speicher, Zustand, bekannte Mängel und vorhandenes Zubehör.',product:'Nenne das gewünschte Produkt oder Modell. Beim Gaming-PC helfen Spiele, Bildschirmauflösung und dein Budget.',business:'Hilfreich sind die Anzahl betroffener Geräte oder Personen, vorhandene Systeme und das gewünschte Ziel.',web:'Hilfreich sind deine Branche, das Ziel der Website, gewünschte Funktionen und ein bestehender Link, falls vorhanden.',privacy:'Bitte keine Passwörter, PINs oder vertraulichen Unterlagen senden.'},
      en:{general:'Optional details help us assess your enquiry.',repair:'Helpful details include the device model, the exact fault and when it started.',private:'Helpful details include your current and, if relevant, new device, and the support or data transfer you need.',buyback:'Helpful details include the model, storage, condition, known faults and included accessories.',product:'Tell us which product or model you want. For a gaming PC, include your games, screen resolution and budget.',business:'Helpful details include the number of affected devices or people, existing systems and what you want to achieve.',web:'Helpful details include your industry, website goals, required features and an existing website link, if any.',privacy:'Please do not send passwords, PINs or confidential documents.'},
      fr:{general:'Les précisions facultatives facilitent une première évaluation.',repair:'Indiquez, si possible, le modèle de l’appareil, la panne exacte et depuis quand elle se produit.',private:'Précisez votre appareil actuel, le nouvel appareil le cas échéant et l’aide ou le transfert de données souhaité.',buyback:'Le modèle, le stockage, l’état, les défauts connus et les accessoires disponibles sont utiles.',product:'Précisez le produit ou le modèle souhaité. Pour un PC gaming, indiquez vos jeux, la résolution de l’écran et votre budget.',business:'Le nombre d’appareils ou de personnes concernés, les systèmes existants et l’objectif souhaité sont utiles.',web:'Précisez votre secteur, l’objectif du site, les fonctions souhaitées et le lien du site actuel, le cas échéant.',privacy:'N’envoyez pas de mots de passe, de codes PIN ni de documents confidentiels.'},
      it:{general:'I dettagli facoltativi aiutano nella prima valutazione.',repair:'Sono utili il modello del dispositivo, il guasto preciso e da quando si verifica.',private:'Indica il dispositivo attuale, quello nuovo se presente e l’assistenza o il trasferimento di dati desiderato.',buyback:'Sono utili modello, memoria, condizioni, difetti noti e accessori disponibili.',product:'Indica il prodotto o il modello desiderato. Per un PC gaming sono utili giochi, risoluzione dello schermo e budget.',business:'Sono utili il numero di dispositivi o persone interessati, i sistemi esistenti e l’obiettivo desiderato.',web:'Sono utili il tuo settore, l’obiettivo del sito, le funzioni desiderate e il link del sito attuale, se presente.',privacy:'Non inviare password, PIN o documenti riservati.'}
    };
    const groups={repair:['Reparatur'],private:['Privatkunden-Service'],buyback:['Geräteankauf'],product:['Produktanfrage'],business:['IT-Support KMU','IT-Betreuung','Hardware-Beschaffung','Firmenhandys','Telekom-Anfrage','Microsoft 365 / Google Workspace'],web:['Website']};
    const text=copy[lang]||copy.en;
    const sync=()=>{const key=Object.keys(groups).find(key=>groups[key].includes(area.value))||'general';note.textContent=text[key]+' '+text.privacy;};
    area.addEventListener('change',sync);window.addEventListener('pageshow',sync);sync();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

/* Preview refinement: no change to recipient, CAPTCHA or delivery confirmation. */
(() => {
 'use strict';
 const lang=(document.documentElement.lang||'de').slice(0,2);
 const translations={
 de:{contact:'Kontakt',close:'Schliessen',review:'Anfrage prüfen',title:'Deine Anfrage im Überblick',edit:'Angaben bearbeiten',send:'Weiter zur sicheren Übermittlung',note:'Im nächsten Schritt öffnet sich die Sicherheitsprüfung von FormSubmit. Bitte schliesse sie ab. Erst die anschliessende Bestätigung bestätigt die Übermittlung. Bei Problemen kannst du hierher zurückkehren oder uns per E-Mail kontaktieren.',files:'Anhänge',empty:'Keine zusätzlichen Angaben',fallback:'Angabe',privacy:'Keine Passwörter oder vertraulichen Daten mitsenden.'},
 en:{contact:'Contact',close:'Close',review:'Review enquiry',title:'Your enquiry at a glance',edit:'Edit details',send:'Continue to secure submission',note:'The next step opens FormSubmit’s security check. Please complete it. Your enquiry has been submitted only when the following confirmation appears. If anything goes wrong, return here or contact us by email.',files:'Attachments',empty:'No additional details',fallback:'Details',privacy:'Do not include passwords or confidential information.'},
 fr:{contact:'Contact',close:'Fermer',review:'Vérifier la demande',title:'Votre demande en bref',edit:'Modifier les informations',send:'Continuer vers l’envoi sécurisé',note:'La prochaine étape ouvre la vérification de sécurité de FormSubmit. Veuillez la terminer. Seule la confirmation qui suit confirme la transmission. En cas de problème, revenez ici ou contactez-nous par e-mail.',files:'Pièces jointes',empty:'Aucune information supplémentaire',fallback:'Information',privacy:'N’indiquez aucun mot de passe ni donnée confidentielle.'},
 it:{contact:'Contatti',close:'Chiudi',review:'Controlla la richiesta',title:'La tua richiesta in breve',edit:'Modifica i dati',send:'Continua con l’invio sicuro',note:'Il prossimo passaggio apre il controllo di sicurezza di FormSubmit. Completalo per proseguire. Solo la conferma successiva attesta la trasmissione. In caso di problemi, torna qui oppure contattaci via e-mail.',files:'Allegati',empty:'Nessun dettaglio aggiuntivo',fallback:'Informazione',privacy:'Non includere password o dati riservati.'}}
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
  document.querySelectorAll('form[action="https://formsubmit.co/info@mujitech.ch"]').forEach((form,index)=>{
   const submit=form.querySelector('[type="submit"]');if(!submit)return;
   submit.textContent=t.review+' →';
   const review=document.createElement('section');review.className='form-review';review.hidden=true;review.setAttribute('aria-labelledby','muji-review-title-'+index);
   const title=document.createElement('h3');title.id='muji-review-title-'+index;title.tabIndex=-1;title.textContent=t.title;
   const summary=document.createElement('dl'),note=document.createElement('p');note.textContent=t.note;
   const privacy=document.createElement('p');privacy.textContent=t.privacy;
   const actions=document.createElement('div');actions.className='form-review-actions';
   const edit=document.createElement('button');edit.type='button';edit.dataset.edit='';edit.textContent=t.edit;
   const send=document.createElement('button');send.type='button';send.textContent=t.send+' →';
   actions.append(edit,send);review.append(title,summary,note,privacy,actions);form.append(review);
   let approved=false;
   function cancel(){approved=false;review.hidden=true;submit.hidden=false;send.disabled=false;const status=form.querySelector('.form-progress');if(status)status.hidden=true;}
   edit.addEventListener('click',()=>{cancel();submit.focus();});
   form.addEventListener('input',cancel);form.addEventListener('change',cancel);
   send.addEventListener('click',()=>{if(!form.reportValidity())return;approved=true;form.requestSubmit(submit);});
   // Capture stops the old progress/analytics handlers until the visitor approves the summary.
   form.addEventListener('submit',event=>{
    if(approved){approved=false;queueMicrotask(()=>{send.disabled=!event.defaultPrevented;});return;}
    event.preventDefault();event.stopImmediatePropagation();
    summary.replaceChildren();
    Array.from(form.elements).forEach(field=>{
     if(!field.name||field.disabled||['hidden','submit','button','checkbox','radio'].includes(field.type))return;
     let value=field.type==='file'?Array.from(field.files||[]).map(f=>f.name).join(', '):field.tagName==='SELECT'?field.selectedOptions[0]?.textContent:field.value;
     if(!value?.trim())return;
     const label=field.labels?.[0];let caption=label?.textContent?.trim().replace(/\s+/g,' ')||t.fallback;
     if(label?.contains(field))caption=Array.from(label.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ')||t.fallback;
     const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=field.type==='file'?t.files:caption;dd.textContent=value.trim();summary.append(dt,dd);
    });
    review.hidden=false;submit.hidden=true;title.focus();review.scrollIntoView({block:'start',behavior:'auto'});
   },true);
   window.addEventListener('pageshow',cancel);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

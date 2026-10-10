/* Optional GA4 measurement: no tag/request before explicit statistics consent. */
(() => {
  'use strict';
  const ID='G-C2WKE7YV33', KEY='mujitech-cookie-consent';
  const lang=(document.documentElement.lang||'de').slice(0,2);
  const copy={
    de:['Datenschutz & Statistik','Mit Ihrer Zustimmung messen wir Seitenaufrufe, Kontaktklicks und Formularinteraktionen mit Google Analytics. Formularinhalte werden nicht an Analytics gesendet.','Datenschutzhinweise','Nur notwendige','Statistik erlauben'],
    fr:['Confidentialité et statistiques','Avec votre accord, Google Analytics mesure les pages vues, clics de contact et interactions avec les formulaires. Le contenu des formulaires n’est pas transmis à Analytics.','Confidentialité','Uniquement nécessaires','Autoriser les statistiques'],
    it:['Privacy e statistiche','Con il tuo consenso, Google Analytics misura pagine visitate, clic di contatto e interazioni con i moduli. I contenuti dei moduli non vengono inviati ad Analytics.','Privacy','Solo necessari','Consenti statistiche'],
    en:['Privacy and statistics','With your consent, Google Analytics measures page views, contact clicks and form interactions. Form contents are not sent to Analytics.','Privacy information','Necessary only','Allow statistics']
  }[lang] || ['Privacy and statistics','Optional visitor statistics with Google Analytics.','Privacy information','Necessary only','Allow statistics'];
  let allowed=false,loaded=false,banner;
  const cleanURL=location.origin+location.pathname;
  const event=(name,params={})=>{
    if(allowed && window.gtag)window.gtag('event',name,{...params,page_location:cleanURL,page_referrer:referrer(),page_title:document.title});
  };
  function referrer(){try {const u=new URL(document.referrer);return u.origin+u.pathname;}catch{return '';}}
  function activate(){
    allowed=true;window['ga-disable-'+ID]=false;
    if(loaded){window.gtag('consent','update',{analytics_storage:'granted'});return;}
    loaded=true;window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    // Automatic form/link collection is disabled in the stream too; no field values or destination query strings.
    window.gtag('config',ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:cleanURL,page_referrer:referrer()});
    const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(s);
    event('page_view');
  }
  function revoke(){
    allowed=false;window['ga-disable-'+ID]=true;
    if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied'});
    const domains=[location.hostname,'.'+location.hostname,'.mujitech.ch',''];
    const paths=['/'];
    location.pathname.split('/').slice(1,-1).forEach((part,i,arr)=>paths.push('/'+arr.slice(0,i+1).join('/')));
    document.cookie.split(';').forEach(c=>{
      const name=c.split('=')[0].trim();if(!/^_ga(?:_|$)|^_gid$|^_gat/.test(name))return;
      domains.forEach(domain=>paths.forEach(path=>{document.cookie=name+'=; Max-Age=0; path='+path+(domain?'; domain='+domain:'')+'; SameSite=Lax';}));
    });
  }
  function save(value){try{localStorage.setItem(KEY,value);}catch{} if(value==='all')activate();else revoke();banner.hidden=true;}
  function ready(){
    banner=document.createElement('section');banner.className='ch-privacy-banner';banner.setAttribute('role','dialog');banner.setAttribute('aria-label',copy[0]);
    const text=document.createElement('div');const strong=document.createElement('strong');strong.textContent=copy[0];text.append(strong);
    const p=document.createElement('p');p.textContent=copy[1]+' ';const a=document.createElement('a');a.href=(lang==='de'?'/':'/'+lang+'/')+'rechtliches.html#datenschutz';a.textContent=copy[2];p.append(a);text.append(p);
    const actions=document.createElement('div');actions.className='ch-privacy-actions';
    [copy[3],copy[4]].forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>save(i?'all':'necessary'));actions.append(b);});
    banner.append(text,actions);document.body.append(banner);
    let saved;try{saved=localStorage.getItem(KEY);}catch{}
    banner.hidden=saved==='all'||saved==='necessary';if(saved==='all')activate();
    document.querySelectorAll('[data-consent-settings]').forEach(b=>b.addEventListener('click',()=>{banner.hidden=false;actions.firstElementChild.focus();}));
    window.addEventListener('storage',e=>{if(e.key!==KEY)return;if(e.newValue==='all')activate();else revoke();banner.hidden=e.newValue==='all'||e.newValue==='necessary';});
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href]');if(!a)return;
      const href=a.getAttribute('href');
      const channel=href.startsWith('tel:')?'phone':href.startsWith('mailto:')?'email':/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)?'whatsapp':null;
      if(channel){event('contact_click',{contact_channel:channel});return;}
      let u;try{u=new URL(href,location.href);}catch{return;}
      if(u.origin===location.origin && /anfrage|demande|richiesta|request/.test(u.pathname))event('enquiry_open',{target_page:u.pathname});
    });
    document.querySelectorAll('form').forEach((form,index)=>{
      const id=form.id||'form-'+index;let started=false;
      form.addEventListener('focusin',()=>{if(!allowed||started)return;started=true;event('form_start',{form_id:id});});
      // This is an attempt, never presented as a delivered lead.
      form.addEventListener('submit',()=>{event('form_submit_attempt',{form_id:id});});
    });
    const seen=new Set();let pending=false;
    window.addEventListener('scroll',()=>{
      if(!allowed||pending)return;pending=true;
      requestAnimationFrame(()=>{pending=false;const max=document.documentElement.scrollHeight-innerHeight;if(max<=0)return;
        const percent=scrollY/max*100;[25,50,75,90].forEach(n=>{if(percent>=n&&!seen.has(n)){seen.add(n);event('scroll_depth',{percent_scrolled:n});}});
      });
    },{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

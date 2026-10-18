/* Optional GA4 measurement: no tag/request before explicit statistics consent. */
(() => {
  'use strict';
  const ID='G-C2WKE7YV33', KEY='mujitech-cookie-consent';
  const lang=(document.documentElement.lang||'de').slice(0,2);
  const copy={
    de:['Cookies & Datenschutz','Statistik misst Seitenaufrufe, Kontaktklicks und Formularinteraktionen mit Google Analytics. Optional verknüpft Anzeigenmessung mit Google Ads einen Anzeigenklick mit einer späteren Anfrage. Keine personalisierte Werbung; keine Formularinhalte an Analytics.','Datenschutzhinweise','Nur notwendige','Nur Statistik erlauben','Statistik + Anzeigenmessung'],
    fr:['Cookies et confidentialité','Les statistiques mesurent les pages vues, clics de contact et interactions avec Google Analytics. La mesure facultative des annonces avec Google Ads relie un clic publicitaire à une demande ultérieure. Aucune publicité personnalisée ni contenu des formulaires dans Analytics.','Confidentialité','Uniquement nécessaires','Statistiques uniquement','Statistiques + mesure des annonces'],
    it:['Cookie e privacy','Le statistiche misurano pagine visitate, clic di contatto e interazioni con Google Analytics. La misurazione facoltativa con Google Ads collega un clic pubblicitario a una richiesta successiva. Nessuna pubblicità personalizzata; nessun contenuto dei moduli ad Analytics.','Privacy','Solo necessari','Solo statistiche','Statistiche + misurazione annunci'],
    en:['Cookies and privacy','Statistics measure page views, contact clicks and form interactions with Google Analytics. Optional ad measurement with Google Ads links an ad click to a later enquiry. No personalised advertising; no form contents sent to Analytics.','Privacy information','Necessary only','Statistics only','Statistics + ad measurement']
  }[lang] || ['Privacy and statistics','Optional Google Analytics statistics and separate Google Ads measurement. No personalised advertising.','Privacy information','Necessary only','Statistics only','Statistics + ad measurement'];
  let allowed=false,adsAllowed=false,loaded=false,banner,settingsTrigger;
  const cleanURL=location.origin+location.pathname;
  // Only an explicit, separate ad-measurement choice allows standard click identifiers.
  const measuredURL=()=>{
    if(!adsAllowed)return cleanURL;
    const query=new URLSearchParams();
    ['gclid','gbraid','wbraid'].forEach(key=>{
      const values=campaignParams.getAll(key);
      if(values.length===1 && /^[A-Za-z0-9_-]{20,512}$/.test(values[0]))query.set(key,values[0]);
    });
    return cleanURL+(query.size?'?'+query.toString():'');
  };
  // Preserve only approved public campaign labels; never arbitrary URL values.
  const campaignParams=new URLSearchParams(location.search);
  const safeCampaign={};
  const labels={utm_source:['google','bing','instagram','facebook','tiktok','tutti','ricardo','local','search','partner'],utm_medium:['cpc','organic','social','referral','print'],utm_campaign:['local-repairs','local-it','kmu','repair-cases','google-profile','baseline','gaming-pcs','webdesign','device-buyback','iphone-sales','private-support']};
  const fields={utm_source:'campaign_source',utm_medium:'campaign_medium',utm_campaign:'campaign_name'};
  Object.entries(labels).forEach(([key,values])=>{const value=campaignParams.get(key);if(values.includes(value))safeCampaign[fields[key]]=value;});
  const pageName=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  const repairPath=/(?:iphone-(?:screen-repair|battery-replacement|charging-port-repair|display-reparatur|akku-wechseln|ladeanschluss-reparatur)|samsung-(?:screen-repair|battery-replacement|charging-port-repair|display-reparatur|akku-wechseln|ladeanschluss-reparatur)|reparation-(?:ecran|connecteur-charge)|remplacement-batterie|riparazione-(?:display|connettore-ricarica)|sostituzione-batteria|reparaturpreise-|repair-prices-|tarifs-reparation-|prezzi-riparazione-)/.test(pageName);
  const confirmationArea=pageName==='danke.html'&&['repair','gaming_pc','webdesign','device_purchase','private_support','contact'].includes(new URLSearchParams(location.search).get('form'))?new URLSearchParams(location.search).get('form'):null;
  const serviceArea=({'anfrage.html':'repair','reparaturanfrage.html':'repair','reparaturen.html':'repair','preise.html':'repair','reparatur-schweiz.html':'repair','geraet-verkaufen.html':'device_purchase','privatkunden.html':'private_support','unternehmen.html':'business_it','websites.html':'webdesign','shop.html':'shop','iphones.html':'shop','iphone-14-pro-max.html':'shop','iphone-17-pro-max.html':'shop','kontakt.html':'contact'})[pageName]||confirmationArea||(pageName.startsWith('gaming-pc')||pageName==='computer.html'?'gaming_pc':repairPath?'repair':'general');
  const areas=new Set(['repair','gaming_pc','webdesign','device_purchase','private_support','business_it','shop','contact','general']);
  // Only fixed option values become analytics categories; never send free-form input.
  const contactAreas={'Reparatur':'repair','Privatkunden-Service':'private_support','Geräteankauf':'device_purchase','Produktanfrage':'shop','IT-Support KMU':'business_it','IT-Betreuung':'business_it','Hardware-Beschaffung':'business_it','Firmenhandys':'business_it','Telekom-Anfrage':'business_it','Website':'webdesign','Microsoft 365 / Google Workspace':'business_it','Sonstiges':'contact'};
  const categoryFor=value=>Object.prototype.hasOwnProperty.call(contactAreas,value)?contactAreas[value]:null;
  const pageArea=()=>pageName==='kontakt.html'?(categoryFor(document.querySelector('select[name="bereich"]')?.value)||categoryFor(campaignParams.get('service'))||(location.hash==='#business'?'business_it':'contact')):serviceArea;
  const enquiryArea=form=>categoryFor(form?.querySelector?.('select[name="bereich"]')?.value)||pageArea();
  window.MujiEnquiryArea=enquiryArea;
  const event=(name,params={})=>{
    if(allowed && window.gtag)window.gtag('event',name,{...params,service_area:areas.has(params.service_area)?params.service_area:pageArea(),page_location:measuredURL(),page_referrer:referrer(),page_title:document.title});
  };
  function productItem(){
    let product;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script=>{try{const obj=JSON.parse(script.textContent);const found=(obj['@graph']||[obj]).find(n=>n['@type']==='Product');if(found)product=found;}catch{}});
    if(!product)return null;
    const info=document.querySelector('[data-product-sku]');
    const price=Number(product.offers?.price||info?.dataset.productPrice);
    return {item_id:product.sku||product['@id']||location.pathname,item_name:product.name,item_brand:product.brand?.name||product.manufacturer?.name||'Mujitech',item_category:serviceArea==='gaming_pc'?'Gaming PCs':'Smartphones',...(Number.isFinite(price)?{price}: {})};
  }
  function referrer(){try {const u=new URL(document.referrer);return u.origin+u.pathname;}catch{return '';}}
  let confirmationRecorded=false;
  function confirmation(){
    if(confirmationRecorded || pageName!=='danke.html')return;
    const kind=new URLSearchParams(location.search).get('form');
    if(!['repair','gaming_pc','webdesign','device_purchase','private_support','contact'].includes(kind))return;
    try {
      const pending=JSON.parse(sessionStorage.getItem('mujitech-pending-enquiry')||'null');
      if(!pending || pending.kind!==kind || !Number.isFinite(pending.time) || Date.now()-pending.time<0 || Date.now()-pending.time>30*60*1000)return;
      event('form_confirmation_view',{form_id:kind,confirmation_type:'provider_redirect',service_area:areas.has(pending.area)?pending.area:serviceArea});
      confirmationRecorded=true;
      sessionStorage.removeItem('mujitech-pending-enquiry');
    }catch{}
  }
  function activate(withAds=false){
    const hadAds=adsAllowed;adsAllowed=withAds;
    allowed=true;window['ga-disable-'+ID]=false;
    const consent={analytics_storage:'granted',ad_storage:adsAllowed?'granted':'denied',ad_user_data:adsAllowed?'granted':'denied',ad_personalization:'denied'};
    const config={...safeCampaign,send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:measuredURL(),page_referrer:referrer()};
    if(loaded){
      window.gtag('consent','update',consent);
      if(hadAds&&!adsAllowed)clearCookies(/^_gcl_|^_gac_/);
      window.gtag('config',ID,config);confirmation();return;
    }
    loaded=true;window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',consent);
    window.gtag('js',new Date());
    // Automatic form/link collection is disabled in the stream too; no field values or destination query strings.
    window.gtag('config',ID,config);
    const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(s);
    event('page_view');
    confirmation();
    const item=productItem();if(item)event('view_item',{currency:'CHF',value:item.price,items:[item]});
  }
  function revoke(){
    allowed=false;adsAllowed=false;window['ga-disable-'+ID]=true;
    try{sessionStorage.removeItem('mujitech-pending-enquiry');}catch{}
    if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    clearCookies(/^_ga(?:_|$)|^_gid$|^_gat|^_gcl_|^_gac_/);
  }
  function clearCookies(pattern){
    const domains=[location.hostname,'.'+location.hostname,'.mujitech.ch',''];
    const paths=['/'];
    location.pathname.split('/').slice(1,-1).forEach((part,i,arr)=>paths.push('/'+arr.slice(0,i+1).join('/')));
    document.cookie.split(';').forEach(c=>{
      const name=c.split('=')[0].trim();if(!pattern.test(name))return;
      domains.forEach(domain=>paths.forEach(path=>{document.cookie=name+'=; Max-Age=0; path='+path+(domain?'; domain='+domain:'')+'; SameSite=Lax';}));
    });
  }
  function applyChoice(value){if(value==='all'||value==='measurement')activate(value==='measurement');else revoke();}
  function save(value){try{localStorage.setItem(KEY,value);}catch{} applyChoice(value);banner.hidden=true;if(settingsTrigger){settingsTrigger.focus();settingsTrigger=null;}}
  function ready(){
    banner=document.createElement('section');banner.className='ch-privacy-banner';banner.style.zIndex='1000';banner.setAttribute('role','dialog');banner.setAttribute('aria-label',copy[0]);banner.setAttribute('aria-describedby','cookie-description');
    const text=document.createElement('div');const strong=document.createElement('strong');strong.textContent=copy[0];text.append(strong);
    const p=document.createElement('p');p.id='cookie-description';p.textContent=copy[1]+' ';const a=document.createElement('a');a.href=(lang==='de'?'/':'/'+lang+'/')+'rechtliches.html#datenschutz';a.textContent=copy[2];p.append(a);text.append(p);
    const actions=document.createElement('div');actions.className='ch-privacy-actions';
    [copy[3],copy[4],copy[5]].forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>save(['necessary','all','measurement'][i]));actions.append(b);});
    banner.append(text,actions);document.body.append(banner);
    let saved;try{saved=localStorage.getItem(KEY);}catch{}
    banner.hidden=['all','measurement','necessary'].includes(saved);if(saved==='all'||saved==='measurement')applyChoice(saved);
    document.querySelectorAll('[data-consent-settings]').forEach(b=>b.addEventListener('click',()=>{settingsTrigger=b;banner.hidden=false;actions.firstElementChild.focus();}));
    window.addEventListener('storage',e=>{if(e.key!==KEY)return;applyChoice(e.newValue);banner.hidden=['all','measurement','necessary'].includes(e.newValue);});
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href]');if(!a)return;
      const href=a.getAttribute('href');
      const channel=href.startsWith('tel:')?'phone':href.startsWith('mailto:')?'email':/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)?'whatsapp':null;
      if(channel){const item=productItem();event('contact_click',{contact_channel:channel,...(item?{currency:'CHF',value:item.price,items:[item]}:{})});return;}
      let u;try{u=new URL(href,location.href);}catch{return;}
      const card=a.closest('.gaming-card[data-product-sku]');if(card&&u.origin===location.origin)event('select_item',{item_list_id:'gaming-pcs',items:[{item_id:card.dataset.productSku,item_name:card.querySelector('h3')?.textContent.trim(),item_category:'Gaming PCs',price:Number(card.dataset.price)}]});
      if(u.origin===location.origin && (/anfrage|demande|richiesta|request/.test(u.pathname)||u.hash==='#anfrage'))event('enquiry_open',{target_page:u.pathname});
    });
    // Delegation also covers forms added by MujiBot after page load.
    const startedForms=new WeakSet();
    const formID=form=>form.classList.contains('mujibot-callback')?'mujibot-callback':form.classList.contains('mujibot-form')?'mujibot-question':form.id||'website-form';
    document.addEventListener('focusin',e=>{const form=e.target.closest('form');if(!form||!allowed||startedForms.has(form))return;startedForms.add(form);event('form_start',{form_id:formID(form),service_area:enquiryArea(form)});});
    document.addEventListener('submit',e=>{const form=e.target;if(e.defaultPrevented||!form.matches('form')||form.closest('.mujibot'))return;event('form_submit_attempt',{form_id:formID(form),service_area:enquiryArea(form)});});
    // Only fixed action labels are accepted. No chat or callback field contents.
    document.addEventListener('mujitech-action',e=>{const detail=e.detail||{};if(!['mujibot_open','mujibot_price_view','callback_request_open','repair_price_view'].includes(detail.type))return;const params={};if(['email','whatsapp'].includes(detail.channel))params.contact_channel=detail.channel;if(detail.type==='callback_request_open')params.form_id='mujibot-callback';event(detail.type,params);});
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

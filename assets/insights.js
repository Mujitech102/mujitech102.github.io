/* Optional GA4 measurement: no tag/request before explicit statistics consent. */
(() => {
  'use strict';
  const ID='G-C2WKE7YV33', KEY='mujitech-cookie-consent';
  const lang=(document.documentElement.lang||'de').slice(0,2);
  const copy={
    de:['Cookies & Datenschutz','Mit Ihrer Zustimmung messen wir Seitenaufrufe, Kontaktklicks und Formularinteraktionen mit Google Analytics. Formularinhalte werden nicht an Analytics gesendet.','Datenschutzhinweise','Nur notwendige','Statistik erlauben'],
    fr:['Cookies et confidentialité','Avec votre accord, Google Analytics mesure les pages vues, clics de contact et interactions avec les formulaires. Le contenu des formulaires n’est pas transmis à Analytics.','Confidentialité','Uniquement nécessaires','Autoriser les statistiques'],
    it:['Cookie e privacy','Con il tuo consenso, Google Analytics misura pagine visitate, clic di contatto e interazioni con i moduli. I contenuti dei moduli non vengono inviati ad Analytics.','Privacy','Solo necessari','Consenti statistiche'],
    en:['Cookies and privacy','With your consent, Google Analytics measures page views, contact clicks and form interactions. Form contents are not sent to Analytics.','Privacy information','Necessary only','Allow statistics']
  }[lang] || ['Privacy and statistics','Optional visitor statistics with Google Analytics.','Privacy information','Necessary only','Allow statistics'];
  let allowed=false,loaded=false,banner,settingsTrigger;
  const cleanURL=location.origin+location.pathname;
  // Preserve only approved public campaign labels; never arbitrary URL values.
  const campaignParams=new URLSearchParams(location.search);
  const safeCampaign={};
  const labels={utm_source:['google','instagram','tiktok','tutti','ricardo','local','partner'],utm_medium:['cpc','organic','social','referral','print'],utm_campaign:['local-repairs','local-it','kmu','repair-cases','google-profile','baseline','gaming-pcs']};
  const fields={utm_source:'campaign_source',utm_medium:'campaign_medium',utm_campaign:'campaign_name'};
  Object.entries(labels).forEach(([key,values])=>{const value=campaignParams.get(key);if(values.includes(value))safeCampaign[fields[key]]=value;});
  const pageName=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  const serviceArea=({'anfrage.html':'repair','reparaturanfrage.html':'repair','reparaturen.html':'repair','preise.html':'repair','reparatur-schweiz.html':'repair','geraet-verkaufen.html':'device_purchase','privatkunden.html':'private_support','unternehmen.html':'business_it','websites.html':'webdesign','shop.html':'shop','iphone-14-pro-max.html':'shop','iphone-17-pro-max.html':'shop'})[pageName]||(pageName.startsWith('gaming-pc')||pageName==='computer.html'?'gaming_pc':'general');
  const event=(name,params={})=>{
    if(allowed && window.gtag)window.gtag('event',name,{...params,service_area:serviceArea,page_location:cleanURL,page_referrer:referrer(),page_title:document.title});
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
  function activate(){
    allowed=true;window['ga-disable-'+ID]=false;
    if(loaded){window.gtag('consent','update',{analytics_storage:'granted'});return;}
    loaded=true;window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    // Automatic form/link collection is disabled in the stream too; no field values or destination query strings.
    window.gtag('config',ID,{...safeCampaign,send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:cleanURL,page_referrer:referrer()});
    const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(s);
    event('page_view');
    const item=productItem();if(item)event('view_item',{currency:'CHF',value:item.price,items:[item]});
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
  function save(value){try{localStorage.setItem(KEY,value);}catch{} if(value==='all')activate();else revoke();banner.hidden=true;if(settingsTrigger){settingsTrigger.focus();settingsTrigger=null;}}
  function ready(){
    banner=document.createElement('section');banner.className='ch-privacy-banner';banner.style.zIndex='1000';banner.setAttribute('role','dialog');banner.setAttribute('aria-label',copy[0]);banner.setAttribute('aria-describedby','cookie-description');
    const text=document.createElement('div');const strong=document.createElement('strong');strong.textContent=copy[0];text.append(strong);
    const p=document.createElement('p');p.id='cookie-description';p.textContent=copy[1]+' ';const a=document.createElement('a');a.href=(lang==='de'?'/':'/'+lang+'/')+'rechtliches.html#datenschutz';a.textContent=copy[2];p.append(a);text.append(p);
    const actions=document.createElement('div');actions.className='ch-privacy-actions';
    [copy[3],copy[4]].forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>save(i?'all':'necessary'));actions.append(b);});
    banner.append(text,actions);document.body.append(banner);
    let saved;try{saved=localStorage.getItem(KEY);}catch{}
    banner.hidden=saved==='all'||saved==='necessary';if(saved==='all')activate();
    document.querySelectorAll('[data-consent-settings]').forEach(b=>b.addEventListener('click',()=>{settingsTrigger=b;banner.hidden=false;actions.firstElementChild.focus();}));
    window.addEventListener('storage',e=>{if(e.key!==KEY)return;if(e.newValue==='all')activate();else revoke();banner.hidden=e.newValue==='all'||e.newValue==='necessary';});
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
    document.addEventListener('focusin',e=>{const form=e.target.closest('form');if(!form||!allowed||startedForms.has(form))return;startedForms.add(form);event('form_start',{form_id:formID(form)});});
    document.addEventListener('submit',e=>{const form=e.target;if(!form.matches('form')||form.closest('.mujibot'))return;event('form_submit_attempt',{form_id:formID(form)});});
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

/* Pure unit tests: no browser, network requests, personal data or live submissions. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/insights.js'),'utf8');
function storage(initial={}){
 const data=new Map(Object.entries(initial));
 return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key),data};
}
function fixture({consent,pathname='/fr/reparation-ecran-iphone.html',search='?email=PRIVATE_EMAIL&utm_source=google&utm_medium=organic&utm_campaign=local-repairs',hash='',pending,selectedArea,lang='fr-CH',cookies={},hostname='mujitech.ch',protocol='https:',session={},blockedStorage=false}={}){
 const listeners={},windowListeners={},scripts=[],banners=[],cookieWrites=[];
 const cookieJar=new Map(Object.entries(cookies));
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.attributes={};this.style={};this.classList={contains:()=>false};}
  append(...children){this.children.push(...children);}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(k,cb){this.listeners[k]=cb;}
  focus(){}
  get firstElementChild(){return this.children[0];}
 }
 const areaSelect=selectedArea===undefined?null:{value:selectedArea};
 const document={title:'Repair page',documentElement:{lang,scrollHeight:2000},referrer:'https://example.test/path?secret=PRIVATE_REFERRER#private',readyState:'complete',createElement:tag=>new Element(tag),head:{append:el=>scripts.push(el)},body:{append:el=>banners.push(el)},querySelectorAll:()=>[],querySelector:selector=>selector==='select[name="bereich"]'?areaSelect:null,addEventListener:(k,cb)=>{listeners[k]=cb;}};
 Object.defineProperty(document,'cookie',{get:()=>[...cookieJar].map(([k,v])=>k+'='+v).join('; '),set:value=>{cookieWrites.push(value);const [k,v]=value.split(';')[0].split('=');if(value.includes('Max-Age=0'))cookieJar.delete(k);else cookieJar.set(k,v);}});
 const localStorage=storage(consent?{'mujitech-cookie-consent':consent}:{});
 const sessionStorage=storage({...session,...(pending?{'mujitech-pending-enquiry':JSON.stringify(pending)}:{})});
 if(blockedStorage)for(const key of ['getItem','setItem','removeItem'])sessionStorage[key]=()=>{throw new Error('storage blocked');};
 const origin=protocol+'//'+hostname;
 const context={document,location:{origin,hostname,protocol,href:origin+pathname+search+hash,pathname,search,hash},crypto:require('node:crypto').webcrypto,Uint8Array,URL,URLSearchParams,Date,Number,JSON,Set,WeakSet,localStorage,sessionStorage,innerHeight:800,scrollY:0,requestAnimationFrame:fn=>fn(),addEventListener:(k,cb)=>{windowListeners[k]=cb;}};
 context.window=context;vm.runInNewContext(source,context);
 const events=()=>Array.from(context.dataLayer||[]).filter(x=>x[0]==='event').map(x=>({name:x[1],params:x[2]}));
 return {context,document,listeners,windowListeners,scripts,banners,events,localStorage,sessionStorage,areaSelect,cookieWrites,cookieJar};
}

function click(f, href) {
 f.listeners.click({target:{closest:()=>({getAttribute:()=>href})}});
}
let f=fixture();
assert.equal(f.scripts.length,0);
assert.equal(f.events().length,0);
for(const campaign of ['webdesign','device-buyback','iphone-sales','private-support']){
 f=fixture({consent:'all',search:'?utm_source=google&utm_medium=organic&utm_campaign='+campaign});
 assert.equal(Array.from(f.context.dataLayer).find(x=>x[0]==='config')[2].campaign_name,campaign);
}
// Existing statistics choices never become advertising consent after an update.
const clickID='EAIaIQobChMI_TEST_CLICK_ID_20261018';
const consentCommands=f=>Array.from(f.context.dataLayer||[]).filter(x=>x[0]==='consent');
f=fixture({consent:'all',search:'?gclid='+clickID});
assert.equal(consentCommands(f)[0][2].ad_user_data,'denied');
assert.equal(consentCommands(f)[0][2].ad_storage,'denied');
assert.ok(!JSON.stringify(f.context.dataLayer).includes(clickID));
for(const lang of ['de-CH','en','fr-CH','it-CH']){
 for(const [i,value] of ['necessary','all','measurement'].entries()){
  f=fixture({lang,search:'?gclid='+clickID+'&email=PRIVATE_EMAIL'});
  const buttons=f.banners[0].children[1].children;
  assert.equal(buttons.length,3);assert.ok(buttons.every(b=>b.textContent));
  assert.equal(f.scripts.length,0);buttons[i].listeners.click();
  assert.equal(f.localStorage.getItem('mujitech-cookie-consent'),value);
  assert.equal(f.scripts.length,i?1:0);
  if(i){const c=consentCommands(f)[0][2];assert.equal(c.ad_user_data,i===2?'granted':'denied');assert.equal(c.ad_storage,c.ad_user_data);assert.equal(c.ad_personalization,'denied');}
  assert.ok(!JSON.stringify(f.context.dataLayer||[]).includes('PRIVATE_'));
 }
}
f=fixture({consent:'measurement',search:'?gclid='+clickID+'&gbraid='+clickID+'&wbraid='+clickID+'&email=PRIVATE_EMAIL',hash:'#PRIVATE_FRAGMENT'});
const measured=new URL(f.events()[0].params.page_location);
assert.deepEqual([...measured.searchParams.keys()],['gclid','gbraid','wbraid']);
assert.equal(measured.searchParams.get('gclid'),clickID);
for(const search of ['?gclid=PRIVATE_EMAIL','?gclid=person%40example.com','?gclid='+clickID+'%0A','?gclid='+'A'.repeat(513),'?gclid='+clickID+'&gclid='+clickID]){
 f=fixture({consent:'measurement',search});assert.equal(f.events()[0].params.page_location,'https://mujitech.ch/fr/reparation-ecran-iphone.html');
}
f=fixture({consent:'measurement',search:'?gclid='+clickID,cookies:{_ga:'keep-for-statistics',_gcl_aw:'remove',_gac_test:'remove',unrelated:'keep'}});
f.windowListeners.storage({key:'mujitech-cookie-consent',newValue:'all'});
assert.equal(consentCommands(f).at(-1)[2].ad_user_data,'denied');
assert.equal(f.cookieJar.has('_gcl_aw'),false);assert.equal(f.cookieJar.has('_gac_test'),false);assert.equal(f.cookieJar.has('_ga'),true);
click(f, 'mailto:info@mujitech.ch');assert.equal(f.events().at(-1).params.page_location,'https://mujitech.ch/fr/reparation-ecran-iphone.html');
f.windowListeners.storage({key:'mujitech-cookie-consent',newValue:'necessary'});
assert.equal(f.cookieJar.has('_ga'),false);assert.equal(f.cookieJar.get('unrelated'),'keep');
assert.equal(consentCommands(f).at(-1)[2].ad_storage,'denied');
const stopped=f.events().length;click(f, 'mailto:info@mujitech.ch');assert.equal(f.events().length,stopped);
f=fixture({consent:'all',search:'?gclid='+clickID});
f.windowListeners.storage({key:'mujitech-cookie-consent',newValue:'measurement'});
assert.equal(f.scripts.length,1);assert.equal(f.events().filter(e=>e.name==='page_view').length,1);
assert.equal(consentCommands(f).at(-1)[2].ad_user_data,'granted');

// Direct contact clicks are intermediate actions, gated by statistics consent.
const areas={
 'anfrage.html':'repair','reparaturanfrage.html':'repair','mujitech-service.html':'repair',
 'repair-request.html':'repair','demande-reparation.html':'repair','richiesta-riparazione.html':'repair',
 'repair-switzerland.html':'repair','reparation-suisse.html':'repair','riparazione-svizzera.html':'repair',
 'laptop-computer-reparatur.html':'repair','laptop-computer-repair.html':'repair',
 'reparation-ordinateur-portable.html':'repair','riparazione-computer-portatili.html':'repair',
 'computer-langsam-hilfe.html':'private_support','slow-computer-help.html':'private_support',
 'ordinateur-lent-assistance.html':'private_support','computer-lento-assistenza.html':'private_support',
 'onlineshop-erstellen.html':'webdesign','online-store-development.html':'webdesign',
 'creation-boutique-en-ligne.html':'webdesign','creazione-ecommerce.html':'webdesign',
 'websites.html':'webdesign','unternehmen.html':'business_it','geraet-verkaufen.html':'device_purchase',
 'gaming-pcs.html':'gaming_pc','iphones.html':'shop','kontakt.html':'contact'
};
let cases=0;
for(const [language,prefix] of [['de-CH',''],['en','en/'],['fr-CH','fr/'],['it-CH','it/']]){
 for(const [name,area] of Object.entries(areas)){
  if(!fs.existsSync(path.join(__dirname,'..',prefix,name)))continue;
  for(const consent of ['necessary','all','measurement']){
   f=fixture({lang:language,pathname:'/'+prefix+name,search:'',consent});
   click(f,'mailto:info@mujitech.ch?body=PRIVATE_MESSAGE');
   click(f,'tel:+41768444673');
   if(consent==='necessary'){assert.equal(f.events().length,0);continue;}
   const events=f.events().filter(e=>e.name==='contact_click');
   assert.equal(events.length,2);
   assert.deepEqual(events.map(e=>e.params.contact_channel),['email','phone']);
   for(const event of events){
    assert.equal(event.params.service_area,area,prefix+name);
    assert.equal(event.params.funnel_stage,'contact_click');
    assert.equal(event.params.lead_verified,0);
   }
   assert.ok(!JSON.stringify(f.context.dataLayer).includes('PRIVATE_'));
   cases++;
  }
 }
 for(const consent of [undefined,'necessary','all','measurement']){
  f=fixture({lang:language,pathname:'/'+prefix+'anfrage.html',search:'?muji_test=1',consent});
  click(f,'mailto:info@mujitech.ch');click(f,'tel:+41768444673');
  assert.equal(f.scripts.length,0);assert.equal(f.events().length,0);
  f=fixture({lang:language,pathname:'/'+prefix+'danke.html',search:'?form=repair',consent,pending:{kind:'repair',time:Date.now()}});
  assert.equal(f.sessionStorage.getItem('mujitech-pending-enquiry'),null);
  assert.ok(f.events().every(e=>!['form_confirmation_view','generate_lead','purchase'].includes(e.name)));
  assert.equal(f.listeners.submit,undefined);
  assert.equal(f.listeners.focusin,undefined);
 }
}
for(const hostname of ['localhost','127.0.0.1','[::1]']){
 f=fixture({consent:'measurement',hostname,search:'?muji_test=0'});
 assert.equal(f.scripts.length,0);assert.equal(f.events().length,0);
}
f=fixture({consent:'all',session:{'mujitech-measurement-test':'1'},search:''});
assert.equal(f.scripts.length,0);
f=fixture({consent:'all',session:{'mujitech-measurement-test':'1'},search:'?muji_test=0'});
assert.equal(f.context.MujiMeasurementIsTest(),false);assert.equal(f.scripts.length,1);
for(const [service,area] of [['Website','webdesign'],['IT-Support KMU','business_it'],['PRIVATE_EMAIL','contact']]){
 f=fixture({consent:'all',pathname:'/kontakt.html',search:'?service='+encodeURIComponent(service)});
 click(f,'mailto:info@mujitech.ch');
 assert.equal(f.events().at(-1).params.service_area,area);
 assert.ok(!JSON.stringify(f.context.dataLayer).includes('PRIVATE_'));
}
f=fixture({consent:'all',search:'?muji_test=1',blockedStorage:true});
const internal={href:'https://mujitech.ch/it/anfrage.html?model=iPhone+15#reparatur',getAttribute(){return this.href;},setAttribute(k,v){this.href=v;},closest:()=>null};
f.listeners.click({target:{closest:()=>internal}});
assert.equal(new URL(internal.href).searchParams.get('muji_test'),'1');
assert.equal(new URL(internal.href).searchParams.get('model'),'iPhone 15');
const external={...internal,href:'https://example.test/help'};
f.listeners.click({target:{closest:()=>external}});
assert.equal(external.href,'https://example.test/help');
console.log('PASS: '+cases+' consent/page/language contact cases; four-language QA exclusion; no legacy form confirmations; category, consent withdrawal, campaign and privacy regressions.');

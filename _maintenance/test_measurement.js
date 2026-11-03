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
let f=fixture();assert.equal(f.scripts.length,0);assert.equal(f.events().length,0);
f=fixture({consent:'necessary'});assert.equal(f.scripts.length,0);assert.equal(f.events().length,0);
f=fixture({consent:'all'});assert.equal(f.scripts.length,1);assert.equal(f.events()[0].name,'page_view');assert.equal(f.events()[0].params.service_area,'repair');assert.equal(f.events()[0].params.page_location,'https://mujitech.ch/fr/reparation-ecran-iphone.html');assert.equal(f.events()[0].params.page_referrer,'https://example.test/path');
const form={id:'repair-enquiry',classList:{contains:()=>false},matches:s=>s==='form',closest:()=>null};
f.listeners.focusin({target:{closest:()=>form,value:'PRIVATE_NAME'}});
f.listeners.submit({target:form});
f.listeners.click({target:{closest:()=>({getAttribute:()=> 'mailto:info@mujitech.ch?body=PRIVATE_MESSAGE'})}});
assert.deepEqual(f.events().map(x=>x.name),['page_view','form_start','form_submit_attempt','contact_click']);
assert.ok(!JSON.stringify(f.context.dataLayer).includes('PRIVATE_'));
const good={kind:'repair',time:Date.now()};
f=fixture({consent:'all',pathname:'/fr/danke.html',search:'?form=repair&email=PRIVATE_EMAIL',pending:good});
assert.equal(f.events().filter(x=>x.name==='form_confirmation_view').length,1);assert.equal(f.events().find(x=>x.name==='form_confirmation_view').params.service_area,'repair');assert.equal(f.sessionStorage.getItem('mujitech-pending-enquiry'),null);
f.windowListeners.storage({key:'mujitech-cookie-consent',newValue:'all'});assert.equal(f.events().filter(x=>x.name==='form_confirmation_view').length,1);
for(const pending of [undefined,{kind:'gaming_pc',time:Date.now()},{kind:'repair',time:Date.now()-31*60*1000},{kind:'repair',time:Date.now()+60000}]){
 f=fixture({consent:'all',pathname:'/danke.html',search:'?form=repair',pending});assert.equal(f.events().filter(x=>x.name==='form_confirmation_view').length,0);
}
f=fixture({consent:'all'});f.windowListeners.storage({key:'mujitech-cookie-consent',newValue:'necessary'});const count=f.events().length;f.listeners.submit({target:form});assert.equal(f.events().length,count);assert.equal(f.context['ga-disable-G-C2WKE7YV33'],true);
// A contact page represents several services; categorise the actual choice at submission.
const choices={'Reparatur':'repair','Privatkunden-Service':'private_support','Geräteankauf':'device_purchase','Produktanfrage':'shop','IT-Support KMU':'business_it','IT-Betreuung':'business_it','Hardware-Beschaffung':'business_it','Firmenhandys':'business_it','Telekom-Anfrage':'business_it','Website':'webdesign','Microsoft 365 / Google Workspace':'business_it','Sonstiges':'contact'};
for(const prefix of ['','/en','/fr','/it']){
 const html=fs.readFileSync(path.join(__dirname,'..',prefix.slice(1),'kontakt.html'),'utf8');
 const select=html.match(/<select\b[^>]*name="bereich"[^>]*>([\s\S]*?)<\/select>/);
 assert.ok(select,'contact area selector exists in '+prefix);
 const actualChoices=Array.from(select[1].matchAll(/<option\b[^>]*value="([^"]+)"/g),match=>match[1]);
 assert.deepEqual(actualChoices.sort(),Object.keys(choices).sort(),'all published options are categorised in '+prefix);
 for(const [choice,expected] of Object.entries(choices)){
  f=fixture({consent:'all',pathname:prefix+'/kontakt.html',selectedArea:''});
  const contactForm={...form,id:'contact-form',querySelector:selector=>selector==='select[name="bereich"]'?f.areaSelect:null};
  f.listeners.focusin({target:{closest:()=>contactForm}});
  f.areaSelect.value=choice;
  f.listeners.submit({target:contactForm});
  assert.equal(f.events().at(-1).params.service_area,expected);
  assert.equal(f.context.MujiEnquiryArea(contactForm),expected);
 }
 f=fixture({consent:'all',pathname:prefix+'/iphones.html'});
 assert.equal(f.events()[0].params.service_area,'shop');
}
for(const selectedArea of ['PRIVATE_EMAIL','__proto__','constructor']){
 f=fixture({consent:'all',pathname:'/kontakt.html',selectedArea,search:'?service=PRIVATE_QUERY'});
 assert.equal(f.events()[0].params.service_area,'contact');
 assert.ok(!JSON.stringify(f.context.dataLayer).includes('PRIVATE_'));
}
f=fixture({consent:'all',pathname:'/kontakt.html',search:'?service=IT-Support%20KMU'});
assert.equal(f.events()[0].params.service_area,'business_it');
f=fixture({consent:'all',pathname:'/kontakt.html',hash:'#business',search:''});
assert.equal(f.events()[0].params.service_area,'business_it');
for(const [area,expected] of [['business_it','business_it'],['webdesign','webdesign'],['PRIVATE_AREA','contact'],[undefined,'contact']]){
 f=fixture({consent:'all',pathname:'/danke.html',search:'?form=contact',pending:{kind:'contact',area,time:Date.now()}});
 const event=f.events().find(x=>x.name==='form_confirmation_view');
 assert.equal(event.params.service_area,expected);
 assert.ok(!JSON.stringify(f.context.dataLayer).includes('PRIVATE_'));
}
f=fixture({consent:'all'});f.listeners.submit({target:form,defaultPrevented:true});
assert.equal(f.events().filter(x=>x.name==='form_submit_attempt').length,0);
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
f.listeners.submit({target:form});assert.equal(f.events().at(-1).params.page_location,'https://mujitech.ch/fr/reparation-ecran-iphone.html');
f.windowListeners.storage({key:'mujitech-cookie-consent',newValue:'necessary'});
assert.equal(f.cookieJar.has('_ga'),false);assert.equal(f.cookieJar.get('unrelated'),'keep');
assert.equal(consentCommands(f).at(-1)[2].ad_storage,'denied');
const stopped=f.events().length;f.listeners.submit({target:form});assert.equal(f.events().length,stopped);
f=fixture({consent:'all',search:'?gclid='+clickID});
f.windowListeners.storage({key:'mujitech-cookie-consent',newValue:'measurement'});
assert.equal(f.scripts.length,1);assert.equal(f.events().filter(e=>e.name==='page_view').length,1);
assert.equal(consentCommands(f).at(-1)[2].ad_user_data,'granted');
// Exercise the actual form-return-marker code with both affirmative choices.
const enhancementSource=fs.readFileSync(path.join(__dirname,'../assets/enhancements.js'),'utf8');
const markerAt=enhancementSource.indexOf("  const supported = ['repair'");
const markerStart=enhancementSource.lastIndexOf('(() => {',markerAt);
const markerSource=enhancementSource.slice(markerStart,enhancementSource.indexOf('})();',markerAt)+5);
function bindForm(f,kind='contact',next='https://mujitech.ch/danke.html?form=contact'){
 const handlers={},button={setAttribute(){},removeAttribute(){},disabled:false};
 const fields=new Map([['Anfragebereich',{value:kind}],['_next',{value:next}]]);
 const actualForm={querySelector:s=>s==='[type="submit"]'?button:fields.get(s.match(/^\[name="([^"]+)"\]$/)?.[1])||null,append:field=>fields.set(field.name,field),addEventListener:(name,cb)=>{handlers[name]=cb;}};
 f.document.querySelectorAll=s=>s.startsWith('form[action=')?[actualForm]:[];
 f.document.getElementById=()=>null;
 Object.assign(f.context,{queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout:()=>{}});
 vm.runInNewContext(markerSource,f.context);
 return {handlers,fields,button};
}
for(const consent of ['necessary','all','measurement']){
 for(const cancelled of [false,true]){
  f=fixture({consent,pathname:'/kontakt.html',selectedArea:'IT-Support KMU'});
  const {handlers,fields}=bindForm(f);
  assert.match(fields.get('Anfrage_Referenz').value,/^MJ-[a-f0-9-]{32,36}$/);
  assert.equal(fields.get('Messmodus').value,'production');
  handlers.submit({defaultPrevented:cancelled});
  const marker=JSON.parse(f.sessionStorage.getItem('mujitech-pending-enquiry')||'null');
  assert.equal(Boolean(marker),consent!=='necessary'&&!cancelled);
  if(marker){assert.equal(marker.area,'business_it');assert.equal(marker.kind,'contact');assert.equal(marker.test,false);
   const returnPage=fixture({consent,pathname:'/danke.html',search:'?form=contact',pending:marker});
   assert.equal(returnPage.events().filter(e=>e.name==='form_confirmation_view').length,1);
   assert.equal(returnPage.events().find(e=>e.name==='form_confirmation_view').params.service_area,'business_it');
  }
 }
}
// Every QA path suppresses tag loading and all production events, even with saved consent.
for(const lang of ['de-CH','en','fr-CH','it-CH']){
 const prefix=lang==='de-CH'?'':'/'+lang.slice(0,2);
 for(const consent of [undefined,'necessary','all','measurement']){
  f=fixture({consent,lang,pathname:prefix+'/anfrage.html',search:'?muji_test=1'});
  assert.equal(f.context.MujiMeasurementIsTest(),true);
  const {handlers,fields}=bindForm(f,'repair','https://mujitech.ch'+prefix+'/danke.html?form=repair');
  assert.equal(fields.get('Messmodus').value,'test');
  assert.equal(new URL(fields.get('_next').value).searchParams.get('muji_test'),'1');
  const id=fields.get('Anfrage_Referenz').value;
  handlers.submit({defaultPrevented:true});
  assert.equal(f.sessionStorage.getItem('mujitech-pending-enquiry'),null);
  handlers.submit({defaultPrevented:false});
  const pending=JSON.parse(f.sessionStorage.getItem('mujitech-pending-enquiry')||'null');
  if(pending)assert.equal(pending.test,true);
  f.listeners.submit({target:form});
  f.listeners.click({target:{closest:()=>({getAttribute:()=> 'mailto:info@mujitech.ch'})}});
  assert.equal(f.scripts.length,0);assert.equal(f.events().length,0);
  assert.ok(!JSON.stringify(f.context.dataLayer||[]).includes(id));
  const returnPage=fixture({consent,lang,pathname:prefix+'/danke.html',search:'?form=repair&muji_test=1',pending});
  assert.equal(returnPage.scripts.length,0);assert.equal(returnPage.events().length,0);
 }
 f=fixture({consent:'all',lang,pathname:prefix+'/danke.html',search:'?form=repair',pending:{kind:'repair',time:Date.now(),test:true}});
 assert.equal(f.events().filter(e=>e.name==='form_confirmation_view').length,0);
 assert.equal(f.sessionStorage.getItem('mujitech-pending-enquiry'),null);
 f=fixture({consent:'all',lang,pathname:prefix+'/danke.html',search:'?form=repair',pending:{kind:'repair',time:Date.now(),test:false}});
 const confirmation=f.events().find(e=>e.name==='form_confirmation_view');
 assert.equal(confirmation.params.funnel_stage,'provider_confirmation');assert.equal(confirmation.params.lead_verified,0);
 assert.ok(f.events().every(e=>!['generate_lead','purchase','enquiry_received'].includes(e.name)));
}
for(const hostname of ['localhost','127.0.0.1','[::1]']){
 f=fixture({consent:'measurement',hostname,search:'?muji_test=0'});
 assert.equal(f.scripts.length,0);assert.equal(f.events().length,0);
}
f=fixture({consent:'all',session:{'mujitech-measurement-test':'1'},search:''});assert.equal(f.scripts.length,0);
f=fixture({consent:'all',session:{'mujitech-measurement-test':'1'},search:'?muji_test=0',pending:{kind:'repair',time:Date.now(),test:true}});
assert.equal(f.context.MujiMeasurementIsTest(),false);assert.equal(f.scripts.length,1);assert.equal(f.sessionStorage.getItem('mujitech-pending-enquiry'),null);
f=fixture({consent:'all',search:'?muji_test=1',blockedStorage:true});
const internal={href:'https://mujitech.ch/it/anfrage.html?model=iPhone+15#reparatur',getAttribute(){return this.href;},setAttribute(k,v){this.href=v;},closest:()=>null};
f.listeners.click({target:{closest:()=>internal}});
assert.equal(new URL(internal.href).searchParams.get('muji_test'),'1');assert.equal(new URL(internal.href).searchParams.get('model'),'iPhone 15');assert.equal(new URL(internal.href).hash,'#reparatur');assert.equal(f.scripts.length,0);
const external={...internal,href:'https://example.test/help'};f.listeners.click({target:{closest:()=>external}});assert.equal(external.href,'https://example.test/help');
for(const [pathname,area] of Object.entries({'/laptop-computer-reparatur.html':'repair','/en/laptop-computer-repair.html':'repair','/fr/reparation-ordinateur-portable.html':'repair','/it/riparazione-computer-portatili.html':'repair','/computer-langsam-hilfe.html':'private_support','/en/slow-computer-help.html':'private_support','/fr/ordinateur-lent-assistance.html':'private_support','/it/computer-lento-assistenza.html':'private_support'})){
 f=fixture({consent:'all',pathname,search:''});f.listeners.click({target:{closest:()=>({getAttribute:()=> 'tel:+41768444673'})}});
 assert.ok(f.events().every(e=>e.params.service_area===area));
 assert.equal(f.events().at(-1).params.funnel_stage,'contact_click');assert.equal(f.events().at(-1).params.lead_verified,0);
}
console.log('PASS: QA suppression and provider-return isolation in DE/EN/FR/IT; no production tag on local hosts; explicit reset; blocked-storage link fallback; eight PC categories; receipt references excluded from Analytics; funnel events remain unverified intermediates.');
console.log('PASS: three consent choices in four languages; legacy choices never grant ads; valid click IDs only after separate choice; withdrawal and cookie cleanup; actual form-marker round trip; original measurement/category/privacy/deduplication regressions.');

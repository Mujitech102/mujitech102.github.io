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
function fixture({consent,pathname='/fr/reparation-ecran-iphone.html',search='?email=PRIVATE_EMAIL&utm_source=google&utm_medium=organic&utm_campaign=local-repairs',pending}={}){
 const listeners={},windowListeners={},scripts=[],banners=[];
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.attributes={};this.style={};this.classList={contains:()=>false};}
  append(...children){this.children.push(...children);}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(k,cb){this.listeners[k]=cb;}
  focus(){}
  get firstElementChild(){return this.children[0];}
 }
 const document={title:'Repair page',documentElement:{lang:'fr-CH',scrollHeight:2000},referrer:'https://example.test/path?secret=PRIVATE_REFERRER#private',cookie:'',readyState:'complete',createElement:tag=>new Element(tag),head:{append:el=>scripts.push(el)},body:{append:el=>banners.push(el)},querySelectorAll:()=>[],querySelector:()=>null,addEventListener:(k,cb)=>{listeners[k]=cb;}};
 const localStorage=storage(consent?{'mujitech-cookie-consent':consent}:{});
 const sessionStorage=storage(pending?{'mujitech-pending-enquiry':JSON.stringify(pending)}:{});
 const context={document,location:{origin:'https://mujitech.ch',hostname:'mujitech.ch',pathname,search},URL,URLSearchParams,Date,Number,JSON,Set,WeakSet,localStorage,sessionStorage,innerHeight:800,scrollY:0,requestAnimationFrame:fn=>fn(),addEventListener:(k,cb)=>{windowListeners[k]=cb;}};
 context.window=context;vm.runInNewContext(source,context);
 const events=()=>Array.from(context.dataLayer||[]).filter(x=>x[0]==='event').map(x=>({name:x[1],params:x[2]}));
 return {context,document,listeners,windowListeners,scripts,banners,events,localStorage,sessionStorage};
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
console.log('PASS: consent, no form contents, sanitized URLs, repair categorisation, confirmation guards, deduplication and withdrawal.');

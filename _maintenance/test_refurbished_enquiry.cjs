/* Offline regression: real wizard + Tally bridge, no provider requests or submissions. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('assets/wizard.js'),tail='\nrender(false);\n})();';
assert.equal(source.split(tail).length,2);
const instrumented=source.replace(tail,`
globalThis.api={state,choose,summaryRows,mountTallyContact,updateWebsiteBack};
render=()=>mountTallyContact();
})();`);
let cases=0;
function fixture(lang,params={}){
 const classes=()=>{const values=new Set();return {toggle(k,on){on?values.add(k):values.delete(k);},contains:k=>values.has(k)};};
 let removed=0;
 const handlers={},measurement=[];
 function element(tag='div'){
  return {tag,hidden:false,children:[],dataset:{},listeners:{},classList:classes(),textContent:'',innerHTML:'',attributes:{},
   contentWindow:tag==='iframe'?{draft:'OFFLINE_DRAFT'}:undefined,
   setAttribute(k,v){this.attributes[k]=v;},
   append(...items){for(const child of items){child.parentElement=this;this.children.push(child);}},
   replaceChildren(){this.children=[];},
   addEventListener(k,fn){this.listeners[k]=fn;},
   remove(){removed++;this.parentElement.children=this.parentElement.children.filter(c=>c!==this);},
   closest(){return panel;},focus(){},scrollIntoView(){},querySelector(){return null;}};
 }
 const panel=element(),names=['tallyContact','previewLabel','tallyForms','tallySummary','tallyContextNotice','tallyContextText','tallyContextRestart','tallyStatus','websiteBack'];
 const nodes=Object.fromEntries(names.map(name=>['#'+name,element()]));nodes['#tallyContact'].classList.toggle('hidden',true);
 const app=element(),brand=element(),links=['de','en','fr','it'].map(l=>Object.assign(element('a'),{dataset:{lang:l}}));
 const frames=()=>nodes['#tallyForms'].children.flatMap(w=>w.children.filter(c=>c.tag==='iframe'));
 const url=new URL('https://mujitech.ch/assistent/');
 for(const [k,v]of Object.entries({service:'web',lang,return:(lang==='de'?'':'/'+lang)+'/websites.html',...params}))url.searchParams.set(k,v);
 const context={URL,URLSearchParams,Object,console,location:url,
  history:{replaceState(a,b,next){context.location=new URL(next,context.location);}},
  document:{querySelector(q){return q==='#app'?app:q==='.brand'?brand:nodes[q]||null;},querySelectorAll(q){return q==='[data-lang]'?links:q==='#tallyForms iframe'?frames():[];},createElement:element},
  window:{addEventListener(name,fn){handlers[name]=fn;},Tally:{loadEmbeds(){}},
   MujiMeasureEnquiry(...args){measurement.push(args);}},
  fetch(){throw Error('Network is forbidden');}}
 vm.createContext(context);
 for(const file of ['assets/inquiry-config.js','assets/inquiry-context-catalog.js','assets/tally-bridge.js'])vm.runInContext(read(file),context);
 vm.runInContext(instrumented,context);
 return {api:context.api,nodes,frames,links,handlers,measurement,removed:()=>removed};
}

let products=0;
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#(?:x([a-f0-9]+)|(\d+));/gi,(_,h,d)=>String.fromCodePoint(parseInt(h||d,h?16:10))).replace(/&quot;/g,'"').replace(/&#39;/g,"'");
for(const lang of ['de','en','fr','it']){
 const html=read((lang==='de'?'':lang+'/')+'refurbished.html');
 for(const match of html.matchAll(/<article class="shop-product" id="([^"]+)">([\s\S]*?)<\/article>/g)){
  const card=match[2],model=decode(card.match(/<h2>(.*?)<\/h2>/)[1]),parts=[];
  for(const pair of card.matchAll(/<dt>(.*?)<\/dt><dd data-field="(storage|color|sim|variant|condition)">(.*?)<\/dd>/g))parts.push(decode(pair[1])+': '+decode(pair[3]));
  const context=model+' · '+parts.join(' · '),f=fixture(lang,{service:'product',kind:'iphone',model:context,return:(lang==='de'?'':'/'+lang)+'/refurbished.html'});
  assert.equal(f.api.state.step,'contact');assert.equal(f.api.state.detail,'iphone');assert.equal(f.api.state.model,context);
  assert.ok(f.api.summaryRows().some(row=>row[1]===context));f.api.mountTallyContact();const frame=f.frames()[0],u=new URL(frame.dataset.tallySrc);
  assert.equal(u.searchParams.get('product_context'),context);assert.equal(u.searchParams.get('source_page'),(lang==='de'?'':'/'+lang)+'/refurbished.html');
  assert.equal(u.searchParams.get('device_context'),'');assert.equal(u.searchParams.get('repair_context'),'');assert.ok(!/CHF|\b\d+[.,]\d{2}\b/.test(context));
  products++;
 }
 const f=fixture(lang,{service:'product',kind:'iphone',model:'SYNTHETIC_UNLISTED_VARIANT'});f.api.mountTallyContact();const frame=f.frames()[0],formId=new URL(frame.dataset.tallySrc).pathname.split('/').pop();
 assert.equal(new URL(frame.dataset.tallySrc).searchParams.get('product_context'),'');
 const send=(event='Tally.FormSubmitted',origin='https://tally.so',source=frame.contentWindow,payload={id:'LOCAL_MOCK',formId,fields:[{title:'Synthetic field',answer:{value:'NEVER_EXPORT'}}]})=>f.handlers.message({origin,source,data:JSON.stringify({event,payload})});
 send('Tally.FormPageView');send(undefined,'https://example.invalid');send(undefined,undefined,{});send(undefined,undefined,undefined,{id:'LOCAL_MOCK',formId:'WRONG'});send(undefined,undefined,undefined,{formId});
 assert.equal(f.measurement.filter(x=>x[0]==='submitted').length,0);
 send();send();send(undefined,undefined,undefined,{id:'SECOND_LOCAL_MOCK',formId});
 assert.equal(f.measurement.filter(x=>x[0]==='submitted').length,1);assert.ok(!JSON.stringify(f.measurement).includes('NEVER_EXPORT'));
}
assert.equal(products,156);
console.log(`PASS: ${products} four-language catalogue contexts, exact Tally product handoff, no prices; four offline success/origin/frame/form/id/duplicate/privacy checks. Network forbidden.`);

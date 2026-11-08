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
  window:{addEventListener(){},Tally:{loadEmbeds(){}}},
  fetch(){throw Error('Network is forbidden');}}
 vm.createContext(context);
 for(const file of ['assets/inquiry-config.js','assets/inquiry-context-catalog.js','assets/tally-bridge.js'])vm.runInContext(read(file),context);
 vm.runInContext(instrumented,context);
 return {api:context.api,nodes,frames,links,removed:()=>removed};
}
const offers={Basic:'new',Business:'new',Premium:'new','Care Basic':'care','Care Business':'care','Care Premium':'care','Google Ads':'unknown'};
const headings={de:'Paket / Angebot',en:'Package / offer',fr:'Forfait / offre',it:'Pacchetto / offerta'};
for(const lang of ['de','en','fr','it']){
 for(const [offer,detail]of Object.entries(offers)){
  const f=fixture(lang,{offer});
  assert.equal(f.api.state.offer,offer);assert.equal(f.api.state.detail,detail);assert.equal(f.api.state.step,'contact');
  assert.equal(f.api.summaryRows().find(row=>row[2]==='model')[0],headings[lang]);
  f.api.mountTallyContact();const original=f.frames()[0],data=new URL(original.dataset.tallySrc);
  assert.equal(data.searchParams.get('offer_context'),offer);assert.equal(data.searchParams.get('language'),lang);
  assert.equal(data.searchParams.get('source_page'),(lang==='de'?'':'/'+lang)+'/websites.html');
  f.api.updateWebsiteBack();assert.equal(f.nodes['#websiteBack'].href,(lang==='de'?'':'/'+lang)+'/websites.html');
  // Going back and choosing the same kind preserves a valid package.
  f.api.state.step='detail';f.api.choose(detail);assert.equal(f.api.state.offer,offer);assert.equal(f.frames()[0],original);
  // A different kind clears the conflicting package but preserves the loaded draft.
  f.api.state.step='detail';f.api.choose(detail==='care'?'new':'care');
  assert.equal(f.api.state.offer,'');assert.equal(f.frames()[0],original);assert.equal(original.contentWindow.draft,'OFFLINE_DRAFT');
  assert.equal(f.removed(),0);assert.equal(f.nodes['#tallyContextNotice'].hidden,false);assert.equal(original.parentElement.hidden,true);
  // Only the explicit restart replaces the old provider frame.
  f.nodes['#tallyContextRestart'].onclick();assert.equal(f.removed(),1);assert.notEqual(f.frames()[0],original);
  assert.equal(new URL(f.frames()[0].dataset.tallySrc).searchParams.get('offer_context'),'');
  cases++;
 }
 for(const offer of ['UNLISTED','constructor','<script>unsafe</script>','fixture@example.invalid']){
  const f=fixture(lang,{offer});assert.equal(f.api.state.offer,'');assert.ok(!f.api.summaryRows().some(row=>String(row[1]).includes(offer)));
  f.api.state.step='contact';f.api.mountTallyContact();assert.equal(new URL(f.frames()[0].dataset.tallySrc).searchParams.get('offer_context'),'');cases++;
 }
 const general=fixture(lang);assert.equal(general.api.state.offer,'');assert.equal(general.api.state.step,'detail');cases++;
 const service=fixture(lang,{offer:'Basic'});service.api.state.step='service';service.api.choose('repair');assert.equal(service.api.state.offer,'');cases++;
 const translated=fixture(lang,{offer:'Care Business'});translated.api.mountTallyContact();const first=translated.frames()[0];
 const next=lang==='fr'?'it':'fr';translated.links.find(a=>a.dataset.lang===next).listeners.click({preventDefault(){}});
 assert.equal(translated.api.state.offer,'Care Business');assert.equal(first.contentWindow.draft,'OFFLINE_DRAFT');assert.equal(translated.removed(),0);
 assert.equal(translated.api.summaryRows().find(row=>row[2]==='model')[0],headings[next]);cases++;
 const product=fixture(lang,{service:'product',form:'gaming_pc',offer:'MT-GPC-9700X-RTX5060-32-2000'});
 assert.equal(product.api.state.offer,'MT-GPC-9700X-RTX5060-32-2000');cases++;
 const wrongFamily=fixture(lang,{offer:'MT-GPC-9700X-RTX5060-32-2000'});assert.equal(wrongFamily.api.state.offer,'');cases++;
 const repair=fixture(lang,{service:'repair',model:'iPhone 13'});
 const modelLabel=repair.api.summaryRows().find(row=>row[1]==='iPhone 13')[0];
 repair.api.state.step='service';repair.api.choose('web');repair.api.choose('new');
 assert.equal(repair.api.summaryRows().find(row=>row[1]==='iPhone 13')[0],modelLabel);
 assert.ok(!repair.api.summaryRows().some(row=>row[0]===headings[lang]&&row[1].includes('iPhone 13')));cases++;
 const mixed=fixture(lang,{model:'iPhone 13',offer:'Basic'}),mixedRows=mixed.api.summaryRows();
 assert.equal(mixedRows.find(row=>row[1]==='iPhone 13')[0],modelLabel);
 assert.equal(mixedRows.find(row=>row[1]==='Basic')[0],headings[lang]);
 assert.ok(!mixedRows.some(row=>row[1]==='iPhone 13 · Basic'));cases++;

}
console.log('PASS: '+cases+' four-language web-offer scenarios; 7 published offers, labels, return, subtype/service/language changes, unknown values, real bridge draft protection and explicit restart; no network or submissions.');

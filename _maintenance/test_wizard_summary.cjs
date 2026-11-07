/* Network-free regression tests for the actual wizard summary edit handlers.
 * The DOM is a fixture: these tests do not replace browser or delivery checks.
 * No website files, real form contents or external services are modified.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const source=fs.readFileSync(path.join(root,'assets/wizard.js'),'utf8');
const tail='\nrender(false);\n})();';
assert.equal(source.split(tail).length,2,'Expected the single startup render; do not run the live UI in this fixture');
const instrumented=source.replace(tail,`
globalThis.testAPI={state,editSummary,summaryEditLabel,summaryHTML,bind,refreshSummary};
render=(...args)=>globalThis.testRenders.push(args);
})();`);
const expected={
 de:{edit:'Ändern',correction:'Korrektur ergänzen',message:'Nachricht'},
 en:{edit:'Edit',correction:'Add a correction',message:'Message'},
 fr:{edit:'Modifier',correction:'Ajouter une correction',message:'Message'},
 it:{edit:'Modifica',correction:'Aggiungi una correzione',message:'Messaggio'}
};
let cases=0;
function element(extra={}){
 return {focused:0,scrolled:0,listeners:{},focus(){this.focused++;},scrollIntoView(){this.scrolled++;},addEventListener(type,fn){this.listeners[type]=fn;},...extra};
}
function fixture(lang,{active=true,frame=true,notice=false,field=false}={}){
 const counters={bridge:0,network:0,history:0};
 const panel={classList:{toggle(){}}};
 const status={children:[],initialText:'Existing provider notice',classList:{toggle(){}},
  get textContent(){return this.children.length?this.children.map(child=>child.textContent).join(''):this.initialText;},
  replaceChildren(){this.children=[];this.initialText='';},append(child){this.children.push(child);},closest(){return panel;}};
 // A cached earlier-language frame precedes the current frame: focusing it
 // would fail the assertion below and risks confusing keyboard users.
 const hiddenFrame=element({parentElement:{hidden:true},contentWindow:{draft:'PREVIOUS_LANGUAGE_DRAFT'}});
 const visibleFrame=element({parentElement:{hidden:false},contentWindow:{draft:'CURRENT_FORM_TYPED_CONTENT'}});
 const frames=frame?[hiddenFrame,visibleFrame]:[hiddenFrame];
 const restart=element(),direct=element(),input=element(),websiteBack=element(),brand=element();
 const buttons=['model','message','service','detail','issues'].map(target=>element({dataset:{edit:target}}));
 const list={replaceWith(){}};
 const app={querySelector(selector){if(selector==='.summary-list')return list;if(field&&['#model','#message'].includes(selector))return input;return null;},querySelectorAll(){return [];}};
 const document={
  querySelector(selector){
   return {'#app':app,'#tallyStatus':status,'#tallyContextNotice':{hidden:!notice},'#tallyContextRestart':restart,'.site-foot a':direct,'#websiteBack':websiteBack,'.brand':brand}[selector]??null;
  },
  querySelectorAll(selector){if(selector==='#tallyForms iframe')return frames;if(selector==='#main [data-edit]')return buttons;if(selector==='[data-lang]')return [];throw Error('Unexpected selector '+selector);},
  createElement(tag){if(tag==='span')return {textContent:'',setAttribute(){}};return {innerHTML:'',querySelector(selector){assert.equal(selector,'.summary-list');return list;}};}
 };
 const href='https://'+(active?'mujitech.ch':'localhost')+'/assistent/?lang='+lang;
 const context={document,location:new URL(href),URL,URLSearchParams,Object,console,testRenders:[],
  window:{MujiTallyBridge:{enabled:()=>active,show(){counters.bridge++;}}},
  history:{replaceState(){counters.history++;}},
  fetch(){counters.network++;throw Error('Network forbidden in summary edit tests');}
 };
 vm.runInNewContext(instrumented,context,{filename:'assets/wizard.js'});
 const api=context.testAPI;
 Object.assign(api.state,{service:'product',detail:'iphone',model:'Apple iPhone 17 Pro Max 512 GB silver',offer:'Existing product context',issues:['display'],repair:'Display',message:'Preserved local preview message',step:'contact',name:'LOCAL FIXTURE',email:'fixture@example.invalid',phone:'',consent:true});
 return {api,context,counters,status,hiddenFrame,visibleFrame,frames,restart,direct,input,buttons};
}
function preserved(f,before){
 assert.equal(JSON.stringify(f.api.state),before,'Correction action must preserve all selected context and language-independent state');
 assert.equal(f.context.testRenders.length,0,'Correction must not rerender the wizard');
 assert.equal(f.counters.bridge,0,'Correction must not remount or reload Tally');
 assert.equal(f.counters.network,0,'Correction must not send a network request');
 assert.equal(f.counters.history,0,'Correction must not change the selected language URL');
 assert.equal(f.visibleFrame.contentWindow.draft,'CURRENT_FORM_TYPED_CONTENT');
 assert.equal(f.hiddenFrame.contentWindow.draft,'PREVIOUS_LANGUAGE_DRAFT');
 assert.equal(f.hiddenFrame.focused,0,'Never focus a cached hidden-language form');
}
for(const [lang,labels] of Object.entries(expected)){
 for(const target of ['model','message']){
  const f=fixture(lang),before=JSON.stringify(f.api.state),frameIdentity=f.visibleFrame;
  assert.equal(f.api.summaryEditLabel(target),labels.correction);
  assert.match(f.api.summaryHTML(),new RegExp('data-edit="'+target+'" aria-label="'+labels.correction+':'));
  // Exercise actual event binding, not only a direct helper call.
  f.api.bind();
  assert.doesNotThrow(()=>f.buttons.find(b=>b.dataset.edit===target).listeners.click());
  preserved(f,before);
  assert.equal(f.frames[1],frameIdentity);
  assert.equal(f.visibleFrame.focused,1);
  assert.equal(f.visibleFrame.scrolled,1);
  assert.ok(f.status.textContent.includes(labels.message),'Localized instruction identifies the Message field');
  assert.ok(f.status.textContent.length>80);
  // Input refresh must use the same safe helper rather than the old null.focus.
  f.api.refreshSummary();
  assert.doesNotThrow(()=>f.buttons.find(b=>b.dataset.edit===target).listeners.click());
  preserved(f,before);
  assert.equal(f.visibleFrame.focused,2);
  cases++;
 }
 for(const notice of [true,false]){
  const f=fixture(lang,{frame:false,notice}),before=JSON.stringify(f.api.state);
  assert.doesNotThrow(()=>f.api.editSummary('model'));
  preserved(f,before);
  assert.equal(f.status.textContent,'Existing provider notice','Keep context-change or unavailable-form explanation');
  assert.equal(f.restart.focused,notice?1:0);
  assert.equal(f.direct.focused,notice?0:1);
  cases++;
 }
 for(const field of [true,false]){
  const f=fixture(lang,{active:false,field});
  assert.equal(f.api.summaryEditLabel('model'),labels.edit);
  assert.doesNotThrow(()=>f.api.editSummary('model'),'Local preview must tolerate a missing optional field');
  assert.equal(f.api.state.step,'contact');
  assert.equal(f.context.testRenders.length,1);
  assert.equal(f.input.focused,field?1:0);
  assert.equal(f.counters.bridge,0);
  assert.equal(f.counters.network,0);
  cases++;
 }
 for(const target of ['service','detail','issues']){
  const f=fixture(lang);
  assert.equal(f.api.summaryEditLabel(target),labels.edit);
  f.api.editSummary(target);
  assert.equal(f.api.state.step,target,'Existing selection-edit routes must remain usable');
  assert.equal(f.context.testRenders.length,1);
  assert.equal(f.visibleFrame.focused,0);
  cases++;
 }
}
console.log('PASS: '+cases+' four-language summary cases; real bind/refresh handlers, visible cached-frame focus, preserved context/drafts, no Tally reload/network, safe absent-frame and preview fallbacks, existing edit routes.');

/* Check optional hints against real service options; no network or submissions. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const full=fs.readFileSync(path.join(__dirname,'../assets/enhancements.js'),'utf8');
const marker='/* Optional enquiry guidance follows the selected service; never edits entered text. */';
assert.equal(full.split(marker).length,2);const source=full.split(marker)[1];
let count=0;
for(const language of ['de','en','fr','it']){
  const root=path.join(__dirname,'..',language==='de'?'':language);
  const html=fs.readFileSync(path.join(root,'kontakt.html'),'utf8');
  assert.match(html,/<textarea\b[^>]*id="nachricht"[^>]*aria-describedby="enquiry-guidance"/);
  assert.equal((html.match(/id="enquiry-guidance"/g)||[]).length,1);
  const options=[...html.match(/<select\b[^>]*name="bereich"[^>]*>([\s\S]*?)<\/select>/)[1].matchAll(/<option\b[^>]*value="([^"]+)"/g)].map(x=>x[1]);
  const area={value:'',listeners:{},addEventListener(k,fn){this.listeners[k]=fn;}};
  const note={textContent:''},message={value:'PRIVATE_TYPED_CONTENT'},listeners={};
  const form={querySelector:s=>({'[name="bereich"]':area,'#enquiry-guidance':note,'[name="nachricht"]':message})[s]||null};
  const document={readyState:'complete',documentElement:{lang:language},querySelector:s=>s==='#kontaktformular'?form:null};
  vm.runInNewContext(source,{document,window:{addEventListener:(k,fn)=>listeners[k]=fn}});
  const initial=note.textContent;assert.ok(initial.length>60);
  for(const option of options){area.value=option;area.listeners.change();assert.ok(note.textContent.length>70);assert.equal(message.value,'PRIVATE_TYPED_CONTENT');assert.ok(!note.textContent.includes('PRIVATE_TYPED_CONTENT'));if(option!=='Sonstiges')assert.notEqual(note.textContent,initial,option);count++;}
  for(const invalid of ['PRIVATE_UNKNOWN','__proto__','constructor']){area.value=invalid;area.listeners.change();assert.equal(note.textContent,initial);}
  area.value='Website';listeners.pageshow();assert.notEqual(note.textContent,initial);
  const website=fs.readFileSync(path.join(root,'websites.html'),'utf8');
  const faq=website.match(/<!-- WEBDESIGN FAQ START -->([\s\S]*?)<!-- WEBDESIGN FAQ END -->/);assert.ok(faq);
  assert.equal((faq[1].match(/<summary>/g)||[]).length,4);
  assert.ok(website.indexOf('<!-- WEBDESIGN FAQ START -->')<website.indexOf('id="anfrage"'));
}
vm.runInNewContext(source,{document:{readyState:'complete',querySelector:()=>null}});
console.log('PASS: '+count+' localized service hints, changed and restored selection, input preserved, unknown values, missing form, four FAQs per language.');

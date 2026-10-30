/* Selected choices must remain visible in review; reviewing must never submit. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../assets/polish.js'),'utf8');
class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.listeners={};this.textContent='';}
 setAttribute(){} append(...nodes){this.children.push(...nodes);} replaceChildren(){this.children=[];}
 addEventListener(k,fn){this.listeners[k]=fn;} querySelector(){return null;} focus(){} scrollIntoView(){}
}
function choice(type,name,checked,label,group,disabled=false){return {type,name,checked,disabled,value:'INTERNAL_VALUE_NOT_FOR_REVIEW',labels:[{textContent:label}],closest:()=>({querySelector:()=>({textContent:group})})};}
for(const lang of ['de','en','fr','it']){
 const submit=new Element('button'),form=new Element('form');let sent=0,valid=true,prevented=false;
 form.elements=[choice('radio','package',true,'Basic CHF 490','Website'),choice('radio','package',false,'UNSELECTED PREMIUM','Website'),choice('radio','care',true,'Care Business CHF 69','Care'),choice('checkbox','extras',true,'Form CHF 90','Extras'),choice('checkbox','extras',true,'Maps CHF 40','Extras'),choice('checkbox','extras',false,'UNCHECKED','Extras'),choice('checkbox','disabled',true,'DISABLED','Extras',true),{type:'hidden',name:'secret',value:'HIDDEN'},{type:'text',name:'name',value:'LOCAL FORM VALUE',labels:[{textContent:'Name',contains:()=>false}]}];
 form.querySelector=s=>s==='[type="submit"]'?submit:null;form.reportValidity=()=>valid;
 const document={documentElement:{lang},readyState:'complete',querySelector:()=>null,querySelectorAll:s=>s.startsWith('form[')?[form]:[],addEventListener(){},createElement:t=>new Element(t)};
 vm.runInNewContext(source,{document,window:{addEventListener(){}},queueMicrotask:fn=>fn()});
 const event=()=>({defaultPrevented:false,preventDefault(){this.defaultPrevented=true;prevented=true;},stopImmediatePropagation(){}});
 form.requestSubmit=()=>{const e=event();form.listeners.submit(e);if(!e.defaultPrevented)sent++;};
 form.listeners.submit(event());assert.equal(sent,0);assert.equal(prevented,true);
 const review=form.children[0],summary=review.children[1],actions=review.children[4],send=actions.children[1];
 const text=summary.children.map(e=>e.textContent).join('|');
 for(const value of ['Basic CHF 490','Care Business CHF 69','Form CHF 90','Maps CHF 40','LOCAL FORM VALUE'])assert.ok(text.includes(value),lang+': '+text);
 for(const value of ['UNSELECTED','UNCHECKED','DISABLED','HIDDEN','INTERNAL_VALUE'])assert.ok(!text.includes(value),lang+': '+text);
 valid=false;send.listeners.click();assert.equal(sent,0);valid=true;send.listeners.click();assert.equal(sent,1);
 form.listeners.change();assert.equal(review.hidden,true);assert.equal(submit.hidden,false);
}
console.log('PASS: selected packages, care and multiple extras in four languages; unchecked/disabled/hidden fields excluded; review does not submit; validity and edit cycle preserved.');

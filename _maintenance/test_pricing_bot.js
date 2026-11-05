const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bot=read('assets/mujibot.js'),labels=read('assets/repair-prices.js');
let checked=0;
for(const lang of ['de','en','fr','it']){
 let messages=[];
 const ctx={window:{},lang,previousModel:null,previousTopic:null,normalize:s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss'),track:()=>{},add:s=>messages.push(s)};
 vm.createContext(ctx);vm.runInContext(read('assets/repair-prices-data.js'),ctx);
 vm.runInContext(labels.slice(0,labels.indexOf('const start=()=>{'))+'})();',ctx);
 vm.runInContext(bot.slice(bot.indexOf('    const detect ='),bot.indexOf('    const storageData=')).replace('const detect =','globalThis.detect ='),ctx);
 vm.runInContext(bot.slice(bot.indexOf('    const storageData='),bot.indexOf('    const displayGuide=')).replace('const storageAnswer=','globalThis.storageAnswer='),ctx);
 assert.equal(ctx.storageAnswer('Combien coûte Google Ads ?'),false);assert.equal(ctx.storageAnswer('Combien coûte Google Pixel 10 ?'),false);
 vm.runInContext(bot.slice(bot.indexOf('    const priceAnswer='),bot.indexOf('    const reply =')).replace('const priceAnswer=','globalThis.priceAnswer='),ctx);
 function answer(q,topic='price'){messages=[];ctx.previousModel=null;ctx.priceAnswer(q,topic);return messages.join('\n');}
 for(const row of ctx.window.MujiPriceBook.rows){
  const text=answer(row[0]+' '+ctx.window.MujiRepairLabel(row[1],lang));
  assert.ok(text.includes(row[0]),row[0]+' model missing');
  const expected=row[2]===null?({de:'Auf Anfrage',en:'On request',fr:'Sur demande',it:'Su richiesta'})[lang]:'CHF '+row[2].toFixed(2);
  assert.ok(text.includes(expected),lang+' '+row[0]+' '+row[1]+' expected '+expected+' got '+text);
  const quality=ctx.window.MujiRepairQuality(row[1],lang);if(quality)assert.ok(text.includes(quality));checked++;
 }
 for(const q of ['Was kostet Google Ads?','How much does Google Ads cost?','Combien coûte Google Ads ?','Quanto costa Google Ads?'])assert.equal(ctx.detect(q),'ads');
 ctx.previousTopic='ads';assert.equal(ctx.detect('Was kostet das?'),'ads');assert.notEqual(ctx.detect('iPhone 15 Display Preis'),'ads');ctx.previousTopic=null;
 assert.equal(answer('Google Ads fuer iPhone Reparaturen','ads'),'');
 const part=ctx.window.MujiRepairLabel('Display Original, Pulled',lang);const price=(model,label)=>ctx.window.MujiPriceBook.rows.find(r=>r[0]===model&&r[1]===label)[2];const first=price('iPhone 15 Pro','Display Original, Pulled'),second=price('iPhone 14 Pro','Display Original, Pulled');const money=n=>'CHF '+n.toFixed(2);const total=answer('iPhone 15 Pro '+part+' und iPhone 14 Pro '+part);assert.ok(total.includes(money(first+second)),total);
 const multiple=answer('2 x iPhone 15 Pro '+part+' und iPhone 14 Pro '+part);assert.ok(multiple.includes(money(first*2+second)),multiple);
 const quote=answer('iPhone 17 Akku Original, Pulled');assert.ok(!/CHF/.test(quote),quote);
 const soft=answer('iPhone 17 Display Soft OLED');assert.ok(!/CHF/.test(soft),soft);
 // A comma inside a valid display label must not hide the second repair.
 const batteryLabel=ctx.window.MujiRepairLabel('Akku Original, Service Pack',lang);
 const conjunction=({de:'und',en:'and',fr:'et',it:'e'})[lang];
 const combined=answer('iPhone 15 '+part+' '+conjunction+' '+batteryLabel);
 assert.ok(combined.includes(batteryLabel),combined);
 const premiumLabel=ctx.window.MujiRepairLabel('Display Premium',lang);
 const alternatives=answer('iPhone 15 '+part+' '+conjunction+' '+premiumLabel);
 const p1=price('iPhone 15','Display Original, Pulled'),p2=price('iPhone 15','Display Premium');assert.ok(alternatives.includes(money(p1))&&alternatives.includes(money(p2)),alternatives);
 assert.ok(!alternatives.includes(money(p1+p2))&&!alternatives.includes('undefined'),alternatives);
 const sharedLabels=answer('iPhone 15 Display Original, Pulled or Display Premium');
 assert.ok(sharedLabels.includes(money(p1))&&sharedLabels.includes(money(p2))&&!sharedLabels.includes(money(p1+p2)),sharedLabels);
 const either=answer('iPhone 15 '+part+' '+({de:'oder',en:'or',fr:'ou',it:'oppure'})[lang]+' iPhone 14 Pro '+part);
 assert.ok(!either.includes(money(p1+second)),either);
 for(const q of ['iPhone 15 '+part+' '+conjunction+' Samsung Galaxy S100 Display','iPhone 15 Pro Mini Display','iPhone 15 '+part+' '+conjunction+' iPhone 18 Pro Display']){
  const unclear=answer(q);assert.ok(unclear.length>30&&!unclear.includes('CHF'),unclear);
 }
}
console.log('PASS: '+checked+' model/quality/price answers in four languages; comma-separated repairs, alternative parts, unresolved models, quality text, Ads routing, totals, quantities and unknown costs.');

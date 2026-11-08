const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bot=read('assets/mujibot.js'),labels=read('assets/repair-prices.js');
let checked=0;
for(const lang of ['de','en','fr','it']){
 let messages=[];
 const ctx={window:{},lang,previousModel:null,previousTopic:null,normalize:s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss'),track:()=>{},add:s=>messages.push(s)};
 vm.createContext(ctx);vm.runInContext(read('assets/repair-prices-data.js'),ctx);
 vm.runInContext(labels.slice(0,labels.indexOf('const start=()=>{'))+'})();',ctx);
 // A generic catalogue heading does not establish the replacement panel technology.
 for(const part of ['Display / LCD','Display / LCD (Hauptbildschirm)','Display / LCD (Sub-Display)','Display / LCD (inkl. Mittelrahmen)']){
  const explanation=ctx.window.MujiRepairQuality(part,lang);
  assert.ok(explanation.length>30,lang+' missing variant confirmation');
  assert.doesNotMatch(explanation,/LCD|OLED/i,lang+' generic heading asserted a panel technology');
  assert.match(explanation,({de:/vor dem Auftrag/,en:/before the repair/,fr:/avant la réparation/,it:/prima della riparazione/})[lang]);
 }
 for(const quality of ['Original','Service Pack','Soft OLED','Premium','Pulled'])
  assert.equal(ctx.window.MujiRepairQuality('Display / LCD ('+quality+')',lang),ctx.window.MujiRepairQuality('Display '+quality,lang));
 assert.match(ctx.window.MujiRepairQuality('Display LCD',lang),/LCD/);
 assert.match(ctx.window.MujiRepairQuality('Display Soft OLED',lang),/OLED/);
 assert.notEqual(ctx.window.MujiRepairQuality('Display Original, Service Pack',lang),'');
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
 const part=ctx.window.MujiRepairLabel('Display Original, Pulled',lang);
 const unknown=({de:'Auf Anfrage',en:'On request',fr:'Sur demande',it:'Su richiesta'})[lang];
 const total=answer('iPhone 15 Pro '+part+' und iPhone 14 Pro '+part);
 assert.ok(total.includes(unknown)&&!total.includes('CHF '),total);
 const multiple=answer('2 x iPhone 15 Pro '+part+' und iPhone 14 Pro '+part);
 assert.ok(multiple.includes(unknown)&&!multiple.includes('CHF '),multiple);
 const quote=answer('iPhone 17 Akku Original, Pulled');assert.ok(!/CHF/.test(quote),quote);
 const soft=answer('iPhone 17 Display Soft OLED');assert.ok(!/CHF/.test(soft),soft);
 const batteryLabel=ctx.window.MujiRepairLabel('Akku Original, Service Pack',lang);
 const conjunction=({de:'und',en:'and',fr:'et',it:'e'})[lang];
 const combined=answer('iPhone 15 '+part+' '+conjunction+' '+batteryLabel);
 assert.ok(combined.includes(batteryLabel)&&!combined.includes('CHF '),combined);
 const premiumLabel=ctx.window.MujiRepairLabel('Display Premium',lang);
 const alternatives=answer('iPhone 15 '+part+' '+conjunction+' '+premiumLabel);
 assert.ok(alternatives.includes(unknown)&&!alternatives.includes('CHF ')&&!alternatives.includes('undefined'),alternatives);
 const either=answer('iPhone 15 '+part+' '+({de:'oder',en:'or',fr:'ou',it:'oppure'})[lang]+' iPhone 14 Pro '+part);
 assert.ok(!either.includes('CHF '),either);
 for(const q of ['iPhone 15 '+part+' '+conjunction+' Samsung Galaxy S100 Display','iPhone 15 Pro Mini Display','iPhone 15 '+part+' '+conjunction+' iPhone 18 Pro Display']){
  const unclear=answer(q);assert.ok(unclear.length>30&&!unclear.includes('CHF'),unclear);
 }
}
console.log('PASS: '+checked+' model/quality/price answers in four languages; comma-separated repairs, alternative parts, unresolved models, quality text, Ads routing, totals, quantities and unknown costs.');

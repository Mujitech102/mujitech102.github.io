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
 const part=ctx.window.MujiRepairLabel('Display Original, Pulled',lang);const total=answer('iPhone 15 Pro '+part+' und iPhone 14 Pro '+part);assert.ok(total.includes('CHF 480.00'),total);
 const multiple=answer('2 x iPhone 15 Pro '+part+' und iPhone 14 Pro '+part);assert.ok(multiple.includes('CHF 755.00'),multiple);
 const quote=answer('iPhone 12 Pro Display Original, Pulled');assert.ok(!/CHF/.test(quote),quote);
 const soft=answer('iPhone 17 Display Soft OLED');assert.ok(!/CHF/.test(soft),soft);
}
console.log('PASS: '+checked+' model/quality/price answers in four languages, shared quality text, Ads routing, totals, quantities, unknown costs and unconfirmed OLED technology.');

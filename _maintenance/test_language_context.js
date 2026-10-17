/* Exercise the actual language-link initializer without browser or network access. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../assets/enhancements.js'),'utf8').split('/* Match the preferred reply channel')[0];
const prefixes=['','/en','/fr','/it'];
function initialise(page,prefix,query,hash=''){
  const links=prefixes.map(p=>({href:'https://mujitech.ch'+p+'/'+page}));
  const external={href:'https://example.test/language'};
  const location={origin:'https://mujitech.ch',href:'https://mujitech.ch'+prefix+'/'+page+query+hash,search:query,hash};
  const document={readyState:'complete',documentElement:{lang:prefix.slice(1)||'de'},querySelector:()=>null,querySelectorAll:s=>s==='.language-options a'?[...links,external]:[]};
  vm.runInNewContext(source,{document,location,URL,URLSearchParams});
  return {links:links.map(x=>new URL(x.href)),external:external.href};
}
let combinations=0;
for(const prefix of prefixes){
  for(const [page,name] of [['kontakt.html','bereich'],['privatkunden.html','service']]){
    const html=fs.readFileSync(path.join(__dirname,'..',prefix.slice(1),page),'utf8');
    const select=html.match(new RegExp('<select\\b[^>]*name="'+name+'"[^>]*>([\\s\\S]*?)<\\/select>'));
    assert.ok(select,'published selector '+page+' '+prefix);
    const choices=[...select[1].matchAll(/<option\b[^>]*value="([^"]+)"/g)].map(m=>m[1]);
    for(const value of choices){
      const result=initialise(page,prefix,'?service='+encodeURIComponent(value)+'&email=PRIVATE_EMAIL','#anfrage');
      for(const link of result.links){
        assert.equal(link.searchParams.get('service'),value,page+' '+prefix+' '+value);
        assert.equal(link.searchParams.has('email'),false);
        assert.equal(link.hash,'#anfrage');
        combinations++;
      }
      assert.equal(result.external,'https://example.test/language');
    }
  }
}
for(const value of ['PRIVATE_VALUE','__proto__','constructor']){
  for(const link of initialise('kontakt.html','','?service='+value).links)assert.equal(link.searchParams.has('service'),false);
}
for(const problem of ['display','battery','computer']){
  for(const link of initialise('reparaturanfrage.html','','?problem='+problem).links)assert.equal(link.searchParams.get('problem'),problem);
}
console.log('PASS: '+combinations+' service/language destinations, problem context, anchors, unknown values and external links.');

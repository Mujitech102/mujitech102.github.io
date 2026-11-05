/* Static-host bridge for existing enquiry URLs. No submission or tracking. */
(() => {
  const current=new URL(location.href);
  const file=current.pathname.split('/').pop();
  const aliases={'repair-request.html':'en','demande-reparation.html':'fr','richiesta-riparazione.html':'it'};
  const language=aliases[file]||(document.documentElement.lang||'de').slice(0,2);
  const target=new URL('/assistent/',current.origin);
  for(const key of ['service','form','problem','model','repair','product','offer','kind']){
    const value=current.searchParams.get(key);
    if(value&&value.length<=500&&!/[\x00-\x1f\x7f]/.test(value))target.searchParams.set(key,value);
  }
  target.searchParams.set('lang',['de','en','fr','it'].includes(language)?language:'de');
  if(!target.searchParams.has('service')&&!target.searchParams.has('form'))target.searchParams.set('service','repair');
  location.replace(target.href);
})();

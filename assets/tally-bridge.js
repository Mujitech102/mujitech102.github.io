/* Documented Tally embed/events only. No private APIs, answer scraping or SMTP.
 * Merely loading this module makes no third-party requests.
 */
(() => {
 'use strict';
 const cache=new Map(),submitted=new Set();let loader;
 const config=()=>window.MujiInquiryTransport;
 const enabled=()=>config()?.enabled===true&&config().provider==='tally'&&['de','en','fr','it'].every(l=>/^[A-Za-z0-9]+$/.test(config().formIds?.[l]||''));
 const load=()=>loader||(loader=new Promise((resolve,reject)=>{if(window.Tally?.loadEmbeds){resolve();return;}const s=document.createElement('script');s.src='https://tally.so/widgets/embed.js';s.async=true;s.onload=()=>window.Tally?.loadEmbeds?resolve():reject(Error('widget'));s.onerror=()=>reject(Error('widget'));document.head.append(s);}));
 function safeContext(context){
  const allowed=['language','service','selection','issues','device_context','repair_context','product_context','offer_context','source_page','request_mode'];
  const result={};for(const key of allowed){const value=context[key];if(typeof value==='string'&&value.length<=500&&!/[\x00-\x1f\x7f]/.test(value))result[key]=value;}
  return result;
 }
 function show({lang,context,title,onSubmitted,onUnavailable}){
  if(!enabled())return false;
  const host=document.querySelector('#tallyForms'),formId=config().formIds[lang];
  // The official widget forwards the host query. Strip it before loading;
  // selection context stays in the wizard's memory. Never expose contact data.
  const safeURL=new URL(location.href);safeURL.search='';safeURL.hash='';safeURL.searchParams.set('lang',lang);
  history.replaceState(null,'',safeURL);
  const data=safeContext(context),signature=JSON.stringify(data);
  for(const entry of cache.values())entry.wrapper.hidden=true;
  let entry=cache.get(lang);
  if(entry&&entry.signature!==signature){
   // Do not silently reload a form that may contain typed contact details.
   // Keep it intact. The outer summary remains the current selection; the user
   // can explicitly restart only this contact form to refresh its context.
   const notice=document.querySelector('#tallyContextNotice');notice.hidden=false;
   const restart=document.querySelector('#tallyContextRestart');
   restart.onclick=()=>{entry.wrapper.remove();cache.delete(lang);notice.hidden=true;show({lang,context,title,onSubmitted,onUnavailable});};
   entry.wrapper.hidden=true;
   return true;
  }else document.querySelector('#tallyContextNotice').hidden=true;
  if(!entry){
   const wrapper=document.createElement('div'),iframe=document.createElement('iframe');
   const url=new URL('https://tally.so/embed/'+formId);
   for(const [key,value] of Object.entries({alignLeft:'1',hideTitle:'1',transparentBackground:'1',dynamicHeight:'1',...data}))url.searchParams.set(key,value);
   iframe.dataset.tallySrc=url.href;iframe.loading='lazy';iframe.width='100%';iframe.height='780';iframe.title=title;iframe.className='tally-embed';iframe.setAttribute('frameborder','0');
   wrapper.append(iframe);host.append(wrapper);entry={wrapper,iframe,signature,formId,onSubmitted,onUnavailable};cache.set(lang,entry);
   load().then(()=>window.Tally.loadEmbeds()).catch(()=>entry.onUnavailable(iframe));
  }
  entry.onSubmitted=onSubmitted;entry.onUnavailable=onUnavailable;entry.wrapper.hidden=false;
  return true;
 }
 window.addEventListener('message',event=>{
  if(event.origin!=='https://tally.so')return;
  const entry=[...cache.values()].find(value=>event.source===value.iframe.contentWindow);
  if(!entry||typeof event.data!=='string')return;
  let message;try{message=JSON.parse(event.data);}catch{return;}
  if(message?.event!=='Tally.FormSubmitted'||message.payload?.formId!==entry.formId||typeof message.payload?.id!=='string'||!message.payload.id)return;
  const key=entry.formId+':'+message.payload.id;if(submitted.has(key))return;submitted.add(key);
  // Deliberately ignore payload.fields (contains personal information).
  entry.onSubmitted(entry.iframe);
 });
 window.MujiTallyBridge=Object.freeze({enabled,show});
})();

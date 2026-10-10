from pathlib import Path
from html import escape,unescape
from html.parser import HTMLParser
from urllib.parse import urlsplit,urlunsplit,parse_qsl,urlencode
import re,json
from quality import apply_quality
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'_localization/source';DOMAIN='https://mujitech.ch';VERSION='20261010-4'
LANGS={'de':'de-CH','en':'en','fr':'fr-CH','it':'it-CH'}
NAMES={'de':'Deutsch','en':'English','fr':'Français','it':'Italiano'}
legacy={'reparation-suisse.html':('fr','reparatur-schweiz.html'),'riparazione-svizzera.html':('it','reparatur-schweiz.html'),'repair-switzerland.html':('en','reparatur-schweiz.html'),'demande-reparation.html':('fr','reparaturanfrage.html'),'richiesta-riparazione.html':('it','reparaturanfrage.html'),'repair-request.html':('en','reparaturanfrage.html')}
FILES=sorted(p.name for p in BASE.glob('*.html') if p.name not in legacy)
T=json.loads((ROOT/'_localization'/'translations.json').read_text());SEO=json.loads((ROOT/'_localization'/'seo-copy.json').read_text())
norm=lambda s:re.sub(r'\s+',' ',unescape(s)).strip()
T={l:{norm(k):v for k,v in d.items()} for l,d in T.items()}
# Editorial corrections: original names, Swiss terminology and faithful consent language.
patch={
'Max Muster':['Jean Dupont','Mario Rossi','Alex Smith'],
'Ich habe die':['J’ai lu la','Ho letto l’informativa','I have read the'],
'gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage zu. *':['et j’accepte le traitement de mes données pour répondre à ma demande. *','e acconsento al trattamento dei miei dati per rispondere alla richiesta. *','and consent to my details being processed to respond to my enquiry. *'],
'gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu. *':['et j’accepte le traitement de mes données pour répondre à la demande. *','e acconsento al trattamento dei miei dati per rispondere alla richiesta. *','and consent to my details being processed to respond to the enquiry. *'],
'Datenschutzerklärung':['politique de confidentialité','sulla privacy','privacy policy'],
'Handy-Einrichtung':['Configuration smartphone','Configurazione smartphone','Smartphone setup'],
'PC-Hilfe, Datenübertragung und WLAN-Service in St. Gallen.':['Assistance informatique, configuration smartphone et Wi-Fi à Saint-Gall.','Assistenza computer, configurazione smartphone e Wi-Fi a San Gallo.','Computer help, smartphone setup and Wi-Fi support in St. Gallen.'],
'Deine neue Website.':['Votre site internet professionnel.','Il tuo sito web professionale.','Your professional business website.'],
'Professionell. Klar. Bezahlbar.':['Créé en Suisse. Clair. Accessible.','Creato in Svizzera. Chiaro. Accessibile.','Built in Switzerland. Clear. Affordable.'],
'Gebraucht · professionell aufbereitet':['D’occasion · reconditionné professionnellement','Usato · ricondizionato professionalmente','Used · professionally refurbished'],
'12 Monate Mujitech Garantie auf die Technik':['Garantie Mujitech de 12 mois sur le matériel','Garanzia Mujitech di 12 mesi sull’hardware','12-month Mujitech hardware warranty'],
'12 Monate Mujitech Garantie auf die Gerätetechnik':['Garantie Mujitech de 12 mois sur le matériel','Garanzia Mujitech di 12 mesi sull’hardware','12-month Mujitech hardware warranty'],
'Soft-OLED-Ersatzdisplay mit 120 Hz':['Écran de remplacement Soft-OLED à 120 Hz','Schermo di ricambio Soft-OLED a 120 Hz','120 Hz Soft-OLED replacement screen'],
'Website-Erstellung':['Création de sites web','Creazione siti web','Web design'],
'PC-/Laptop-Optimierung':['Optimisation PC et portable','Ottimizzazione PC e portatili','PC and laptop optimisation'],
'Fachbetrieb für Hardware-Montage & Komponententausch':['Atelier de remplacement de composants','Laboratorio per sostituzione componenti','Component replacement workshop'],
'Zum Inhalt':['Aller au contenu','Vai al contenuto','Skip to content'],
'Sprache wählen':['Choisir la langue','Scegli la lingua','Choose language'],
'Google-Rezension':['Avis Google','Recensione Google','Google review'],
'von 5 Sternen':['sur 5 étoiles','su 5 stelle','out of 5 stars'],
'-Sterne-Bewertung':[' étoiles',' stelle','-star review']
}
patch.update(json.loads((ROOT/'_localization'/'manual-extra.json').read_text()))
for k,vals in patch.items():
 for l,v in zip(['fr','it','en'],vals):T[l][norm(k)]=v
# Preserve manufacturer terms and personal names; never translate contact addresses or prices.
for l in T:
 for k in list(T[l]):
  if re.fullmatch(r'(?:[^\s]+@[^\s]+|https?://[^\s]+|CHF\s[0-9.,’\'–/ -]+|\d[\d\s+%.–’\'/-]*|MUJI|TECH|Mujitech|Space Black|Soft-OLED · 120 Hz|Max Muster)',k):
   if k!='Max Muster':T[l][k]=k
 for k in ['Deutsch','English','Français','Italiano','Jura','Zug','St. Gallen','Abtwil SG','Aargau','Appenzell Ausserrhoden','Appenzell Innerrhoden','Basel-Landschaft','Basel-Stadt','Bern / Berne','Freiburg / Fribourg','Genève / Genf','Glarus','Graubünden / Grisons / Grigioni','Luzern','Neuchâtel / Neuenburg','Nidwalden','Obwalden','Schaffhausen','Schwyz','Solothurn','Thurgau','Ticino / Tessin','Uri','Valais / Wallis','Vaud / Waadt','Zürich']:T[l][k]=k
for l,label in [('fr','mois'),('it','mese'),('en','month')]:
 for k in list(T[l]):
  if k.startswith('CHF ') and '/ Monat' in k:T[l][k]=k.replace('/ Monat','/ '+label)
 T[l]['CHF 75.– / Std.']='CHF 75.– / '+{'fr':'h','it':'ora','en':'hour'}[l]
CANTONS={
 'fr':['Argovie','Appenzell Rhodes-Extérieures','Appenzell Rhodes-Intérieures','Bâle-Campagne','Bâle-Ville','Berne','Fribourg','Genève','Glaris','Grisons','Jura','Lucerne','Neuchâtel','Nidwald','Obwald','Schaffhouse','Schwytz','Soleure','Saint-Gall','Thurgovie','Tessin','Uri','Valais','Vaud','Zoug','Zurich'],
 'it':['Argovia','Appenzello Esterno','Appenzello Interno','Basilea Campagna','Basilea Città','Berna','Friburgo','Ginevra','Glarona','Grigioni','Giura','Lucerna','Neuchâtel','Nidvaldo','Obvaldo','Sciaffusa','Svitto','Soletta','San Gallo','Turgovia','Ticino','Uri','Vallese','Vaud','Zugo','Zurigo']
}
original=['Aargau','Appenzell Ausserrhoden','Appenzell Innerrhoden','Basel-Landschaft','Basel-Stadt','Bern / Berne','Freiburg / Fribourg','Genève / Genf','Glarus','Graubünden / Grisons / Grigioni','Jura','Luzern','Neuchâtel / Neuenburg','Nidwalden','Obwalden','Schaffhausen','Schwyz','Solothurn','St. Gallen','Thurgau','Ticino / Tessin','Uri','Valais / Wallis','Vaud / Waadt','Zug','Zürich']
for l,values in CANTONS.items():T[l].update(dict(zip(original,values)))
T['fr']['UID: CHE-480.937.625']='IDE : CHE-480.937.625'
T['it']['UID: CHE-480.937.625']='IDI: CHE-480.937.625'
for l in T:
 for name in ['Samira Dörig','Leonora Beauty Academy','Gabi Sutter','Patryk Basztabin','Irene Küng','Srish','Alina Brüllhardt','C O','Natascha Biell','Wei W','shehryaar ali','Dampflanzservice-Ademi','Dampfglanzservice- Ademi']:
  T[l][name]=name
 for k in list(T[l]):
  if len(k)==1:T[l][k]=k
  if l=='it':T[l][k]=T[l][k].replace('preoccupazione','esigenza').replace('sito Web','sito web').replace('RICHIESTA IN LINEA','RICHIESTA ONLINE')
  if l=='fr':T[l][k]=T[l][k].replace('préoccupation','demande')
# Store editorial source to make regenerated builds reproducible.
(ROOT/'_localization'/'edited-translations.json').write_text(json.dumps(T,ensure_ascii=False,indent=2))
def tr(s,l):
 key=norm(s)
 if l=='de':return key
 out=T[l].get(key,key)
 # Keep Soft-OLED as a component name, not a claim of original Apple parts.
 for old in ['OLED souple','OLED souples','OLED morbido','OLED morbide','soft OLED']:out=out.replace(old,'Soft-OLED')
 out=out.replace('WLAN','Wi-Fi')
 return out

def path_for(f,l):return ('/' if l=='de' else '/'+l+'/')+('' if f=='index.html' else f)
def canonical(f,l):return DOMAIN+path_for(f,l)
def contact_message(value,l,key):
 if l=='de':return value
 if key=='subject':return value.replace('Anfrage ',{'fr':'Demande : ','it':'Richiesta: ','en':'Enquiry: '}[l])
 fixed={
 'Guten Tag, ich habe eine Frage zu einer Reparatur.':{'fr':'Bonjour, j’ai une question concernant une réparation.','it':'Buongiorno, ho una domanda su una riparazione.','en':'Hello, I have a question about a repair.'},
 'Guten Tag, ich interessiere mich für Ihre IT-Dienstleistungen.':{'fr':'Bonjour, vos services informatiques m’intéressent.','it':'Buongiorno, sono interessato ai vostri servizi informatici.','en':'Hello, I am interested in your IT services.'}}
 if value in fixed:return fixed[value][l]
 if 'iPhone' in value:
  model=value[value.index('iPhone'):].replace(' in Silber',' in Silver').replace(' in Space Black',' in Space Black').replace(' für CHF',' for CHF').rstrip('.')
  if l=='fr':return 'Bonjour Mujitech, je suis intéressé(e) par l’'+model.replace(' in Silver',' argent').replace(' in Space Black',' Space Black').replace(' for CHF',' à CHF')+'.'
  if l=='it':return 'Buongiorno Mujitech, sono interessato all’'+model.replace(' in Silver',' argento').replace(' in Space Black',' Space Black').replace(' for CHF',' a CHF')+'.'
  return 'Hello Mujitech, I am interested in the '+model+'.'
 return value

def localurl(u,l,asset=False):
 if l!='de' and (u.startswith('mailto:') or 'wa.me/' in u):
  p=urlsplit(u)
  if p.query:
   q=[(k,contact_message(v,l,k) if k in ['text','subject','body'] else v) for k,v in parse_qsl(p.query,keep_blank_values=True)]
   return urlunsplit((p.scheme,p.netloc,p.path,urlencode(q),p.fragment))
 if not u or u.startswith(('#','data:','mailto:','tel:','javascript:')):return u
 p=urlsplit(u)
 if p.netloc and p.netloc not in ('mujitech.ch','www.mujitech.ch'):return u
 original=p.path.lstrip('/')
 if original.startswith(('en/','fr/','it/')):original=original.split('/',1)[1]
 if original in legacy:original=legacy[original][1]
 if not original:original='index.html'
 if original in FILES:
  dest=path_for(original,l)
  if p.netloc:dest=DOMAIN+dest
  return dest+('?' +p.query if p.query else '')+('#'+p.fragment if p.fragment else '')
 # Asset paths stay relative on German originals; subdirectories use a parent prefix.
 if not p.netloc and l!='de' and not p.path.startswith('/'):
  return '../'+u
 return u

ATTR=re.compile(r'(\s)([\w:-]+)(\s*=\s*)(["\'])(.*?)\4',re.S)
def tag_change(tag,l):
 name=(re.match(r'<\s*([\w:-]+)',tag) or [None,''])[1].lower()
 attrs={k.lower():unescape(v) for _,k,_,_,v in ATTR.findall(tag)}
 def repl(m):
  sp,k,eq,q,v=m.groups();decoded=unescape(v);out=decoded
  if k in ['href','src','poster']:out=localurl(decoded,l)
  elif k in ['alt','aria-label','placeholder','title'] or (k=='label' and name=='optgroup'):out=tr(decoded,l)
  elif k=='lang' and name=='html':out=LANGS[l]
  elif k=='content' and name=='meta':
   mk=attrs.get('name',attrs.get('property',''))
   if mk in ['description','og:description','twitter:description','og:title','twitter:title']:out=tr(decoded,l)
   elif mk=='og:locale':out=LANGS[l].replace('-','_') if l!='en' else 'en_GB'
   elif mk=='og:url':out=localurl(decoded,l)
  elif k=='value' and attrs.get('name')=='_next':out=localurl(decoded,l)
  elif k=='value' and attrs.get('type')=='submit':out=tr(decoded,l)
  if k in ['src','href'] and ('assets/enhancements.' in out or 'assets/insights.js' in out or 'assets/app.js' in out or 'assets/mono-electric.js' in out):out=re.sub(r'\?v=.*$', '?v='+VERSION,out)
  return sp+k+eq+q+escape(out,quote=True)+q
 return ATTR.sub(repl,tag)

def js_change(js,l):
 # Only translate complete string literals that occur in the public copy inventory.
 if l=='de':return js
 def repl(m):
  raw=m[2]
  try:val=json.loads('"'+raw.replace('"','\\"')+'"') if m[1]=="'" else json.loads(m[0])
  except:val=raw
  k=norm(val)
  if k not in T[l]:return m[0]
  out=tr(val,l)
  if val[:1].isspace():out=' '+out
  if val[-1:].isspace():out=out+' '
  return json.dumps(out,ensure_ascii=False)
 return re.sub(r'(["\'])((?:\\.|(?!\1)[^\\\n])*?)\1',repl,js)

def structured(data,l,f):
 def walk(v,k=''):
  if isinstance(v,dict):return {kk:walk(x,kk) for kk,x in v.items()}
  if isinstance(v,list):return [walk(x,k) for x in v]
  if not isinstance(v,str):return v
  if k=='inLanguage':return LANGS[l]
  if k in ['name','description','serviceType','category']:return tr(v,l)
  if k in ['url','item','@id'] and v.startswith(DOMAIN):
   if v.endswith(('#organization','#business','#website')):return v
   return localurl(v,l)
  return v
 return walk(data)

def selector(f,l):
 label=tr('Sprache wählen',l)
 links=''.join(f'<a href="{path_for(f,x)}" lang="{LANGS[x]}" hreflang="{LANGS[x]}"'+(' aria-current="page"' if x==l else '')+f'>{NAMES[x]}</a>' for x in LANGS)
 return f'<nav class="language-bar" aria-label="{label}"><div class="wrap"><span class="language-label">{label}</span><div class="language-options">{links}</div></div></nav>'

pattern=r'(<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>|<!--.*?-->|<[^>]+>)'
def build(f,l,source=None):
 data=(BASE/(source or f)).read_text()
 # Remove previous alternating-language controls, rebuilt for every page below.
 data=re.sub(r'<link\b[^>]*rel=["\'](?:canonical|alternate)["\'][^>]*>','',data)
 data=re.sub(r'<div class="wrap ch-languages".*?</div>','',data,flags=re.S)
 data=re.sub(r'<meta\b[^>]*name=["\']keywords["\'][^>]*>','',data)
 if f=='404.html':
  data=data.replace('</head>',f'<meta name="robots" content="noindex"><link rel="stylesheet" href="assets/enhancements.css?v={VERSION}"><script defer src="assets/enhancements.js?v={VERSION}"></script></head>')
 if f=='privatkunden.html':
  new='<article class="service-card" id="handy-einrichtung"><div class="service-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="14" y="4" width="20" height="40" rx="4"/><path d="M20 36h8M20 12h8M20 18h8"/></svg></div><h3>Handy-Einrichtung</h3><p>Neues Smartphone einrichten, E-Mail und Apps konfigurieren, Kontakte übertragen und die wichtigsten Einstellungen gemeinsam durchgehen. Zugangsdaten geben Sie selbst ein.</p><a class="private-btn" href="#service-anfrage" data-service="Handy-Einrichtung">Jetzt anfragen →</a></article>'
  data=data.replace('      </div>\n    </div>\n  </section>\n\n\n  <!-- SERVICEANFRAGE -->',new+'      </div>\n    </div>\n  </section>\n\n\n  <!-- SERVICEANFRAGE -->')
  data=data.replace('<option value="Sonstige Technik-Hilfe">','<option value="Handy-Einrichtung">Handy-Einrichtung</option><option value="Sonstige Technik-Hilfe">')
 if f=='websites.html':data=data.replace('Deine neue Website.','Deine neue Website.').replace('<span>MUJI<span>TECH</span></span>','<span class="brand-wordmark">Mujitech</span>')
 if f=='mujitech-service.html':
  data=data.replace('41767209832','41768444673').replace('tilt-effect','')
  data=re.sub(r' onerror="[^"]*"','',data)
 chunks=re.split(pattern,data,flags=re.S|re.I);out=[]
 for part in chunks:
  if not part:continue
  low=part.lower()
  if low.startswith('<script'):
   m=re.match(r'(<script[^>]*>)(.*?)(</script\s*>)',part,re.S|re.I)
   if 'application/ld+json' in m[1]:
    schema=structured(json.loads(m[2]),l,f)
    if schema.get('@type')=='WebPage':continue
    if '@graph' in schema:schema['@graph']=[v for v in schema['@graph'] if v.get('@type')!='WebPage']
    body=json.dumps(schema,ensure_ascii=False)
   else:body=js_change(m[2],l)
   out.append(tag_change(m[1],l)+body+m[3])
  elif low.startswith('<style'):
   out.append(re.sub(r'url\((["\']?)([^)"\']+)\1\)',lambda m:'url('+m[1]+localurl(m[2],l,True)+m[1]+')',part))
  elif part.startswith('<!--'):out.append(part)
  elif part.startswith('<'):out.append(tag_change(part,l))
  elif norm(part):
   prefix=re.match(r'^\s*',part)[0];suffix=re.search(r'\s*$',part)[0]
   out.append(prefix+escape(tr(part,l),quote=False)+suffix)
  else:out.append(part)
 data=''.join(out)
 data=apply_quality(data,f,l,path_for,canonical)
 # Editorial H1 additions make each main service identifiable without keyword lists.
 if f=='index.html':
  headlines={'de':['Reparaturen.','Computerhilfe.','Webdesign.'],'fr':['Réparations.','Informatique.','Sites web.'],'it':['Riparazioni.','Assistenza PC.','Siti web.'],'en':['Repairs.','Computer help.','Web design.']}
  a,b,c=headlines[l]
  data=re.sub(r'<h1>.*?</h1>',f'<h1>{a}<span>{b}</span><span class="m-outline">{c}</span></h1>',data,count=1,flags=re.S)
 if f=='privatkunden.html' and l=='de':data=data.replace('PC-Hilfe, Datenübertragung und WLAN-Service in St. Gallen.','Computerhilfe, Handy-Einrichtung und WLAN-Service in St. Gallen.')
 # Logo and company name together, preserving the existing header structure.
 def brand(m):
  header=m[0]
  if 'brand-wordmark' not in header and 'brand-title' not in header:
   header=re.sub(r'(<a\b[^>]*>\s*<img\b[^>]*>)',lambda x:x[1]+'<span class="brand-wordmark">Mujitech</span>',header,count=1,flags=re.S)
  header=re.sub(r'(<a\b[^>]*)(>\s*<img)',lambda x:x[1]+' data-brand="true"'+x[2],header,count=1,flags=re.S)
  return header
 data=re.sub(r'<header\b[^>]*>.*?</header>',brand,data,count=1,flags=re.S)
 data=data.replace('</header>','</header>'+selector(f,l),1)
 # Add an always-available skip link, even for the 404 and thank-you pages.
 if '<main' in data and 'class="skip-link"' not in data:
  if not re.search(r'<main\b[^>]*\bid=',data):data=re.sub(r'<main\b', '<main id="main"',data,count=1)
  mid=re.search(r'<main\b[^>]*\bid=["\']([^"\']+)',data)[1]
  data=re.sub(r'(<body\b[^>]*>)',lambda m:m[1]+f'<a class="skip-link" href="#{mid}">{tr("Zum Inhalt",l)}</a>',data,count=1)
 # Add the current language to every form without altering backend field identifiers.
 data=re.sub(r'(<form\b[^>]*>)',lambda m:m[1]+f'<input type="hidden" name="Website-Sprache" value="{NAMES[l]}"><input class="form-trap" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">',data)
 # Reply language defaults to the current language, when that selector exists.
 def reply(m):
  opts=re.sub(r'\sselected\b','',m[2]);opts=re.sub(r'(<option\b[^>]*value="'+l+r'")',r'\1 selected',opts)
  return m[1]+opts+m[3]
 data=re.sub(r'(<select\b[^>]*name="Antwortsprache"[^>]*>)(.*?)(</select>)',reply,data,flags=re.S)
 # Translated legal page is available now; remove outdated (DE) annotations.
 if l!='de':data=data.replace(' (DE)','')
 # All menu pages also link directly to smartphone setup.
 link=f'<a href="{path_for("privatkunden.html",l)}#handy-einrichtung">{tr("Handy-Einrichtung",l)}</a>'
 data=re.sub(r'(<a[^>]*href="[^"\']*privatkunden.html#daten"[^>]*>.*?</a>)',lambda m:m[1]+link,data,count=1,flags=re.S)
 title_match=re.search(r'<title>(.*?)</title>',data,re.S)
 title=unescape(title_match[1]).strip()
 class Meta(HTMLParser):
  description=''
  def handle_starttag(self,t,a):
   a=dict(a)
   if t=='meta' and a.get('name')=='description':self.description=a.get('content','')
 parser=Meta();parser.feed(data);description=parser.description
 if f in SEO:title,description=SEO[f][l]
 data=re.sub(r'<title>.*?</title>','<title>'+escape(title)+'</title>',data,flags=re.S)
 data=re.sub(r'<meta\b[^>]*(?:name="(?:description|twitter:title|twitter:description)"|property="(?:og:title|og:description|og:url|og:locale)")[^>]*>','',data)
 if f=='bewertungen.html' and l!='de':
  notes={'fr':'Les avis ci-dessous sont traduits à partir des témoignages publiés.','it':'Le recensioni seguenti sono tradotte dalle testimonianze pubblicate.','en':'The reviews below are translated from the published customer feedback.'}
  data=data.replace('<div class="reviews-grid"',f'<p class="review-translation-note">{notes[l]}</p><div class="reviews-grid"')
 links=''.join(f'<link rel="alternate" hreflang="{LANGS[x]}" href="{canonical(f,x)}">' for x in LANGS)
 links+=f'<link rel="alternate" hreflang="x-default" href="{canonical(f,"de")}">'
 meta=f'<link rel="canonical" href="{canonical(f,l)}">'+links+f'<meta name="description" content="{escape(description,quote=True)}"><meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:url" content="{canonical(f,l)}"><meta property="og:locale" content="{LANGS[l].replace("-","_")}">'
 if f not in ['404.html','danke.html']:
  page={'@context':'https://schema.org','@type':'WebPage','@id':canonical(f,l)+'#webpage','url':canonical(f,l),'name':title,'description':description,'inLanguage':LANGS[l],'isPartOf':{'@id':DOMAIN+'/#website'},'about':{'@id':DOMAIN+'/#organization'}}
  meta+='<script type="application/ld+json">'+json.dumps(page,ensure_ascii=False)+'</script>'
 if f=='index.html':
  labels={'de':['Direkt kontaktieren','Über WhatsApp kontaktieren','Mujitech anrufen','E-Mail an Mujitech schreiben','Cookie-Einstellungen'],'fr':['Contact direct','Contacter sur WhatsApp','Appeler Mujitech','Envoyer un e-mail à Mujitech','Paramètres des cookies'],'it':['Contatto diretto','Contatta su WhatsApp','Chiama Mujitech','Scrivi un’e-mail a Mujitech','Impostazioni dei cookie'],'en':['Contact us directly','Contact us on WhatsApp','Call Mujitech','Email Mujitech','Cookie settings']}[l]
  icons=[('<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8.1 7.7c.4-.4.8-.2 1 .3l.8 1.7c.2.4 0 .7-.5 1.1.7 1.5 1.8 2.6 3.3 3.3.4-.5.7-.7 1.1-.5l1.7.8c.5.2.7.6.3 1-.7.9-1.7 1-2.8.6-2.8-1-5.1-3.3-6.1-6.1-.4-1.1-.3-2.1.6-2.8Z"/>'),('<path d="M8.2 3.8 5.8 3a1.4 1.4 0 0 0-1.7.8c-2.3 5.2 5.9 13.4 11.1 16.1a3.6 3.6 0 0 0 4.4-.5l1.1-1.2a1.4 1.4 0 0 0-.3-2.1l-3.1-1.9a1.4 1.4 0 0 0-1.7.2L14 16c-2.6-1.4-4.6-3.4-6-6l1.5-1.6a1.4 1.4 0 0 0 .2-1.7L8.2 3.8Z"/>'),('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>')]
  hrefs=['https://wa.me/41768444673','tel:+41768444673','mailto:info@mujitech.ch']
  buttons=''.join(f'<a class="home-contact-button ui-action" href="{href}" aria-label="{escape(label,quote=True)}" title="{escape(label,quote=True)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{icon}</svg></a>' for href,label,icon in zip(hrefs,labels[1:4],icons))
  contacts=f'<div class="home-contact-tools"><nav class="home-contact-buttons" aria-label="{labels[0]}">{buttons}</nav><button class="home-cookie-settings" type="button" data-consent-settings>{labels[4]}</button></div>'
  data=data.replace('<div class="m-trust">',contacts+'<div class="m-trust">',1)
 # Load shared presentation last so inline legacy hover styles cannot override it.
 data=re.sub(r'<link[^>]*href="[^"\']*assets/enhancements.css[^"\']*"[^>]*>','',data)
 meta+=f'<link rel="stylesheet" href="/assets/enhancements.css?v={VERSION}">'
 data=data.replace('</head>',meta+'</head>',1)
 if f=='404.html':data=data.replace('src="assets/enhancements.js','src="/assets/enhancements.js').replace('src="../assets/enhancements.js','src="/assets/enhancements.js')
 data=re.sub(r'\n[ \t]+\n','\n\n',data)
 return data

for l in LANGS:
 if l!='de':(ROOT/l).mkdir(exist_ok=True)
 for f in FILES:
  source=next((old for old,pair in legacy.items() if pair==(l,f)),None)
  dest=ROOT/f if l=='de' else ROOT/l/f
  dest.write_text(build(f,l,source))
for old,(l,f) in legacy.items():
 # Keep old links working with canonical references to the complete language site.
 (ROOT/old).write_text(build(f,l,old).replace('../assets/','assets/').replace('../logo.webp','logo.webp'))
from xml.etree.ElementTree import Element,SubElement,ElementTree,register_namespace
NS='http://www.sitemaps.org/schemas/sitemap/0.9';X='http://www.w3.org/1999/xhtml';register_namespace('',NS);register_namespace('xhtml',X)
root=Element('{'+NS+'}urlset')
for f in FILES:
 if f in ['404.html','danke.html']:continue
 for l in LANGS:
  item=SubElement(root,'{'+NS+'}url');SubElement(item,'{'+NS+'}loc').text=canonical(f,l)
  for x in LANGS:SubElement(item,'{'+X+'}link',{'rel':'alternate','hreflang':LANGS[x],'href':canonical(f,x)})
  SubElement(item,'{'+X+'}link',{'rel':'alternate','hreflang':'x-default','href':canonical(f,'de')})
ElementTree(root).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
print(f'Built {len(FILES)} page families in four languages, {len(FILES)*4+len(legacy)} HTML files; {(len(FILES)-2)*4} sitemap URLs.')

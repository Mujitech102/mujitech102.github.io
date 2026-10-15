"""Reproducible improvements approved by the owner on 15 October 2026.
Run after any older localization generator. Does not change confirmed prices.
"""
from pathlib import Path
from html import escape,unescape
from urllib.parse import quote,urlsplit
from collections import defaultdict
import ast,json,re,sys,hashlib
from xml.etree import ElementTree as ET
from content_20261015 import COPY,LANGS,NAMES,VERSION
ROOT=Path(__file__).resolve().parents[1];DOMAIN='https://mujitech.ch'
e=lambda s:escape(str(s),quote=True)
def base(l):return '/' if l=='de' else '/'+l+'/'
def lang_of(p):return p.parts[0] if p.parts[0] in ['en','fr','it'] else 'de'
def jsonscript(value):return '<script type="application/ld+json">'+json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+'</script>'
def replace_section(s,ident,section):
 s=re.sub(r'<!-- '+ident+r' START -->.*?<!-- '+ident+r' END -->','',s,flags=re.S)
 return s.replace('</main>','<!-- '+ident+' START -->'+section+'<!-- '+ident+' END --></main>',1)
def service_section(l):
 c=COPY[l]
 return '<section class="quality-section service-terms" id="diagnose-versand"><div class="quality-wrap"><h2>'+e(c['diagnosis_title'])+'</h2><p>'+e(c['diagnosis'])+'</p><h3>'+e(c['shipping_title'])+'</h3><p>'+e(c['shipping'])+'</p><p><a href="'+base(l)+'preise.html">'+e(c['price_link'])+' →</a></p></div></section>'
# Retain the common existing part terminology in static and interactive lists.
script=(ROOT/'assets/repair-prices.js').read_text()
terms=ast.literal_eval(re.search(r'const terms=(\[.*?\]);',script,re.S)[1])
dicts={l:ast.literal_eval(re.search(r'\b'+l+r':(\[.*?\])',script,re.S)[1]) for l in ['en','fr','it']}
extra={
 'komplett':['complete','complet','completa'], 'inkl.':['including','y compris','incluso'], 'Kleinteile':['small parts','petites pièces','piccoli componenti'], 'Rückseite':['Back','Face arrière','Retro'], 'Akku (Batterie)':['Battery','Batterie','Batteria'], 'beide Akkus':['both batteries','les deux batteries','entrambe le batterie'], 'mit Rahmen':['with frame','avec châssis','con telaio'], 'ohne Rahmen':['without frame','sans châssis','senza telaio'], 'Austausch':['Replacement','Remplacement','Sostituzione'], 'nicht verfügbar':['not available','indisponible','non disponibile'], 'Reparatur':['Repair','Réparation','Riparazione'], 'Linke':['Left','Gauche','Sinistra'], 'Rechte':['Right','Droite','Destra'], 'Links':['Left','Gauche','Sinistra'], 'Rechts':['Right','Droite','Destra'], 'Knopf':['Button','Bouton','Pulsante'], 'Ein / Aus':['Power','Marche / arrêt','Accensione'], 'Ein/Aus':['Power','Marche / arrêt','Accensione']}
extra.update({
 'Aux-Anschluss':['Audio jack','Prise audio','Presa audio'],
 'Hauptdisplay':['Main screen','Écran principal','Schermo principale'],
 'Hauptbildschirm':['Main screen','Écran principal','Schermo principale'],
 'Metallrahmen':['metal frame','châssis métallique','telaio metallico'],
 'Power Button (Einschaltknopf)':['Power button','Bouton marche/arrêt','Tasto di accensione'],
 'Sim- und Speicherkarten Halter':['SIM and memory card tray','Tiroir SIM et carte mémoire','Vassoio SIM e scheda memoria'],
 'Simkarten Halter':['SIM tray','Tiroir SIM','Vassoio SIM'],
 'Periskop Tele':['Periscope telephoto','Téléobjectif périscopique','Teleobiettivo periscopico'],
 'Home Button':['Home button','Bouton principal','Tasto Home'],
 'Vibration':['Vibration','Vibration','Vibrazione'],
 'Sub-Display':['Secondary screen','Écran secondaire','Schermo secondario'],
 'Backcover':['back cover','coque arrière','cover posteriore'],
 'Audio-Chip':['Audio chip','Puce audio','Chip audio']})
def label(value,l):
 value=re.sub(r'\s*\(Dauer[^)]+\)','',value)
 if l=='de':return value
 mapping={x:y for x,y in zip(terms,dicts[l])};mapping.update({x:v[['en','fr','it'].index(l)] for x,v in extra.items()})
 pattern=re.compile('|'.join(re.escape(x) for x in sorted(mapping,key=len,reverse=True)),re.I)
 lower={k.lower():v for k,v in mapping.items()}
 return pattern.sub(lambda m:lower[m[0].lower()],value)
source=(ROOT/'assets/repair-prices-data.js').read_text();book=json.loads(source[source.index('{'):].rstrip(';\n'));rows=book['rows']
# One reviewed set of part labels serves the interactive picker, bot and static catalogue.
exact={part:{l:label(part,l) for l in ['en','fr','it']} for part in sorted({r[1] for r in rows})}
block='/* REVIEWED PART LABELS START */\nconst exactLabels='+json.dumps(exact,ensure_ascii=False,separators=(',',':'))+';\n/* REVIEWED PART LABELS END */'
script=re.sub(r'/\* REVIEWED PART LABELS START \*/.*?/\* REVIEWED PART LABELS END \*/\n?','',script,flags=re.S)
script=script.replace("'use strict';", "'use strict';\n"+block,1)
if 'if(exactLabels[value]?.[lang])' not in script:
 script=script.replace("if(!dictionaries[lang])return value;", "if(exactLabels[value]?.[lang])return exactLabels[value][lang];if(!dictionaries[lang])return value;")
(ROOT/'assets/repair-prices.js').write_text(script)
provenance=json.loads((ROOT/'_maintenance/price-provenance-2026-10-15.json').read_text())
imports={(r['model'],r['repair']):float(r['price_chf']) for r in provenance['changes']}
for row in rows:
 if row[2] is None and (row[0],row[1]) in imports:row[2]=imports[(row[0],row[1])]
book['updated']='2026-10-15'
(ROOT/'assets/repair-prices-data.js').write_text('window.MujiPriceBook='+json.dumps(book,ensure_ascii=False,separators=(',',':'))+';\n')
BRANDS={
 'apple':('Apple',lambda m:m.startswith(('iPhone','iPad','MacBook'))),
 'samsung':('Samsung',lambda m:m.startswith('Galaxy')),
 'google':('Google Pixel',lambda m:m.startswith('Google')),
 'oneplus':('OnePlus',lambda m:m.startswith('OnePlus')),
 'xiaomi':('Xiaomi / Redmi / Poco',lambda m:m.startswith(('Xiaomi','Redmi','Mi ','Poco'))),
 'oppo':('Oppo',lambda m:m.startswith('Oppo')),
 'huawei':('Huawei',lambda m:m.startswith('Huawei')),
 'sony':('Sony Xperia',lambda m:m.startswith('Sony')),
 'microsoft':('Microsoft Surface',lambda m:m.startswith('Surface'))}
def catalog_path(brand,l):
 stem={'de':'reparaturpreise-','en':'repair-prices-','fr':'tarifs-reparation-','it':'prezzi-riparazione-'}[l]
 return base(l)+stem+brand+'.html'
def anchor(model):return 'modell-'+hashlib.sha256(model.encode()).hexdigest()[:12]
def price_table(items,l):
 c=COPY[l];output='<div class="catalog-table-wrap"><table class="catalog-table"><thead><tr><th scope="col">'+e(c['part'])+'</th><th scope="col">'+e(c['price'])+'</th><th scope="col"><span class="catalog-sr">'+e(c['request'])+'</span></th></tr></thead><tbody>'
 for model,part,price in items:
  value=c['unknown'] if price is None else 'CHF '+format(price,'.2f')
  href=base(l)+'anfrage.html?model='+quote(model,safe='')+'&amp;repair='+quote(part,safe='')+'#reparatur'
  output+='<tr><th scope="row">'+e(label(part,l))+'</th><td>'+e(value)+'</td><td><a href="'+href+'" aria-label="'+e(c['request']+' – '+model+' – '+label(part,l))+'">'+e(c['request'])+' →</a></td></tr>'
 return output+'</tbody></table></div>'
def directory(l):
 c=COPY[l]
 return '<section class="guide-directory catalog-directory"><h2>'+e(c['directory'])+'</h2><p>'+e(c['directory_intro'])+'</p><ul>'+''.join('<li><a href="'+catalog_path(k,l)+'">'+e(name)+'</a></li>' for k,(name,_) in BRANDS.items())+'</ul></section>'
def html_shell(l,path,title,description,h1,body):
 template=(ROOT/('iphone-display-reparatur.html' if l=='de' else {'en':'en/iphone-screen-repair.html','fr':'fr/reparation-ecran-iphone.html','it':'it/riparazione-display-iphone.html'}[l])).read_text()
 header=re.search(r'<header\b.*?</header>',template,re.S)[0];footer=re.search(r'<footer\b.*?</footer>',template,re.S)[0]
 alternates={x:DOMAIN+catalog_path(path,x) for x in LANGS}
 langs='<nav class="price-language" aria-label="'+{'de':'Sprache wählen','en':'Choose language','fr':'Choisir la langue','it':'Scegli la lingua'}[l]+'">'+''.join('<a href="'+catalog_path(path,x)+'" lang="'+LANGS[x]+'"'+(' aria-current="page"' if x==l else '')+'>'+NAMES[x]+'</a>' for x in LANGS)+'</nav>'
 canonical=DOMAIN+catalog_path(path,l)
 metas='<link rel="canonical" href="'+canonical+'">'+''.join('<link rel="alternate" hreflang="'+LANGS[x]+'" href="'+alternates[x]+'">' for x in LANGS)+'<link rel="alternate" hreflang="x-default" href="'+alternates['de']+'">'
 schema={'@context':'https://schema.org','@type':'Service','@id':canonical+'#service','name':h1,'serviceType':h1,'url':canonical,'description':description,'provider':{'@type':'Organization','@id':DOMAIN+'/#organization','name':'Mujitech','url':DOMAIN},'areaServed':{'@type':'Country','name':'Switzerland'}}
 return '<!doctype html><html lang="'+LANGS[l]+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+e(title)+'</title><meta name="description" content="'+e(description)+'">'+metas+'<meta property="og:title" content="'+e(title)+'"><meta property="og:description" content="'+e(description)+'"><meta property="og:url" content="'+canonical+'"><meta property="og:type" content="website"><meta property="og:image" content="'+DOMAIN+'/logo.webp"><link rel="icon" href="/logo.webp">'+''.join('<link rel="stylesheet" href="/assets/'+f+'?v='+VERSION+'">' for f in ['repair-prices.css','repair-guides.css','enhancements.css','catalog.css'])+jsonscript(schema)+''.join('<script defer src="/assets/'+f+'?v='+VERSION+'"></script>' for f in ['insights.js','enhancements.js'])+'</head><body class="repair-catalog"><a class="guide-skip" href="#main">'+{'de':'Zum Inhalt','en':'Skip to content','fr':'Aller au contenu','it':'Vai al contenuto'}[l]+'</a>'+header+langs+'<main id="main" class="repair-guide-main"><h1>'+e(h1)+'</h1>'+body+'</main>'+footer+'</body></html>'
# Every source model is assigned exactly once; no unrelated device/part matching.
assert all(sum(1 for name,match in BRANDS.values() if match(r[0]))==1 for r in rows)
created=[]
for l,c in COPY.items():
 for brand,(name,match) in BRANDS.items():
  grouped=defaultdict(list)
  for r in rows:
   if match(r[0]):grouped[r[0]].append(r)
  links='<nav class="catalog-model-index" aria-label="'+e(c['models'])+'">'+''.join('<a href="#'+anchor(model)+'">'+e(model)+'</a>' for model in grouped)+'</nav>'
  body='<p class="guide-lead">'+e(c['catalog_intro'])+'</p><p><a href="'+base(l)+'preise.html">← '+e(c['back_prices'])+'</a></p><section><h2>'+e(c['models'])+'</h2>'+links+'</section>'
  for model,items in grouped.items():body+='<details class="catalog-model" id="'+anchor(model)+'"><summary>'+e(model)+'</summary>'+price_table(items,l)+'</details>'
  body+='<p class="catalog-updated">'+e(c['updated'])+'</p><section><h2>'+e(c['diagnosis_title'])+'</h2><p>'+e(c['diagnosis'])+'</p><h3>'+e(c['shipping_title'])+'</h3><p>'+e(c['shipping'])+'</p><h3>'+e(c['quality_title'])+'</h3><p>'+e(c['quality'])+'</p><p>'+e(c['price_terms'])+'</p></section>'+directory(l)
  title=c['catalog_title'].format(brand=name);h1=c['catalog_h1'].format(brand=name)
  if brand=='apple':
   title={'de':'iPhone, iPad & MacBook Reparaturpreise | Mujitech','en':'iPhone, iPad & MacBook repair prices | Mujitech','fr':'Tarifs réparation iPhone, iPad & MacBook | Mujitech','it':'Prezzi riparazione iPhone, iPad e MacBook | Mujitech'}[l]
   h1={'de':'Reparaturpreise für iPhone, iPad und MacBook','en':'Repair prices for iPhone, iPad and MacBook','fr':'Tarifs de réparation iPhone, iPad et MacBook','it':'Prezzi riparazione iPhone, iPad e MacBook'}[l]
  path=catalog_path(brand,l);target=ROOT/path.lstrip('/');target.parent.mkdir(exist_ok=True);target.write_text(html_shell(l,brand,title,c['catalog_description'].format(brand=name),h1,body));created.append(path)
# Apply shared statements, form configuration and asset versions consistently.
legacy={'reparation-suisse.html':'fr','demande-reparation.html':'fr','riparazione-svizzera.html':'it','richiesta-riparazione.html':'it','repair-switzerland.html':'en','repair-request.html':'en'}
for p in ROOT.rglob('*.html'):
 if any(part.startswith('_') for part in p.relative_to(ROOT).parts):continue
 rel=p.relative_to(ROOT);l=legacy.get(p.name,lang_of(rel));c=COPY[l];s=p.read_text()
 if p.name.startswith('gaming-pc') or p.name=='computer.html':
  for old,new in [('24 Monate','36 Monate'),('24-month','36-month'),('24 months','36 months'),('24 mois','36 mois'),('24 mesi','36 mesi')]:s=s.replace(old,new)
  if p.name.startswith('gaming-pc-') and 'gaming-comparison' in s:
   s=re.sub(r'<p class="comparison-warranty">.*?</p>','',s,flags=re.S)
   s=re.sub(r'(<section[^>]*class="[^"]*gaming-comparison[^"]*"[^>]*>.*?</section>)',lambda m:m[0].replace('</section>','<p class="comparison-warranty">'+e(c['comparison_note'])+'</p></section>'),s,count=1,flags=re.S)
 if p.name=='computer.html':
  s=re.sub(r'(<h1\b[^>]*>).*?(</h1>)',lambda m:m[1]+e(c['computer_h1'])+m[2],s,count=1,flags=re.S)
  s=re.sub(r'<title>.*?</title>','<title>'+e(c['computer_title'])+'</title>',s,flags=re.S)
  s=re.sub(r'(<meta\b[^>]*name="description"[^>]*content=")[^"]*(")',lambda m:m[1]+e(c['computer_description'])+m[2],s)
 # Replace misleading conditional diagnostic-fee sentences, never customer reviews.
 if p.name not in ['bewertungen.html','index.html']:
  def diag(m):
   plain=unescape(re.sub('<[^>]+>','',m[0]))
   if re.search(r'(?:allfällige|eventuelle|éventuels|eventuali|any|possible).*?(?:Diagnosekosten|frais de diagnostic|costi di diagnosi|diagnostic (?:costs|fees|charges))|(?:technische Untersuchung|technical examination|examen technique détaillé|esame tecnico dettagliato)',plain,re.I):return '<p>'+e(c['diagnosis'])+'</p>'
   return m[0]
  s=re.sub(r'<p\b[^>]*>.*?</p>',diag,s,flags=re.S)
 repairpage=p.name in ['preise.html','reparaturen.html','reparatur-schweiz.html','reparaturanfrage.html','anfrage.html','kontakt.html','rechtliches.html'] or p.name in legacy or 'data-repair-guide=' in s
 if repairpage:s=replace_section(s,'SERVICE TERMS',service_section(l))
 if p.name=='preise.html':
  replacements={
   'de':('Versand und weitere Leistungen werden separat vereinbart.',c['shipping']),
   'en':('Shipping and other services are agreed separately.',c['shipping']),
   'fr':('Envoi et autres prestations convenus séparément.',c['shipping']),
   'it':('Spedizione e altri servizi concordati separatamente.',c['shipping'])}
  old,new=replacements[l];s=s.replace(old,new)
  s=replace_section(s,'PRICE DIRECTORY',directory(l)+'<p class="catalog-updated">'+e(c['updated'])+'</p><p>'+e(c['price_terms'])+'</p>')
 if 'data-repair-guide=' in s:
  key=re.search(r'data-repair-guide="([^"]+)"',s)[1];brand,kind=key.split('-');prefix='iPhone' if brand=='iphone' else 'Galaxy'
  def category(part):return 'screen' if re.search('display|lcd|bildanzeige',part,re.I) else 'battery' if 'akku' in part.lower() else 'charging' if re.search('ladeanschluss|usb-c anschluss',part,re.I) else None
  selected=defaultdict(list)
  for r in rows:
   if r[0].startswith(prefix) and category(r[1])==kind:selected[r[0]].append(r)
  static='<section class="guide-static-prices"><h2>'+e(c['model_prices'])+'</h2><p>'+e(c['model_intro'])+'</p>'
  for model,items in selected.items():static+='<details class="catalog-model" id="'+anchor(model)+'"><summary>'+e(model)+'</summary>'+price_table(items,l)+'</details>'
  static+='<p><a href="'+catalog_path('apple' if brand=='iphone' else 'samsung',l)+'">'+e(c['directory'])+' →</a></p></section>'
  s=replace_section(s,'STATIC PRICES',static)
 if p.name in ['shop.html','rechtliches.html']:
  warranty='<section class="quality-section"><div class="quality-wrap"><h2>'+e(c['purchase_warranty_title'])+'</h2><p>'+e(c['purchase_warranty'])+'</p></div></section>'
  s=replace_section(s,'PURCHASE WARRANTY',warranty)
 if p.name=='websites.html':
  section='<section class="quality-section"><div class="quality-wrap"><h2>'+e(c['webdesign_title'])+'</h2><p>'+e(c['webdesign'])+'</p><p><a class="cta" href="#anfrage">'+e(c['quote'])+' →</a></p></div></section>'
  s=replace_section(s,'WEBDESIGN REGION',section)
 if p.name=='geraet-verkaufen.html':
  upload={'de':['Bilder (optional)','Weitere Bilder ergänzen (optional)','Bild 2','Bild 3','Bis zu 3 Bilder, zusammen höchstens 10 MB. Grössere Bilder kannst du uns nach Absprache per WhatsApp oder E-Mail senden.'], 'en':['Photos (optional)','Add more photos (optional)','Photo 2','Photo 3','Up to 3 photos, no more than 10 MB in total. Larger photos can be sent by WhatsApp or email by arrangement.'], 'fr':['Photos (facultatif)','Ajouter des photos (facultatif)','Photo 2','Photo 3','Jusqu’à 3 photos, 10 Mo au total maximum. Pour des photos plus volumineuses, convenez d’un envoi par WhatsApp ou e-mail.'], 'it':['Foto (facoltative)','Aggiungi altre foto (facoltativo)','Foto 2','Foto 3','Fino a 3 foto, per un massimo di 10 MB in totale. Per foto più grandi, concorda l’invio via WhatsApp o e-mail.']}[l]
  s=re.sub(r'<label for="bilder">.*?</label>','<label for="bilder">'+e(upload[0])+'</label>',s,count=1,flags=re.S)
  def photo(m):
   tag=re.sub(r'\s+multiple\b','',m[0]);tag=re.sub(r'\s+aria-describedby="[^"]*"','',tag);return tag[:-1]+' aria-describedby="upload-size-note">'
  s=re.sub(r'<input\b(?=[^>]*id="bilder")[^>]*>',photo,s,count=1,flags=re.S)
  s=re.sub(r'<p class="form-hint">\s*(?:Hinweis: Die Zustellung mehrerer Bilder|Note: The delivery of multiple images|Remarque.*?plusieurs images|Nota.*?più immagini).*?</p>','',s,flags=re.S)
  s=re.sub(r'<!-- UPLOAD HELP START -->.*?<!-- UPLOAD HELP END -->','',s,flags=re.S)
  fields='<details class="quality-form-options"><summary>'+e(upload[1])+'</summary>'+''.join('<label for="bilder'+str(i)+'">'+e(upload[i])+'</label><input id="bilder'+str(i)+'" name="attachment'+str(i)+'" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" aria-describedby="upload-size-note">' for i in [2,3])+'</details><p class="form-hint" id="upload-size-note">'+e(upload[4])+'</p>'
  s=re.sub(r'(<input\b(?=[^>]*id="bilder")[^>]*>)',lambda m:m[1]+'<!-- UPLOAD HELP START -->'+fields+'<!-- UPLOAD HELP END -->',s,count=1,flags=re.S)
 if p.name=='danke.html':
  s=re.sub(r'(<h1\b[^>]*>).*?(</h1>)',lambda m:m[1]+e(c['lead_title'])+m[2],s,count=1,flags=re.S)
  s=re.sub(r'(<h1\b[^>]*>.*?</h1>)\s*<p[^>]*>.*?</p>',lambda m:m[1]+'<p>'+e(c['lead_text'])+'</p>',s,count=1,flags=re.S)
 def form_patch(m):
  form=m[0]
  if 'https://formsubmit.co/info@mujitech.ch' not in form:return form
  found=re.search(r'\bid="([^"]+)"',form);ident=found[1] if found else ''
  kind='gaming_pc' if ident=='gaming-enquiry' else 'webdesign' if ident=='websiteformular' else 'device_purchase' if ident=='ankaufsformular' else 'private_support' if ident=='privatkundenformular' else 'contact' if ident=='kontaktformular' else 'repair'
  # Duplicate honeypots can produce arrays at the provider. Keep exactly one.
  form=re.sub(r'<input\b(?=[^>]*\bname="(?:_honey|_next|Anfragebereich)")[^>]*>','',form,flags=re.S)
  hidden='<input class="form-trap" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true"><input type="hidden" name="_next" value="'+DOMAIN+base(l)+'danke.html?form='+kind+'"><input type="hidden" name="Anfragebereich" value="'+kind+'">'
  form=re.sub(r'(<form\b[^>]*>)',lambda m:m[1]+hidden,form,count=1,flags=re.S)
  if 'name="Website-Sprache"' not in form:form=form.replace('</form>','<input type="hidden" name="Website-Sprache" value="'+NAMES[l]+'"></form>')
  if 'name="_subject"' not in form:form=form.replace('</form>','<input type="hidden" name="_subject" value="Mujitech – '+e(kind)+' – '+NAMES[l]+'"></form>')
  return form
 s=re.sub(r'<form\b[^>]*>.*?</form>',form_patch,s,flags=re.S)
 def header_logo(m):
  return re.sub(r'(<img\b[^>]*\bsrc=")[^"]*logo\.webp(?:\?[^" ]*)?("[^>]*>)',lambda m:m[1]+'/assets/logo-header.webp?v='+VERSION+m[2],m[0])
 s=re.sub(r'<header\b.*?</header>',header_logo,s,count=1,flags=re.S)
 # All new price blocks share responsive, keyboard-friendly styles.
 if ('catalog-' in s or 'service-terms' in s) and not re.search(r'<link[^>]*href="/assets/catalog.css',s):s=s.replace('</head>','<link rel="stylesheet" href="/assets/catalog.css?v='+VERSION+'"></head>',1)
 s=re.sub(r'((?:src|href)="[^"\s]*assets/(?:insights|enhancements|repair-prices-data|repair-prices|repair-guides|mujibot|catalog)\.(?:js|css))(?:\?[^"\s]*)?"',lambda m:m[1]+'?v='+VERSION+'"',s)
 # Repair heading levels while keeping the established typography.
 def footer_headings(m):return m[0].replace('<h4','<h2').replace('</h4>','</h2>')
 s=re.sub(r'<footer\b.*?</footer>',footer_headings,s,flags=re.S)
 if p.name=='anfrage.html':
  s=re.sub(r'(<a\b[^>]*class="card request-card"[^>]*>.*?</a>)',lambda m:m[0].replace('<h3','<h2').replace('</h3>','</h2>'),s,flags=re.S)
 if p.name=='geraet-verkaufen.html':
  s=re.sub(r'(<div class="card step">\s*)<h3>(.*?)</h3>',lambda m:m[1]+'<h2>'+m[2]+'</h2>',s,flags=re.S)
 if p.name=='rechtliches.html':
  main=re.search(r'<main\b.*?</main>',s,re.S)
  if main:
   content=main[0]
   first_h2=content.find('<h2');first_h3=content.find('<h3')
   if first_h3>=0 and (first_h2<0 or first_h3<first_h2):
    content=re.sub(r'<h3(\b[^>]*)>(.*?)</h3>',r'<h2\1>\2</h2>',content,count=1,flags=re.S)
    s=s[:main.start()]+content+s[main.end():]
 # Editorial corrections where the meaning was too literal.
 if l=='fr':
  for old,new in [('Configuration SEO de base avancée','Réglages SEO approfondis'),('Tous les services de soins de base','Toutes les prestations de Maintenance Basic'),('Tous les services aux entreprises de soins','Toutes les prestations de Maintenance Business'),('forfaits de soins','formules de maintenance'),('Les soins sont volontaires.','La maintenance est facultative.'),('Configuration SEO de base','Réglages SEO de base')]:s=s.replace(old,new)
 p.write_text(s)
# Register new, real catalogue pages; retain all current entries and language families.
NS='http://www.sitemaps.org/schemas/sitemap/0.9';X='http://www.w3.org/1999/xhtml';ET.register_namespace('',NS);ET.register_namespace('xhtml',X)
root=ET.Element('{'+NS+'}urlset')
for page in sorted(ROOT.rglob('*.html')):
 if any(part.startswith('_') for part in page.relative_to(ROOT).parts):continue
 text=page.read_text();canon=re.search(r'<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"',text)
 if not canon or re.search(r'<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex',text):continue
 actual=DOMAIN+'/'+str(page.relative_to(ROOT));actual=actual[:-10] if actual.endswith('index.html') else actual
 if canon[1]!=actual:continue
 item=ET.SubElement(root,'{'+NS+'}url');ET.SubElement(item,'{'+NS+'}loc').text=actual
 for tag in re.findall(r'<link\b[^>]*rel="alternate"[^>]*>',text):
  language=re.search(r'hreflang="([^"]+)"',tag);href=re.search(r'href="([^"]+)"',tag)
  if language and href:ET.SubElement(item,'{'+X+'}link',{'rel':'alternate','hreflang':language[1],'href':href[1]})
ET.ElementTree(root).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
print('Created/refreshed',len(created),'manufacturer price pages in four languages; applied service, warranty and form updates.')

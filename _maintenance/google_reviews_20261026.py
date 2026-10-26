"""Add three Google reviews verified on 26 October 2026 without changing existing reviews."""
from pathlib import Path
import json,re
from html import escape

ROOT=Path(__file__).resolve().parents[1]
URL='https://www.google.com/maps/place/Mujitech+%7C+Handy,+PC+%26+Laptop+Reparaturen/data=!4m2!3m1!1s0x0:0x397a5d917d61caeb'
REVIEWS=[
 {'name':'Jolanda Huber','initials':'JH','rating':5,'text':'Sehr freundliche Kommunikation und schnelle Bearbeitung und Lösung des Problems.'},
 {'name':'sndj bejd','initials':'sb','rating':5,'text':'Sehr zuverlässiger, freundlicher Service und eine schnelle, professionelle Laptop-Reparatur. Absolut empfehlenswert – jederzeit gerne wieder! Vielen Dank!!!'},
 {'name':'Erjon Selishta','initials':'ES','rating':5,'text':'Hab bei Mujitech einen Pc gekauft und bin sehr zufrieden mit ihm, es war billig und läuft gut …','excerpt':True}
]
TEXTS={
 'fr':[
  'Communication très aimable et prise en charge et résolution rapides du problème.',
  'Service très fiable et aimable, et réparation de mon ordinateur portable rapide et professionnelle. À recommander absolument – je reviendrai avec plaisir ! Merci beaucoup !!!',
  'J’ai acheté un PC chez Mujitech et j’en suis très satisfait, il était bon marché et fonctionne bien …'],
 'it':[
  'Comunicazione molto cordiale e gestione e risoluzione rapide del problema.',
  'Servizio molto affidabile e cordiale e riparazione del portatile rapida e professionale. Assolutamente consigliato – tornerei volentieri! Grazie mille!!!',
  'Ho comprato un PC da Mujitech e ne sono molto soddisfatto, costava poco e funziona bene …'],
 'en':[
  'Very friendly communication and quick handling and resolution of the problem.',
  'Very reliable, friendly service and a quick, professional laptop repair. Absolutely recommended – I would gladly come back anytime! Thank you very much!!!',
  'I bought a PC from Mujitech and am very happy with it; it was inexpensive and runs well …']}
LABELS={
 'de':('Auszug aus einer Google-Rezension','Google-Rezension · geprüft am 26.10.2026','15 Google-Rezensionen · 5,0 von 5 Sternen','Stand: 26.10.2026. Auswahl der veröffentlichten Google-Rezensionen; keine automatische Aktualisierung.'),
 'fr':('Extrait d’un avis Google','Avis Google · vérifié le 26.10.2026','15 avis Google · 5,0 sur 5 étoiles','État au 26.10.2026. Sélection des avis Google publiés ; aucune mise à jour automatique.'),
 'it':('Estratto da una recensione Google','Recensione Google · verificata il 26.10.2026','15 recensioni Google · 5,0 su 5 stelle','Aggiornato al 26.10.2026. Selezione delle recensioni Google pubblicate; nessun aggiornamento automatico.'),
 'en':('Excerpt from a Google review','Google review · checked on 26.10.2026','15 Google reviews · 5.0 out of 5 stars','As of 26.10.2026. Selection of published Google reviews; not updated automatically.')}

def update_home(data,lang):
 if '<!-- google-reviews-20261026 -->' in data:return data
 start=data.index('<div class="m-review-track">')+len('<div class="m-review-track">')
 cards=[]
 for i,r in enumerate(REVIEWS):
  text=r['text'] if lang=='de' else TEXTS[lang][i]
  source=LABELS[lang][0] if r.get('excerpt') else LABELS[lang][1]
  if lang!='de':source+=' · '+{'fr':'traduction','it':'traduzione','en':'translation'}[lang]
  cards.append('<div class="m-review-card"><div class="m-review-stars" aria-label="5 / 5">★★★★★</div><p>'+escape(text)+'</p><strong>'+escape(r['name'])+'</strong><small><a href="'+URL+'" target="_blank" rel="noopener noreferrer">'+escape(source)+'</a></small></div>')
 first='<!-- google-reviews-20261026 -->'+''.join(cards)+'<!-- /google-reviews-20261026 -->'
 data=data[:start]+first+data[start:]
 # Duplicate exactly the same three cards in the second half of the existing marquee.
 marker='<!-- Wiederholung für nahtlose Animation -->'
 assert marker in data
 duplicate=''.join(c.replace('class="m-review-card"','class="m-review-card" aria-hidden="true"').replace('target="_blank"','tabindex="-1" target="_blank"') for c in cards)
 return data.replace(marker,marker+duplicate,1)

def update_page(data,lang):
 if '"name": "Jolanda Huber"' in data:return data
 rows=[]
 for i,r in enumerate(REVIEWS):
  row=dict(r)
  if lang!='de':row['text']=TEXTS[lang][i]
  rows.append(row)
 data=data.replace('const reviews = [','const reviews = [\n'+',\n'.join(json.dumps(r,ensure_ascii=False) for r in rows)+',',1)
 # Attribute excerpts explicitly without altering the existing review text renderer.
 needle=' card.appendChild(top);'
 assert needle in data
 data=data.replace(needle,needle+'\n if(review.excerpt) card.appendChild(makeElement("p","review-source",'+json.dumps(LABELS[lang][0],ensure_ascii=False)+'));',1)
 summary='<div class="rating-description"><strong>'+escape(LABELS[lang][2])+'</strong><br>'+escape(LABELS[lang][3])+' <a href="'+URL+'" target="_blank" rel="noopener noreferrer">Google Maps ↗</a></div>'
 data,n=re.subn(r'<div class="rating-description">.*?</div>',lambda _:summary,data,count=1,flags=re.S)
 assert n==1
 return data

for lang in ('de','en','fr','it'):
 base=ROOT if lang=='de' else ROOT/lang
 for name,fn in [('index.html',update_home),('bewertungen.html',update_page)]:
  path=base/name;path.write_text(fn(path.read_text(),lang))
for name,fn in [('index.html',update_home),('bewertungen.html',update_page)]:
 path=ROOT/'_localization/source'/name;path.write_text(fn(path.read_text(),'de'))

# Keep translations available when rebuilding from the German editorial source.
path=ROOT/'_localization/manual-extra.json';translations=json.loads(path.read_text())
for i,r in enumerate(REVIEWS):translations[r['text']]=[TEXTS[l][i] for l in ('fr','it','en')]
for i,key in enumerate(LABELS['de']):translations[key]=[LABELS[l][i] for l in ('fr','it','en')]
path.write_text(json.dumps(translations,ensure_ascii=False,indent=2)+'\n')
print('Updated homepages and review pages in DE/EN/FR/IT, editorial sources and translation inventory.')

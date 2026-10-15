"""Bounded copy and legacy-route improvements from Search Console evidence.
Private Search Console data stays in audit/, never in the public website.
"""
from pathlib import Path
from html import escape
import re,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
COPY={
'de':{'title':'Handy-Reparatur St. Gallen, PC-Hilfe & Webdesign | Mujitech','h1':'Handy-Reparatur.<span>Computerhilfe.</span><span class="m-outline">Webdesign.</span>','repair_h1':'Handy-, iPhone-, PC- und Laptop-Reparatur in St. Gallen','pc_h2':'PC-Reparatur oder Computerhilfe in St. Gallen?','pc_text':'Startet dein PC oder Laptop nicht, ist der Bildschirm beschädigt oder funktioniert ein Anschluss nicht? Beschreibe das Gerät und den Fehler in der Reparaturanfrage. Für einen langsamen Computer, Datenübertragung oder die Einrichtung von E-Mail und Apps findest du Unterstützung bei unserem Technik-Service. Persönliche Termine finden in Abtwil bei St. Gallen nach Vereinbarung statt.','repair_link':'PC- oder Laptop-Reparatur anfragen','help_link':'Computerhilfe und Einrichtung','help_h2':'Welche Hilfe braucht dein Computer oder Smartphone?','questions':[('Computer langsam oder Programme problematisch?','Nenne das Gerät, das Betriebssystem und seit wann das Problem besteht. Wir prüfen geeignete Optimierungen und besprechen kostenpflichtige Arbeiten vorab.'),('Neues Handy einrichten oder Daten übertragen?','Teile uns das bisherige und das neue Gerät sowie die gewünschten Daten mit. Zugangsdaten gibst du selbst ein. Bitte sende keine Passwörter im Formular.'),('PC oder Laptop defekt?','Für Hardwarefehler nutze unsere Reparaturseite. Die normale Diagnose ist kostenlos; einen kostenpflichtigen schriftlichen Versicherungsbericht vereinbaren wir separat.')]},
'en':{'title':'Phone repair St. Gallen, computer help & web design | Mujitech','h1':'Phone repair.<span>Computer help.</span><span class="m-outline">Web design.</span>','repair_h1':'Phone, iPhone, PC and laptop repair in St. Gallen','pc_h2':'PC repair or computer help in St. Gallen?','pc_text':'Does your PC or laptop fail to start, have a damaged screen or a faulty port? Describe the device and fault in the repair enquiry. For a slow computer, data transfer or help setting up email and apps, visit our technical support service. In-person appointments take place in Abtwil near St. Gallen by arrangement.','repair_link':'Enquire about PC or laptop repair','help_link':'Computer help and device setup','help_h2':'What help does your computer or phone need?','questions':[('Slow computer or software problems?','Tell us the device, operating system and when the problem started. We check suitable improvements and agree any paid work in advance.'),('Setting up a new phone or transferring data?','Tell us the old and new devices and which data you want to transfer. You enter your own login details. Please do not send passwords in the form.'),('Faulty PC or laptop?','Use our repair page for hardware faults. Standard diagnosis is free; a paid written insurance report is agreed separately.')]},
'fr':{'title':'Réparation téléphone Saint-Gall, aide PC & sites web | Mujitech','h1':'Réparation mobile.<span>Aide informatique.</span><span class="m-outline">Sites web.</span>','repair_h1':'Réparation de téléphones, iPhone, PC et ordinateurs portables à Saint-Gall','pc_h2':'Réparation de PC ou assistance informatique à Saint-Gall ?','pc_text':'Votre PC ou ordinateur portable ne démarre plus, son écran est endommagé ou un connecteur ne fonctionne plus ? Décrivez l’appareil et la panne dans la demande de réparation. Pour un ordinateur lent, un transfert de données ou la configuration des e-mails et applications, consultez notre assistance technique. Les rendez-vous sur place ont lieu à Abtwil, près de Saint-Gall, sur accord préalable.','repair_link':'Demander une réparation de PC ou de portable','help_link':'Assistance informatique et configuration','help_h2':'De quelle aide votre ordinateur ou téléphone a-t-il besoin ?','questions':[('Ordinateur lent ou problèmes logiciels ?','Indiquez l’appareil, le système d’exploitation et depuis quand le problème existe. Nous examinons les améliorations adaptées et convenons à l’avance de tout travail payant.'),('Configurer un nouveau téléphone ou transférer des données ?','Précisez l’ancien et le nouvel appareil ainsi que les données à transférer. Vous saisissez vous-même vos identifiants. Ne transmettez aucun mot de passe dans le formulaire.'),('PC ou ordinateur portable en panne ?','Consultez notre page de réparation pour les pannes matérielles. Le diagnostic standard est gratuit ; un rapport écrit payant pour l’assurance fait l’objet d’un accord séparé.')]},
'it':{'title':'Riparazione telefoni San Gallo, assistenza PC e siti web | Mujitech','h1':'Riparazione telefoni.<span>Assistenza PC.</span><span class="m-outline">Siti web.</span>','repair_h1':'Riparazione di telefoni, iPhone, PC e portatili a San Gallo','pc_h2':'Riparazione PC o assistenza informatica a San Gallo?','pc_text':'Il PC o portatile non si avvia, lo schermo è danneggiato o una porta non funziona? Descrivi il dispositivo e il guasto nella richiesta di riparazione. Per un computer lento, il trasferimento dei dati o la configurazione di e-mail e app, consulta il nostro servizio di assistenza tecnica. Gli appuntamenti di persona si svolgono ad Abtwil, vicino a San Gallo, previo accordo.','repair_link':'Richiedi una riparazione di PC o portatili','help_link':'Assistenza PC e configurazione','help_h2':'Di quale aiuto ha bisogno il tuo computer o telefono?','questions':[('Computer lento o problemi con i programmi?','Indica il dispositivo, il sistema operativo e da quando si presenta il problema. Valutiamo gli interventi adatti e concordiamo in anticipo qualsiasi lavoro a pagamento.'),('Configurare un nuovo telefono o trasferire i dati?','Indica il vecchio e il nuovo dispositivo e quali dati desideri trasferire. Inserisci personalmente le credenziali. Non inviare password nel modulo.'),('PC o portatile guasto?','Per i guasti hardware consulta la pagina delle riparazioni. La diagnosi standard è gratuita; una relazione scritta a pagamento per l’assicurazione viene concordata separatamente.')]}}
changed=[]
def write(path,text):
 p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists() or p.read_text()!=text:p.write_text(text);changed.append(path)
for lang,c in COPY.items():
 prefix='' if lang=='de' else lang+'/'
 b='/'+prefix
 p=ROOT/prefix/'index.html';s=p.read_text()
 s=re.sub(r'<title>.*?</title>','<title>'+escape(c['title'])+'</title>',s,flags=re.S)
 s=re.sub(r'(<meta property="og:title" content=")[^"]*',lambda m:m[1]+escape(c['title'],quote=True),s)
 s=re.sub(r'(<h1\b[^>]*>).*?(</h1>)',lambda m:m[1]+c['h1']+m[2],s,count=1,flags=re.S)
 s=re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)',lambda m:m[1]+json.dumps(dict(json.loads(m[2]),name=c['title']),ensure_ascii=False,separators=(',',':'))+m[3] if json.loads(m[2]).get('@type')=='WebPage' else m[0],s,flags=re.S)
 write(prefix+'index.html',s)
 p=ROOT/prefix/'reparaturen.html';s=p.read_text()
 s=re.sub(r'(<h1\b[^>]*>).*?(</h1>)',lambda m:m[1]+escape(c['repair_h1'])+m[2],s,count=1,flags=re.S)
 block='<section class="quality-section" id="pc-support-wegweiser"><div class="wrap"><h2>'+escape(c['pc_h2'])+'</h2><p>'+escape(c['pc_text'])+'</p><p><a class="cta" href="'+b+'anfrage.html#reparatur">'+escape(c['repair_link'])+' →</a></p><p><a href="'+b+'privatkunden.html">'+escape(c['help_link'])+' →</a></p></div></section>'
 s=re.sub(r'<!-- SEARCH PC START -->.*?<!-- SEARCH PC END -->','',s,flags=re.S).replace('</main>','<!-- SEARCH PC START -->'+block+'<!-- SEARCH PC END --></main>',1)
 write(prefix+'reparaturen.html',s)
 p=ROOT/prefix/'privatkunden.html';s=p.read_text()
 block='<section class="quality-section" id="computerhilfe-fragen"><div class="wrap"><h2>'+escape(c['help_h2'])+'</h2>'+''.join('<h3>'+escape(q)+'</h3><p>'+escape(a)+'</p>' for q,a in c['questions'])+'<p><a href="'+b+'reparaturen.html#pc-support-wegweiser">'+escape(c['repair_link'])+' →</a></p></div></section>'
 s=re.sub(r'<!-- SEARCH HELP START -->.*?<!-- SEARCH HELP END -->','',s,flags=re.S).replace('</main>','<!-- SEARCH HELP START -->'+block+'<!-- SEARCH HELP END --></main>',1)
 write(prefix+'privatkunden.html',s)
# Only former service/category URLs with an equivalent current destination.
# No replacement product is invented for discontinued products, accounts or carts.
redirects={}
for lang in ['de','en','fr']:
 p='' if lang=='de' else lang+'/'
 for stem in ['iphone-reparaturpreise','ipad-reparaturpreise','reparaturpreise','samsung-reparaturpreise']:
  brand='samsung' if stem.startswith('samsung') else 'apple'
  dest=(p+'preise.html') if stem=='reparaturpreise' else p+({'de':'reparaturpreise-','en':'repair-prices-','fr':'tarifs-reparation-'}[lang])+brand+'.html'
  redirects[p+'pages/'+stem+'/index.html']=dest
 for stem in ['ueber-mujitech','uber-mujitech']:redirects[p+'pages/'+stem+'/index.html']=p+'mujitech-service.html'
 redirects[p+'collections/index.html']=p+'shop.html'
 redirects[p+'collections/handys/index.html']=p+'shop.html'
 redirects[p+'collections/pcs/index.html']=p+'computer.html'
 redirects[p+'policies/legal-notice/index.html']=p+'rechtliches.html'
redirects['fr/collections/all/index.html']='fr/shop.html'
redirects['en/pages/contact/index.html']='en/kontakt.html'
for path,dest in redirects.items():
 assert (ROOT/dest).is_file(),dest
 lang=path.split('/')[0] if path.startswith(('en/','fr/')) else 'de'
 target='https://mujitech.ch/'+dest
 text='<!doctype html><html lang="'+{'de':'de-CH','en':'en','fr':'fr-CH'}[lang]+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url='+target+'"><link rel="canonical" href="'+target+'"><title>Mujitech</title></head><body><p><a href="'+target+'">Mujitech →</a></p></body></html>\n'
 write(path,text)
(ROOT/'_maintenance/seo-legacy-routes.json').write_text(json.dumps(redirects,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'changed':changed,'redirects':len(redirects)},ensure_ascii=False))

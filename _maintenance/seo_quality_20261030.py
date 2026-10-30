"""Preserve reviewed shipping guidance after the older content generators."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
COPY = {
 'de': {
  'files':['reparatur-schweiz.html'],
  'replace':{
   'Nennen Sie Gerät, Modell und Defekt.':'Nenne Gerät, Modell und Defekt.',
   'Beispiel Freiburg: Sie fragen deine iPhone-Reparatur an, erhalten nach Absprache die Versandadresse, senden das Gerät ein und erhalten es nach freigegebener Reparatur per Rückversand zurück.':'Beispiel Freiburg: Du fragst deine iPhone-Reparatur an, erhältst nach Absprache die Versandadresse, sendest das Gerät ein und erhältst es nach freigegebener Reparatur zurück.',
   'Erstellen Sie nach Möglichkeit ein Backup.':'Erstelle nach Möglichkeit ein Backup.',
   'Verpacken du das Gerät gut gepolstert in einem stabilen Karton. Legen Sie eine kurze Fehlerbeschreibung und die vereinbarte Auftragsreferenz bei.':'Verpacke das Gerät gut gepolstert in einem stabilen Karton. Lege eine kurze Fehlerbeschreibung und die vereinbarte Auftragsreferenz bei.',
   'Kontaktiere uns zuerst und klären Sie die Vorgaben mit dem Versanddienst.':'Kontaktiere uns zuerst und kläre die Vorgaben mit dem Versanddienst.'},
  'cards':[
   ('iPhone-Display reparieren','/iphone-display-reparatur.html','Displayvarianten und bestätigte Preise für dein Modell vergleichen. →'),
   ('iPhone-Akku wechseln','/iphone-akku-wechseln.html','Modell auswählen und Preis oder individuelle Abklärung ansehen. →'),
   ('Laptop-Reparatur anfragen','/laptop-computer-reparatur.html','Startprobleme, Bildschirmdefekte und die Angaben für eine Offerte. →')]},
 'en':{
  'files':['en/reparatur-schweiz.html','repair-switzerland.html'],
  'replace':{'We confirm whether we can inspect the device and provide the shipping address. Shipping costs, return delivery and the expected process are agreed individually.':'We confirm repair feasibility and the shipping address. You pay shipping to Mujitech; we cover return shipping after the repair.'},
  'cards':[
   ('Repair an iPhone screen','/en/iphone-screen-repair.html','Compare display options and confirmed prices for your model. →'),
   ('Replace an iPhone battery','/en/iphone-battery-replacement.html','Select your model to see the price or request an individual assessment. →'),
   ('Request a laptop repair','/en/laptop-computer-repair.html','Startup faults, damaged screens and the details needed for a quotation. →')]},
 'fr':{
  'files':['fr/reparatur-schweiz.html','reparation-suisse.html'],
  'replace':{'Nous confirmons si nous pouvons examiner l’appareil et vous communiquons l’adresse d’envoi. Les frais, le retour et le déroulement prévu sont convenus individuellement.':'Nous confirmons la faisabilité de la réparation et l’adresse d’envoi. Vous payez l’envoi à Mujitech ; nous prenons en charge le retour après la réparation.'},
  'cards':[
   ('Réparer un écran iPhone','/fr/reparation-ecran-iphone.html','Comparez les variantes d’écran et les prix confirmés pour votre modèle. →'),
   ('Remplacer une batterie iPhone','/fr/remplacement-batterie-iphone.html','Choisissez le modèle pour consulter le prix ou demander une évaluation. →'),
   ('Demander une réparation d’ordinateur portable','/fr/reparation-ordinateur-portable.html','Pannes au démarrage, écrans cassés et informations utiles pour un devis. →')]},
 'it':{
  'files':['it/reparatur-schweiz.html','riparazione-svizzera.html'],
  'replace':{'Confermiamo se possiamo esaminare il dispositivo e comunichiamo l’indirizzo. Costi di spedizione, restituzione e procedura vengono concordati individualmente.':'Confermiamo la possibilità di riparazione e l’indirizzo di spedizione. Paghi l’invio a Mujitech; noi copriamo il ritorno dopo la riparazione.'},
  'cards':[
   ('Riparare il display iPhone','/it/riparazione-display-iphone.html','Confronta le varianti del display e i prezzi confermati per il tuo modello. →'),
   ('Sostituire la batteria iPhone','/it/sostituzione-batteria-iphone.html','Scegli il modello per vedere il prezzo o richiedere una valutazione. →'),
   ('Richiedere una riparazione del portatile','/it/riparazione-computer-portatili.html','Problemi di avvio, schermi danneggiati e dettagli utili per un preventivo. →')]}
}
for language, data in COPY.items():
 for name in data['files']:
  path=ROOT/name; text=path.read_text()
  for before,after in data['replace'].items():
   assert before in text or after in text,(name,before)
   text=text.replace(before,after)
  for heading,destination,description in data['cards']:
   assert (ROOT/destination.lstrip('/')).is_file(),destination
   pattern=r'<a class="panel" href="[^"]*"><h3>'+re.escape(heading)+r'</h3><p>.*?</p></a>'
   text,count=re.subn(pattern,'<a class="panel" href="'+destination+'"><h3>'+heading+'</h3><p>'+description+'</p></a>',text)
   assert count==1,(name,heading,count)
  path.write_text(text)

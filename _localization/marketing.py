"""Short first-contact forms and traceable review links, without new promises."""
import re
from urllib.parse import quote
from html import escape
COPY={
'de':dict(intro='Name, E-Mail und eine kurze Beschreibung genügen. Gerätedetails kannst du auch später ergänzen.',name='Name',email='E-Mail',model='Gerät / Modell (optional)',modelhint='z. B. iPhone 13 oder Lenovo Laptop',problem='Was funktioniert nicht?',hint='Beschreibe kurz dein Problem. Wenn du das Modell nicht kennst, ist das kein Hindernis.',details='Weitere Angaben ergänzen (optional)',phone='Telefonnummer',category='Geräteart',fault='Defektkategorie',brand='Hersteller',contact='Bevorzugte Kontaktaufnahme',consent='Ich habe die Datenschutzhinweise gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung dieser Anfrage zu.',privacy='Datenschutzhinweise',send='Unverbindliche Anfrage senden',note='Die Anfrage löst noch keinen Reparaturauftrag aus. Kosten und Arbeiten werden zuerst mit dir abgestimmt. Die Übermittlung erfolgt über FormSubmit; dessen Bestätigung belegt nicht den E-Mail-Eingang. Bitte keine Passwörter oder sensiblen Daten senden.',quick='Reparatur direkt anfragen',google='Bewertungen auf Google ansehen'),
'en':dict(intro='Your name, email and a short description are enough. You can add device details later.',name='Name',email='Email',model='Device / model (optional)',modelhint='e.g. iPhone 13 or Lenovo laptop',problem='What is not working?',hint='Briefly describe the problem. It is fine if you do not know the model.',details='Add more details (optional)',phone='Phone number',category='Device type',fault='Fault category',brand='Manufacturer',contact='Preferred contact method',consent='I have read the privacy information and agree to the processing of my details to handle this enquiry.',privacy='Privacy information',send='Send a non-binding enquiry',note='This enquiry does not place a repair order. We agree the costs and work with you first. FormSubmit handles submission; its confirmation does not prove email delivery. Please do not send passwords or sensitive data.',quick='Enquire about a repair directly',google='Read reviews on Google'),
'fr':dict(intro='Votre nom, votre e-mail et une brève description suffisent. Vous pouvez préciser les détails de l’appareil plus tard.',name='Nom',email='E-mail',model='Appareil / modèle (facultatif)',modelhint='p. ex. iPhone 13 ou ordinateur Lenovo',problem='Quel est le problème ?',hint='Décrivez brièvement le problème. Ce n’est pas grave si vous ne connaissez pas le modèle.',details='Ajouter des précisions (facultatif)',phone='Téléphone',category='Type d’appareil',fault='Type de panne',brand='Fabricant',contact='Contact préféré',consent='J’ai lu les informations de confidentialité et j’accepte le traitement de mes données pour répondre à cette demande.',privacy='Informations de confidentialité',send='Envoyer une demande sans engagement',note='Cette demande ne constitue pas un ordre de réparation. Nous convenons d’abord avec vous des coûts et des travaux. FormSubmit transmet le formulaire ; sa confirmation ne prouve pas la réception de l’e-mail. N’envoyez pas de mots de passe ni de données sensibles.',quick='Demander directement une réparation',google='Lire les avis sur Google'),
'it':dict(intro='Bastano nome, e-mail e una breve descrizione. Puoi aggiungere i dettagli del dispositivo in seguito.',name='Nome',email='E-mail',model='Dispositivo / modello (facoltativo)',modelhint='ad es. iPhone 13 o portatile Lenovo',problem='Che cosa non funziona?',hint='Descrivi brevemente il problema. Non è necessario conoscere il modello.',details='Aggiungi dettagli (facoltativo)',phone='Telefono',category='Tipo di dispositivo',fault='Tipo di guasto',brand='Produttore',contact='Contatto preferito',consent='Ho letto l’informativa sulla privacy e acconsento al trattamento dei miei dati per rispondere a questa richiesta.',privacy='Informativa sulla privacy',send='Invia una richiesta senza impegno',note='La richiesta non costituisce un ordine di riparazione. Concordiamo prima costi e intervento. FormSubmit trasmette il modulo; la sua conferma non dimostra la consegna dell’e-mail. Non inviare password o dati sensibili.',quick='Richiedi direttamente una riparazione',google='Leggi le recensioni su Google')}
GOOGLE='https://www.google.com/maps/search/?api=1&amp;query=Mujitech+Abtwil'
def apply_marketing(data,f,l,path_for):
 c=COPY[l];e=lambda k:escape(c[k],quote=True)
 hours={'de':'Erreichbar täglich 08:00–20:00 Uhr · Geräteübergabe nur nach Termin','en':'Available daily 08:00–20:00 · Device handover by appointment only','fr':'Joignable tous les jours de 08:00 à 20:00 · Remise des appareils sur rendez-vous uniquement','it':'Reperibile ogni giorno 08:00–20:00 · Consegna dispositivi solo su appuntamento'}[l]
 if f=='kontakt.html':data=re.sub(r'(<main\b.*?<h1[^>]*>.*?</h1>)',lambda m:m[1]+'<p class="business-hours">'+escape(hours)+'</p>',data,count=1,flags=re.S)
 if f=='anfrage.html':
  def repair(m):
   old=m[0]
   def options(ident):
    return re.search(r'<select\b[^>]*id="'+ident+r'"[^>]*>(.*?)</select>',old,re.S)[1]
   contact=options('kontaktart')
   email=re.search(r'<option value="E-Mail">.*?</option>',contact,re.S)[0]
   contact=email+re.sub(r'<option value="E-Mail">.*?</option>','',contact,flags=re.S)
   hidden=''.join(re.findall(r'<input\b[^>]*type="hidden"[^>]*>',old,re.S))
   return f'''<form class="repair-form" id="reparaturformular" action="https://formsubmit.co/info@mujitech.ch" method="POST" accept-charset="UTF-8">
{hidden}<input class="form-trap" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">

<div class="form-grid"><div><label for="name">{e('name')} *</label><input id="name" name="name" type="text" autocomplete="name" maxlength="120" required></div>
<div><label for="email">{e('email')} *</label><input id="email" name="email" type="email" autocomplete="email" maxlength="150" required></div></div>
<div class="form-group"><label for="modell">{e('model')}</label><input id="modell" name="modell" type="text" maxlength="150" placeholder="{e('modelhint')}"></div>
<div class="form-group"><label for="beschreibung">{e('problem')} *</label><textarea id="beschreibung" name="beschreibung" rows="4" maxlength="5000" placeholder="{e('hint')}" required></textarea></div>
<details class="quality-form-options enquiry-details"><summary>{e('details')}</summary><div class="form-grid">
<div><label for="telefon">{e('phone')}</label><input id="telefon" name="telefon" type="tel" autocomplete="tel" maxlength="35" aria-describedby="contact-phone-note"></div>
<div><label for="kontaktart">{e('contact')}</label><select id="kontaktart" name="kontaktart">{contact}</select></div>
<div><label for="geraet">{e('category')}</label><select id="geraet" name="geraet">{options('geraet')}</select></div>
<div><label for="defekt">{e('fault')}</label><select id="defekt" name="defekt">{options('defekt')}</select></div>
<div><label for="hersteller">{e('brand')}</label><input id="hersteller" name="hersteller" type="text" maxlength="100"></div></div>
<p id="contact-phone-note" class="form-note contact-phone-note" hidden></p></details>
<div class="form-group"><label class="privacy-label" for="datenschutz"><input id="datenschutz" name="datenschutz" type="checkbox" value="Zugestimmt" required><span>{e('consent')} <a href="{path_for('rechtliches.html',l)}#datenschutz">{e('privacy')}</a> *</span></label></div>
<div class="form-group"><button class="repair-submit" type="submit">{e('send')}</button></div><p class="form-note">{e('note')}</p></form>'''
  data,n=re.subn(r'<form\b[^>]*id="reparaturformular".*?</form>',repair,data,count=1,flags=re.S);assert n==1
  data=re.sub(r'(<section id="reparatur">.*?<p class="sectionlead">).*?(</p>)',lambda m:m[1]+e('intro')+m[2],data,count=1,flags=re.S)
  # Skip the service chooser when the customer already knows they need a repair.
  data=re.sub(r'(<section class="pagehero">.*?</p>)',lambda m:m[1]+f'<p><a class="cta" href="#reparatur">{e("quick")}</a></p>',data,count=1,flags=re.S)
  data=re.sub(r'(<a\s+class="card request-card"\s+href=")[^"]*("[^>]*>\s*<div class="icon"[^>]*>\s*<svg[^>]*>\s*<rect x="2" y="7")',lambda m:m[1]+path_for('kontakt.html',l)+'#business'+m[2],data,count=1,flags=re.S)
 if f=='privatkunden.html':
  def email_first(m):
   content=m[2];email=re.search(r'<option value="E-Mail">.*?</option>',content,re.S)[0]
   return m[1]+email+re.sub(r'<option value="E-Mail">.*?</option>','',content,flags=re.S)+m[3]
  data=re.sub(r'(<select\b[^>]*id="kontaktart"[^>]*>)(.*?)(</select>)',email_first,data,count=1,flags=re.S)
 if f in ['reparaturen.html','reparatur-schweiz.html']:
  data=data.replace(path_for('anfrage.html',l)+'"',path_for('anfrage.html',l)+'#reparatur"')
 if f in ['index.html','bewertungen.html']:
  link=f'<p class="google-review-link"><a href="{GOOGLE}" target="_blank" rel="noopener noreferrer">{e("google")} ↗</a></p>'
  if f=='index.html':
   data=re.sub(r'(<h2\b[^>]*id="reviews-title"[^>]*>.*?</h2>)',lambda m:m[1]+link,data,count=1,flags=re.S)
  else:data=data.replace('</main>',link+'</main>',1)
 if f=='websites.html':
  # Remove the duplicated request-description step while preserving the existing offer flow.
  if l=='de':data=data.replace('2. Du beschreibst dein Projekt und hinterlässt deine Kontaktdaten.','2. Du hinterlässt deine Kontaktdaten, damit wir deine Anfrage beantworten können.')
 # Make each business offer actionable without asking customers to choose again.
 if f=='unternehmen.html':
  areas=['IT-Support KMU','IT-Betreuung','Hardware-Beschaffung','Firmenhandys','Telekom-Anfrage','Microsoft 365 / Google Workspace']
  labels={'de':'Diese Leistung anfragen','en':'Enquire about this service','fr':'Demander cette prestation','it':'Richiedi questo servizio'}
  count=[0]
  def business_link(m):
   i=count[0];count[0]+=1
   if i>=len(areas):return m[0]
   url=path_for('kontakt.html',l)+'?service='+quote(areas[i],safe='')+'#business'
   return m[0].replace('</article>','<p><a class="business-btn secondary" href="'+escape(url,quote=True)+'">'+labels[l]+' →</a></p></article>')
  data=re.sub(r'<article\b[^>]*class="business-card".*?</article>',business_link,data,flags=re.S)
  assert count[0]==6
 # Every enquiry has a direct alternative before the external submission step.
 direct={'de':('Lieber direkt Kontakt aufnehmen?','E-Mail schreiben','WhatsApp öffnen','Anrufen','Name und Anliegen genügen. Bitte keine Passwörter senden.'),'en':('Prefer to contact us directly?','Send an email','Open WhatsApp','Call','Your name and enquiry are enough. Please do not send passwords.'),'fr':('Vous préférez nous contacter directement ?','Envoyer un e-mail','Ouvrir WhatsApp','Appeler','Votre nom et votre demande suffisent. N’envoyez pas de mots de passe.'),'it':('Preferisci contattarci direttamente?','Scrivi un’e-mail','Apri WhatsApp','Chiama','Bastano nome e richiesta. Non inviare password.')}[l]
 fallback='<aside class="enquiry-alternatives" aria-label="'+escape(direct[0],quote=True)+'"><strong>'+escape(direct[0])+'</strong><p>'+escape(direct[4])+'</p><div class="enquiry-actions"><a href="mailto:info@mujitech.ch">'+direct[1]+'</a><a href="https://wa.me/41768444673" target="_blank" rel="noopener noreferrer">'+direct[2]+'</a><a href="tel:+41768444673">'+direct[3]+'</a></div></aside>'
 data=re.sub(r'(<form\b[^>]*action="https://formsubmit.co/info@mujitech.ch"[^>]*>)(.*?)(</form>)',lambda m:m[1]+fallback+m[2]+m[3],data,flags=re.S)
 return data

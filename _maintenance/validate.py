"""Regression checks for multilingual pricing, service promises and enquiries."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlsplit,unquote,parse_qs
from decimal import Decimal
from collections import Counter
import json,re,subprocess,sys,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
NODE='/Users/andritmuji/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
errors=[];pages={};formcount=0;redirects={}
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.tags=[];self.scripts=[];self.script=None;self.forms=[];self.form=None;self.text=[];self.select=None;self.choices={}
 def handle_starttag(self,t,a):
  a=dict(a);self.tags.append((t,a))
  if 'id' in a:self.ids.append(a['id'])
  if t=='script':self.script=[a,'']
  if t=='form':self.form={'attrs':a,'fields':[]}
  if t=='select':self.select=a.get('name');self.choices.setdefault(self.select,[])
  if t=='option' and self.select:self.choices[self.select].append(a.get('value',''))
  if self.form is not None and t in ['input','select','textarea','button']:self.form['fields'].append((t,a))
 def handle_endtag(self,t):
  if t=='script' and self.script:self.scripts.append(self.script);self.script=None
  if t=='form' and self.form:self.forms.append(self.form);self.form=None
  if t=='select':self.select=None
 def handle_data(self,d):
  if self.script:self.script[1]+=d
  else:self.text.append(d)
def target(p,u):
 sp=urlsplit(u)
 if sp.netloc and sp.netloc!='mujitech.ch':return None
 if sp.scheme and sp.scheme not in ['https','http']:return None
 path=(ROOT/sp.path.lstrip('/')) if sp.path.startswith('/') else p.parent/sp.path
 if not sp.path:path=p
 if path.is_dir():path=path/'index.html'
 return path.resolve()
files=sorted(p for p in ROOT.rglob('*.html') if not any(x.startswith('_') for x in p.relative_to(ROOT).parts))
for p in files:
 s=p.read_text();c=Page();c.feed(s);pages[p.resolve()]=c;rel=p.relative_to(ROOT)
 refresh=[a.get('content','') for t,a in c.tags if t=='meta' and a.get('http-equiv','').lower()=='refresh']
 if refresh:
  match=re.fullmatch(r'0;\s*url=(https://mujitech\.ch/[^?#]+)',refresh[0])
  canon=[a.get('href') for t,a in c.tags if t=='link' and a.get('rel')=='canonical']
  if len(refresh)!=1 or not match or canon!=[match[1]]:errors.append(f'{rel}: invalid permanent redirect')
  else:
   dest=target(p,match[1]);redirects[p.resolve()]=dest
   if not dest or not dest.exists() or dest==p.resolve():errors.append(f'{rel}: invalid redirect destination')
  continue
 for tag in ['html','h1','title']:
  if sum(t==tag for t,a in c.tags)!=1:errors.append(f'{rel}: expected one {tag}')
 if len(c.ids)!=len(set(c.ids)):errors.append(f'{rel}: duplicate IDs')
 if sum(t=='meta' and a.get('name')=='description' for t,a in c.tags)!=1:errors.append(f'{rel}: description count')
 for t,a in c.tags:
  if t=='img' and 'alt' not in a:errors.append(f'{rel}: image alt missing')
  for key in ['href','src']:
   if key not in a:continue
   u=a[key];dest=target(p,u)
   if dest is not None and not dest.exists():errors.append(f'{rel}: missing {u}')
 for a,b in c.scripts:
  if a.get('type')=='application/ld+json':
   try:json.loads(b)
   except Exception as ex:errors.append(f'{rel}: invalid JSON-LD {ex}')
  elif b.strip():
   check=subprocess.run([NODE,'--check'],input=b,capture_output=True,text=True)
   if check.returncode:errors.append(f'{rel}: inline JavaScript syntax {check.stderr[:100]}')
 for form in c.forms:
  formcount+=1;a=form['attrs'];fields=[a for t,a in form['fields']]
  if a.get('action')!='https://formsubmit.co/info@mujitech.ch' or a.get('method','').upper()!='POST':errors.append(f'{rel}: form destination/method')
  names=Counter(a.get('name') for a in fields)
  for name in ['_honey','_subject','_next','Website-Sprache','Anfragebereich']:
   if names[name]!=1:errors.append(f'{rel}: {name} count {names[name]}')
  if any(a.get('name')=='_captcha' and a.get('value')=='false' for a in fields):errors.append(f'{rel}: captcha disabled')
  nexturl=next(a.get('value','') for a in fields if a.get('name')=='_next')
  if not nexturl.startswith('https://mujitech.ch/') or 'danke.html?form=' not in nexturl:errors.append(f'{rel}: unsafe thank-you URL')
  if target(p,nexturl) is None or not target(p,nexturl).exists():errors.append(f'{rel}: missing thank-you page')
  if not any(a.get('type')=='email' and 'required' in a for a in fields):errors.append(f'{rel}: required email missing')
 for js in ROOT.glob('assets/*.js'):pass
for p,c in pages.items():
 if p in redirects:
  if redirects[p] in redirects:errors.append(f'{p.relative_to(ROOT)}: redirect chain')
  continue
 rel=p.relative_to(ROOT);canon=[a['href'] for t,a in c.tags if t=='link' and a.get('rel')=='canonical'];alts=[a for t,a in c.tags if t=='link' and a.get('rel')=='alternate'];
 if len(canon)!=1 or len(alts)!=5:errors.append(f'{rel}: canonical/alternates count');continue
 for a in alts:
  dest=target(p,a['href'])
  if dest not in pages:errors.append(f'{rel}: missing alternate {a["href"]}')
  elif canon[0] not in [a.get('href') for t,a in pages[dest].tags if t=='link' and a.get('rel')=='alternate']:errors.append(f'{rel}: nonreciprocal alternate')
 for t,a in c.tags:
  u=a.get('href','');sp=urlsplit(u);dest=target(p,u)
  if sp.fragment and dest in pages and unquote(sp.fragment) not in pages[dest].ids:errors.append(f'{rel}: broken anchor {u}')
# MujiBot builds these links dynamically, so the ordinary HTML crawl cannot see them.
bot=(ROOT/'assets/mujibot.js').read_text()
route_match=re.search(r'const destinations = \{([^\n]+)\};',bot)
bot_routes=re.findall(r"(\w+):'([^']*)'",route_match[1]) if route_match else []
if not bot_routes:errors.append('MujiBot: no destination map found')
for language in ['','en','fr','it']:
 for topic,url in bot_routes:
  dest=target(ROOT/language/'index.html',url);sp=urlsplit(url)
  if dest not in pages:errors.append(f'MujiBot {language or "de"}/{topic}: missing {url}');continue
  page=pages[dest]
  if sp.fragment and unquote(sp.fragment) not in page.ids:errors.append(f'MujiBot {language or "de"}/{topic}: broken anchor {url}')
  service=parse_qs(sp.query).get('service',[None])[0]
  if service and service not in page.choices.get('service',[])+page.choices.get('bereich',[]):errors.append(f'MujiBot {language or "de"}/{topic}: unsupported service {service}')
for js in ROOT.glob('assets/*.js'):
 r=subprocess.run([NODE,'--check',str(js)],capture_output=True,text=True)
 if r.returncode:errors.append(f'{js.name}: JavaScript syntax {r.stderr[:100]}')
# Every previously confirmed price stays unchanged; all imported prices have exact provenance.
s=(ROOT/'assets/repair-prices-data.js').read_text();book=json.loads(s[s.index('{'):].rstrip(';\n'));lookup={(r[0],r[1]):r[2] for r in book['rows']}
if len(lookup)!=len(book['rows']):errors.append('Duplicate model/part prices')
provenance=json.loads((ROOT/'_maintenance/price-provenance-2026-10-15.json').read_text())
for r in provenance['changes']:
 expected=(Decimal(r['reference_chf'])*Decimal('0.80')).quantize(Decimal('0.01'))
 if Decimal(str(lookup[(r['model'],r['repair'])]))!=expected:errors.append(f'Incorrect 20% calculation: {r["model"]} {r["repair"]}')
# Warranty promise changes apply to PCs, not the separate 24-month iPhone offers.
for p in files:
 s=p.read_text()
 if p.name.startswith('gaming-pc') and re.search(r'24 (?:Monate|months|mois|mesi)|24-month',s):errors.append(f'{p.name}: old PC warranty')
 if p.name=='iphone-17-pro-max.html' and '36' in re.sub(r'<script.*?</script>','',s,flags=re.S):
  # Numbers can occur in vector paths; only reject actual warranty copy.
  if re.search(r'36 (?:Monate|months|mois|mesi)|36-month',s):errors.append('iPhone warranty incorrectly changed')
sitemap=ET.parse(ROOT/'sitemap.xml');ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'};urls=[x.text for x in sitemap.findall('.//s:loc',ns)]
if len(urls)!=len(set(urls)):errors.append('Sitemap duplicate URLs')
for u in urls:
 if target(ROOT/'index.html',u) not in pages:errors.append('Sitemap target missing: '+u)
 if target(ROOT/'index.html',u) in redirects:errors.append('Sitemap contains redirect: '+u)
summary={'pages':len(pages),'sitemap_urls':len(urls),'forms':formcount,'bot_routes_checked':len(bot_routes)*4,'repair_rows':len(book['rows']),'confirmed_prices':sum(r[2] is not None for r in book['rows']),'new_prices':len(provenance['changes']),'errors':errors}
print(json.dumps(summary,ensure_ascii=False,indent=2));sys.exit(bool(errors))

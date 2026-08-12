#!/usr/bin/env python3
import json,sys
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
issues=[]
cat=json.loads((ROOT/'Smartphone-Academy/Smartphone-Academy-Catalog.json').read_text(encoding='utf-8'))
pcat=json.loads((ROOT/'Smartphone-Academy/Practice/Catalog.json').read_text(encoding='utf-8'))
if len(cat['lessons'])!=235:issues.append(f"catalog lessons={len(cat['lessons'])}")
if len(pcat['labs'])!=123:issues.append(f"practical labs={len(pcat['labs'])}")
if sum(x.get('hours',0) for x in pcat['labs'])!=382:issues.append('practical hours mismatch')
for rel in ('Pages/about-founder.html','el/Pages/about-founder.html'):
 s=BeautifulSoup((ROOT/rel).read_text(encoding='utf-8'),'html.parser');sec=s.find(id='keep-android-open');vision=s.find(id='project-vision')
 if not sec or not vision or not sec.find('a',href='https://keepandroidopen.org'):issues.append(rel+' missing compact Founder/Vision integration')
for base in (ROOT/'Smartphone-Academy',ROOT/'el/Smartphone-Academy'):
 for page in base.rglob('*.html'):
  s=BeautifulSoup(page.read_text(encoding='utf-8',errors='replace'),'html.parser');f=s.find('footer',class_='main-footer')
  if not f:issues.append(str(page.relative_to(ROOT))+' missing footer');continue
  text=f.get_text(' ',strip=True)
  if 'Smartphone Academy Home' in text or 'Αρχική Ακαδημίας Smartphone' in text:issues.append(str(page.relative_to(ROOT))+' footer not global')

# Main-deployment SEO, Assistance, and Academy checks.
import re
for page in ROOT.rglob('*.html'):
 s=BeautifulSoup(page.read_text(encoding='utf-8',errors='replace'),'html.parser')
 rel=str(page.relative_to(ROOT))
 raw=page.read_text(encoding='utf-8',errors='replace')
 if 'https://dedsec-project-official.github.io' in raw:
  issues.append(rel+' contains stale deployment URL')
 d=s.find('meta',attrs={'name':'description'})
 desc=(d.get('content','').strip() if d else '')
 if not 90<=len(desc)<=165:
  issues.append(rel+f' meta description length={len(desc)}')
 og=s.find('meta',attrs={'property':'og:description'})
 tw=s.find('meta',attrs={'name':'twitter:description'})
 if og and og.get('content','').strip()!=desc:issues.append(rel+' Open Graph description mismatch')
 if tw and tw.get('content','').strip()!=desc:issues.append(rel+' Twitter description mismatch')
 for link in s.find_all('link',href=True):
  if 'fonts.googleapis.com' in link.get('href','') or 'fonts.gstatic.com' in link.get('href',''):
   issues.append(rel+' still loads unused Google fonts')
 if rel in ('Pages/assistance.html','el/Pages/assistance.html') and s.find(id='assistance-guide-search'):
  issues.append(rel+' contains duplicate Assistance guide search')
 if rel.startswith('Assistance/') or rel.startswith('el/Assistance/'):
  if not any('assistance.css' in x.get('href','') for x in s.find_all('link',href=True)):
   issues.append(rel+' missing Assistance stylesheet')
  if not any('assistance.js' in x.get('src','') for x in s.find_all('script',src=True)):
   issues.append(rel+' missing Assistance script')


# Permanent navigation/design invariants.
vision_files=[x for x in ROOT.rglob('*.html') if x.name.lower()=='our-vision.html']
for x in vision_files:
 issues.append(str(x.relative_to(ROOT))+' standalone Our Vision page must not exist')
for x in list(ROOT.rglob('*.html'))+list(ROOT.glob('*.xml'))+list(ROOT.glob('*.txt')):
 raw=x.read_text(encoding='utf-8',errors='replace')
 if 'our-vision.html' in raw.lower():
  issues.append(str(x.relative_to(ROOT))+' references removed Our Vision route')
style=(ROOT/'style.css').read_text(encoding='utf-8',errors='replace')
if 'ABSOLUTE BORDER-ONLY LOCK (2026-08-07i.1)' not in style:
 issues.append('style.css missing global border-only surface lock')
not_found=BeautifulSoup((ROOT/'404.html').read_text(encoding='utf-8',errors='replace'),'html.parser')
robots=not_found.find('meta',attrs={'name':'robots'})
if not robots or 'noindex' not in robots.get('content','').lower():
 issues.append('404.html must be noindex')
if 'not-found-page' not in (not_found.body.get('class',[]) if not_found.body else []):
 issues.append('404.html missing responsive not-found-page design class')

if issues:
 print('\n'.join('ERROR: '+x for x in issues));sys.exit(1)
print('Source audit passed.')


# Sales/store consistency invariant added 2026-08-07j.
STALE_STORE_SUPPORT_PHRASES = (
    "Open Store / Get Direct Help",
    "Store / Direct Help",
    "Direct Help Through The Store",
    "Άνοιξε το Κατάστημα / Ζήτησε άμεση βοήθεια",
    "Store / Άμεση Βοήθεια",
    "Άμεση βοήθεια μέσω του Καταστήματος",
)
for _html in ROOT.rglob("*.html"):
    _text = _html.read_text(encoding="utf-8", errors="ignore")
    for _phrase in STALE_STORE_SUPPORT_PHRASES:
        if _phrase in _text:
            raise SystemExit(f"Stale Store/support wording remains in {_html.relative_to(ROOT)}: {_phrase}")

# Content CTA centering invariant added 2026-08-07n.
CENTERING_MARKER = 'GLOBAL CONTENT CTA CENTERING LOCK 20260807n'
for _rel in ('style.css','Assets/sales-optimization.css','Assets/assistance.css'):
    _css=(ROOT/_rel).read_text(encoding='utf-8',errors='ignore')
    if CENTERING_MARKER not in _css:
        raise SystemExit(f'{_rel} missing global content CTA centering lock')


# CTA physical-centering + punctuation invariants added 2026-08-07o.
PHYSICAL_CENTER_MARKER = 'ABSOLUTE CONTENT CTA PHYSICAL CENTERING 20260807o'
for _rel in ('style.css','Assets/sales-optimization.css','Assets/assistance.css'):
    _css=(ROOT/_rel).read_text(encoding='utf-8',errors='ignore')
    if PHYSICAL_CENTER_MARKER not in _css:
        raise SystemExit(f'{_rel} missing physical CTA centering lock')

for _rel in ('Pages/store.html','el/Pages/store.html'):
    _s=BeautifulSoup((ROOT/_rel).read_text(encoding='utf-8',errors='replace'),'html.parser')
    _lab=_s.select_one('.store-butsystem-free .sales-section-label.sales-sentence-label')
    if not _lab:
        raise SystemExit(f'{_rel} missing sentence-style ButSystem label')
    _en=_lab.get('data-en','').strip(); _gr=_lab.get('data-gr','').strip()
    if _en != 'Not a paid product.' or _gr != 'Δεν είναι πληρωμένο προϊόν.':
        raise SystemExit(f'{_rel} has incorrect ButSystem sentence-label punctuation/casing')

# Uppercase heading/category labels must not end in a period.
for _html in ROOT.rglob('*.html'):
    _s=BeautifulSoup(_html.read_text(encoding='utf-8',errors='replace'),'html.parser')
    for _lab in _s.select('.sales-section-label:not(.sales-sentence-label), .home-product-tag'):
        _t=' '.join(_lab.get_text(' ',strip=True).split())
        _letters=''.join(ch for ch in _t if ch.isalpha())
        if _letters and _letters.upper()==_letters and _t.endswith('.'):
            raise SystemExit(f'{_html.relative_to(ROOT)} uppercase heading label ends with a period: {_t}')

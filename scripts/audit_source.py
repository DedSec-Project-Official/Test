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
for rel in ('Pages/our-vision.html','el/Pages/our-vision.html'):
 s=BeautifulSoup((ROOT/rel).read_text(encoding='utf-8'),'html.parser');sec=s.find(id='keep-android-open')
 if not sec or len(sec.get_text(' ',strip=True))<12000:issues.append(rel+' incomplete Keep Android Open section')
for base in (ROOT/'Smartphone-Academy',ROOT/'el/Smartphone-Academy'):
 for page in base.rglob('*.html'):
  s=BeautifulSoup(page.read_text(encoding='utf-8',errors='replace'),'html.parser');f=s.find('footer',class_='main-footer')
  if not f:issues.append(str(page.relative_to(ROOT))+' missing footer');continue
  text=f.get_text(' ',strip=True)
  if 'Smartphone Academy Home' in text or 'Αρχική Ακαδημίας Smartphone' in text:issues.append(str(page.relative_to(ROOT))+' footer not global')
if issues:
 print('\n'.join('ERROR: '+x for x in issues));sys.exit(1)
print('Source audit passed.')

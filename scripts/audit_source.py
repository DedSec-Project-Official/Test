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

if issues:
 print('\n'.join('ERROR: '+x for x in issues));sys.exit(1)
print('Source audit passed.')

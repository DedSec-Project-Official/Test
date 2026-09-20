#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, math, re, sys
from collections import defaultdict
from pathlib import Path
from bs4 import BeautifulSoup

PRO_CLASSES=(
    'academy-professional-foundation','academy-professional-workflow',
    'academy-professional-check','academy-professional-completion','academy-professional-sources'
)
REQ_CLASSES=set(PRO_CLASSES)
WORD_RE=re.compile(r"[\wÀ-ž'-]+", re.UNICODE)

def words(text:str)->int: return len(WORD_RE.findall(text))
def clean(text:str)->str:
    text=re.sub(r'https?://\S+',' URL ',text.lower())
    text=re.sub(r'\b\d+\b',' NUM ',text)
    return re.sub(r'\s+',' ',re.sub(r'[^\wÀ-ž]+',' ',text,flags=re.UNICODE)).strip()

def extract(path:Path):
    soup=BeautifulSoup(path.read_text(encoding='utf-8',errors='replace'),'html.parser')
    article=soup.select_one('article.academy-lesson-article') or soup.find('article')
    if not article: return None
    total=article.get_text(' ',strip=True)
    blocks=[]
    for tag in article.find_all(['p','li']):
        text=re.sub(r'\s+',' ',tag.get_text(' ',strip=True)).strip()
        normalized=clean(text)
        if words(text)>=10 and len(normalized)>=55:
            blocks.append(normalized)
    repeated=sorted({x for x in blocks if blocks.count(x)>1})
    core=BeautifulSoup(str(article),'html.parser')
    present=set()
    for cls in PRO_CLASSES:
        nodes=core.select('.'+cls)
        if nodes: present.add(cls)
        for n in nodes:n.decompose()
    core_text=core.get_text(' ',strip=True)
    return {'total_words':words(total),'core_words':words(core_text),'core':clean(core_text),'present':present,'repeated_blocks':repeated}

def cosine_pairs(texts, threshold):
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
    except Exception:
        return None, []
    X=TfidfVectorizer(ngram_range=(1,2),max_df=.95).fit_transform(texts)
    S=cosine_similarity(X)
    pairs=[]
    for i in range(len(texts)):
        for j in range(i+1,len(texts)):
            if S[i,j] >= threshold:pairs.append((float(S[i,j]),i,j))
    return True, sorted(pairs, reverse=True)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--root',default='.')
    ap.add_argument('--similarity-threshold',type=float,default=.55)
    a=ap.parse_args(); root=Path(a.root).resolve(); academy=root/'Smartphone-Academy'
    data=json.loads((academy/'Smartphone-Academy-Catalog.json').read_text(encoding='utf-8'))
    lessons=data['lessons']; issues=[]; stats={}
    if len(lessons)!=235:issues.append(f'catalog count is {len(lessons)}, expected 235')
    ids=[x['id'] for x in lessons]
    if len(ids)!=len(set(ids)):issues.append('duplicate catalog ids')
    for lang in ('en','el'):
        rows=[]; hashes=defaultdict(list); intra_duplicate_pages=0
        for item in lessons:
            path=(academy/item[lang]['path']).resolve()
            if not path.is_file():issues.append(f'missing {lang}: {item["id"]}');continue
            e=extract(path)
            if not e:issues.append(f'missing article body: {path.relative_to(root)}');continue
            missing=REQ_CLASSES-e['present']
            if missing:issues.append(f'{path.relative_to(root)} missing professional sections: {sorted(missing)}')
            if e['total_words']<400:issues.append(f'{path.relative_to(root)} only {e["total_words"]} instructional words (<400)')
            if item['id']!='practical-index' and e['repeated_blocks']:
                intra_duplicate_pages+=1
                issues.append(f'{path.relative_to(root)} repeats substantive paragraph/list content within the page')
            h=hashlib.sha256(e['core'].encode()).hexdigest(); hashes[h].append(item['id'])
            rows.append((item['id'],path,e))
        for group in hashes.values():
            if len(group)>1:issues.append(f'exact duplicate core content: {group}')
        used,pairs=cosine_pairs([r[2]['core'] for r in rows],a.similarity_threshold)
        if used and pairs:
            for score,i,j in pairs[:20]:issues.append(f'near-duplicate core {lang} {score:.3f}: {rows[i][0]} <> {rows[j][0]}')
        totals=[r[2]['total_words'] for r in rows]; cores=[r[2]['core_words'] for r in rows]
        stats[lang]={
            'pages':len(rows),'min_words':min(totals),'median_words':sorted(totals)[len(totals)//2],
            'max_words':max(totals),'min_core_words':min(cores),'similarity_engine':'TF-IDF' if used else 'skipped (scikit-learn unavailable)',
            'near_duplicate_pairs':len(pairs) if used else None,'intra_page_duplicate_pages':intra_duplicate_pages,
        }
    print(json.dumps(stats,ensure_ascii=False,indent=2))
    if issues:
        print('\nQUALITY AUDIT FAILED')
        for x in issues[:200]:print('ERROR:',x)
        print('Total issues:',len(issues));return 1
    print('\nAcademy lesson quality audit passed with zero issues.')
    return 0
if __name__=='__main__':raise SystemExit(main())

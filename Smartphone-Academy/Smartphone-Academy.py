#!/usr/bin/env python
"""Termux-only local companion for the DedSec Smartphone Academy."""
from __future__ import annotations
import argparse,json,os,shutil,subprocess,sys,hashlib
from datetime import datetime,timezone
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

ROOT=Path(__file__).resolve().parent
CATALOG=ROOT/'Smartphone-Academy-Catalog.json'
STATE_DIR=Path.home()/'.dedsec-smartphone-academy'
STATE_FILE=STATE_DIR/'progress.json'
RUBRICS=ROOT/'Practice'/'Rubrics.json'
WORKSPACES=STATE_DIR/'workspaces'

def is_termux():
    return bool(os.environ.get('TERMUX_VERSION') or 'com.termux' in os.environ.get('PREFIX','').lower())
def require_termux():
    if not is_termux(): raise SystemExit('This companion is designed only for Android with Termux.')
def catalog(): return json.loads(CATALOG.read_text(encoding='utf-8'))['lessons']
def state():
    try:data=json.loads(STATE_FILE.read_text(encoding='utf-8'))
    except (FileNotFoundError,json.JSONDecodeError,OSError):data={}
    return {'version':4,'language':data.get('language','en'),'completed':list(dict.fromkeys(data.get('completed',[]))),'reviewed':list(dict.fromkeys(data.get('reviewed',[])))}
def save(s):
    STATE_DIR.mkdir(parents=True,exist_ok=True);tmp=STATE_FILE.with_suffix('.tmp');tmp.write_text(json.dumps(s,ensure_ascii=False,indent=2),encoding='utf-8');tmp.replace(STATE_FILE)
def find(query):
    q=query.strip().lower();items=catalog();exact=next((x for x in items if x['id'].lower()==q),None)
    if exact:return exact
    hits=[x for x in items if q in x['en']['title'].lower() or q in x['el']['title'].lower()]
    return hits[0] if len(hits)==1 else None
def open_url(url):
    opener=shutil.which('termux-open-url')
    if opener: subprocess.Popen([opener,url],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

def cmd_list(args):
    s=state();lang=s['language'];done=set(s['completed'])
    for x in catalog():
        if args.practical and x.get('kind')!='practical':continue
        mark='✓' if x['id'] in done else '·';hours=f" {x.get('hours',0)}h" if x.get('hours') else ''
        print(f"{mark} {x['id']:<28} {x[lang]['title']}{hours}")
def cmd_status(_):
    s=state();practical=[x for x in catalog() if x.get('kind')=='practical'];done=set(s['completed']);dh=sum(x.get('hours',0) for x in practical if x['id'] in done)
    print('Platform: Android + Termux');print(f'Termux prefix: {os.environ.get("PREFIX","unknown")}');print(f'Progress file: {STATE_FILE}');print(f'Practical labs: {sum(x["id"] in done for x in practical)}/{len(practical)}');print(f'Review acknowledgments: {len(s.get("reviewed",[]))}');print(f'Estimated practical hours completed: {dh}/{sum(x.get("hours",0) for x in practical)}')
def cmd_complete(args):
    x=find(args.lesson)
    if not x:raise SystemExit('Lesson or lab not found. Use: python Smartphone-Academy.py list')
    if x.get('kind')=='practical' and not args.force:
        command=[sys.executable,str(ROOT/'Practice'/'Labkit.py'),'check',x['id']]
        if args.reviewed: command.append('--reviewed')
        rc=subprocess.call(command)
        if rc==2: raise SystemExit('This lab passed the documentation gate but needs technical review. Review review.md, then run complete again with --reviewed.')
        if rc: raise SystemExit('Practical lab was not marked complete. Fix the failed documentation/technical checks. --force is an explicit manual override and is recorded only as local progress.')
    s=state()
    if x['id'] not in s['completed']:s['completed'].append(x['id'])
    if x.get('kind')=='practical' and args.reviewed and x['id'] not in s['reviewed']:s['reviewed'].append(x['id'])
    save(s)
    print(f"Completed: {x[s['language']]['title']}")
def cmd_uncomplete(args):
    x=find(args.lesson)
    if not x:raise SystemExit('Lesson or lab not found.')
    s=state();s['completed']=[i for i in s['completed'] if i!=x['id']];save(s);print(f"Removed: {x[s['language']]['title']}")
def cmd_language(args):
    s=state();s['language']=args.language;save(s);print(args.language)
def cmd_prepare(args):
    x=find(args.lab)
    if not x or x.get('kind')!='practical':raise SystemExit('Practical lab not found. Use: python Smartphone-Academy.py list --practical')
    command=[sys.executable,str(ROOT/'Practice'/'Labkit.py'),'prepare',x['id'],'--language',state()['language']]
    if args.force:command.append('--force')
    raise SystemExit(subprocess.call(command))
def cmd_check(args):
    x=find(args.lab)
    if not x or x.get('kind')!='practical':raise SystemExit('Practical lab not found.')
    raise SystemExit(subprocess.call([sys.executable,str(ROOT/'Practice'/'Labkit.py'),'check',x['id']]))
def _lab_score(lab_id):
    from Practice.Labkit import score_workspace
    return score_workspace(lab_id,WORKSPACES)[0]

def cmd_score(args):
    x=find(args.lab)
    if not x or x.get('kind')!='practical':raise SystemExit('Practical lab not found.')
    raise SystemExit(subprocess.call([sys.executable,str(ROOT/'Practice'/'Labkit.py'),'score',x['id']]))

def cmd_assessment(_):
    rubric=json.loads(RUBRICS.read_text(encoding='utf-8'));threshold=int(rubric.get('automatic_pass_score',80));passed=True
    print('Final local assessment set')
    for lab_id in rubric['final_assessment_labs']:
        score=_lab_score(lab_id);ok=score>=threshold;passed=passed and ok
        print(f"{'PASS' if ok else 'WAIT':4}  {lab_id:<32} {score}/100")
    print('Overall:', 'PASS' if passed else 'NOT YET COMPLETE')
    if not passed: raise SystemExit(1)

def cmd_audit(_):
    data=json.loads(CATALOG.read_text(encoding='utf-8'));items=data['lessons'];issues=[]
    ids=[x['id'] for x in items]
    if len(ids)!=len(set(ids)): issues.append('duplicate lesson/lab ids in catalog')
    practical={x['id'] for x in items if x.get('kind')=='practical'}
    labs=json.loads((ROOT/'Practice'/'Catalog.json').read_text(encoding='utf-8'))['labs'];lab_ids={x['id'] for x in labs}
    if practical!=lab_ids: issues.append('practical catalog and Labkit catalog differ')
    for x in items:
        for lang in ('en','el'):
            target=(ROOT/x[lang]['path']).resolve()
            if not target.is_file(): issues.append(f"missing {lang} page for {x['id']}: {x[lang]['path']}")
    for path in ROOT.rglob('*'):
        if path.is_file() and path.stat().st_size==0: issues.append(f'empty file: {path.relative_to(ROOT)}')
    expected_hours=sum(x.get('hours',0) for x in items if x.get('kind')=='practical')
    if data.get('practical_hours')!=expected_hours: issues.append(f"catalog practical_hours={data.get('practical_hours')} but calculated={expected_hours}")
    try:
        rub=json.loads(RUBRICS.read_text(encoding='utf-8'))
        from Practice.Labkit import validation_mode
        bad=[x for x in rub.get('final_assessment_labs',[]) if validation_mode(x)!='automatic']
        if bad:issues.append('final assessment contains labs without automatic validation: '+', '.join(bad))
    except Exception as exc: issues.append(f'invalid Rubrics.json or validator configuration: {exc}')
    print(f'Catalog items: {len(items)} | practical labs: {len(practical)} | hours: {expected_hours}')
    if issues:
        for issue in issues: print('ERROR:',issue)
        raise SystemExit(1)
    print('Academy audit passed with zero structural issues.')

def cmd_certificate(_):
    items=catalog();s=state();done=set(s['completed']);missing=[x['id'] for x in items if x['id'] not in done]
    if missing:
        print(f'Completion record not generated: {len(missing)} catalog items are not marked complete.')
        print('First incomplete items:', ', '.join(missing[:10]));raise SystemExit(1)
    rubric=json.loads(RUBRICS.read_text(encoding='utf-8'));threshold=int(rubric.get('automatic_pass_score',80));scores={x:_lab_score(x) for x in rubric['final_assessment_labs']}
    failed={k:v for k,v in scores.items() if v<threshold}
    if failed:
        print('Completion record not generated: final assessment set has not passed.')
        for k,v in failed.items(): print(f'{k}: {v}/100')
        raise SystemExit(1)
    STATE_DIR.mkdir(parents=True,exist_ok=True);stamp=datetime.now(timezone.utc).replace(microsecond=0).isoformat();catalog_hash=hashlib.sha256(CATALOG.read_bytes()).hexdigest()
    practical=[x for x in items if x.get('kind')=='practical'];record={
      'title':'DedSec Smartphone Academy — Local Completion Record','generated_utc':stamp,'language':s['language'],
      'catalog_items':len(items),'practical_labs':len(practical),'estimated_practical_hours':sum(x.get('hours',0) for x in practical),
      'final_assessment_scores':scores,'catalog_sha256':catalog_hash,
      'status':'self-managed, non-accredited, locally assessed','review_acknowledgments':len(s.get('reviewed',[])),'note':'This record documents local Academy completion. The final assessment set includes lab-specific automatic artifact checks; other practical labs may rely on explicit self/peer/instructor review. It is not an accredited professional certification or independent verification of professional competence.'}
    (STATE_DIR/'completion-record.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    md=f"""# DedSec Smartphone Academy — Local Completion Record\n\nGenerated (UTC): {stamp}\n\nStatus: **self-managed, non-accredited, locally assessed**\n\n- Catalog items completed: {len(items)}/{len(items)}\n- Practical labs completed: {len(practical)}/{len(practical)}\n- Estimated practical hours: {record['estimated_practical_hours']}\n- Final assessment labs: {len(scores)}/{len(scores)} passed at {threshold}/100 or higher\n- Catalog SHA-256: `{catalog_hash}`\n\nThis record documents the learner's local Academy completion state. The final assessment set includes lab-specific automatic artifact checks; review-mode labs require explicit self/peer/instructor review acknowledgment. It is not an accredited professional certification and does not independently verify professional competence.\n"""
    path=STATE_DIR/'completion-record.md';path.write_text(md,encoding='utf-8');print(path)
def cmd_open(args):
    x=find(args.lesson) if args.lesson else None;target=ROOT/(x[state()['language']]['path'] if x else 'index.html')
    if not target.exists():raise SystemExit(f'Missing page: {target}')
    url=target.as_uri();open_url(url);print(url)
def cmd_serve(args):
    os.chdir(ROOT.parent);server=ThreadingHTTPServer((args.host,args.port),SimpleHTTPRequestHandler);url=f'http://127.0.0.1:{args.port}/Smartphone-Academy/index.html';print(url)
    if not args.no_browser:open_url(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
def main():
    require_termux();ap=argparse.ArgumentParser(description='DedSec Smartphone Academy for Termux');sub=ap.add_subparsers(dest='command',required=True)
    p=sub.add_parser('list');p.add_argument('--practical',action='store_true');p.set_defaults(func=cmd_list)
    p=sub.add_parser('status');p.set_defaults(func=cmd_status)
    p=sub.add_parser('complete');p.add_argument('lesson');p.add_argument('--reviewed',action='store_true',help='acknowledge technical self/peer/instructor review for review-mode labs');p.add_argument('--force',action='store_true',help='manual local-progress override; does not validate competence');p.set_defaults(func=cmd_complete)
    p=sub.add_parser('uncomplete');p.add_argument('lesson');p.set_defaults(func=cmd_uncomplete)
    p=sub.add_parser('language');p.add_argument('language',choices=['en','el']);p.set_defaults(func=cmd_language)
    p=sub.add_parser('prepare');p.add_argument('lab');p.add_argument('--force',action='store_true');p.set_defaults(func=cmd_prepare)
    p=sub.add_parser('check');p.add_argument('lab');p.set_defaults(func=cmd_check)
    p=sub.add_parser('score');p.add_argument('lab');p.set_defaults(func=cmd_score)
    p=sub.add_parser('assessment');p.set_defaults(func=cmd_assessment)
    p=sub.add_parser('audit');p.set_defaults(func=cmd_audit)
    p=sub.add_parser('certificate');p.set_defaults(func=cmd_certificate)
    p=sub.add_parser('open');p.add_argument('lesson',nargs='?');p.set_defaults(func=cmd_open)
    p=sub.add_parser('serve');p.add_argument('--host',default='127.0.0.1');p.add_argument('--port',type=int,default=8000);p.add_argument('--no-browser',action='store_true');p.set_defaults(func=cmd_serve)
    a=ap.parse_args();a.func(a)
if __name__=='__main__':main()

#!/usr/bin/env python
"""Create safe local workspaces for DedSec Smartphone Academy practical labs."""
from __future__ import annotations
import argparse, json, hashlib, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/'Practice'/'Catalog.json'
DEFAULT_BASE=Path.home()/'.dedsec-smartphone-academy'/'workspaces'


def title_slug(value):
    return '-'.join(part[:1].upper()+part[1:].lower() for part in value.replace('_','-').split('-') if part)

def load_labs():
    return json.loads(CATALOG.read_text(encoding='utf-8'))['labs']

def find_lab(lab_id):
    return next((x for x in load_labs() if x['id']==lab_id),None)

def sample_files(lab):
    module=lab['module']; lid=lab['id']
    common={'source/NOTICE.txt':f'Harmless local training data for {lid}.\nDo not replace this folder with private or production evidence.\n'}
    sample_dir=ROOT/'Practice'/'Samples'/title_slug(lid)
    if sample_dir.exists():
        for p in sample_dir.rglob('*'):
            if p.is_file(): common['source/'+p.relative_to(sample_dir).as_posix()]=p.read_text(encoding='utf-8')
        return common
    special={
      'package-integrity-baseline':{
        'source/package-list.txt':'python 3.13.5\ngit 2.49.0\nopenssl 3.5.0\n',
        'source/repositories.txt':'packages.termux.dev stable main\n',
        'source/config/bashrc.sample':'export EDITOR=nano\nalias ll=\"ls -la\"\n'},
      'shell-session-journal':{
        'source/session-transcript.txt':'$ pwd\n/data/data/com.termux/files/home/academy-lab\n$ find source -type f\nsource/a.txt\nsource/b.txt\n',
        'source/a.txt':'alpha\nbeta\n','source/b.txt':'warning\nrecovered\n'},
      'safe-batch-operations':{
        'source/files/report one.txt':'first report\n','source/files/report two.txt':'second report\n','source/files/photo notes.txt':'metadata notes only\n'},
      'tls-certificate-audit':{
        'source/certificate-details.txt':'subject=CN=academy.example\nissuer=CN=DedSec Training CA\nnotBefore=Jul 01 00:00:00 2026 GMT\nnotAfter=Oct 01 00:00:00 2026 GMT\nX509v3 Subject Alternative Name: DNS:academy.example, DNS:www.academy.example\n'},
      'connectivity-change-detection':{
        'source/before.txt':'interface=wlan0 state=UP address=192.0.2.10/24\ndefault_route=192.0.2.1 dns=192.0.2.53\n',
        'source/after.txt':'interface=wlan0 state=UP address=198.51.100.24/24\ndefault_route=198.51.100.1 dns=198.51.100.53\n'},
      'dependency-inventory':{
        'source/sample_project/app.py':'import json\nimport requests\nfrom pathlib import Path\n',
        'source/sample_project/helper.py':'import csv\nimport missing_training_module\n',
        'source/installed-packages.json':'[{\"name\":\"requests\",\"version\":\"2.32.4\"}]\n'},
      'json-config-validator':{
        'source/configs/valid.json':'{\"port\":8080,\"debug\":false,\"log_level\":\"INFO\"}\n',
        'source/configs/wrong-type.json':'{\"port\":\"8080\",\"debug\":\"no\"}\n',
        'source/configs/out-of-range.json':'{\"port\":70000,\"debug\":false}\n'},
      'csp-review':{
        'source/index.html':'<script src=\"/app.js\"></script><img src=\"https://images.example/logo.png\"><style>body{font-family:sans-serif}</style>\n',
        'source/headers.txt':"Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; img-src * data:\n"},
      'local-form-validation':{
        'source/cases.json':'[{\"name\":\"Student\",\"age\":22},{\"name\":\"\",\"age\":-1},{\"name\":\"A\" ,\"age\":\"22\"}]\n'},
      'log-retention-alerting':{
        'source/logs/app-1.log':'INFO start\nWARN retry\nWARN retry\n',
        'source/logs/app-2.log':'INFO start\nINFO complete\n',
        'source/logs/app-3.log':'WARN burst\nWARN burst\nWARN burst\nWARN burst\n'},
      'secret-exposure-scan':{
        'source/project/.env.example':'API_TOKEN=TRAINING_TOKEN_DO_NOT_USE\nMODE=demo\n',
        'source/project/config.py':'TOKEN=\"DEMO_SECRET_123456\"\nPUBLIC_NAME=\"academy\"\n',
        'source/project/test_fixture.txt':'expected token DEMO_SECRET_123456 for scanner tests\n'},
      'mobile-response-casefile':{
        'source/case/auth.log':'2026-07-01T10:00:00Z login_ok account=owner\n2026-07-01T10:06:00Z login_failed account=owner\n',
        'source/case/network.csv':'time,protocol,destination,result\n10:02,DNS,updates.example,allowed\n10:07,HTTPS,unknown.example,blocked\n',
        'source/case/files.csv':'time,path,event\n10:03,config/app.ini,modified\n10:08,downloads/archive.zip,created\n',
        'source/case/packages.txt':'python 3.13.5\nopenssl 3.5.0\nunknown-demo 0.1\n'},
    }
    special.update({'smartphone-baseline-assessment': {'source/device-baseline.txt': 'android_version=15\nsecurity_patch=2026-06-01\ntermux_prefix=/data/data/com.termux/files/usr\nstorage_free_gb=18\n', 'source/app-permissions.csv': 'app,permission,state\nBrowser,camera,denied\nAuthenticator,notifications,allowed\n'}, 'storage-permission-recovery': {'source/path-cases.txt': '$HOME/academy/data.txt\n~/storage/shared/Academy/data.txt\n/storage/emulated/0/Academy/data.txt\n', 'source/errors.log': 'Permission denied: shared/report.txt\nNo such file or directory: ~/Storage/shared\n'}, 'package-update-rollback-plan': {'source/packages-before.txt': 'python 3.14.5\ngit 2.55.0\ncurl 8.15.0\n', 'source/update-log.txt': 'python upgraded 3.14.5 -> 3.14.6\ngit unchanged\ncurl upgraded 8.15.0 -> 8.16.0\n'}, 'dns-resolver-comparison': {'source/dns-results.csv': 'resolver,domain,rcode,answer_ms,dnssec\nsystem,example.test,NOERROR,34,unknown\nresolver-a,example.test,NOERROR,28,yes\nresolver-b,example.test,NOERROR,41,no\n'}, 'network-change-diff': {'source/before.txt': 'interface=wlan0 address=192.0.2.20 route=192.0.2.1 dns=192.0.2.53\n', 'source/after.txt': 'interface=wlan0 address=198.51.100.24 route=198.51.100.1 dns=198.51.100.53\n'}, 'python-log-normalizer': {'source/app.log': '2026-07-20 10:00 INFO app started\nmalformed line\n2026-07-20 10:03 WARN retry\n', 'source/system.log': '2026-07-20T10:01:00Z|INFO|system|network ready\n'}, 'python-config-backup': {'source/config/app.json': '{"mode":"training","port":8080}\n', 'source/config/settings.ini': '[academy]\nlanguage=en\n', 'source/allow-list.json': '["source/config/app.json","source/config/settings.ini"]\n'}, 'web-input-output-review': {'source/form.html': '<form><input name="display_name"><textarea name="bio"></textarea></form>\n', 'source/test-cases.json': '["Student","","<b>training</b>","A" ]\n'}, 'offline-asset-audit': {'source/site/index.html': '<link rel="stylesheet" href="/style.css"><script src="https://cdn.example/app.js"></script><img src="images/logo.png">\n', 'source/site/style.css': 'body{font-family:sans-serif}\n'}, 'permission-change-journal': {'source/permissions-before.csv': 'app,permission,state\nCamera,camera,allowed\nNotes,notifications,allowed\n', 'source/permissions-after.csv': 'app,permission,state\nCamera,camera,allowed\nNotes,notifications,denied\n'}, 'apk-provenance-report': {'source/apk-metadata.txt': 'filename=academy-demo.apk\npackage=example.academy.demo\nversion=1.0\nsource=https://example.test/download\n', 'source/signer.txt': 'signer=TRAINING-CERTIFICATE\n'}, 'battery-drain-evidence': {'source/battery-observations.csv': 'time,battery,temp_c,screen,network\n09:00,100,29,off,wifi\n10:00,94,31,on,wifi\n11:00,90,30,off,mobile\n'}, 'usb-c-data-power-validation': {'source/accessory-tests.csv': 'cable,charger,data,otg,video,charge_result\nA,25W PPS,yes,yes,no,fast\nB,25W PPS,no,no,no,fast\n'}, 'ai-verification-notebook': {'source/ai-answer.md': 'Claim 1: Every USB-C cable supports video.\nClaim 2: Android patch level can be checked in Settings.\n', 'source/source-list.md': '- Android Help\n- Device manufacturer support page\n'}})
    if lid in special:
        common.update(special[lid])
        return common
    if module=='networking-practical':
        common['source/network-observations.csv']='time,protocol,source,destination,detail\n09:00,DNS,device,resolver,example.test A\n09:00,TCP,device,server,443 SYN\n09:01,HTTPS,device,server,200 response\n'
    elif module=='monitoring':
        common['source/auth.log']='2026-01-12T09:00:00Z INFO login_ok user=student source=lab\n2026-01-12T09:03:02Z WARN login_failed user=analyst source=test-a\n2026-01-12T09:03:14Z WARN login_failed user=analyst source=test-a\n2026-01-12T09:08:00Z INFO login_ok user=analyst source=test-a\n'
        common['source/file-events.csv']='time,path,event\n2026-01-12T09:02:00Z,config/app.ini,modified\n2026-01-12T09:05:00Z,temp/report.txt,created\n'
    elif module=='python-automation':
        common['source/events.log']='2026-01-12 09:00 INFO service started\ninvalid record\n2026-01-12 09:04 WARN repeated failure\n2026-01-12 09:06 INFO service recovered\n'
        common['source/findings.json']='[{"id":"F-001","severity":"medium","title":"Example finding","evidence":"local sample"}]\n'
    elif module=='web-defence':
        common['source/request.txt']='POST /profile HTTP/1.1\nHost: local.test\nContent-Type: application/x-www-form-urlencoded\n\nname=Student&bio=Training+sample\n'
        common['source/response-headers.txt']='HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nCache-Control: no-store\n'
    elif module=='hardening':
        common['source/device-services.csv']='service,purpose,startup,exposure\nacademy-demo,training,manual,loopback\nfile-share,example,disabled,none\n'
    elif module=='repair-planning':
        common['source/device-profile.md']='Model code: DEMO-SMARTPHONE-2026\nRear material: glass\nEntry point: rear cover\nBattery state: service required\n'
        common['source/parts-list.csv']='part,claim,model,notes\nbattery,genuine,DEMO-SMARTPHONE-2026,verify connector\nscreen,aftermarket,DEMO-SMARTPHONE-2025,wrong model\n'
        common['source/risk-register.csv']='hazard,likelihood,impact,control\nbattery damage,medium,high,stop and isolate\nflex cable cut,medium,medium,use depth map\n'
    elif module=='accessory-labs':
        common['source/accessories.csv']='item,connector,data,power,video,notes\nhub-a,USB-C,5Gbps,PD pass-through,yes,requires Alt Mode\ncable-b,USB-C,USB2,60W,no,power-focused cable\nssd-c,USB-C,10Gbps,bus powered,no,may need powered hub\n'
        common['source/phone-capabilities.txt']='USB host=yes\nDisplayPort Alt Mode=unknown\nMaximum charging=25W PPS\nExternal storage=exFAT supported\n'
    elif module=='mobile-coding':
        common['source/project/app.py']='from pathlib import Path\nimport json\n\ndef inventory(path: Path):\n    return [{"name": p.name, "size": p.stat().st_size} for p in path.iterdir() if p.is_file()]\n'
        common['source/project/README.md']='# Training Project\nA harmless local project for coding labs.\n'
        common['source/project/tests.txt']='startup success\nmissing path handled\ninvalid input rejected\n'
    elif module=='smartphone-ai':
        common['source/fictional-support-log.txt']='2026-07-01 user=Alex.Demo email=alex@example.test token=TRAINING_TOKEN issue=app crash\n'
        common['source/ai-answer.txt']='The command is always safe and works on every Android version. No verification is necessary.\n'
        common['source/model-options.csv']='model,size_gb,ram_estimate_gb,context,notes\nsmall-q4,0.8,1.6,2048,possible\nmedium-q4,2.2,4.5,4096,high pressure\nlarge-q4,5.0,9.5,8192,do not attempt\n'
    elif module=='custom-roms':
        common['source/device-profile.md']='Marketing name: Demo Phone\nModel code: DEMO-2026\nCodename: demo\nRegion: global\nChipset: arm64\nCurrent build: STOCK-2026.07\nBootloader: locked\n'
        common['source/rom-release.json']='{"project":"ExampleOS","device":"demo","version":"1.0","sha256":"TRAINING_ONLY","maintained":true}\n'
        common['source/partition-map.csv']='partition,purpose,slot,source\nboot,kernel,A/B,device guide\nvendor_boot,vendor ramdisk,A/B,device guide\nsuper,dynamic partitions,A/B,AOSP docs\n'
        common['source/rollback-checklist.txt']='[ ] Stock firmware found\n[ ] Backup tested\n[ ] Unlock eligibility verified\n[ ] Restore method documented\n[ ] Relock rule documented\n'
    elif module=='capstone':
        common['source/capstone-auth.log']='2026-02-01T10:00:00Z login_ok account=owner source=console\n2026-02-01T10:12:00Z login_failed account=owner source=remote-test\n'
        common['source/capstone-network.csv']='time,protocol,destination,result\n10:00,DNS,updates.example.test,allowed\n10:13,HTTPS,docs.example.test,allowed\n'
        common['source/capstone-files.csv']='time,path,event\n10:05,docs/plan.md,modified\n10:14,config/demo.ini,modified\n'
    else:
        common['source/sample-a.txt']='alpha\nbeta\nwarning: training marker\ngamma\n'
        common['source/sample-b.txt']='one,two,three\n4,5,6\n'
    return common

def prepare(lab_id,base,language='en',force=False):
    lab=find_lab(lab_id)
    if not lab: raise SystemExit(f'Unknown lab: {lab_id}')
    folder=base/lab_id
    if folder.exists() and any(folder.iterdir()) and not force:
        raise SystemExit(f'{folder} already contains files. Use --force only after making a backup.')
    folder.mkdir(parents=True,exist_ok=True)
    data=lab['el' if language=='el' else 'en']
    for rel,text in sample_files(lab).items():
        p=folder/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
    tasks='\n'.join(f'- [ ] {t}' for t in data['tasks'])
    readme=f"# {data['title']}\n\nEstimated active time: {lab['hours']} hours\n\n## Objective\n{data['summary']}\n\n## Tasks\n{tasks}\n\n## Evidence\n{data['deliverable']}\n\nWork only with the supplied samples or systems you are authorized to administer.\n"
    (folder/'README.md').write_text(readme,encoding='utf-8')
    (folder/'notes.md').write_text('# Notes\n\n## Observations\n\n## Assumptions\n\n## Commands and results\n\n## Limitations\n',encoding='utf-8')
    (folder/'evidence.md').write_text('# Evidence\n\nScope:\nDate:\nDevice:\n\n## Result\n\n## Verification\n\n## Limitations\n',encoding='utf-8')
    (folder/'review.md').write_text('# Review\n\n## Expected result\n\nDescribe the result that should be produced if the method is correct.\n\n## Failure or edge case\n\nDocument at least one failure, boundary, rollback or negative test when the lab permits it.\n\n## Evidence mapping\n\nMap each important conclusion to a file, command output, hash, test result or observation.\n\n## Reviewer decision\n\nStatus: NOT REVIEWED\nReviewer: self / peer / instructor\nDate:\nNotes:\n',encoding='utf-8')
    manifest=[]
    for p in sorted((folder/'source').rglob('*')):
        if p.is_file(): manifest.append(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(folder).as_posix()}")
    (folder/'source-sha256.txt').write_text('\n'.join(manifest)+'\n',encoding='utf-8')
    print(folder)

def _section_body(text,heading):
    match=re.search(rf'^## {re.escape(heading)}\s*\n(.*?)(?=^## |\Z)',text,re.M|re.S)
    return match.group(1).strip() if match else ''

def _field(text,label):
    match=re.search(rf'^{re.escape(label)}:\s*(.+)$',text,re.M)
    return match.group(1).strip() if match else ''

def _manifest_ok(folder):
    manifest=folder/'source-sha256.txt'
    if not manifest.exists(): return False, ['source-sha256.txt is missing']
    issues=[]
    for line in manifest.read_text(encoding='utf-8').splitlines():
        if not line.strip(): continue
        try:digest,rel=line.split('  ',1)
        except ValueError:
            issues.append(f'invalid manifest line: {line}');continue
        path=folder/rel
        if not path.is_file(): issues.append(f'missing source file: {rel}');continue
        actual=hashlib.sha256(path.read_bytes()).hexdigest()
        if actual!=digest: issues.append(f'source changed: {rel}')
    return not issues,issues

def _quality_text(text,min_chars=80,min_unique=12):
    t=re.sub(r'\s+',' ',text.strip())
    if len(t)<min_chars:return False
    low=t.lower()
    if any(x in low for x in ('lorem ipsum','todo todo','fill this','placeholder text')):return False
    words=re.findall(r"[\w'-]+",low)
    return len(set(words))>=min_unique

def _too_similar(parts):
    sets=[]
    for p in parts:
        w=set(re.findall(r"[\w'-]+",p.lower()))
        if w:sets.append(w)
    for i in range(len(sets)):
        for j in range(i+1,len(sets)):
            u=sets[i]|sets[j]
            if u and len(sets[i]&sets[j])/len(u)>.88:return True
    return False

def _learner_files(folder):
    excluded={'README.md','notes.md','evidence.md','review.md','source-sha256.txt'}
    out=[]
    for p in folder.rglob('*'):
        if p.is_file() and 'source' not in p.relative_to(folder).parts and p.name not in excluded:
            out.append(p)
    return out

def _all_learner_text(folder):
    chunks=[]
    for p in _learner_files(folder)+[folder/'notes.md',folder/'evidence.md',folder/'review.md']:
        if p.is_file() and p.stat().st_size<2_000_000:
            try: chunks.append(p.read_text(encoding='utf-8',errors='replace'))
            except Exception: pass
    return '\n'.join(chunks)

def _find_named(folder,*patterns):
    pats=[re.compile(x,re.I) for x in patterns]
    return [p for p in _learner_files(folder) if any(rx.search(p.name) for rx in pats)]

def _validate_hash_baseline(folder):
    text=_all_learner_text(folder); low=text.lower()
    source_hashes=[]
    for p in sorted((folder/'source').rglob('*')):
        if p.is_file():source_hashes.append(hashlib.sha256(p.read_bytes()).hexdigest())
    learner_hashes=set(re.findall(r'\b[a-fA-F0-9]{64}\b',text))
    original_matches=sum(h in learner_hashes for h in source_hashes)
    additional=[h for h in learner_hashes if h not in source_hashes]
    baseline_files=_find_named(folder,r'baseline',r'manifest')
    ok=bool(baseline_files and original_matches>=1 and additional and any(x in low for x in ('changed','modified','different','altered')) and any(x in low for x in ('cannot prove','does not prove','not prove','δεν αποδεικν')))
    return ok, f'baseline/manifest={len(baseline_files)}, original hashes cited={original_matches}, changed-copy hashes={len(additional)}'

def _validate_package_baseline(folder):
    text=_all_learner_text(folder).lower(); names=[p.name.lower() for p in _learner_files(folder)]
    ok=('package-baseline.md' in names and 'package-list.txt' in names and 'python' in text and 'git' in text and ('repository' in text or 'repositories' in text) and ('sha256' in text or re.search(r'\b[a-f0-9]{64}\b',text)) and 'monthly' in text and 'rollback' in text)
    return bool(ok),'requires package-baseline.md, package-list.txt, package/repository evidence, hashes, monthly routine and rollback note'

def _validate_json_config(folder):
    import ast
    script=folder/'config_validator.py'; report=folder/'validation-report.md'; tests=folder/'test-configs'
    if not script.is_file():
        # permit one level of organization
        hits=list(folder.rglob('config_validator.py'));script=hits[0] if hits else script
    if not report.is_file():
        hits=list(folder.rglob('validation-report.md'));report=hits[0] if hits else report
    syntax=False;code=''
    if script.is_file():
        code=script.read_text(encoding='utf-8',errors='replace')
        try:ast.parse(code);syntax=True
        except SyntaxError:syntax=False
    test_files=[p for p in (tests.rglob('*') if tests.exists() else []) if p.is_file()]
    rpt=report.read_text(encoding='utf-8',errors='replace').lower() if report.is_file() else ''
    ok=syntax and 'json' in code and len(test_files)>=3 and all(k in rpt for k in ('valid','type','range')) and any(k in rpt for k in ('unexpected','unknown','extra'))
    return ok,f'syntax={syntax}, test configs={len(test_files)}, report={report.is_file()}'

def _validate_log_normalizer(folder):
    import json as _json
    scripts=[p for p in _learner_files(folder) if p.suffix=='.py']
    jsonl=[p for p in _learner_files(folder) if p.suffix.lower() in ('.jsonl','.ndjson')]
    rejected=[p for p in _learner_files(folder) if 'reject' in p.name.lower() or 'error' in p.name.lower()]
    valid=0;schema_ok=True
    for p in jsonl:
        for line in p.read_text(encoding='utf-8',errors='replace').splitlines():
            if not line.strip():continue
            try:o=_json.loads(line)
            except Exception:continue
            valid+=1
            if not isinstance(o,dict) or not all(k in o for k in ('timestamp','level','source','message')):schema_ok=False
    text=_all_learner_text(folder).lower()
    ok=bool(scripts and jsonl and rejected and valid>=3 and schema_ok and any(p.stat().st_size>0 for p in rejected) and 'timezone' in text and 'encoding' in text)
    return ok,f'scripts={len(scripts)}, jsonl={len(jsonl)}, valid records={valid}, rejected files={len(rejected)}, schema={schema_ok}'

def _validate_capstone_incident(folder):
    text=_all_learner_text(folder).lower()
    timeline=_find_named(folder,r'timeline'); findings=_find_named(folder,r'finding'); containment=_find_named(folder,r'contain')
    timeline_text='\n'.join(p.read_text(encoding='utf-8',errors='replace').lower() for p in timeline if p.stat().st_size<2_000_000)
    ok=bool(timeline and findings and containment and ('login_failed' in timeline_text or '10:12' in timeline_text) and ('config/demo.ini' in timeline_text or 'docs/plan.md' in timeline_text) and 'hypoth' in text and 'confidence' in text and 'evidence' in text and ('preserv' in text or 'hash' in text))
    return ok,f'timeline={len(timeline)}, findings={len(findings)}, containment={len(containment)}, synthetic events correlated={"login_failed" in timeline_text or "10:12" in timeline_text}'

def _validate_mobile_casefile(folder):
    required=['scope.md','evidence-register.csv','timeline.csv','findings.md','limitations.md','executive-summary.md']
    missing=[x for x in required if not (folder/x).is_file()]
    if missing:return False,'missing: '+', '.join(missing)
    reg=(folder/'evidence-register.csv').read_text(encoding='utf-8',errors='replace').lower()
    timeline=(folder/'timeline.csv').read_text(encoding='utf-8',errors='replace').lower()
    findings=(folder/'findings.md').read_text(encoding='utf-8',errors='replace').lower()
    source_hashes=[hashlib.sha256(p.read_bytes()).hexdigest() for p in (folder/'source').rglob('*') if p.is_file()]
    hashes_ok=sum(h in reg for h in source_hashes)>=2
    events_ok=any(x in timeline for x in ('login_failed','unknown.example','config/app.ini','archive.zip'))
    categories=all(x in findings for x in ('fact','inference','question')) and ('rejected' in findings or 'reject' in findings)
    ok=hashes_ok and events_ok and categories
    return ok,f'evidence hashes matched={sum(h in reg for h in source_hashes)}, timeline events={events_ok}, reasoning categories={categories}'

AUTO_VALIDATORS={
    'hash-baseline':_validate_hash_baseline,
    'package-integrity-baseline':_validate_package_baseline,
    'json-config-validator':_validate_json_config,
    'python-log-normalizer':_validate_log_normalizer,
    'capstone-incident':_validate_capstone_incident,
    'mobile-response-casefile':_validate_mobile_casefile,
}

def validation_mode(lab_id):
    return 'automatic' if lab_id in AUTO_VALIDATORS else 'review'

def technical_validation(lab_id,folder):
    fn=AUTO_VALIDATORS.get(lab_id)
    if not fn:return None,'No lab-specific automatic correctness test; reviewer judgment is required.'
    try:return fn(folder)
    except Exception as exc:return False,f'automatic validator error: {exc}'

def score_workspace(lab_id,base):
    folder=base/lab_id
    required=['README.md','notes.md','evidence.md','source-sha256.txt','review.md']
    missing=[x for x in required if not (folder/x).is_file()]
    details=[];score=0
    integrity_ok,manifest_issues=_manifest_ok(folder) if folder.exists() else (False,['workspace is missing'])
    if not missing and integrity_ok:
        score+=15;details.append(('integrity',15,'required files and source hashes verified'))
    else:details.append(('integrity',0,'; '.join(missing+manifest_issues)))
    readme=(folder/'README.md').read_text(encoding='utf-8') if (folder/'README.md').is_file() else ''
    boxes=re.findall(r'^- \[([ xX])\] ',readme,re.M);done=sum(x.lower()=='x' for x in boxes)
    if boxes and done==len(boxes):score+=15;details.append(('tasks',15,f'{done}/{len(boxes)} checklist items complete'))
    else:details.append(('tasks',0,f'{done}/{len(boxes)} checklist items complete'))
    evidence=(folder/'evidence.md').read_text(encoding='utf-8') if (folder/'evidence.md').is_file() else ''
    evparts=[_section_body(evidence,x) for x in ('Result','Verification','Limitations')]
    date=_field(evidence,'Date')
    evidence_ok=(len(_field(evidence,'Scope'))>=5 and bool(re.match(r'^20\d\d[-/]',date)) and len(_field(evidence,'Device'))>=3 and all(_quality_text(x,80,12) for x in evparts) and not _too_similar(evparts))
    if evidence_ok:score+=20;details.append(('evidence',20,'scope/date/device and distinct result, verification and limitations are substantive'))
    else:details.append(('evidence',0,'use a real date and write distinct, substantive Result, Verification and Limitations sections'))
    notes=(folder/'notes.md').read_text(encoding='utf-8') if (folder/'notes.md').is_file() else ''
    nparts=[_section_body(notes,x) for x in ('Observations','Assumptions','Commands and results','Limitations')]
    notes_ok=all(_quality_text(x,60,10) for x in nparts) and not _too_similar(nparts)
    if notes_ok:score+=20;details.append(('notes',20,'analyst notes are substantive and distinct'))
    else:details.append(('notes',0,'write distinct observations, assumptions, commands/results and limitations; boilerplate does not pass'))
    tech_ok,tech_msg=technical_validation(lab_id,folder)
    if tech_ok is True:
        score+=30;details.append(('technical',30,tech_msg))
    elif tech_ok is False:details.append(('technical',0,tech_msg))
    else:details.append(('technical','review',tech_msg))
    return score,details

def check(lab_id,base,reviewed=False):
    if not find_lab(lab_id): print(f'Unknown lab: {lab_id}');return 1
    score,details=score_workspace(lab_id,base);mode=validation_mode(lab_id)
    for name,points,message in details: print(f'{name:10} {str(points):>6}  {message}')
    if mode=='automatic':
        print(f'Score: {score}/100  Pass threshold: 80/100 with automatic technical validation')
        if score<80:
            print('Result: NOT YET COMPLETE');return 1
        print('Result: PASS — documentation and lab-specific automatic checks satisfied.');return 0
    doc_score=score
    print(f'Documentation score: {doc_score}/70  Readiness threshold: 56/70')
    if doc_score<56:
        print('Result: NOT YET READY FOR REVIEW');return 1
    if reviewed:
        print('Result: REVIEW ACKNOWLEDGED — documentation gate passed; reviewer remains responsible for technical correctness.');return 0
    print('Result: READY FOR REVIEW — no automatic checker can honestly determine correctness for this lab.')
    return 2

def main():
    ap=argparse.ArgumentParser();ap.add_argument('command',choices=['prepare','check','score','list']);ap.add_argument('lab_id',nargs='?');ap.add_argument('--base',type=Path,default=DEFAULT_BASE);ap.add_argument('--language',choices=['en','el'],default='en');ap.add_argument('--force',action='store_true');ap.add_argument('--reviewed',action='store_true',help='acknowledge completed reviewer/self-review for review-mode labs');a=ap.parse_args()
    if a.command=='list':
        for x in load_labs(): print(f"{x['id']:<28} {x['hours']}h  {validation_mode(x['id']):<9}  {x['en']['title']}")
    elif not a.lab_id: ap.error('lab_id is required')
    elif a.command=='prepare': prepare(a.lab_id,a.base,a.language,a.force)
    elif a.command=='score':
        score,details=score_workspace(a.lab_id,a.base)
        for name,points,message in details: print(f'{name:10} {str(points):>6}  {message}')
        print(f'Mode: {validation_mode(a.lab_id)}')
        print(f'Score: {score}/100' if validation_mode(a.lab_id)=='automatic' else f'Documentation score: {score}/70')
    else: raise SystemExit(check(a.lab_id,a.base,a.reviewed))
if __name__=='__main__': main()

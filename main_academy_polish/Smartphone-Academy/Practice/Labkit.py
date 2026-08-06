#!/usr/bin/env python
"""Create safe local workspaces for DedSec Smartphone Academy practical labs."""
from __future__ import annotations
import argparse, json, hashlib
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
    manifest=[]
    for p in sorted((folder/'source').rglob('*')):
        if p.is_file(): manifest.append(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(folder).as_posix()}")
    (folder/'source-sha256.txt').write_text('\n'.join(manifest)+'\n',encoding='utf-8')
    print(folder)

def check(lab_id,base):
    folder=base/lab_id
    required=['README.md','notes.md','evidence.md','source-sha256.txt']
    missing=[x for x in required if not (folder/x).exists()]
    if missing: print('Missing: '+', '.join(missing));return 1
    evidence=(folder/'evidence.md').read_text(encoding='utf-8')
    if len(evidence.strip())<90: print('Evidence file still looks empty.');return 1
    print(f'Workspace structure is ready: {folder}');return 0

def main():
    ap=argparse.ArgumentParser();ap.add_argument('command',choices=['prepare','check','list']);ap.add_argument('lab_id',nargs='?');ap.add_argument('--base',type=Path,default=DEFAULT_BASE);ap.add_argument('--language',choices=['en','el'],default='en');ap.add_argument('--force',action='store_true');a=ap.parse_args()
    if a.command=='list':
        for x in load_labs(): print(f"{x['id']:<26} {x['hours']}h  {x['en']['title']}")
    elif not a.lab_id: ap.error('lab_id is required')
    elif a.command=='prepare': prepare(a.lab_id,a.base,a.language,a.force)
    else: raise SystemExit(check(a.lab_id,a.base))
if __name__=='__main__': main()

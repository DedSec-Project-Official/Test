#!/usr/bin/env python
"""Serve the DedSec Smartphone Academy locally from Termux."""
from __future__ import annotations
import argparse,http.server,os,shutil,socketserver,subprocess
from pathlib import Path
class Server(socketserver.TCPServer):allow_reuse_address=True
def main():
    if not (os.environ.get('TERMUX_VERSION') or 'com.termux' in os.environ.get('PREFIX','').lower()):raise SystemExit('This server launcher is designed for Termux.')
    p=argparse.ArgumentParser();p.add_argument('--host',default='127.0.0.1');p.add_argument('--port',type=int,default=8000);p.add_argument('--no-browser',action='store_true');a=p.parse_args();academy_root=Path(__file__).resolve().parent;os.chdir(academy_root.parent)
    with Server((a.host,a.port),http.server.SimpleHTTPRequestHandler) as s:
        url=f'http://127.0.0.1:{a.port}/Smartphone-Academy/Home.html';print(url)
        if not a.no_browser and shutil.which('termux-open-url'):subprocess.Popen(['termux-open-url',url])
        try:s.serve_forever()
        except KeyboardInterrupt:pass
if __name__=='__main__':main()

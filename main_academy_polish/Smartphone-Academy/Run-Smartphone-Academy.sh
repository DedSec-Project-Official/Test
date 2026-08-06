#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
command -v python >/dev/null 2>&1 || { echo 'Install Python with: pkg install python' >&2; exit 1; }
exec python Smartphone-Academy.py "$@"

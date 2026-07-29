#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
exec ./Run-Smartphone-Academy.sh serve "$@"

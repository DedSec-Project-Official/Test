#!/usr/bin/env sh
set -eu
HERE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BIN="$PREFIX/bin"
mkdir -p "$BIN"
chmod +x "$HERE/htb" "$HERE/redeem"
cp "$HERE/htb" "$BIN/htb"
cp "$HERE/redeem" "$BIN/redeem"
cp "$HERE/test.py" "$BIN/htb-test.py"
printf '%s\n' 'DedSec Smartphone Academy CLI installed for Termux.' 'Use: htb score | htb progress | htb redeem | htb test'

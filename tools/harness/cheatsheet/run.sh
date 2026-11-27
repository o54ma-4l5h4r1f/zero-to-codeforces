#!/bin/bash
# Cheat sheet harness. From the repo root:  bash tools/harness/cheatsheet/run.sh
# 1. gen.js writes src/pages/cheatsheet.html from spec*.txt and the tests from t*.in.cpp (into build/harness/cheatsheet/),
# 2. compiles the tests with sanitizers and runs them, 3. compiles and runs the full template card on a tiny input.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
OUT="$REPO/build/harness/cheatsheet"
mkdir -p "$OUT"
node "$HERE/gen.js" "$REPO" > "$OUT/gen.log" 2>&1 || { fold -w 200 "$OUT/gen.log"; echo "GEN FAILED/INCOMPLETE"; [ "$1" = force ] || exit 1; }
tail -5 "$OUT/gen.log" | fold -w 200
cd "$OUT"
g++ -std=c++17 -O1 -g -Wall -Wextra -Wno-unused -Wno-sign-compare -Wno-shadow -fsanitize=undefined,address -fno-sanitize-recover=undefined -o tests tests.cpp 2> compile.log || { grep -E 'error' -A6 compile.log | head -80; exit 1; }
echo "compiler warnings: $(grep -c warning compile.log || true)"
./tests
g++ -std=c++17 -Wall -Wextra -fsanitize=undefined,address -o full_template full_template.cpp && printf '3\n2\n1 2\n0\n\n1\n5\n' | ./full_template | tr '\n' ' '; echo

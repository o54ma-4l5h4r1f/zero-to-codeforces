#!/bin/bash
# usage: ./run.sh   -> regenerates the sheet + harness, compiles with sanitizers, runs
set -e
cd "$(dirname "$0")"
REPO=/mnt/c/Users/osama/CodeForces/zero-to-codeforces
node gen.js $REPO > gen.log 2>&1 || { cat gen.log | fold -w 200; echo "GEN FAILED/INCOMPLETE"; [ "$1" = force ] || exit 1; }
tail -5 gen.log | fold -w 200
g++ -std=c++17 -O1 -g -Wall -Wextra -Wno-unused -Wno-sign-compare -Wno-shadow -fsanitize=undefined,address -fno-sanitize-recover=undefined -o tests tests.cpp 2> compile.log || { grep -E 'error' -A6 compile.log | head -80; exit 1; }
grep -c warning compile.log || true
./tests
g++ -std=c++17 -Wall -Wextra -fsanitize=undefined,address -o full_template full_template.cpp && printf '3\n2\n1 2\n0\n\n1\n5\n' | ./full_template | tr '\n' ' '; echo

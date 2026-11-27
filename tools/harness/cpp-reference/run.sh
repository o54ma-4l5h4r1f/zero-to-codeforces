#!/bin/bash
# C++ reference harness. From the repo root:  bash tools/harness/cpp-reference/run.sh
# 1. gen.js writes src/pages/cpp-reference.html from ref.src, 2. harness.js compiles every card with sanitizers,
# runs it and checks each value written in a comment (// 7). Work files go to build/harness/cpp-reference/.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
node "$HERE/gen.js" "$HERE/ref.src" "$REPO/src/pages/cpp-reference.html"
node "$HERE/harness.js" "$REPO/src/pages/cpp-reference.html" "$@"

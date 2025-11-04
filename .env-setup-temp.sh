#!/usr/bin/env bash
set -euo pipefail
cd /home/runner/work/react-component-library/react-component-library
bun install --no-save
bunx playwright install --with-deps
bunx tsc -b

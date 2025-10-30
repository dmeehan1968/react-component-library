#!/usr/bin/env bash
set -euo pipefail

if [ -f node -- -e "require('fs').accessSync('.vscode/settings.json')" 2>/dev/null ]; then
  :
fi

if [ -f ./node_modules/.bin/eslint ]; then
  ./node_modules/.bin/eslint --version || true
fi

#!/usr/bin/env bash
set -euo pipefail

if command -v pnpm >/dev/null 2>&1; then
  pm=pnpm
elif command -v yarn >/dev/null 2>&1; then
  pm=yarn
else
  pm=npm
fi

corepack enable || true

if [ -f package.json ]; then
  if [ "$pm" = "pnpm" ]; then
    pnpm install
  elif [ "$pm" = "yarn" ]; then
    yarn install
  else
    npm ci || npm install
  fi
fi

if [ -f .nvmrc ]; then
  nvm install
  nvm use
fi

git config --global core.autocrlf input
git config --global pull.rebase false

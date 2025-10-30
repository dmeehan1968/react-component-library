#!/usr/bin/env bash
set -euo pipefail

# Pick package manager
if [ -f bun.lockb ] || grep -q '"packageManager": *"bun@' package.json 2>/dev/null; then
  pm=bun
elif [ -f pnpm-lock.yaml ]; then
  pm=pnpm
elif [ -f yarn.lock ]; then
  pm=yarn
else
  pm=npm
fi

# Enable corepack only if using pnpm/yarn
if [ "$pm" = "pnpm" ] || [ "$pm" = "yarn" ]; then
  corepack enable || true
fi

# Install deps
if [ -f package.json ]; then
  case "$pm" in
    bun) bun install ;;
    pnpm) pnpm install ;;
    yarn) yarn install ;;
    npm) npm ci || npm install ;;
  esac
fi

# Optional git defaults
git config --global core.autocrlf input || true
git config --global pull.rebase false || true
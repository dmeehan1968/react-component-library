#!/usr/bin/env bash
set -euo pipefail

# Install dependencies via Bun
bun install --no-interactive

# Install Playwright browsers and dependencies
bunx playwright install --with-deps

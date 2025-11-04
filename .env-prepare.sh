#!/bin/bash
set -euo pipefail
bun install --no-progress --frozen-lockfile
bunx playwright install --with-deps
bun --version
echo "\nEnvironment ready! Dependencies installed via Bun; Playwright browsers set up. You may now run builds or tests."
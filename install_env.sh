#!/usr/bin/env bash
set -euo pipefail
bun install --no-interactive && bunx playwright install --with-deps --no-interactive
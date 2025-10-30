#!/usr/bin/env bash
set -euo pipefail
bun install --no-progress --silent
echo "Bun version: $(bun --version)"
echo "Dependencies installed. Run 'bun test' to execute the test suite."

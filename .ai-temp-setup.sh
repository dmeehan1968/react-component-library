#!/bin/bash
set -euo pipefail

# Ensure the right Bun version is installed
if [[ "$(bun --version)" != 1.3.* ]]; then
    echo "[ERROR] Bun 1.3.x required. Current: $(bun --version)" >&2
    exit 1
fi

# Install all dependencies (prod & dev)
bun install --no-interactive

# Playwright dependencies install (required for playwright-ct, with browsers)
bun run pw:install

echo "Environment is ready. All dependencies installed."

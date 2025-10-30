#!/bin/bash
set -euo pipefail

export CI=1

echo "This project requires Bun 1.3.x (ideally 1.3.0). Please ensure 'bun --version' outputs 1.3.x."

bun install --no-interactive

echo "Bun version: $(bun --version)"
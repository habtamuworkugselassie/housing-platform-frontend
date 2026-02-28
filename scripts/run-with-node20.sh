#!/usr/bin/env bash
# Ensures Node 20 is used (for nvm users). Run: ./scripts/run-with-node20.sh <command>
cd "$(dirname "$0")/.."
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 20 2>/dev/null || nvm use default
fi
exec "$@"

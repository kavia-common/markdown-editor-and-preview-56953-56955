#!/usr/bin/env bash
set -euo pipefail

# Run the React frontend (CRA).
# Supports overriding PORT via env var (defaults to CRA's 3000 if unset).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/markdown-editor-and-preview-56953-56955/react_frontend"

cd "${FRONTEND_DIR}"

if [[ ! -d "node_modules" ]]; then
  echo "[frontend] node_modules not found. Run ./scripts/frontend_install.sh first."
  exit 1
fi

echo "[frontend] Starting dev server..."
exec npm start

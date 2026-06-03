#!/usr/bin/env bash
set -euo pipefail

# Install frontend dependencies.
# Note: we use `npm install` (not npm ci) due to possible lockfile mismatch in this repo.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/markdown-editor-and-preview-56953-56955/react_frontend"

cd "${FRONTEND_DIR}"

echo "[frontend] npm install..."
npm install

echo "[frontend] Done."

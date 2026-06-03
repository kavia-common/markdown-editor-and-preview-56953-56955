# react_frontend

Split-screen Markdown editor (left) with live preview (right) and a header note selector.

## Environment

This container already provides a `.env` with:

- `REACT_APP_API_BASE` (or `REACT_APP_BACKEND_URL`) — backend base URL (FastAPI, typically `:3001`)

## Expected Backend Endpoints

The UI calls:

- `POST /parse_markdown` with body `{ "markdown": "..." }` → expects `{ "html": "<p>...</p>" }` (or `{ rendered_html: ... }`)
- `GET /notes` → expects `{ "notes": [{ "id": "...", "title": "..." }] }` (or a direct array)
- `GET /notes/{id}` → expects `{ "id": "...", "title": "...", "markdown": "..." }`

## Run (dev)

```bash
npm install
npm start
```
"

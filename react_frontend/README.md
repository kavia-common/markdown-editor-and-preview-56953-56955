# react_frontend

Split-screen Markdown editor (left) with live preview (right) and a header note selector.

## Environment

This container already provides a `.env` with:

- `REACT_APP_API_BASE` (or `REACT_APP_BACKEND_URL`) — backend base URL (FastAPI, typically `:3001`)

### Base URL vs proxy (important)

By default, this React app is configured with a development **proxy** in `package.json`:

- `proxy: "http://localhost:3001"`

That means if you do **not** set `REACT_APP_API_BASE` / `REACT_APP_BACKEND_URL`, browser requests to
`/parse_markdown`, `/notes`, etc. will be proxied to the backend at `http://localhost:3001`.

If you *do* set `REACT_APP_API_BASE` (or `REACT_APP_BACKEND_URL`), the app will call that origin
directly and the backend must allow CORS for your frontend origin.

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

## Convenience scripts (repo root)

From the repository root, you can also use:

```bash
./scripts/frontend_install.sh
./scripts/frontend_run.sh
```

## End-to-end smoke check

1) Start the FastAPI backend (it should expose Swagger at `/docs` and OpenAPI JSON at `/openapi.json`).
2) Start this React frontend (`npm start`).
3) Verify:
   - Typing in the left pane updates the right preview (calls `POST /parse_markdown`).
   - The Notes selector populates (calls `GET /notes`).
   - Selecting a note loads it into the editor (calls `GET /notes/{id}`).

If the UI shows a preview error or notes error:
- If you are relying on the proxy, confirm the backend is reachable at `http://localhost:3001`.
- If you set `REACT_APP_API_BASE`, confirm it points to the backend and that backend CORS is configured
  to allow your frontend origin.
"

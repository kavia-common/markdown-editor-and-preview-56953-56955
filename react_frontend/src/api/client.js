/**
 * Simple backend API client.
 * Uses REACT_APP_API_BASE (or REACT_APP_BACKEND_URL) if set; otherwise defaults to same-origin.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function getApiBase() {
  return (
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    ""
  ).replace(/\/+$/, "");
}

/**
 * Internal helper for JSON fetch with timeout and helpful error messages.
 */
async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${getApiBase()}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg =
        (data && (data.detail || data.message)) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// PUBLIC_INTERFACE
export async function parseMarkdown(markdown) {
  /** Send markdown to backend for parsing/rendering. Returns { html: string } or similar payload. */
  return fetchJson("/parse_markdown", {
    method: "POST",
    body: JSON.stringify({ markdown })
  });
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Fetch list of saved notes. Expected to return { notes: [{id,title,updated_at?}] } or array. */
  return fetchJson("/notes", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getNote(noteId) {
  /** Fetch a single note by id. Expected endpoint: GET /notes/{id}. */
  return fetchJson(`/notes/${encodeURIComponent(noteId)}`, { method: "GET" });
}

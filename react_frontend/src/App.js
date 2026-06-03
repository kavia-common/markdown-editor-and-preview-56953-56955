import React, { useEffect, useMemo, useState } from "react";
import { getNote, listNotes, parseMarkdown } from "./api/client";
import { useDebouncedValue } from "./utils/useDebouncedValue";

const DEFAULT_MARKDOWN = `# Markdown Editor

Type on the **left**, see a live preview on the **right**.

- Backend-rendered preview (via FastAPI)
- Notes list in the header (load a saved note)

\`\`\`js
console.log("hello");
\`\`\`
`;

// Small sanitizer-free approach: backend is expected to return safe HTML for this toy app.
// In a production app, sanitize server output or render markdown client-side with a safe renderer.
function Preview({ html, isLoading, error }) {
  if (error) {
    return (
      <div className="panel panelPreview">
        <div className="panelHeader">Preview</div>
        <div className="panelBody">
          <div className="callout calloutError">
            <div className="calloutTitle">Preview error</div>
            <div className="calloutBody">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel panelPreview">
      <div className="panelHeader">
        Preview
        {isLoading ? <span className="spinner" aria-label="Loading" /> : null}
      </div>
      <div className="panelBody">
        <div
          className="previewContent"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      </div>
    </div>
  );
}

function Editor({ value, onChange }) {
  return (
    <div className="panel panelEditor">
      <div className="panelHeader">Markdown</div>
      <div className="panelBody">
        <textarea
          className="editorTextarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck="false"
          aria-label="Markdown editor"
        />
      </div>
    </div>
  );
}

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const debouncedMarkdown = useDebouncedValue(markdown, 250);

  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState("");

  const apiBaseDisplay = useMemo(() => {
    const base =
      process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "";
    return base || "(same-origin/proxy)";
  }, []);

  // Load notes on startup
  useEffect(() => {
    let mounted = true;

    async function load() {
      setNotesLoading(true);
      setNotesError("");
      try {
        const data = await listNotes();

        // Accept either {notes:[...]} or direct array for flexibility.
        const list = Array.isArray(data) ? data : data?.notes || [];
        if (mounted) setNotes(list);
      } catch (e) {
        if (mounted) setNotesError(e.message || "Failed to load notes");
      } finally {
        if (mounted) setNotesLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Re-render preview whenever debounced markdown changes
  useEffect(() => {
    let mounted = true;

    async function render() {
      setPreviewLoading(true);
      setPreviewError("");
      try {
        const data = await parseMarkdown(debouncedMarkdown);
        const html = data?.html ?? data?.rendered_html ?? "";
        if (mounted) setPreviewHtml(html);
      } catch (e) {
        if (mounted) {
          setPreviewHtml("");
          setPreviewError(e.message || "Failed to render preview");
        }
      } finally {
        if (mounted) setPreviewLoading(false);
      }
    }

    render();
    return () => {
      mounted = false;
    };
  }, [debouncedMarkdown]);

  async function onSelectNote(e) {
    const noteId = e.target.value;
    setSelectedNoteId(noteId);

    if (!noteId) return;

    setNotesError("");
    try {
      const note = await getNote(noteId);
      const nextMarkdown = note?.markdown ?? note?.content ?? "";
      setMarkdown(nextMarkdown);
    } catch (err) {
      setNotesError(err.message || "Failed to load note");
    }
  }

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="brand">
          <div className="brandTitle">Markdown Editor</div>
          <div className="brandMeta">API: {apiBaseDisplay}</div>
        </div>

        <div className="headerControls">
          <label className="selectLabel" htmlFor="noteSelect">
            Notes
          </label>
          <select
            id="noteSelect"
            className="noteSelect"
            value={selectedNoteId}
            onChange={onSelectNote}
            disabled={notesLoading}
            aria-label="Select saved note"
          >
            <option value="">— Select a note —</option>
            {notes.map((n) => (
              <option key={n.id ?? n.note_id ?? n.title} value={n.id ?? n.note_id}>
                {n.title || n.name || `Note ${n.id ?? n.note_id}`}
              </option>
            ))}
          </select>

          {notesLoading ? <span className="pill">Loading…</span> : null}
          {notesError ? (
            <span className="pill pillError" title={notesError}>
              Notes error
            </span>
          ) : null}
        </div>
      </header>

      <main className="appMain" role="main">
        <div className="split">
          <Editor value={markdown} onChange={setMarkdown} />
          <Preview html={previewHtml} isLoading={previewLoading} error={previewError} />
        </div>
      </main>

      <footer className="appFooter">
        <span>
          Tip: preview updates as you type. Notes are loaded from the backend.
        </span>
      </footer>
    </div>
  );
}

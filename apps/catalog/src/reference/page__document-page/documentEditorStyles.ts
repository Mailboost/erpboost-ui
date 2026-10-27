// Reference example: https://ui.tailor.tech/page/document-page
// Radix Tooltip / Popover render at z-50. Tippy defaults to z-index 9999,
// which would put the bubble / floating menus in front of tooltips and hide
// their labels on hover. The menus only overlay the document body, so z-30
// is enough.
export const FLOATING_MENU_Z_INDEX = 30;

// Strips tiptap's default chrome so the editor renders as "the page body
// itself". Horizontal padding is owned by the surrounding column.
export const documentSurfaceStyles = `
.document-surface .ProseMirror {
  outline: none;
  color: var(--foreground);
  font-size: 1rem;
  line-height: 1.75;
  min-height: 60vh;
  padding: 0;
}
.document-surface .ProseMirror > * + * {
  margin-top: 0.9em;
}
.document-surface .ProseMirror p {
  margin: 0;
}
.document-surface .ProseMirror h1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  margin-top: 0;
}
.document-surface .ProseMirror h2 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.005em;
  margin-top: 1.6em;
}
.document-surface .ProseMirror h3 {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 1.4em;
}
.document-surface .ProseMirror strong {
  font-weight: 700;
}
.document-surface .ProseMirror em {
  font-style: italic;
}
.document-surface .ProseMirror s {
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
  opacity: 0.8;
}
.document-surface .ProseMirror code {
  background: var(--muted);
  color: var(--foreground);
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
  border: 1px solid var(--border);
}
.document-surface .ProseMirror pre {
  background: oklch(0.18 0.01 250);
  color: oklch(0.95 0.005 250);
  padding: 1rem 1.1rem;
  border-radius: 0.5rem;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
  line-height: 1.6;
  overflow-x: auto;
}
.document-surface .ProseMirror pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border: 0;
  border-radius: 0;
  font-size: inherit;
  display: block;
  white-space: pre;
}
.document-surface .ProseMirror ul,
.document-surface .ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0;
}
.document-surface .ProseMirror ul {
  list-style: disc;
}
.document-surface .ProseMirror ol {
  list-style: decimal;
}
.document-surface .ProseMirror ul ul {
  list-style: circle;
}
.document-surface .ProseMirror ul ul ul {
  list-style: square;
}
.document-surface .ProseMirror li {
  margin: 0.25em 0;
}
.document-surface .ProseMirror li > p {
  margin: 0;
}
.document-surface .ProseMirror blockquote {
  border-left: 3px solid var(--border);
  padding: 0.25rem 0 0.25rem 1rem;
  color: var(--muted-foreground);
  font-style: italic;
}
.document-surface .ProseMirror blockquote p {
  margin: 0;
}
.document-surface .ProseMirror hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 1.5em 0;
}
.document-surface .ProseMirror h2,
.document-surface .ProseMirror h3 {
  scroll-margin-top: 5rem;
}
.document-surface.is-preview .ProseMirror h2[id],
.document-surface.is-preview .ProseMirror h3[id] {
  position: relative;
}
.document-surface .ProseMirror a {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.document-surface .ProseMirror .page-embed {
  margin: 0.9em 0;
}
.document-surface .ProseMirror .page-embed a {
  color: inherit;
  text-decoration: none;
  text-underline-offset: unset;
}
.document-surface .ProseMirror .page-mention {
  vertical-align: baseline;
}
.document-surface .ProseMirror .page-mention a {
  color: inherit;
  text-decoration: none;
}
.document-surface .ProseMirror .page-mention a:hover span {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.document-surface .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--muted-foreground);
  pointer-events: none;
  float: left;
  height: 0;
}
`;

// Reference example: https://ui.tailor.tech/patterns/rich-text-editor
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { AnyExtension, Editor, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
} from "lucide-react";
import { Button } from "@mailboost/erpboost-ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  /** Stringified Tiptap JSON, plain text, or null/undefined for empty */
  value?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  /** Extra Tiptap extensions (e.g. image upload) layered on top of the base set */
  extraExtensions?: AnyExtension[];
  /** Called once the editor instance is ready */
  onEditorReady?: (editor: Editor) => void;
};

// ---------------------------------------------------------------------------
// Document helpers
// ---------------------------------------------------------------------------

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

function plainTextToDoc(text: string): JSONContent {
  return {
    type: "doc",
    content: text
      .split("\n")
      .map((line) =>
        line
          ? { type: "paragraph", content: [{ type: "text", text: line }] }
          : { type: "paragraph" },
      ),
  };
}

function lexicalToDoc(lexical: { root?: { children?: unknown[] } }): JSONContent {
  const paragraphs: JSONContent[] = [];
  for (const node of lexical.root?.children ?? []) {
    if (typeof node !== "object" || node === null) continue;
    const n = node as { type?: string; children?: { text?: string }[] };
    const text = (n.children ?? []).map((c) => c.text ?? "").join("");
    paragraphs.push(
      text ? { type: "paragraph", content: [{ type: "text", text }] } : { type: "paragraph" },
    );
  }
  return { type: "doc", content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }] };
}

function parseValue(value: string | null | undefined): JSONContent {
  if (!value) return EMPTY_DOC;
  try {
    const parsed = JSON.parse(value) as JSONContent | { root?: { children?: unknown[] } };
    if ((parsed as JSONContent).type === "doc") return parsed as JSONContent;
    if ((parsed as { root?: unknown }).root) {
      return lexicalToDoc(parsed as { root?: { children?: unknown[] } });
    }
  } catch {
    // not JSON — treat as plain text
  }
  return plainTextToDoc(value);
}

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "sms:", "tel:"];
const URL_LIKE = /^[a-zA-Z][a-zA-Z0-9+-.]*:\/\//;

function validateUrl(href: string): boolean {
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(href).protocol);
  } catch {
    return URL_LIKE.test(href);
  }
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function Toolbar({ editor }: { editor: Editor | null }) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (!editor) return;
    editor.on("transaction", forceUpdate);
    return () => { editor.off("transaction", forceUpdate); };
  }, [editor]);

  const toggleLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "https://";
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return <div className="h-9 border-b bg-muted" />;

  const btn = (active: boolean) =>
    (active ? "default" : "ghost") as "default" | "ghost";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted p-1">
      <Button type="button" variant={btn(editor.isActive("heading", { level: 1 }))} size="xs"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button type="button" variant={btn(editor.isActive("heading", { level: 2 }))} size="xs"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button type="button" variant={btn(editor.isActive("heading", { level: 3 }))} size="xs"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden />

      <Button type="button" variant={btn(editor.isActive("bold"))} size="xs"
        onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" variant={btn(editor.isActive("italic"))} size="xs"
        onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" variant={btn(editor.isActive("underline"))} size="xs"
        onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant={btn(editor.isActive("strike"))} size="xs"
        onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden />

      <Button type="button" variant={btn(editor.isActive("bulletList"))} size="xs"
        onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        <List className="h-4 w-4" />
      </Button>
      <Button type="button" variant={btn(editor.isActive("orderedList"))} size="xs"
        onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden />

      <Button type="button" variant={btn(editor.isActive("link"))} size="xs"
        onClick={toggleLink} title="Link">
        <LinkIcon className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden />

      <Button type="button" variant="ghost" size="xs"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert table">
        <TableIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const editorContentStyles = `
.rich-text-editor .ProseMirror {
  min-height: 240px;
  padding: 0.75rem 1rem;
  outline: none;
  font-size: 0.875rem;
  line-height: 1.7;
}
.rich-text-editor .ProseMirror > * + * { margin-top: 0.75em; }
.rich-text-editor .ProseMirror p { margin: 0; }
.rich-text-editor .ProseMirror h1 { font-size: 1.75rem; font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; }
.rich-text-editor .ProseMirror h2 { font-size: 1.375rem; font-weight: 700; line-height: 1.3; padding-bottom: 0.25em; border-bottom: 1px solid var(--border); }
.rich-text-editor .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; line-height: 1.35; }
.rich-text-editor .ProseMirror strong { font-weight: 700; }
.rich-text-editor .ProseMirror em { font-style: italic; }
.rich-text-editor .ProseMirror u { text-decoration: underline; text-underline-offset: 2px; }
.rich-text-editor .ProseMirror s { text-decoration: line-through; text-decoration-thickness: 1.5px; opacity: 0.8; }
.rich-text-editor .ProseMirror a { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }
.rich-text-editor .ProseMirror ul, .rich-text-editor .ProseMirror ol { padding-left: 1.5rem; margin: 0; }
.rich-text-editor .ProseMirror ul { list-style: disc; }
.rich-text-editor .ProseMirror ol { list-style: decimal; }
.rich-text-editor .ProseMirror ul ul { list-style: circle; }
.rich-text-editor .ProseMirror li { margin: 0.2em 0; }
.rich-text-editor .ProseMirror li > p { margin: 0; }
.rich-text-editor .ProseMirror > .tableWrapper { margin-top: 0.65625em; }
.rich-text-editor .ProseMirror table { width: 100%; border-collapse: collapse; margin: 0.75em 0; font-size: 0.875em; }
.rich-text-editor .ProseMirror th, .rich-text-editor .ProseMirror td { border: 1px solid var(--border); padding: 0.375rem 0.5rem; vertical-align: top; }
.rich-text-editor .ProseMirror th { background: var(--muted); font-weight: 600; text-align: left; }
.rich-text-editor .ProseMirror .selectedCell::after { background: rgba(200, 200, 255, 0.4); content: ""; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none; position: absolute; z-index: 2; }
.rich-text-editor .ProseMirror td, .rich-text-editor .ProseMirror th { position: relative; }
.rich-text-editor .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--muted-foreground); pointer-events: none; float: left; height: 0; }
`;

// ---------------------------------------------------------------------------
// Default demo content (Tiptap JSON)
// ---------------------------------------------------------------------------

const defaultValue = JSON.stringify({
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Rich text editor" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "An editor built with tiptap (" },
        { type: "text", marks: [{ type: "code" }], text: "@tiptap/react" },
        { type: "text", text: " + " },
        { type: "text", marks: [{ type: "code" }], text: "StarterKit" },
        { type: "text", text: "). It supports " },
        { type: "text", marks: [{ type: "bold" }], text: "bold" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "italic" }], text: "italic" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "underline" }], text: "underline" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "strike" }], text: "strikethrough" },
        { type: "text", text: ", and " },
        { type: "text", marks: [{ type: "link", attrs: { href: "https://tiptap.dev", target: "_blank" } }], text: "links" },
        { type: "text", text: "." },
      ],
    },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Lists" }] },
    {
      type: "bulletList",
      content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First bullet item" }] }] },
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Second bullet item" }] },
            { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Nested item" }] }] }] },
          ],
        },
      ],
    },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Tables" }] },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Name" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Role" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Department" }] }] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Alex Murphy" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Engineer" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Product" }] }] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Dana Lewis" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Designer" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "UX" }] }] },
          ],
        },
      ],
    },
  ],
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const RichTextEditor = ({
  value = defaultValue,
  onChange,
  placeholder = "Type here...",
  readOnly = false,
  className,
  extraExtensions,
  onEditorReady,
}: Props) => {
  const initialContent = useMemo(() => parseValue(value), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false, trailingNode:false }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        validate: validateUrl,
        HTMLAttributes: { class: "text-primary underline underline-offset-2 hover:cursor-pointer" },
      }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      ...(extraExtensions ?? []),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor: instance }) => {
      onChange?.(JSON.stringify(instance.getJSON()));
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  // Sync externally-loaded value changes (e.g. async-fetched data)
  useEffect(() => {
    if (!editor || editor.isDestroyed || value === undefined) return;
    const next = parseValue(value);
    if (JSON.stringify(editor.getJSON()) === JSON.stringify(next)) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className={`rich-text-editor flex flex-col overflow-hidden rounded-xl border bg-background${className ? ` ${className}` : ""}`}>
      <style>{editorContentStyles}</style>
      {!readOnly && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
      {!readOnly && (
        <footer className="flex items-center justify-between border-t bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
          <span>{editor.storage.characterCount?.characters?.() ?? "—"} characters</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => editor.commands.clearContent()}>
              Clear
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </footer>
      )}
    </div>
  );
};

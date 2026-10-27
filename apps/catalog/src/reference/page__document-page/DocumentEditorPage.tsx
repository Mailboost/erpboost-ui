// Reference example: https://ui.tailor.tech/page/document-page
import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import "highlight.js/styles/github-dark.css";
import { ChevronRight, FolderInput, Tag } from "lucide-react";
import { Avatar, Badge, Button, Tooltip } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";
import { DocumentEditorBubbleToolbar } from "./DocumentEditorBubbleToolbar";
import { DocumentEditorInsertMenu } from "./DocumentEditorInsertMenu";
import { PageEmbed, PageMention } from "./DocumentEditorPageEmbed";
import { DocumentEditorSidebar } from "./DocumentEditorSidebar";
import { DocumentHeading } from "./documentEditorHeading";
import { DocumentEditorLink, setPageHrefResolver } from "./documentEditorLink";
import { DocumentPageRegistryProvider } from "./DocumentPageRegistryContext";
import { DocumentPreviewHeadingAnchors } from "./DocumentPreviewHeadingAnchors";
import {
  normalizePageId,
  resolvePageReference,
  type WikiDocSnapshot,
} from "./documentPageRegistry";
import {
  buildInitialDocs,
  findDocPath,
  initialSelectedDocId,
  sampleCollaborators,
  sampleDocTree,
  type DocBody,
} from "./documentEditorSampleDocs";
import { documentSurfaceStyles } from "./documentEditorStyles";
import { scrollToHeadingInEditor } from "./documentEditorUrl";

const lowlight = createLowlight(common);

const tiptapExtensions = [
  StarterKit.configure({ codeBlock: false, heading: false, link: false, underline:false, trailingNode:false }),
  DocumentHeading,
  DocumentEditorLink,
  PageEmbed,
  PageMention,
  CodeBlockLowlight.configure({ lowlight }),
];

type Mode = "preview" | "edit-body";

const CollaboratorStack = () => (
  <div className="flex -space-x-2" aria-label="Collaborators">
    {sampleCollaborators.map((c) => (
      <Avatar.Root
        key={c.name}
        className="size-7 border-2 border-background bg-muted text-[11px] font-medium text-muted-foreground"
      >
        <Avatar.Fallback>{c.initial}</Avatar.Fallback>
      </Avatar.Root>
    ))}
  </div>
);

const UnsavedIndicator = () => (
  <span className="inline-flex items-center gap-1.5 text-xs text-amber-600">
    <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
    Unsaved changes
  </span>
);

const TopBarIconButton = ({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Tooltip.Root>
    <Tooltip.Trigger
      render={
        <Button
          type="button"
          variant="ghost"
          size="xs"
          aria-label={label}
          onClick={onClick}
          className="aspect-square size-7 shrink-0 p-0 text-muted-foreground hover:bg-accent/60 hover:text-foreground [&_svg]:size-3.5"
        >
          {children}
        </Button>
      }
    />
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip.Root>
);

export const DocumentEditorPage = ({
  sidebarLeftAccessory,
}: {
  sidebarLeftAccessory?: React.ReactNode;
} = {}) => {
  const [mode, setMode] = useState<Mode>("preview");
  const [docs, setDocs] = useState<Record<string, DocBody>>(buildInitialDocs);
  const [selectedDocId, setSelectedDocId] = useState(initialSelectedDocId);

  const wikiDocs: WikiDocSnapshot = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(docs).map(([id, doc]) => [id, { title: doc.title }]),
      ),
    [docs],
  );

  const selectDocRef = useRef<(id: string) => void>(() => {});
  const titleInputRef = useRef<HTMLInputElement>(null);
  const docsRef = useRef(docs);
  docsRef.current = docs;

  // Snapshot taken when entering edit mode (body HTML + title). Cancelling
  // rolls back to it; the dirty flag is just a diff against it.
  const [snapshot, setSnapshot] = useState(() => ({
    html: docs[initialSelectedDocId].html,
    title: docs[initialSelectedDocId].title,
  }));

  // tiptap mutates its document outside React; bump a counter on each update
  // so derived values (dirty check) re-evaluate.
  const [editorRev, setEditorRev] = useState(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: docs[initialSelectedDocId].html,
    editable: false,
    editorProps: {
      handleClick: (view, _pos, event) => {
        if (modeRef.current !== "preview") return false;
        const target = event.target;
        if (!(target instanceof Element)) return false;

        // Internal page links switch the sidebar selection in this demo.
        const pageLink = target.closest("a[data-page-id]");
        const pageId = pageLink?.getAttribute("data-page-id");
        const id = pageId ? normalizePageId(pageId) : null;
        if (id && id in docsRef.current) {
          event.preventDefault();
          selectDocRef.current(id);
          return true;
        }

        // Same-document heading anchors scroll within the editor surface.
        const anchor = target.closest("a");
        const href = anchor?.getAttribute("href");
        if (!href?.startsWith("#")) return false;
        event.preventDefault();
        scrollToHeadingInEditor(view.dom, href.slice(1));
        return true;
      },
    },
    onUpdate: () => setEditorRev((r) => r + 1),
  });

  useEffect(() => {
    editor?.setEditable(mode === "edit-body");
  }, [editor, mode]);

  useEffect(() => {
    if (mode !== "edit-body") return;
    const id = requestAnimationFrame(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [mode, selectedDocId]);

  // Keep `a[data-page-id]` hrefs resolved against the latest titles.
  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      if (!editor.isDestroyed) setPageHrefResolver(editor, (pageId) => resolvePageReference(pageId, wikiDocs).href);
    };
    sync();
    editor.on("mount", sync);
    return () => { editor.off("mount", sync); };
  }, [editor, wikiDocs]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || mode !== "preview") return;

    const scrollFromHash = () => {
      const raw = window.location.hash.slice(1);
      if (!raw) return;
      scrollToHeadingInEditor(editor.view.dom, raw);
    };

    scrollFromHash();
    window.addEventListener("hashchange", scrollFromHash);
    return () => window.removeEventListener("hashchange", scrollFromHash);
  }, [editor, mode, selectedDocId, editorRev]);

  const breadcrumb = useMemo(
    () => findDocPath(sampleDocTree, selectedDocId, docs),
    [selectedDocId, docs],
  );

  // editorRev is the (intentionally unused) dependency that forces re-reads.
  const currentHtml = useMemo(
    () => editor?.getHTML() ?? "",
    [editor, editorRev],
  );

  const bodyColumnRef = useRef<HTMLDivElement>(null);

  const handleSelectDoc = (id: string) => {
    if (!editor) return;
    if (id === selectedDocId) return;
    const next = docs[id];
    if (!next) return;
    setSelectedDocId(id);
    editor.commands.setContent(next.html, { emitUpdate: false });
    setSnapshot({ html: editor.getHTML(), title: next.title });
    setMode("preview");
  };

  selectDocRef.current = handleSelectDoc;

  if (!editor) return null;

  const title = docs[selectedDocId].title;
  const dirty =
    mode === "edit-body" &&
    (currentHtml !== snapshot.html || title !== snapshot.title);

  const updateDocTitle = (nextTitle: string) => {
    setDocs((d) => ({
      ...d,
      [selectedDocId]: { ...d[selectedDocId], title: nextTitle },
    }));
  };

  const enterEditBody = () => {
    // The raw source HTML and tiptap's normalized getHTML() output are
    // different strings. Baseline on the normalized output at the moment of
    // entering edit mode, or the document would look dirty untouched.
    setSnapshot({ html: editor.getHTML(), title: docs[selectedDocId].title });
    setMode("edit-body");
  };

  const handleSave = () => {
    const html = editor.getHTML();
    const savedTitle = docs[selectedDocId].title;
    setSnapshot({ html, title: savedTitle });
    setDocs((d) => ({
      ...d,
      [selectedDocId]: { title: savedTitle, html },
    }));
    setMode("preview");
  };

  const handleCancel = () => {
    editor.commands.setContent(snapshot.html, { emitUpdate: false });
    setDocs((d) => ({
      ...d,
      [selectedDocId]: { ...d[selectedDocId], title: snapshot.title },
    }));
    setMode("preview");
  };

  return (
    <DocumentPageRegistryProvider
      wikiDocs={wikiDocs}
      onNavigateToWikiDoc={handleSelectDoc}
    >
      <div className="flex h-full min-h-0 w-full overflow-hidden bg-card">
        <style>{documentSurfaceStyles}</style>
        <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
          <DocumentEditorSidebar
            tree={sampleDocTree}
            selectedId={selectedDocId}
            docTitles={wikiDocs}
            onSelect={handleSelectDoc}
            leftAccessory={sidebarLeftAccessory}
          />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-card">
          <div className="flex w-full shrink-0 flex-nowrap items-center justify-between gap-x-4 px-6 py-2 text-xs text-muted-foreground md:px-10">
            <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-x-4 overflow-hidden">
              <nav
                aria-label="Document location"
                className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden"
              >
                {breadcrumb.map((name, i) => (
                  <span key={i} className="inline-flex min-w-0 items-center gap-1">
                    {i > 0 ? (
                      <ChevronRight
                        className="size-3 shrink-0 text-muted-foreground/50"
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className={cn(
                        "truncate",
                        i === breadcrumb.length - 1
                          ? "text-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {name}
                    </span>
                  </span>
                ))}
              </nav>
              {mode === "preview" ? (
                <div className="flex shrink-0 flex-nowrap items-center gap-3">
                  <CollaboratorStack />
                  <span>Updated by Yamada 2 hours ago</span>
                  <Badge variant="outline-neutral" className="text-[10px]">
                    Draft
                  </Badge>
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-nowrap items-center gap-2">
              {mode === "edit-body" ? (
                <div
                  key="doc-edit-actions"
                  className="flex shrink-0 flex-nowrap items-center gap-2"
                >
                  {dirty ? <UnsavedIndicator /> : null}
                  <Button variant="ghost" size="sm" type="button" onClick={handleCancel}>
                    Discard
                  </Button>
                  <Button size="sm" type="button" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              ) : (
                <div
                  key="doc-preview-actions"
                  className="flex shrink-0 flex-nowrap items-center gap-2"
                >
                  <Tooltip.Provider>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <TopBarIconButton label="Move to another folder">
                        <FolderInput aria-hidden />
                      </TopBarIconButton>
                      <TopBarIconButton label="Add tags">
                        <Tag aria-hidden />
                      </TopBarIconButton>
                    </div>
                  </Tooltip.Provider>
                  <Button variant="default" size="sm" type="button" onClick={enterEditBody}>
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* Title and body share the same max-w-3xl wrapper so the title's
              left edge lines up with the body's left edge. */}
          <div className="mx-auto w-full max-w-3xl px-6 md:px-10">
            <header className="flex w-full shrink-0 items-start gap-3 pb-3 pt-8">
              {mode === "edit-body" ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => updateDocTitle(e.target.value)}
                  placeholder="Untitled document"
                  aria-label="Document title"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[28px] font-bold tracking-tight leading-tight text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-0"
                />
              ) : (
                <h1 className="min-w-0 flex-1 text-[28px] font-bold tracking-tight leading-tight">
                  <button
                    type="button"
                    onClick={enterEditBody}
                    aria-label="Edit document"
                    className="w-full cursor-text text-left"
                  >
                    {title ? (
                      title
                    ) : (
                      <span className="text-muted-foreground/60">Untitled document</span>
                    )}
                  </button>
                </h1>
              )}
            </header>
            <div ref={bodyColumnRef} className="relative min-w-0">
              <div className="mt-4 h-4 shrink-0" aria-hidden />
              <div
                className={cn(
                  "document-surface relative pb-24",
                  mode === "preview" && "is-preview",
                )}
              >
                <DocumentEditorBubbleToolbar
                  editor={editor}
                  menusActive={mode === "edit-body"}
                />
                <DocumentEditorInsertMenu
                  editor={editor}
                  bodyColumnRef={bodyColumnRef}
                  menusActive={mode === "edit-body"}
                />
                <DocumentPreviewHeadingAnchors
                  editor={editor}
                  docId={selectedDocId}
                  active={mode === "preview"}
                />
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </DocumentPageRegistryProvider>
  );
};

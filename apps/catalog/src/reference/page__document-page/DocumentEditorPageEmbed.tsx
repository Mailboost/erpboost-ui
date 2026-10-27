// Reference example: https://ui.tailor.tech/page/document-page
import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type Editor,
  type NodeViewProps,
} from "@tiptap/react";
import { AlertCircle, ExternalLink, FileText, X } from "lucide-react";
import { Button } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";
import { blockInsertionPoint } from "./documentEditorBlocks";
import { useDocumentPageRegistry } from "./DocumentPageRegistryContext";
import { normalizePageId, parsePageReferenceAttrs } from "./documentPageRegistry";

/**
 * Page embed (block card) and page mention (inline chip) nodes. Both persist
 * a stable `data-page-id` for internal pages (or `data-href` for external
 * URLs) and resolve title / URL at render time via the page registry, so
 * renames never go stale. Missing ids render a broken-link state instead of
 * silently dropping the reference.
 */

export type PageReferenceAttrs = {
  /** Stable internal page id. Empty when `href` is set (external). */
  pageId: string;
  /** External URL only — takes precedence over pageId. */
  href?: string;
};

export type PageEmbedAttrs = PageReferenceAttrs;

const tryHostname = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const usePageReference = (attrs: PageReferenceAttrs) => {
  const { resolvePage, onNavigateToWikiDoc } = useDocumentPageRegistry();
  const isExternal = Boolean(attrs.href);
  const pageId = isExternal ? attrs.pageId : normalizePageId(attrs.pageId);
  const resolved =
    !isExternal && pageId ? resolvePage(pageId) : null;

  return {
    isExternal,
    title: isExternal
      ? tryHostname(attrs.href!) ?? attrs.href!
      : resolved?.title ?? pageId,
    hostname: isExternal ? tryHostname(attrs.href!) : null,
    kind: resolved?.kind,
    pageId,
    onNavigateToWikiDoc,
    canNavigate:
      !isExternal &&
      resolved?.kind === "wiki" &&
      Boolean(onNavigateToWikiDoc),
  };
};

const PageEmbedNodeView = ({
  node,
  selected,
  deleteNode,
  editor,
}: NodeViewProps) => {
  const attrs = node.attrs as PageEmbedAttrs;
  const {
    isExternal,
    title,
    hostname,
    kind,
    pageId,
    onNavigateToWikiDoc,
    canNavigate,
  } = usePageReference(attrs);
  const missing = !isExternal && kind === "missing";

  const cardInner = (
    <>
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
        {missing ? (
          <AlertCircle className="size-4 text-destructive" aria-hidden />
        ) : isExternal ? (
          <ExternalLink className="size-4" aria-hidden />
        ) : (
          <FileText className="size-4" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1 pr-6">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "truncate text-sm font-semibold text-foreground",
              missing && "text-muted-foreground line-through",
            )}
          >
            {title}
          </span>
          {!missing && !isExternal ? (
            <FileText
              className="size-3 shrink-0 text-muted-foreground"
              aria-hidden
            />
          ) : null}
        </span>
        {hostname ? (
          <span className="mt-1 block truncate font-mono text-[11px] text-muted-foreground">
            {hostname}
          </span>
        ) : missing ? (
          <span className="mt-1 block truncate font-mono text-[11px] text-muted-foreground">
            {pageId}
          </span>
        ) : null}
      </span>
    </>
  );

  const cardClass =
    "flex items-start gap-3 px-4 py-3 text-inherit no-underline hover:no-underline [&_*]:no-underline";

  return (
    <NodeViewWrapper
      as="div"
      className={cn(
        "page-embed my-3",
        selected &&
          editor.isEditable &&
          "rounded-lg ring-2 ring-ring/40 ring-offset-2 ring-offset-background",
      )}
      data-page-embed=""
      data-page-id={isExternal ? undefined : pageId || undefined}
      data-href={isExternal ? attrs.href : undefined}
    >
      <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/20 transition-colors hover:bg-muted/30">
        {editor.isEditable ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label="Remove embed"
            className="absolute top-1.5 right-1.5 z-10 aspect-square size-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            onClick={deleteNode}
          >
            <X className="size-3.5" aria-hidden />
          </Button>
        ) : null}
        {canNavigate && !editor.isEditable ? (
          <button
            type="button"
            className={cn(cardClass, "w-full text-left")}
            onClick={() => onNavigateToWikiDoc!(pageId)}
          >
            {cardInner}
          </button>
        ) : isExternal ? (
          <a
            href={attrs.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cardClass}
          >
            {cardInner}
          </a>
        ) : (
          <div className={cardClass}>{cardInner}</div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const PageEmbed = Node.create({
  name: "pageEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      pageId: { default: "" },
      href: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-page-embed=""]',
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          return parsePageReferenceAttrs(element) ?? false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs: Record<string, string> = { "data-page-embed": "" };
    if (node.attrs.href) attrs["data-href"] = node.attrs.href;
    else if (node.attrs.pageId) attrs["data-page-id"] = node.attrs.pageId;
    return ["div", mergeAttributes(HTMLAttributes, attrs)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageEmbedNodeView);
  },
});

export const insertPageEmbedBlock = (
  editor: Editor,
  attrs: PageEmbedAttrs,
) => {
  const { before, after, inEmptyTextblock } = blockInsertionPoint(editor.state);
  const content = { type: "pageEmbed", attrs };
  editor
    .chain()
    .focus()
    .insertContentAt(inEmptyTextblock ? before : after, content)
    .run();
};

const PageMentionNodeView = ({
  node,
  selected,
  editor,
}: NodeViewProps) => {
  const attrs = node.attrs as PageReferenceAttrs;
  const {
    isExternal,
    title,
    kind,
    pageId,
    onNavigateToWikiDoc,
    canNavigate,
  } = usePageReference(attrs);
  const missing = !isExternal && kind === "missing";

  const labelClass = cn(
    "truncate font-bold text-foreground group-hover:underline underline-offset-2",
    missing && "text-muted-foreground line-through",
  );

  const inner = (
    <>
      {missing ? (
        <AlertCircle
          className="size-3.5 shrink-0 text-destructive"
          aria-hidden
        />
      ) : isExternal ? (
        <ExternalLink
          className="size-3.5 shrink-0 text-foreground"
          aria-hidden
        />
      ) : (
        <FileText
          className="size-3.5 shrink-0 text-foreground"
          aria-hidden
        />
      )}
      <span className={labelClass}>{title}</span>
    </>
  );

  const wrapClass = cn(
    "group inline-flex items-center gap-1 align-baseline text-inherit no-underline hover:no-underline",
    selected &&
      editor.isEditable &&
      "rounded-sm ring-2 ring-ring/40 ring-offset-1 ring-offset-background",
  );

  return (
    <NodeViewWrapper
      as="span"
      className="page-mention mx-0.5 inline"
      data-page-mention=""
      data-page-id={isExternal ? undefined : pageId || undefined}
      data-href={isExternal ? attrs.href : undefined}
    >
      {canNavigate && !editor.isEditable ? (
        <button
          type="button"
          className={wrapClass}
          onClick={() => onNavigateToWikiDoc!(pageId)}
        >
          {inner}
        </button>
      ) : isExternal ? (
        <a
          href={attrs.href}
          target="_blank"
          rel="noopener noreferrer"
          className={wrapClass}
        >
          {inner}
        </a>
      ) : (
        <span className={wrapClass}>{inner}</span>
      )}
    </NodeViewWrapper>
  );
};

export const PageMention = Node.create({
  name: "pageMention",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      pageId: { default: "" },
      href: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-page-mention=""]',
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          return parsePageReferenceAttrs(element) ?? false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs: Record<string, string> = { "data-page-mention": "" };
    if (node.attrs.href) attrs["data-href"] = node.attrs.href;
    else if (node.attrs.pageId) attrs["data-page-id"] = node.attrs.pageId;
    return ["span", mergeAttributes(HTMLAttributes, attrs)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageMentionNodeView);
  },
});

export const insertPageMention = (
  editor: Editor,
  attrs: PageReferenceAttrs,
) => {
  editor
    .chain()
    .focus()
    .insertContent({ type: "pageMention", attrs })
    .run();
};

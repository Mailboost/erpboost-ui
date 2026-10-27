// Reference example: https://ui.tailor.tech/page/document-page
import Link, { type LinkOptions } from "@tiptap/extension-link";
import { mergeAttributes, type Editor } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { buildDocumentUrl } from "./documentEditorUrl";
import {
  normalizePageId,
  parsePageReferenceAttrs,
  wikiPageIdFromInternalHref,
} from "./documentPageRegistry";

/**
 * Link mark that supports internal page links. Internal links persist only a
 * stable `data-page-id`; the visible href is derived from it at render time
 * so document renames never break saved content. External links keep a plain
 * `href` as usual.
 */

export type PageHrefResolver = (pageId: string) => string;

type DocumentEditorLinkStorage = {
  resolvePageHref: PageHrefResolver;
};

const syncPageIdLinkHrefs = (root: ParentNode, resolve: PageHrefResolver) => {
  root.querySelectorAll("a[data-page-id]").forEach((el) => {
    if (!(el instanceof HTMLAnchorElement)) return;
    const pageId = el.getAttribute("data-page-id");
    if (!pageId) return;
    const href = resolve(normalizePageId(pageId));
    // Only write on change: ProseMirror's DOM observer reacts to attribute
    // mutations, and an unconditional write would re-trigger this sync.
    if (el.getAttribute("href") !== href) el.setAttribute("href", href);
  });
};

export const DocumentEditorLink = Link.extend<
  LinkOptions,
  DocumentEditorLinkStorage
>({
  addStorage() {
    // Default resolver builds a permalink from the id alone. The host page
    // swaps in a registry-aware resolver via setPageHrefResolver.
    return {
      resolvePageHref: (pageId) => buildDocumentUrl({ pageId }),
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      pageId: {
        default: null,
        parseHTML: (element) => {
          if (!(element instanceof Element)) return null;
          const parsed = parsePageReferenceAttrs(element);
          if (parsed?.pageId) return parsed.pageId;
          // Links saved by earlier revisions carried an internal href
          // instead of a page id.
          const href = element.getAttribute("href") ?? "";
          return wikiPageIdFromInternalHref(href);
        },
        renderHTML: (attributes) =>
          attributes.pageId ? { "data-page-id": attributes.pageId } : {},
      },
    };
  },

  renderHTML({ mark, HTMLAttributes }) {
    if (mark.attrs.pageId) {
      return [
        "a",
        mergeAttributes(HTMLAttributes, {
          "data-page-id": mark.attrs.pageId,
        }),
        0,
      ];
    }
    return [
      "a",
      mergeAttributes(HTMLAttributes, { href: mark.attrs.href }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    const { storage } = this;
    // Rendered `a[data-page-id]` elements get their href recomputed after
    // every editor update, keeping them in sync with current titles.
    const pageIdHrefPlugin = new Plugin({
      view(editorView) {
        const update = () =>
          syncPageIdLinkHrefs(editorView.dom, storage.resolvePageHref);
        update();
        return { update };
      },
    });
    return [...(this.parent?.() ?? []), pageIdHrefPlugin];
  },
}).configure({
  openOnClick: false,
  linkOnPaste: true,
});

/**
 * Swap in a resolver that knows the current document titles, and immediately
 * re-resolve hrefs already in the DOM (e.g. after a rename).
 */
export const setPageHrefResolver = (
  editor: Editor,
  resolve: PageHrefResolver,
) => {
  const storage = (editor.storage as unknown as {link:DocumentEditorLinkStorage}).link;
  if (!storage || editor.isDestroyed) return;
  storage.resolvePageHref = resolve;
  syncPageIdLinkHrefs(editor.view.dom, resolve);
};

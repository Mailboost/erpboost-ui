// Reference example: https://ui.tailor.tech/page/document-page
import { buildDocumentUrl } from "./documentEditorUrl";
import { slugifyHeading } from "./documentEditorHeading";

/**
 * Page reference resolution.
 *
 * Documents persist only a stable `data-page-id` for internal references
 * (embeds, mentions, links); titles and URLs are resolved at render time so
 * renames never leave stale text in saved HTML. In production this lookup is
 * backed by a page registry API / table — here the sidebar docs stand in.
 */

/** Live titles of the sidebar wiki docs, keyed by doc id. */
export type WikiDocSnapshot = Record<string, { title: string }>;

/** Prefix of ids persisted by an earlier revision of this demo. */
const LEGACY_PAGE_ID_PREFIX = "cat:";

/** Earlier revisions persisted catalogue slugs; map them to wiki doc ids. */
const LEGACY_SLUG_TO_WIKI_ID: Record<string, string> = {
  "document-page": "supplier-onboarding",
  "form-as-page": "purchasing-rules",
  "simple-master-crud": "supplier-master",
  collection: "purchasing-rules",
  "detail-2col-action-panel": "vendor-evaluation",
  "dashboard-with-charts": "incident-response",
  email: "release-notes",
  chat: "new-hire-checklist",
};

/** Normalize any persisted id (including legacy formats) to a wiki doc id. */
export const normalizePageId = (rawPageId: string): string => {
  if (rawPageId.startsWith(LEGACY_PAGE_ID_PREFIX)) {
    const slug = rawPageId.slice(LEGACY_PAGE_ID_PREFIX.length);
    return LEGACY_SLUG_TO_WIKI_ID[slug] ?? slug;
  }
  return rawPageId;
};

/**
 * Read page reference attrs off a persisted element. External references keep
 * a full `data-href`; internal ones keep `data-page-id` only. Legacy content
 * that stored a catalogue slug (`data-slug`) is migrated to a page id on load.
 */
export const parsePageReferenceAttrs = (
  element: Element,
): { pageId: string; href: string } | null => {
  const href = element.getAttribute("data-href") ?? "";
  if (href) return { pageId: "", href };

  const pageId = element.getAttribute("data-page-id");
  if (pageId) return { pageId: normalizePageId(pageId), href: "" };

  const slug = element.getAttribute("data-slug");
  if (slug) return { pageId: LEGACY_SLUG_TO_WIKI_ID[slug] ?? slug, href: "" };

  return null;
};

export type ResolvedPageReference = {
  pageId: string;
  title: string;
  href: string;
  /** "missing" when the id no longer exists — render a broken-link state. */
  kind: "wiki" | "missing";
};

export const resolvePageReference = (
  pageId: string,
  wikiDocs: WikiDocSnapshot = {},
): ResolvedPageReference => {
  const id = normalizePageId(pageId);
  const wiki = wikiDocs[id];
  if (wiki) {
    return {
      pageId: id,
      title: wiki.title,
      href: buildDocumentUrl({ pageId: id, pageSlug: slugifyHeading(wiki.title) }),
      kind: "wiki",
    };
  }

  return {
    pageId: id,
    title: id,
    href: buildDocumentUrl({ pageId: id }),
    kind: "missing",
  };
};

export type PagePickerCandidate = {
  pageId: string;
  title: string;
  subtitle: string;
};

const MAX_PICKER_CANDIDATES = 24;

export const listPagePickerCandidates = (
  wikiDocs: WikiDocSnapshot,
  query: string,
): PagePickerCandidate[] => {
  const q = query.trim().toLowerCase();
  const matches = (title: string, pageId: string) =>
    !q || title.toLowerCase().includes(q) || pageId.toLowerCase().includes(q);

  return Object.entries(wikiDocs)
    .map(([pageId, { title }]) => ({
      pageId,
      title,
      subtitle: pageId,
    }))
    .filter((c) => matches(c.title, c.pageId))
    .sort((a, b) => a.title.localeCompare(b.title, "en"))
    .slice(0, MAX_PICKER_CANDIDATES);
};

/**
 * Extract a wiki doc id from a legacy internal href (`/page/<slug>` or
 * `/patterns/<slug>`), used when parsing links saved by earlier revisions.
 */
export const wikiPageIdFromInternalHref = (href: string): string | null => {
  const match = href.match(/^\/(?:page|patterns)\/([^/?#]+)/);
  if (!match) return null;
  const slug = decodeURIComponent(match[1]);
  return LEGACY_SLUG_TO_WIKI_ID[slug] ?? slug;
};

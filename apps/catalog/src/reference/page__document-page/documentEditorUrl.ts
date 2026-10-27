// Reference example: https://ui.tailor.tech/page/document-page
/**
 * Product-level document URL composition.
 * This mock does not wire these paths to the router — see document-page meta `notes`.
 */

/** Permalink prefix assumed for wiki / playbook documents. */
export const DOCUMENT_PATH_PREFIX = "/docs" as const;

export type DocumentUrlParts = {
  /** Stable page id (Notion-style). In this mock, sidebar `doc.id` stands in. */
  pageId: string;
  /** Human-readable slug segment. Optional until title slug is synced. */
  pageSlug?: string;
  /** Heading `id` from body (h2 / h3). Fragment only — same page. */
  headingId?: string;
};

/** Full shareable URL: `/docs/<pageId>[/<slug>][#<headingId>]` */
export function buildDocumentUrl({
  pageId,
  pageSlug,
  headingId,
}: DocumentUrlParts): string {
  const slugSegment =
    pageSlug && pageSlug.length > 0 ? `/${encodeURIComponent(pageSlug)}` : "";
  const base = `${DOCUMENT_PATH_PREFIX}/${encodeURIComponent(pageId)}${slugSegment}`;
  if (!headingId) return base;
  return `${base}#${encodeURIComponent(headingId)}`;
}

/** Resolve hash target inside the editor surface. */
export function scrollToHeadingInEditor(
  root: ParentNode,
  headingId: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const id = decodeURIComponent(headingId);
  const el = root.querySelector(`#${CSS.escape(id)}`);
  if (!(el instanceof HTMLElement)) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

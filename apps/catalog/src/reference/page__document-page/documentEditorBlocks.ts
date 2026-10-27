// Reference example: https://ui.tailor.tech/page/document-page
import type { EditorState } from "@tiptap/pm/state";

export type BlockInsertionPoint = {
  /** Document position just before the block the caret sits in. */
  before: number;
  /** Document position just after the block the caret sits in. */
  after: number;
  /**
   * True when the caret is in an empty, non-code text block. Insertion should
   * then replace the block in place instead of appending after it, so the
   * empty paragraph doesn't linger above the inserted content.
   */
  inEmptyTextblock: boolean;
};

/**
 * Locate the nearest enclosing block of the current selection. Shared by the
 * "+" insert menu and the page-embed picker so both insert with the same
 * placement rules.
 */
export function blockInsertionPoint(state: EditorState): BlockInsertionPoint {
  const { $from } = state.selection;
  let depth = $from.depth;
  while (depth > 0) {
    const node = $from.node(depth);
    if (node.isBlock && node.type.name !== "doc") break;
    depth--;
  }
  if (depth < 1) depth = 1;

  const parent = $from.node(depth);
  return {
    before: $from.before(depth),
    after: $from.after(depth),
    inEmptyTextblock:
      parent.isTextblock &&
      !parent.type.spec.code &&
      parent.textContent.trim() === "",
  };
}

// Reference example: https://ui.tailor.tech/page/document-page
import { mergeAttributes } from "@tiptap/core";
import Heading from "@tiptap/extension-heading";
import { Plugin } from "@tiptap/pm/state";

/** Heading text → URL fragment id (Unicode letters kept). */
export function slugifyHeading(text: string): string {
  return (
    text
      .trim()
      .replace(/\s+/g, "-")
      .replace(/\./g, "")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

const headingIdPlugin = new Plugin({
  appendTransaction(_transactions, _oldState, newState) {
    const seen = new Map<string, number>();
    let tr: typeof newState.tr | null = null;
    let changed = false;

    newState.doc.descendants((node, pos) => {
      if (node.type.name !== "heading") return;
      const base = slugifyHeading(node.textContent);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      if (node.attrs.id === id) return;
      tr ??= newState.tr;
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, id });
      changed = true;
    });

    return changed && tr ? tr : null;
  },
});

export const DocumentHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("id"),
        renderHTML: (attributes) =>
          attributes.id ? { id: attributes.id } : {},
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs.level)
      ? node.attrs.level
      : this.options.levels[0];
    const id = node.attrs.id ?? slugifyHeading(node.textContent);
    return [
      `h${level}`,
      mergeAttributes(HTMLAttributes, { id }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), headingIdPlugin];
  },
}).configure({ levels: [2, 3] });

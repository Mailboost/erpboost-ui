// Reference example: https://ui.tailor.tech/page/document-page
import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import {
  buildDocumentUrl,
  scrollToHeadingInEditor,
} from "./documentEditorUrl";
import { slugifyHeading } from "./documentEditorHeading";

// Static markup (no user input), safe to assign via innerHTML.
const LINK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard may be unavailable in embedded preview.
  }
};

/**
 * Adds a hover-revealed "copy link" button to every h2 / h3 while the
 * document is in preview mode. Buttons are plain DOM appended into the
 * ProseMirror-rendered headings (tiptap owns that subtree, so a React portal
 * per heading would be torn down on every rerender).
 */
export const DocumentPreviewHeadingAnchors = ({
  editor,
  docId,
  active,
}: {
  editor: Editor;
  docId: string;
  active: boolean;
}) => {
  useEffect(() => {
    if (!active) return;

    const cleanups: (() => void)[] = [];

    const mount = () => {
      if (editor.isDestroyed) return;
      cleanups.splice(0).forEach((fn) => fn());

      const surface = editor.view.dom.closest(".document-surface");
      if (!surface) return;

      const seen = new Map<string, number>();

      surface.querySelectorAll("h2, h3").forEach((heading) => {
        if (!(heading instanceof HTMLElement)) return;
        if (heading.querySelector(".document-heading-anchor-btn")) return;

        // The heading extension normally assigns ids before this runs. If it
        // hasn't yet (first paint), fall back to the same slugify +
        // duplicate-suffix rules so copied links stay stable.
        let headingId = heading.id;
        if (!headingId) {
          const base = slugifyHeading(heading.textContent ?? "");
          const count = (seen.get(base) ?? 0) + 1;
          seen.set(base, count);
          headingId = count === 1 ? base : `${base}-${count}`;
          heading.id = headingId;
        } else {
          const base = headingId.replace(/-\d+$/, "");
          seen.set(base, (seen.get(base) ?? 0) + 1);
        }

        heading.classList.add("group/heading", "document-heading-with-anchor");

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "document-heading-anchor-btn ml-1.5 inline-flex size-6 shrink-0 translate-y-[-0.05em] align-middle items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted/60 hover:text-foreground group-hover/heading:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
        btn.setAttribute("aria-label", "Copy heading link");

        const url = buildDocumentUrl({ pageId: docId, headingId });
        btn.title = url;
        btn.innerHTML = LINK_ICON_SVG;

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          void copyText(url);
          scrollToHeadingInEditor(editor.view.dom, headingId, "smooth");
        });

        heading.appendChild(btn);
        cleanups.push(() => {
          btn.remove();
          heading.classList.remove(
            "group/heading",
            "document-heading-with-anchor",
          );
        });
      });
    };

    // On initial mount the ProseMirror view may not be flushed to the DOM
    // yet, so run once more on the next frame.
    mount();
    const raf = requestAnimationFrame(mount);

    editor.on("mount", mount);
    editor.on("update", mount);
    editor.on("transaction", mount);

    return () => {
      cancelAnimationFrame(raf);
      editor.off("mount", mount);
      editor.off("update", mount);
      editor.off("transaction", mount);
      cleanups.forEach((fn) => fn());
    };
  }, [active, docId, editor]);

  return null;
};

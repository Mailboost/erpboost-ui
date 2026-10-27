import { useCallback, useEffect, useState, type RefObject } from "react";

// The form may sit inside a scrolling preview, rather than the document.
// Scrolling that owner directly keeps all enclosing pages in place.
function scrollOwner(element: HTMLElement): HTMLElement | null {
  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    if (["auto", "scroll"].includes(getComputedStyle(parent).overflowY)) {
      return parent;
    }
  }
  return null;
}

export function useSectionScrollSpy({
  rootRef,
  sectionIds,
  anchorId,
  offsetPx = 96,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  sectionIds: string[];
  anchorId: (id: string) => string;
  offsetPx?: number;
}) {
  const [active, selectActive] = useState(sectionIds[0]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const owner = scrollOwner(root);
    const target = owner ?? window;
    const update = () => {
      const top = (owner?.getBoundingClientRect().top ?? 0) + offsetPx;
      let current = sectionIds[0];
      // Re-evaluate every heading: IntersectionObserver's changed entries alone
      // can select a newly entering section below the one being viewed.
      for (const id of sectionIds) {
        const section = root.querySelector<HTMLElement>(
          `#${CSS.escape(anchorId(id))}`,
        );
        if (section && section.getBoundingClientRect().top <= top + 1)
          current = id;
      }
      // A short final section cannot always reach the offset before the
      // scrollport ends. It is still the current section at that boundary.
      if (
        owner &&
        owner.scrollHeight > owner.clientHeight &&
        owner.scrollTop + owner.clientHeight >= owner.scrollHeight - 1
      ) {
        current = sectionIds[sectionIds.length - 1];
      }
      selectActive(current);
    };
    update();
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [rootRef, sectionIds, anchorId, offsetPx]);

  const scrollToSection = useCallback(
    (id: string) => {
      const root = rootRef.current;
      const section = root?.querySelector<HTMLElement>(
        `#${CSS.escape(anchorId(id))}`,
      );
      if (!root || !section) return;
      const owner = scrollOwner(root);
      const top =
        section.getBoundingClientRect().top -
        (owner?.getBoundingClientRect().top ?? 0) +
        (owner?.scrollTop ?? window.scrollY) -
        offsetPx;
      (owner ?? window).scrollTo({ top, behavior: "smooth" });
    },
    [rootRef, anchorId, offsetPx],
  );

  return { active, selectActive, scrollToSection };
}

// Reference example: https://ui.tailor.tech/page/document-page
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  AtSign,
  Braces,
  ChevronRight,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  PanelTop,
  Pilcrow,
  Plus,
  Quote,
} from "lucide-react";
import { Button } from "@mailboost/erpboost-ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../shared/popover";
import { cn } from "@/lib/utils";
import { blockInsertionPoint } from "./documentEditorBlocks";
import {
  insertPageEmbedBlock,
  insertPageMention,
} from "./DocumentEditorPageEmbed";
import { DocumentEditorPageEmbedPicker } from "./DocumentEditorPageEmbedPicker";
import { FLOATING_MENU_Z_INDEX } from "./documentEditorStyles";

type InsertKind =
  | "paragraph"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock"
  | "hr";

const PLUS_BUTTON_SIZE = 24;
const PLUS_GUTTER_GAP = 8;

// The "+" aligns with the left edge of the body column and tracks the caret
// line vertically.
function plusAnchorPoint(
  editor: Editor,
  bodyColumnEl: HTMLElement | null,
): { top: number; left: number } | null {
  const { view, state } = editor;
  const { selection } = state;
  if (!selection.empty) return null;

  const parent = selection.$from.parent;
  if (!parent.isTextblock || parent.type.spec.code) return null;

  const coords = view.coordsAtPos(selection.from);
  const lineHeight = Math.max(coords.bottom - coords.top, 16);
  const top = coords.top + lineHeight / 2;
  const left =
    bodyColumnEl?.getBoundingClientRect().left ??
    view.dom.getBoundingClientRect().left;

  return { top, left };
}

function shouldShowPlusButton(
  editor: Editor,
  menusActive: boolean,
  keepVisible: boolean,
): boolean {
  if (!menusActive || !editor.isEditable) return false;
  if (!keepVisible && !editor.view.hasFocus()) return false;
  const { selection } = editor.state;
  if (!selection.empty) return false;
  const parent = selection.$from.parent;
  if (!parent.isTextblock || parent.type.spec.code) return false;
  return true;
}

function insertBlock(editor: Editor, kind: InsertKind) {
  const { after, inEmptyTextblock } = blockInsertionPoint(editor.state);
  const chain = editor.chain().focus();

  if (kind === "hr") {
    if (inEmptyTextblock) chain.setHorizontalRule().run();
    else chain.insertContentAt(after, { type: "horizontalRule" }).run();
    return;
  }

  // With the caret in an empty paragraph, convert the block in place instead
  // of appending after it.
  if (inEmptyTextblock) {
    switch (kind) {
      case "paragraph":
        chain.setParagraph().run();
        break;
      case "h2":
        chain.setHeading({ level: 2 }).run();
        break;
      case "h3":
        chain.setHeading({ level: 3 }).run();
        break;
      case "bulletList":
        chain.toggleBulletList().run();
        break;
      case "orderedList":
        chain.toggleOrderedList().run();
        break;
      case "blockquote":
        chain.toggleBlockquote().run();
        break;
      case "codeBlock":
        chain.toggleCodeBlock().run();
        break;
    }
    return;
  }

  const emptySnippet: Record<Exclude<InsertKind, "hr">, string> = {
    paragraph: "<p></p>",
    h2: "<h2></h2>",
    h3: "<h3></h3>",
    bulletList: "<ul><li><p></p></li></ul>",
    orderedList: "<ol><li><p></p></li></ol>",
    blockquote: "<blockquote><p></p></blockquote>",
    codeBlock: "<pre><code></code></pre>",
  };
  chain.insertContentAt(after, emptySnippet[kind]).run();
}

type PagePickerMode = "embed" | "mention" | null;

/**
 * Notion-style "+" button floating in the left gutter of the caret line.
 * Opens a popover listing insertable blocks, including the page embed /
 * mention pickers.
 */
export const DocumentEditorInsertMenu = ({
  editor,
  bodyColumnRef,
  menusActive,
}: {
  editor: Editor;
  bodyColumnRef: React.RefObject<HTMLElement | null>;
  menusActive: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [pagePickerMode, setPagePickerMode] = useState<PagePickerMode>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(
    null,
  );
  const menusActiveRef = useRef(menusActive);
  menusActiveRef.current = menusActive;
  const openRef = useRef(open);
  openRef.current = open;
  const lastAnchorRef = useRef<{ top: number; left: number } | null>(null);

  const updateAnchor = useCallback(() => {
    // While the popover is open the editor loses focus; keep the button where
    // it was so the popover doesn't jump or unmount.
    const keepVisible = openRef.current;
    if (!shouldShowPlusButton(editor, menusActiveRef.current, keepVisible)) {
      if (!keepVisible) {
        setAnchor(null);
      }
      return;
    }
    const next = plusAnchorPoint(editor, bodyColumnRef.current);
    if (next) {
      lastAnchorRef.current = next;
      setAnchor(next);
    }
  }, [editor, bodyColumnRef]);

  useEffect(() => {
    if (!menusActive) {
      setAnchor(null);
      return;
    }

    updateAnchor();

    editor.on("selectionUpdate", updateAnchor);
    editor.on("focus", updateAnchor);
    editor.on("blur", updateAnchor);
    editor.on("transaction", updateAnchor);

    const scrollEl =
      bodyColumnRef.current?.closest("main") ??
      bodyColumnRef.current?.closest("[data-scroll-container]") ??
      window;

    scrollEl.addEventListener("scroll", updateAnchor, { passive: true });
    window.addEventListener("resize", updateAnchor);

    return () => {
      editor.off("selectionUpdate", updateAnchor);
      editor.off("focus", updateAnchor);
      editor.off("blur", updateAnchor);
      editor.off("transaction", updateAnchor);
      scrollEl.removeEventListener("scroll", updateAnchor);
      window.removeEventListener("resize", updateAnchor);
    };
  }, [editor, menusActive, bodyColumnRef, updateAnchor]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPagePickerMode(null);
    queueMicrotask(updateAnchor);
  };

  const rowClass =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted/80";

  const pick = (kind: InsertKind) => {
    insertBlock(editor, kind);
    setOpen(false);
  };

  if (!anchor && !open) return null;

  const position = anchor ?? lastAnchorRef.current;
  if (!position) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed"
      style={{
        top: position.top,
        left: position.left,
        zIndex: FLOATING_MENU_Z_INDEX,
        transform: `translate(calc(-100% - ${PLUS_GUTTER_GAP}px), -50%)`,
      }}
    >
      <Popover modal={false} open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label="Insert block"
            aria-expanded={open}
            className="pointer-events-auto aspect-square shrink-0 bg-transparent p-0 shadow-none text-muted-foreground hover:bg-muted/60 hover:text-foreground [&_svg]:size-3"
            style={{ width: PLUS_BUTTON_SIZE, height: PLUS_BUTTON_SIZE }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Plus aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="right"
          sideOffset={6}
          className={cn("pointer-events-auto p-1", pagePickerMode ? "w-80" : "w-56")}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {pagePickerMode ? (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted/80"
                onClick={() => setPagePickerMode(null)}
              >
                <ChevronRight className="size-3 rotate-180" aria-hidden />
                Back to block list
              </button>
              <DocumentEditorPageEmbedPicker
                searchLabel={
                  pagePickerMode === "mention"
                    ? "Search pages to mention"
                    : "Search pages to embed"
                }
                onSelect={(attrs) => {
                  if (pagePickerMode === "mention") {
                    insertPageMention(editor, attrs);
                  } else {
                    insertPageEmbedBlock(editor, attrs);
                  }
                  handleOpenChange(false);
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-px">
              <button type="button" className={rowClass} onClick={() => pick("paragraph")}>
                <Pilcrow className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Paragraph
              </button>
              <button type="button" className={rowClass} onClick={() => pick("h2")}>
                <Heading2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Heading 2
              </button>
              <button type="button" className={rowClass} onClick={() => pick("h3")}>
                <Heading3 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Heading 3
              </button>
              <button type="button" className={rowClass} onClick={() => pick("bulletList")}>
                <List className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Bullet list
              </button>
              <button type="button" className={rowClass} onClick={() => pick("orderedList")}>
                <ListOrdered className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Numbered list
              </button>
              <button type="button" className={rowClass} onClick={() => pick("blockquote")}>
                <Quote className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Quote
              </button>
              <button type="button" className={rowClass} onClick={() => pick("codeBlock")}>
                <Braces className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Code block
              </button>
              <button
                type="button"
                className={rowClass}
                onClick={() => setPagePickerMode("embed")}
              >
                <PanelTop className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Page embed
              </button>
              <button
                type="button"
                className={rowClass}
                onClick={() => setPagePickerMode("mention")}
              >
                <AtSign className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Page mention
              </button>
              <button type="button" className={rowClass} onClick={() => pick("hr")}>
                <Minus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Divider
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>,
    document.body,
  );
};

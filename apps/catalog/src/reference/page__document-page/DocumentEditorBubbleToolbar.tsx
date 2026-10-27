// Reference example: https://ui.tailor.tech/page/document-page
import { useRef, useState } from "react";
import { isTextSelection } from "@tiptap/core";
import { type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Braces,
  Code,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
  Strikethrough,
} from "lucide-react";
import { Button, Tooltip } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";
import { DocumentEditorLinkPopover } from "./DocumentEditorLinkPopover";
import { FLOATING_MENU_Z_INDEX } from "./documentEditorStyles";

const ToolbarIconButton = ({
  active,
  disabled,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) => (
  <Tooltip.Root>
    <Tooltip.Trigger
      render={
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            "aspect-square shrink-0 p-0 [&_svg]:size-3.5",
            active
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 disabled:opacity-40",
          )}
          onClick={onClick}
        />
      }
    >
      {children}
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip.Root>
);

const ToolbarDivider = () => (
  <span className="mx-0.5 h-4 w-px shrink-0 bg-border" aria-hidden />
);

/**
 * Formatting toolbar that floats over the current text selection while the
 * document is in edit mode.
 *
 * Tippy's plugin keeps the `shouldShow` passed at registration in a closure,
 * so latest state must be read through refs.
 */
export const DocumentEditorBubbleToolbar = ({
  editor,
  menusActive,
}: {
  editor: Editor;
  menusActive: boolean;
}) => {
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const menusActiveRef = useRef(menusActive);
  menusActiveRef.current = menusActive;
  const linkPopoverOpenRef = useRef(linkPopoverOpen);
  linkPopoverOpenRef.current = linkPopoverOpen;

  return (
    <BubbleMenu
      editor={editor}
      updateDelay={80}
      className="flex w-max flex-nowrap items-center gap-0.5 rounded-lg border border-border bg-popover px-1 py-0.5 shadow-md"
      options={{placement:"top",offset:8}}
      style={{zIndex:FLOATING_MENU_Z_INDEX}}
      shouldShow={({ editor: ed, view, state, from, to, element }) => {
        if (!menusActiveRef.current || !ed.isEditable) return false;
        // Keep the toolbar mounted while the link popover is open, even
        // though focus has moved out of the editor.
        if (linkPopoverOpenRef.current) return true;
        const { doc, selection } = state;
        const { empty } = selection;
        const isEmptyTextBlock =
          !doc.textBetween(from, to).length && isTextSelection(selection);
        const isChildOfMenu = element.contains(document.activeElement);
        const hasEditorFocus = view.hasFocus() || isChildOfMenu;
        if (!hasEditorFocus || empty || isEmptyTextBlock) return false;
        return true;
      }}
    >
      <Tooltip.Provider>
        <ToolbarIconButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code aria-hidden />
        </ToolbarIconButton>
        <DocumentEditorLinkPopover
          editor={editor}
          open={linkPopoverOpen}
          onOpenChange={setLinkPopoverOpen}
        />
        <ToolbarDivider />
        <ToolbarIconButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 aria-hidden />
        </ToolbarIconButton>
        <ToolbarDivider />
        <ToolbarIconButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote aria-hidden />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Braces aria-hidden />
        </ToolbarIconButton>
        <ToolbarDivider />
        <ToolbarIconButton
          label="Clear formatting"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <RemoveFormatting aria-hidden />
        </ToolbarIconButton>
      </Tooltip.Provider>
    </BubbleMenu>
  );
};

// Reference example: https://ui.tailor.tech/page/document-page
import { useState } from "react";
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Plus,
} from "lucide-react";
import { Button } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";
import type { WikiDocSnapshot } from "./documentPageRegistry";

export type DocumentTreeNode =
  | {
      type: "folder";
      id: string;
      name: string;
      defaultExpanded?: boolean;
      children: DocumentTreeNode[];
    }
  | {
      type: "doc";
      id: string;
      title: string;
      html: string;
    };

const collectDefaultExpandedFolders = (
  nodes: DocumentTreeNode[],
): Set<string> => {
  const set = new Set<string>();
  const walk = (children: DocumentTreeNode[]) => {
    for (const node of children) {
      if (node.type === "folder") {
        if (node.defaultExpanded) set.add(node.id);
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return set;
};

const TreeRow = ({
  node,
  depth,
  expanded,
  selectedId,
  docTitles,
  onToggle,
  onSelect,
}: {
  node: DocumentTreeNode;
  depth: number;
  expanded: Set<string>;
  selectedId: string;
  docTitles: WikiDocSnapshot;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) => {
  if (node.type === "folder") {
    const isOpen = expanded.has(node.id);
    return (
      <li>
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-1 rounded-md py-1 pr-2 text-sm text-foreground/80 hover:bg-muted/60"
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-90",
            )}
            aria-hidden
          />
          {isOpen ? (
            <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <Folder className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen ? (
          <ul className="space-y-px">
            {node.children.map((child) => (
              <TreeRow
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                selectedId={selectedId}
                docTitles={docTitles}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  const isSelected = node.id === selectedId;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        aria-current={isSelected ? "page" : undefined}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-sm",
          isSelected
            ? "bg-muted font-medium text-foreground"
            : "text-foreground/70 hover:bg-muted/60",
        )}
        // Inset by chevron (14px) + gap (4px) so doc labels align with folder labels.
        style={{ paddingLeft: `${depth * 12 + 4 + 14 + 4}px` }}
      >
        <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">
          {docTitles[node.id]?.title ?? node.title}
        </span>
      </button>
    </li>
  );
};

export const DocumentEditorSidebar = ({
  tree,
  selectedId,
  docTitles,
  onSelect,
  leftAccessory,
}: {
  tree: DocumentTreeNode[];
  selectedId: string;
  /** Live titles keyed by doc id; falls back to the tree's static title. */
  docTitles: WikiDocSnapshot;
  onSelect: (id: string) => void;
  /**
   * Slot for an "open sidebar" trigger injected by the catalogue preview when
   * the mock app-shell sidebar is collapsed. Unused in a real product.
   */
  leftAccessory?: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    collectDefaultExpandedFolders(tree),
  );

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <nav aria-label="Documents" className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between gap-1 px-2">
        <div className="flex min-w-0 items-center gap-1">
          {leftAccessory}
          <h2 className="truncate px-1 text-base font-bold leading-tight text-foreground">
            Documents
          </h2>
        </div>
        <Button
          type="button"
          variant="default"
          size="xs"
          aria-label="New document"
          title="New document"
          className="aspect-square size-7 shrink-0 p-0"
        >
          <Plus className="size-3.5" aria-hidden />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-px">
          {tree.map((node) => (
            <TreeRow
              key={node.id}
              node={node}
              depth={0}
              expanded={expanded}
              selectedId={selectedId}
              docTitles={docTitles}
              onToggle={toggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
};

// Reference example: https://ui.tailor.tech/page/pipeline-kanban
import type { ChangeEvent, ComponentProps, KeyboardEvent, ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const buttonVariants = ({ size, variant }: { size?: string; variant?: string }) =>
  cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium",
    variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
    size === "icon" && "h-9 w-9",
  );

export type KanbanBoardDndMonitorEventHandler = {
  onDragStart?: (activeId: string) => void;
  onDragMove?: (activeId: string, overId?: string) => void;
  onDragOver?: (activeId: string, overId?: string) => void;
  onDragEnd?: (activeId: string, overId?: string) => void;
  onDragCancel?: (activeId: string) => void;
};

export type KanbanBoardDndEventType = keyof KanbanBoardDndMonitorEventHandler;

type KanbanBoardDndMonitorContextValue = {
  activeIdRef: RefObject<string>;
  draggableDescribedById: string;
  registerMonitor: (monitor: KanbanBoardDndMonitorEventHandler) => void;
  unregisterMonitor: (monitor: KanbanBoardDndMonitorEventHandler) => void;
  triggerEvent: (eventType: KanbanBoardDndEventType, activeId: string, overId?: string) => void;
};

const KanbanBoardContext = createContext<KanbanBoardDndMonitorContextValue | undefined>(
  undefined,
);

function useDndMonitor(monitor: KanbanBoardDndMonitorEventHandler) {
  const context = useContext(KanbanBoardContext);
  if (!context) {
    throw new Error("useDndMonitor must be used within KanbanBoardProvider");
  }

  const { registerMonitor, unregisterMonitor } = context;

  useEffect(() => {
    registerMonitor(monitor);
    return () => {
      unregisterMonitor(monitor);
    };
  }, [monitor, registerMonitor, unregisterMonitor]);
}

export function useDndEvents() {
  const context = useContext(KanbanBoardContext);

  if (!context) {
    throw new Error("useDndEvents must be used within KanbanBoardProvider");
  }

  const { activeIdRef, draggableDescribedById, triggerEvent } = context;

  const onDragStart = useCallback(
    (activeId: string) => {
      activeIdRef.current = activeId;
      triggerEvent("onDragStart", activeId);
    },
    [triggerEvent, activeIdRef],
  );

  const onDragMove = useCallback(
    (activeId: string, overId?: string) => {
      triggerEvent("onDragMove", activeId, overId);
    },
    [triggerEvent],
  );

  const onDragOver = useCallback(
    (activeId: string, overId?: string) => {
      const actualActiveId = activeId || activeIdRef.current;
      triggerEvent("onDragOver", actualActiveId, overId);
    },
    [triggerEvent, activeIdRef],
  );

  const onDragEnd = useCallback(
    (activeId: string, overId?: string) => {
      activeIdRef.current = "";
      triggerEvent("onDragEnd", activeId, overId);
    },
    [triggerEvent, activeIdRef],
  );

  const onDragCancel = useCallback(
    (activeId: string) => {
      if (activeIdRef.current !== activeId) return;
      activeIdRef.current = "";
      triggerEvent("onDragCancel", activeId);
    },
    [triggerEvent, activeIdRef],
  );

  return {
    draggableDescribedById,
    onDragStart,
    onDragMove,
    onDragOver,
    onDragEnd,
    onDragCancel,
  };
}

const defaultScreenReaderInstructions = `
To pick up a draggable item, press the space bar.
While dragging, use the arrow keys to move the item.
Press space again to drop the item in its new position, or press escape to cancel.
`;

type KanbanBoardAnnouncements = {
  onDragStart: (activeId: string) => string;
  onDragMove?: (activeId: string, overId?: string) => string | undefined;
  onDragOver: (activeId: string, overId?: string) => string;
  onDragEnd: (activeId: string, overId?: string) => string;
  onDragCancel: (activeId: string) => string;
};

const defaultAnnouncements: KanbanBoardAnnouncements = {
  onDragStart(activeId) {
    return `Picked up draggable item ${activeId}.`;
  },
  onDragOver(activeId, overId) {
    if (overId) {
      return `Draggable item ${activeId} was moved over droppable area ${overId}.`;
    }
    return `Draggable item ${activeId} is no longer over a droppable area.`;
  },
  onDragEnd(activeId, overId) {
    if (overId) {
      return `Draggable item ${activeId} was dropped over droppable area ${overId}`;
    }
    return `Draggable item ${activeId} was dropped.`;
  },
  onDragCancel(activeId) {
    return `Dragging was cancelled. Draggable item ${activeId} was dropped.`;
  },
};

function KanbanBoardLiveRegion({
  announcement,
  ariaLiveType = "assertive",
  className,
  id,
  ref,
  ...props
}: ComponentProps<"div"> & {
  id: string;
  announcement: string;
  ariaLiveType?: "polite" | "assertive" | "off";
}) {
  return (
    <div
      aria-live={ariaLiveType}
      aria-atomic
      className={cn(
        "clip-[rect(0_0_0_0)] clip-path-[inset(100%)] fixed top-0 left-0 -m-px h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap",
        className,
      )}
      id={id}
      ref={ref}
      role="status"
      {...props}
    >
      {announcement}
    </div>
  );
}

function KanbanBoardHiddenText({
  id,
  value,
  className,
  ref,
  ...props
}: ComponentProps<"div"> & { id: string; value: string }) {
  return (
    <div id={id} className={cn("hidden", className)} ref={ref} {...props}>
      {value}
    </div>
  );
}

function useAnnouncement() {
  const [announcement, setAnnouncement] = useState("");
  const announce = useCallback((value: string | undefined) => {
    if (value != undefined) {
      setAnnouncement(value);
    }
  }, []);

  return { announce, announcement } as const;
}

const KanbanBoardAccessibility = ({
  announcements = defaultAnnouncements,
  container,
  hiddenTextDescribedById,
  screenReaderInstructions = defaultScreenReaderInstructions,
}: {
  announcements?: KanbanBoardAnnouncements;
  container?: Element;
  hiddenTextDescribedById: string;
  screenReaderInstructions?: string;
}) => {
  const { announce, announcement } = useAnnouncement();
  const liveRegionId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useDndMonitor(
    useMemo(
      () => ({
        onDragStart(activeId) {
          announce(announcements.onDragStart(activeId));
        },
        onDragMove(activeId, overId) {
          if (announcements.onDragMove) {
            announce(announcements.onDragMove(activeId, overId));
          }
        },
        onDragOver(activeId, overId) {
          announce(announcements.onDragOver(activeId, overId));
        },
        onDragEnd(activeId, overId) {
          announce(announcements.onDragEnd(activeId, overId));
        },
        onDragCancel(activeId) {
          announce(announcements.onDragCancel(activeId));
        },
      }),
      [announce, announcements],
    ),
  );

  if (!mounted) {
    return null;
  }

  const markup = (
    <>
      <KanbanBoardHiddenText id={hiddenTextDescribedById} value={screenReaderInstructions} />
      <KanbanBoardLiveRegion id={liveRegionId} announcement={announcement} />
    </>
  );

  return container ? createPortal(markup, container) : markup;
};

export const KanbanBoardProvider = ({
  announcements,
  screenReaderInstructions,
  container,
  children,
}: {
  announcements?: KanbanBoardAnnouncements;
  screenReaderInstructions?: string;
  container?: Element;
  children: ReactNode;
}) => {
  const draggableDescribedById = useId();
  const monitorsReference = useRef<KanbanBoardDndMonitorEventHandler[]>([]);
  const activeIdReference = useRef<string>("");

  const registerMonitor = useCallback((monitor: KanbanBoardDndMonitorEventHandler) => {
    monitorsReference.current.push(monitor);
  }, []);

  const unregisterMonitor = useCallback((monitor: KanbanBoardDndMonitorEventHandler) => {
    monitorsReference.current = monitorsReference.current.filter((m) => m !== monitor);
  }, []);

  const triggerEvent = useCallback(
    (eventType: KanbanBoardDndEventType, activeId: string, overId?: string) => {
      for (const monitor of monitorsReference.current) {
        const handler = monitor[eventType];
        if (handler) {
          handler(activeId, overId);
        }
      }
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      activeIdRef: activeIdReference,
      draggableDescribedById,
      registerMonitor,
      unregisterMonitor,
      triggerEvent,
    }),
    [activeIdReference, draggableDescribedById, registerMonitor, unregisterMonitor, triggerEvent],
  );

  return (
    <KanbanBoardContext.Provider value={contextValue}>
      {children}
      <KanbanBoardAccessibility
        announcements={announcements}
        screenReaderInstructions={screenReaderInstructions}
        container={container}
        hiddenTextDescribedById={draggableDescribedById}
      />
    </KanbanBoardContext.Provider>
  );
};

const DATA_TRANSFER_TYPES = {
  CARD: "kanban-board-card",
};

function readCardDrop(dataTransfer: DataTransfer) {
  const data = dataTransfer.getData(DATA_TRANSFER_TYPES.CARD);
  try {
    const card: unknown = JSON.parse(data);
    if (!card || typeof card !== "object" || !("id" in card) || typeof card.id !== "string" || !card.id) {
      return null;
    }
    return { data, id: card.id };
  } catch {
    return null;
  }
}

const KANBAN_BOARD_CIRCLE_COLORS_MAP = {
  primary: "bg-primary",
  gray: "bg-muted-foreground",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
} as const;

export type KanbanBoardCircleColor = keyof typeof KANBAN_BOARD_CIRCLE_COLORS_MAP;

export function KanbanBoard({ className, ref, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 items-start gap-x-2 overflow-x-auto overflow-y-hidden pb-1",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

export function KanbanBoardExtraMargin({ className, ref, ...props }: ComponentProps<"div">) {
  return <div className={cn("h-1 w-8 flex-shrink-0", className)} ref={ref} {...props} />;
}

export type KanbanBoardColumnProps = {
  columnId: string;
  onDropOverColumn?: (dataTransferData: string) => void;
};

export const kanbanBoardColumnClassNames =
  "w-64 flex-shrink-0 rounded-lg border flex flex-col border-border bg-sidebar py-2 max-h-full overflow-hidden";

export function KanbanBoardColumn({
  className,
  columnId,
  onDropOverColumn,
  ref,
  ...props
}: ComponentProps<"section"> & KanbanBoardColumnProps) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const { onDragEnd, onDragOver } = useDndEvents();

  return (
    <section
      aria-labelledby={`column-${columnId}-title`}
      className={cn(kanbanBoardColumnClassNames, isDropTarget && "border-primary", className)}
      onDragLeave={() => {
        setIsDropTarget(false);
      }}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(DATA_TRANSFER_TYPES.CARD)) {
          event.preventDefault();
          setIsDropTarget(true);
          onDragOver("", columnId);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDropTarget(false);
        const card = readCardDrop(event.dataTransfer);
        if (!card) return;
        onDropOverColumn?.(card.data);
        onDragEnd(card.id, columnId);
      }}
      ref={ref}
      {...props}
    />
  );
}

export function KanbanBoardColumnHeader({ className, ref, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between px-2 py-1", className)}
      ref={ref}
      {...props}
    />
  );
}

export type KanbanBoardColumnTitleProps = {
  columnId: string;
};

export function KanbanBoardColumnTitle({
  className,
  columnId,
  ref,
  ...props
}: ComponentProps<"h2"> & KanbanBoardColumnTitleProps) {
  return (
    <h2
      className={cn(
        "text-muted-foreground inline-flex items-center text-sm font-medium",
        className,
      )}
      ref={ref}
      id={`column-${columnId}-title`}
      {...props}
    />
  );
}

export type KanbanBoardColorCircleProps = {
  color?: KanbanBoardCircleColor;
};

export function KanbanColorCircle({
  className,
  color = "primary",
  ref,
  ...props
}: ComponentProps<"div"> & KanbanBoardColorCircleProps) {
  return (
    <div
      className={cn("mr-2 size-2 rounded-full", KANBAN_BOARD_CIRCLE_COLORS_MAP[color], className)}
      ref={ref}
      {...props}
    />
  );
}

export function KanbanBoardColumnList({ className, ref, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("min-h-0.5 flex-grow overflow-y-auto", className)} ref={ref} {...props} />
  );
}

export type KanbanBoardDropDirection = "none" | "top" | "bottom";

export type KanbanBoardColumnListItemProps = {
  cardId: string;
  onDropOverListItem?: (dataTransferData: string, dropDirection: KanbanBoardDropDirection) => void;
};

export const kanbanBoardColumnListItemClassNames =
  "-mb-[2px] border-b-2 border-t-2 border-b-transparent border-t-transparent px-2 py-1 last:mb-0";

export function KanbanBoardColumnListItem({
  cardId,
  className,
  onDropOverListItem,
  ref,
  ...props
}: ComponentProps<"li"> & KanbanBoardColumnListItemProps) {
  const [dropDirection, setDropDirection] = useState<KanbanBoardDropDirection>("none");
  const { onDragOver, onDragEnd } = useDndEvents();

  return (
    <li
      className={cn(
        kanbanBoardColumnListItemClassNames,
        dropDirection === "top" && "border-t-primary",
        dropDirection === "bottom" && "border-b-primary",
        className,
      )}
      onDragLeave={() => {
        setDropDirection("none");
      }}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(DATA_TRANSFER_TYPES.CARD)) {
          event.preventDefault();
          event.stopPropagation();
          const rect = event.currentTarget.getBoundingClientRect();
          const midpoint = (rect.top + rect.bottom) / 2;
          setDropDirection(event.clientY <= midpoint ? "top" : "bottom");
          onDragOver("", cardId);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDropDirection("none");
        const card = readCardDrop(event.dataTransfer);
        if (!card) return;
        onDropOverListItem?.(card.data, dropDirection);
        onDragEnd(card.id, cardId);
      }}
      ref={ref}
      {...props}
    />
  );
}

export type KanbanBoardCardProps<T extends { id: string } = { id: string }> = {
  data: T;
  isActive?: boolean;
};

const kanbanBoardCardClassNames =
  "rounded-lg border border-border bg-card p-3 text-start text-foreground shadow-sm hover:shadow-md transition-shadow";

export function KanbanBoardCard({
  className,
  data,
  isActive = false,
  ref,
  ...props
}: ComponentProps<"button"> & KanbanBoardCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { draggableDescribedById, onDragStart, onDragCancel } = useDndEvents();

  return (
    <button
      aria-describedby={draggableDescribedById}
      aria-roledescription="draggable"
      className={cn(
        kanbanBoardCardClassNames,
        "focus-visible:ring-ring inline-flex w-full cursor-grab touch-manipulation flex-col gap-1 focus-visible:ring-1 focus-visible:outline-none",
        isDragging ? "cursor-grabbing active:cursor-grabbing" : "group relative",
        isActive && "rotate-1 transform shadow-lg",
        className,
      )}
      draggable
      onDragStart={(event) => {
        setIsDragging(true);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(DATA_TRANSFER_TYPES.CARD, JSON.stringify(data));
        event.currentTarget.blur();
        onDragStart(data.id);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragCancel(data.id);
      }}
      ref={ref}
      {...props}
    />
  );
}

export function KanbanBoardCardTitle({ className, ref, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-sm font-medium", className)} ref={ref} {...props} />;
}

export function KanbanBoardCardDescription({ className, ref, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-card-foreground text-xs leading-5 whitespace-pre-wrap", className)}
      ref={ref}
      {...props}
    />
  );
}

export function KanbanBoardCardTextarea({
  className,
  onChange,
  value,
  ref: externalReference,
  ...props
}: ComponentProps<"textarea">) {
  const internalReference = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextareaHeight = () => {
    if (internalReference.current) {
      internalReference.current.style.height = "auto";
      internalReference.current.style.height = `${internalReference.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  useEffect(() => {
    if (value === "") {
      adjustTextareaHeight();
    }
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event);
    adjustTextareaHeight();
  }

  useImperativeHandle(externalReference, () => internalReference.current!);

  return (
    <textarea
      className={cn(
        kanbanBoardCardClassNames,
        "min-h-min resize-none overflow-hidden text-xs leading-5",
        className,
      )}
      onChange={handleChange}
      rows={1}
      value={value}
      ref={internalReference}
      {...props}
    />
  );
}

export function KanbanBoardCardButton({
  className,
  ref: externalReference,
  ...props
}: ComponentProps<"div">) {
  const internalReference = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(externalReference, () => internalReference.current!);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      internalReference.current?.click();
    }
  };

  return (
    <div
      className={cn(
        buttonVariants({ size: "icon", variant: "ghost" }),
        "border-border size-5 border hover:cursor-default [&_svg]:size-3",
        className,
      )}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      ref={internalReference}
      {...props}
    />
  );
}

const STAGE_COLORS: Record<string, KanbanBoardCircleColor> = {
  OPEN: "blue",
  ACTIVE: "yellow",
  DONE: "green",
  CANCELED: "red",
};

export interface PipelineKanbanMovePayload {
  itemId: string;
  currentStageId: string;
  targetStageId: string;
  position?: number;
}

export interface PipelineKanbanReorderPayload {
  itemId: string;
  currentStageId: string;
  position: number;
}

export interface PipelineKanbanStage<TItem> {
  id: string;
  name: string;
  category: string;
  color?: string | null;
  items: TItem[];
}

interface PipelineKanbanBoardProps<TItem> {
  stages: readonly PipelineKanbanStage<TItem>[] | null | undefined;
  unavailableTitle: string;
  unavailableMessage: string;
  getItemId: (item: TItem) => string;
  getStageLabel: (stage: PipelineKanbanStage<TItem>) => string;
  renderCard: (item: TItem) => ReactNode;
  onMoveItem: (payload: PipelineKanbanMovePayload) => void;
  onReorderItem?: (payload: PipelineKanbanReorderPayload) => void;
  expandStageLabel: (stageLabel: string) => string;
  hideStageLabel: (stageLabel: string) => string;
}

const idsKey = (ids: readonly string[]) => ids.join("|");

const arraysShallowEqual = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export const PipelineKanbanBoardView = <TItem,>({
  stages,
  unavailableTitle,
  unavailableMessage,
  getItemId,
  getStageLabel,
  renderCard,
  onMoveItem,
  onReorderItem,
  expandStageLabel,
  hideStageLabel,
}: PipelineKanbanBoardProps<TItem>) => {
  const [collapsedStageIds, setCollapsedStageIds] = useState<Set<string>>(() => new Set());
  const [overrides, setOverrides] = useState<Record<string, string[]>>({});
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;

  useEffect(() => {
    if (!stages || Object.keys(overridesRef.current).length === 0) return;
    setOverrides((previous) => {
      let changed = false;
      const next: Record<string, string[]> = { ...previous };
      for (const stage of stages) {
        const override = previous[stage.id];
        if (!override) continue;
        const propIds = stage.items.map((item) => getItemId(item));
        const filtered = override.filter((id) => propIds.includes(id));
        const propsMatchOverride = arraysShallowEqual(propIds, filtered);
        const overrideMissingItems = filtered.length !== override.length;
        if (propsMatchOverride || overrideMissingItems) {
          delete next[stage.id];
          changed = true;
        }
      }
      return changed ? next : previous;
    });
  }, [stages, getItemId]);

  const displayedStages = useMemo(() => {
    if (!stages) return stages;
    return stages.map((stage) => {
      const override = overrides[stage.id];
      if (!override) return stage;
      const byId = new Map(stage.items.map((item) => [getItemId(item), item] as const));
      const ordered: TItem[] = [];
      const seen = new Set<string>();
      for (const id of override) {
        const item = byId.get(id);
        if (item && !seen.has(id)) {
          ordered.push(item);
          seen.add(id);
        }
      }
      for (const item of stage.items) {
        const id = getItemId(item);
        if (!seen.has(id)) ordered.push(item);
      }
      return { ...stage, items: ordered };
    });
  }, [stages, overrides, getItemId]);

  const toggleCollapse = useCallback((stageId: string) => {
    setCollapsedStageIds((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  }, []);

  const reorderWithin = useCallback(
    (
      stageId: string,
      currentItems: TItem[],
      draggedId: string,
      targetCardId: string,
      direction: KanbanBoardDropDirection,
    ) => {
      const draggedIndex = currentItems.findIndex((item) => getItemId(item) === draggedId);
      const targetIndex = currentItems.findIndex((item) => getItemId(item) === targetCardId);
      if (draggedIndex === -1 || targetIndex === -1 || draggedId === targetCardId) return;

      const without = currentItems.filter((_, index) => index !== draggedIndex);
      const insertAt =
        direction === "top"
          ? draggedIndex < targetIndex
            ? targetIndex - 1
            : targetIndex
          : draggedIndex < targetIndex
            ? targetIndex
            : targetIndex + 1;

      const nextItems = [
        ...without.slice(0, insertAt),
        currentItems[draggedIndex],
        ...without.slice(insertAt),
      ];
      const nextIds = nextItems.map((item) => getItemId(item));
      const previousIds = currentItems.map((item) => getItemId(item));
      if (idsKey(nextIds) === idsKey(previousIds)) return;

      setOverrides((previous) => ({ ...previous, [stageId]: nextIds }));
      onReorderItem?.({ itemId: draggedId, currentStageId: stageId, position: insertAt + 1 });
    },
    [getItemId, onReorderItem],
  );

  const handleDropOnColumn = useCallback(
    (targetStageId: string) => (dataTransferData: string) => {
      try {
        const parsed = JSON.parse(dataTransferData) as { id?: string; currentStageId?: string };
        if (!parsed.id || !parsed.currentStageId || parsed.currentStageId === targetStageId) {
          return;
        }

        onMoveItem({
          itemId: parsed.id,
          currentStageId: parsed.currentStageId,
          targetStageId,
        });
      } catch {
        // Ignore malformed drag payloads.
      }
    },
    [onMoveItem],
  );

  const handleDropOnListItem = useCallback(
    (stage: PipelineKanbanStage<TItem>, targetCardId: string) =>
      (dataTransferData: string, direction: KanbanBoardDropDirection) => {
        try {
          const parsed = JSON.parse(dataTransferData) as { id?: string; currentStageId?: string };
          if (!parsed.id || !parsed.currentStageId) return;

          if (parsed.currentStageId === stage.id) {
            if (!onReorderItem) return;
            reorderWithin(stage.id, stage.items, parsed.id, targetCardId, direction);
            return;
          }

          const targetIndex = stage.items.findIndex((item) => getItemId(item) === targetCardId);
          if (targetIndex === -1) {
            onMoveItem({
              itemId: parsed.id,
              currentStageId: parsed.currentStageId,
              targetStageId: stage.id,
            });
            return;
          }

          const insertIndex = direction === "top" ? targetIndex : targetIndex + 1;
          const nextIds = [
            ...stage.items.slice(0, insertIndex).map((item) => getItemId(item)),
            parsed.id,
            ...stage.items.slice(insertIndex).map((item) => getItemId(item)),
          ];
          setOverrides((previous) => ({ ...previous, [stage.id]: nextIds }));

          onMoveItem({
            itemId: parsed.id,
            currentStageId: parsed.currentStageId,
            targetStageId: stage.id,
            position: insertIndex + 1,
          });
        } catch {
          // Ignore malformed drag payloads.
        }
      },
    [getItemId, onMoveItem, onReorderItem, reorderWithin],
  );

  if (!displayedStages || displayedStages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm font-medium">{unavailableTitle}</p>
        <p className="text-muted-foreground mt-1 text-sm">{unavailableMessage}</p>
      </div>
    );
  }

  return (
    <KanbanBoardProvider>
      <KanbanBoard>
        {displayedStages.map((stage) => {
          const stageLabel = getStageLabel(stage);

          if (collapsedStageIds.has(stage.id)) {
            return (
              <button
                key={stage.id}
                type="button"
                className="flex max-h-full flex-shrink-0 cursor-pointer flex-col items-center gap-2 rounded-lg border border-border bg-sidebar px-1 py-3 transition-colors hover:bg-accent"
                onClick={() => toggleCollapse(stage.id)}
                title={expandStageLabel(stageLabel)}
              >
                <KanbanColorCircle color={STAGE_COLORS[stage.category] ?? "gray"} />
                <span className="text-xs font-medium text-muted-foreground [writing-mode:vertical-rl]">
                  {stageLabel}
                </span>
                <span className="text-xs text-muted-foreground">{stage.items.length}</span>
              </button>
            );
          }

          return (
            <KanbanBoardColumn
              key={stage.id}
              columnId={stage.id}
              onDropOverColumn={handleDropOnColumn(stage.id)}
            >
              <KanbanBoardColumnHeader>
                <KanbanBoardColumnTitle columnId={stage.id} className="text-foreground font-bold">
                  <KanbanColorCircle color={STAGE_COLORS[stage.category] ?? "gray"} />
                  {stageLabel}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {stage.items.length}
                  </span>
                </KanbanBoardColumnTitle>
                <button
                  type="button"
                  className="p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => toggleCollapse(stage.id)}
                  title={hideStageLabel(stageLabel)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              </KanbanBoardColumnHeader>
              <KanbanBoardColumnList>
                {stage.items.map((item) => {
                  const itemId = getItemId(item);
                  return (
                    <KanbanBoardColumnListItem
                      key={itemId}
                      cardId={itemId}
                      onDropOverListItem={handleDropOnListItem(stage, itemId)}
                    >
                      <KanbanBoardCard
                        data={
                          { id: itemId, currentStageId: stage.id } as {
                            id: string;
                            currentStageId: string;
                          }
                        }
                      >
                        {renderCard(item)}
                      </KanbanBoardCard>
                    </KanbanBoardColumnListItem>
                  );
                })}
              </KanbanBoardColumnList>
            </KanbanBoardColumn>
          );
        })}
        <KanbanBoardExtraMargin />
      </KanbanBoard>
    </KanbanBoardProvider>
  );
};

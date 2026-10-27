// Reference example: https://ui.tailor.tech/patterns/timeline
import * as React from "react";
import { ChevronDown, ChevronUp, Plus, Scissors, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../shared/popover";
import { cn } from "@/lib/utils";
import { Timeline } from "./Timeline";

// An editable timeline built on the Timeline primitive. It deliberately keeps
// two ideas separate:
//
//   • Time — the bars form a contiguous 100% partition. Adjacent-in-time bars
//     share a movable boundary, so dragging one edge trims its time neighbor.
//     This coupling is purely temporal and does not care which lane a bar is on.
//   • Lanes — named rows a bar is assigned to (renameable in the left gutter).
//     A bar can be moved to any lane; because bars never overlap in time, two
//     bars can happily share one lane.
//
// The primitive only owns geometry; every edit below is app-level state.

const HOUR = 60 * 60 * 1000;
const SNAP = 15 * 60 * 1000; // snap edits to the nearest quarter hour
const MIN_WIDTH = HOUR; // a bar is at least one hour wide
const ROW_HEIGHT = 44;
const BAR_INSET = 6;
const AXIS_HEIGHT = 28;
const GUTTER_WIDTH = 148;

const PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

type Lane = { id: string; name: string };
type Segment = {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
  laneId: string;
};

const snap = (ms: number) => Math.round(ms / SNAP) * SNAP;

// A single working day, 06:00 – 18:00.
const projectStart = new Date(2025, 0, 1, 6, 0, 0).getTime();
const projectEnd = new Date(2025, 0, 1, 18, 0, 0).getTime();

const initialLanes = (): Lane[] => [
  { id: "lane-0", name: "Lane 1" },
  { id: "lane-1", name: "Lane 2" },
  { id: "lane-2", name: "Lane 3" },
];
const initialSegments = (): Segment[] => [
  {
    id: "segment-0",
    label: "Phase 1",
    start: projectStart,
    end: projectEnd,
    color: PALETTE[0],
    laneId: "lane-0",
  },
];

// One boundary per hour from 06:00 to 18:00 (13 lines, 12 hourly slots).
const HOURS = Math.round((projectEnd - projectStart) / HOUR);
const boundaries = Array.from(
  { length: HOURS + 1 },
  (_, index) => projectStart + index * HOUR,
);

const timeboxes = boundaries.slice(0, -1).map((start, index) => ({
  key: index,
  start,
  end: boundaries[index + 1],
  label: (
    <span className="px-1 text-xs text-muted-foreground">
      {new Date(start).getHours()}:00
    </span>
  ),
}));

// A contiguous partition means every boundary is a shared value: some bar's end
// equals the next bar's start. These find the bar on either side of a boundary.
const prevOf = (segments: Segment[], segment: Segment) =>
  segments.find((other) => other.end === segment.start);
const nextOf = (segments: Segment[], segment: Segment) =>
  segments.find((other) => other.start === segment.end);

export function GanttEditor() {
  const [lanes, setLanes] = React.useState<Lane[]>(initialLanes);
  const [segments, setSegments] = React.useState<Segment[]>(initialSegments);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [dragOverLane, setDragOverLane] = React.useState<string | null>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const idCounter = React.useRef(0);
  // True while a resize-handle drag is in flight, so the bar's native HTML5
  // drag (used for lane moves) does not also fire.
  const resizingRef = React.useRef(false);
  const drag = React.useRef<{
    leftId: string;
    rightId: string;
    originBoundary: number;
    startX: number;
    width: number;
  } | null>(null);

  // `-g` marks a generated id so it can never collide with the fixed initial
  // ids (`lane-0`, `segment-0`, …).
  const nextId = (prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-g${idCounter.current}`;
  };

  const renameLane = (laneId: string, name: string) => {
    setLanes((current) =>
      current.map((lane) => (lane.id === laneId ? { ...lane, name } : lane)),
    );
  };

  const addLane = () => {
    const id = nextId("lane");
    setLanes((current) => [...current, { id, name: `Lane ${current.length + 1}` }]);
  };

  const recolor = (id: string, color: string) => {
    setSegments((current) =>
      current.map((segment) => (segment.id === id ? { ...segment, color } : segment)),
    );
  };

  // Split at the midpoint. The new half keeps the color (splitting is not a
  // recolor) and drops onto the next lane down when one exists, otherwise it
  // stays in the same lane. Lanes are a fixed set — split never creates one.
  const split = (id: string) => {
    setOpenId(null);
    const target = segments.find((segment) => segment.id === id);
    if (!target) return;
    const mid = Math.min(
      Math.max(snap((target.start + target.end) / 2), target.start + MIN_WIDTH),
      target.end - MIN_WIDTH,
    );
    if (mid <= target.start || mid >= target.end) return;

    const laneIndex = lanes.findIndex((lane) => lane.id === target.laneId);
    const laneId = lanes[laneIndex + 1]?.id ?? target.laneId;

    // Build the id outside the updater so the updater stays pure (React
    // StrictMode double-invokes updaters in dev).
    const nextSegments = segments
      .map((segment) => (segment.id === id ? { ...segment, end: mid } : segment))
      .concat({
        ...target,
        id: nextId("segment"),
        label: `Phase ${segments.length + 1}`,
        start: mid,
        laneId,
      });
    setSegments(nextSegments);
  };

  // Move a bar onto a specific lane (used by drag-and-drop). Lanes are a fixed
  // set, so an emptied lane simply stays in place.
  const assignLane = (segmentId: string, laneId: string) => {
    setSegments((current) =>
      current.map((item) => (item.id === segmentId ? { ...item, laneId } : item)),
    );
  };

  // Reassign a bar to the lane above / below it.
  const moveToAdjacentLane = (segmentId: string, direction: -1 | 1) => {
    setOpenId(null);
    const segment = segments.find((item) => item.id === segmentId);
    if (!segment) return;
    const laneIndex = lanes.findIndex((lane) => lane.id === segment.laneId);
    const target = lanes[laneIndex + direction];
    if (!target) return;
    setSegments((current) =>
      current.map((item) => (item.id === segmentId ? { ...item, laneId: target.id } : item)),
    );
  };

  // Remove a bar and hand its time range to a time-neighbor so the track stays a
  // gap-free 100% partition. Lanes are fixed, so none are removed.
  const remove = (id: string) => {
    setOpenId(null);
    if (segments.length <= 1) return;
    const target = segments.find((segment) => segment.id === id);
    if (!target) return;
    const previous = prevOf(segments, target);
    const nextSegments = segments
      .filter((segment) => segment.id !== id)
      .map((segment) => {
        if (previous && segment.id === previous.id) {
          return { ...segment, end: target.end };
        }
        if (!previous && segment.start === target.end) {
          return { ...segment, start: target.start };
        }
        return segment;
      });
    setSegments(nextSegments);
  };

  const onPointerMove = React.useCallback((event: PointerEvent) => {
    const state = drag.current;
    if (!state || state.width <= 0) return;
    const deltaMs = ((event.clientX - state.startX) / state.width) * (projectEnd - projectStart);

    setSegments((current) => {
      const left = current.find((segment) => segment.id === state.leftId);
      const right = current.find((segment) => segment.id === state.rightId);
      if (!left || !right) return current;

      // Move the shared boundary relative to where it began (never the already
      // moved value, or the motion compounds). Each side keeps its far edge.
      const boundary = Math.min(
        Math.max(snap(state.originBoundary + deltaMs), left.start + MIN_WIDTH),
        right.end - MIN_WIDTH,
      );
      return current.map((segment) => {
        if (segment.id === left.id) return { ...segment, end: boundary };
        if (segment.id === right.id) return { ...segment, start: boundary };
        return segment;
      });
    });
  }, []);

  const endDrag = React.useCallback(() => {
    drag.current = null;
    resizingRef.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
  }, [onPointerMove]);

  const startBoundaryDrag = (
    event: React.PointerEvent,
    leftId: string,
    rightId: string,
    originBoundary: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    resizingRef.current = true;
    drag.current = {
      leftId,
      rightId,
      originBoundary,
      startX: event.clientX,
      width: bodyRef.current?.getBoundingClientRect().width ?? 0,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
  };

  React.useEffect(() => endDrag, [endDrag]);

  const reset = () => {
    setOpenId(null);
    setLanes(initialLanes());
    setSegments(initialSegments());
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Rename a lane in the left column. Click a bar to recolor or split it,
          or drag a bar up/down onto another lane. Drag either edge — the
          time-neighbor on that side follows, keeping its far edge pinned.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          Reset
        </button>
      </div>

      <div className="flex w-full">
        <div style={{ width: GUTTER_WIDTH, flexShrink: 0, paddingTop: AXIS_HEIGHT }}>
          {lanes.map((lane) => (
            <div key={lane.id} className="flex items-center pr-2" style={{ height: ROW_HEIGHT }}>
              <input
                value={lane.name}
                onChange={(event) => renameLane(lane.id, event.target.value)}
                aria-label={`Rename ${lane.name}`}
                className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm hover:border-border focus:border-ring focus:bg-background focus:outline-none"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addLane}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded-md border border-dashed px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-3.5" aria-hidden />
            Add lane
          </button>
        </div>

        <div ref={bodyRef} className="flex-1">
          <Timeline.Root start={projectStart} end={projectEnd}>
            <Timeline.Viewport
              axis={{
                guides: boundaries.map((at) => ({
                  at,
                  axisStyle: { background: "var(--border)" },
                  bodyStyle: { background: "var(--border)" },
                })),
                levels: [{ kind: "spans", items: timeboxes }],
              }}
            >
              {lanes.map((lane, laneIndex) => (
                <Timeline.Row key={lane.id} height={ROW_HEIGHT}>
                  <div
                    className={cn(
                      "absolute inset-0 rounded-md transition-shadow",
                      dragOverLane === lane.id && "ring-2 ring-inset ring-ring/70",
                    )}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      if (dragOverLane !== lane.id) setDragOverLane(lane.id);
                    }}
                    onDragLeave={() =>
                      setDragOverLane((current) => (current === lane.id ? null : current))
                    }
                    onDrop={(event) => {
                      event.preventDefault();
                      const id = event.dataTransfer.getData("text/plain");
                      setDragOverLane(null);
                      if (id) assignLane(id, lane.id);
                    }}
                  >
                  {segments
                    .filter((segment) => segment.laneId === lane.id)
                    .map((segment) => {
                      const previous = prevOf(segments, segment);
                      const next = nextOf(segments, segment);
                      return (
                        <Timeline.Interval
                          key={segment.id}
                          id={segment.id}
                          start={segment.start}
                          end={segment.end}
                          insetY={BAR_INSET}
                        >
                          <BarView
                            segment={segment}
                            open={openId === segment.id}
                            hasPrev={!!previous}
                            hasNext={!!next}
                            canDelete={segments.length > 1}
                            canMoveUp={laneIndex > 0}
                            canMoveDown={laneIndex < lanes.length - 1}
                            onOpenChange={(open) => setOpenId(open ? segment.id : null)}
                            onRecolor={(color) => recolor(segment.id, color)}
                            onSplit={() => split(segment.id)}
                            onDelete={() => remove(segment.id)}
                            onMoveUp={() => moveToAdjacentLane(segment.id, -1)}
                            onMoveDown={() => moveToAdjacentLane(segment.id, 1)}
                            onDragStartBar={(event) => {
                              // Don't hijack a resize-handle drag.
                              if (resizingRef.current) {
                                event.preventDefault();
                                return;
                              }
                              setOpenId(null);
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", segment.id);
                            }}
                            onResizeLeftStart={(event) =>
                              previous &&
                              startBoundaryDrag(event, previous.id, segment.id, segment.start)
                            }
                            onResizeRightStart={(event) =>
                              next &&
                              startBoundaryDrag(event, segment.id, next.id, segment.end)
                            }
                          />
                        </Timeline.Interval>
                      );
                    })}
                  </div>
                </Timeline.Row>
              ))}
            </Timeline.Viewport>
          </Timeline.Root>
        </div>
      </div>
    </div>
  );
}

type BarViewProps = {
  segment: Segment;
  open: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  canDelete: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onOpenChange: (open: boolean) => void;
  onRecolor: (color: string) => void;
  onSplit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStartBar: (event: React.DragEvent) => void;
  onResizeLeftStart: (event: React.PointerEvent) => void;
  onResizeRightStart: (event: React.PointerEvent) => void;
};

function BarView({
  segment,
  open,
  hasPrev,
  hasNext,
  canDelete,
  canMoveUp,
  canMoveDown,
  onOpenChange,
  onRecolor,
  onSplit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStartBar,
  onResizeLeftStart,
  onResizeRightStart,
}: BarViewProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          draggable
          onDragStart={onDragStartBar}
          className="group relative flex h-full w-full min-w-0 cursor-grab items-center overflow-hidden rounded-lg shadow-sm active:cursor-grabbing"
          style={{ background: segment.color }}
        >
          <span className="truncate px-2.5 text-xs font-semibold text-white">
            {segment.label}
          </span>
          {hasPrev ? (
            <span
              onPointerDown={onResizeLeftStart}
              onDragStart={(event) => event.preventDefault()}
              className="absolute inset-y-0 left-0 w-2.5 cursor-ew-resize bg-black/0 transition-colors group-hover:bg-black/25"
              aria-hidden
            />
          ) : null}
          {hasNext ? (
            <span
              onPointerDown={onResizeRightStart}
              onDragStart={(event) => event.preventDefault()}
              className="absolute inset-y-0 right-0 w-2.5 cursor-ew-resize bg-black/0 transition-colors group-hover:bg-black/25"
              aria-hidden
            />
          ) : null}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-auto p-2">
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Set color ${color}`}
                onClick={() => onRecolor(color)}
                className={cn(
                  "size-6 rounded-full border transition-transform hover:scale-110",
                  segment.color === color && "ring-2 ring-ring ring-offset-1",
                )}
                style={{ background: color }}
              />
            ))}
          </div>
          <div className="flex gap-1 border-t pt-2">
            <MenuButton onClick={onMoveUp} disabled={!canMoveUp} label="Move up">
              <ChevronUp className="size-3.5" aria-hidden />
            </MenuButton>
            <MenuButton onClick={onMoveDown} disabled={!canMoveDown} label="Move down">
              <ChevronDown className="size-3.5" aria-hidden />
            </MenuButton>
            <MenuButton onClick={onSplit} label="Split">
              <Scissors className="size-3.5" aria-hidden />
              Split
            </MenuButton>
            <MenuButton
              onClick={onDelete}
              disabled={!canDelete}
              label="Delete"
              className="text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </MenuButton>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MenuButton({
  onClick,
  disabled,
  label,
  className,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

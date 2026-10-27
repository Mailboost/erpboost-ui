// Reference example: https://ui.tailor.tech/patterns/data-charts
/**
 * Catalogue demo: third-party Gantt chart with per-row edit popovers.
 * Persistence is in-memory only (no network).
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Tabs } from "@mailboost/erpboost-ui";
import { Gantt, ViewMode, type Task } from "gantt-task-react";
import { Calendar as CalendarRowIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../shared/popover";
import { DatePickerField } from "../shared/date-picker-field";
import "gantt-task-react/dist/index.css";
import "./GanttChart.css";

/** One persisted milestone row (IDs align with `milestoneOrder`). */
export interface ScheduleRecord {
  milestoneType: string;
  plannedStartDate: string;
  plannedEndDate: string;
}

/** Display labels for catalogue sample milestones (neutral keys, no product-domain enums). */
export const milestoneTypeLabel: Record<string, string> = {
  "milestone-kickoff": "Kickoff & alignment",
  "milestone-discovery": "Discovery",
  "milestone-build": "Build",
  "milestone-test": "Test & stabilization",
  "milestone-release-prep": "Release prep",
  "milestone-go-live": "Go-live",
};

const milestoneOrder = [
  "milestone-kickoff",
  "milestone-discovery",
  "milestone-build",
  "milestone-test",
  "milestone-release-prep",
  "milestone-go-live",
] as const;

const viewModeOptions: { value: ViewMode; label: string }[] = [
  { value: ViewMode.Week, label: "Week" },
  { value: ViewMode.Month, label: "Month" },
  { value: ViewMode.Year, label: "Year" },
];

type MilestoneType = (typeof milestoneOrder)[number];

interface ScheduleEntry {
  milestoneType: MilestoneType;
  plannedStartDate: string;
  plannedEndDate: string;
}

const LIST_CELL_WIDTH_PX = 240;
const ROW_HEIGHT_PX = 48;
const HEADER_HEIGHT_PX = 50;
/** バー矩形の ry/rx（8 は行高に対して効き過ぎるためやや抑制） */
const BAR_CORNER_RADIUS_PX = 6;
/** 行高に対するバー縦サイズの割合（%）。低いほどバーだけ細く見える */
const BAR_FILL_PERCENT = 62;

function buildEntries(schedules: ScheduleRecord[]): ScheduleEntry[] {
  const byType = new Map<string, ScheduleRecord>();
  schedules.forEach((s) => byType.set(s.milestoneType, s));
  return milestoneOrder.map((milestoneType) => {
    const found = byType.get(milestoneType);
    return {
      milestoneType,
      plannedStartDate: found?.plannedStartDate ?? "",
      plannedEndDate: found?.plannedEndDate ?? "",
    };
  });
}

function toChartDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toInclusiveEndDate(value: string): Date {
  const date = toChartDate(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function formatScheduleDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromTaskEndDate(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function isMilestoneType(value: string): value is MilestoneType {
  return milestoneOrder.includes(value as MilestoneType);
}

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Gantt の SVG（タイムヘッダー / バーラベル）と左の行リスト、ホバーカードに使う書体。
 * Inter は同梱しないので、組込先のアプリで読み込んでいなければ ui-sans-serif にフォールバック。
 */
const GANTT_FONT_FAMILY =
  '"Inter", ui-sans-serif, system-ui, sans-serif';

/**
 * Hover card for bars (replacing library default: d-m-y wording, unrelated progress row).
 */
function GanttCatalogueTooltipContent({
  task,
  fontFamily,
  fontSize,
}: {
  task: Task;
  fontFamily: string;
  fontSize: string;
}) {
  const typography = { fontFamily, fontSize } as const;

  if (task.isDisabled) {
    return (
      <div
        className="max-w-[18rem] rounded-lg border border-border bg-card px-3 py-2.5 text-card-foreground shadow-md"
        style={typography}
      >
        <p className="text-sm font-semibold leading-snug">{task.name}</p>
        <p className="mt-2 text-muted-foreground">
          No dates yet — open the calendar on this row to set the schedule.
        </p>
      </div>
    );
  }

  const startLabel = formatScheduleDate(task.start);
  const endLabel = formatScheduleDate(fromTaskEndDate(task.end));
  const durationDays =
    ~~((task.end.getTime() - task.start.getTime()) / DAY_MS);

  return (
    <div
      className="max-w-[18rem] rounded-lg border border-border bg-card px-3 py-2.5 text-card-foreground shadow-md"
      style={typography}
    >
      <p className="text-sm font-semibold leading-snug">{task.name}</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1 gap-y-0.5 tabular-nums text-muted-foreground">
        <span>{startLabel}</span>
        <span className="text-foreground/40" aria-hidden>
          —
        </span>
        <span>{endLabel}</span>
      </p>
      {durationDays !== 0 ?
        <p className="mt-1.5 text-xs text-muted-foreground">
          Duration: {durationDays} day(s)
        </p>
      : null}
    </div>
  );
}

const SAMPLE_SCHEDULES: ScheduleRecord[] = [
  {
    milestoneType: "milestone-kickoff",
    plannedStartDate: "2026-01-06",
    plannedEndDate: "2026-01-20",
  },
  {
    milestoneType: "milestone-discovery",
    plannedStartDate: "2026-02-01",
    plannedEndDate: "2026-02-25",
  },
  {
    milestoneType: "milestone-build",
    plannedStartDate: "2026-03-01",
    plannedEndDate: "2026-04-15",
  },
  {
    milestoneType: "milestone-test",
    plannedStartDate: "2026-04-10",
    plannedEndDate: "2026-05-05",
  },
  {
    milestoneType: "milestone-release-prep",
    plannedStartDate: "2026-05-12",
    plannedEndDate: "2026-05-28",
  },
  {
    milestoneType: "milestone-go-live",
    plannedStartDate: "2026-06-01",
    plannedEndDate: "",
  },
];

type Props = {
  /** When omitted, a built-in neutral sample schedule is used. */
  initialSchedules?: ScheduleRecord[];
};

type PersistOutcome =
  | { ok: true }
  | { ok: false; message: string };

function MilestoneDateEditPopoverContent({
  milestoneType,
  milestoneLabel,
  plannedStartDate,
  plannedEndDate,
  persistEntry,
  onPersistSuccess,
  onClose,
}: {
  milestoneType: MilestoneType;
  milestoneLabel: string;
  plannedStartDate: string;
  plannedEndDate: string;
  persistEntry: (
    milestoneType: MilestoneType,
    plannedStartDate: string,
    plannedEndDate: string,
  ) => PersistOutcome;
  onPersistSuccess?: () => void;
  onClose: () => void;
}) {
  const startControlId = `milestone-${milestoneType}-start`;
  const endControlId = `milestone-${milestoneType}-end`;

  const [start, setStart] = useState(plannedStartDate);
  const [end, setEnd] = useState(plannedEndDate);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setStart(plannedStartDate);
    setEnd(plannedEndDate);
    setLocalError(null);
  }, [milestoneType, plannedStartDate, plannedEndDate]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold leading-snug">{milestoneLabel}</p>

      <div className="flex flex-col gap-3">
        <DatePickerField
          id={startControlId}
          label="Start date"
          placeholder="Pick start date"
          value={start}
          onChange={setStart}
        />
        <DatePickerField
          id={endControlId}
          label="End date"
          placeholder="Pick end date"
          value={end}
          onChange={setEnd}
        />
      </div>

      {localError ?
        <p className="text-xs text-destructive">{localError}</p>
      : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            const result = persistEntry(milestoneType, start, end);
            if (!result.ok) {
              setLocalError(result.message);
              return;
            }
            onPersistSuccess?.();
            onClose();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export function GanttChart({ initialSchedules }: Props) {
  const seed = initialSchedules ?? SAMPLE_SCHEDULES;
  const [schedules, setSchedules] = useState<ScheduleRecord[]>(seed);
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [openedMilestoneEditor, setOpenedMilestoneEditor] =
    useState<MilestoneType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const entries = useMemo(() => buildEntries(schedules), [schedules]);
  const hasAnyDrawn = useMemo(
    () => entries.some((e) => e.plannedStartDate && e.plannedEndDate),
    [entries],
  );

  const tasks = useMemo<Task[]>(() => {
    // For pending rows we still need a Date range so the row participates in
    // the Gantt grid, but the bar must not be visible. Place a zero-width
    // transparent bar at the earliest drawn start (or today when nothing has
    // been scheduled yet) so the timeline doesn't stretch awkwardly.
    const drawnStartsMs = entries
      .filter((e) => e.plannedStartDate && e.plannedEndDate)
      .map((e) => toChartDate(e.plannedStartDate).getTime());
    const placeholderStart =
      drawnStartsMs.length > 0
        ? new Date(Math.min(...drawnStartsMs))
        : new Date();
    const placeholderEnd = new Date(placeholderStart.getTime());

    let previousDrawnId: MilestoneType | null = null;

    return entries.map((entry) => {
      const hasDates = !!entry.plannedStartDate && !!entry.plannedEndDate;
      if (hasDates) {
        const dependencies = previousDrawnId ? [previousDrawnId] : undefined;
        previousDrawnId = entry.milestoneType;
        return {
          id: entry.milestoneType,
          name: milestoneTypeLabel[entry.milestoneType] ?? entry.milestoneType,
          type: "task",
          start: toChartDate(entry.plannedStartDate),
          end: toInclusiveEndDate(entry.plannedEndDate),
          progress: 100,
          dependencies,
          styles: {
            backgroundColor: "var(--primary)",
            backgroundSelectedColor:
              "color-mix(in oklab, var(--primary) 88%, var(--foreground))",
            progressColor: "var(--primary)",
            progressSelectedColor:
              "color-mix(in oklab, var(--primary) 88%, var(--foreground))",
          },
        };
      }
      return {
        id: entry.milestoneType,
        name: milestoneTypeLabel[entry.milestoneType] ?? entry.milestoneType,
        type: "task",
        start: placeholderStart,
        end: placeholderEnd,
        progress: 0,
        isDisabled: true,
        styles: {
          backgroundColor: "transparent",
          backgroundSelectedColor: "transparent",
          progressColor: "transparent",
          progressSelectedColor: "transparent",
        },
      };
    });
  }, [entries]);

  const persistEntry = useCallback(
    (
      milestoneType: MilestoneType,
      plannedStartDate: string,
      plannedEndDate: string,
    ): PersistOutcome => {
      if (
        plannedStartDate &&
        plannedEndDate &&
        plannedStartDate > plannedEndDate
      ) {
        return {
          ok: false,
          message: "Start date must be on or before end date.",
        };
      }
      setSchedules((prev) => {
        const rest = prev.filter((s) => s.milestoneType !== milestoneType);
        return [
          ...rest,
          { milestoneType, plannedStartDate, plannedEndDate },
        ];
      });
      return { ok: true };
    },
    [],
  );

  const handleDateChange = useCallback(
    async (task: Task) => {
      if (!isMilestoneType(task.id)) return false;
      // Placeholder bars for pending rows are disabled; ignore any drag.
      if (task.isDisabled) return false;
      const plannedStartDate = formatScheduleDate(task.start);
      const plannedEndDate = formatScheduleDate(fromTaskEndDate(task.end));
      const result = persistEntry(task.id, plannedStartDate, plannedEndDate);
      if (!result.ok) {
        setErrorMsg(
          `${milestoneTypeLabel[task.id] ?? task.id}: ${result.message}`,
        );
        return false;
      }
      setErrorMsg(null);
      return true;
    },
    [persistEntry],
  );

  const TaskListHeader = useMemo(
    () =>
      function TaskListHeaderImpl({
        headerHeight,
        rowWidth,
        fontFamily,
        fontSize,
      }: {
        headerHeight: number;
        rowWidth: string;
        fontFamily: string;
        fontSize: string;
      }) {
        return (
          <div
            className="flex items-center border-t border-b border-border bg-muted/30 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            style={{
              height: headerHeight,
              width: rowWidth,
              fontFamily,
              fontSize,
            }}
          >
            Milestone
          </div>
        );
      },
    [],
  );

  const TaskListTable = useMemo(
    () =>
      function TaskListTableImpl({
        rowHeight,
        rowWidth,
        fontFamily,
        fontSize,
        tasks: taskRows,
      }: {
        rowHeight: number;
        rowWidth: string;
        fontFamily: string;
        fontSize: string;
        locale: string;
        tasks: Task[];
        selectedTaskId: string;
        setSelectedTask: (taskId: string) => void;
        onExpanderClick: (task: Task) => void;
      }) {
        return (
          <div style={{ fontFamily, fontSize }}>
            {taskRows.map((task) => {
              const isPending = task.isDisabled === true;
              const mt = task.id;
              const rowEntry =
                isMilestoneType(mt) ?
                  entries.find((e) => e.milestoneType === mt)
                : undefined;
              const rowStart = rowEntry?.plannedStartDate ?? "";
              const rowEnd = rowEntry?.plannedEndDate ?? "";

              const editDisabled = !isMilestoneType(mt);

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2 border-b border-border px-3"
                  style={{ height: rowHeight, width: rowWidth }}
                >
                  <span
                    className={
                      isPending
                        ? "truncate font-medium text-muted-foreground"
                        : "truncate font-medium text-foreground"
                    }
                    title={
                      isPending
                        ? `${task.name} (no dates set yet)`
                        : undefined
                    }
                  >
                    {task.name}
                  </span>
                  <Popover
                    modal={false}
                    open={!editDisabled && openedMilestoneEditor === mt}
                    onOpenChange={(next) => {
                      if (!isMilestoneType(mt)) return;
                      setOpenedMilestoneEditor(next ? mt : null);
                      if (next) {
                        setErrorMsg(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-foreground disabled:opacity-45"
                        disabled={editDisabled}
                        aria-label={`Open schedule for ${task.name}`}
                        aria-haspopup="dialog"
                      >
                        <CalendarRowIcon className="size-4" aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={4}
                      collisionPadding={12}
                      className="z-[130] w-[min(calc(100vw-32px),20rem)] p-4"
                    >
                      {!editDisabled && isMilestoneType(mt) && (
                        <MilestoneDateEditPopoverContent
                          milestoneType={mt}
                          milestoneLabel={
                            milestoneTypeLabel[mt] ?? mt
                          }
                          plannedStartDate={rowStart}
                          plannedEndDate={rowEnd}
                          persistEntry={persistEntry}
                          onPersistSuccess={() => setErrorMsg(null)}
                          onClose={() => setOpenedMilestoneEditor(null)}
                        />
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}
          </div>
        );
      },
    [persistEntry, entries, openedMilestoneEditor],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-semibold">Project schedule</h3>
          <p className="text-sm text-muted-foreground">
            Edit dates via the calendar icon on each row. Type start and end as{" "}
            <code className="text-xs font-mono text-foreground/90">YYYY-MM-DD</code>{" "}
            or pick a month with the calendar button next to the input (Radix
            Popover + react-day-picker,{" "}
            <code className="text-xs font-mono text-foreground/90">
              src/components/ui
            </code>
            ).
          </p>
        </div>
        <Tabs.Root
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
          className="w-fit shrink-0 gap-0"
        >
          <Tabs.List aria-label="Timeline scale">
            {viewModeOptions.map((opt) => (
              <Tabs.Tab key={opt.value} value={opt.value}>
                {opt.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </div>

      <div className="tailor-gantt-chart overflow-x-auto">
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          locale="en"
          listCellWidth={`${LIST_CELL_WIDTH_PX}px`}
          columnWidth={viewMode === ViewMode.Year ? 120 : 72}
          ganttHeight={tasks.length * ROW_HEIGHT_PX + 8}
          rowHeight={ROW_HEIGHT_PX}
          headerHeight={HEADER_HEIGHT_PX}
          barCornerRadius={BAR_CORNER_RADIUS_PX}
          barFill={BAR_FILL_PERCENT}
          fontFamily={GANTT_FONT_FAMILY}
          fontSize="13px"
          todayColor="var(--muted)"
          TooltipContent={GanttCatalogueTooltipContent}
          TaskListHeader={TaskListHeader}
          TaskListTable={TaskListTable}
          onDateChange={(task) => handleDateChange(task)}
        />
      </div>

      {!hasAnyDrawn && (
        <p className="text-xs text-muted-foreground">
          No milestones have both start and end dates yet — bars will appear
          here once you fill them in from the edit popover.
        </p>
      )}

      {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
    </div>
  );
}

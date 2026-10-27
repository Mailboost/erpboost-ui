// Reference example: https://ui.tailor.tech/patterns/timeline
import { Timeline } from "./Timeline";

// A read-only view showing the two primitive features the editor does not:
// dependency links between bars, and multiple bars sharing a single lane.

const ROW_HEIGHT = 40;

const day = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
};

const start = day("2025-01-01");
const end = day("2025-03-31");

const boundaries = Array.from(
  { length: 7 },
  (_, index) => start + ((end - start) * index) / 6,
);

const timeboxes = boundaries.slice(0, -1).map((from, index) => ({
  key: index,
  start: from,
  end: boundaries[index + 1],
  label: (
    <span className="px-2 text-xs text-muted-foreground">
      {new Date(from).toLocaleDateString("en", { month: "short", day: "numeric" })}
    </span>
  ),
}));

type Segment = { id: string; label: string; start: number; end: number; color: string };
type Task = { id: string; label: string; segments: Segment[] };

const tasks: Task[] = [
  {
    id: "design",
    label: "Design",
    segments: [
      { id: "design", label: "Design", start: day("2025-01-01"), end: day("2025-01-20"), color: "#3b82f6" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    segments: [
      { id: "backend", label: "API build", start: day("2025-01-15"), end: day("2025-02-15"), color: "#10b981" },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    segments: [
      { id: "frontend", label: "Foundation", start: day("2025-02-01"), end: day("2025-02-20"), color: "#f59e0b" },
    ],
  },
  {
    id: "docs",
    label: "Docs & QA",
    segments: [
      { id: "docs", label: "Docs", start: day("2025-02-20"), end: day("2025-03-06"), color: "#f97316" },
      { id: "qa", label: "QA", start: day("2025-03-08"), end: day("2025-03-22"), color: "#ef4444" },
    ],
  },
];

const dependencies = [
  { from: "design", to: "backend" },
  { from: "backend", to: "frontend" },
  { from: "frontend", to: "docs" },
];

function Bar({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="flex h-full w-full min-w-0 items-center overflow-hidden rounded-lg px-2.5 text-xs font-semibold text-white shadow-sm"
      style={{ background: color }}
    >
      <span className="truncate">{label}</span>
    </div>
  );
}

export function DependencyTimeline() {
  return (
    <div className="flex w-full">
      <div style={{ width: 120, flexShrink: 0, paddingTop: 28 }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center text-sm"
            style={{ height: ROW_HEIGHT }}
          >
            {task.label}
          </div>
        ))}
      </div>
      <div className="flex-1">
        <Timeline.Root start={start} end={end}>
          <Timeline.Viewport
            axis={{
              guides: boundaries.map((at) => ({
                at,
                axisStyle: { background: "var(--border)" },
                bodyStyle: { background: "var(--border)" },
              })),
              levels: [{ kind: "spans", items: timeboxes }],
            }}
            linkDefaults={{
              style: { color: "var(--muted-foreground)" },
              strokeWidth: 1.5,
            }}
          >
            {tasks.map((task, index) => (
              <Timeline.Row
                key={task.id}
                height={ROW_HEIGHT}
                background={index % 2 === 1 ? { style: { background: "var(--muted)", opacity: 0.4 } } : null}
              >
                {task.segments.map((segment) => (
                  <Timeline.Interval
                    key={segment.id}
                    id={segment.id}
                    start={segment.start}
                    end={segment.end}
                    insetY={6}
                  >
                    <Bar label={segment.label} color={segment.color} />
                  </Timeline.Interval>
                ))}
              </Timeline.Row>
            ))}

            {dependencies.map((dependency) => (
              <Timeline.Link
                key={`${dependency.from}-${dependency.to}`}
                from={dependency.from}
                to={dependency.to}
              />
            ))}
          </Timeline.Viewport>
        </Timeline.Root>
      </div>
    </div>
  );
}

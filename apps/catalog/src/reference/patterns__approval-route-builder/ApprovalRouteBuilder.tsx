// Reference example: https://ui.tailor.tech/patterns/approval-route-builder
import { Fragment, useMemo, useState, type DragEvent } from "react";
import { Button, Card, Combobox, Select } from "@mailboost/erpboost-ui";
import {
  ArrowDown,
  Braces,
  ChevronRight,
  GripVertical,
  Minus,
  Plus,
  Save,
  TriangleAlert,
  Workflow,
  X,
} from "lucide-react";

type StageRule = "all" | "any" | "quorum";

type Stage = {
  id: string;
  name: string;
  rule: StageRule;
  quorum: number; // used when rule === "quorum"
  approvers: string[];
};

type ApproverKind = "user" | "role" | "manager";

const newId = () => `s_${Math.random().toString(36).slice(2, 8)}`;

// The directory the combobox picks from. Grouped so the dropdown separates
// people, roles, and dynamic references; the group also tells us each pick's
// kind when serializing the route.
const approverGroups: { label: string; kind: ApproverKind; items: string[] }[] =
  [
    {
      label: "People",
      kind: "user",
      items: [
        "Alex Murphy",
        "Dana Lewis",
        "Sam Porter",
        "Jordan Blake",
        "Riley Chen",
      ],
    },
    {
      label: "Roles",
      kind: "role",
      items: ["Finance team", "Directors", "Legal"],
    },
    {
      label: "Dynamic",
      kind: "manager",
      items: ["Requester's manager"],
    },
  ];

const approverItems = approverGroups.map((g) => ({
  label: g.label,
  items: g.items,
}));

const kindOf = (name: string): ApproverKind =>
  approverGroups.find((g) => g.items.includes(name))?.kind ?? "user";

const rules: { rule: StageRule; label: string }[] = [
  { rule: "all", label: "All must approve" },
  { rule: "any", label: "Any one approves" },
  { rule: "quorum", label: "Quorum" },
];

const ruleLabels = Object.fromEntries(
  rules.map((r) => [r.rule, r.label]),
) as Record<StageRule, string>;

const initialStages: Stage[] = [
  {
    id: newId(),
    name: "Team lead review",
    rule: "all",
    quorum: 1,
    approvers: ["Requester's manager"],
  },
  {
    id: newId(),
    name: "Finance check",
    rule: "any",
    quorum: 1,
    approvers: ["Finance team", "Dana Lewis"],
  },
  {
    id: newId(),
    name: "Director sign-off",
    rule: "quorum",
    quorum: 2,
    approvers: ["Alex Murphy", "Sam Porter", "Directors"],
  },
];

// Renders as plain text; on hover/focus reveals an editor affordance. Lets the
// route name and stage names be edited inline from within the live preview.
const inlineBase =
  "w-full rounded-sm border border-transparent bg-transparent outline-none transition-colors hover:bg-muted/40 focus:border-input focus:bg-card focus:ring-2 focus:ring-ring/30";

const InlineText = ({
  value,
  onChange,
  placeholder,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) => (
  <input
    aria-label={ariaLabel}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className={`${inlineBase} px-1 ${className ?? ""}`}
  />
);

/** Gap index g in 0…n: line before current row g, or after the last row when g === n. */
const insertGapFromRowEvent = (
  event: DragEvent<HTMLDivElement>,
  rowIndex: number,
): number => {
  const rect = event.currentTarget.getBoundingClientRect();
  const midY = rect.top + rect.height / 2;
  return event.clientY < midY ? rowIndex : rowIndex + 1;
};

const dropInsertLine = (
  <div
    className="h-1 shrink-0 rounded-full bg-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
    aria-hidden
  />
);

const QuorumStepper = ({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
}) => {
  const clamped = Math.min(Math.max(value, 1), Math.max(max, 1));
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>at least</span>
      <div className="inline-flex items-center rounded-md border">
        <button
          type="button"
          aria-label="Decrease quorum"
          disabled={clamped <= 1}
          onClick={() => onChange(clamped - 1)}
          className="flex size-7 items-center justify-center rounded-l-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Minus className="size-3" aria-hidden />
        </button>
        <span className="min-w-6 text-center text-sm font-medium text-foreground">
          {clamped}
        </span>
        <button
          type="button"
          aria-label="Increase quorum"
          disabled={clamped >= max}
          onClick={() => onChange(clamped + 1)}
          className="flex size-7 items-center justify-center rounded-r-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Plus className="size-3" aria-hidden />
        </button>
      </div>
      <span>of {max} approve</span>
    </div>
  );
};

type StageCardProps = {
  stage: Stage;
  index: number;
  onDelete: () => void;
  onChange: (patch: Partial<Stage>) => void;
  onDragStart: (index: number) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>, index: number) => void;
};

const StageCard = ({
  stage,
  index,
  onDelete,
  onChange,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: StageCardProps) => {
  const empty = stage.approvers.length === 0;
  return (
    <Card.Root
      onDragOver={(event) => onDragOver(event, index)}
      onDrop={(event) => onDrop(event, index)}
      className="group relative transition-colors hover:border-foreground/20"
    >
      <div
        draggable
        onDragStart={(event) => {
          event.stopPropagation();
          onDragStart(index);
        }}
        onDragEnd={onDragEnd}
        className="absolute left-0 top-4 -translate-x-full pr-1 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        <span className="flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <GripVertical className="size-4" aria-hidden />
        </span>
      </div>

      {/* Always-visible delete control at the card's top-right corner. */}
      <button
        type="button"
        aria-label="Delete stage"
        onClick={onDelete}
        className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-status-danger"
      >
        <X className="size-4" aria-hidden />
      </button>

      <Card.Content className="space-y-3 p-4">
        <div className="pr-8">
          <InlineText
            value={stage.name}
            onChange={(name) => onChange({ name })}
            placeholder="Stage name"
            ariaLabel="Stage name"
            className="text-sm font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-56">
            <Select.Parts.Root
              value={stage.rule}
              onValueChange={(value) =>
                onChange({ rule: value as StageRule })
              }
              itemToStringLabel={(value) =>
                ruleLabels[value as StageRule] ?? ""
              }
            >
              <Select.Parts.Trigger>
                <Select.Parts.Value placeholder="Approval rule" />
              </Select.Parts.Trigger>
              <Select.Parts.Content>
                {rules.map((r) => (
                  <Select.Parts.Item key={r.rule} value={r.rule}>
                    {r.label}
                  </Select.Parts.Item>
                ))}
              </Select.Parts.Content>
            </Select.Parts.Root>
          </div>
          {stage.rule === "quorum" ? (
            <QuorumStepper
              value={stage.quorum}
              max={stage.approvers.length}
              onChange={(quorum) => onChange({ quorum })}
            />
          ) : null}
        </div>

        <Combobox
          multiple
          items={approverItems}
          value={stage.approvers}
          onValueChange={(value) => onChange({ approvers: value })}
          placeholder="Add approvers"
          aria-label={`${stage.name} approvers`}
        />

        {empty ? (
          <div className="flex items-center gap-1.5 text-xs text-status-attention">
            <TriangleAlert className="size-3.5" aria-hidden />
            No approvers yet — this stage would be skipped.
          </div>
        ) : null}
      </Card.Content>
    </Card.Root>
  );
};

export const ApprovalRouteBuilder = () => {
  const [routeName, setRouteName] = useState("Expense approval route");
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);

  const endDrag = () => {
    setDragIndex(null);
    setInsertAt(null);
  };

  const approverCount = useMemo(
    () => stages.reduce((sum, s) => sum + s.approvers.length, 0),
    [stages],
  );

  const updateStage = (id: string, patch: Partial<Stage>) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        id: newId(),
        name: `Stage ${prev.length + 1}`,
        rule: "all",
        quorum: 1,
        approvers: [],
      },
    ]);
  };

  const deleteStage = (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDropAtGap = (gapIndex: number) => {
    if (dragIndex === null) {
      endDrag();
      return;
    }
    const from = dragIndex;
    const insertIdx = gapIndex > from ? gapIndex - 1 : gapIndex;
    if (insertIdx === from) {
      endDrag();
      return;
    }
    setStages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(insertIdx, 0, moved);
      return next;
    });
    endDrag();
  };

  // Route serialized the way a backend workflow definition would consume it.
  const schema = {
    route: routeName,
    stages: stages.map((s, i) => ({
      order: i + 1,
      name: s.name,
      rule:
        s.rule === "quorum"
          ? {
              type: "quorum",
              min: Math.min(Math.max(s.quorum, 1), s.approvers.length || 1),
            }
          : { type: s.rule },
      approvers: s.approvers.map((name) => ({ kind: kindOf(name), ref: name })),
    })),
  };

  return (
    <Card.Root className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b bg-muted/30 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
            <Workflow className="size-3.5" aria-hidden />
          </span>
          <span className="text-sm font-medium text-foreground">
            Approval route editor
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {stages.length} stages · {approverCount} approvers
          </span>
          <span className="h-4 w-px bg-border" aria-hidden />
          <Button type="button" variant="ghost" size="sm" className="h-8">
            Discard
          </Button>
          <Button type="button" size="sm" className="h-8 gap-1.5">
            <Save className="size-3.5" aria-hidden />
            Save
          </Button>
        </div>
      </div>

      <Card.Content className="bg-background p-6">
        <div className="mx-auto max-w-2xl space-y-3">
          <div className="rounded-md border border-transparent bg-card px-4 py-3 transition-colors hover:border-border">
            <InlineText
              value={routeName}
              onChange={setRouteName}
              placeholder="Route name"
              ariaLabel="Route name"
              className="text-base font-semibold text-foreground"
            />
            <p className="px-1 text-xs text-muted-foreground">
              Approvers clear each stage in order; the next stage opens only once
              the current one is satisfied.
            </p>
          </div>

          {stages.length === 0 ? (
            <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
              No stages yet — add the first approval stage below.
            </div>
          ) : (
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <Fragment key={stage.id}>
                  {dragIndex !== null && insertAt === index
                    ? dropInsertLine
                    : null}
                  {index > 0 && !(dragIndex !== null && insertAt === index) ? (
                    <div
                      className="flex justify-center text-muted-foreground/50"
                      aria-hidden
                    >
                      <ArrowDown className="size-4" />
                    </div>
                  ) : null}
                  <StageCard
                    stage={stage}
                    index={index}
                    onDelete={() => deleteStage(stage.id)}
                    onChange={(patch) => updateStage(stage.id, patch)}
                    onDragStart={(i) => {
                      setDragIndex(i);
                      setInsertAt(null);
                    }}
                    onDragOver={(event, i) => {
                      event.preventDefault();
                      setInsertAt(insertGapFromRowEvent(event, i));
                    }}
                    onDragEnd={endDrag}
                    onDrop={(event, i) => {
                      event.preventDefault();
                      handleDropAtGap(insertGapFromRowEvent(event, i));
                    }}
                  />
                </Fragment>
              ))}
              {dragIndex !== null && insertAt === stages.length
                ? dropInsertLine
                : null}
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            className="w-full gap-1.5 [box-shadow:none!important]"
            onClick={addStage}
          >
            <Plus className="size-4" aria-hidden />
            Add stage
          </Button>
        </div>
      </Card.Content>

      <button
        type="button"
        onClick={() => setSchemaOpen((open) => !open)}
        className="flex w-full items-center gap-2 border-t bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        aria-expanded={schemaOpen}
      >
        <ChevronRight
          className={
            "size-3.5 transition-transform " + (schemaOpen ? "rotate-90" : "")
          }
          aria-hidden
        />
        <Braces className="size-3.5" aria-hidden />
        Generated route (JSON)
      </button>
      {schemaOpen ? (
        <pre className="max-h-72 overflow-auto border-t bg-card px-4 py-3 text-[11px] leading-snug">
          {JSON.stringify(schema, null, 2)}
        </pre>
      ) : null}
    </Card.Root>
  );
};

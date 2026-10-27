// Reference example: https://ui.tailor.tech/patterns/pipeline-stage-manager
import { useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
} from "@mailboost/erpboost-ui";
import {
  Check,
  GripVertical,
  Palette,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

type Category = "active" | "won" | "lost";

type Stage = {
  id: string;
  name: string;
  color: string;
  category: Category;
};

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const colors = [
  "#94a3b8", // slate
  "#60a5fa", // blue
  "#22d3ee", // cyan
  "#34d399", // emerald
  "#facc15", // yellow
  "#fb923c", // orange
  "#f87171", // red
  "#a855f7", // violet
];

const newId = () => `stage_${Math.random().toString(36).slice(2, 8)}`;

const initialStages: Stage[] = [
  { id: newId(), name: "Lead", color: "#94a3b8", category: "active" },
  { id: newId(), name: "Qualified", color: "#60a5fa", category: "active" },
  { id: newId(), name: "Proposal", color: "#22d3ee", category: "active" },
  { id: newId(), name: "Negotiation", color: "#facc15", category: "active" },
  { id: newId(), name: "Won", color: "#34d399", category: "won" },
  { id: newId(), name: "Lost", color: "#f87171", category: "lost" },
];

const ColorSwatch = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center">
      <button
        type="button"
        aria-label="Stage color"
        onClick={() => setOpen((o) => !o)}
        className="size-6 shrink-0 rounded-full"
        style={{ background: value }}
      />
      {open ? (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-7 z-20 w-max grid grid-cols-4 gap-1.5 rounded-md border bg-popover p-2 shadow-md">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="w-5 h-5 flex-none flex items-center justify-center rounded-full ring-1 ring-border"
                style={{ background: c }}
              >
                {c === value ? (
                  <Check className="size-3 text-white" aria-hidden />
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

type StageRowProps = {
  stage: Stage;
  index: number;
  editing: boolean;
  onPatch: (patch: Partial<Stage>) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onDelete: () => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
};

const StageRow = ({
  stage,
  index,
  editing,
  onPatch,
  onStartEdit,
  onStopEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDrop,
}: StageRowProps) => {
  return (
    <div
      draggable={!editing}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        onDragStart(index);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(index);
      }}
      className="flex items-center gap-2 rounded-md border bg-card p-2"
    >
      <GripVertical
        className="size-4 shrink-0 cursor-grab text-muted-foreground"
        aria-hidden
      />
      <ColorSwatch
        value={stage.color}
        onChange={(color) => onPatch({ color })}
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            autoFocus
            value={stage.name}
            onChange={(event) => onPatch({ name: event.target.value })}
            onBlur={onStopEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") {
                onStopEdit();
              }
            }}
            className="h-8"
          />
        ) : (
          <button
            type="button"
            onClick={onStartEdit}
            className="group/name flex items-center gap-2 w-full rounded px-1 py-1 text-left text-sm font-medium"
          >
            <span className="truncate">{stage.name}</span>
            <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" aria-hidden />
          </button>
        )}
      </div>
      <div className="w-28 shrink-0">
        <Select.Parts.Root
          value={stage.category}
          onValueChange={(value) =>
            onPatch({ category: value as Category })
          }
          itemToStringLabel={(v) =>
            CATEGORIES.find((c) => c.value === v)?.label ?? String(v ?? "")
          }
        >
          <Select.Parts.Trigger className="h-8 w-full">
            <Select.Parts.Value />
          </Select.Parts.Trigger>
          <Select.Parts.Content>
            {CATEGORIES.map((cat) => (
              <Select.Parts.Item key={cat.value} value={cat.value}>
                {cat.label}
              </Select.Parts.Item>
            ))}
          </Select.Parts.Content>
        </Select.Parts.Root>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Delete stage"
        className="size-7 text-status-danger"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
};

export const PipelineStageManager = () => {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const patchStage = (id: string, patch: Partial<Stage>) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, ...patch } : stage)),
    );
  };

  const deleteStage = (id: string) => {
    setStages((prev) => prev.filter((stage) => stage.id !== id));
  };

  const handleDrop = (toIndex: number) => {
    const fromIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    if (fromIndex === null || fromIndex === toIndex) return;
    setStages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const addStage = () => {
    const id = newId();
    setStages((prev) => {
      const next = [...prev];
      next.push({
        id,
        name: "New stage",
        color: colors[(prev.length * 3) % colors.length],
        category: "active",
      });
      return next;
    });
    setEditingId(id);
  };

  return (
    <Card.Root>
      <Card.Header
        title="Pipeline stages"
        description="Order stages by deal progression. Colors are used for Kanban column backgrounds."
      />
      <Card.Content className="space-y-3">
        <div className="flex justify-end">
          <Button type="button" onClick={addStage} className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            Add stage
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline-neutral">{stages.length} stages</Badge>
          <span className="ml-auto inline-flex items-center gap-1">
            <Palette className="size-3.5" aria-hidden />
            Click a color to change it
          </span>
        </div>
        <div className="space-y-1.5">
          {stages.map((stage, index) => (
            <StageRow
              key={stage.id}
              stage={stage}
              index={index}
              editing={editingId === stage.id}
              onPatch={(patch) => patchStage(stage.id, patch)}
              onStartEdit={() => setEditingId(stage.id)}
              onStopEdit={() => setEditingId(null)}
              onDelete={() => deleteStage(stage.id)}
              onDragStart={(i) => { dragIndexRef.current = i; }}
              onDragEnd={() => { dragIndexRef.current = null; }}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </Card.Content>
    </Card.Root>
  );
};

// Reference example: https://ui.tailor.tech/patterns/form-builder
import { Fragment, useMemo, useState, type DragEvent } from "react";
import {
  Badge,
  Button,
  Form,
} from "@mailboost/erpboost-ui";
import {
  AlignLeft,
  Asterisk,
  Braces,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Hash,
  ListChecks,
  Mail,
  Plus,
  Save,
  Settings2,
  Trash2,
  Type,
  X,
} from "lucide-react";

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "select"
  | "multiselect"
  | "checkbox";

type FieldDef = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: string[]; // for select / multiselect
};

type FormMeta = {
  title: string;
  description: string;
  submitLabel: string;
  cancelLabel: string;
};

type Palette = {
  type: FieldType;
  label: string;
  icon: typeof Type;
  defaults: () => Omit<FieldDef, "id">;
};

const newId = () => `f_${Math.random().toString(36).slice(2, 8)}`;

const palette: Palette[] = [
  {
    type: "text",
    label: "Text",
    icon: Type,
    defaults: () => ({
      type: "text",
      label: "Text field",
      placeholder: "",
      required: false,
    }),
  },
  {
    type: "textarea",
    label: "Long text",
    icon: AlignLeft,
    defaults: () => ({
      type: "textarea",
      label: "Description",
      placeholder: "",
      required: false,
    }),
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    defaults: () => ({
      type: "number",
      label: "Number field",
      required: false,
    }),
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    defaults: () => ({
      type: "email",
      label: "Email",
      placeholder: "name@example.com",
      required: false,
    }),
  },
  {
    type: "date",
    label: "Date",
    icon: Calendar,
    defaults: () => ({
      type: "date",
      label: "Date",
      required: false,
    }),
  },
  {
    type: "select",
    label: "Select",
    icon: ChevronDown,
    defaults: () => ({
      type: "select",
      label: "Choose one",
      required: false,
      options: ["Option A", "Option B", "Option C"],
    }),
  },
  {
    type: "multiselect",
    label: "Multi-select",
    icon: ListChecks,
    defaults: () => ({
      type: "multiselect",
      label: "Choose many",
      required: false,
      options: ["Option A", "Option B", "Option C"],
    }),
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    defaults: () => ({
      type: "checkbox",
      label: "I agree",
      required: false,
    }),
  },
];

const typeMeta = Object.fromEntries(
  palette.map((p) => [p.type, { label: p.label, icon: p.icon }]),
) as Record<FieldType, { label: string; icon: typeof Type }>;

const initialFields: FieldDef[] = [
  {
    id: newId(),
    type: "text",
    label: "Task name",
    placeholder: "e.g. Monthly supplier audit",
    required: true,
  },
  {
    id: newId(),
    type: "select",
    label: "Assignee",
    required: true,
    options: ["Alex Murphy", "Dana Lewis", "Sam Porter"],
  },
  {
    id: newId(),
    type: "date",
    label: "Due date",
    required: false,
  },
  {
    id: newId(),
    type: "multiselect",
    label: "Target suppliers",
    required: false,
    options: ["Tailor Supply Co.", "Northwind Foods", "Acme Logistics"],
  },
  {
    id: newId(),
    type: "textarea",
    label: "Notes",
    placeholder: "Note any prerequisites or caveats",
    required: false,
  },
];

const initialMeta: FormMeta = {
  title: "Supplier audit task",
  description: "Input form for issuing a new task",
  submitLabel: "Submit",
  cancelLabel: "Cancel",
};

// Renders as plain text by default; on hover/focus reveals an editor affordance.
// Used to make field labels, help text, descriptions, options etc. directly
// editable from within the live preview without a side inspector.
type InlineTextProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  ariaLabel?: string;
};

const inlineBase =
  "w-full rounded-sm border border-transparent bg-transparent outline-none transition-colors hover:bg-muted/40 focus:border-input focus:bg-card focus:ring-2 focus:ring-ring/30";

const InlineText = ({
  value,
  onChange,
  placeholder,
  className,
  multiline,
  ariaLabel,
}: InlineTextProps) => {
  const shared = `${inlineBase} ${className ?? ""}`;
  if (multiline) {
    return (
      <textarea
        rows={2}
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${shared} resize-none px-1 py-0.5`}
        onClick={(event) => event.stopPropagation()}
      />
    );
  }
  return (
    <input
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${shared} px-1`}
      onClick={(event) => event.stopPropagation()}
    />
  );
};

const FieldPalette = ({ onAdd }: { onAdd: (type: FieldType) => void }) => (
  <div className="space-y-2">
    <div className="px-1 text-xs font-medium text-muted-foreground">
      Add a field
    </div>
    <div className="grid gap-1">
      {palette.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onAdd(item.type)}
            className="group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-sm transition-colors hover:border-border hover:bg-muted/60"
          >
            <span className="flex size-7 items-center justify-center rounded-md border bg-card text-muted-foreground group-hover:text-foreground">
              <Icon className="size-3.5" aria-hidden />
            </span>
            <span className="flex-1 truncate">{item.label}</span>
            <Plus className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
          </button>
        );
      })}
    </div>
  </div>
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

const previewInputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm italic text-muted-foreground placeholder:not-italic placeholder:text-muted-foreground/60 outline-none focus:not-italic focus:text-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

const staticInputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground/70";

type OptionsEditorProps = {
  type: "select" | "multiselect";
  options: string[];
  onChange: (next: string[]) => void;
  selected: boolean;
};

const OptionsEditor = ({
  type,
  options,
  onChange,
  selected,
}: OptionsEditorProps) => {
  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    onChange(next);
  };
  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };
  const addOption = () => {
    onChange([...options, `Option ${options.length + 1}`]);
  };

  return (
    <div className="space-y-1 rounded-md border bg-background p-2">
      {options.map((opt, i) => (
        <div key={i} className="group/option flex items-center gap-2">
          {type === "select" ? (
            <span
              className="size-3 shrink-0 rounded-full border border-muted-foreground/40"
              aria-hidden
            />
          ) : (
            <input
              type="checkbox"
              className="size-4 shrink-0"
              disabled
              aria-hidden
            />
          )}
          <InlineText
            value={opt}
            onChange={(v) => updateOption(i, v)}
            ariaLabel={`Option ${i + 1}`}
            className="text-sm"
          />
          {selected ? (
            <button
              type="button"
              aria-label="Remove option"
              className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover/option:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                removeOption(i);
              }}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      ))}
      {selected ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            addOption();
          }}
          className="flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3" aria-hidden />
          Add option
        </button>
      ) : null}
    </div>
  );
};

type CanvasFieldProps = {
  field: FieldDef;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<FieldDef>) => void;
  onDragStart: (index: number) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>, index: number) => void;
};

const CanvasField = ({
  field,
  index,
  selected,
  onSelect,
  onDeselect,
  onDelete,
  onChange,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: CanvasFieldProps) => {
  const TypeIcon = typeMeta[field.type].icon;
  const showHelp = selected || Boolean(field.helpText);

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDragOver={(event) => onDragOver(event, index)}
      onDrop={(event) => onDrop(event, index)}
      className={
        "group relative rounded-md border bg-card px-4 py-3 transition-colors cursor-pointer " +
        (selected
          ? "border-primary ring-1 ring-primary/30 bg-primary/[0.02]"
          : "border-transparent hover:border-border hover:bg-muted/30")
      }
    >
      <div
        draggable
        onDragStart={(event) => {
          event.stopPropagation();
          onDragStart(index);
        }}
        onDragEnd={onDragEnd}
        onClick={(event) => event.stopPropagation()}
        className={
          "absolute left-0 top-4 -translate-x-full pr-1 transition-opacity " +
          (selected ? "opacity-100" : "opacity-0 group-hover:opacity-100")
        }
        aria-label="Drag to reorder"
      >
        <span className="flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <GripVertical className="size-4" aria-hidden />
        </span>
      </div>

      {selected ? (
        <div
          className="absolute -top-3.5 right-2 z-10 flex items-center rounded-md border bg-popover shadow-md"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-pressed={field.required}
            onClick={() => onChange({ required: !field.required })}
            className={
              "flex items-center gap-1 rounded-l-md px-2 py-1 text-[11px] transition-colors " +
              (field.required
                ? "text-status-danger"
                : "text-muted-foreground hover:bg-muted hover:text-foreground")
            }
          >
            <Asterisk className="size-3" aria-hidden />
            Required
          </button>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground">
            <TypeIcon className="size-3" aria-hidden />
            {typeMeta[field.type].label}
          </span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <button
            type="button"
            aria-label="Delete field"
            className="px-1.5 py-1 text-muted-foreground hover:bg-muted hover:text-status-danger"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Clear selection"
            className="rounded-r-md px-1.5 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onDeselect();
            }}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : (
        <Badge
          variant="outline-neutral"
          className="absolute right-2 top-2 gap-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
        >
          <TypeIcon className="size-3" aria-hidden />
          {typeMeta[field.type].label}
        </Badge>
      )}

      {field.type === "checkbox" ? (
        <div className="flex items-start gap-2 py-1">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0"
            disabled
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <InlineText
                value={field.label}
                onChange={(v) => onChange({ label: v })}
                placeholder="Checkbox label"
                ariaLabel="Label"
                className="text-sm"
              />
              {field.required ? (
                <span
                  className="shrink-0 text-status-danger"
                  aria-hidden
                >
                  *
                </span>
              ) : null}
            </div>
            {showHelp ? (
              <InlineText
                value={field.helpText ?? ""}
                onChange={(v) => onChange({ helpText: v })}
                placeholder={selected ? "Add help text (optional)" : ""}
                ariaLabel="Help text"
                className="text-xs text-muted-foreground"
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1">
            <InlineText
              value={field.label}
              onChange={(v) => onChange({ label: v })}
              placeholder="Label"
              ariaLabel="Label"
              className="text-sm font-medium"
            />
            {field.required ? (
              <span className="shrink-0 text-status-danger" aria-hidden>
                *
              </span>
            ) : null}
          </div>

          {field.type === "text" || field.type === "email" ? (
            <input
              type="text"
              value={field.placeholder ?? ""}
              onChange={(event) =>
                onChange({ placeholder: event.target.value })
              }
              onClick={(event) => event.stopPropagation()}
              placeholder={
                selected ? "Click to edit placeholder" : "Placeholder"
              }
              className={previewInputClass}
              aria-label="Placeholder"
            />
          ) : null}
          {field.type === "textarea" ? (
            <textarea
              rows={3}
              value={field.placeholder ?? ""}
              onChange={(event) =>
                onChange({ placeholder: event.target.value })
              }
              onClick={(event) => event.stopPropagation()}
              placeholder={
                selected ? "Click to edit placeholder" : "Placeholder"
              }
              className={`${previewInputClass} resize-none`}
              aria-label="Placeholder"
            />
          ) : null}
          {field.type === "number" ? (
            <input
              type="number"
              disabled
              placeholder="0"
              className={staticInputClass}
              aria-hidden
            />
          ) : null}
          {field.type === "date" ? (
            <input
              type="date"
              disabled
              className={staticInputClass}
              aria-hidden
            />
          ) : null}
          {field.type === "select" || field.type === "multiselect" ? (
            <OptionsEditor
              type={field.type}
              options={field.options ?? []}
              onChange={(opts) => onChange({ options: opts })}
              selected={selected}
            />
          ) : null}

          {showHelp ? (
            <InlineText
              value={field.helpText ?? ""}
              onChange={(v) => onChange({ helpText: v })}
              placeholder={selected ? "Add help text (optional)" : ""}
              ariaLabel="Help text"
              className="text-xs text-muted-foreground"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export const FormBuilder = () => {
  const [meta, setMeta] = useState<FormMeta>(initialMeta);
  const [fields, setFields] = useState<FieldDef[]>(initialFields);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);

  const endDrag = () => {
    setDragIndex(null);
    setInsertAt(null);
  };

  const requiredCount = useMemo(
    () => fields.filter((f) => f.required).length,
    [fields],
  );

  const addField = (type: FieldType) => {
    const def = palette.find((p) => p.type === type);
    if (!def) return;
    const id = newId();
    setFields((prev) => [...prev, { id, ...def.defaults() }]);
    setSelectedId(id);
  };

  const updateField = (id: string, patch: Partial<FieldDef>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedId((current) => (current === id ? null : current));
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
    setFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(insertIdx, 0, moved);
      return next;
    });
    endDrag();
  };

  const clearSelection = () => setSelectedId(null);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b bg-muted/30 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
            <Settings2 className="size-3.5" aria-hidden />
          </span>
          <span className="text-sm font-medium text-foreground">
            Form editor
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {fields.length} fields
            {requiredCount > 0 ? ` · ${requiredCount} required` : ""}
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

      <div className="grid grid-cols-1 gap-px bg-border lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="bg-card p-3">
          <FieldPalette onAdd={addField} />
        </aside>

        <section
          className="min-h-[480px] bg-background p-6"
          onClick={clearSelection}
          aria-label="Form canvas"
        >
          <div className="mx-auto max-w-2xl space-y-3">
            <div
              className="rounded-md border border-transparent bg-card px-4 py-3 transition-colors hover:border-border"
              onClick={(event) => event.stopPropagation()}
            >
              <InlineText
                value={meta.title}
                onChange={(v) => setMeta((prev) => ({ ...prev, title: v }))}
                placeholder="Form title"
                ariaLabel="Form title"
                className="text-base font-semibold text-foreground"
              />
              <InlineText
                multiline
                value={meta.description}
                onChange={(v) =>
                  setMeta((prev) => ({ ...prev, description: v }))
                }
                placeholder="Describe this form (optional)"
                ariaLabel="Form description"
                className="text-sm text-muted-foreground"
              />
            </div>

            {fields.length === 0 ? (
              <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
                Add fields from the palette on the left
              </div>
            ) : (
              <Form className="space-y-3">
                {fields.map((field, index) => (
                  <Fragment key={field.id}>
                    {dragIndex !== null && insertAt === index
                      ? dropInsertLine
                      : null}
                    <CanvasField
                      field={field}
                      index={index}
                      selected={field.id === selectedId}
                      onSelect={() => setSelectedId(field.id)}
                      onDeselect={clearSelection}
                      onDelete={() => deleteField(field.id)}
                      onChange={(patch) => updateField(field.id, patch)}
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
                {fields.length > 0 &&
                dragIndex !== null &&
                insertAt === fields.length
                  ? dropInsertLine
                  : null}
                <div
                  className="flex justify-end gap-2 pt-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    value={meta.cancelLabel}
                    onChange={(event) =>
                      setMeta((prev) => ({
                        ...prev,
                        cancelLabel: event.target.value,
                      }))
                    }
                    size={Math.max(meta.cancelLabel.length || 1, 6)}
                    aria-label="Cancel button label"
                    className="rounded-md border border-transparent bg-transparent px-3 py-1.5 text-center text-sm text-foreground outline-none hover:border-border focus:border-input focus:bg-card focus:ring-2 focus:ring-ring/30"
                  />
                  <input
                    value={meta.submitLabel}
                    onChange={(event) =>
                      setMeta((prev) => ({
                        ...prev,
                        submitLabel: event.target.value,
                      }))
                    }
                    size={Math.max(meta.submitLabel.length || 1, 6)}
                    aria-label="Submit button label"
                    className="rounded-md border border-primary bg-primary px-3 py-1.5 text-center text-sm font-medium text-primary-foreground outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </Form>
            )}
          </div>
        </section>
      </div>

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
        Generated schema (JSON)
      </button>
      {schemaOpen ? (
        <pre className="max-h-72 overflow-auto border-t bg-card px-4 py-3 text-[11px] leading-snug">
          {JSON.stringify({ form: meta, fields }, null, 2)}
        </pre>
      ) : null}
    </div>
  );
};

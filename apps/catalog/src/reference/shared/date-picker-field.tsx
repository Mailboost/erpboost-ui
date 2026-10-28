import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input } from "@mailboost/erpboost-ui";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

function parseCalendarDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : undefined;
}

export function DatePickerField({
  id,
  label,
  placeholder = "YYYY-MM-DD",
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  useEffect(() => setDraft(value), [value]);
  const selected = useMemo(() => parseCalendarDate(draft), [draft]);
  const commitDraft = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || parseCalendarDate(trimmed)) {
      onChange(trimmed);
      return;
    }
    setDraft(value);
  }, [draft, value, onChange]);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground" htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={draft}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            const trimmed = next.trim();
            if (!trimmed || parseCalendarDate(trimmed)) onChange(trimmed);
          }}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft();
              event.currentTarget.blur();
            }
          }}
          placeholder={placeholder}
          className="h-9 flex-1 min-w-0 font-mono text-sm tabular-nums placeholder:font-sans"
        />
        <Popover modal={false} open={!disabled && open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              type="button"
              disabled={disabled}
              className="size-9 shrink-0"
              aria-label={`Open calendar: ${label}`}
            >
              <CalendarIcon className="size-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            collisionPadding={12}
            className="z-200 w-auto border-border p-0 shadow-lg"
          >
            <DayPicker
              mode="single"
              showOutsideDays
              selected={selected}
              defaultMonth={selected}
              onSelect={(date) => {
                if (date) {
                  const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                  setDraft(next);
                  onChange(next);
                  setOpen(false);
                }
              }}
              className="rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-sm [--rdp-accent-color:var(--primary)] [--rdp-accent-background-color:color-mix(in_oklab,var(--primary)_14%,transparent)] [--rdp-day_button-border-radius:0.375rem] [--rdp-nav_button-height:2rem] [--rdp-nav_button-width:2rem]"
              classNames={{
                months: "flex flex-col gap-4 sm:flex-row",
                nav: "mb-3 flex w-full items-center justify-between gap-2 px-0.5",
                button_previous:
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-xs transition-[color,box-shadow,opacity] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
                button_next:
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-xs transition-[color,box-shadow,opacity] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
                month: "flex w-full flex-col gap-3",
                month_caption: "flex justify-center pb-3",
                caption_label: "text-sm font-medium text-foreground",
                month_grid: "w-full border-collapse",
                weekdays: "",
                weekday:
                  "w-9 text-center text-[0.8rem] font-normal text-muted-foreground opacity-80",
                week: "",
                weeks: "",
                day: "p-0 text-center",
                day_button:
                  "inline-flex size-9 items-center justify-center rounded-md p-0 font-normal hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected:
                  "rounded-md bg-[var(--rdp-accent-color)] text-primary-foreground hover:bg-[var(--rdp-accent-color)]",
                today: "font-semibold text-foreground",
                outside: "text-muted-foreground opacity-55",
                disabled: "text-muted-foreground opacity-40",
                hidden: "invisible",
              }}
              components={{
                Chevron: ({ orientation, className }) =>
                  orientation === "left" ? (
                    <ChevronLeft
                      aria-hidden="true"
                      className={`size-4 fill-[blue] ${className ?? ""}`}
                    />
                  ) : (
                    <ChevronRight
                      aria-hidden="true"
                      className={`size-4 fill-[blue] ${className ?? ""}`}
                    />
                  ),
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

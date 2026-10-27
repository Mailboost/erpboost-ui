import { useState } from "react";
import { Button, Input } from "@mailboost/erpboost-ui";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
export function DatePickerField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + "T00:00:00")
    : undefined;
  const selected =
    parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 flex-1 min-w-0 font-mono text-sm tabular-nums placeholder:font-sans"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-9 shrink-0"
              aria-label={`Open calendar: ${label}`}
            >
              <CalendarIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="z-200 w-auto border-border p-0 shadow-lg"
          >
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected}
              onSelect={(date) => {
                if (date) {
                  onChange(
                    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
                  );
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
                outside: "text-muted-foreground opacity-40",
                disabled: "text-muted-foreground opacity-50",
                hidden: "invisible",
              }}
              components={{
                Chevron: ({ orientation, className }) =>
                  orientation === "left" ? (
                    <ChevronLeft className={`size-4 ${className ?? ""}`} />
                  ) : (
                    <ChevronRight className={`size-4 ${className ?? ""}`} />
                  ),
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

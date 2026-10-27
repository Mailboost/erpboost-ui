// Reference example: https://ui.tailor.tech/patterns/ai-chat
import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Loader2,
  Wrench,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Collapsible tool-call card (adapted from AI Elements' Tool). Shows which
// tool the model invoked and its live status in the header; expanding reveals
// the input parameters and the result (or error) as JSON. The four states map
// 1:1 to the AI SDK's tool-part lifecycle, so a streaming loop can update a
// call in place as parts arrive:
//   input-streaming  → the model is still writing the arguments
//   input-available  → arguments complete, tool executing
//   output-available → finished with a result
//   output-error     → finished with an error
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error";

// Success is the expected outcome, so it stays quiet: just the check icon in
// the default text color, no label. The in-flight and error states keep their
// labels since those are the ones worth a glance.
const STATUS_LABELS: Record<ToolState, string | null> = {
  "input-streaming": "Preparing",
  "input-available": "Running",
  "output-available": null,
  "output-error": "Error",
};

const STATUS_ICONS: Record<ToolState, ReactNode> = {
  "input-streaming": <CircleDashed className="size-3.5" aria-hidden />,
  "input-available": <Loader2 className="size-3.5 animate-spin" aria-hidden />,
  "output-available": <CheckCircle2 className="size-3.5" aria-hidden />,
  "output-error": <XCircle className="size-3.5 text-destructive" aria-hidden />,
};

type ToolContextValue = {
  open: boolean;
  toggle: () => void;
  contentId: string;
};

const ToolContext = createContext<ToolContextValue | null>(null);

function useToolContext(component: string) {
  const ctx = useContext(ToolContext);
  if (!ctx) throw new Error(`<${component}> must be used within <Tool>`);
  return ctx;
}

export type ToolProps = ComponentProps<"div"> & {
  defaultOpen?: boolean;
};

export const Tool = ({ className, defaultOpen = false, ...props }: ToolProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  return (
    <ToolContext.Provider value={{ open, toggle: () => setOpen((v) => !v), contentId }}>
      <div className={cn("w-full rounded-md border", className)} {...props} />
    </ToolContext.Provider>
  );
};

export type ToolHeaderProps = Omit<ComponentProps<"button">, "children" | "title"> & {
  toolName: string;
  state: ToolState;
  /** Human-readable label shown instead of the raw tool name. */
  title?: string;
};

export const ToolHeader = ({ toolName, state, title, className, ...props }: ToolHeaderProps) => {
  const { open, toggle, contentId } = useToolContext("ToolHeader");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls={contentId}
      className={cn(
        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        <Wrench className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate font-medium text-foreground">{title ?? toolName}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {STATUS_ICONS[state]}
          {STATUS_LABELS[state] ?? <span className="sr-only">Done</span>}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </span>
    </button>
  );
};

export type ToolContentProps = ComponentProps<"div">;

export const ToolContent = ({ className, ...props }: ToolContentProps) => {
  const { open, contentId } = useToolContext("ToolContent");
  if (!open) return null;
  return (
    <div id={contentId} className={cn("space-y-2 border-t px-3 py-2", className)} {...props} />
  );
};

function JsonBlock({ value }: { value: unknown }) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <pre className="overflow-x-auto rounded bg-muted/50 p-2 text-[11px] leading-relaxed whitespace-pre-wrap">
      {text}
    </pre>
  );
}

export type ToolInputProps = ComponentProps<"div"> & { input: unknown };

export const ToolInput = ({ input, className, ...props }: ToolInputProps) => (
  <div className={cn("space-y-1", className)} {...props}>
    <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      Parameters
    </h4>
    <JsonBlock value={input} />
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output?: unknown;
  errorText?: string;
};

export const ToolOutput = ({ output, errorText, className, ...props }: ToolOutputProps) => {
  if (output == null && !errorText) return null;
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <h4
        className={cn(
          "text-[10px] font-medium uppercase tracking-wide",
          errorText ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {errorText ? "Error" : "Result"}
      </h4>
      <JsonBlock value={errorText ?? output} />
    </div>
  );
};

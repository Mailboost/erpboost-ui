// Reference example: https://ui.tailor.tech/patterns/ai-chat
import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
} from "react";
import { ChevronDown, ListTree, type LucideIcon } from "lucide-react";
import { Badge } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";

// Structured step timeline for agentic answers (adapted from AI Elements'
// ChainOfThought). Where <Reasoning> shows free-form thinking text, this
// shows the discrete plan the agent is executing — "Search the knowledge
// base", "Read the top article", "Draft the answer" — each with a status, so
// long multi-tool turns stay legible.
//
// Usage:
//   <ChainOfThought defaultOpen>
//     <ChainOfThoughtHeader />
//     <ChainOfThoughtContent>
//       <ChainOfThoughtStep icon={Search} label="Searching" status="complete">
//         <ChainOfThoughtSearchResults>
//           <ChainOfThoughtSearchResult>12 hits</ChainOfThoughtSearchResult>
//         </ChainOfThoughtSearchResults>
//       </ChainOfThoughtStep>
//       <ChainOfThoughtStep label="Drafting the answer" status="active" />
//     </ChainOfThoughtContent>
//   </ChainOfThought>

export type ChainOfThoughtStepStatus = "complete" | "active" | "pending";

type ChainOfThoughtContextValue = {
  open: boolean;
  toggle: () => void;
  contentId: string;
};

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(null);

function useChainOfThoughtContext(component: string) {
  const ctx = useContext(ChainOfThoughtContext);
  if (!ctx) throw new Error(`<${component}> must be used within <ChainOfThought>`);
  return ctx;
}

export type ChainOfThoughtProps = ComponentProps<"div"> & {
  defaultOpen?: boolean;
};

export const ChainOfThought = ({
  className,
  defaultOpen = false,
  ...props
}: ChainOfThoughtProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  return (
    <ChainOfThoughtContext.Provider
      value={{ open, toggle: () => setOpen((v) => !v), contentId }}
    >
      <div className={cn("w-full", className)} {...props} />
    </ChainOfThoughtContext.Provider>
  );
};

export type ChainOfThoughtHeaderProps = Omit<ComponentProps<"button">, "children"> & {
  label?: string;
};

export const ChainOfThoughtHeader = ({
  label = "Chain of thought",
  className,
  ...props
}: ChainOfThoughtHeaderProps) => {
  const { open, toggle, contentId } = useChainOfThoughtContext("ChainOfThoughtHeader");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls={contentId}
      className={cn(
        "flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      <ListTree className="size-3.5" aria-hidden />
      <span>{label}</span>
      <ChevronDown
        className={cn("size-3 transition-transform", open && "rotate-180")}
        aria-hidden
      />
    </button>
  );
};

export type ChainOfThoughtContentProps = ComponentProps<"div">;

export const ChainOfThoughtContent = ({
  className,
  ...props
}: ChainOfThoughtContentProps) => {
  const { open, contentId } = useChainOfThoughtContext("ChainOfThoughtContent");
  if (!open) return null;
  return (
    <div id={contentId} className={cn("mt-2 flex flex-col", className)} {...props} />
  );
};

const stepTextClass: Record<ChainOfThoughtStepStatus, string> = {
  complete: "text-muted-foreground",
  active: "text-foreground",
  pending: "text-muted-foreground/50",
};

const stepIconClass: Record<ChainOfThoughtStepStatus, string> = {
  complete: "text-muted-foreground",
  active: "text-primary",
  pending: "text-muted-foreground/40",
};

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  label: string;
  description?: string;
  /** Lucide icon for the marker; a plain dot when omitted. */
  icon?: LucideIcon;
  status?: ChainOfThoughtStepStatus;
};

export const ChainOfThoughtStep = ({
  label,
  description,
  icon: Icon,
  status = "complete",
  className,
  children,
  ...props
}: ChainOfThoughtStepProps) => (
  <div className={cn("group flex gap-2 text-sm", className)} {...props}>
    {/* Marker column: icon (or dot) plus a connector line hidden on the last step. */}
    <div className="flex w-4 shrink-0 flex-col items-center gap-1">
      {Icon ? (
        <Icon
          className={cn(
            "mt-0.5 size-4",
            stepIconClass[status],
            status === "active" && "animate-pulse",
          )}
          aria-hidden
        />
      ) : (
        <span
          className={cn(
            "mt-1.5 size-2 rounded-full bg-current",
            stepIconClass[status],
            status === "active" && "animate-pulse",
          )}
          aria-hidden
        />
      )}
      <span className="w-px flex-1 bg-border group-last:hidden" aria-hidden />
    </div>
    <div className={cn("min-w-0 flex-1 space-y-1 pb-4 group-last:pb-0", stepTextClass[status])}>
      <p className="leading-5">{label}</p>
      {description ? <p className="text-xs">{description}</p> : null}
      {children}
    </div>
  </div>
);

export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;

export const ChainOfThoughtSearchResults = ({
  className,
  ...props
}: ChainOfThoughtSearchResultsProps) => (
  <div className={cn("flex flex-wrap items-center gap-1", className)} {...props} />
);

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;

export const ChainOfThoughtSearchResult = ({
  className,
  variant = "outline-neutral",
  ...props
}: ChainOfThoughtSearchResultProps) => (
  <Badge variant={variant} className={cn("text-[10px] font-normal", className)} {...props} />
);

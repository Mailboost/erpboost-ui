// Reference example: https://ui.tailor.tech/patterns/ai-chat
import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
} from "react";
import { Book, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Collapsible citation list for grounded answers (adapted from AI Elements'
// Sources). Renders a compact "Used N sources" trigger under the answer;
// expanding lists each source the model actually consulted. Pass an onClick
// per <Source> to open the underlying document next to the chat.
//
// Usage:
//   <Sources>
//     <SourcesTrigger count={sources.length} />
//     <SourcesContent>
//       {sources.map((s) => (
//         <Source key={s.id} title={s.title} onClick={() => open(s.id)} />
//       ))}
//     </SourcesContent>
//   </Sources>

type SourcesContextValue = {
  open: boolean;
  toggle: () => void;
  contentId: string;
};

const SourcesContext = createContext<SourcesContextValue | null>(null);

function useSourcesContext(component: string) {
  const ctx = useContext(SourcesContext);
  if (!ctx) throw new Error(`<${component}> must be used within <Sources>`);
  return ctx;
}

export type SourcesProps = ComponentProps<"div">;

export const Sources = ({ className, ...props }: SourcesProps) => {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return (
    <SourcesContext.Provider
      value={{ open, toggle: () => setOpen((v) => !v), contentId }}
    >
      <div className={cn("flex w-full flex-col gap-1 text-xs", className)} {...props} />
    </SourcesContext.Provider>
  );
};

export type SourcesTriggerProps = Omit<ComponentProps<"button">, "children"> & {
  count: number;
};

export const SourcesTrigger = ({ count, className, ...props }: SourcesTriggerProps) => {
  const { open, toggle, contentId } = useSourcesContext("SourcesTrigger");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls={contentId}
      className={cn(
        "flex w-fit items-center gap-1 text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      <Book className="size-3.5" aria-hidden />
      <span>
        Used {count} {count === 1 ? "source" : "sources"}
      </span>
      <ChevronDown
        className={cn("size-3 transition-transform", open && "rotate-180")}
        aria-hidden
      />
    </button>
  );
};

export type SourcesContentProps = ComponentProps<"div">;

export const SourcesContent = ({ className, ...props }: SourcesContentProps) => {
  const { open, contentId } = useSourcesContext("SourcesContent");
  if (!open) return null;
  return (
    <div
      id={contentId}
      className={cn(
        "flex w-full flex-col gap-1 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
};

export type SourceProps = ComponentProps<"button"> & { title: string };

export const Source = ({ title, className, ...props }: SourceProps) => (
  <button
    type="button"
    className={cn(
      "flex w-fit max-w-full items-center gap-1.5 truncate text-left text-xs text-muted-foreground hover:text-foreground",
      className,
    )}
    {...props}
  >
    <Book className="size-3 shrink-0" aria-hidden />
    <span className="truncate">{title}</span>
  </button>
);

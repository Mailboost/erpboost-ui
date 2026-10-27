// Reference example: https://ui.tailor.tech/patterns/ai-chat
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Response } from "./Response";

// Collapsible "thinking" block for models that stream reasoning before the
// final answer (adapted from AI Elements' Reasoning). It auto-opens when
// streaming starts and auto-closes when it ends — thinking is visible while
// it happens, then tucks away so the answer stays the focus. Once the reader
// toggles it manually, the automatic behavior backs off.
//
// Usage:
//   <Reasoning isStreaming={reasoning.streaming} duration={reasoning.duration}>
//     <ReasoningTrigger />
//     <ReasoningContent>{reasoning.text}</ReasoningContent>
//   </Reasoning>

type ReasoningContextValue = {
  open: boolean;
  toggle: () => void;
  isStreaming: boolean;
  duration?: number;
  contentId: string;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

function useReasoningContext(component: string) {
  const ctx = useContext(ReasoningContext);
  if (!ctx) throw new Error(`<${component}> must be used within <Reasoning>`);
  return ctx;
}

export type ReasoningProps = ComponentProps<"div"> & {
  /** True while reasoning tokens are still arriving. */
  isStreaming?: boolean;
  /** Seconds spent thinking; shown in the trigger once streaming ends. */
  duration?: number;
  defaultOpen?: boolean;
};

export const Reasoning = ({
  className,
  isStreaming = false,
  duration,
  defaultOpen = false,
  ...props
}: ReasoningProps) => {
  const [open, setOpen] = useState(defaultOpen || isStreaming);
  const userToggledRef = useRef(false);
  const contentId = useId();

  // Follow the stream (open while thinking, close when done) unless the
  // reader has taken over.
  useEffect(() => {
    if (!userToggledRef.current) setOpen(isStreaming);
  }, [isStreaming]);

  const toggle = () => {
    userToggledRef.current = true;
    setOpen((v) => !v);
  };

  return (
    <ReasoningContext.Provider
      value={{ open, toggle, isStreaming, duration, contentId }}
    >
      <div className={cn("w-full", className)} {...props} />
    </ReasoningContext.Provider>
  );
};

export type ReasoningTriggerProps = Omit<ComponentProps<"button">, "children"> & {
  /** Overrides the default "Thinking… / Thought for Ns" label. */
  label?: string;
};

export const ReasoningTrigger = ({ label, className, ...props }: ReasoningTriggerProps) => {
  const { open, toggle, isStreaming, duration, contentId } =
    useReasoningContext("ReasoningTrigger");
  const defaultLabel = isStreaming
    ? "Thinking…"
    : duration != null
      ? `Thought for ${duration}s`
      : "Reasoning";

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
      <Brain className="size-3.5" aria-hidden />
      <span className={cn(isStreaming && "animate-pulse")}>{label ?? defaultLabel}</span>
      <ChevronDown
        className={cn("size-3 transition-transform", open && "rotate-180")}
        aria-hidden
      />
    </button>
  );
};

export type ReasoningContentProps = Omit<ComponentProps<"div">, "children"> & {
  children: string;
};

export const ReasoningContent = ({ children, className, ...props }: ReasoningContentProps) => {
  const { open, contentId } = useReasoningContext("ReasoningContent");
  if (!open) return null;
  return (
    <div
      id={contentId}
      className={cn(
        "mt-2 border-l-2 pl-3 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Response>{children}</Response>
    </div>
  );
};

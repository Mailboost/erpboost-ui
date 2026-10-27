// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { ArrowDown } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";

// Scroll container that follows streaming output (adapted from AI Elements).
// While the reader is pinned to the bottom, growing content keeps the view
// scrolled down; as soon as they scroll up to reread earlier messages the
// following stops — a plain scrollIntoView-on-change can't tell the
// difference and yanks the view back mid-read. <ConversationScrollButton>
// appears whenever the reader has left the bottom. Hand-rolled with a
// ResizeObserver so the catalogue stays dependency-free; `use-stick-to-bottom`
// is a drop-in upgrade if you want velocity-matched smooth following.

// How close (px) to the bottom still counts as "pinned".
const AT_BOTTOM_THRESHOLD_PX = 32;

type ConversationContextValue = {
  isAtBottom: boolean;
  scrollToBottom: () => void;
};

const ConversationContext = createContext<ConversationContextValue | null>(null);

function useConversationContext(component: string) {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error(`<${component}> must be used within <Conversation>`);
  return ctx;
}

export type ConversationProps = ComponentProps<"div">;

export const Conversation = ({ className, children, ...props }: ConversationProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const prevScrollTopRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < AT_BOTTOM_THRESHOLD_PX;
    const scrolledUp = el.scrollTop < prevScrollTopRef.current;
    prevScrollTopRef.current = el.scrollTop;
    if (atBottom) {
      pinnedRef.current = true;
      setIsAtBottom(true);
    } else if (scrolledUp) {
      // Only an upward move counts as the reader leaving — content growing
      // underneath (scrollTop unchanged, bottom moving away) must not unpin.
      pinnedRef.current = false;
      setIsAtBottom(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    pinnedRef.current = true;
    setIsAtBottom(true);
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  // Start at the latest message when mounting with existing history, then
  // follow content growth (streaming text, new turns) only while pinned.
  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    viewport.scrollTop = viewport.scrollHeight;
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) {
        viewport.scrollTop = viewport.scrollHeight;
        setIsAtBottom(true);
      }
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <ConversationContext.Provider value={{ isAtBottom, scrollToBottom }}>
      <div className={cn("relative min-h-0 flex-1", className)} {...props}>
        <div
          ref={viewportRef}
          onScroll={handleScroll}
          role="log"
          className="h-full overflow-y-auto"
        >
          {/* The scroll button escapes this box via absolute positioning
              against the relative root, so it stays pinned while content
              scrolls underneath it. */}
          <div ref={contentRef} className="flex min-h-full flex-col">
            {children}
          </div>
        </div>
      </div>
    </ConversationContext.Provider>
  );
};

export type ConversationContentProps = ComponentProps<"div">;

export const ConversationContent = ({ className, ...props }: ConversationContentProps) => (
  <div className={cn("flex flex-1 flex-col gap-3 px-3 py-3", className)} {...props} />
);

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title,
  description,
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center",
      className,
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon}
        <div className="space-y-1">
          {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useConversationContext(
    "ConversationScrollButton",
  );

  return !isAtBottom ? (
    <Button
      className={cn(
        "absolute bottom-3 left-1/2 aspect-square size-8 -translate-x-1/2 rounded-full p-0",
        className,
      )}
      onClick={scrollToBottom}
      size="icon"
      type="button"
      variant="outline"
      aria-label="Scroll to latest message"
      {...props}
    >
      <ArrowDown className="size-4" aria-hidden />
    </Button>
  ) : null;
};

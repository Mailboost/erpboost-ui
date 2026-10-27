import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@mailboost/erpboost-ui";
import { PanelLeft } from "lucide-react";
const ParentPreviewFrame = createContext<ReactNode | undefined>(undefined);
export function PageFrame({
  children,
  fullBleed = false,
}: {
  children: ReactNode | ((sidebarTrigger: ReactNode) => ReactNode);
  fullBleed?: boolean;
}) {
  const parentTrigger = useContext(ParentPreviewFrame);
  const [open, setOpen] = useState(true);
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width < 640) setOpen(false);
    });
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);
  const inlineToggle = typeof children === "function";
  const expandTrigger = !open ? (
    <Button
      variant="ghost"
      size="icon"
      className={
        inlineToggle ? "text-muted-foreground" : "-ml-2.5 text-muted-foreground"
      }
      aria-label="Expand preview sidebar"
      onClick={() => setOpen(true)}
    >
      <PanelLeft className="size-4.5" />
    </Button>
  ) : null;
  if (parentTrigger !== undefined) {
    return typeof children === "function" ? children(parentTrigger) : children;
  }
  return (
    <div
      ref={frame}
      className="reference-screen flex h-[720px] w-full overflow-hidden rounded-xl border bg-card"
    >
      <aside
        inert={!open}
        aria-hidden={!open}
        className={`flex shrink-0 flex-col overflow-hidden bg-sidebar transition-[width] duration-200 ease-linear ${open ? "w-64 border-r border-sidebar-border" : "w-0"}`}
      >
        <div className="flex shrink-0 items-center justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label="Collapse preview sidebar"
            onClick={() => setOpen(false)}
          >
            <PanelLeft className="size-4.5" />
          </Button>
        </div>
      </aside>
      <main
        className={`flex min-w-0 flex-1 flex-col overflow-y-auto bg-card ${fullBleed ? "" : "px-4 md:px-8 md:py-2"}`}
      >
        {!inlineToggle && (!fullBleed || !open) && (
          <header
            aria-hidden={open}
            className={`flex h-14 shrink-0 items-center gap-2 ${fullBleed ? "border-b border-border/70 px-4 md:px-8" : ""}`}
          >
            {expandTrigger}
          </header>
        )}
        <div
          className={`flex min-h-0 flex-1 flex-col ${fullBleed ? "gap-0" : "gap-4"}`}
        >
          <ParentPreviewFrame.Provider value={expandTrigger}>
            {inlineToggle ? children(expandTrigger) : children}
          </ParentPreviewFrame.Provider>
        </div>
      </main>
    </div>
  );
}

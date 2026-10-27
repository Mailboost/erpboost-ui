import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@mailboost/erpboost-ui";
import { PanelLeft } from "lucide-react";
export function PageFrame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width < 640) setOpen(false);
    });
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);
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
            aria-label="Collapse preview sidebar"
            onClick={() => setOpen(false)}
          >
            <PanelLeft className="size-4.5" />
          </Button>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-card px-4 md:px-8 md:py-2">
        <header
          aria-hidden={open}
          className="flex h-14 shrink-0 items-center gap-2"
        >
          {!open && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Expand preview sidebar"
              onClick={() => setOpen(true)}
            >
              <PanelLeft className="size-4.5" />
            </Button>
          )}
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4">{children}</div>
      </main>
    </div>
  );
}

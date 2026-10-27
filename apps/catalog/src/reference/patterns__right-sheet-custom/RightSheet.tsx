// Reference example: https://ui.tailor.tech/patterns/right-sheet-custom
import { useEffect, type ReactNode } from "react";
import { Button } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  expandHref?: string;
  /** Visual dim behind the sheet; false uses an invisible dismiss layer instead (outside click still closes). */
  backdrop?: boolean;
  children: ReactNode;
};

export const RightSheet = ({
  open,
  onOpenChange,
  title,
  description,
  expandHref,
  backdrop = true,
  children,
}: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close sheet"
        onClick={() => onOpenChange(false)}
        className={cn(
          "absolute inset-0 z-0 border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          backdrop
            ? "bg-foreground/20 hover:bg-foreground/30"
            : "cursor-default bg-transparent",
        )}
      />
      <aside className="relative z-10 flex h-dvh max-h-dvh w-full max-w-[1024px] shrink-0 flex-col border-l bg-card shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {expandHref ? (
              <a
                href={expandHref}
                aria-label="Open full page"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                ↗
              </a>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              ×
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  );
};

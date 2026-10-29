import { useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import { Popover } from "@base-ui/react/popover";
import { X } from "lucide-react";
import { Button } from "../button";
import { Card } from "../card";
import { cn } from "@/lib/utils";

/** Standard Popover behavior and Card appearance; saving belongs to the caller. */
export function CellEditor({
  anchor,
  container,
  title,
  description,
  closeLabel,
  busy = false,
  onClose,
  actions,
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "title"> & {
  anchor: { left: number; top: number };
  container: HTMLElement;
  title: ReactNode;
  description?: ReactNode;
  closeLabel: string;
  busy?: boolean;
  onClose: () => void;
  actions?: ReactNode;
}) {
  const returnFocus = useRef(
    container.ownerDocument.activeElement as HTMLElement | null,
  );
  const position = useMemo(
    () => ({
      getBoundingClientRect: () => new DOMRect(anchor.left, anchor.top, 0, 0),
    }),
    [anchor.left, anchor.top],
  );
  return (
    <Popover.Root
      open
      onOpenChange={(open, details) => {
        if (!open) {
          if (busy) details.cancel();
          else onClose();
        }
      }}
    >
      <Popover.Portal
        container={container}
        style={{ position: "relative", zIndex: "var(--z-popup)" }}
      >
        <Popover.Positioner
          anchor={position}
          side="bottom"
          align="start"
          collisionPadding={8}
          positionMethod="fixed"
        >
          <Popover.Popup
            {...props}
            data-slot="cell-editor"
            aria-busy={busy}
            finalFocus={returnFocus}
            render={<Card.Root />}
            className={cn("astw:w-72 astw:max-w-[calc(100vw-1rem)]", className)}
          >
            <Card.Header
              title={
                <span className="astw:flex astw:items-center astw:justify-between astw:gap-2">
                  <Popover.Title render={<span />}>{title}</Popover.Title>
                  <Popover.Close
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={busy}
                        aria-label={closeLabel}
                      >
                        <X />
                      </Button>
                    }
                  />
                </span>
              }
              description={
                description ? (
                  <Popover.Description render={<span />}>
                    {description}
                  </Popover.Description>
                ) : undefined
              }
            />
            <Card.Content>{children}</Card.Content>
            {actions && (
              <Card.Content>
                <div className="astw:flex astw:items-center astw:justify-between astw:gap-2">
                  {actions}
                </div>
              </Card.Content>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

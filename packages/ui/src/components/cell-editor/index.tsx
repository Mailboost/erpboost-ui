import {
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "../button";
/** Anchored editing surface. Parsing, validation and persistence belong to the caller. */
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
  className = "",
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
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const insidePointer = useRef<Event | null>(null);
  useEffect(() => {
    const document = container.ownerDocument;
    const outside = (event: PointerEvent) => {
      const fromChildPortal = insidePointer.current === event;
      insidePointer.current = null;
      if (
        !busy &&
        !fromChildPortal &&
        !ref.current?.contains(event.target as Node)
      )
        onClose();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [container, busy, onClose]);
  return createPortal(
    <div
      {...props}
      ref={ref}
      role="dialog"
      aria-labelledby={titleId}
      aria-busy={busy}
      data-slot="cell-editor"
      className={`erpui-cell-editor ${className}`}
      style={{
        left: Math.max(
          8,
          Math.min(
            anchor.left,
            (container.ownerDocument.defaultView?.innerWidth ?? 1024) - 304,
          ),
        ),
        top: Math.max(
          8,
          Math.min(
            anchor.top,
            (container.ownerDocument.defaultView?.innerHeight ?? 768) - 326,
          ),
        ),
        ...props.style,
      }}
      onPointerDownCapture={(event) => {
        // React events retain their ancestry through child portals (e.g. Select).
        insidePointer.current = event.nativeEvent;
        props.onPointerDownCapture?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          if (!busy) onClose();
        } else props.onKeyDown?.(event);
      }}
    >
      <header className="erpui-cell-editor-title">
        <span id={titleId}>
          {title}
          <small>{description}</small>
        </span>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          aria-label={closeLabel}
          disabled={busy}
          onClick={onClose}
        >
          <X size={13} />
        </Button>
      </header>
      {children}
      {actions && (
        <footer className="erpui-cell-editor-actions">{actions}</footer>
      )}
    </div>,
    container,
  );
}

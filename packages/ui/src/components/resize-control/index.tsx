import { useRef, type ComponentProps, type PointerEvent } from "react";
import { ResizeHandle } from "../resize-handle";
import "./style.css";
export type ResizeControlProps = Omit<
  ComponentProps<typeof ResizeHandle>,
  | "onKeyDown"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onLostPointerCapture"
  | "aria-valuemin"
  | "aria-valuemax"
  | "aria-valuenow"
> & {
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Which side of the separator contains the resized panel. */
  panelSide?: "start" | "end";
  placement?: "flow" | "overlay";
  disabled?: boolean;
  onValueChange: (value: number) => void;
};
/** Pointer capture and keyboard mechanics over the unchanged ResizeHandle primitive. */
export function ResizeControl({
  value,
  min,
  max,
  step = 20,
  panelSide = "end",
  disabled = false,
  placement = "flow",
  className = "",
  onValueChange,
  orientation,
  ...props
}: ResizeControlProps) {
  const drag = useRef<{ id: number; coordinate: number; value: number } | null>(
    null,
  );
  const sign = panelSide === "end" ? -1 : 1;
  const clamp = (next: number) => Math.max(min, Math.min(max, next));
  const finish = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return (
    <ResizeHandle
      {...props}
      orientation={orientation}
      className={`erpui-resize-control ${className}`}
      data-placement={placement}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : (props.tabIndex ?? 0)}
      onKeyDown={(event) => {
        if (disabled) return;
        const backward = orientation === "horizontal" ? "ArrowUp" : "ArrowLeft";
        const forward =
          orientation === "horizontal" ? "ArrowDown" : "ArrowRight";
        const next =
          event.key === "Home"
            ? min
            : event.key === "End"
              ? max
              : event.key === backward
                ? value - sign * step
                : event.key === forward
                  ? value + sign * step
                  : null;
        if (next === null) return;
        event.preventDefault();
        onValueChange(clamp(next));
      }}
      onPointerDown={(event) => {
        if (disabled || !event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus();
        drag.current = {
          id: event.pointerId,
          coordinate:
            orientation === "horizontal" ? event.clientY : event.clientX,
          value,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (
          disabled ||
          start?.id !== event.pointerId ||
          !event.currentTarget.hasPointerCapture(event.pointerId)
        )
          return;
        onValueChange(
          clamp(
            start.value +
              sign *
                ((orientation === "horizontal"
                  ? event.clientY
                  : event.clientX) -
                  start.coordinate),
          ),
        );
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
    />
  );
}

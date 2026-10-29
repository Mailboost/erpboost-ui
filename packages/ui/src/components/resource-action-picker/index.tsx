import {
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type Ref,
} from "react";
import { ResourcePicker, type ResourcePickerProps } from "../resource-picker";
import { mergeRefs } from "../toolbar/toolbar";
export type ResourceActionPickerProps = ResourcePickerProps;
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
/** ResourcePicker with creation/rename callbacks after popup focus restoration. No business state or requests. */
export function ResourceActionPicker(props: ResourceActionPickerProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const mounted = useRef(false),
    pending = useRef(false);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const originalRef = (props.trigger.props as { ref?: Ref<HTMLElement> }).ref;
  const triggerRefWithCaller = useMemo(
    () => mergeRefs(triggerRef, originalRef),
    [originalRef],
  );
  async function afterClose(kind: "action" | "rename") {
    if (
      pending.current ||
      props.disabled ||
      (kind === "action" && props.action?.disabled)
    )
      return;
    const trigger = triggerRef.current,
      selectedValue = props.value;
    const popupId = trigger?.getAttribute("aria-controls");
    // Resolve this trigger's own popup, including a caller-supplied portal container.
    const controlled = popupId
      ? trigger?.ownerDocument.getElementById(popupId)
      : null;
    const popup =
      controlled?.closest<HTMLElement>(".erpui-resource-picker") ?? controlled;
    pending.current = true;
    try {
      await nextFrame();
      if (!mounted.current) return;
      const animations =
        popup
          ?.getAnimations?.()
          .filter((animation) =>
            Number.isFinite(
              Number(animation.effect?.getComputedTiming().iterations),
            ),
          ) ?? [];
      await Promise.all(
        animations.map((animation) => animation.finished.catch(() => {})),
      );
      await nextFrame();
      const current = latest.current;
      if (
        !mounted.current ||
        !trigger?.isConnected ||
        trigger.getAttribute("aria-expanded") === "true" ||
        current.disabled ||
        current.value !== selectedValue
      )
        return;
      if (kind === "action") {
        if (!current.action?.disabled) current.action?.onSelect();
      } else current.onRename?.();
    } finally {
      pending.current = false;
    }
  }
  return (
    <ResourcePicker
      {...props}
      trigger={cloneElement(
        props.trigger as ReactElement<{ ref?: Ref<HTMLElement> }>,
        { ref: triggerRefWithCaller },
      )}
      action={
        props.action
          ? {
              ...props.action,
              onSelect: () => {
                void afterClose("action");
              },
            }
          : undefined
      }
      onRename={
        props.onRename
          ? () => {
              void afterClose("rename");
            }
          : undefined
      }
    />
  );
}

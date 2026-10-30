import { cn } from "@/lib/utils";
import { useEffect, useRef, type ComponentProps } from "react";
import { Input } from "../input";
export type InlineRenameProps = Omit<
  ComponentProps<typeof Input>,
  | "value"
  | "defaultValue"
  | "onChange"
  | "onKeyDown"
  | "onBlur"
  | "onFocus"
  | "ref"
> & {
  value: string;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  onCancel: (originalValue: string) => void;
};
/** A controlled rename interaction. Validation and applying/persisting names stay with the caller. */
export function InlineRename({
  value,
  onValueChange,
  onCommit,
  onCancel,
  disabled,
  className = "",
  ...props
}: InlineRenameProps) {
  const ref = useRef<HTMLInputElement>(null),
    original = useRef(value),
    ended = useRef(false);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  function commit() {
    if (disabled || ended.current) return;
    ended.current = true;
    onCommit();
  }
  function cancel() {
    if (disabled || ended.current) return;
    ended.current = true;
    onCancel(original.current);
  }
  return (
    <Input
      {...props}
      ref={ref}
      value={value}
      disabled={disabled}
      className={cn(
        "erpui-inline-rename astw:[.erpui-inline-rename&]:w-[min(340px,40vw)]",
        "astw:[.erpui-inline-rename&]:min-w-30",
        className,
      )}
      onChange={(event) => onValueChange(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          commit();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          cancel();
        }
      }}
    />
  );
}

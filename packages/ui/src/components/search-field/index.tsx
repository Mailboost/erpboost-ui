import { useRef } from "react";
import { Search, X } from "lucide-react";
import { Input, type InputProps } from "../input";
import { Button } from "../button";
import { mergeRefs } from "../toolbar/toolbar";
import { cn } from "../../lib/utils";

/** Controlled text input and optional clear action. Filtering remains in the consumer. */
export function SearchField({
  className,
  clearLabel,
  onClear,
  ref,
  ...props
}: InputProps & {
  clearLabel?: string;
  onClear?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      data-slot="search-field"
      className={cn("erpui-search-field", className)}
    >
      <Search size={15} aria-hidden="true" />
      <Input {...props} ref={mergeRefs(input, ref)} />
      {onClear &&
        clearLabel &&
        props.value != null &&
        String(props.value).length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={props.disabled || props.readOnly}
            aria-label={clearLabel}
            onClick={() => {
              onClear();
              input.current?.focus();
            }}
          >
            <X size={13} aria-hidden="true" />
          </Button>
        )}
    </div>
  );
}

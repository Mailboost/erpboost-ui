import { useId, type ComponentProps, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { FileList } from "../file-list";
import { Alert } from "../alert";
export type InlineCreateProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  label: string;
  submitLabel: ReactNode;
  cancelLabel: string;
  error?: ReactNode;
  disabled?: boolean;
  canSubmit?: boolean;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  className?: string;
  inputRef?: ComponentProps<typeof Input>["ref"];
};
/** Input mechanics only; the consumer validates names and creates the resource. */
export function InlineCreate({
  value,
  onValueChange,
  onSubmit,
  onCancel,
  label,
  submitLabel,
  cancelLabel,
  error,
  disabled = false,
  canSubmit = true,
  autoFocus = true,
  inputRef,
  className,
  ...inputProps
}: InlineCreateProps) {
  const errorId = useId();
  return (
    <div data-slot="inline-create" className={className}>
      <FileList.Editor>
        <Input
          {...inputProps}
          ref={inputRef}
          autoFocus={autoFocus}
          aria-label={label}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return;
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              if (!disabled) onCancel();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              if (!disabled && canSubmit) onSubmit();
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !canSubmit}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={cancelLabel}
          onClick={onCancel}
        >
          <X size={12} />
        </Button>
      </FileList.Editor>
      {error && (
        <Alert.Root variant="error" role="alert" id={errorId}>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}
    </div>
  );
}

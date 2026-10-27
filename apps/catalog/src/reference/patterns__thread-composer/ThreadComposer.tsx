// Reference example: https://ui.tailor.tech/patterns/thread-composer
import { type ReactNode, useId } from "react";
import { Button } from "@mailboost/erpboost-ui";
import { Checkbox } from "../shared/checkbox";
import { Textarea } from "../shared/textarea";

export type ThreadComposerProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  customerPlaceholder?: string;
  internalPlaceholder?: string;
  internal?: boolean;
  onInternalChange?: (internal: boolean) => void;
  internalNoteLabel?: string;
  showInternalToggle?: boolean;
  onDiscard?: () => void;
  discardLabel?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  submitting?: boolean;
  submitPendingLabel?: string;
  header?: ReactNode;
  betweenBodyAndFooter?: ReactNode;
  footerLeading?: ReactNode;
  body?: ReactNode;
  textareaClassName?: string;
  className?: string;
};

const defaultLabels = {
  internalNote: "Internal note (not sent to customer)",
  customerPlaceholder: "Reply to customer…",
  internalPlaceholder: "Internal context for teammates…",
  discard: "Discard",
  send: "Send",
  sending: "Sending…",
} as const;

export const ThreadComposer = ({
  value,
  onChange,
  rows = 4,
  placeholder,
  customerPlaceholder = defaultLabels.customerPlaceholder,
  internalPlaceholder = defaultLabels.internalPlaceholder,
  internal = false,
  onInternalChange,
  internalNoteLabel = defaultLabels.internalNote,
  showInternalToggle = true,
  onDiscard,
  discardLabel = defaultLabels.discard,
  onSubmit,
  submitLabel = defaultLabels.send,
  submitDisabled = false,
  submitting = false,
  submitPendingLabel = defaultLabels.sending,
  header,
  betweenBodyAndFooter,
  footerLeading,
  body,
  textareaClassName,
  className,
}: ThreadComposerProps) => {
  const internalToggleId = useId();
  const resolvedPlaceholder =
    placeholder ?? (internal ? internalPlaceholder : customerPlaceholder);
  const resolvedSubmitLabel = submitting ? submitPendingLabel : submitLabel;

  return (
    <div
      className={[
        "space-y-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {header}
      {body ?? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={resolvedPlaceholder}
          rows={rows}
          className={textareaClassName}
        />
      )}
      {betweenBodyAndFooter}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {footerLeading ? (
            <div className="flex shrink-0 items-center">{footerLeading}</div>
          ) : null}
          {showInternalToggle && onInternalChange ? (
            <div className="flex min-w-0 items-center gap-2 text-xs leading-none">
              <Checkbox
                id={internalToggleId}
                checked={internal}
                onCheckedChange={(checked) =>
                  onInternalChange(checked === true)
                }
              />
              <label
                htmlFor={internalToggleId}
                className="cursor-pointer select-none leading-snug"
              >
                {internalNoteLabel}
              </label>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {onDiscard ? (
            <Button
              variant="ghost"
              type="button"
              onClick={onDiscard}
              disabled={submitting}
            >
              {discardLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled || submitting}
          >
            {resolvedSubmitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

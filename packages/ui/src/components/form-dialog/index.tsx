import type { ComponentProps, ReactNode } from "react";
import {
  RecordPanel,
  RecordPanelBody,
  RecordPanelFooter,
} from "../record-panel";
import { Button } from "../button";
import { LoaderCircle } from "lucide-react";
import "./style.css";
export type FormDialogProps = Omit<
  ComponentProps<typeof RecordPanel>,
  "children" | "closeDisabled"
> & {
  children: ReactNode;
  onSubmit: () => void;
  cancelLabel: string;
  submitLabel: ReactNode;
  busyLabel?: ReactNode;
  busy?: boolean;
  submitDisabled?: boolean;
  submitIcon?: ReactNode;
  leadingActions?: ReactNode;
  formClassName?: string;
  bodyClassName?: string;
};
/** Native validation and presentation only. The caller owns values, dirty state and persistence. */
export function FormDialog({
  children,
  onSubmit,
  cancelLabel,
  submitLabel,
  busyLabel,
  busy = false,
  submitDisabled = false,
  submitIcon,
  leadingActions,
  formClassName = "",
  bodyClassName = "",
  className = "",
  onClose,
  ...props
}: FormDialogProps) {
  return (
    <RecordPanel
      {...props}
      className={`erpui-form-dialog ${className}`}
      onClose={onClose}
      closeDisabled={busy}
    >
      <form
        className={`erpui-form-dialog-form ${formClassName}`}
        aria-busy={busy || undefined}
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy && !submitDisabled) onSubmit();
        }}
      >
        <RecordPanelBody className={`erpui-form-dialog-body ${bodyClassName}`}>
          {children}
        </RecordPanelBody>
        <RecordPanelFooter className="erpui-form-dialog-actions">
          {leadingActions && (
            <div className="erpui-form-dialog-leading">{leadingActions}</div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={busy || submitDisabled}
          >
            {busy ? (
              <LoaderCircle
                aria-hidden="true"
                size={15}
                className="erpui-form-dialog-spinner"
              />
            ) : (
              submitIcon
            )}
            {busy ? (busyLabel ?? submitLabel) : submitLabel}
          </Button>
        </RecordPanelFooter>
      </form>
    </RecordPanel>
  );
}

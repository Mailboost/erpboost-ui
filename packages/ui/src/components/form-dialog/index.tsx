import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import {
  RecordPanel,
  RecordPanelBody,
  RecordPanelFooter,
} from "../record-panel";
import { Button } from "../button";
import { LoaderCircle } from "lucide-react";
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
      className={cn(
        "erpui-form-dialog astw:[.erpui-form-dialog&]:flex astw:[.erpui-form-dialog&]:flex-col",
        "astw:[.erpui-form-dialog&]:overflow-hidden",
        "astw:[.erpui-form-dialog&[data-slot=dialog-content]]:z-[var(--z-overlay,1000)]",
        className,
      )}
      onClose={onClose}
      closeDisabled={busy}
    >
      <form
        className={cn(
          "erpui-form-dialog-form astw:[.erpui-form-dialog_&]:flex astw:[.erpui-form-dialog_&]:flex-1",
          "astw:[.erpui-form-dialog_&]:flex-col astw:[.erpui-form-dialog_&]:gap-0",
          "astw:[.erpui-form-dialog_&]:min-h-0 astw:[.erpui-form-dialog_&]:overflow-hidden",
          "astw:[.erpui-form-dialog[data-slot=dialog-content]_&]:gap-4",
          formClassName,
        )}
        aria-busy={busy || undefined}
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy && !submitDisabled) onSubmit();
        }}
      >
        <RecordPanelBody
          className={cn(
            "erpui-form-dialog-body astw:[.erpui-form-dialog_&]:flex-1 astw:[.erpui-form-dialog_&]:min-h-0",
            "astw:[.erpui-form-dialog_&]:overflow-auto",
            bodyClassName,
          )}
        >
          {children}
        </RecordPanelBody>
        <RecordPanelFooter className="erpui-form-dialog-actions astw:shrink-0 astw:flex-wrap">
          {leadingActions && (
            <div className="erpui-form-dialog-leading astw:mr-auto">
              {leadingActions}
            </div>
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
                className="erpui-form-dialog-spinner astw:animate-spin astw:motion-reduce:animate-none"
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

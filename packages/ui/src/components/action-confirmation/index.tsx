import type { ComponentProps, ReactNode } from "react";
import {
  RecordPanel,
  RecordPanelBody,
  RecordPanelFooter,
} from "../record-panel";
import { Button } from "../button";
export interface ActionConfirmationProps {
  title: ReactNode;
  children: ReactNode;
  cancelLabel: ReactNode;
  confirmLabel: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  error?: string;
  confirmVariant?: ComponentProps<typeof Button>["variant"];
  container?: ComponentProps<typeof RecordPanel>["container"];
}
export function ActionConfirmation({
  title,
  children,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  busy = false,
  error,
  confirmVariant = "default",
  container,
}: ActionConfirmationProps) {
  return (
    <RecordPanel
      title={title}
      onClose={onCancel}
      closeDisabled={busy}
      error={error}
      container={container}
    >
      <RecordPanelBody>{children}</RecordPanelBody>
      <RecordPanelFooter>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={confirmVariant}
          disabled={busy}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </RecordPanelFooter>
    </RecordPanel>
  );
}

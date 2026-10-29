import type { ComponentProps, ReactNode } from "react";
import {
  RecordPanel,
  RecordPanelBody,
  RecordPanelFooter,
} from "../record-panel";
import { Button } from "../button";
import "./style.css";
export function SettingsPanel({
  children,
  actions,
  closeLabel,
  onClose,
  closeDisabled = false,
  width = 380,
  className = "",
  ...props
}: Omit<ComponentProps<typeof RecordPanel>, "children" | "placement"> & {
  children: ReactNode;
  actions?: ReactNode;
  closeLabel: string;
}) {
  return (
    <RecordPanel
      {...props}
      placement="right"
      width={width}
      className={`erpui-settings-panel ${className}`}
      onClose={onClose}
      closeDisabled={closeDisabled}
    >
      <RecordPanelBody className="erpui-settings-panel-body">
        {children}
      </RecordPanelBody>
      <RecordPanelFooter className="erpui-settings-panel-actions">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={closeDisabled}
          onClick={onClose}
        >
          {closeLabel}
        </Button>
        {actions}
      </RecordPanelFooter>
    </RecordPanel>
  );
}

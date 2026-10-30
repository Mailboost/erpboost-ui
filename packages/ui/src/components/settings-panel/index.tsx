import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import {
  RecordPanel,
  RecordPanelBody,
  RecordPanelFooter,
} from "../record-panel";
import { Button } from "../button";
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
      <RecordPanelBody
        className={cn(
          "erpui-settings-panel-body astw:[.erpui-settings-panel_&]:flex",
          "astw:[.erpui-settings-panel_&]:flex-col astw:[.erpui-settings-panel_&]:gap-4.5",
        )}
      >
        {children}
      </RecordPanelBody>
      <RecordPanelFooter className="erpui-settings-panel-actions astw:shrink-0 astw:flex-wrap">
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

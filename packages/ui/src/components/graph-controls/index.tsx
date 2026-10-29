import type { ComponentProps, ReactNode } from "react";
import { Minus, Plus, Maximize2 } from "lucide-react";
import { Button } from "../button";
import { Toolbar } from "../toolbar";
import { Tooltip } from "../tooltip";
import { cn } from "../../lib/utils";
import { Text } from "../text";

export type GraphControlsProps = Omit<
  ComponentProps<typeof Toolbar.Row>,
  "children"
> & {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomOutLabel: string;
  zoomInLabel: string;
  fitViewLabel: string;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFitView: () => void;
  container?: ComponentProps<typeof Tooltip.Content>["container"];
  /** Optional orientation or other graph-specific controls, before zoom. */
  children?: ReactNode;
  /** Optional reset-zoom button in place of the plain percentage. */
  zoomDisplay?: ReactNode;
};
export function GraphControls({
  zoom,
  minZoom = 5,
  maxZoom = 150,
  zoomOutLabel,
  zoomInLabel,
  fitViewLabel,
  onZoomOut,
  onZoomIn,
  onFitView,
  container,
  children,
  zoomDisplay,
  className,
  ...props
}: GraphControlsProps) {
  return (
    <Toolbar.Root className={className} data-slot="graph-controls">
      <Toolbar.Row {...props} className={cn("astw:shrink-0")}>
        {children}
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Button
                variant="ghost"
                size="sm"
                type="button"
                aria-label={zoomOutLabel}
                disabled={zoom <= minZoom}
                onClick={onZoomOut}
              >
                <Minus size={14} />
              </Button>
            }
          />
          <Tooltip.Content container={container}>
            {zoomOutLabel}
          </Tooltip.Content>
        </Tooltip.Root>
        {zoomDisplay ?? (
          <Text variant="label-sm" className="astw:tabular-nums">
            {zoom}%
          </Text>
        )}
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Button
                variant="ghost"
                size="sm"
                type="button"
                aria-label={zoomInLabel}
                disabled={zoom >= maxZoom}
                onClick={onZoomIn}
              >
                <Plus size={14} />
              </Button>
            }
          />
          <Tooltip.Content container={container}>{zoomInLabel}</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Button
                variant="ghost"
                size="sm"
                type="button"
                aria-label={fitViewLabel}
                onClick={onFitView}
              >
                <Maximize2 size={14} />
              </Button>
            }
          />
          <Tooltip.Content container={container}>
            {fitViewLabel}
          </Tooltip.Content>
        </Tooltip.Root>
      </Toolbar.Row>
    </Toolbar.Root>
  );
}

import { cn } from "@/lib/utils";
import { Alert } from "../alert";
import { Dialog as UiDialog } from "../dialog";
import { Sheet } from "../sheet";
import {
  createContext,
  useContext,
  useId,
  useRef,
  type ReactNode,
  type ComponentProps,
} from "react";

const SideDialogContext = createContext(false);

export function RecordPanel({
  title,
  children,
  onClose,
  error,
  closeDisabled = false,
  placement = "center",
  className = "",
  subtitle,
  container,
  width,
  sideWidth = 672,
}: {
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  error?: string;
  closeDisabled?: boolean;
  placement?: "center" | "right";
  className?: string;
  subtitle?: string;
  container?: ComponentProps<typeof UiDialog.Content>["container"];
  width?: number;
  sideWidth?: number;
}) {
  const side = placement === "right";
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const header = side ? (
    <Sheet.Header
      className={cn(
        "erpui-record-panel-header astw:[.erpui-detail-panel>&]:items-start",
        "astw:[.erpui-detail-panel>&]:min-w-0 astw:[.erpui-detail-panel>&>div]:min-w-0",
        "astw:[.erpui-detail-panel>&>div]:flex-1 astw:shrink-0 astw:min-w-0",
        "astw:[.erpui-record-editor_&_h2]:flex astw:[.erpui-record-editor_&_h2]:flex-wrap",
        "astw:[.erpui-record-editor_&_h2]:gap-2 astw:[.erpui-record-editor_&_code]:text-[12px]",
        "astw:[.erpui-record-editor_&_code]:text-muted-foreground",
      )}
    >
      <Sheet.Title id={titleId}>{title}</Sheet.Title>
      {subtitle && (
        <code className="erpui-record-panel-subtitle astw:block astw:mt-[5px] astw:text-[11px] astw:text-muted-foreground">
          {subtitle}
        </code>
      )}
    </Sheet.Header>
  ) : (
    <UiDialog.Header
      className={cn(
        "erpui-record-panel-header astw:[.erpui-detail-panel>&]:items-start",
        "astw:[.erpui-detail-panel>&]:min-w-0 astw:[.erpui-detail-panel>&>div]:min-w-0",
        "astw:[.erpui-detail-panel>&>div]:flex-1 astw:shrink-0 astw:min-w-0",
        "astw:[.erpui-record-editor_&_h2]:flex astw:[.erpui-record-editor_&_h2]:flex-wrap",
        "astw:[.erpui-record-editor_&_h2]:gap-2 astw:[.erpui-record-editor_&_code]:text-[12px]",
        "astw:[.erpui-record-editor_&_code]:text-muted-foreground",
      )}
    >
      <UiDialog.Title id={titleId}>{title}</UiDialog.Title>
      {subtitle && (
        <code className="erpui-record-panel-subtitle astw:block astw:mt-[5px] astw:text-[11px] astw:text-muted-foreground">
          {subtitle}
        </code>
      )}
    </UiDialog.Header>
  );
  const body = (
    <SideDialogContext.Provider value={side}>
      {header}
      {error && (
        <Alert.Root
          variant="error"
          className={cn(
            "erpui-record-panel-error astw:[.erpui-detail-panel>&]:shrink-0",
            "astw:[.erpui-detail-panel>&]:max-h-[25dvh] astw:[.erpui-detail-panel>&]:overflow-auto",
            "astw:[.erpui-detail-panel>&]:my-3 astw:[.erpui-detail-panel>&]:mx-5",
            "astw:[.erpui-form-dialog_&]:max-h-[25dvh] astw:[.erpui-form-dialog_&]:overflow-auto astw:shrink-0",
            "astw:mt-[17px] astw:mx-5.5 astw:mb-0 astw:whitespace-pre-line",
            "astw:[.erpui-settings-panel_&]:max-h-[25dvh] astw:[.erpui-settings-panel_&]:overflow-auto",
          )}
        >
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}
      {children}
    </SideDialogContext.Provider>
  );
  const initialFocus = () =>
    ref.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not(:disabled), [role="combobox"]:not(:disabled), textarea:not(:disabled)',
    ) ?? ref.current;
  if (side)
    return (
      <Sheet.Root
        open
        side="right"
        onOpenChange={(open, details) => {
          if (!open) {
            details.cancel();
            if (
              !closeDisabled &&
              !(
                details.reason === "escape-key" &&
                ref.current?.querySelector('[aria-expanded="true"]')
              )
            )
              onClose();
          }
        }}
      >
        <Sheet.Content
          ref={ref}
          container={container}
          size="lg"
          initialFocus={initialFocus}
          style={{ width: `min(${width ?? sideWidth}px, 100vw)` }}
          className={cn(
            "erpui-record-panel astw:max-h-[calc(100vh_-_50px)] astw:[&>form]:flex astw:[&>form]:flex-col",
            "astw:[&>form]:gap-4 astw:[&>form]:min-h-0 astw:[&>form]:overflow-auto",
            "astw:[&_[data-slot=sheet-inner-content]>form]:flex",
            "astw:[&_[data-slot=sheet-inner-content]>form]:flex-col",
            "astw:[&_[data-slot=sheet-inner-content]>form]:gap-4",
            "astw:[&_[data-slot=sheet-inner-content]>form]:min-h-0",
            "astw:[&_[data-slot=sheet-inner-content]>form]:overflow-auto",
            "astw:[&[data-slot=dialog-content]]:z-[calc(var(--z-overlay,1000)_+_1)] erpui-record-panel-side",
            "astw:[.erpui-record-panel&]:relative astw:[.erpui-record-panel&]:inset-auto",
            "astw:[.erpui-record-panel&]:h-dvh astw:[.erpui-record-panel&]:max-h-dvh",
            "astw:[.erpui-record-panel&]:max-w-screen astw:[.erpui-record-panel&]:rounded-none",
            "astw:[.erpui-record-panel&]:flex astw:[.erpui-record-panel&]:flex-col",
            "astw:[.erpui-record-panel&]:transform-none astw:[.erpui-record-panel&]:overflow-hidden",
            "astw:[&_form]:flex-1",
            className,
          )}
          aria-labelledby={titleId}
        >
          {body}
        </Sheet.Content>
      </Sheet.Root>
    );
  return (
    <UiDialog.Root
      open
      onOpenChange={(open, details) => {
        if (!open) {
          details.cancel();
          if (
            !closeDisabled &&
            details.reason !== "outside-press" &&
            !(
              details.reason === "escape-key" &&
              ref.current?.querySelector('[aria-expanded="true"]')
            )
          )
            onClose();
        }
      }}
    >
      <UiDialog.Content
        ref={ref}
        container={container}
        initialFocus={initialFocus}
        style={{ width: `min(${width ?? 520}px, calc(100vw - 32px))` }}
        className={cn(
          "erpui-record-panel astw:max-h-[calc(100vh_-_50px)] astw:[&>form]:flex astw:[&>form]:flex-col",
          "astw:[&>form]:gap-4 astw:[&>form]:min-h-0 astw:[&>form]:overflow-auto",
          "astw:[&_[data-slot=sheet-inner-content]>form]:flex",
          "astw:[&_[data-slot=sheet-inner-content]>form]:flex-col",
          "astw:[&_[data-slot=sheet-inner-content]>form]:gap-4",
          "astw:[&_[data-slot=sheet-inner-content]>form]:min-h-0",
          "astw:[&_[data-slot=sheet-inner-content]>form]:overflow-auto",
          "astw:[&[data-slot=dialog-content]]:z-[calc(var(--z-overlay,1000)_+_1)]",
          className,
        )}
        aria-labelledby={titleId}
      >
        {body}
      </UiDialog.Content>
    </UiDialog.Root>
  );
}

export function RecordPanelBody({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "erpui-record-panel-body astw:min-w-0 astw:min-h-0 astw:overflow-auto",
        "astw:[.erpui-record-panel-side_&]:flex-1 astw:[.erpui-record-panel-side_&]:p-4",
        className,
      )}
      {...props}
    />
  );
}

export function RecordPanelFooter({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return useContext(SideDialogContext) ? (
    <Sheet.Footer
      className={`erpui-record-panel-footer ${className}`}
      {...props}
    />
  ) : (
    <UiDialog.Footer
      className={`erpui-record-panel-footer ${className}`}
      {...props}
    />
  );
}

export { RecordEditor } from "./editor";

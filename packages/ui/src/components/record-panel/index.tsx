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
import "./style.css";

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
    <Sheet.Header className="erpui-record-panel-header">
      <Sheet.Title id={titleId}>{title}</Sheet.Title>
      {subtitle && (
        <code className="erpui-record-panel-subtitle">{subtitle}</code>
      )}
    </Sheet.Header>
  ) : (
    <UiDialog.Header className="erpui-record-panel-header">
      <UiDialog.Title id={titleId}>{title}</UiDialog.Title>
      {subtitle && (
        <code className="erpui-record-panel-subtitle">{subtitle}</code>
      )}
    </UiDialog.Header>
  );
  const body = (
    <SideDialogContext.Provider value={side}>
      {header}
      {error && (
        <Alert.Root variant="error" className="erpui-record-panel-error">
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
          className={`erpui-record-panel erpui-record-panel-side ${className}`}
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
        className={`erpui-record-panel ${className}`}
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
  return <div className={`erpui-record-panel-body ${className}`} {...props} />;
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

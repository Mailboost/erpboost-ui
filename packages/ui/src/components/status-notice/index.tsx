import type { ComponentProps, ReactNode } from "react";
import { X } from "lucide-react";
import { Alert } from "../alert";
import { Button } from "../button";
import "./style.css";
export type StatusNoticeProps = Omit<
  ComponentProps<typeof Alert.Root>,
  "children" | "dismissible" | "onDismiss" | "action" | "title"
> & {
  children: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  dismiss?: { label: string; onDismiss: () => void; disabled?: boolean };
};
/** Controlled notification: the consumer owns the message and dismissal lifecycle. */
export function StatusNotice({
  children,
  title,
  actions,
  dismiss,
  className = "",
  variant = "neutral",
  role = variant === "error" ? "alert" : "status",
  ...props
}: StatusNoticeProps) {
  return (
    <Alert.Root
      {...props}
      variant={variant}
      role={role}
      action={actions}
      className={`erpui-status-notice ${className}`}
    >
      {title && <Alert.Title>{title}</Alert.Title>}
      <Alert.Description>{children}</Alert.Description>
      {dismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="erpui-status-notice-dismiss"
          aria-label={dismiss.label}
          disabled={dismiss.disabled}
          onClick={dismiss.onDismiss}
        >
          <X size={15} />
        </Button>
      )}
    </Alert.Root>
  );
}

import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { X } from "lucide-react";
import { Alert } from "../alert";
import { Button } from "../button";
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
      className={cn(
        "erpui-status-notice astw:[&_[data-slot=alert-title]]:min-w-0",
        "astw:[&_[data-slot=alert-title]]:wrap-anywhere astw:[&_[data-slot=alert-description]]:min-w-0",
        "astw:[&_[data-slot=alert-description]]:wrap-anywhere",
        className,
      )}
    >
      {title && <Alert.Title>{title}</Alert.Title>}
      <Alert.Description>{children}</Alert.Description>
      {dismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "erpui-status-notice-dismiss astw:[.erpui-status-notice>&]:col-start-3",
            "astw:[.erpui-status-notice>&]:row-start-1 astw:[.erpui-status-notice>&]:self-[start]",
          )}
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

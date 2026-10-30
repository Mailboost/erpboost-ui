import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { RefreshCw } from "lucide-react";
import { Alert } from "../alert";
import { Button } from "../button";
export type RetryNoticeProps = Omit<
  ComponentProps<typeof Alert.Root>,
  "action" | "dismissible" | "onDismiss" | "variant"
> & {
  retryLabel: string;
  onRetry: () => void;
  retrying?: boolean;
  retryDisabled?: boolean;
};
/** The caller owns the request, pending state and message. No automatic retries or data access. */
export function RetryNotice({
  children,
  retryLabel,
  onRetry,
  retrying = false,
  retryDisabled = false,
  className = "",
  ...props
}: RetryNoticeProps) {
  return (
    <Alert.Root
      {...props}
      variant="error"
      aria-busy={retrying || undefined}
      className={cn(
        "erpui-retry-notice astw:[.erpui-retry-notice&]:min-w-0 astw:[.erpui-retry-notice&]:max-w-full",
        "astw:[&_[data-slot=alert-description]]:block astw:[&_[data-slot=alert-description]]:min-w-0",
        "astw:[&_[data-slot=alert-description]]:max-h-[min(40dvh,320px)]",
        "astw:[&_[data-slot=alert-description]]:overflow-auto",
        "astw:[&_[data-slot=alert-description]]:wrap-anywhere",
        "astw:[&_[data-slot=alert-description]]:whitespace-pre-wrap astw:[&_[data-slot=alert-action]]:min-w-0",
        "astw:[&_[data-slot=alert-action]]:flex-wrap",
        className,
      )}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={retrying || retryDisabled}
          aria-busy={retrying || undefined}
          onClick={() => {
            if (!retrying && !retryDisabled) onRetry();
          }}
        >
          <RefreshCw
            aria-hidden="true"
            size={14}
            className={
              retrying
                ? "erpui-retry-notice-spin astw:animate-spin astw:motion-reduce:animate-none"
                : undefined
            }
          />
          {retryLabel}
        </Button>
      }
    >
      <Alert.Description tabIndex={0}>{children}</Alert.Description>
    </Alert.Root>
  );
}

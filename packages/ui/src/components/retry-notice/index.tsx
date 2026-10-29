import type { ComponentProps } from "react";
import { RefreshCw } from "lucide-react";
import { Alert } from "../alert";
import { Button } from "../button";
import "./style.css";
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
      className={`erpui-retry-notice ${className}`}
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
            className={retrying ? "erpui-retry-notice-spin" : undefined}
          />
          {retryLabel}
        </Button>
      }
    >
      <Alert.Description tabIndex={0}>{children}</Alert.Description>
    </Alert.Root>
  );
}

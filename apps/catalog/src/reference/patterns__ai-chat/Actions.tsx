// Reference example: https://ui.tailor.tech/patterns/ai-chat
import type { ComponentProps } from "react";
import { Button } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";

// Icon-button row rendered under a finished assistant message (adapted from
// AI Elements' Actions) — copy, regenerate, feedback. Keep it out of the
// message bubble itself so streaming turns stay clean; only show it once the
// turn has finished.
//
// Usage:
//   <Actions>
//     <Action label="Copy" onClick={copy}><Copy className="size-3.5" /></Action>
//     <Action label="Retry" onClick={retry}><RefreshCw className="size-3.5" /></Action>
//   </Actions>

export type ActionsProps = ComponentProps<"div">;

export const Actions = ({ className, ...props }: ActionsProps) => (
  <div className={cn("flex items-center gap-0.5", className)} {...props} />
);

export type ActionProps = ComponentProps<typeof Button> & {
  /** Accessible name; also shown as the hover tooltip. */
  label: string;
};

export const Action = ({
  label,
  className,
  variant = "ghost",
  size = "icon",
  children,
  ...props
}: ActionProps) => (
  <Button
    type="button"
    variant={variant}
    size={size}
    aria-label={label}
    title={label}
    className={cn(
      "size-7 shrink-0 text-muted-foreground hover:text-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </Button>
);

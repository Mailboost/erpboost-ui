// Reference example: https://ui.tailor.tech/patterns/ai-chat
import type { ComponentProps } from "react";
import { Button } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";

// Starter-prompt chips shown while the conversation is empty (adapted from
// AI Elements' Suggestion). Each chip submits its text as if the user had
// typed it — the fastest way to teach people what the assistant is good at.

export type SuggestionsProps = ComponentProps<"div">;

export const Suggestions = ({ className, children, ...props }: SuggestionsProps) => (
  <div className={cn("flex flex-wrap items-start gap-1.5", className)} {...props}>
    {children}
  </div>
);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "secondary",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => (
  <Button
    type="button"
    variant={variant}
    size={size}
    className={cn(
      "h-auto cursor-pointer justify-start whitespace-normal rounded-full px-3 py-1.5 text-left",
      className,
    )}
    onClick={() => onClick?.(suggestion)}
    {...props}
  >
    {children ?? suggestion}
  </Button>
);

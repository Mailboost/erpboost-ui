import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button, type ButtonProps } from "../button";
import { cn } from "../../lib/utils";

/** A native button with a title and description. Selection/application stays in the consumer. */
export function OptionCard({
  title,
  description,
  icon,
  className,
  ...props
}: Omit<ButtonProps, "title" | "children" | "render"> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      {...props}
      data-slot="option-card"
      className={cn("erpui-option-card", className)}
    >
      {icon}
      <span data-slot="option-card-content">
        <strong>{title}</strong>
        {description && (
          <span data-slot="option-card-description">{description}</span>
        )}
      </span>
      <ChevronRight size={15} aria-hidden="true" />
    </Button>
  );
}

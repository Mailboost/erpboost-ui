import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button, type ButtonProps } from "../button";
import { Card } from "../card";

/** Existing Card and Button parts; application owns the selection handler. */
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
    <Card.Root data-slot="option-card" className={className}>
      <Card.Header
        title={
          <Button type="button" variant="outline" {...props}>
            {icon}
            {title}
            <ChevronRight size={15} aria-hidden="true" />
          </Button>
        }
        description={description}
      />
    </Card.Root>
  );
}

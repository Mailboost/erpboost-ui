import type { ComponentProps, ReactNode } from "react";
import { Button } from "../button";
import { cn } from "@/lib/utils";
function Root(props: ComponentProps<"div">) {
  return <div {...props} data-slot="file-list" />;
}
export function FileListItem({
  selected,
  name,
  icon,
  actions,
  onSelect,
}: {
  selected: boolean;
  name: string;
  icon?: ReactNode;
  actions?: ReactNode;
  onSelect: () => void;
}) {
  return (
    <div
      data-slot="file-list-item"
      data-selected={selected || undefined}
      className="astw:flex astw:min-w-0 astw:items-center"
    >
      <Button
        type="button"
        variant={selected ? "secondary" : "ghost"}
        size="sm"
        className="astw:min-w-0 astw:flex-1 astw:justify-start"
        aria-pressed={selected}
        title={name}
        onClick={onSelect}
      >
        {icon}
        <span className="astw:truncate">{name}</span>
      </Button>
      {actions && (
        <div data-slot="file-list-actions" className="astw:shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
/** File validation and keyboard handling remain in the application. */
function Editor({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="file-list-editor"
      className={cn(
        "astw:mb-2 astw:flex astw:flex-wrap astw:items-center astw:gap-2",
        className,
      )}
    />
  );
}
export const FileList = Object.assign(Root, { Editor });

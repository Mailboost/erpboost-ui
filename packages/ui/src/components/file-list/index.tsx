import type { ComponentProps, ReactNode } from "react";
import { Button } from "../button";
function FileListRoot(props: ComponentProps<"div">) {
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
      className="erpui-file-list-item"
      data-selected={selected || undefined}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-slot="file-list-select"
        className="erpui-file-list-select"
        aria-pressed={selected}
        title={name}
        onClick={onSelect}
      >
        {icon}
        <span>{name}</span>
      </Button>
      {actions && (
        <div data-slot="file-list-actions" className="erpui-file-list-actions">
          {actions}
        </div>
      )}
    </div>
  );
}

/** Input/action row for adding a file. Naming, keyboard handlers and validation stay in the app. */
function Editor({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="file-list-editor" className={className} />;
}
export const FileList = Object.assign(FileListRoot, { Editor });

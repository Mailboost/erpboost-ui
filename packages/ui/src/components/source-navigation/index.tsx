import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { ChevronDown, FileCode2, FolderOpen, Plus, X } from "lucide-react";
import { CodeWorkspace } from "../code-workspace";
import { FileList, FileListItem } from "../file-list";
import { Button } from "../button";
import { Tabs } from "../tabs";
import { Tooltip } from "../tooltip";
export interface SourceFile {
  name: string;
  icon?: ReactNode;
  removable?: boolean;
}
export interface SourceAddAction {
  label: string;
  tooltip?: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}
export interface SourceRemoveAction {
  label: (name: string) => string;
  tooltip?: ReactNode;
  disabled?: boolean;
  onSelect: (name: string) => void;
}
type NavigationProps = {
  files: readonly SourceFile[];
  value: string;
  onValueChange: (name: string) => void;
};
export type SourceFilesProps = Omit<
  ComponentProps<typeof CodeWorkspace.Sidebar>,
  "title" | "onSelect"
> &
  NavigationProps & {
    title: ReactNode;
    group?: ReactNode;
    addAction?: SourceAddAction;
    removeAction?: SourceRemoveAction;
    container?: ComponentProps<typeof Tooltip.Content>["container"];
  };
/** Controlled file presentation. The caller owns validation, file contents, add/remove and selection fallback. */
function Files({
  files,
  value,
  onValueChange,
  title,
  group,
  addAction,
  removeAction,
  container,
  children,
  className = "",
  ...props
}: SourceFilesProps) {
  return (
    <CodeWorkspace.Sidebar
      {...props}
      className={cn(
        "erpui-source-navigation-sidebar astw:[&_[data-slot=code-workspace-header]]:py-2",
        "astw:[&_[data-slot=code-workspace-header]]:px-0 astw:[&_[data-slot=code-workspace-header]]:gap-1.5",
        "astw:[&_[data-slot=code-workspace-header]>span]:overflow-hidden",
        "astw:[&_[data-slot=code-workspace-header]>span]:whitespace-nowrap",
        "astw:[&_[data-slot=code-workspace-header]>span]:text-ellipsis",
        "astw:[&_[data-slot=code-workspace-header-actions]_button]:w-7",
        "astw:[&_[data-slot=code-workspace-header-actions]_button]:min-w-7",
        "astw:[&_[data-slot=code-workspace-header-actions]_button]:h-7",
        "astw:[&_[data-slot=code-workspace-header-actions]_button]:p-0",
        className,
      )}
    >
      <CodeWorkspace.Header
        icon={<FolderOpen size={13} />}
        actions={
          addAction && (
            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    aria-label={addAction.label}
                    disabled={addAction.disabled}
                    onClick={() => {
                      if (!addAction.disabled) addAction.onSelect();
                    }}
                  >
                    <Plus size={13} />
                  </Button>
                }
              />
              <Tooltip.Content container={container}>
                {addAction.tooltip ?? addAction.label}
              </Tooltip.Content>
            </Tooltip.Root>
          )
        }
      >
        {title}
      </CodeWorkspace.Header>
      {group != null && (
        <CodeWorkspace.Header icon={<ChevronDown size={12} />}>
          {group}
        </CodeWorkspace.Header>
      )}
      <FileList className="erpui-source-navigation-files astw:mb-4">
        {files.map((file) => (
          <FileListItem
            key={file.name}
            name={file.name}
            selected={value === file.name}
            icon={file.icon ?? <FileCode2 size={13} />}
            onSelect={() => onValueChange(file.name)}
            actions={
              file.removable && removeAction ? (
                <Tooltip.Root>
                  <Tooltip.Trigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        aria-label={removeAction.label(file.name)}
                        disabled={removeAction.disabled}
                        onClick={() => {
                          if (!removeAction.disabled)
                            removeAction.onSelect(file.name);
                        }}
                      >
                        <X size={12} />
                      </Button>
                    }
                  />
                  <Tooltip.Content container={container}>
                    {removeAction.tooltip ?? removeAction.label(file.name)}
                  </Tooltip.Content>
                </Tooltip.Root>
              ) : undefined
            }
          />
        ))}
      </FileList>
      {children && (
        <div className="erpui-source-navigation-extra astw:min-w-0 astw:wrap-anywhere">
          {children}
        </div>
      )}
    </CodeWorkspace.Sidebar>
  );
}
export type SourceTabsProps = Omit<
  ComponentProps<typeof CodeWorkspace.EditorTabs>,
  "children"
> &
  NavigationProps & { label: string; meta?: ReactNode };
function FileTabs({
  files,
  value,
  onValueChange,
  label,
  meta,
  className = "",
  ...props
}: SourceTabsProps) {
  return (
    <CodeWorkspace.EditorTabs
      {...props}
      className={`erpui-source-navigation-tabs astw:[.erpui-source-navigation-tabs&]:min-w-0 ${className}`}
    >
      <Tabs.Root
        value={value}
        onValueChange={(next) => onValueChange(String(next))}
        variant="line"
      >
        <Tabs.List aria-label={label}>
          {files.map((file) => (
            <Tabs.Tab key={file.name} value={file.name}>
              {file.icon ?? <FileCode2 size={13} />} {file.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.Root>
      {meta != null && (
        <small className="erpui-source-navigation-meta astw:shrink-0 astw:whitespace-nowrap">
          {meta}
        </small>
      )}
    </CodeWorkspace.EditorTabs>
  );
}
export const SourceNavigation = { Files, Tabs: FileTabs };

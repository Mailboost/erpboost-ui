import type { ComponentProps, ReactNode } from "react";
import { ChevronDown, FileCode2, FolderOpen, Plus, X } from "lucide-react";
import { CodeWorkspace } from "../code-workspace";
import { FileList, FileListItem } from "../file-list";
import { Button } from "../button";
import { Tabs } from "../tabs";
import { Tooltip } from "../tooltip";
import "./style.css";
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
      className={`erpui-source-navigation-sidebar ${className}`}
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
      <FileList className="erpui-source-navigation-files">
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
        <div className="erpui-source-navigation-extra">{children}</div>
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
      className={`erpui-source-navigation-tabs ${className}`}
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
        <small className="erpui-source-navigation-meta">{meta}</small>
      )}
    </CodeWorkspace.EditorTabs>
  );
}
export const SourceNavigation = { Files, Tabs: FileTabs };

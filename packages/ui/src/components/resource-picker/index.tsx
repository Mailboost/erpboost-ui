import { cn } from "@/lib/utils";
import {
  useMemo,
  useState,
  type ReactNode,
  type ReactElement,
  type ComponentProps,
} from "react";
import { Combobox } from "../combobox";
import { Button } from "../button";
export interface ResourceOption {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  accessory?: ReactNode;
}
export interface ResourcePickerProps {
  options: ResourceOption[];
  value: string | null;
  selectedLabel: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
  trigger: ReactElement;
  children: ReactNode;
  triggerLabel: string;
  title?: string;
  searchLabel: string;
  searchPlaceholder?: string;
  listLabel?: string;
  emptyContent?: ReactNode;
  statusContent?: ReactNode;
  onRename?: () => void;
  headerTrigger?: boolean;
  popupWidth?: number;
  action?: {
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    onSelect: () => void;
  };
  container?: ComponentProps<typeof Combobox.Parts.Content>["container"];
}
const normalize = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase();
export function ResourcePicker({
  options,
  value,
  selectedLabel,
  disabled,
  onSelect,
  trigger,
  children,
  triggerLabel,
  title,
  searchLabel,
  searchPlaceholder,
  listLabel,
  emptyContent,
  statusContent,
  onRename,
  headerTrigger = false,
  popupWidth = 288,
  action,
  container,
}: ResourcePickerProps) {
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      options.filter((option) =>
        normalize(`${option.name} ${option.description ?? ""}`).includes(
          normalize(search.trim()),
        ),
      ),
    [options, search],
  );
  const rename = () => {
    setOpen(false);
    onRename?.();
  };
  return (
    <Combobox.Parts.Root
      items={options.map((option) => option.id)}
      value={value}
      filter={null}
      open={open}
      disabled={disabled}
      itemToStringLabel={(id) =>
        options.find((option) => option.id === id)?.name ?? selectedLabel
      }
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSearch("");
      }}
      onValueChange={(id) => {
        if (id) {
          setOpen(false);
          onSelect(id);
        }
      }}
    >
      <Combobox.Parts.Trigger
        render={trigger}
        className={
          headerTrigger
            ? undefined
            : "astw:static astw:inset-auto astw:min-w-0 astw:max-w-full"
        }
        aria-label={triggerLabel}
        title={title ?? selectedLabel}
        onDoubleClick={onRename ? rename : undefined}
        onKeyDown={(event) => {
          if (
            event.key === "F2" &&
            onRename &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            rename();
          }
        }}
      >
        {children}
      </Combobox.Parts.Trigger>
      <Combobox.Parts.Content
        container={container}
        className={cn(
          "erpui-resource-picker astw:[&_[data-slot=combobox-item]_small]:block astw:[&_[role=status]]:p-2.5",
          "astw:[&_[role=status]]:text-[12px] astw:[&_[role=status]]:text-muted-foreground",
        )}
        style={{ width: `min(${popupWidth}px, calc(100vw - 24px))` }}
      >
        <Combobox.Parts.Input
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {statusContent}
        <Combobox.Parts.List aria-label={listLabel}>
          {filtered.map((option) => (
            <Combobox.Parts.Item key={option.id} value={option.id}>
              {option.icon}
              <span>
                {option.name}
                {option.description && <small>{option.description}</small>}
              </span>
              {option.accessory}
            </Combobox.Parts.Item>
          ))}
        </Combobox.Parts.List>
        {!filtered.length && emptyContent}
        {action && (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || action.disabled}
            onClick={() => {
              setOpen(false);
              action.onSelect();
            }}
          >
            {action.icon}
            {action.label}
          </Button>
        )}
      </Combobox.Parts.Content>
    </Combobox.Parts.Root>
  );
}
export { LookupInput, type LookupInputProps } from "./lookup-input";

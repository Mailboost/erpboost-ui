import {
  useEffect,
  useState,
  type ReactNode,
  type ComponentProps,
} from "react";
import { Combobox } from "../combobox";
import { Alert } from "../alert";
export interface LookupInputProps {
  id?: string;
  label: string;
  value: string | null;
  items: { value: string; label: string }[];
  search: string;
  onSearchChange: (value: string) => void;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  loadingContent?: ReactNode;
  error?: string;
  placeholder?: string;
  triggerLabel: string;
  clearLabel: string;
  emptyContent?: ReactNode;
  container?: ComponentProps<typeof Combobox.Parts.Content>["container"];
}
/** Fetching, debouncing, IDs and access checks are owned by the consumer. */
export function LookupInput({
  id,
  label,
  value,
  items,
  search,
  onSearchChange,
  onValueChange,
  disabled,
  required,
  loading,
  loadingContent,
  error,
  placeholder,
  triggerLabel,
  clearLabel,
  emptyContent,
  container,
}: LookupInputProps) {
  const selected = items.find((option) => option.value === value);
  const [lastSelection, setLastSelection] = useState<{
      value: string;
      label: string;
    } | null>(null),
    [open, setOpen] = useState(false);
  useEffect(() => {
    if (selected) setLastSelection(selected);
  }, [selected?.value, selected?.label]);
  const selectedLabel =
    selected?.label ??
    (lastSelection?.value === value ? lastSelection.label : (value ?? ""));
  if (loading && value !== null && !lastSelection) return <>{loadingContent}</>;
  const labelFor = (key: string) =>
    key === ""
      ? clearLabel
      : (items.find((option) => option.value === key)?.label ??
        (key === value ? selectedLabel : key));
  return (
    <Combobox.Parts.Root
      items={["", ...items.map((item) => item.value)]}
      filter={null}
      value={value}
      open={open}
      disabled={disabled}
      required={required}
      itemToStringLabel={labelFor}
      inputValue={open ? search : value === null ? "" : selectedLabel}
      onInputValueChange={(next, details) => {
        if (details.reason === "input-change") {
          onSearchChange(next);
          setOpen(true);
        }
      }}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onSearchChange("");
      }}
      onValueChange={(next, details) => {
        if (details.reason !== "input-change") {
          onValueChange(next === null || next === "" ? null : next);
          onSearchChange("");
          setOpen(false);
        }
      }}
    >
      <Combobox.Parts.InputGroup
        onKeyDown={(event) => {
          if (open && event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
          }
        }}
      >
        <Combobox.Parts.Input
          id={id}
          aria-label={label}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              onSearchChange("");
            }
          }}
        />
        <Combobox.Parts.Trigger aria-label={triggerLabel} />
      </Combobox.Parts.InputGroup>
      <Combobox.Parts.Content
        container={container}
        className="astw:max-w-[calc(100vw-24px)]"
      >
        {loading ? (
          loadingContent
        ) : (
          <Combobox.Parts.List>
            <Combobox.Parts.Item value="">{clearLabel}</Combobox.Parts.Item>
            {items.map((item) => (
              <Combobox.Parts.Item key={item.value} value={item.value}>
                <span className="astw:min-w-0 astw:break-all">
                  {item.label}
                </span>
              </Combobox.Parts.Item>
            ))}
          </Combobox.Parts.List>
        )}
        {!loading && !items.length && (
          <div className="erpui-lookup-empty astw:p-2.5 astw:text-[12px] astw:text-muted-foreground">
            {emptyContent}
          </div>
        )}
        {error && (
          <Alert.Root variant="error" role="alert">
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}
      </Combobox.Parts.Content>
    </Combobox.Parts.Root>
  );
}

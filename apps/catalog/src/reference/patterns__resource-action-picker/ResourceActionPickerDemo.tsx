import { useRef, useState } from "react";
import {
  Button,
  ErpHeader,
  Input,
  ResourceActionPicker,
} from "@mailboost/erpboost-ui";
const options = [
  { id: "0001", name: "Alpha" },
  { id: "9007199254740993", name: "Beta" },
];
function Example({
  name,
  portal,
}: {
  name: string;
  portal: HTMLElement | null;
}) {
  const [value, setValue] = useState("0001"),
    [editing, setEditing] = useState<"create" | "rename" | null>(null),
    [disabled, setDisabled] = useState(false),
    [calls, setCalls] = useState(0),
    [popupCount, setPopupCount] = useState(-1);
  const originalRef = useRef<HTMLButtonElement | null>(null);
  const label = options.find((option) => option.id === value)?.name ?? value;
  function edit(mode: "create" | "rename") {
    setPopupCount(
      portal?.querySelectorAll(".erpui-resource-picker").length ?? 0,
    );
    setCalls((count) => count + 1);
    setEditing(mode);
  }
  return (
    <section aria-label={name} className="astw:grid astw:gap-3 astw:min-w-0">
      <Button type="button" onClick={() => setDisabled((current) => !current)}>
        {disabled ? `Enable ${name}` : `Disable ${name}`}
      </Button>
      {editing ? (
        <label>
          {name} name
          <Input
            autoFocus
            defaultValue={editing === "rename" ? label : ""}
            aria-label={`${name} name`}
            onKeyDown={(event) => {
              if (event.key === "Escape") setEditing(null);
            }}
          />
        </label>
      ) : (
        <ResourceActionPicker
          options={options}
          value={value}
          selectedLabel={label}
          onSelect={setValue}
          disabled={disabled}
          trigger={
            name === "Projects" ? (
              <Button ref={originalRef} type="button" variant="outline" />
            ) : (
              <ErpHeader.Trigger ref={originalRef} />
            )
          }
          triggerLabel={`Choose ${name}`}
          searchLabel={`Search ${name}`}
          searchPlaceholder="Search…"
          container={portal}
          onRename={() => edit("rename")}
          action={{ label: `Create ${name}`, onSelect: () => edit("create") }}
        >
          {label}
        </ResourceActionPicker>
      )}
      <output aria-label={`${name} selection`}>{value}</output>
      <output aria-label={`${name} actions`}>{calls}</output>
      <output aria-label={`${name} popups at action`}>{popupCount}</output>
    </section>
  );
}
export function ResourceActionPickerDemo() {
  const [portal, setPortal] = useState<HTMLDivElement | null>(null),
    [visible, setVisible] = useState(true);
  return (
    <div className="astw:grid astw:gap-6 astw:min-w-0">
      <Button type="button" onClick={() => setVisible((current) => !current)}>
        {visible ? "Unmount pickers" : "Mount pickers"}
      </Button>
      {visible && (
        <>
          <Example name="Projects" portal={portal} />
          <Example name="Connections" portal={portal} />
        </>
      )}
      <div ref={setPortal} data-demo-portal="resource-action-picker" />
    </div>
  );
}

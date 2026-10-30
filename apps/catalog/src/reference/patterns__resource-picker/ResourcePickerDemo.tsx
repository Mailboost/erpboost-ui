import { useState } from "react";
import {
  ResourcePicker,
  LookupInput,
  Button,
  Field,
} from "@mailboost/erpboost-ui";
export function ResourcePickerDemo() {
  const [value, setValue] = useState("tokyo"),
    [search, setSearch] = useState(""),
    [lookup, setLookup] = useState<string | null>("a");
  const items = [
    { id: "tokyo", name: "Tokyo", description: "Main office" },
    { id: "osaka", name: "Osaka", description: "West office" },
  ];
  return (
    <div className="astw:grid astw:gap-6">
      <ResourcePicker
        options={items}
        value={value}
        selectedLabel={items.find((item) => item.id === value)!.name}
        onSelect={setValue}
        trigger={<Button variant="outline" />}
        triggerLabel="Choose office"
        searchLabel="Search office"
        searchPlaceholder="Search…"
        emptyContent={<p role="status">No matching office</p>}
        action={{ label: "Add office", onSelect: () => setValue("tokyo") }}
      >
        {items.find((item) => item.id === value)!.name}
      </ResourcePicker>
      <Field.Root>
        <Field.Label htmlFor="customer-lookup">Customer</Field.Label>
        <LookupInput
          id="customer-lookup"
          label="Customer"
          value={lookup}
          items={[
            { value: "a", label: "Acme" },
            { value: "b", label: "Beta" },
          ].filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase()),
          )}
          search={search}
          onSearchChange={setSearch}
          onValueChange={setLookup}
          triggerLabel="Show customers"
          clearLabel="Clear selection"
          emptyContent={<p>No matches</p>}
        />
      </Field.Root>
      <p role="status">
        Office: {value}; customer: {lookup ?? "none"}
      </p>
    </div>
  );
}

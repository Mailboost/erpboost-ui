import { useState } from "react";
import {
  ResourcePicker,
  Button,
} from "@mailboost/erpboost-ui";
export function ResourcePickerDemo() {
  const [value, setValue] = useState("tokyo");
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

      <p role="status">
        Office: {value}
      </p>
    </div>
  );
}

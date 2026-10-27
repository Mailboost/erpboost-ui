import { Combobox } from "@mailboost/erpboost-ui";

export function BasicUsage() {
  return (
    <Combobox
      items={["Apple", "Banana", "Cherry"]}
      placeholder="Search fruits..."
      onValueChange={(value) => console.log(value)}
    />
  );
}

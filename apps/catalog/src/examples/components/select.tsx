import { Select } from "@mailboost/erpboost-ui";

export function BasicUsage() {
  return (
    <Select
      items={["Apple", "Banana", "Cherry"]}
      placeholder="Pick a fruit"
      onValueChange={(value) => console.log(value)}
    />
  );
}

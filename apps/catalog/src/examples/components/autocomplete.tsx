import { Autocomplete } from "@mailboost/erpboost-ui";

export function BasicUsage() {
  return (
    <Autocomplete
      items={["Apple", "Banana", "Cherry"]}
      placeholder="Type a fruit..."
      onValueChange={(value) => console.log(value)}
    />
  );
}

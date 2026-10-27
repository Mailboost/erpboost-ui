import { Button, Tooltip } from "@mailboost/erpboost-ui";

export function BasicUsage() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<Button variant="outline" />}>
        Hover me
      </Tooltip.Trigger>
      <Tooltip.Content>Helpful information</Tooltip.Content>
    </Tooltip.Root>
  );
}

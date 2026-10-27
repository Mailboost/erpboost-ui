import { Card, Grid } from "@mailboost/erpboost-ui";

export function BasicUsage() {
  return (
    <Grid columns={3} gap={4}>
      <Card.Root>One</Card.Root>
      <Card.Root>Two</Card.Root>
      <Card.Root>Three</Card.Root>
    </Grid>
  );
}

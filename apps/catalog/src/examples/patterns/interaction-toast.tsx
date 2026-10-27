import { Button, useToast } from "@mailboost/erpboost-ui";

export function InteractionToast() {
  const toast = useToast();
  return (
    <Button onClick={() => toast.success("Order ORD-1024 approved")}>
      Approve
    </Button>
  );
}

import { useState } from "react";
import { WorkflowGraph, type WorkflowGraphStep } from "@mailboost/erpboost-ui";
const steps: WorkflowGraphStep[] = [
  {
    id: "customers",
    title: "Customers",
    subtitle: "Source data",
    state: "succeeded",
    statusLabel: "Success",
    metric: "120 rows",
  },
  {
    id: "orders",
    title: "Orders",
    subtitle: "Prepared records",
    state: "running",
    statusLabel: "Running",
  },
  {
    id: "lines",
    title: "Order lines",
    subtitle: "Related details",
    state: "idle",
    statusLabel: "Waiting",
  },
];
export function WorkflowGraphDemo() {
  const [selected, setSelected] = useState("");
  return (
    <>
      <p role="status">Selected: {selected || "none"}</p>
      <div className="astw:h-105">
        <WorkflowGraph
          docked={false}
          steps={steps}
          links={[
            { source: "customers", target: "orders" },
            { source: "orders", target: "lines" },
          ]}
          onSelect={setSelected}
          ariaLabel="Workflow example"
        />
      </div>
    </>
  );
}

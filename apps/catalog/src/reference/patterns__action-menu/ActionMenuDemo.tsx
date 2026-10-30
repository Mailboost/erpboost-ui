import { useState } from "react";
import { ActionMenu, AccountMenu } from "@mailboost/erpboost-ui";
export function ActionMenuDemo() {
  const [status, setStatus] = useState("Ready");
  return (
    <div className="astw:max-w-75">
      <ActionMenu
        triggerLabel="Row actions"
        menuLabel="Actions"
        items={[
          { label: "Copy name", onSelect: () => setStatus("Copied") },
          { separator: true },
          {
            label: "Delete",
            disabled: true,
            onSelect: () => setStatus("Deleted"),
          },
        ]}
      />
      <AccountMenu
        displayName="Jordan Mitchell"
        email="jordan@example.invalid"
        triggerLabel={(name) => `Account: ${name}`}
        menuLabel="Profile"
        items={[{ label: "Sign out", onSelect: () => setStatus("Signed out") }]}
      />
      <p role="status">{status}</p>
    </div>
  );
}

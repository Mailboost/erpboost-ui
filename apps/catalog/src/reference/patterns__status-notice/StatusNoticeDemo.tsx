import { useState } from "react";
import { StatusNotice, Button } from "@mailboost/erpboost-ui";
export function StatusNoticeDemo() {
  const [message, setMessage] = useState("First message");
  return (
    <div className="astw:w-full astw:min-w-0">
      <Button variant="outline" onClick={() => setMessage("First message")}>
        Show first notice
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          setMessage("Updated message: " + "long_value_".repeat(30))
        }
      >
        Show next notice
      </Button>
      {message && (
        <StatusNotice
          variant="success"
          title="Update"
          dismiss={{ label: "Dismiss notice", onDismiss: () => setMessage("") }}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("Undo requested")}
            >
              Undo
            </Button>
          }
        >
          {message}
        </StatusNotice>
      )}
    </div>
  );
}

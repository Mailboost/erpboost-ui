import { useState } from "react";
import { ActionConfirmation, Button } from "@mailboost/erpboost-ui";
export function ActionConfirmationDemo() {
  const [open, setOpen] = useState(false),
    [confirmed, setConfirmed] = useState(0);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open confirmation</Button>
      <p role="status">Confirmed: {confirmed}</p>
      {open && (
        <ActionConfirmation
          title="Discard changes?"
          cancelLabel="Continue editing"
          confirmLabel="Discard"
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            setConfirmed((value) => value + 1);
            setOpen(false);
          }}
        >
          <p>Unsaved edits will be discarded.</p>
        </ActionConfirmation>
      )}
    </>
  );
}

import { useState } from "react";
import {
  FormDialog,
  Field,
  Fieldset,
  Button,
  Select,
  FormStack,
} from "@mailboost/erpboost-ui";
export function FormDialogDemo() {
  const [open, setOpen] = useState(false),
    [side, setSide] = useState(false),
    [busy, setBusy] = useState(false),
    [name, setName] = useState(""),
    [mode, setMode] = useState("primary"),
    [error, setError] = useState(""),
    [result, setResult] = useState("No submission");
  return (
    <>
      <Button
        onClick={() => {
          setSide(false);
          setOpen(true);
        }}
      >
        Open form
      </Button>
      <Button
        onClick={() => {
          setSide(true);
          setOpen(true);
        }}
      >
        Open side form
      </Button>
      <output aria-label="Form result">{result}</output>
      {open && (
        <FormDialog
          title="Resource form"
          placement={side ? "right" : "center"}
          width={side ? 520 : undefined}
          onClose={() => setOpen(false)}
          cancelLabel="Cancel"
          submitLabel="Create"
          busyLabel="Saving"
          busy={busy}
          error={error}
          leadingActions={
            <Button
              type="button"
              disabled={busy}
              onClick={() => setResult("Auxiliary requested")}
            >
              Auxiliary action
            </Button>
          }
          onSubmit={() => {
            setBusy(true);
            setError("");
          }}
        >
          <Fieldset.Root disabled={busy}>
            <FormStack>
              <Field.Root>
                <Field.Label>Name</Field.Label>
                <Field.Control
                  required
                  pattern="[a-z]+"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Mode</Field.Label>
                <Select.Parts.Root
                  itemToStringLabel={(value) =>
                    value === "primary" ? "Primary" : "Secondary"
                  }
                  value={mode}
                  disabled={busy}
                  onValueChange={(value) => {
                    if (value) setMode(value);
                  }}
                >
                  <Select.Parts.Trigger>
                    <Select.Parts.Value />
                  </Select.Parts.Trigger>
                  <Select.Parts.Content>
                    <Select.Parts.Item value="primary">
                      Primary
                    </Select.Parts.Item>
                    <Select.Parts.Item value="secondary">
                      Secondary
                    </Select.Parts.Item>
                  </Select.Parts.Content>
                </Select.Parts.Root>
              </Field.Root>
              <Field.Root>
                <Field.Label>Exact identifier</Field.Label>
                <Field.Control defaultValue="0001" readOnly />
              </Field.Root>
            </FormStack>
          </Fieldset.Root>
          {busy && (
            <>
              <Button
                type="button"
                onClick={() => {
                  setBusy(false);
                  setError(
                    Array.from(
                      { length: 20 },
                      () => "Caller-owned failure",
                    ).join("\n"),
                  );
                }}
              >
                Fail request
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setBusy(false);
                  setResult(`Created: ${name} / ${mode}`);
                  setOpen(false);
                }}
              >
                Finish request
              </Button>
            </>
          )}
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>Description {i + 1}</p>
          ))}
        </FormDialog>
      )}
    </>
  );
}

import { useState } from "react";
import { SettingsPanel, Field, Select, Button } from "@mailboost/erpboost-ui";
export function SettingsPanelDemo() {
  const [open, setOpen] = useState(false),
    [saving, setSaving] = useState(false),
    [readonly, setReadonly] = useState(false),
    [value, setValue] = useState("manual"),
    [result, setResult] = useState("No save"),
    [error, setError] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setReadonly(false);
          setOpen(true);
        }}
      >
        Open settings
      </Button>
      <Button
        onClick={() => {
          setReadonly(true);
          setOpen(true);
        }}
      >
        Open read-only settings
      </Button>
      <output aria-label="Settings result">{result}</output>
      {open && (
        <SettingsPanel
          title="Schedule settings"
          closeLabel="Close settings"
          closeDisabled={saving}
          error={
            error
              ? Array.from(
                  { length: 20 },
                  () => "Caller-owned save error",
                ).join("\n")
              : undefined
          }
          onClose={() => setOpen(false)}
          actions={
            <Button
              type="button"
              disabled={readonly || saving}
              onClick={() => setSaving(true)}
            >
              Save settings
            </Button>
          }
        >
          <Field.Root>
            <Field.Label>Frequency</Field.Label>
            <Select.Parts.Root
              itemToStringLabel={(value) =>
                value === "manual" ? "Manual" : "Every 15 minutes"
              }
              value={value}
              disabled={readonly || saving}
              onValueChange={(value) => {
                if (value) setValue(value);
              }}
            >
              <Select.Parts.Trigger>
                <Select.Parts.Value />
              </Select.Parts.Trigger>
              <Select.Parts.Content>
                <Select.Parts.Item value="manual">Manual</Select.Parts.Item>
                <Select.Parts.Item value="15">
                  Every 15 minutes
                </Select.Parts.Item>
              </Select.Parts.Content>
            </Select.Parts.Root>
          </Field.Root>
          {saving && (
            <>
              <Button
                type="button"
                onClick={() => {
                  setResult(`Saved: ${value}`);
                  setSaving(false);
                  setOpen(false);
                }}
              >
                Complete save
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setSaving(false);
                  setError(true);
                }}
              >
                Fail save
              </Button>
            </>
          )}
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>Setting description {i + 1}</p>
          ))}
        </SettingsPanel>
      )}
    </>
  );
}

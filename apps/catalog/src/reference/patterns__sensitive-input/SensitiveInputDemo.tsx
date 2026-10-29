import { useState } from "react";
import { SensitiveInput, Field } from "@mailboost/erpboost-ui";
export function SensitiveInputDemo() {
  const [value, setValue] = useState("");
  return (
    <Field.Root>
      <Field.Label htmlFor="secret-demo">API key</Field.Label>
      <SensitiveInput revealLabel="Show value" concealLabel="Hide value">
        {({ type }) => (
          <Field.Control
            id="secret-demo"
            type={type}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="new-password"
          />
        )}
      </SensitiveInput>
    </Field.Root>
  );
}

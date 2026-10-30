import { useState } from "react";
import {
  PropertyRow,
  PropertySection,  Fieldset } from "@mailboost/erpboost-ui";
import { FormStack } from "@mailboost/erpboost-ui";
import { Field } from "@mailboost/erpboost-ui";
import { Button } from "@mailboost/erpboost-ui";
import { Badge } from "@mailboost/erpboost-ui";
export function PropertyLayoutDemo() {
  const [name, setName] = useState(""),
    [result, setResult] = useState("No submission");
  return (
    <div className="astw:max-w-160 astw:p-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(`Submitted: ${name}`);
        }}
      >
        <Fieldset.Root disabled={false} className="astw:grid astw:min-w-0 astw:gap-4 astw:[&+fieldset]:mt-6"><Fieldset.Legend>{"Schema settings"}</Fieldset.Legend><div className="astw:grid astw:min-w-0 astw:gap-4">
          <Field.Root>
            <Field.Label>Property name</Field.Label>
            <Field.Control
              required
              pattern="[a-z][a-z0-9_]*"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Field.Description>
              Use lowercase letters, digits and underscores.
            </Field.Description>
          </Field.Root>
        </div></Fieldset.Root>
        <Fieldset.Root disabled={false} className="astw:grid astw:min-w-0 astw:gap-4 astw:[&+fieldset]:mt-6"><Fieldset.Legend>{"Record values"}</Fieldset.Legend><div className="astw:grid astw:min-w-0 astw:gap-4">
          <FormStack gap={24}>
            <Field.Root>
              <PropertyRow
                label={
                  <Field.Label>
                    identifier <Badge variant="neutral">text</Badge>
                  </Field.Label>
                }
              >
                <Field.Control defaultValue="0001" readOnly />
              </PropertyRow>
            </Field.Root>
            <PropertySection
              title="Optional fields"
              description="Values may be omitted."
            />
            <Field.Root>
              <PropertyRow
                label={
                  <Field.Label>
                    very_long_customer_reference_identifier{" "}
                    <Badge variant="neutral">text</Badge>
                  </Field.Label>
                }
                description={
                  <Field.Description>
                    Reference: <code>customers.id</code>
                  </Field.Description>
                }
              >
                <Field.Control defaultValue="9007199254740993" />
              </PropertyRow>
            </Field.Root>
          </FormStack>
        </div></Fieldset.Root>
        <Button type="submit">Add property</Button>
      </form>
      <output aria-label="Submission result">{result}</output>
    </div>
  );
}

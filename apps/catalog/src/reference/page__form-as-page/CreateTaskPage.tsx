// Reference example: https://ui.tailor.tech/page/form-as-page
import { useState } from "react";
import {
  Button,
  Card,
  Field,
  Fieldset,
  Form,
  Input,
  Layout,
  Select,
} from "@mailboost/erpboost-ui";
import { Textarea } from "../shared/textarea";

const owners = ["Tanaka", "Sato", "Suzuki", "Yamada"];
const priorities = ["Low", "Normal", "High", "Urgent"];

const StringsSelectField = ({
  items,
  value,
  onValueChange,
  placeholder,
}: {
  items: readonly string[];
  value: string | null;
  onValueChange: (next: string | null) => void;
  placeholder: string;
}) => (
  <Select.Parts.Root
    value={value}
    onValueChange={onValueChange}
    itemToStringLabel={(v) => String(v ?? "")}
  >
    <Select.Parts.Trigger>
      <Select.Parts.Value placeholder={placeholder} />
    </Select.Parts.Trigger>
    <Select.Parts.Content>
      {items.map((item) => (
        <Select.Parts.Item key={item} value={item}>
          {item}
        </Select.Parts.Item>
      ))}
    </Select.Parts.Content>
  </Select.Parts.Root>
);

export const CreateTaskPage = () => {
  const [owner, setOwner] = useState<string | null>("Tanaka");
  const [priority, setPriority] = useState<string | null>("Normal");

  return (
    <Layout>
      <Layout.Header title="Create task" />
      <Layout.Column>
        <Form className="mx-auto w-full max-w-3xl space-y-4">
          <Card.Root>
            <Card.Header title="Basic info" />
            <Card.Content className="space-y-4">
              <Field.Root name="title">
                <Field.Label>Title</Field.Label>
                <Field.Control required placeholder="Review supplier docs" />
                <Field.Error />
              </Field.Root>
              <Field.Root name="description">
                <Field.Label>Description</Field.Label>
                <Textarea
                  name="description"
                  rows={4}
                  className="min-h-24"
                  placeholder="What outcome are you looking for?"
                />
              </Field.Root>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Header title="Assignment" />
            <Card.Content>
              <Fieldset.Root className="grid gap-4 md:grid-cols-2">
                <Field.Root name="owner">
                  <Field.Label>Owner</Field.Label>
                  <StringsSelectField
                    items={owners}
                    value={owner}
                    onValueChange={setOwner}
                    placeholder="Assign owner"
                  />
                </Field.Root>
                <Field.Root name="priority">
                  <Field.Label>Priority</Field.Label>
                  <StringsSelectField
                    items={priorities}
                    value={priority}
                    onValueChange={setPriority}
                    placeholder="Choose priority"
                  />
                </Field.Root>
                <Field.Root name="dueDate">
                  <Field.Label>Due date</Field.Label>
                  <Input type="date" />
                </Field.Root>
              </Fieldset.Root>
            </Card.Content>
          </Card.Root>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
            <Button variant="secondary" type="button">
              Save as draft
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </Form>
      </Layout.Column>
    </Layout>
  );
};

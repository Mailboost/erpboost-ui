// Reference example: https://ui.tailor.tech/page/form-as-page
import { useState, type ReactNode } from "react";
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

type FormValues = {
  title: string;
  description: string;
  owner: string | null;
  priority: string | null;
  dueDate: string;
  notes: string;
};

const initialValues: FormValues = {
  title: "",
  description: "",
  owner: "Tanaka",
  priority: "Normal",
  dueDate: "",
  notes: "",
};

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

type Step = {
  id: number;
  label: string;
  render: (
    values: FormValues,
    setValues: (next: Partial<FormValues>) => void,
  ) => ReactNode;
};

const steps: Step[] = [
  {
    id: 1,
    label: "Basic info",
    render: (values, setValues) => (
      <div className="space-y-4">
        <Field.Root name="title">
          <Field.Label>Title</Field.Label>
          <Input
            required
            placeholder="Review supplier docs"
            value={values.title}
            onChange={(event) => setValues({ title: event.target.value })}
          />
          <Field.Error />
        </Field.Root>
        <Field.Root name="description">
          <Field.Label>Description</Field.Label>
          <Textarea
            name="description"
            rows={4}
            className="min-h-24"
            placeholder="What outcome are you looking for?"
            value={values.description}
            onChange={(event) =>
              setValues({ description: event.target.value })
            }
          />
        </Field.Root>
      </div>
    ),
  },
  {
    id: 2,
    label: "Assignment",
    render: (values, setValues) => (
      <Fieldset.Root className="grid gap-4 md:grid-cols-2">
        <Field.Root name="owner">
          <Field.Label>Owner</Field.Label>
          <StringsSelectField
            items={owners}
            value={values.owner}
            onValueChange={(v) => setValues({ owner: v })}
            placeholder="Assign owner"
          />
        </Field.Root>
        <Field.Root name="priority">
          <Field.Label>Priority</Field.Label>
          <StringsSelectField
            items={priorities}
            value={values.priority}
            onValueChange={(v) => setValues({ priority: v })}
            placeholder="Choose priority"
          />
        </Field.Root>
      </Fieldset.Root>
    ),
  },
  {
    id: 3,
    label: "Schedule",
    render: (values, setValues) => (
      <Fieldset.Root className="grid gap-4 md:grid-cols-2">
        <Field.Root name="dueDate">
          <Field.Label>Due date</Field.Label>
          <Input
            type="date"
            value={values.dueDate}
            onChange={(event) => setValues({ dueDate: event.target.value })}
          />
        </Field.Root>
      </Fieldset.Root>
    ),
  },
  {
    id: 4,
    label: "Review",
    render: (values, setValues) => (
      <div className="space-y-4">
        <dl className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Title</dt>
            <dd>{values.title || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Description</dt>
            <dd>{values.description || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Owner</dt>
            <dd>{values.owner ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Priority</dt>
            <dd>{values.priority ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Due date</dt>
            <dd>{values.dueDate || "—"}</dd>
          </div>
        </dl>
        <Field.Root name="notes">
          <Field.Label>Notes</Field.Label>
          <Textarea
            name="notes"
            rows={3}
            className="min-h-20"
            placeholder="Anything the assignee should know"
            value={values.notes}
            onChange={(event) => setValues({ notes: event.target.value })}
          />
        </Field.Root>
      </div>
    ),
  },
];

export const CreateTaskPageWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisited, setMaxVisited] = useState(1);
  const [values, setValuesRaw] = useState<FormValues>(initialValues);

  const setValues = (next: Partial<FormValues>) =>
    setValuesRaw((prev) => ({ ...prev, ...next }));

  const goToStep = (step: number) => {
    if (step <= maxVisited) setCurrentStep(step);
  };
  const next = () => {
    const target = Math.min(currentStep + 1, steps.length);
    setCurrentStep(target);
    setMaxVisited((prev) => Math.max(prev, target));
  };
  const back = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const active = steps.find((step) => step.id === currentStep) ?? steps[0];
  const isLast = currentStep === steps.length;

  return (
    <Layout>
      <Layout.Header title="Onboarding" />
      <Layout.Column>
        <Form className="mx-auto w-full max-w-3xl space-y-6">
          <div>
            <div className="flex items-center">
              {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isClickable =
                  step.id <= maxVisited && step.id !== currentStep;
                return (
                  <div key={step.id} className="flex flex-1 items-center">
                    <Button
                      type="button"
                      variant={
                        isCompleted || isCurrent ? "default" : "secondary"
                      }
                      disabled={!isClickable}
                      size="icon"
                      className="size-8 shrink-0 rounded-full font-medium"
                      onClick={() => goToStep(step.id)}
                    >
                      {isCompleted ? "✓" : step.id}
                    </Button>
                    {index < steps.length - 1 ? (
                      <div
                        className={
                          isCompleted
                            ? "mx-2 h-0.5 flex-1 bg-primary"
                            : "mx-2 h-0.5 flex-1 bg-border"
                        }
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex">
              {steps.map((step) => {
                const reached = step.id <= currentStep;
                return (
                  <div key={step.id} className="flex-1">
                    <span
                      className={
                        reached
                          ? "block text-xs font-medium text-foreground"
                          : "block text-xs text-muted-foreground"
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Card.Root>
            <Card.Header title={active.label} />
            <Card.Content>{active.render(values, setValues)}</Card.Content>
          </Card.Root>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={back}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {isLast ? (
                <Button type="submit">Create</Button>
              ) : (
                <Button type="button" onClick={next}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Layout.Column>
    </Layout>
  );
};

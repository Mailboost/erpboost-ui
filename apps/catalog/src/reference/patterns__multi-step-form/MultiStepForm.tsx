// Reference example: https://ui.tailor.tech/patterns/multi-step-form
import { useState, type ReactNode } from "react";
import {
  Button,
  Card,
  Field,
  Fieldset,
  Form,
  Input,
} from "@mailboost/erpboost-ui";
import { RadioGroup, RadioGroupItem } from "../shared/radio-group";
import { Textarea } from "../shared/textarea";

type Step = {
  id: number;
  label: string;
  render: (
    values: FormValues,
    setValues: (next: Partial<FormValues>) => void,
  ) => ReactNode;
};

type FormValues = {
  companyName: string;
  representative: string;
  email: string;
  phone: string;
  contractType: string;
  notes: string;
};

const initialValues: FormValues = {
  companyName: "",
  representative: "",
  email: "",
  phone: "",
  contractType: "standard",
  notes: "",
};

const contractOptions = [
  { value: "standard", label: "Standard contract" },
  { value: "framework", label: "Master agreement + individual orders" },
  { value: "spot", label: "Spot contract" },
] as const;

const steps: Step[] = [
  {
    id: 1,
    label: "Company",
    render: (values, setValues) => (
      <Fieldset.Root className="grid gap-4 md:grid-cols-2">
        <Field.Root name="companyName">
          <Field.Label>Company name</Field.Label>
          <Input
            required
            placeholder="Tailor Inc."
            value={values.companyName}
            onChange={(event) =>
              setValues({ companyName: event.target.value })
            }
          />
        </Field.Root>
        <Field.Root name="representative">
          <Field.Label>Representative</Field.Label>
          <Input
            required
            placeholder="Taro Yamada"
            value={values.representative}
            onChange={(event) =>
              setValues({ representative: event.target.value })
            }
          />
        </Field.Root>
      </Fieldset.Root>
    ),
  },
  {
    id: 2,
    label: "Contact",
    render: (values, setValues) => (
      <Fieldset.Root className="grid gap-4 md:grid-cols-2">
        <Field.Root name="email">
          <Field.Label>Email</Field.Label>
          <Input
            required
            type="email"
            placeholder="contact@example.com"
            value={values.email}
            onChange={(event) => setValues({ email: event.target.value })}
          />
        </Field.Root>
        <Field.Root name="phone">
          <Field.Label>Phone</Field.Label>
          <Input
            placeholder="+1 (555) 123-4567"
            value={values.phone}
            onChange={(event) => setValues({ phone: event.target.value })}
          />
        </Field.Root>
      </Fieldset.Root>
    ),
  },
  {
    id: 3,
    label: "Contract",
    render: (values, setValues) => (
      <Fieldset.Root>
        <Fieldset.Legend>Contract type</Fieldset.Legend>
        <RadioGroup
          name="contractType"
          value={values.contractType}
          onValueChange={(value) => setValues({ contractType: value })}
        >
          {contractOptions.map((option) => {
            const id = `contractType-${option.value}`;
            return (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem value={option.value} id={id} />
                <label htmlFor={id} className="cursor-pointer text-sm">
                  {option.label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </Fieldset.Root>
    ),
  },
  {
    id: 4,
    label: "Review",
    render: (values, setValues) => (
      <div className="space-y-4">
        <dl className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Company name</dt>
            <dd>{values.companyName || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Representative</dt>
            <dd>{values.representative || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd>{values.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Phone</dt>
            <dd>{values.phone || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Contract type</dt>
            <dd>
              {contractOptions.find((o) => o.value === values.contractType)
                ?.label ?? values.contractType}
            </dd>
          </div>
        </dl>
        <Field.Root name="notes">
          <Field.Label>Notes</Field.Label>
          <Textarea
            value={values.notes}
            onChange={(event) => setValues({ notes: event.target.value })}
            rows={3}
            placeholder="Add any additional notes"
          />
        </Field.Root>
      </div>
    ),
  },
];

export const MultiStepForm = () => {
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
    <Form className="space-y-6">
      <div>
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = step.id <= maxVisited && step.id !== currentStep;
            return (
              <div key={step.id} className="flex flex-1 items-center">
                <Button
                  type="button"
                  variant={isCompleted || isCurrent ? "default" : "secondary"}
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
            const active = step.id <= currentStep;
            return (
              <div key={step.id} className="flex-1">
                <span
                  className={
                    active
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

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={back} disabled={currentStep === 1}>
          Back
        </Button>
        {isLast ? (
          <Button>Submit</Button>
        ) : (
          <Button onClick={next}>Next</Button>
        )}
      </div>
    </Form>
  );
};

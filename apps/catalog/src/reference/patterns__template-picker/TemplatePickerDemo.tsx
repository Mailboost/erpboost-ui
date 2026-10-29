import { useState } from "react";
import { TemplatePicker, Button, EmptyState } from "@mailboost/erpboost-ui";
const options = [
  { id: "starter", title: "Starter", description: "A compact starting point." },
  { id: "disabled", title: "Unavailable", disabled: true },
  {
    id: "full",
    title: "Full template",
    description: "A template with all sections.",
  },
];
export function TemplatePickerDemo() {
  const [mode, setMode] = useState<"review" | "direct" | "empty" | null>(null),
    [result, setResult] = useState("No choice");
  return (
    <div>
      <Button onClick={() => setMode("review")}>Choose with review</Button>
      <Button variant="outline" onClick={() => setMode("direct")}>
        Choose directly
      </Button>
      <Button variant="outline" onClick={() => setMode("empty")}>
        Open empty picker
      </Button>
      <p role="status">{result}</p>
      {mode && (
        <TemplatePicker
          title="Templates"
          closeLabel="Close picker"
          options={mode === "empty" ? [] : options}
          empty={<EmptyState title="No templates" />}
          confirmation={
            mode === "review"
              ? {
                  title: "Apply template",
                  message: (choice) => <p>Replace with {choice.title}?</p>,
                  backLabel: "Back",
                  confirmLabel: "Apply",
                }
              : undefined
          }
          onChoose={(id) => {
            setResult(`Chosen: ${id}`);
            setMode(null);
          }}
          onClose={() => setMode(null)}
        />
      )}
    </div>
  );
}

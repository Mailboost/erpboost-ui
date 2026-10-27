// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { useEffect, useState } from "react";
import { FileText, PenLine, RotateCcw, Search } from "lucide-react";
import { Button } from "@mailboost/erpboost-ui";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  type ChainOfThoughtStepStatus,
} from "./ChainOfThought";

const STEPS = [
  {
    icon: Search,
    label: 'Search the knowledge base for "purchase order"',
    results: ["Creating purchase orders", "Order approval workflow"],
  },
  {
    icon: FileText,
    label: "Read the top article",
    description: "kb-12 · Creating purchase orders",
  },
  { icon: PenLine, label: "Draft the answer with citations" },
];

const STEP_MS = 900;

const statusFor = (index: number, progress: number): ChainOfThoughtStepStatus =>
  index < progress ? "complete" : index === progress ? "active" : "pending";

// Advances one step at a time on replay so the complete / active / pending
// treatments can be observed. The initial render shows the finished plan.
export const ChainOfThoughtDemo = () => {
  const [progress, setProgress] = useState(STEPS.length);
  // Remount <ChainOfThought> per replay to restore defaultOpen.
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (progress >= STEPS.length) return;
    const timer = window.setTimeout(() => setProgress((p) => p + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [progress]);

  const replay = () => {
    setProgress(0);
    setRun((r) => r + 1);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <Button type="button" variant="outline" size="sm" onClick={replay}>
        <RotateCcw className="mr-1.5 size-3.5" aria-hidden />
        Replay steps
      </Button>
      <ChainOfThought key={run} defaultOpen>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>
          {STEPS.map((step, index) => (
            <ChainOfThoughtStep
              key={step.label}
              icon={step.icon}
              label={step.label}
              description={step.description}
              status={statusFor(index, progress)}
            >
              {step.results && index < progress ? (
                <ChainOfThoughtSearchResults>
                  {step.results.map((result) => (
                    <ChainOfThoughtSearchResult key={result}>
                      {result}
                    </ChainOfThoughtSearchResult>
                  ))}
                </ChainOfThoughtSearchResults>
              ) : null}
            </ChainOfThoughtStep>
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  );
};

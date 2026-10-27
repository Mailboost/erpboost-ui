// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { useState } from "react";
import { Suggestion, Suggestions } from "./Suggestion";

const PROMPTS = [
  "How do I create a purchase order?",
  "Why is my order still pending?",
  "Summarize this week's inbound orders",
];

// Clicking a chip submits its text as if the user had typed it; here the
// picked prompt is just echoed below.
export const SuggestionDemo = () => {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <Suggestions>
        {PROMPTS.map((prompt) => (
          <Suggestion key={prompt} suggestion={prompt} onClick={setPicked} />
        ))}
      </Suggestions>
      <p className="text-xs text-muted-foreground">
        {picked ? `Submitted: "${picked}"` : "Pick a suggestion to submit it."}
      </p>
    </div>
  );
};

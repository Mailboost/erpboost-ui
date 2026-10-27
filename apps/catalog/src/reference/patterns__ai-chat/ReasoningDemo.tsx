// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@mailboost/erpboost-ui";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./Reasoning";

const REASONING_TEXT =
  "The user is asking about an order stuck in a pending state. The common causes, in order of likelihood: an approver has not acted yet, the supplier has not confirmed, or the nightly ERP sync is delayed. I should point at the approval trail first, then list how to verify the other two.";

const CHUNK_MS = 30;

// Replays the reasoning text word by word so the auto-open-while-streaming /
// auto-close-when-done behavior can be observed. The initial render shows the
// resting state: collapsed, "Thought for 3s".
export const ReasoningDemo = () => {
  const [text, setText] = useState(REASONING_TEXT);
  const [streaming, setStreaming] = useState(false);
  // Remount <Reasoning> per replay so a manual toggle doesn't stick around.
  const [run, setRun] = useState(0);
  const timerRef = useRef<number | null>(null);

  const replay = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    const chunks = REASONING_TEXT.match(/\S+\s*/g) ?? [];
    let shown = 0;
    setRun((r) => r + 1);
    setText("");
    setStreaming(true);
    timerRef.current = window.setInterval(() => {
      shown += 1;
      setText(chunks.slice(0, shown).join(""));
      if (shown >= chunks.length) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setStreaming(false);
      }
    }, CHUNK_MS);
  };

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    [],
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <Button type="button" variant="outline" size="sm" onClick={replay}>
        <RotateCcw className="mr-1.5 size-3.5" aria-hidden />
        Replay streaming
      </Button>
      <Reasoning key={run} isStreaming={streaming} duration={3}>
        <ReasoningTrigger />
        <ReasoningContent>{text}</ReasoningContent>
      </Reasoning>
    </div>
  );
};

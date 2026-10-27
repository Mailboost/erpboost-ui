// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { useState } from "react";
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Action, Actions } from "./Actions";
import { Message, MessageContent } from "./Message";
import { Response } from "./Response";

const ANSWER =
  "The approval limit for purchase orders is **¥1,000,000** — anything above that also needs a finance sign-off.";

// Copy writes the answer to the clipboard (icon flips to a check briefly);
// feedback buttons toggle a selected state; Retry is where you re-submit the
// last user turn.
export const ActionsDemo = () => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ANSWER);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable in this context — ignore */
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Message from="assistant">
        <MessageContent>
          <Response>{ANSWER}</Response>
          <Actions className="-ml-1.5">
            <Action label={copied ? "Copied" : "Copy"} onClick={() => void copy()}>
              {copied ? (
                <Check className="size-3.5 text-green-600" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
            </Action>
            <Action label="Retry" onClick={() => undefined}>
              <RefreshCw className="size-3.5" aria-hidden />
            </Action>
            <Action
              label="Good response"
              aria-pressed={feedback === "up"}
              onClick={() => setFeedback(feedback === "up" ? null : "up")}
              className={cn(feedback === "up" && "text-foreground")}
            >
              <ThumbsUp
                className={cn("size-3.5", feedback === "up" && "fill-current")}
                aria-hidden
              />
            </Action>
            <Action
              label="Bad response"
              aria-pressed={feedback === "down"}
              onClick={() => setFeedback(feedback === "down" ? null : "down")}
              className={cn(feedback === "down" && "text-foreground")}
            >
              <ThumbsDown
                className={cn("size-3.5", feedback === "down" && "fill-current")}
                aria-hidden
              />
            </Action>
          </Actions>
        </MessageContent>
      </Message>
    </div>
  );
};

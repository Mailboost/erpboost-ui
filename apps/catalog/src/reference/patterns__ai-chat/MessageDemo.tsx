// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { Message, MessageContent } from "./Message";
import { Response } from "./Response";

// A finished exchange: user turns are right-aligned primary bubbles, the
// assistant turn is full-width markdown rendered by <Response>.
const ANSWER = [
  "Two things to check first:",
  "",
  "- The **Approvals** tab — a pending row names the approver.",
  "- The header badge: `SYNC_PENDING` clears on the next hourly ERP sync.",
  "",
  "Details are in [Order approval workflow](https://example.com/kb/31).",
].join("\n");

export const MessageDemo = () => (
  <div className="mx-auto flex w-full max-w-md flex-col gap-3">
    <Message from="user">
      <MessageContent>
        <p className="whitespace-pre-wrap">Why is my order still pending?</p>
      </MessageContent>
    </Message>
    <Message from="assistant">
      <MessageContent>
        <Response>{ANSWER}</Response>
      </MessageContent>
    </Message>
  </div>
);

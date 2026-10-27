// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { useEffect, useRef, useState } from "react";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  type PromptInputAttachmentFile,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  type PromptInputSubmitStatus,
  PromptInputTextarea,
  PromptInputTools,
} from "./PromptInput";

// Interactive composer wired to a fake request lifecycle: submitting walks
// ready → submitted → streaming → ready, so the send button's loader / stop
// states can be observed. Things to try:
//   - Enter submits, Shift+Enter inserts a newline (IME-safe for Japanese).
//   - Attach files from the + menu; Backspace in an empty box removes the last one.
//   - Click the square stop button mid-"stream" to abort.
export const PromptInputDemo = () => {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<PromptInputSubmitStatus>("ready");
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const handleSubmit = (files: PromptInputAttachmentFile[]) => {
    if (status === "streaming") {
      clearTimers();
      setStatus("ready");
      return;
    }
    if (!text.trim() && files.length === 0) return;

    const fileNames = files.map((f) => f.filename ?? "Attachment");
    setLastSubmission(
      [text.trim() || "(no text)", ...fileNames.map((name) => `📎 ${name}`)].join("  "),
    );
    setText("");
    setStatus("submitted");
    timersRef.current = [
      window.setTimeout(() => setStatus("streaming"), 600),
      window.setTimeout(() => setStatus("ready"), 2600),
    ];
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <PromptInput onSubmit={handleSubmit} className="m-0">
        <PromptInputBody>
          <PromptInputHeader>
            <PromptInputAttachments>
              {(file) => <PromptInputAttachment data={file} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a question…"
          />
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger
                  size="xs"
                  className="aspect-square size-7 rounded-full p-0"
                />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit
              status={status}
              disabled={status === "ready" && !text.trim()}
            />
          </PromptInputFooter>
        </PromptInputBody>
      </PromptInput>
      <p className="text-xs text-muted-foreground">
        Status: <code className="font-mono">{status}</code>
        {lastSubmission ? ` · Last submitted: ${lastSubmission}` : ""}
      </p>
    </div>
  );
};

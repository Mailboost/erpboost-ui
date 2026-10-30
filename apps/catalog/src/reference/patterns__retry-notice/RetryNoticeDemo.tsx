import { useState } from "react";
import { Button, Field, RetryNotice } from "@mailboost/erpboost-ui";
const failure =
  "<img src=x> is plain text\n" +
  Array.from(
    { length: 40 },
    (_, i) => `Line ${i + 1}: ${"長いエラー".repeat(25)}`,
  ).join("\n");
export function RetryNoticeDemo() {
  const [pending, setPending] = useState(false),
    [ready, setReady] = useState(false),
    [attempts, setAttempts] = useState(0),
    [submissions, setSubmissions] = useState(0),
    [draft, setDraft] = useState("0001");
  return (
    <form
      className="astw:max-w-130 astw:min-w-0 astw:grid astw:gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmissions((value) => value + 1);
      }}
    >
      <Field.Root>
        <Field.Label>Draft</Field.Label>
        <Field.Control
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </Field.Root>
      {ready ? (
        <p role="status">Loaded</p>
      ) : (
        <RetryNotice
          retryLabel="Try again"
          retrying={pending}
          onRetry={() => {
            setPending(true);
            setAttempts((value) => value + 1);
          }}
        >
          {failure}
        </RetryNotice>
      )}
      {pending && (
        <div>
          <Button type="button" onClick={() => setPending(false)}>
            Fail retry
          </Button>
          <Button
            type="button"
            onClick={() => {
              setPending(false);
              setReady(true);
            }}
          >
            Finish retry
          </Button>
        </div>
      )}
      {ready && (
        <Button type="button" onClick={() => setReady(false)}>
          Show failure
        </Button>
      )}
      <output aria-label="Retry attempts">{attempts}</output>
      <output aria-label="Form submissions">{submissions}</output>
    </form>
  );
}

// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { useCallback, useEffect, useRef, useState } from "react";
import type { ToolState } from "./Tool";

// Scripted fake assistant so every state of the chat UI can be exercised
// without a live model: reasoning that streams, tool calls that move through
// their lifecycle, token-by-token answers, citations, and a failure path.
// Each starter suggestion matches one script below, so clicking through the
// suggestions demos each behavior in turn.
//
// To wire a real backend, keep the `AssistantMessage` shape and replace
// `useMockAssistant` with a hook that maps your streaming client's events
// (e.g. the AI SDK's `streamText` fullStream parts) onto the same state:
//   text-delta        → append to `content`
//   reasoning-delta   → append to `reasoning.text`
//   tool-* parts      → upsert into `toolCalls` by call id
//   finish            → status "ready"

export type AssistantAttachment = { id: string; filename: string };

export type AssistantSource = { id: string; title: string };

export type AssistantToolCall = {
  id: string;
  toolName: string;
  /** Human-readable label for the tool header. */
  title?: string;
  state: ToolState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

export type AssistantReasoning = {
  text: string;
  /** True while reasoning tokens are still arriving. */
  streaming: boolean;
  /** Seconds spent thinking; set once streaming ends. */
  duration?: number;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: AssistantAttachment[];
  reasoning?: AssistantReasoning;
  toolCalls?: AssistantToolCall[];
  sources?: AssistantSource[];
};

export type AssistantStatus = "ready" | "submitted" | "streaming" | "error";

// ─────────────────────────────── scripts ────────────────────────────────

type ScriptStep =
  | { kind: "reasoning"; text: string; duration: number }
  | {
      kind: "tool";
      toolName: string;
      title: string;
      input: unknown;
      output?: unknown;
      errorText?: string;
    }
  | { kind: "text"; text: string }
  | { kind: "sources"; sources: AssistantSource[] }
  | { kind: "fail"; message: string };

type Script = {
  /** The script runs when the submitted question matches. */
  match: RegExp;
  steps: ScriptStep[];
};

// One suggestion per behavior: tool calls + citations, streamed reasoning,
// a data-flavored markdown answer, and the error path.
export const SUGGESTED_PROMPTS = [
  "How do I create a purchase order?",
  "Why is my order still pending?",
  "Summarize this week's inbound orders",
  "Show me an error state",
] as const;

const KB_SOURCES: AssistantSource[] = [
  { id: "kb-12", title: "Creating purchase orders" },
  { id: "kb-31", title: "Order approval workflow" },
];

const SCRIPTS: Script[] = [
  {
    match: /purchase order|create.*order/i,
    steps: [
      {
        kind: "tool",
        toolName: "searchArticles",
        title: "Search help articles",
        input: { query: "create purchase order" },
        output: {
          hits: [
            { id: "kb-12", title: "Creating purchase orders" },
            { id: "kb-31", title: "Order approval workflow" },
          ],
        },
      },
      {
        kind: "tool",
        toolName: "readArticle",
        title: "Read article",
        input: { id: "kb-12" },
        output: { title: "Creating purchase orders", words: 640 },
      },
      {
        kind: "text",
        text: [
          "Here is the standard flow:",
          "",
          "1. Open **Orders → Purchase orders** and select **New order**.",
          "2. Pick the supplier — payment terms and currency fill in from the supplier master.",
          "3. Add order lines, then review the totals in the right-hand summary.",
          "4. Select **Submit for approval**. The order moves to `PENDING_APPROVAL` until your manager acts on it.",
          "",
          "Orders above **¥1,000,000** also require a second approval from finance.",
        ].join("\n"),
      },
      { kind: "sources", sources: KB_SOURCES },
    ],
  },
  {
    match: /pending|stuck|not.*(confirmed|approved)/i,
    steps: [
      {
        kind: "reasoning",
        duration: 3,
        text:
          "The user is asking about an order stuck in a pending state. The common causes, in order of likelihood: an approver has not acted yet, the supplier has not confirmed, or the nightly ERP sync is delayed. I should point at the approval trail first, then list how to verify the other two.",
      },
      {
        kind: "text",
        text: [
          "The most common cause is an **open approval step**. Check these in order:",
          "",
          "- Open the order and look at the **Approvals** tab — a pending row names the approver.",
          "- If approvals are complete, check the **Supplier confirmation** status on the header.",
          "- Still pending? The ERP sync runs hourly; a `SYNC_PENDING` badge clears on the next run.",
        ].join("\n"),
      },
    ],
  },
  {
    match: /summari[sz]e|inbound|this week/i,
    steps: [
      {
        kind: "tool",
        toolName: "queryOrders",
        title: "Query orders",
        input: { direction: "inbound", range: "this_week" },
        output: { count: 24, totalAmount: "¥8,400,000", late: 3 },
      },
      {
        kind: "text",
        text: [
          "**24 inbound orders** arrived this week, totalling **¥8.4M**.",
          "",
          "- 21 received on schedule",
          "- 3 flagged late — all from the same supplier, avg. delay `2.5 days`",
          "- Largest single order: `PO-2093` at ¥1.2M",
          "",
          "Want me to draft a follow-up to the late supplier?",
        ].join("\n"),
      },
    ],
  },
  {
    match: /error|fail/i,
    steps: [
      {
        kind: "tool",
        toolName: "searchArticles",
        title: "Search help articles",
        input: { query: "error state" },
        errorText: "Upstream search timed out after 10s.",
      },
      {
        kind: "fail",
        message:
          "The model endpoint returned 429 (rate limited). This is a scripted failure so the error path can be styled and tested.",
      },
    ],
  },
];

// Free-typed questions fall back to a self-describing answer.
const FALLBACK_STEPS: ScriptStep[] = [
  {
    kind: "reasoning",
    duration: 2,
    text: "This catalogue demo has no live model behind it, so the honest answer is to explain the mock and point at the scripted behaviors.",
  },
  {
    kind: "text",
    text: [
      "This panel is driven by a **scripted mock**, not a live model — see `mockAssistant.ts` for the scripts and for notes on wiring a real streaming backend.",
      "",
      "Try the starter suggestions to see each behavior: tool calls with citations, streamed reasoning, a data-flavored answer, and an error state.",
    ].join("\n"),
  },
];

const pickScript = (question: string): ScriptStep[] =>
  SCRIPTS.find((s) => s.match.test(question))?.steps ?? FALLBACK_STEPS;

// ─────────────────────────── conversation history ───────────────────────────

export type MockConversation = {
  id: string;
  title: string;
  messages: AssistantMessage[];
};

export type MockConversationGroup = {
  title: string;
  items: MockConversation[];
};

const finishedTurn = (
  id: string,
  question: string,
  answer: string,
  extras: Partial<AssistantMessage> = {},
): AssistantMessage[] => [
  { id: `${id}-q`, role: "user", content: question },
  { id: `${id}-a`, role: "assistant", content: answer, ...extras },
];

export const MOCK_HISTORY: MockConversationGroup[] = [
  {
    title: "Today",
    items: [
      {
        id: "conv-1",
        title: "Creating a purchase order",
        messages: finishedTurn(
          "conv-1",
          "How do I create a purchase order?",
          "Open **Orders → Purchase orders**, select **New order**, pick the supplier, add lines, and submit for approval.",
          { sources: KB_SOURCES },
        ),
      },
      {
        id: "conv-2",
        title: "Pending order troubleshooting",
        messages: finishedTurn(
          "conv-2",
          "Why is PO-2101 still pending?",
          "An approval step is still open — check the **Approvals** tab on the order; the pending row names the approver.",
        ),
      },
    ],
  },
  {
    title: "Previous 7 days",
    items: [
      {
        id: "conv-3",
        title: "Inbound order summary",
        messages: finishedTurn(
          "conv-3",
          "Summarize last week's inbound orders.",
          "**19 inbound orders** totalling **¥6.1M** — 18 on schedule, 1 late by a day.",
        ),
      },
      {
        id: "conv-4",
        title: "Supplier onboarding checklist",
        messages: finishedTurn(
          "conv-4",
          "What do I need to onboard a new supplier?",
          "You need the registration form, bank details, and a signed NDA — then create the supplier record and request a compliance review.",
        ),
      },
    ],
  },
];

// ────────────────────────────── mock engine ──────────────────────────────

// Pacing constants: word-by-word text at ~40 wps reads as "live" without
// making reviewers wait; tool phases pause long enough to see each state.
const SUBMIT_DELAY_MS = 500;
const REASONING_CHUNK_MS = 30;
const TEXT_CHUNK_MS = 24;
const TOOL_INPUT_MS = 400;
const TOOL_RUN_MS = 700;
const TOOL_SETTLE_MS = 250;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toChunks = (text: string) => text.match(/\S+\s*/g) ?? [];

const uid = () => crypto.randomUUID();

type RunControl = { aborted: boolean };

export const useMockAssistant = () => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [status, setStatus] = useState<AssistantStatus>("ready");
  const [error, setError] = useState<string | null>(null);
  const runRef = useRef<RunControl | null>(null);
  const statusRef = useRef<AssistantStatus>("ready");

  const transition = (next: AssistantStatus) => {
    statusRef.current = next;
    setStatus(next);
  };

  const abortCurrentRun = () => {
    if (runRef.current) runRef.current.aborted = true;
    // Settle any half-streamed reasoning so triggers stop pulsing.
    setMessages((prev) =>
      prev.map((m) =>
        m.reasoning?.streaming
          ? { ...m, reasoning: { ...m.reasoning, streaming: false } }
          : m,
      ),
    );
  };

  // Abort the in-flight scripted run when the component unmounts.
  useEffect(
    () => () => {
      if (runRef.current) runRef.current.aborted = true;
    },
    [],
  );

  const runScript = useCallback(async (steps: ScriptStep[], ctl: RunControl) => {
    await sleep(SUBMIT_DELAY_MS);
    if (ctl.aborted) return;

    const assistantId = uid();
    const patch = (updater: (m: AssistantMessage) => AssistantMessage) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? updater(m) : m)));
    const patchCall = (callId: string, changes: Partial<AssistantToolCall>) =>
      patch((m) => ({
        ...m,
        toolCalls: m.toolCalls?.map((c) => (c.id === callId ? { ...c, ...changes } : c)),
      }));

    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);
    transition("streaming");

    try {
      for (const step of steps) {
        if (ctl.aborted) return;
        switch (step.kind) {
          case "reasoning": {
            patch((m) => ({ ...m, reasoning: { text: "", streaming: true } }));
            for (const chunk of toChunks(step.text)) {
              if (ctl.aborted) break;
              patch((m) => ({
                ...m,
                reasoning: m.reasoning && {
                  ...m.reasoning,
                  text: m.reasoning.text + chunk,
                },
              }));
              await sleep(REASONING_CHUNK_MS);
            }
            patch((m) => ({
              ...m,
              reasoning: m.reasoning && {
                ...m.reasoning,
                streaming: false,
                duration: step.duration,
              },
            }));
            break;
          }
          case "tool": {
            const callId = uid();
            patch((m) => ({
              ...m,
              toolCalls: [
                ...(m.toolCalls ?? []),
                {
                  id: callId,
                  toolName: step.toolName,
                  title: step.title,
                  state: "input-streaming" as ToolState,
                },
              ],
            }));
            await sleep(TOOL_INPUT_MS);
            if (ctl.aborted) return;
            patchCall(callId, { state: "input-available", input: step.input });
            await sleep(TOOL_RUN_MS);
            if (ctl.aborted) return;
            patchCall(
              callId,
              step.errorText
                ? { state: "output-error", errorText: step.errorText }
                : { state: "output-available", output: step.output },
            );
            await sleep(TOOL_SETTLE_MS);
            break;
          }
          case "text": {
            for (const chunk of toChunks(step.text)) {
              if (ctl.aborted) return;
              patch((m) => ({ ...m, content: m.content + chunk }));
              await sleep(TEXT_CHUNK_MS);
            }
            break;
          }
          case "sources": {
            patch((m) => ({ ...m, sources: step.sources }));
            break;
          }
          case "fail": {
            throw new Error(step.message);
          }
        }
      }
      if (!ctl.aborted) transition("ready");
    } catch (err) {
      if (ctl.aborted) return;
      // Keep the bubble if it already streamed text; drop it if still empty.
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantId || m.content || m.toolCalls?.length),
      );
      setError(err instanceof Error ? err.message : "Failed to fetch a response.");
      transition("error");
    }
  }, []);

  const submit = useCallback(
    (question: string, attachments: AssistantAttachment[] = []) => {
      const text = question.trim();
      const busy = statusRef.current === "submitted" || statusRef.current === "streaming";
      if ((!text && attachments.length === 0) || busy) return;

      abortCurrentRun();
      const ctl: RunControl = { aborted: false };
      runRef.current = ctl;
      setError(null);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "user",
          content: text,
          attachments: attachments.length > 0 ? attachments : undefined,
        },
      ]);
      transition("submitted");
      void runScript(pickScript(text), ctl);
    },
    [runScript],
  );

  const stop = useCallback(() => {
    abortCurrentRun();
    transition("ready");
  }, []);

  const clear = useCallback(() => {
    abortCurrentRun();
    setMessages([]);
    setError(null);
    transition("ready");
  }, []);

  /** Replaces the transcript with a saved conversation (history view). */
  const loadConversation = useCallback((conversation: MockConversation) => {
    abortCurrentRun();
    setMessages(conversation.messages);
    setError(null);
    transition("ready");
  }, []);

  return {
    messages,
    status,
    error,
    suggestions: SUGGESTED_PROMPTS,
    submit,
    stop,
    clear,
    loadConversation,
  };
};

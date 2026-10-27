// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronsRight,
  Copy,
  Eraser,
  History,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Menu } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";
import { Action, Actions } from "./Actions";
import { ChatHistory } from "./ChatHistory";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./Conversation";
import { Loader } from "./Loader";
import { Message, MessageContent } from "./Message";
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
  PromptInputTextarea,
  PromptInputTools,
} from "./PromptInput";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./Reasoning";
import { Response } from "./Response";
import { Source, Sources, SourcesContent, SourcesTrigger } from "./Sources";
import { Suggestion, Suggestions } from "./Suggestion";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "./Tool";
import {
  MOCK_HISTORY,
  useMockAssistant,
  type AssistantMessage,
} from "./mockAssistant";

// Assembled assistant panel: every block from this pattern wired to the
// scripted mock in mockAssistant.ts. Designed for a docked right panel
// (320–420px wide) — see the "Assistant panel" entry under Pages for how it
// embeds next to a work page. The panel is layout-agnostic: it fills
// whatever height its parent gives it, so it works in a Sheet or a split
// pane as well.
//
// Each assistant turn stacks, top to bottom: reasoning (thinking) → tool
// calls → the streamed answer → citations → message actions. All of these
// are optional per turn, so plain answers stay compact.

// Cosmetic in this demo — the mock ignores the selection, but the menu shows
// where a model picker sits in the composer toolbar.
const MODEL_OPTIONS = ["GPT-5", "Gemini 2.5 Pro"] as const;

type PanelView = "chat" | "history";

const AssistantTurn = ({
  message,
  streaming,
  onRetry,
}: {
  message: AssistantMessage;
  /** True while this turn is still being produced — hides actions until done. */
  streaming: boolean;
  onRetry: () => void;
}) => (
  <MessageContent>
    {message.reasoning ? (
      <Reasoning
        isStreaming={message.reasoning.streaming}
        duration={message.reasoning.duration}
      >
        <ReasoningTrigger />
        <ReasoningContent>{message.reasoning.text}</ReasoningContent>
      </Reasoning>
    ) : null}
    {message.toolCalls && message.toolCalls.length > 0 ? (
      <div className="flex flex-col gap-1.5">
        {message.toolCalls.map((call) => (
          <Tool key={call.id}>
            <ToolHeader toolName={call.toolName} state={call.state} title={call.title} />
            <ToolContent>
              <ToolInput input={call.input} />
              <ToolOutput output={call.output} errorText={call.errorText} />
            </ToolContent>
          </Tool>
        ))}
      </div>
    ) : null}
    {message.content ? <Response>{message.content}</Response> : null}
    {message.sources && message.sources.length > 0 ? (
      <Sources>
        <SourcesTrigger count={message.sources.length} />
        <SourcesContent>
          {message.sources.map((source) => (
            <Source key={source.id} title={source.title} />
          ))}
        </SourcesContent>
      </Sources>
    ) : null}
    {!streaming && message.content ? (
      <Actions className="-ml-1.5">
        <Action
          label="Copy"
          onClick={() => void navigator.clipboard?.writeText(message.content)}
        >
          <Copy className="size-3.5" aria-hidden />
        </Action>
        <Action label="Retry" onClick={onRetry}>
          <RefreshCw className="size-3.5" aria-hidden />
        </Action>
      </Actions>
    ) : null}
  </MessageContent>
);

export type AssistantPanelProps = {
  title?: string;
  /** Renders a close affordance when provided (docked right-panel usage). */
  onClose?: () => void;
};

export const AssistantPanel = ({ title = "Assistant", onClose }: AssistantPanelProps) => {
  const { messages, status, error, suggestions, submit, stop, clear, loadConversation } =
    useMockAssistant();
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(MODEL_OPTIONS[0]);
  const [view, setView] = useState<PanelView>("chat");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const loading = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);

  const submitQuestion = (question: string, files: PromptInputAttachmentFile[] = []) => {
    setInput("");
    submit(
      question,
      files.map((f) => ({ id: f.id, filename: f.filename ?? "Attachment" })),
    );
  };

  const handleSubmit = (files: PromptInputAttachmentFile[]) => {
    // While streaming, the submit button acts as a stop button.
    if (loading) {
      stop();
      return;
    }
    submitQuestion(input.trim(), files);
  };

  const handleClear = () => {
    clear();
    setActiveConversationId(null);
    setView("chat");
  };

  const openConversation = (id: string) => {
    const conversation = MOCK_HISTORY.flatMap((group) => group.items).find(
      (item) => item.id === id,
    );
    if (!conversation) return;
    loadConversation(conversation);
    setActiveConversationId(id);
    setView("chat");
  };

  const retryLastQuestion = () => {
    const lastUserTurn = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserTurn) submit(lastUserTurn.content, lastUserTurn.attachments ?? []);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-card">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-foreground">
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Close assistant"
              onClick={onClose}
              className="aspect-square size-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <ChevronsRight aria-hidden />
            </Button>
          ) : (
            <Sparkles className="size-4 text-primary" aria-hidden />
          )}
          <span className="truncate">{title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label="Conversation history"
            aria-pressed={view === "history"}
            onClick={() => setView(view === "history" ? "chat" : "history")}
            className={cn(
              "aspect-square size-7 p-0 text-muted-foreground hover:text-foreground",
              view === "history" && "bg-muted text-foreground",
            )}
          >
            <History aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label="Clear conversation"
            onClick={handleClear}
            disabled={messages.length === 0}
            className="aspect-square size-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Eraser aria-hidden />
          </Button>
        </div>
      </div>

      {view === "history" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <ChatHistory
            groups={MOCK_HISTORY.map((group) => ({
              title: group.title,
              items: group.items.map(({ id, title: itemTitle }) => ({
                id,
                title: itemTitle,
              })),
            }))}
            activeId={activeConversationId ?? undefined}
            onSelect={openConversation}
          />
        </div>
      ) : (
        <>
          <Conversation>
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<Sparkles className="size-6 text-primary" aria-hidden />}
                  title="Ask the assistant"
                  description="Answers are grounded in your help articles. This demo runs on scripted data — try a suggestion below."
                />
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    {message.role === "assistant" ? (
                      <AssistantTurn
                        message={message}
                        streaming={loading && message.id === lastMessage?.id}
                        onRetry={retryLastQuestion}
                      />
                    ) : (
                      <MessageContent>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {message.attachments.map((attachment) => (
                              <Badge
                                key={attachment.id}
                                variant="outline-neutral"
                                className="text-[10px]"
                              >
                                {attachment.filename}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </MessageContent>
                    )}
                  </Message>
                ))
              )}
              {status === "submitted" ? (
                <Message from="assistant">
                  <MessageContent className="flex-row items-center gap-2 text-muted-foreground">
                    <Loader size={14} />
                    Preparing an answer…
                  </MessageContent>
                </Message>
              ) : null}
              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              ) : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {messages.length === 0 ? (
            <Suggestions className="px-3 pb-2">
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={(picked) => submitQuestion(picked)}
                />
              ))}
            </Suggestions>
          ) : null}

          <PromptInput onSubmit={handleSubmit} className="shadow-none">
            <PromptInputBody>
              <PromptInputHeader>
                <PromptInputAttachments>
                  {(file) => <PromptInputAttachment data={file} />}
                </PromptInputAttachments>
              </PromptInputHeader>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about orders, suppliers, workflows…"
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
                  <Menu.Root>
                    <Menu.Trigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          disabled={loading}
                          className="gap-1"
                        />
                      }
                    >
                      {model}
                      <ChevronDown className="size-3" aria-hidden />
                    </Menu.Trigger>
                    <Menu.Content className="min-w-36">
                      {MODEL_OPTIONS.map((option) => (
                        <Menu.Item
                          key={option}
                          className="gap-2"
                          onClick={() => setModel(option)}
                        >
                          <Check
                            className={cn("size-3.5", model !== option && "opacity-0")}
                            aria-hidden
                          />
                          {option}
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Root>
                </PromptInputTools>
                <PromptInputSubmit status={status} disabled={!loading && !input.trim()} />
              </PromptInputFooter>
            </PromptInputBody>
          </PromptInput>
        </>
      )}
    </div>
  );
};

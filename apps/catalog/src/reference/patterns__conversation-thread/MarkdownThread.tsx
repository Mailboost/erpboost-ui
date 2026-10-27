// Reference example: https://ui.tailor.tech/patterns/conversation-thread
import { useState, type ReactNode } from "react";
import { Avatar, Badge, Button } from "@mailboost/erpboost-ui";
import { ThreadComposer } from "../patterns__thread-composer/ThreadComposer";
import { ConversationThreadPanel } from "./ConversationThreadPanel";
import { Textarea } from "../shared/textarea";

type Message = {
  id: string;
  actor: { name: string; initials: string };
  internal: boolean;
  timestamp: string;
  body: string;
};

const messages: Message[] = [
  {
    id: "m-1",
    actor: { name: "Aiko Sato (Customer)", initials: "AS" },
    internal: false,
    timestamp: "Apr 12, 10:14",
    body: [
      "Hi team, **PO #4421** is still not confirmed. Steps I tried:",
      "",
      "1. Re-submitted from the portal",
      "2. Checked the integration log: `ERP_SYNC_PENDING`",
      "",
      "Could you check the [sync status](https://example.com/sync/4421)?",
    ].join("\n"),
  },
  {
    id: "m-2",
    actor: { name: "Taro Tanaka", initials: "TT" },
    internal: true,
    timestamp: "Apr 12, 10:31",
    body: [
      "## Internal triage",
      "",
      "- Warehouse stock: **OK**",
      "- ERP cron: stuck since `08:00 JST`",
      "",
      "Restarting the worker.",
      "",
      "```",
      "kubectl rollout restart deploy/erp-sync",
      "```",
    ].join("\n"),
  },
  {
    id: "m-3",
    actor: { name: "Taro Tanaka", initials: "TT" },
    internal: false,
    timestamp: "Apr 12, 10:34",
    body: [
      "Confirmed! Your PO has been processed and should ship _by end of day_.",
      "",
      "Tracking will appear in [the portal](https://example.com/po/4421) within 1h.",
    ].join("\n"),
  },
];

// Light-weight markdown renderer covering the subset we want to demonstrate
// (headings, bold/italic, inline code, fenced code, lists, links, paragraphs).
// We deliberately avoid pulling in a markdown library to keep the catalogue
// dependency-free; teams who need full CommonMark should swap in `react-markdown`.

const renderInline = (text: string): ReactNode[] => {
  const parts: ReactNode[] = [];
  const pattern =
    /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        parts.push(token);
      }
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
};

const Markdown = ({ source }: { source: string }) => {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs"
        >
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const cls =
        level === 1
          ? "text-base font-semibold"
          : level === 2
            ? "text-sm font-semibold"
            : "text-sm font-medium";
      blocks.push(
        <p key={key++} className={cls}>
          {renderInline(text)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items: ReactNode[] = [];
      while (
        i < lines.length &&
        (ordered ? /^\d+\.\s+/.test(lines[i]) : /^[-*]\s+/.test(lines[i]))
      ) {
        const item = lines[i].replace(/^([-*]|\d+\.)\s+/, "");
        items.push(<li key={items.length}>{renderInline(item)}</li>);
        i += 1;
      }
      blocks.push(
        ordered ? (
          <ol key={key++} className="ml-5 list-decimal space-y-1 text-sm">
            {items}
          </ol>
        ) : (
          <ul key={key++} className="ml-5 list-disc space-y-1 text-sm">
            {items}
          </ul>
        ),
      );
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !/^#{1,3}\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p key={key++} className="text-sm leading-relaxed">
        {renderInline(paragraph.join(" "))}
      </p>,
    );
  }

  return <div className="space-y-2">{blocks}</div>;
};

export const MarkdownThread = () => {
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [preview, setPreview] = useState(false);

  return (
    <ConversationThreadPanel
      footer={
        <ThreadComposer
          value={reply}
          onChange={setReply}
          internal={internal}
          onInternalChange={setInternal}
          internalNoteLabel="Internal note"
          customerPlaceholder={
            "Reply to customer…\n\n**Markdown** _supported_."
          }
          internalPlaceholder={
            "Internal context for teammates…\n\n**Markdown** _supported_."
          }
          header={
            <div className="flex justify-end text-xs">
              <div className="flex items-center gap-1 rounded-md border bg-background p-0.5">
                <Button
                  type="button"
                  variant={preview ? "ghost" : "secondary"}
                  size="sm"
                  onClick={() => setPreview(false)}
                  className="h-7 px-2 py-0.5 text-xs font-normal"
                >
                  Write
                </Button>
                <Button
                  type="button"
                  variant={preview ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreview(true)}
                  className="h-7 px-2 py-0.5 text-xs font-normal"
                >
                  Preview
                </Button>
              </div>
            </div>
          }
          body={
            preview ? (
              <div className="min-h-[6rem] rounded-md border bg-background px-3 py-2">
                {reply.trim() ? (
                  <Markdown source={reply} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing to preview yet.
                  </p>
                )}
              </div>
            ) : (
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={
                  internal
                    ? "Internal context for teammates…\n\n**Markdown** _supported_."
                    : "Reply to customer…\n\n**Markdown** _supported_."
                }
                rows={5}
                className="font-mono"
              />
            )
          }
          onDiscard={() => setReply("")}
          submitDisabled={reply.length === 0}
        />
      }
    >
      {messages.map((message) => (
        <article
          key={message.id}
          className={
            message.internal
              ? "-mx-2 flex gap-3 rounded-md bg-status-attention/5 px-2 py-2"
              : "flex gap-3"
          }
        >
          <Avatar.Root className="mt-0.5 shrink-0">
            <Avatar.Fallback>{message.actor.initials}</Avatar.Fallback>
          </Avatar.Root>
          <div className="min-w-0 flex-1">
            <header className="flex items-center gap-2 text-sm">
              <span className="font-medium">{message.actor.name}</span>
              {message.internal ? (
                <Badge variant="warning">Internal</Badge>
              ) : null}
              <time className="text-xs text-muted-foreground">
                {message.timestamp}
              </time>
            </header>
            <div className="mt-1">
              <Markdown source={message.body} />
            </div>
          </div>
        </article>
      ))}
    </ConversationThreadPanel>
  );
};

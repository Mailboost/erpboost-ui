// Reference example: https://ui.tailor.tech/patterns/ai-chat
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Markdown-ish renderer for streamed assistant text. Covers what grounded
// business assistants actually emit — bold, inline code, links, headings, and
// bullet / numbered lists — without pulling in a markdown library, in the same
// spirit as the Conversation thread pattern's renderer. If you need full
// CommonMark (tables, nested lists, math), swap this file for `react-markdown`
// or the AI SDK's `streamdown`; the component API stays a plain
// `<Response>{text}</Response>`.

function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;
  const tokens: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) tokens.push(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      tokens.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      tokens.push(
        <code key={key++} className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        tokens.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) tokens.push(text.slice(cursor));
  return tokens;
}

function isListLine(line: string): boolean {
  return /^\s*([-*]|\d+\.)\s+/.test(line);
}

function renderBlock(block: string, key: number): ReactNode {
  const lines = block.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length > 0 && lines.every(isListLine)) {
    const ordered = /^\s*\d+\./.test(lines[0]);
    const items = lines.map((line, i) => (
      <li key={i}>{renderInline(line.replace(/^\s*([-*]|\d+\.)\s+/, ""))}</li>
    ));
    return ordered ? (
      <ol key={key} className="list-decimal space-y-0.5 pl-5">
        {items}
      </ol>
    ) : (
      <ul key={key} className="list-disc space-y-0.5 pl-5">
        {items}
      </ul>
    );
  }
  const heading = /^(#{1,3})\s+(.*)$/.exec(block.trim());
  if (heading) {
    return (
      <p key={key} className="font-semibold">
        {renderInline(heading[2])}
      </p>
    );
  }
  return (
    <p key={key} className="whitespace-pre-wrap">
      {renderInline(block)}
    </p>
  );
}

export interface ResponseProps {
  children: string;
  className?: string;
}

export const Response = ({ children, className }: ResponseProps) => {
  const blocks = children.split(/\n{2,}/).filter((b) => b.trim().length > 0);
  return (
    <div className={cn("space-y-2", className)}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
};

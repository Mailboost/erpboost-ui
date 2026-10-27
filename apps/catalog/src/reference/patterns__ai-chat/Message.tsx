// Reference example: https://ui.tailor.tech/patterns/ai-chat
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// User / assistant message row (adapted from AI Elements). User turns render
// as a right-aligned primary bubble; assistant turns take the full width with
// no bubble, which leaves room for reasoning, tool calls, and citations to
// stack inside the same <MessageContent>.
export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full flex-col gap-2",
      from === "user" ? "is-user ml-auto max-w-[92%] items-end" : "is-assistant",
      className,
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({ className, ...props }: MessageContentProps) => (
  <div
    className={cn(
      "flex w-fit max-w-full min-w-0 flex-col gap-2 text-sm leading-relaxed",
      "group-[.is-user]:rounded-lg group-[.is-user]:bg-primary group-[.is-user]:px-3 group-[.is-user]:py-2 group-[.is-user]:text-primary-foreground",
      "group-[.is-assistant]:w-full group-[.is-assistant]:px-3 group-[.is-assistant]:py-2 group-[.is-assistant]:text-foreground",
      className,
    )}
    {...props}
  />
);

// Reference example: https://ui.tailor.tech/patterns/conversation-thread
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ConversationThreadPanelProps = {
  children: ReactNode;
  /** 親スクロール面の上端へ `sticky top-0` で追随させる入力欄（コメント先頭固定型のスレッド用） */
  header?: ReactNode;
  /** 親スクロール面の下端へ `sticky bottom-0` で追随させる入力欄（ThreadComposer など） */
  footer?: ReactNode;
  /** スクロール内ラッパーに付与（例: `space-y-3`） */
  scrollContentClassName?: string;
  className?: string;
};

/**
 * メッセージはそのまま積み上げ、親のスクロールコンテナ一本でスクロールさせる。
 * ThreadComposer は `header` を渡せば `sticky top-0` で上端、`footer` を渡せば `sticky bottom-0` で下端に追随する。
 *
 * （カタログ Mock の `main` が `overflow-y-auto` のため）内部に `overflow-y-auto` と固定高さを両立させない — その場合に二重スクロールになる。
 */
export const ConversationThreadPanel = ({
  children,
  header,
  footer,
  scrollContentClassName,
  className,
}: ConversationThreadPanelProps) => (
  <div className={cn("relative flex w-full min-w-0 flex-col", className)}>
    {header ? (
      <div className="sticky top-0 z-10 bg-card pt-2 pb-3">
        <div className="mx-auto w-full max-w-3xl px-1">{header}</div>
      </div>
    ) : null}
    <div
      className={cn(
        "mx-auto w-full max-w-3xl px-1",
        header ? "pt-3" : null,
        footer ? "pb-4" : null,
        scrollContentClassName ?? "space-y-5",
      )}
    >
      {children}
    </div>
    {footer ? (
      <div className="sticky bottom-0 z-10 bg-card pt-4 pb-2">
        <div className="mx-auto w-full max-w-3xl px-1">{footer}</div>
      </div>
    ) : null}
  </div>
);

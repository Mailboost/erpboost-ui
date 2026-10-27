// Documentation observed at https://ui.tailor.tech/page/document-page
import { useLocale } from "../locale";

export default function DocumentNotes() {
  const { t } = useLocale();
  return (
    <div className="space-y-10">
      <div className={"space-y-3"}>
        <h2 className={"text-lg font-semibold"}>
          {t("Document URL composition", "記事 URL の組み立て")}
        </h2>
        <div className={"space-y-5 text-sm"}>
          <p className={"leading-relaxed text-foreground/85"}>
            {t(
              "Notes on how a document URL is put together. URL routing is not wired in this demo.",
              "記事の URL をどう組み立てるかのメモ。このデモでは URL とルーティングは繋がっていません。",
            )}
          </p>
          <div
            className={
              "overflow-x-auto rounded-md bg-muted/50 px-3 py-2 font-mono text-xs text-foreground"
            }
          >
            {"/docs/<pageId>[/<slug>][#<headingId>]"}
          </div>
          <div className={"overflow-x-auto rounded-md border"}>
            <table className={"w-full border-collapse text-left"}>
              <thead
                className={
                  "bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"
                }
              >
                <tr>
                  <th scope={"col"} className={"w-40 px-3 py-2 font-medium"}>
                    {t("Segment", "セグメント")}
                  </th>
                  <th scope={"col"} className={"px-3 py-2 font-medium"}>
                    {t("Description", "説明")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className={""}>
                  <th
                    scope={"row"}
                    className={
                      "w-40 px-3 py-2 align-top font-mono text-xs font-medium text-foreground"
                    }
                  >
                    {"pageId"}
                  </th>
                  <td
                    className={
                      "px-3 py-2 align-top leading-relaxed text-foreground/85"
                    }
                  >
                    {t(
                      "The article's permanent id. Stays the same even when the title or slug changes.",
                      "記事の不変 ID。タイトルや slug を変えてもこの値は変わらない。",
                    )}
                  </td>
                </tr>
                <tr className={"border-t"}>
                  <th
                    scope={"row"}
                    className={
                      "w-40 px-3 py-2 align-top font-mono text-xs font-medium text-foreground"
                    }
                  >
                    {"slug"}
                  </th>
                  <td
                    className={
                      "px-3 py-2 align-top leading-relaxed text-foreground/85"
                    }
                  >
                    {t(
                      "Readable label derived from the title. Optional, just for humans.",
                      "タイトルから作る人間用のラベル。省略可。",
                    )}
                  </td>
                </tr>
                <tr className={"border-t"}>
                  <th
                    scope={"row"}
                    className={
                      "w-40 px-3 py-2 align-top font-mono text-xs font-medium text-foreground"
                    }
                  >
                    {"#headingId"}
                  </th>
                  <td
                    className={
                      "px-3 py-2 align-top leading-relaxed text-foreground/85"
                    }
                  >
                    {t(
                      "Anchor within the same article, generated from the heading text.",
                      "同じ記事内の見出しへのアンカー。見出し文字から自動生成。",
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={"space-y-4"}>
            <div>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {t("In this demo", "このデモの挙動")}
              </h3>
              <ul
                className={
                  "mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85"
                }
              >
                <li>
                  {t(
                    "Hover a heading in preview to copy a link straight to it.",
                    "プレビューで見出しに hover すると、その見出しへのリンクをコピーできる。",
                  )}
                </li>
                <li>
                  {t(
                    "Page embed, page mention, and internal links store `data-page-id` only (external links store `data-href`). Title and URL are resolved at render time via `documentPageRegistry.ts`.",
                    "ページ埋め込み・メンション・内部リンクは `data-page-id` のみ保存（外部は `data-href`）。タイトルと URL は `documentPageRegistry.ts` で表示時に解決する。",
                  )}
                </li>
                <li>
                  {t(
                    "All internal links (embed, mention, `<a data-page-id>`) point at sidebar wiki articles only. In preview, clicking them switches the sidebar selection — never the UI catalogue routes.",
                    "内部リンク（埋め込み・メンション・`<a data-page-id>`）はすべて sidebar の Wiki 記事のみ。プレビューでクリックすると sidebar の選択が切り替わる（UI カタログの `/page/...` には飛ばない）。",
                  )}
                </li>
                <li>
                  {t(
                    "Internal pickers list sidebar articles only. Legacy `cat:<slug>` and `/page/<slug>` attrs are migrated to wiki ids on load.",
                    "内部ページのピッカーは sidebar の記事だけ。旧 `cat:<slug>` や `/page/<slug>` は読み込み時に wiki の page id へ寄せる。",
                  )}
                </li>
                <li>
                  {t(
                    "Same-article heading links still use `#headingId` fragments only.",
                    "同記事内の見出しリンクだけは引き続き `#headingId` のみ。",
                  )}
                </li>
              </ul>
            </div>
            <div>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {t("When implementing", "実装時の注意")}
              </h3>
              <ul
                className={
                  "mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85"
                }
              >
                <li>
                  {t(
                    "Persist page id in saved HTML — never slug, title, or resolved URL. Those belong in the resolver only.",
                    "保存 HTML には page id だけを残す。slug・タイトル・解決済み URL は resolver 側だけ。",
                  )}
                </li>
                <li>
                  {t(
                    "Resolve on every render (editor + preview). Stale titles in attrs become wrong after rename.",
                    "編集・プレビューとも毎回 resolver で解決。attrs にタイトルを焼くとリネーム後に古くなる。",
                  )}
                </li>
                <li>
                  {t(
                    "Keep external links separate (`data-href`). Do not mix page id and full URL on the same node.",
                    "外部リンクは `data-href` で別扱い。page id と URL を同一ノードに混ぜない。",
                  )}
                </li>
                <li>
                  {t(
                    "Parse legacy `data-slug` attrs when loading old content; migrate on next save.",
                    "旧 `data-slug` 形式は読み込み時に page id へ変換。次回保存で新形式に寄せる。",
                  )}
                </li>
                <li>
                  {t(
                    "Show a broken state when the id no longer exists — do not silently drop the reference.",
                    "id が見つからないときはリンク切れ UI を出す。参照を黙って消さない。",
                  )}
                </li>
              </ul>
            </div>
            <div>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {t("In production", "本番でやること")}
              </h3>
              <ul
                className={
                  "mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85"
                }
              >
                <li>
                  {t(
                    "Back page ids with a real page registry (API / DB), not hard-coded demo maps.",
                    "page id の正本は API / DB のページ registry に置く（デモの固定 map ではない）。",
                  )}
                </li>
                <li>
                  {t(
                    "Redirect old URLs to new ones when a slug changes on rename.",
                    "リネームで slug が変わったら、旧 URL から新 URL にリダイレクトする。",
                  )}
                </li>
                <li>
                  {t(
                    "Public share URLs can use a different scheme if needed.",
                    "外部公開用の URL は必要に応じて別体系にしてよい。",
                  )}
                </li>
              </ul>
            </div>
          </div>
          <p className={"text-xs text-muted-foreground"}>
            {t(
              "Resolver: `documentPageRegistry.ts`, `DocumentPageRegistryContext.tsx`. Permalinks: `buildDocumentUrl` in `documentEditorUrl.ts`.",
              "解決: `documentPageRegistry.ts` / `DocumentPageRegistryContext.tsx`。permalink: `documentEditorUrl.ts` の `buildDocumentUrl`。",
            )}
          </p>
        </div>
      </div>
      <div className={"space-y-3"}>
        <h2 className={"text-lg font-semibold"}>
          {t("Embeddable in TipTap", "TipTap に埋め込めるもの")}
        </h2>
        <div className={"space-y-5 text-sm"}>
          <p className={"leading-relaxed text-foreground/85"}>
            {t(
              "Blocks and marks the body can hold. Each is a TipTap extension and survives in the saved HTML.",
              "本文に置けるブロックや装飾。それぞれ TipTap 拡張で実装してあり、保存される HTML に残る。",
            )}
          </p>
          <div>
            <div className={"flex flex-wrap items-center gap-2"}>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {t("In this demo", "このデモに入っている")}
              </h3>
              <span
                className={
                  "inline-flex items-center rounded-full bg-status-completed/15 px-2 py-0.5 text-[10px] font-medium text-status-completed"
                }
              >
                {t("Implemented", "実装済み")}
              </span>
            </div>
            <div className={"mt-2 overflow-x-auto rounded-md border"}>
              <table className={"w-full border-collapse text-left"}>
                <thead
                  className={
                    "bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"
                  }
                >
                  <tr>
                    <th scope={"col"} className={"w-48 px-3 py-2 font-medium"}>
                      {t("Extension", "拡張")}
                    </th>
                    <th scope={"col"} className={"px-3 py-2 font-medium"}>
                      {t("Description", "説明")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={""}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Text marks", "テキスト装飾")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Bold, italic, strikethrough, inline code. Applied from the selection bubble.",
                        "太字・斜体・取り消し線・インライン code。テキスト選択時のバブルから付ける。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Headings (H2 / H3)", "見出し（H2 / H3）")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Heading text auto-gets a stable id, used by anchor links and the copy-link control.",
                        "見出し文字から自動で安定 id が付き、アンカーリンクと「リンクコピー」で使われる。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t(
                        "Heading link (same article)",
                        "見出しリンク（同記事内）",
                      )}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "`#headingId` link in body — clicking jumps to that heading. Copy from the heading hover control.",
                        "本文中の `#headingId` リンク。クリックでその見出しに飛ぶ。見出し hover の「コピー」から取得。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Lists, quote, divider", "リスト・引用・水平線")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Bulleted / numbered list, blockquote, `<hr>` — inserted from the + menu.",
                        "箇条書き / 番号付き、引用、水平線。+ メニューから挿入。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Code block", "コードブロック")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Fenced block with syntax highlighting via lowlight.",
                        "fenced なコードブロック。lowlight でシンタックスハイライト。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("External link", "外部リンク")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        '`<a href="…">` for external URLs. Internal picks store `data-page-id` on the mark.',
                        '外部 URL は `<a href="…">`。内部ページ選択時は mark に `data-page-id` を保存。',
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Page embed", "ページ埋め込み")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Block card — saved as `data-page-id` only; title and summary resolved at render.",
                        "ブロックカード。`data-page-id` のみ保存し、タイトルと要約は表示時に解決。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Page mention", "ページメンション")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Inline reference — same `data-page-id` persistence as embed; wiki clicks navigate in-demo.",
                        "インライン参照。embed と同じ `data-page-id` 保存。Wiki 参照はデモ内で sidebar 遷移。",
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className={"flex flex-wrap items-center gap-2"}>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {t(
                  "Likely needed, not yet built",
                  "未実装だがニーズはありそう",
                )}
              </h3>
              <span
                className={
                  "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                }
              >
                {t("Not implemented", "未実装（ニーズあり）")}
              </span>
            </div>
            <div className={"mt-2 overflow-x-auto rounded-md border"}>
              <table className={"w-full border-collapse text-left"}>
                <thead
                  className={
                    "bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"
                  }
                >
                  <tr>
                    <th scope={"col"} className={"w-48 px-3 py-2 font-medium"}>
                      {t("Extension", "拡張")}
                    </th>
                    <th scope={"col"} className={"px-3 py-2 font-medium"}>
                      {t("Description", "説明")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={""}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Image / file", "画像 / ファイル")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Upload or URL, with caption and resize handles.",
                        "アップロードまたは URL 指定。キャプション・リサイズ付き。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Table", "表")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Editable grid (@tiptap/extension-table).",
                        "編集可能な表（@tiptap/extension-table）。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Callout", "コールアウト")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Info / tip / warning box — icon plus tinted background.",
                        "情報・ヒント・警告などの枠。アイコンと色付き背景。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("Task list", "タスクリスト")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Checkbox items, optionally with assignee or due date.",
                        "チェックボックス付きリスト。担当や期日も付けられる。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("@ mention", "@ メンション")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "Inline chip for a user, date, or business entity.",
                        "ユーザー・日付・業務エンティティを指す chip。",
                      )}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {t("External embed", "外部埋め込み")}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {t(
                        "iframe card for YouTube, Figma, dashboards, etc.",
                        "YouTube / Figma / ダッシュボードなどの iframe カード。",
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

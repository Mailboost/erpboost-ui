// Documentation observed at https://ui.tailor.tech/page/document-page
export default function DocumentNotes() {
  return (
    <div className="space-y-8">
      <div className={"space-y-3"}>
        <h2 className={"text-lg font-semibold"}>
          {"Document URL composition"}
        </h2>
        <div className={"space-y-5 text-sm"}>
          <p className={"leading-relaxed text-foreground/85"}>
            {
              "Notes on how a document URL is put together. URL routing is not wired in this demo."
            }
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
                    {"Segment"}
                  </th>
                  <th scope={"col"} className={"px-3 py-2 font-medium"}>
                    {"Description"}
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
                    {
                      "The article's permanent id. Stays the same even when the title or slug changes."
                    }
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
                    {
                      "Readable label derived from the title. Optional, just for humans."
                    }
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
                    {
                      "Anchor within the same article, generated from the heading text."
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={"space-y-4"}>
            <div>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {"In this demo"}
              </h3>
              <ul
                className={
                  "mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85"
                }
              >
                <li>
                  {"Hover a heading in preview to copy a link straight to it."}
                </li>
                <li>
                  {
                    "Page embed, page mention, and internal links store `data-page-id` only (external links store `data-href`). Title and URL are resolved at render time via `documentPageRegistry.ts`."
                  }
                </li>
                <li>
                  {
                    "All internal links (embed, mention, `<a data-page-id>`) point at sidebar wiki articles only. In preview, clicking them switches the sidebar selection — never the UI catalogue routes."
                  }
                </li>
                <li>
                  {
                    "Internal pickers list sidebar articles only. Legacy `cat:<slug>` and `/page/<slug>` attrs are migrated to wiki ids on load."
                  }
                </li>
                <li>
                  {
                    "Same-article heading links still use `#headingId` fragments only."
                  }
                </li>
              </ul>
            </div>
            <div>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {"When implementing"}
              </h3>
              <ul
                className={
                  "mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85"
                }
              >
                <li>
                  {
                    "Persist page id in saved HTML — never slug, title, or resolved URL. Those belong in the resolver only."
                  }
                </li>
                <li>
                  {
                    "Resolve on every render (editor + preview). Stale titles in attrs become wrong after rename."
                  }
                </li>
                <li>
                  {
                    "Keep external links separate (`data-href`). Do not mix page id and full URL on the same node."
                  }
                </li>
                <li>
                  {
                    "Parse legacy `data-slug` attrs when loading old content; migrate on next save."
                  }
                </li>
                <li>
                  {
                    "Show a broken state when the id no longer exists — do not silently drop the reference."
                  }
                </li>
              </ul>
            </div>
            <div>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {"In production"}
              </h3>
              <ul
                className={
                  "mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85"
                }
              >
                <li>
                  {
                    "Back page ids with a real page registry (API / DB), not hard-coded demo maps."
                  }
                </li>
                <li>
                  {
                    "Redirect old URLs to new ones when a slug changes on rename."
                  }
                </li>
                <li>
                  {"Public share URLs can use a different scheme if needed."}
                </li>
              </ul>
            </div>
          </div>
          <p className={"text-xs text-muted-foreground"}>
            {
              "Resolver: `documentPageRegistry.ts`, `DocumentPageRegistryContext.tsx`. Permalinks: `buildDocumentUrl` in `documentEditorUrl.ts`."
            }
          </p>
        </div>
      </div>
      <div className={"space-y-3"}>
        <h2 className={"text-lg font-semibold"}>{"Embeddable in TipTap"}</h2>
        <div className={"space-y-5 text-sm"}>
          <p className={"leading-relaxed text-foreground/85"}>
            {
              "Blocks and marks the body can hold. Each is a TipTap extension and survives in the saved HTML."
            }
          </p>
          <div>
            <div className={"flex flex-wrap items-center gap-2"}>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {"In this demo"}
              </h3>
              <span
                className={
                  "inline-flex items-center rounded-full bg-status-completed/15 px-2 py-0.5 text-[10px] font-medium text-status-completed"
                }
              >
                {"Implemented"}
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
                      {"Extension"}
                    </th>
                    <th scope={"col"} className={"px-3 py-2 font-medium"}>
                      {"Description"}
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
                      {"Text marks"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {
                        "Bold, italic, strikethrough, inline code. Applied from the selection bubble."
                      }
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Headings (H2 / H3)"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {
                        "Heading text auto-gets a stable id, used by anchor links and the copy-link control."
                      }
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Heading link (same article)"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {
                        "`#headingId` link in body — clicking jumps to that heading. Copy from the heading hover control."
                      }
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Lists, quote, divider"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {
                        "Bulleted / numbered list, blockquote, `<hr>` — inserted from the + menu."
                      }
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Code block"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {"Fenced block with syntax highlighting via lowlight."}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"External link"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {
                        '`<a href="…">` for external URLs. Internal picks store `data-page-id` on the mark.'
                      }
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Page embed"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {
                        "Block card — saved as `data-page-id` only; title and summary resolved at render."
                      }
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Page mention"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {
                        "Inline reference — same `data-page-id` persistence as embed; wiki clicks navigate in-demo."
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className={"flex flex-wrap items-center gap-2"}>
              <h3 className={"text-sm font-semibold text-foreground"}>
                {"Likely needed, not yet built"}
              </h3>
              <span
                className={
                  "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                }
              >
                {"Not implemented"}
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
                      {"Extension"}
                    </th>
                    <th scope={"col"} className={"px-3 py-2 font-medium"}>
                      {"Description"}
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
                      {"Image / file"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {"Upload or URL, with caption and resize handles."}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Table"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {"Editable grid (@tiptap/extension-table)."}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Callout"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {
                        "Info / tip / warning box — icon plus tinted background."
                      }
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"Task list"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {"Checkbox items, optionally with assignee or due date."}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"@ mention"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {"Inline chip for a user, date, or business entity."}
                    </td>
                  </tr>
                  <tr className={"border-t"}>
                    <th
                      scope={"row"}
                      className={
                        "w-48 px-3 py-2 align-top font-medium text-foreground"
                      }
                    >
                      {"External embed"}
                    </th>
                    <td
                      className={
                        "px-3 py-2 align-top leading-relaxed text-foreground/85"
                      }
                    >
                      {"iframe card for YouTube, Figma, dashboards, etc."}
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

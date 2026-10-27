import { Suspense, useState } from "react";
import { Button, Link } from "@mailboost/erpboost-ui";
import {
  Check,
  Copy,
  ExternalLink,
  Monitor,
  RotateCcw,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  entries,
  sections,
  routeOf,
  type Entry,
  type Category,
} from "./registry";
import { getDemos, type Demo } from "./demos";
import { useLocale } from "./locale";

export function HomePage() {
  const { t } = useLocale();
  return (
    <main className="catalogue">
      <h1>UI Catalogue</h1>
      <p className="intro">
        {t(
          "Reference for @mailboost/erpboost-ui: primitives under Components, full-screen samples under Pages, and composite UI under Patterns. Start from the cards below or the sidebar.",
          "@mailboost/erpboost-ui のリファレンス。Components は基本部品、Pages は画面全体のサンプル、Patterns は部品を組み合わせたUIです。下のカードまたはサイドバーから選んでください。",
        )}
      </p>
      <div className="section-grid">
        {sections.map((section) => (
          <Link
            className="section-card"
            key={section.category}
            to={`/${section.category}`}
          >
            <strong>{section.title}</strong>
            <span>{t(section.description, section.ja)}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
export function CategoryPage({ category }: { category: Category }) {
  const { t } = useLocale();
  const section = sections.find((s) => s.category === category)!;
  return (
    <main className="catalogue">
      <h1>{section.title}</h1>
      <p className="intro">{t(section.description, section.ja)}</p>
      <div className="section-grid">
        {entries
          .filter((e) => e.category === category && e.slug !== "overview")
          .map((entry) => (
            <Link key={entry.slug} className="section-card" to={routeOf(entry)}>
              <strong>{t(entry.title, entry.ja)}</strong>
              <span>{entry.description}</span>
            </Link>
          ))}
      </div>
    </main>
  );
}
function CodeBlock({ source }: { source: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="source-block">
      <div className="source-toolbar">
        <span>TypeScript / React</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(source);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
          {copied ? "Copied" : "Copy code"}
        </Button>
      </div>
      <pre>
        <code>{source}</code>
      </pre>
    </div>
  );
}
function Preview({
  entry,
  demo,
  index,
}: {
  entry: Entry;
  demo: Demo;
  index: number;
}) {
  const { t } = useLocale();
  const [tab, setTab] = useState("preview"),
    [width, setWidth] = useState("desktop"),
    [background, setBackground] = useState("card"),
    [revision, setRevision] = useState(0);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const url = `${base}${routeOf(entry)}?preview=1&variant=${index}&background=${background}`;
  return (
    <section className="example-section">
      <h2>{demo.name}</h2>
      <div className="preview-toolbar">
        <div
          className="preview-tabs"
          role="tablist"
          aria-label={`${demo.name} view`}
        >
          <button
            role="tab"
            aria-selected={tab === "preview"}
            className={tab === "preview" ? "active" : ""}
            onClick={() => setTab("preview")}
          >
            {t("Preview", "プレビュー")}
          </button>
          <button
            role="tab"
            aria-selected={tab === "code"}
            className={tab === "code" ? "active" : ""}
            onClick={() => setTab("code")}
          >
            {t("Code", "コード")}
          </button>
        </div>
        {tab === "preview" && (
          <div className="preview-options">
            <div
              className="preview-tabs"
              role="tablist"
              aria-label="Preview viewport"
            >
              {[
                ["desktop", Monitor],
                ["tablet", Tablet],
                ["mobile", Smartphone],
              ].map(([value, Icon]) => {
                const name = value as string,
                  Device = Icon as typeof Monitor;
                return (
                  <button
                    key={name}
                    role="tab"
                    aria-selected={width === name}
                    aria-label={`${name[0].toUpperCase() + name.slice(1)} preview width`}
                    className={width === name ? "active" : ""}
                    onClick={() => setWidth(name)}
                  >
                    <Device size={15} />
                  </button>
                );
              })}
            </div>
            <span className="toolbar-divider" />
            <div
              className="preview-tabs"
              role="tablist"
              aria-label="Preview background"
            >
              {["background", "card"].map((value) => (
                <button
                  role="tab"
                  aria-selected={background === value}
                  key={value}
                  className={background === value ? "active" : ""}
                  onClick={() => setBackground(value)}
                >
                  {value === "card" ? "Card" : "Background"}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open preview in new tab"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink size={15} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh preview"
              onClick={() => setRevision((r) => r + 1)}
            >
              <RotateCcw size={15} />
            </Button>
          </div>
        )}
      </div>
      {tab === "code" ? (
        <CodeBlock source={demo.source} />
      ) : (
        <div className={`preview-surface ${background}`}>
          <iframe
            key={revision}
            title={`${entry.title} — ${demo.name} preview`}
            src={url}
            className={
              entry.category === "components"
                ? "component-preview"
                : "page-preview"
            }
            style={{
              width:
                width === "mobile" ? 390 : width === "tablet" ? 768 : "100%",
            }}
          />
        </div>
      )}
    </section>
  );
}
export function EntryPage({ entry }: { entry: Entry }) {
  const { t } = useLocale();
  const demos = getDemos(entry);
  const query = new URLSearchParams(location.search);
  const onlyPreview = query.get("preview") === "1";
  const index = Math.min(
    demos.length - 1,
    Math.max(0, Number(query.get("variant")) || 0),
  );
  const [copied, setCopied] = useState(false);
  if (onlyPreview) {
    const Demo = demos[index]?.Component;
    return (
      <div
        className={`standalone-preview ${entry.category === "components" ? "primitive-preview" : "composite-preview"}`}
      >
        <Suspense fallback={<p className="muted small">Loading preview…</p>}>
          {Demo ? <Demo /> : <p>No preview available.</p>}
        </Suspense>
      </div>
    );
  }
  if (entry.slug === "overview") return <CategoryPage category="components" />;
  return (
    <main className="catalogue">
      <div className="catalogue-heading">
        <h1>{t(entry.title, entry.ja)}</h1>
        {entry.category !== "components" && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `# ${entry.title}\n\n${entry.description}\n\n${demos.map((d) => `## ${d.name}\n\n\`\`\`tsx\n${d.source}\n\`\`\``).join("\n\n")}`,
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
            {copied ? "Copied" : "Copy as Markdown"}
          </Button>
        )}
      </div>
      <p className="intro">{entry.description}</p>
      {entry.category !== "components" && (
        <div className="guidance-grid">
          <div className="guidance">
            <span className="guidance-label do">✓ Do</span>
            <p>
              {t(
                "Use this composition when the task and its actions belong in one focused workspace. Adapt labels, data and permissions to your application.",
                "関連する情報と操作を、ひとつの画面で扱う場合に使います。項目名・データ・権限はアプリケーションに合わせて設定してください。",
              )}
            </p>
          </div>
          <div className="guidance">
            <span className="guidance-label dont">× Don't</span>
            <p>
              {t(
                "Avoid adding unrelated tasks to the same view. Keep long tables scrollable and move complex edits to a detail panel or dedicated form.",
                "関係のない操作を同じ画面に詰め込まないでください。長いテーブルは横スクロールにし、複雑な編集は詳細パネルや専用フォームに分けます。",
              )}
            </p>
          </div>
        </div>
      )}
      {demos.map((demo, index) => (
        <Preview
          key={`${entry.category}-${entry.slug}-${index}`}
          entry={entry}
          demo={demo}
          index={index}
        />
      ))}
      <div className="source-location">
        <span>Source</span>
        <a
          href={`https://github.com/Mailboost/erpboost-ui/tree/main/${entry.category === "components" ? "packages/ui/src/components" : "apps/catalog/src/demos"}`}
          target="_blank"
          rel="noreferrer"
        >
          {entry.category === "components"
            ? "packages/ui/src/components/"
            : "apps/catalog/src/demos/"}
          <ExternalLink size={13} />
        </a>
      </div>
    </main>
  );
}

import primitiveLinks from "./reference/primitive-links.json";
import referenceContent from "./reference/metadata.json";
import { Fragment, lazy, Suspense, useState } from "react";
import { Badge, Button, Link, Tabs } from "@mailboost/erpboost-ui";
import {
  Check,
  Copy,
  Files,
  Monitor,
  Expand,
  RotateCcw,
  Smartphone,
  Tablet,
  X,
} from "lucide-react";
import {
  entries,
  sections,
  routeOf,
  type Entry,
  type Category,
} from "./registry";
import { getDemos, getMarkdownSources, type Demo } from "./demos";
import { useLocale } from "./locale";
import { PageFrame } from "./reference/shared/page-frame";
const DocumentNotes = lazy(() => import("./reference/DocumentNotes"));
const HighlightedSource = lazy(() => import("./HighlightedSource"));
const sourceLanguage = (filename: string) => filename.split(".").pop() ?? "tsx";

const categoryDescriptions = Object.fromEntries(
  ["components", "page", "patterns"].map((category) => [
    category,
    (referenceContent as Record<string, { description: string }>)[
      `/${category}`
    ].description,
  ]),
) as Record<Category, string>;
export function HomePage() {
  const { t } = useLocale();
  return (
    <main className="catalogue reference-page">
      <h1>{t("UI Catalogue", "UI カタログ")}</h1>
      <p className="intro">
        {t(
          "Reference for @mailboost/erpboost-ui: primitives under Components, full-screen samples under Pages, and composite UI under Patterns. Start from the cards below or the sidebar.",
          "@mailboost/erpboost-ui の参照サイトです。コンポーネント単体・ページ単位の見本・primitive を組み合わせたパターンを置いています。下のカードかサイドバーから進んでください。",
        )}
      </p>
      <nav
        className="section-grid home-sections"
        aria-label={t("Primary catalogue sections", "カタログの主要セクション")}
      >
        {sections.map((s) => (
          <Link className="section-card" key={s.category} to={`/${s.category}`}>
            <strong>{t(s.title, s.ja)}</strong>
            <span>{t(s.description, s.descriptionJa)}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
export function CategoryPage({ category }: { category: Category }) {
  const { t } = useLocale();
  const [status, setStatus] = useState("All"),
    [tag, setTag] = useState("All");
  const section = sections.find((s) => s.category === category)!;
  const list = entries.filter((e) => e.category === category);
  const tags = [...new Set(list.flatMap((e) => e.tags ?? []))].sort();
  return (
    <main
      className={`catalogue category-page ${category === "components" ? "component-document" : "reference-page"}`}
    >
      <h1>{t(section.title, section.ja)}</h1>
      <p className="intro">
        {t(
          categoryDescriptions[category],
          {
            components:
              "app-shell が提供する UI コンポーネントのカタログです。サイドバーから各コンポーネントを選択して確認できます。",
            page: "app-shell のサイドバーとパンくずで包まれる、ルーティング先のページ全体レイアウトです。",
            patterns:
              "app-shell の primitive を組み立てた合成 UI（ツールバー・パネル・エディタなど）のサンプルです。",
          }[category],
        )}
      </p>
      {category !== "components" && (
        <>
          <div className="catalogue-filters">
            <div className="filter-row">
              <span>{t("Status", "状態")}</span>
              {["All", "Public", "Draft"].map((value) => (
                <Button
                  key={t(
                    value,
                    { All: "すべて", Public: "公開", Draft: "ドラフト" }[
                      value as "All" | "Public" | "Draft"
                    ],
                  )}
                  variant={status === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(value)}
                >
                  {t(
                    value,
                    { All: "すべて", Public: "公開", Draft: "ドラフト" }[
                      value as "All" | "Public" | "Draft"
                    ],
                  )}
                </Button>
              ))}
            </div>
            <div className="filter-row">
              <span>Tags</span>
              {["All", ...tags].map((value) => (
                <Button
                  key={value}
                  variant={tag === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTag(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
          <div className="entry-grid">
            {list
              .filter(
                (e) =>
                  status !== "Draft" &&
                  (tag === "All" || e.tags?.includes(tag)),
              )
              .map((e) => (
                <Link key={e.slug} className="entry-card" to={routeOf(e)}>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline-neutral">{e.size ?? "page"}</Badge>
                    {e.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline-neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <strong>{t(e.title, e.ja)}</strong>
                  <p>{t(e.description, e.descriptionJa ?? e.description)}</p>
                </Link>
              ))}
          </div>
          {(status === "Draft" ||
            !list.some((e) => tag === "All" || e.tags?.includes(tag))) && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No entries match the current filters.
            </div>
          )}
        </>
      )}
    </main>
  );
}
function CodeBlock({ demo, maxWidth }: { demo: Demo; maxWidth?: number }) {
  const sources = demo.sources?.length
    ? demo.sources
    : [{ filename: demo.name + ".tsx", source: demo.source }];
  const [index, setIndex] = useState(0),
    [copied, setCopied] = useState(false),
    [copiedAll, setCopiedAll] = useState(false);
  const source = sources[index] ?? sources[0];
  return (
    <div
      className="source-block"
      role="tabpanel"
      aria-label={demo.heading ? `${demo.name} code` : "Code"}
    >
      <div className="source-toolbar">
        <div className="source-files">
          {sources.map((file, i) => (
            <Button
              key={file.filename}
              variant={i === index ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
            >
              {file.filename}
            </Button>
          ))}
        </div>
        <div className="source-actions flex shrink-0 items-center gap-1">
          {sources.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              aria-live="polite"
              title="Copy all files as Markdown (good for pasting to an AI agent)"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  sources
                    .map(
                      (file) =>
                        `### ${file.filename}\n\n\`\`\`${sourceLanguage(file.filename)}\n${file.source}\n\`\`\``,
                    )
                    .join("\n\n"),
                );
                setCopiedAll(true);
                setTimeout(() => setCopiedAll(false), 2000);
              }}
            >
              {copiedAll ? (
                <Check className="size-3.5" />
              ) : (
                <Files className="size-3.5" />
              )}
              {copiedAll ? "Copied all" : `Copy all (${sources.length})`}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            aria-live="polite"
            onClick={async () => {
              await navigator.clipboard.writeText(source.source);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}{" "}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <div style={{ maxWidth, margin: "0 auto", width: "100%" }}>
        <Suspense
          fallback={
            <pre>
              <code>{source.source}</code>
            </pre>
          }
        >
          <HighlightedSource
            source={source.source}
            language={sourceLanguage(source.filename)}
          />
        </Suspense>
      </div>
    </div>
  );
}
function usePreviewSettings() {
  const [width, setWidth] = useState("desktop"),
    [background, setBackground] = useState("card"),
    [revision, setRevision] = useState(0);
  return { width, setWidth, background, setBackground, revision, setRevision };
}
type PreviewSettings = ReturnType<typeof usePreviewSettings>;
function PreviewOptions({
  settings,
  tab = "preview",
  url,
}: {
  settings: PreviewSettings;
  tab?: string;
  url: string;
}) {
  const { width, setWidth, background, setBackground, setRevision } = settings;
  return (
    <div className="preview-options">
      <Tabs.Root
        value={width}
        onValueChange={(v) => {
          setWidth(String(v));
          if (v !== "desktop") setBackground("card");
        }}
        className="w-fit gap-0"
      >
        <Tabs.List aria-label="Preview viewport">
          {[
            ["desktop", Monitor],
            ["tablet", Tablet],
            ["mobile", Smartphone],
          ].map(([name, Icon]) => {
            const I = Icon as typeof Monitor;
            return (
              <Tabs.Tab
                key={String(name)}
                value={String(name)}
                aria-label={`${String(name)[0].toUpperCase() + String(name).slice(1)} preview width`}
              >
                <I className="size-4" />
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs.Root>
      {tab === "preview" && (
        <>
          <span className="toolbar-divider" />
          <Tabs.Root
            value={background}
            onValueChange={(v) => setBackground(String(v))}
            className="w-fit gap-0"
          >
            <Tabs.List aria-label="Preview background">
              <Tabs.Tab value="background">Background</Tabs.Tab>
              <Tabs.Tab value="card">Card</Tabs.Tab>
            </Tabs.List>
          </Tabs.Root>
        </>
      )}
      <Button
        variant="ghost"
        size="xs"
        className="shrink-0 text-muted-foreground"
        aria-label="Open preview in new tab"
        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      >
        <Expand className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="xs"
        className="shrink-0 text-muted-foreground"
        aria-label="Refresh preview"
        onClick={() => setRevision((r) => r + 1)}
      >
        <RotateCcw className="size-4" />
      </Button>
    </div>
  );
}

function Preview({
  entry,
  demo,
  settings: shared,
  hideOptions = false,
}: {
  entry: Entry;
  demo: Demo;
  settings?: PreviewSettings;
  hideOptions?: boolean;
}) {
  const [tab, setTab] = useState("preview");
  const ownSettings = usePreviewSettings();
  const settings = shared ?? ownSettings;
  const { width, background, revision } = settings;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const url = `${base}${routeOf(entry)}?preview=fullscreen`;
  const C = demo.Component;
  const StateProvider = demo.StateProvider ?? Fragment;
  const maxWidth =
    width === "mobile" ? 384 : width === "tablet" ? 768 : undefined;
  const named = !!demo.heading;
  return (
    <StateProvider>
      <section
        className="example-section"
        aria-label={named ? demo.name : "Block preview"}
      >
        {named && (
          <div className="example-heading">
            <h2>{demo.heading}</h2>
            {demo.description && <p>{demo.description}</p>}
          </div>
        )}
        <div className="preview-toolbar">
          <Tabs.Root
            value={tab}
            onValueChange={(v) => setTab(String(v))}
            className="w-fit gap-0"
          >
            <Tabs.List aria-label={named ? `${demo.name} view` : "View"}>
              <Tabs.Tab value="preview">Preview</Tabs.Tab>
              <Tabs.Tab value="code">Code</Tabs.Tab>
            </Tabs.List>
          </Tabs.Root>
          {!hideOptions && (
            <PreviewOptions settings={settings} tab={tab} url={url} />
          )}
        </div>
        {tab === "code" ? (
          <CodeBlock demo={demo} maxWidth={maxWidth} />
        ) : (
          <div
            className={`preview-surface ${background}`}
            role="tabpanel"
            aria-label={named ? `${demo.name} preview` : "Preview"}
          >
            <div
              key={revision}
              className={`inline-preview-body ${demo.screen ? "screen-preview-body" : ""}`}
              style={{ maxWidth }}
            >
              <Suspense
                fallback={
                  <p className="text-sm text-muted-foreground">
                    Loading preview…
                  </p>
                }
              >
                <C />
              </Suspense>
            </div>
          </div>
        )}
      </section>
    </StateProvider>
  );
}
export function EntryPage({ entry }: { entry: Entry }) {
  const { t, language } = useLocale();
  const demos = getDemos(entry, language);
  const query = new URLSearchParams(location.search);
  const index = Math.min(
    demos.length - 1,
    Math.max(0, Number(query.get("variant")) || 0),
  );
  const [copied, setCopied] = useState(false);
  const settings = usePreviewSettings();
  const shared = entry.slug === "data-charts" || entry.slug === "timeline";
  if (query.get("preview") === "fullscreen") {
    const component = entry.category === "components";
    const previews = demos.map((demo, i) => {
      const C = demo.Component;
      const StateProvider = demo.StateProvider ?? Fragment;
      return (
        <div
          key={i}
          className={
            entry.category === "page" && demos.length === 1
              ? "flex min-h-0 flex-1 flex-col"
              : undefined
          }
        >
          <StateProvider>
            <Suspense fallback={null}>
              <C />
            </Suspense>
          </StateProvider>
        </div>
      );
    });
    return (
      <div
        className={component ? "space-y-8 p-8" : "min-h-dvh bg-card p-4 sm:p-6"}
      >
        {component && (
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{t(entry.title, entry.ja)}</h1>
            <p
              className={
                entry.slug === "foundation"
                  ? "max-w-[650px] text-muted-foreground"
                  : "text-muted-foreground"
              }
            >
              {t(entry.description, entry.descriptionJa ?? entry.description)}
            </p>
          </div>
        )}
        <div className={component ? undefined : "mx-auto w-full space-y-10"}>
          {entry.category === "page" ? (
            <PageFrame
              fullBleed={[
                "assistant-panel",
                "chat",
                "document-page",
                "email",
              ].includes(entry.slug)}
            >
              {entry.slug === "document-page" ? () => previews : previews}
            </PageFrame>
          ) : (
            previews
          )}
        </div>
      </div>
    );
  }
  if (query.get("preview") === "1") {
    const C = demos[index]?.Component;
    const StateProvider = demos[index]?.StateProvider ?? Fragment;
    return (
      <div
        className={`standalone-preview ${entry.category === "components" ? "primitive-preview" : demos[index]?.screen ? "screen-preview" : "block-preview-document"} ${query.get("background") === "background" ? "bg-background" : "bg-card"}`}
      >
        <StateProvider>
          <Suspense fallback={null}>{C && <C />}</Suspense>
        </StateProvider>
      </div>
    );
  }
  const component = entry.category === "components";
  return (
    <main
      data-component={component ? entry.slug : undefined}
      className={`catalogue ${component ? "component-document" : "reference-page"}`}
    >
      <div className={component ? "component-heading" : "catalogue-heading"}>
        <div className={component ? "component-title" : "catalogue-title"}>
          <h1>{t(entry.title, entry.ja)}</h1>
          {!component && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const unique = getMarkdownSources(entry);
                await navigator.clipboard.writeText(
                  `# ${entry.title}\n\n**Tier:** ${entry.tier} · **Size:** ${entry.size} · **Tags:** ${entry.tags?.join(", ")}\n\n${entry.description}\n\n## Do\n\n${entry.guidance?.do[0]}\n\n## Don't\n\n${entry.guidance?.dont[0]}${entry.markdownNotes ? "\n\n" + entry.markdownNotes : ""}\n\n## Primitives used\n\n${entry.primitives?.map((n) => "- `" + n + "`").join("\n")}\n\n## Source\n\n${unique.map((f) => `### ${f.filename}\n\n\`\`\`${sourceLanguage(f.filename)}\n${f.source}\n\`\`\``).join("\n\n")}`,
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied" : "Copy as Markdown"}
            </Button>
          )}
        </div>
        <p className="intro">
          {t(entry.description, entry.descriptionJa ?? entry.description)}
        </p>
      </div>
      {!component && (
        <div className="guidance-grid">
          <div className="guidance">
            <span className="guidance-label do">
              <Check className="size-3.5" />
              Do
            </span>
            <p>{t(...entry.guidance!.do)}</p>
          </div>
          <div className="guidance">
            <span className="guidance-label dont">
              <X className="size-3.5" />
              Don't
            </span>
            <p>{t(...entry.guidance!.dont)}</p>
          </div>
        </div>
      )}
      {shared && (
        <div className="shared-preview-options">
          <PreviewOptions
            settings={settings}
            url={`${import.meta.env.BASE_URL.replace(/\/$/, "")}${routeOf(entry)}?preview=fullscreen`}
          />
        </div>
      )}
      {component ? (
        <Suspense fallback={null}>
          {demos.map((d) => (
            <d.Component key={entry.slug} />
          ))}
        </Suspense>
      ) : (
        <div
          className={
            entry.slug === "data-charts"
              ? "chart-examples"
              : shared
                ? "shared-examples"
                : undefined
          }
        >
          {demos.map((demo, i) => (
            <Preview
              key={`${entry.slug}-${i}`}
              entry={entry}
              settings={settings}
              hideOptions={shared}
              demo={demo}
            />
          ))}
        </div>
      )}
      {entry.slug === "document-page" && (
        <Suspense fallback={null}>
          <DocumentNotes />
        </Suspense>
      )}
      {!component && entry.primitives && (
        <section className="primitives-used">
          <h2>Primitives used</h2>
          <ul>
            {entry.primitives.map((name) => {
              const href = (primitiveLinks as Record<string, string>)[name];
              return (
                <li key={name}>
                  {href ? <Link to={href}>{name}</Link> : <span>{name}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}

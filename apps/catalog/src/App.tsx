import { useMemo } from "react";
import {
  AppShell,
  Button,
  DefaultSidebar,
  Link,
  SidebarGroup,
  SidebarItem,
  SidebarLayout,
  SidebarMenuItem,
  SidebarMenuButton,
  useOpenCommandPalette,
  defineModule,
  defineResource,
} from "@mailboost/erpboost-ui";
import { Search } from "lucide-react";
import { entries, sections, routeOf } from "./registry";
import { CategoryPage, EntryPage, HomePage } from "./Catalogue";
import { LocaleProvider, useLocale } from "./locale";

function CatalogueSearch() {
  const open = useOpenCommandPalette();
  const { t } = useLocale();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="catalogue-search" onClick={() => open()}>
        <Search size={16} />
        <span>{t("Search", "検索")}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CatalogueApp() {
  const { language, setLanguage, t } = useLocale();
  const preview = new URLSearchParams(location.search).get("preview") === "1";
  const modules = useMemo(
    () => [
      defineModule({
        path: "",
        meta: {
          title: (locale) =>
            locale.startsWith("ja") ? "UI カタログ" : "UI Catalogue",
        },
        component: HomePage,
        resources: [],
      }),
      ...sections.map((section) =>
        defineModule({
          path: section.category,
          meta: {
            title: (locale) =>
              locale.startsWith("ja") ? section.ja : section.title,
          },
          component: () => <CategoryPage category={section.category} />,
          resources: entries
            .filter((entry) => entry.category === section.category)
            .map((entry) =>
              defineResource({
                path: entry.slug,
                meta: {
                  title: (locale) =>
                    locale.startsWith("ja") ? entry.ja : entry.title,
                },
                component: () => <EntryPage entry={entry} />,
              }),
            ),
        }),
      ),
    ],
    [],
  );
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  document.documentElement.classList.toggle("preview-document", preview);
  return (
    <AppShell
      title={t("UI Catalogue", "UI カタログ")}
      locale={language}
      timeZone="Asia/Tokyo"
      basePath={base.replace(/^\//, "")}
      modules={modules}
      commandPalette={{ routeOrder: "definition", showAppInfo: false }}
      favicon={`${base}/icon.svg`}
      appInfo={{ metadata: [{ label: "Product", value: "ERPboost UI" }] }}
    >
      <SidebarLayout
        sidebar={
          preview ? (
            <></>
          ) : (
            <DefaultSidebar
              hideSearch
              header={
                <Link className="catalogue-brand" to="/">
                  <img src={`${base}/icon.svg`} alt="" />
                  <strong>{t("UI Catalogue", "UI カタログ")}</strong>
                </Link>
              }
              footer={
                <footer className="px-4 py-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
                  <div className="flex items-center justify-between gap-2 text-xs group-data-[collapsible=icon]:hidden">
                    <span className="shrink-0 font-medium uppercase tracking-wide text-muted-foreground">
                      {t("Language", "言語")}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <Button
                        variant="link"
                        className={`h-auto p-0 ${language === "en" ? "font-medium text-foreground underline underline-offset-4" : "text-muted-foreground hover:text-foreground"}`}
                        aria-pressed={language === "en"}
                        onClick={() => setLanguage("en")}
                      >
                        EN
                      </Button>
                      <span className="shrink-0 text-muted-foreground">/</span>
                      <Button
                        variant="link"
                        className={`h-auto p-0 ${language === "ja" ? "font-medium text-foreground underline underline-offset-4" : "text-muted-foreground hover:text-foreground"}`}
                        aria-pressed={language === "ja"}
                        onClick={() => setLanguage("ja")}
                      >
                        JA
                      </Button>
                    </div>
                  </div>
                </footer>
              }
            >
              <CatalogueSearch />
              <SidebarItem
                to="/"
                render={() => <span>{t("Home", "ホーム")}</span>}
              />
              {sections.map((section) => (
                <SidebarGroup
                  key={section.category}
                  title={t(section.title, section.ja)}
                  defaultOpen={section.category !== "components"}
                >
                  {entries
                    .filter((entry) => entry.category === section.category)
                    .map((entry) => (
                      <SidebarItem key={entry.slug} to={routeOf(entry)} />
                    ))}
                </SidebarGroup>
              ))}
            </DefaultSidebar>
          )
        }
        header={preview ? <></> : undefined}
      />
    </AppShell>
  );
}
export function App() {
  return (
    <LocaleProvider>
      <CatalogueApp />
    </LocaleProvider>
  );
}

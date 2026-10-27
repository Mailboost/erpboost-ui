// Reference example: https://ui.tailor.tech/page/document-page
import { useMemo, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Button, Input, Tabs } from "@mailboost/erpboost-ui";
import type { PageReferenceAttrs } from "./DocumentEditorPageEmbed";
import { useDocumentPageRegistry } from "./DocumentPageRegistryContext";
import { listPagePickerCandidates } from "./documentPageRegistry";

type Props = {
  onSelect: (attrs: PageReferenceAttrs) => void;
  searchLabel?: string;
};

type PickerTab = "internal" | "external";

const isLikelyUrl = (value: string) => /^https?:\/\//i.test(value.trim());

export const DocumentEditorPageEmbedPicker = ({
  onSelect,
  searchLabel = "Search pages to embed",
}: Props) => {
  const { wikiDocs } = useDocumentPageRegistry();
  const [tab, setTab] = useState<PickerTab>("internal");
  const [query, setQuery] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const filteredCandidates = useMemo(
    () => listPagePickerCandidates(wikiDocs, query),
    [wikiDocs, query],
  );

  const rowClass =
    "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/80";

  const submitExternal = () => {
    const href = externalUrl.trim();
    if (!href || !isLikelyUrl(href)) return;
    onSelect({
      pageId: "",
      href,
    });
  };

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(v) => setTab(v as PickerTab)}
      className="gap-0"
    >
      <div className="border-b px-1 pb-2">
        <Tabs.List className="grid h-8 w-full grid-cols-2">
          <Tabs.Tab value="internal" className="gap-1 text-xs">
            <FileText className="size-3.5" aria-hidden />
            Internal page
          </Tabs.Tab>
          <Tabs.Tab value="external" className="gap-1 text-xs">
            <ExternalLink className="size-3.5" aria-hidden />
            External URL
          </Tabs.Tab>
        </Tabs.List>
      </div>

      <Tabs.Panel value="internal" className="space-y-2 p-1 pt-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by sidebar page title"
          aria-label={searchLabel}
          autoFocus
        />
        <ul
          className="max-h-52 space-y-px overflow-y-auto"
          aria-label="Page candidates"
        >
          {filteredCandidates.length === 0 ? (
            <li className="px-2 py-4 text-center text-xs text-muted-foreground">
              No matching pages
            </li>
          ) : (
            filteredCandidates.map(({ pageId, title, subtitle }) => (
              <li key={pageId}>
                <button
                  type="button"
                  className={rowClass}
                  onClick={() => onSelect({ pageId })}
                >
                  <FileText
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">
                      {title}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                      {subtitle}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </Tabs.Panel>

      <Tabs.Panel value="external" className="space-y-3 p-1 pt-2">
        <div className="space-y-1.5">
          <label
            htmlFor="document-embed-external-url"
            className="text-xs font-medium text-muted-foreground"
          >
            URL
          </label>
          <Input
            id="document-embed-external-url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitExternal();
              }
            }}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={submitExternal}
            disabled={!isLikelyUrl(externalUrl)}
          >
            Insert
          </Button>
        </div>
      </Tabs.Panel>
    </Tabs.Root>
  );
};

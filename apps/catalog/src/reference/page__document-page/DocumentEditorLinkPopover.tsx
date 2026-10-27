// Reference example: https://ui.tailor.tech/page/document-page
import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ExternalLink, FileText, Link2, Link2Off } from "lucide-react";
import { Button, Input, Tabs, Tooltip } from "@mailboost/erpboost-ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../shared/popover";
import { cn } from "@/lib/utils";
import { useDocumentPageRegistry } from "./DocumentPageRegistryContext";
import { listPagePickerCandidates, normalizePageId } from "./documentPageRegistry";

const normalizeExternalHref = (raw: string): string => {
  const href = raw.trim();
  if (!href) return "";
  if (/^(https?:\/\/|mailto:|\/|#|tel:)/.test(href)) return href;
  return `https://${href}`;
};

type LinkTab = "external" | "internal";

export const DocumentEditorLinkPopover = ({
  editor,
  open,
  onOpenChange,
  triggerClassName,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
}) => {
  const { wikiDocs, resolvePage } = useDocumentPageRegistry();
  const [tab, setTab] = useState<LinkTab>("external");
  const [externalUrl, setExternalUrl] = useState("");
  const [internalQuery, setInternalQuery] = useState("");

  const isLinkActive = editor.isActive("link");
  const currentHref = editor.getAttributes("link").href as string | undefined;
  const currentPageId = editor.getAttributes("link").pageId as
    | string
    | undefined;

  useEffect(() => {
    if (!open) return;
    setInternalQuery("");
    if (currentPageId) {
      setTab("internal");
      setExternalUrl("");
      return;
    }
    setExternalUrl(currentHref ?? "");
    setTab("external");
  }, [open, currentHref, currentPageId]);

  const filteredCandidates = useMemo(
    () => listPagePickerCandidates(wikiDocs, internalQuery),
    [wikiDocs, internalQuery],
  );

  // setMark instead of setLink: the stock setLink command's typing doesn't
  // accept the custom pageId attribute added by DocumentEditorLink.
  const applyExternalLink = () => {
    const href = normalizeExternalHref(externalUrl);
    if (!href) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setMark("link", { href, pageId: null })
      .run();
    onOpenChange(false);
  };

  const applyPageId = (pageId: string) => {
    const id = normalizePageId(pageId);
    const { href } = resolvePage(id);
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setMark("link", { href, pageId: id })
      .run();
    onOpenChange(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onOpenChange(false);
  };

  const entryRowClass =
    "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/80";

  return (
    <Popover modal={false} open={open} onOpenChange={onOpenChange}>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                aria-label={isLinkActive ? "Edit link" : "Add link"}
                aria-pressed={isLinkActive}
                className={cn(
                  "aspect-square shrink-0 p-0 [&_svg]:size-3.5",
                  isLinkActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60",
                  triggerClassName,
                )}
              >
                <Link2 aria-hidden />
              </Button>
            </PopoverTrigger>
          }
        />
        <Tooltip.Content>
          {isLinkActive ? "Edit link" : "Add link"}
        </Tooltip.Content>
      </Tooltip.Root>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-80 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs.Root
          value={tab}
          onValueChange={(v) => setTab(v as LinkTab)}
          className="gap-0"
        >
          <div className="border-b px-3 pt-3 pb-2">
            <Tabs.List className="grid h-8 w-full grid-cols-2">
              <Tabs.Tab value="external" className="gap-1 text-xs">
                <ExternalLink className="size-3.5" aria-hidden />
                External URL
              </Tabs.Tab>
              <Tabs.Tab value="internal" className="gap-1 text-xs">
                <FileText className="size-3.5" aria-hidden />
                Internal page
              </Tabs.Tab>
            </Tabs.List>
          </div>

          <Tabs.Panel value="external" className="space-y-3 p-3">
            <div className="space-y-1.5">
              <label
                htmlFor="document-link-external-url"
                className="text-xs font-medium text-muted-foreground"
              >
                URL
              </label>
              <Input
                id="document-link-external-url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyExternalLink();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              {isLinkActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={removeLink}
                >
                  <Link2Off className="size-3.5" aria-hidden />
                  Remove link
                </Button>
              ) : (
                <span />
              )}
              <Button type="button" size="sm" onClick={applyExternalLink}>
                Apply
              </Button>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="internal" className="space-y-2 p-3">
            <Input
              value={internalQuery}
              onChange={(e) => setInternalQuery(e.target.value)}
              placeholder="Search by sidebar page title"
              aria-label="Search internal pages"
            />
            <ul
              className="max-h-52 space-y-px overflow-y-auto"
              aria-label="Internal page candidates"
            >
              {filteredCandidates.length === 0 ? (
                <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                  No matching pages
                </li>
              ) : (
                filteredCandidates.map(({ pageId, title, subtitle }) => {
                  const isSelected =
                    currentPageId != null &&
                    normalizePageId(currentPageId) === pageId;
                  return (
                    <li key={pageId}>
                      <button
                        type="button"
                        aria-current={isSelected || undefined}
                        className={cn(
                          entryRowClass,
                          isSelected && "bg-muted/60",
                        )}
                        onClick={() => applyPageId(pageId)}
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
                  );
                })
              )}
            </ul>
            {isLinkActive ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={removeLink}
              >
                <Link2Off className="size-3.5" aria-hidden />
                Remove link
              </Button>
            ) : null}
          </Tabs.Panel>
        </Tabs.Root>
      </PopoverContent>
    </Popover>
  );
};

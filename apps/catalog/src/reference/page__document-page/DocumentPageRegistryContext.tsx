// Reference example: https://ui.tailor.tech/page/document-page
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  resolvePageReference,
  type ResolvedPageReference,
  type WikiDocSnapshot,
} from "./documentPageRegistry";

type DocumentPageRegistryContextValue = {
  wikiDocs: WikiDocSnapshot;
  resolvePage: (pageId: string) => ResolvedPageReference;
  onNavigateToWikiDoc?: (pageId: string) => void;
};

const DocumentPageRegistryContext =
  createContext<DocumentPageRegistryContextValue | null>(null);

/**
 * Exposes the page registry (live titles + reference resolver) to node views
 * rendered by tiptap, which mount outside the page's normal React tree.
 */
export const DocumentPageRegistryProvider = ({
  wikiDocs,
  onNavigateToWikiDoc,
  children,
}: {
  wikiDocs: WikiDocSnapshot;
  onNavigateToWikiDoc?: (pageId: string) => void;
  children: ReactNode;
}) => {
  const value = useMemo(
    () => ({
      wikiDocs,
      onNavigateToWikiDoc,
      resolvePage: (pageId: string) => resolvePageReference(pageId, wikiDocs),
    }),
    [wikiDocs, onNavigateToWikiDoc],
  );

  return (
    <DocumentPageRegistryContext.Provider value={value}>
      {children}
    </DocumentPageRegistryContext.Provider>
  );
};

export const useDocumentPageRegistry = () => {
  const ctx = useContext(DocumentPageRegistryContext);
  if (!ctx) {
    throw new Error(
      "useDocumentPageRegistry must be used within DocumentPageRegistryProvider",
    );
  }
  return ctx;
};

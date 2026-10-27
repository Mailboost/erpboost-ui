import type { ComponentType, ReactNode } from "react";
import type { Entry } from "../registry";
import { getReferenceDemos } from "../reference/demos";
import metadata from "../reference/metadata.json";
export interface Demo {
  name: string;
  description?: string;
  heading?: string;
  screen?: boolean;
  Component: ComponentType;
  StateProvider?: ComponentType<{ children: ReactNode }>;
  source: string;
  sources?: { filename: string; markdownFilename?: string; source: string }[];
}
export function getDemos(entry: Entry, language: string = "en"): Demo[] {
  const demos = getReferenceDemos(entry);
  if (language !== "ja") return demos;
  const data = (
    metadata as Record<
      string,
      { ja?: { sections: { heading?: string; description?: string }[] } }
    >
  )[`/${entry.category}/${entry.slug}`];
  return demos.map((demo, index) => ({
    ...demo,
    heading: data?.ja?.sections[index]?.heading ?? demo.heading,
    description: data?.ja?.sections[index]?.description ?? demo.description,
  }));
}

export { getReferenceMarkdownSources as getMarkdownSources } from "../reference/demos";
